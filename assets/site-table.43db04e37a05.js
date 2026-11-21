(()=>{'use strict';
// Artwork geometry: samples each cover, draws the midtone layer of the playing record as a dot field,
// and orders the wall by dominant hue. Motion follows confirmed provider playback only.
const raw=document.getElementById('catalog-data');if(!raw)return;
const data=JSON.parse(raw.textContent),records=data.records,byId=new Map([...records,...data.tracks].map(r=>[r.id,r]));
const $=id=>document.getElementById(id),wall=$('wall'),plate=$('plate'),frame=$('plate-frame'),list=$('tracklist');
const tiles=[...wall.querySelectorAll('.tile')],heads=list?[...list.querySelectorAll('.group-head')]:[],rows=list?[...list.querySelectorAll('.row')]:[];
const GRID=40,BAND=[.33,.66],STORAGE='jb.artwork-geometry.v2';
const canDraw=typeof plate?.getContext==='function'&&typeof Image==='function';
const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let cache={};try{cache=JSON.parse(sessionStorage.getItem(STORAGE)||'{}');}catch{}
function remember(){try{sessionStorage.setItem(STORAGE,JSON.stringify(cache));}catch{}}
const loads=new Map();
function load(src){if(!src||!canDraw)return Promise.resolve(null);if(!loads.has(src))loads.set(src,new Promise(resolve=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src;}));return loads.get(src);}
const off=canDraw?document.createElement('canvas'):null,ox=off?.getContext?.('2d',{willReadFrequently:true});
function sample(im,n){try{off.width=off.height=n;ox.drawImage(im,0,0,n,n);return ox.getImageData(0,0,n,n).data;}catch{return null;}}
// Luminance per cell, stretched to the cover's own range so pale sleeves still produce a figure.
function luminance(px){const out=new Float32Array(px.length/4);let lo=1,hi=0;for(let i=0;i<out.length;i++){const L=(.2126*px[i*4]+.7152*px[i*4+1]+.0722*px[i*4+2])/255;out[i]=L;if(L<lo)lo=L;if(L>hi)hi=L;}const span=Math.max(.25,hi-lo);for(let i=0;i<out.length;i++)out[i]=Math.min(1,Math.max(0,(out[i]-lo)/span));return out;}
// Dominant colour: a saturation-weighted hue histogram (36 bins, circularly smoothed) picks the hue that covers the most of the sleeve,
// not the single most vivid patch. A cover counts as grey when too little of it carries colour; lightness is the mean over the whole image.
function dominant(px){const n=px.length/4,bins=new Float32Array(36);let colourful=0,lsum=0,wsum=0,ssum=0;const hues=new Float32Array(n),weights=new Float32Array(n);
 for(let i=0;i<n;i++){const r=px[i*4],g=px[i*4+1],b=px[i*4+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,l=(mx+mn)/510,chroma=d/255;lsum+=l;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}
  const window=l>.06&&l<.96?1-Math.abs(2*l-1)*.6:0,w=chroma*window;hues[i]=h;weights[i]=w;if(chroma>=.12&&window>0){colourful++;}if(w>0){bins[Math.floor(h/10)%36]+=w;wsum+=w;ssum+=mx?d/mx:0;}}
 const l=lsum/n,share=colourful/n;if(share<.14||wsum===0)return {h:0,s:0,l,grey:true,share};
 const sm=new Float32Array(36),K=[1,2,3,2,1];for(let i=0;i<36;i++)for(let k=-2;k<=2;k++)sm[i]+=bins[(i+k+36)%36]*K[k+2];let peak=0;for(let i=1;i<36;i++)if(sm[i]>sm[peak])peak=i;
 // Weighted circular mean within ±25° of the peak gives a stable hue inside the winning band.
 const centre=peak*10+5;let x=0,y=0;for(let i=0;i<n;i++){if(!weights[i])continue;let dlt=((hues[i]-centre)%360+540)%360-180;if(Math.abs(dlt)>25)continue;x+=Math.cos(hues[i]*Math.PI/180)*weights[i];y+=Math.sin(hues[i]*Math.PI/180)*weights[i];}
 let h=Math.atan2(y,x)*180/Math.PI;if(h<0)h+=360;return {h,s:ssum/Math.max(1,colourful),l,grey:false,share};}
// Plate: the midtone band of the current cover, one dot per cell.
let cells=null,phase=0,motion=null,playing=false;
function draw(breath){if(!canDraw||!cells)return;const ctx=plate.getContext('2d'),S=plate.width,c=S/GRID,ink=getComputedStyle(document.body).getPropertyValue('--ink').trim()||'#141412';ctx.clearRect(0,0,S,S);
 // Every cell is drawn: artwork cells in full ink, the rest faint, so the whole matrix moves as one instrument while the provider confirms playback.
 for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){const i=y*GRID+x,on=!!cells[i];let r=on?c*.34:c*.16,alpha=on?1:.14;
  if(breath){const a=Math.sin(phase*1.6+x*.42-y*.18),b=Math.sin(phase*.9-x*.12+y*.36),swell=.5+.5*Math.sin(phase*.45);const g=.62+.3*(.5+.5*a)+.22*(.5+.5*b)+.12*swell;r*=g;if(!on)alpha=.08+.14*(g-.62)/.64;}
  ctx.globalAlpha=alpha;ctx.fillStyle=ink;ctx.beginPath();ctx.arc(x*c+c/2,y*c+c/2,Math.min(r,c*.49),0,Math.PI*2);ctx.fill();}
 ctx.globalAlpha=1;}
