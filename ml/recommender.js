/** Browser replica of scikit-learn TfidfVectorizer(sublinear_tf=True) + cosine.
 * Only overlapping *note* tokens contribute. Ranking is not a calibrated likelihood.
 */
export function normalizeNote(s) {return String(s).toLowerCase().match(/[a-z0-9]+/g)?.join('_') ?? '';}
export function allNotes(product) {return [...(product.top||[]),...(product.middle||[]),...(product.base||[])];}
export function queryVector(model, selectedNotes) {
  const counts=new Map();
  for(const note of selectedNotes){const t=normalizeNote(note); if(t in model.vocabulary) counts.set(t,(counts.get(t)||0)+1);}
  if(!counts.size)return null;
  const raw=[...counts].map(([t,tf])=>({i:model.vocabulary[t],v:(1+Math.log(tf))*model.idf[model.vocabulary[t]]}));
  const norm=Math.hypot(...raw.map(o=>o.v));
  return new Map(raw.map(o=>[o.i,o.v/norm]));
}
export function recommend(model,catalogue,notes,{family='All',limit=5,excludeId=null}={}) {
  const q=queryVector(model,notes);
  if(!q)return [];
  const products=new Map(catalogue.map(p=>[p.id,p]));
  return model.vectors.map(v=>{
    const product=products.get(v.id);if(!product||v.id===excludeId|| (family!=='All'&&product.family!==family))return null;
    let score=0;
    v.idx.forEach((idx,k)=>{score+=(q.get(idx)||0)*v.val[k]});
    const qSet=new Set(notes.map(normalizeNote));
    const overlap=[...new Set(allNotes(product).filter(n=>qSet.has(normalizeNote(n))))];
    return {...product,score:Math.max(0,Math.min(1,score)),overlap};
  }).filter(x=>x&&x.score>0).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name)).slice(0,limit);
}
export function similarTo(model,catalogue,productId,limit=4){
 const source=catalogue.find(p=>p.id===productId); if(!source)return [];
 return recommend(model,catalogue,allNotes(source),{limit,excludeId:productId});
}
