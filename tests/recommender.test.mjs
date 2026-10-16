import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {recommend, similarTo, normalizeNote} from '../ml/recommender.js';
const rows=JSON.parse(fs.readFileSync(new URL('../data/catalogue.json',import.meta.url)));
const model=JSON.parse(fs.readFileSync(new URL('../data/model.json',import.meta.url)));
test('catalogue is sourced and unique',()=>{
  assert.equal(rows.length,10);
  assert.equal(new Set(rows.map(p=>p.id)).size,rows.length);
  assert.ok(rows.every(p=>p.source.startsWith('https://')&&p.top?.length&&p.name&&p.brand));
});
test('trained artifact matches catalogue',()=>{
  assert.equal(model.vectors.length,rows.length);
  assert.ok(Object.keys(model.vocabulary).length>=60);
  for(const vector of model.vectors){const len=Math.hypot(...vector.val);assert.ok(Math.abs(len-1)<0.000001)}
});
test('query ranks by actual matching note, not hard-coded order',()=>{
  const hits=recommend(model,rows,['Coffee'],{limit:8});
  assert.ok(hits.length>0);
  assert.equal(hits[0].id,'fragdb-25324');
  assert.ok(hits[0].overlap.includes('Coffee'));
  assert.ok(hits[0].score>0);
});
test('family is a filter, missing notes return empty',()=>{
  assert.ok(recommend(model,rows,['Vanilla'],{family:'Gourmand'}).every(p=>p.family==='Gourmand'));
  assert.deepEqual(recommend(model,rows,['Unrecorded imaginary note']),[]);
  assert.equal(normalizeNote('Tonka Bean'),'tonka_bean');
});
test('similar perfumes exclude seed item',()=>{
  const r=similarTo(model,rows,'fragdb-485');
  assert.ok(r.every(p=>p.id!=='fragdb-485'&&p.score>0));
});