function breathe(now){motion=null;if(!playing||reduced)return;phase=(now/420)%(Math.PI*2*1000);draw(true);motion=requestAnimationFrame(breathe);}
function setMotion(on){playing=on;frame.classList.toggle('is-playing',on);if(on&&!reduced){if(!motion)motion=requestAnimationFrame(breathe);}else{if(motion){cancelAnimationFrame(motion);motion=null;}draw(false);}}
async function showPlate(id,index){const r=byId.get(id);cells=null;if(!r){draw(false);$('plate-fig').textContent='';$('plate-artist').textContent='';return;}
 $('plate-fig').textContent=`Fig. ${String(index).padStart(3,'0')} · ${GRID} × ${GRID} · Midtones ${BAND[0].toFixed(2)} – ${BAND[1].toFixed(2)}`;$('plate-artist').textContent=r.artist||'';
 const im=await load(r.image);if(!im||id!==currentId)return;const px=sample(im,GRID);if(!px)return;const L=luminance(px);cells=new Uint8Array(L.length);for(let i=0;i<L.length;i++){const v=1-L[i];cells[i]=v>=BAND[0]&&v<BAND[1]?1:0;}draw(playing&&!reduced);}
let currentId=null;
document.addEventListener('player:change',e=>{const {id,releaseId,index}=e.detail||{};currentId=releaseId||id||null;showPlate(currentId,index||0);if(!currentId)setMotion(false);});
document.addEventListener('player:state',e=>setMotion(e.detail?.state==='playing'));
// Wall ordering. Hue places saturated covers around the wheel, then greys by lightness; unsampled covers keep their catalogue order at the end.
let sort='hue',dir='desc';try{sort=sessionStorage.getItem(STORAGE+'.sort')||'hue';dir=sessionStorage.getItem(STORAGE+'.dir')||'desc';}catch{}
const colour=new Map();
// Hue sort: colourful covers in 15° bands around the wheel starting at 345° so reds stay together, the vivid covers of a band before the tinted ones, light to dark within; then greys from white to black; unsampled covers last in catalogue order.
function rankHue(r){const c=colour.get(r.id);if(!c)return [2,records.indexOf(r)];if(c.grey)return [1,-c.l,records.indexOf(r)];return [0,Math.floor(((c.h+15)%360)/15),c.share<.35?1:0,-c.l,records.indexOf(r)];}
function rankYear(r){return [r.released?0:1,r.released?-Date.parse(r.released):0,records.indexOf(r)];}
function rankStreams(r){return [-(r.streams||0),records.indexOf(r)];}
function rankArtist(r){return [String(r.artist||'').replace(/[Ææ]/g,'ae').replace(/[Œœ]/g,'oe').replace(/[Øø]/g,'o').normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/^the\s+/,''),records.indexOf(r)];}
const compare=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){if(a[i]<b[i])return -1;if(a[i]>b[i])return 1;}return 0;};
// Year, Streams and Artist flip direction when chosen again; Hue has one order.
const LABELS={hue:'Hue',year:'Year',streams:'Streams',artist:'Artist'};
let foldMap={};
function order(){const rank=sort==='year'?rankYear:sort==='artist'?rankArtist:sort==='streams'?rankStreams:rankHue;let sorted=records.map(r=>[r,rank(r)]).sort((x,y)=>compare(x[1],y[1]));if(sort!=='hue'&&dir==='asc')sorted.reverse();const position=new Map(sorted.map(([r],i)=>[r.id,i]));tiles.forEach(t=>{t.style.setProperty('order',String(position.get(t.dataset.id)??tiles.length));});
 // The list follows the same release order, each release's rows beneath its heading (a folded single's rows after its album's). Streams flattens it to one list of tracks.
 const flat=sort==='streams';if(list)list.classList.toggle('is-flat',flat);const STEP=200;
 if(flat){const ranked=rows.slice().sort((a,b)=>(+b.dataset.streams||0)-(+a.dataset.streams||0)||(+a.dataset.pos)-(+b.dataset.pos));if(dir==='asc')ranked.reverse();ranked.forEach((el,i)=>el.style.setProperty('order',String(i)));}
 else{heads.forEach(h=>h.style.setProperty('order',String((position.get(h.dataset.id)??records.length)*STEP)));rows.forEach(el=>{const rel=el.dataset.release,home=foldMap[rel]||rel;el.style.setProperty('order',String((position.get(home)??records.length)*STEP+(home===rel?1:100)+(+el.dataset.pos||0)));});}
 $('hue-ruler').classList.toggle('is-off',sort!=='hue');document.querySelectorAll('#sort-group [data-sort]').forEach(b=>{const on=b.dataset.sort===sort;b.setAttribute('aria-pressed',String(on));const arrow=on&&b.dataset.sort!=='hue'?(dir==='asc'?' ↑':' ↓'):'';b.textContent=LABELS[b.dataset.sort]+arrow;b.setAttribute('aria-label',on&&b.dataset.sort!=='hue'?`${LABELS[b.dataset.sort]}, ${dir==='asc'?'oldest or lowest first':'newest or highest first'}; choose again to flip`:LABELS[b.dataset.sort]);});wall.dataset.sort=sort;wall.dataset.dir=sort==='hue'?'':dir;}
