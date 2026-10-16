/** A dependency-free DOM-harness smoke test for the standalone GitHub Pages bundle.
 * This verifies catalogue render, interactive search and actual model-driven quiz results.
 * It is NOT a real-browser visual/E2E test.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../index.html', import.meta.url),'utf8');
const script=html.match(/<script>\s*([\s\S]*?)\s*<\/script>/i)?.[1];
function embedded(id){return html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)<\\/script>`))?.[1];}
function mockElement(id){return {id,value:'',innerHTML:'',textContent:'',hidden:false,events:{},style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},setAttribute(){},addEventListener(type,cb){this.events[type]=cb},scrollIntoView(){},focus(){}};}
function boot(){
 const els=new Map();
 const get=id=>{if(!els.has(id))els.set(id,mockElement(id));return els.get(id)};
 get('embedded-catalogue').textContent=embedded('embedded-catalogue');
 get('embedded-model').textContent=embedded('embedded-model');
 const doc={body:{style:{}},querySelector(sel){return sel.startsWith('#')?get(sel.slice(1)):null},querySelectorAll(){return []},addEventListener(){}};
 const store=new Map();
 const context=vm.createContext({document:doc,window:{addEventListener(){}},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},console,setTimeout,clearTimeout,fetch(){throw Error('Standalone bundle must not fetch')} });
 vm.runInContext(script,context,{timeout:3000});
 return {get,context};
}
test('standalone bundle populates real catalogue without network fetch',()=>{
 const {get}=boot();
 assert.match(get('product-grid').innerHTML,/Light Blue/);
 assert.match(get('product-grid').innerHTML,/Black Opium/);
 assert.match(get('product-count').textContent,/10 of 10/);
});
test('interactive shop search selects a real perfume',()=>{
 const {get}=boot();
 get('shop-search').events.input({target:{value:'Black Opium'}});
 const content=get('product-grid').innerHTML;
 assert.match(content,/Black Opium/);
 assert.doesNotMatch(content,/Light Blue/);
});
test('AI finder produces scored results from real fitted artifact',()=>{
 const {get}=boot();
 get('recommend-btn').events.click();
 const content=get('results').innerHTML;
 assert.match(content,/similarity score/);
 assert.match(content,/Vanilla/);
 assert.doesNotMatch(content,/personal liking probability/);
});
