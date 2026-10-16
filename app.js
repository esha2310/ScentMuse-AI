import {recommend, similarTo, allNotes, normalizeNote} from './ml/recommender.js';

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PALETTES = [
  ['#f3d8df','#d9a7b9','#cc8aa4','#87586e'],['#f4e9d7','#dfc1a9','#d0a77a','#946a51'],
  ['#eae1ef','#cab4d5','#b08abf','#685477'],['#e7efdf','#bfdbc6','#9ac3aa','#547968'],
  ['#f5e5d6','#d4b9a2','#c9a58c','#846151'],['#ece2e5','#ccb7bd','#b8a0a9','#795964'],
  ['#f6ddd7','#e3adad','#c38383','#784f58'],['#f2e1de','#cdb3aa','#bf978b','#7d5758'],
  ['#e5e2ed','#b4acca','#8a81aa','#575274'],['#f4e9df','#dcc4b0','#c3a080','#746052']
];
const state = { catalogue:[],model:null,filter:'All',search:'',sort:'featured',selectedNotes:new Set(['Vanilla']),qFamily:'All',wish:load('wishlist'),bag:load('bag'),drawer:'wishlist',modalId:null };
let svgSequence = 0;
function load(name){try{const v=JSON.parse(localStorage.getItem('scentmuse_'+name)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function persist(){try{localStorage.setItem('scentmuse_wishlist',JSON.stringify(state.wish));localStorage.setItem('scentmuse_bag',JSON.stringify(state.bag))}catch{}}
function bottleSVG(seed=0){const n=svgSequence++;const p=PALETTES[Math.abs(seed)%PALETTES.length];const label=esc(['atelier','private edition','the muse','eau de rêve'][seed%4]);const uid='b'+n;
return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 420" role="img" aria-label="Original conceptual perfume bottle illustration; not a representation of the branded product packaging"><defs>
<linearGradient id="${uid}glass" x1="0" x2="1" y1="0" y2=".6"><stop stop-color="#fffaf7" stop-opacity=".96"/><stop offset=".18" stop-color="${p[0]}" stop-opacity=".92"/><stop offset=".72" stop-color="${p[2]}" stop-opacity=".85"/><stop offset="1" stop-color="${p[3]}" stop-opacity=".95"/></linearGradient>
<linearGradient id="${uid}lid" x1="0" x2="1"><stop stop-color="#81614a"/><stop offset=".28" stop-color="#f3deae"/><stop offset=".58" stop-color="#c7a16e"/><stop offset="1" stop-color="#88654c"/></linearGradient>
<radialGradient id="${uid}light"><stop stop-color="#fff7f0" stop-opacity=".95"/><stop offset="1" stop-color="#fff7f0" stop-opacity="0"/></radialGradient>
<filter id="${uid}shadow"><feGaussianBlur stdDeviation="10"/></filter></defs>
<ellipse cx="176" cy="368" rx="109" ry="15" fill="#74585a" opacity=".18" filter="url(#${uid}shadow)"/>
<rect x="141" y="83" width="58" height="44" rx="6" fill="url(#${uid}lid)"/><rect x="118" y="36" width="104" height="63" rx="8" fill="url(#${uid}lid)" stroke="#fff0cf" stroke-width="2"/>
<rect x="126" y="46" width="88" height="9" rx="3" fill="#fff2d4" opacity=".5"/><rect x="117" y="99" width="106" height="13" rx="3" fill="#b98e5e"/>
<rect x="61" y="118" width="218" height="228" rx="${seed%3===0?37:seed%3===1?15:62}" fill="url(#${uid}glass)" stroke="#ffffff" stroke-width="6" stroke-opacity=".67"/>
<path d="M78 132 Q70 163 76 298" fill="none" stroke="#fff" stroke-width="10" opacity=".34" stroke-linecap="round"/><path d="M257 137 Q274 200 257 316" fill="none" stroke="${p[3]}" stroke-width="9" opacity=".18" stroke-linecap="round"/>
<ellipse cx="166" cy="217" rx="90" ry="113" fill="url(#${uid}light)" opacity=".65"/>
<rect x="101" y="185" width="138" height="115" rx="2" fill="#fff6ede0" stroke="#e7d2cb" stroke-width="1"/>
<path d="M115 201H225M115 281H225" stroke="${p[2]}" stroke-width=".8" opacity=".65"/>
<text x="170" y="221" font-size="12" letter-spacing="2.7" fill="${p[3]}" text-anchor="middle" font-family="Georgia,serif">SCENTMUSE</text>
<text x="170" y="258" font-size="36" fill="${p[3]}" text-anchor="middle" font-family="Georgia,serif">✿</text>
<text x="170" y="273" font-size="8.2" letter-spacing="2.5" fill="${p[3]}" text-anchor="middle" font-family="Arial,sans-serif">${label.toUpperCase()}</text>
<path d="M82 329Q168 352 260 329" stroke="#fff" opacity=".38" stroke-width="3" fill="none"/>
</svg>`;}
function card(p,i){const idx=state.catalogue.findIndex(x=>x.id===p.id);const colors=PALETTES[idx%PALETTES.length];const loved=state.wish.includes(p.id);return `<article class="product-card" data-product="${esc(p.id)}"><div class="product-visual" style="--tile1:${colors[0]};--tile2:${colors[1]}"><div class="product-cat">${esc(p.family)}</div><button class="heart-chip ${loved?'loved':''}" type="button" data-action="heart" data-id="${esc(p.id)}" aria-label="${loved?'Remove from':'Add to'} wishlist" aria-pressed="${loved}">${loved?'♥':'♡'}</button><div class="product-art">${bottleSVG(idx)}</div></div><div class="product-content"><div class="product-brand">${esc(p.brand)}</div><h3 class="product-title">${esc(p.name)}</h3><div class="product-notes">${esc([...new Set(allNotes(p))].slice(0,3).join(' · '))}</div><div class="product-footer"><small>${esc(p.year)} · Notes sourced</small><button type="button" data-action="details" data-id="${esc(p.id)}">Discover notes ↗</button></div></div></article>`;}
function getProduct(id){return state.catalogue.find(x=>x.id===id)}
function updateCounters(){for(const [id,size] of [['wish-count',state.wish.length],['bag-count',state.bag.length]]){const e=$('#'+id);e.textContent=size;e.hidden=size===0;}}
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('shown');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('shown'),2800)}
function renderShop(){const matches=state.catalogue.filter(p=>(state.filter==='All'||p.family===state.filter)&&(`${p.name} ${p.brand} ${allNotes(p).join(' ')}`.toLowerCase().includes(state.search.toLowerCase())));
if(state.sort==='name')matches.sort((a,b)=>a.name.localeCompare(b.name));if(state.sort==='brand')matches.sort((a,b)=>a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name));if(state.sort==='year')matches.sort((a,b)=>b.year-a.year||a.name.localeCompare(b.name));
$('#product-count').textContent=`Showing ${matches.length} of ${state.catalogue.length} real fragrance profiles`;
$('#product-grid').innerHTML=matches.map(card).join('')||`<div class="no-results">No matching fragrances in this 10-product sample.<button type="button" data-action="reset">Clear filters ↗</button></div>`;
$$('#filter-buttons button').forEach(b=>{const on=b.dataset.filter===state.filter;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on)});
}
function allAvailableNotes(){return [...new Set(state.catalogue.flatMap(allNotes))].sort((a,b)=>a.localeCompare(b));}
const featured=['Vanilla','Jasmine','Rose','Coffee','Bergamot','Musk','Sandalwood','Amber','Patchouli','Orange Blossom','Cedar','Tobacco Leaf'];
function noteBtn(n){const picked=state.selectedNotes.has(n);return `<button type="button" data-action="note" data-note="${esc(n)}" class="${picked?'active':''}" aria-pressed="${picked}">${picked?'✓ ':''}${esc(n)}</button>`;}
function renderNotes(){const available=new Set(allAvailableNotes());$('#note-chips').innerHTML=featured.filter(n=>available.has(n)).map(noteBtn).join('');const q=$('#note-search').value.trim().toLowerCase();const extras=allAvailableNotes().filter(n=>!featured.includes(n)&&(!q||n.toLowerCase().includes(q))).slice(0,q?50:0);const found=q?allAvailableNotes().filter(n=>!featured.includes(n)&&n.toLowerCase().includes(q)).length:0;$('#extra-notes').innerHTML=q?(extras.map(noteBtn).join('')||(found===0?'<small>No notes found in this catalogue.</small>':'')):'';}
function renderResults(){const root=$('#results');const chosen=[...state.selectedNotes];if(!chosen.length){root.innerHTML='<div class="zero-matches">Select at least one scent note to find your matches.</div>';root.scrollIntoView({behavior:'smooth',block:'center'});return;}const ranked=recommend(state.model,state.catalogue,chosen,{family:state.qFamily,limit:6});
if(!ranked.length){root.innerHTML=`<h3 class="results-title">No direct note overlaps yet ♡</h3><p class="results-desc">None of the ${esc(state.qFamily==='All'?'available':'selected-family')} perfumes share those exact notes. Try another note or choose “Surprise me”.</p>`;root.scrollIntoView({behavior:'smooth'});return;}
root.innerHTML=`<p class="eyebrow">YOUR NOTE MATCHES ✦</p><h3 class="results-title">A little note of <em>serendipity.</em></h3><p class="results-desc">Based on <b>${esc(chosen.join(' · '))}</b>${state.qFamily==='All'?'':` · Filter: ${esc(state.qFamily)}`}. These are cosine similarity values from the fitted catalogue index, not personal liking probabilities or measured accuracy.</p><div class="results-grid">${ranked.map((p,i)=>`<article class="result-card"><span class="result-number">0${i+1}</span><div><h3>${esc(p.name)}</h3><div class="result-brand">${esc(p.brand)}</div><p class="result-match">${p.score.toFixed(3)} · similarity score</p><div class="result-note">Matches your notes: ${esc(p.overlap.join(', ')||'No exact overlap')}</div><button type="button" data-action="details" data-id="${esc(p.id)}">See fragrance profile ↗</button></div></article>`).join('')}</div>`;root.scrollIntoView({behavior:'smooth',block:'start'});}
function openOverlay(){document.body.style.overflow='hidden';$('#overlay').hidden=false;}
function closeOverlay(){document.body.style.overflow='';$('#overlay').hidden=true;$('#drawer').hidden=true;$('#product-modal').hidden=true;state.modalId=null;}
function openDrawer(type){closeOverlay();state.drawer=type;$('#drawer-title').textContent=type==='wishlist'?'My favourites ♡':'My scent tray ✿';const ids=type==='wishlist'?state.wish:state.bag;
$('#drawer-list').innerHTML=ids.map(id=>{const p=getProduct(id);return p?`<div class="drawer-item"><div class="drawer-thumb">✿</div><div><b>${esc(p.name)}</b><small>${esc(p.brand)} · ${esc(p.family)}</small></div><button type="button" data-action="remove" data-kind="${type}" data-id="${esc(id)}">Remove</button></div>`:''}).join('')||`<div class="zero-matches">Your ${type==='wishlist'?'favourites':'scent tray'} is empty. Explore the collection and save the fragrances you love! ♡</div>`;
$('#drawer').hidden=false;openOverlay();$('#drawer-close').focus();}
function setFavorite(id){state.wish=state.wish.includes(id)?state.wish.filter(x=>x!==id):[...state.wish,id];persist();updateCounters();renderShop();showToast(state.wish.includes(id)?'Saved to favourites ♡':'Removed from favourites');}
function addBag(id){if(!state.bag.includes(id)){state.bag.push(id);persist();updateCounters();showToast('Added to your scent tray ✿')}else showToast('Already in your scent tray ♡')}
function pyramidRow(title,notes){return `<div class="pyramid-row"><strong>${title}</strong><div class="pyramid-notes">${notes.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>`;}
function openProduct(id){const p=getProduct(id);if(!p)return;closeOverlay();state.modalId=id;const ix=state.catalogue.findIndex(x=>x.id===id);const palette=PALETTES[ix%PALETTES.length];const related=similarTo(state.model,state.catalogue,p.id,3);
$('#modal-content').innerHTML=`<div class="modal-main"><div class="modal-art" style="--tile1:${palette[0]};--tile2:${palette[1]}">${bottleSVG(ix)}</div><div class="modal-info"><div class="eyebrow">✦ REAL FRAGRANCE PROFILE</div><h2 id="modal-heading">${esc(p.name)}</h2><div class="brand-name">${esc(p.brand)} · ${esc(p.year)} · ${esc(p.family)}</div><p class="desc">Explore the documented note pyramid. The bottle artwork is an original ScentMuse illustration, not official branded packaging.</p><div class="note-pyramid">${pyramidRow('Top notes',p.top)}${pyramidRow('Heart notes',p.middle)}${pyramidRow('Base notes',p.base)}</div><div class="modal-ctas"><button type="button" data-action="bag" data-id="${esc(id)}">Add to scent tray ✿</button><button class="secondary" type="button" data-action="heart" data-id="${esc(id)}">${state.wish.includes(id)?'♥ Saved':'♡ Save favourite'}</button></div><a class="modal-source" href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">View source fragrance profile ↗</a><div class="similar-list"><strong>Other perfumes with overlapping notes</strong>${related.length?related.map(q=>`<button type="button" data-action="details" data-id="${esc(q.id)}">${esc(q.name)} <span>${q.score.toFixed(3)} similarity →</span></button>`).join(''):'<p class="desc">No overlapping notes found among the remaining sample.</p>'}</div></div></div>`;
$('#product-modal').hidden=false;openOverlay();$('#modal-close').focus();}
function actionHandler(ev){const b=ev.target.closest('button[data-action]');if(!b)return;const {action,id,note,kind}=b.dataset;
if(action==='details')openProduct(id);
if(action==='heart'){setFavorite(id);if(state.modalId===id){openProduct(id)}}
if(action==='bag')addBag(id);
if(action==='note'){state.selectedNotes.has(note)?state.selectedNotes.delete(note):state.selectedNotes.add(note);renderNotes();}
if(action==='remove'){if(kind==='wishlist')state.wish=state.wish.filter(x=>x!==id);else state.bag=state.bag.filter(x=>x!==id);persist();updateCounters();renderShop();openDrawer(kind);}
if(action==='reset'){state.search='';state.filter='All';$('#shop-search').value='';renderShop()}
}
function wire(){document.addEventListener('click',actionHandler);$('#shop-search').addEventListener('input',e=>{state.search=e.target.value;renderShop()});$('#sort-select').addEventListener('change',e=>{state.sort=e.target.value;renderShop()});$$('#filter-buttons button').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.filter;renderShop()}));$$('.family-card').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.family;state.search='';$('#shop-search').value='';renderShop();$('#collection').scrollIntoView({behavior:'smooth'})}));$('#note-search').addEventListener('input',renderNotes);$$('#finder-families button').forEach(b=>b.addEventListener('click',()=>{state.qFamily=b.dataset.qfamily;$$('#finder-families button').forEach(x=>x.classList.toggle('active',x===b))}));$('#recommend-btn').addEventListener('click',renderResults);$('#open-wishlist').addEventListener('click',()=>openDrawer('wishlist'));$('#open-bag').addEventListener('click',()=>openDrawer('bag'));$('#drawer-close').addEventListener('click',closeOverlay);$('#modal-close').addEventListener('click',closeOverlay);$('#overlay').addEventListener('click',closeOverlay);window.addEventListener('keydown',e=>{if(e.key==='Escape')closeOverlay()});$('#open-search').addEventListener('click',()=>{$('#collection').scrollIntoView({behavior:'smooth'});setTimeout(()=>$('#shop-search').focus({preventScroll:true}),450)});$('#menu-toggle').addEventListener('click',()=>{const el=$('#mobile-nav');el.hidden=!el.hidden;$('#menu-toggle').setAttribute('aria-expanded',String(!el.hidden))});$$('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>{$('#mobile-nav').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false')}));}
async function init(){
 $('#hero-perfume').innerHTML=bottleSVG(0);$('#mini-perfume').innerHTML=bottleSVG(4);$('#finder-perfume').innerHTML=bottleSVG(2);wire();
 try{
  let cat,model;
  const embeddedCat=$('#embedded-catalogue'),embeddedModel=$('#embedded-model');
  if(embeddedCat&&embeddedModel){cat=JSON.parse(embeddedCat.textContent);model=JSON.parse(embeddedModel.textContent);}
  else{const [c,m]=await Promise.all([fetch('data/catalogue.json'),fetch('data/model.json')]);if(!c.ok||!m.ok)throw Error('Data files unavailable');cat=await c.json();model=await m.json();}
  if(!Array.isArray(cat)||!cat.length||!model.vocabulary||!Array.isArray(model.vectors))throw Error('Incomplete ML data');
  state.catalogue=cat;state.model=model;state.wish=state.wish.filter(id=>getProduct(id));state.bag=state.bag.filter(id=>getProduct(id));updateCounters();renderShop();renderNotes();
 }catch(err){console.error(err);$('#product-count').textContent='Unable to load verified dataset';$('#product-grid').innerHTML='<div class="no-results">The verified perfume catalogue is unavailable. Open the site through GitHub Pages or a local web server (not file://), and make sure the data folder is present.</div>';$('#recommend-btn').disabled=true;showToast('Could not load model and catalogue');}
}
init();