$('sort-group').addEventListener('click',e=>{const b=e.target.closest('[data-sort]');if(!b)return;if(b.dataset.sort===sort&&sort!=='hue')dir=dir==='asc'?'desc':'asc';else{sort=b.dataset.sort;dir='desc';}try{sessionStorage.setItem(STORAGE+'.sort',sort);sessionStorage.setItem(STORAGE+'.dir',dir);}catch{}order();});
// Same picture, same artist: a single that reuses its album's artwork folds into the album. 8 × 8 average hash, Hamming distance ≤ 3.
function ahash(px){const n=px.length/4,v=new Float32Array(n);let mean=0;for(let i=0;i<n;i++){v[i]=.2126*px[i*4]+.7152*px[i*4+1]+.0722*px[i*4+2];mean+=v[i];}mean/=n;let bits='';for(let i=0;i<n;i++)bits+=v[i]>mean?'1':'0';return bits;}
const hamming=(a,b)=>{let d=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])d++;return d;};
const hashes=new Map();
function fold(){const map={};const byArtist=new Map();for(const r of records){const tile=tiles.find(x=>x.dataset.id===r.id);if(!tile||!hashes.has(r.id))continue;const a=tile.dataset.artist;if(!byArtist.has(a))byArtist.set(a,[]);byArtist.get(a).push([r,tile,hashes.get(r.id)]);}
 for(const group of byArtist.values()){if(group.length<2)continue;const sorted=group.slice().sort((x,y)=>(+y[1].dataset.count||0)-(+x[1].dataset.count||0)||(y[0].tracks?.length||0)-(x[0].tracks?.length||0));
  for(let i=0;i<sorted.length;i++){const [r,,h]=sorted[i];if(map[r.id])continue;for(let j=i+1;j<sorted.length;j++){const [s,,hs]=sorted[j];if(map[s.id]||s.id===r.id)continue;if(hamming(h,hs)<=3&&(+sorted[j][1].dataset.count||0)<=(+sorted[i][1].dataset.count||0))map[s.id]=r.id;}}}
 foldMap=map;order();document.dispatchEvent(new CustomEvent('catalog:fold',{detail:{map}}));}
async function measure(){let dirty=false;for(const r of records){const cached=cache[r.image];if(cached&&cached.hash){colour.set(r.id,cached);hashes.set(r.id,cached.hash);continue;}const im=await load(r.image);if(!im)continue;const px=sample(im,32);if(!px)continue;const c=dominant(px);if(!c)continue;const small=sample(im,8);c.hash=small?ahash(small):undefined;colour.set(r.id,c);if(c.hash)hashes.set(r.id,c.hash);cache[r.image]=c;dirty=true;if(sort==='hue')order();}if(dirty)remember();order();fold();}
order();measure();
})();
