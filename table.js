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
// Plate: one dot per cell carrying the cover's darkness (0 light … 1 dark). At rest the midtone band is lit; while playing, a band sweeps shadows → midtones → highlights, so the whole figure pulses through the picture's tones.
let cells=null,phase=0,motion=null,playing=false;
const tonal=(cells,i,band)=>{const v=cells[i]/255;return v>=band[0]&&v<band[1];};
// Sweep centre runs 0.835 (shadows) → 0.165 (highlights) and back; the band is a third of the range wide, so every cell lights once per cycle.
const sweepBand=t=>{const c=Math.sin(t)*0.5+0.5;const centre=0.835-c*0.67;return [centre-0.1675,centre+0.1675];};
// Chromatic shadow: while the plate animates, about one in four of the lit dots (a fixed share per cover, so the pattern holds its place) lights a neighbouring cell in pastel, one or two cells away on the grid, in a direction that points outward from the figure's centre and swings with the pulse. The copy is painted only where that neighbour is dark, so colour fringes the figure's edges and travels with the live dots. At rest and under reduced motion the figure is pure monochrome.
const PASTEL=['#ffb3c1','#ffd1a1','#fff3a3','#c3f0c0','#b3e1ff','#d9c4ff'];
const ghostAt=(x,y)=>((x*73+y*151)%97)<30;
function dot(ctx,cx,cy,r,ink,alpha,fx,fy,on,ghost){
 if(on&&ghost&&ghostAt(fx,fy)){const n=ghost.g,dx=fx-(n-1)/2,dy=fy-(n-1)/2,ph=ghost.ph;const a=Math.atan2(dy,dx)+ph*.6+(fx*3+fy*5)%7*.2;const step=Math.sin(ph*1.3+fx*.31+fy*.27)>.3?2:1;const sx=Math.round(Math.cos(a))*step,sy=Math.round(Math.sin(a))*step,nx=fx+sx,ny=fy+sy;
  if(nx>=0&&ny>=0&&nx<n&&ny<n&&!tonal(ghost.cells,ny*n+nx,ghost.band)){ctx.globalAlpha=alpha*.8;ctx.fillStyle=PASTEL[(fx*5+fy*11)%PASTEL.length];ctx.beginPath();ctx.arc(cx+sx*ghost.c,cy+sy*ghost.c,r*.9,0,Math.PI*2);ctx.fill();}}
 ctx.globalAlpha=alpha;ctx.fillStyle=ink;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();}
function draw(breath){if(!canDraw||!cells)return;const ctx=plate.getContext('2d'),S=plate.width,c=S/GRID,ink=getComputedStyle(plate).getPropertyValue('--ink').trim()||'#141412';ctx.clearRect(0,0,S,S);
 // Every cell is drawn: cells inside the lit band in full ink, the rest faint, so the whole matrix moves as one instrument while the provider confirms playback.
 const band=breath?sweepBand(phase*.35):BAND;
 for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){const i=y*GRID+x,on=tonal(cells,i,band);let r=on?c*.34:c*.16,alpha=on?1:.14;
  if(breath){const a=Math.sin(phase*1.6+x*.42-y*.18),b=Math.sin(phase*.9-x*.12+y*.36),swell=.5+.5*Math.sin(phase*.45);const g=.62+.3*(.5+.5*a)+.22*(.5+.5*b)+.12*swell;r*=g;if(!on)alpha=.08+.14*(g-.62)/.64;}
  dot(ctx,x*c+c/2,y*c+c/2,Math.min(r,c*.49),ink,alpha,x,y,on,breath?{g:GRID,ph:phase,c,cells,band}:null);}
 ctx.globalAlpha=1;}
function breathe(now){motion=null;if(!playing||reduced)return;phase=(now/420)%(Math.PI*2*1000);draw(true);motion=requestAnimationFrame(breathe);}
function setMotion(on){playing=on;frame.classList.toggle('is-playing',on);if(on&&!reduced){if(!motion)motion=requestAnimationFrame(breathe);}else{if(motion){cancelAnimationFrame(motion);motion=null;}draw(false);}}
async function showPlate(id,index){const r=byId.get(id);cells=null;if(!r){draw(false);$('plate-fig').textContent='';$('plate-artist').textContent='';return;}
 $('plate-fig').textContent=`Fig. ${String(index).padStart(3,'0')} · ${GRID} × ${GRID} · Shadows · Midtones · Highlights`;$('plate-artist').textContent=r.artist||'';
 const im=await load(r.image);if(!im||id!==currentId)return;const px=sample(im,GRID);if(!px)return;const L=luminance(px);cells=new Uint8Array(L.length);for(let i=0;i<L.length;i++)cells[i]=Math.round((1-L[i])*255);draw(playing&&!reduced);}
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
 $('hue-ruler').classList.toggle('is-off',sort!=='hue');document.querySelectorAll('#sort-group [data-sort]').forEach(b=>{const on=b.dataset.sort===sort;b.setAttribute('aria-pressed',String(on));const arrow=on&&b.dataset.sort!=='hue'?(dir==='asc'?' ↑':' ↓'):'';b.textContent=LABELS[b.dataset.sort]+arrow;b.setAttribute('aria-label',on&&b.dataset.sort!=='hue'?`${LABELS[b.dataset.sort]}, ${dir==='asc'?'oldest or lowest first':'newest or highest first'}; choose again to flip`:LABELS[b.dataset.sort]);});wall.dataset.sort=sort;wall.dataset.dir=sort==='hue'?'':dir;document.dispatchEvent(new CustomEvent('catalog:order',{detail:{sort,dir}}));}
$('sort-group').addEventListener('click',e=>{const b=e.target.closest('[data-sort]');if(!b)return;if(b.dataset.sort===sort&&sort!=='hue')dir=dir==='asc'?'desc':'asc';else{sort=b.dataset.sort;dir='desc';}try{sessionStorage.setItem(STORAGE+'.sort',sort);sessionStorage.setItem(STORAGE+'.dir',dir);}catch{}order();});
// Same picture, same artist: a single that reuses its album's artwork folds into the album. 8 × 8 average hash, Hamming distance ≤ 3.
function ahash(px){const n=px.length/4,v=new Float32Array(n);let mean=0;for(let i=0;i<n;i++){v[i]=.2126*px[i*4]+.7152*px[i*4+1]+.0722*px[i*4+2];mean+=v[i];}mean/=n;let bits='';for(let i=0;i<n;i++)bits+=v[i]>mean?'1':'0';return bits;}
const hamming=(a,b)=>{let d=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])d++;return d;};
const hashes=new Map();
function fold(){const map={};const byArtist=new Map();for(const r of records){const tile=tiles.find(x=>x.dataset.id===r.id);if(!tile||!hashes.has(r.id))continue;const a=tile.dataset.artist;if(!byArtist.has(a))byArtist.set(a,[]);byArtist.get(a).push([r,tile,hashes.get(r.id)]);}
 for(const group of byArtist.values()){if(group.length<2)continue;const sorted=group.slice().sort((x,y)=>(+y[1].dataset.count||0)-(+x[1].dataset.count||0)||(y[0].tracks?.length||0)-(x[0].tracks?.length||0));
  for(let i=0;i<sorted.length;i++){const [r,,h]=sorted[i];if(map[r.id])continue;for(let j=i+1;j<sorted.length;j++){const [s,,hs]=sorted[j];if(map[s.id]||s.id===r.id)continue;if(hamming(h,hs)<=3&&(+sorted[j][1].dataset.count||0)<=(+sorted[i][1].dataset.count||0))map[s.id]=r.id;}}}
 foldMap=map;order();document.dispatchEvent(new CustomEvent('catalog:fold',{detail:{map}}));}
async function measure(){let dirty=false;for(const r of records){const cached=cache[r.image];if(cached&&cached.hash){colour.set(r.id,cached);hashes.set(r.id,cached.hash);continue;}const im=await load(r.image);if(!im)continue;const px=sample(im,32);if(!px)continue;const c=dominant(px);if(!c)continue;const small=sample(im,8);c.hash=small?ahash(small):undefined;colour.set(r.id,c);if(c.hash)hashes.set(r.id,c.hash);cache[r.image]=c;dirty=true;}if(dirty)remember();order();fold();}
// Hover plate: the pointed-at cover as a 24 × 24 midtones figure, paper dots on ink, with artist, title, credit and year beside it.
const hover=$('hover-plate');
if(hover&&canDraw&&!reduced&&typeof matchMedia==='function'&&matchMedia('(hover: hover) and (pointer: fine)').matches){const hc=hover.querySelector('canvas'),hx=hc.getContext('2d'),HG=24;let hoverId=null,hoverToken=0;
 // Dots cascade in along the diagonal over ~.45s, then breathe gently while the pointer stays. The canvas also covers the caption tab under (or, near the window's foot, above) the plate, where the figure's edge rows reflect in with fading ink, so the cover's dots bleed into the label.
 let hoverCells=null,hoverAnim=null,hoverStart=0,tagRows=0,tagUp=false;const CASCADE=450;
 function drawHover(now){if(!hoverCells)return;const S=hc.width,c=S/HG,H=hc.height,t=now-hoverStart,off=tagUp?H-S:0;hx.clearRect(0,0,S,H);const settled=t>CASCADE+140;const band=settled?sweepBand((t-CASCADE)/1400):BAND;const ghost=settled?{g:HG,ph:(t-CASCADE)/420,c,cells:hoverCells,band}:null;
  for(let y=0;y<HG;y++)for(let x=0;x<HG;x++){const on=tonal(hoverCells,y*HG+x,band);const delay=((x+y)/(2*HG-2))*CASCADE*.8+((x*7+y*13)%5)*18;const age=t-delay;if(age<0)continue;const pop=Math.min(1,age/140),ease=1-Math.pow(1-pop,3);let r=(on?c*.36:c*.14)*(.4+.6*ease)*(pop<1?1+.35*Math.sin(pop*Math.PI):1),alpha=(on?1:.16)*ease;
   if(settled){const ph=(t-CASCADE)/420;const w=Math.sin(ph*1.6+x*.42-y*.18)*.5+.5,s2=Math.sin(ph*.9-x*.12+y*.36)*.5+.5;const g=.86+.22*w+.12*s2;r*=g;if(!on)alpha=.1+.12*(g-.86)/.34;}
   r=Math.min(r,c*.49);dot(hx,x*c+c/2,y*c+c/2+off,r,'#ecebe7',alpha,x,y,on,ghost);
   // Reflection: the k-th row beyond the plate's edge mirrors the k-th row inside it, thinning out across the tab.
   const k=tagUp?y:HG-1-y;if(k<tagRows){const fade=Math.pow(1-(k+.5)/tagRows,1.6);const ry=tagUp?off-(k*c+c/2):S+k*c+c/2;dot(hx,x*c+c/2,ry,r*(.55+.35*fade),'#ecebe7',alpha*(on?.42:.5)*fade,x,y,on,ghost);}}
  hx.globalAlpha=1;hoverAnim=requestAnimationFrame(drawHover);}
 function startHover(px){const L=luminance(px);hoverCells=new Uint8Array(L.length);for(let i=0;i<L.length;i++)hoverCells[i]=Math.round((1-L[i])*255);hoverStart=performance.now();if(hoverAnim)cancelAnimationFrame(hoverAnim);hoverAnim=requestAnimationFrame(drawHover);}
 function stopHover(){if(hoverAnim)cancelAnimationFrame(hoverAnim);hoverAnim=null;hoverCells=null;}
 // The pointed-at record's description is not shown in a caption under the cover: the nearest photograph on the wall (the studio photographs among the sleeves) turns into it, its picture breaking into dots as the title, credit, artist and year come up in its square, and turns back when the pointer moves on. With no photograph close enough (in the list, or on a narrow screen) the caption shows as before.
 let sayFr=null;const say=(b,r)=>{let best=null,bd=1e9;const cx=b.left+b.width/2,cy=b.top+b.height/2;wall.querySelectorAll('.fr:not([hidden])').forEach(f=>{const q=f.getBoundingClientRect();if(q.width<24||q.bottom<0||q.top>window.innerHeight)return;const d=Math.hypot(q.left+q.width/2-cx,q.top+q.height/2-cy);if(d<bd){bd=d;best=f;}});
  if(sayFr&&sayFr!==best)sayFr.classList.remove('is-saying');if(!best||bd>b.width*6){sayFr=null;return false;}sayFr=best;let box=best.querySelector('.fr-say');if(!box){box=document.createElement('p');box.className='fr-say';box.setAttribute('aria-hidden','true');box.innerHTML='<b></b><span class="mono"></span><i class="mono"></i>';best.appendChild(box);}
  box.querySelector('b').textContent=r.title||'';box.querySelector('span').textContent=r.credit||'';box.querySelector('i').textContent=[r.artist,r.year].filter(Boolean).join(' · ');best.classList.add('is-saying');return true;};
 const unsay=()=>{sayFr?.classList.remove('is-saying');sayFr=null;};
 async function showHover(tile){const r=byId.get(tile.dataset.id);if(!r)return;const token=++hoverToken;hoverId=r.id;const b=tile.getBoundingClientRect();hover.hidden=false;hover.style.left=b.left+'px';hover.style.top=b.top+'px';hover.style.width=b.width+'px';hover.style.height=b.height+'px';tagUp=b.bottom+64>window.innerHeight;hover.classList.toggle('is-up',tagUp);
  const p=hover.querySelector('p');p.querySelector('b').textContent=r.title;p.querySelector('span').textContent=r.credit||'';p.querySelector('i').textContent=[r.artist,r.year].filter(Boolean).join(' · ');
  const said=say(b,r);hover.classList.toggle('no-tab',said);const tagPx=said?0:(p.offsetHeight||56),S=hc.width;tagRows=Math.ceil(tagPx/b.width*HG);hc.height=S+tagRows*(S/HG);hc.style.height=`calc(100% + ${tagRows*b.width/HG}px)`;hc.style.top=tagUp?`-${tagRows*b.width/HG}px`:'0';hover.style.setProperty('--tag',`${tagPx}px`);
  stopHover();hx.clearRect(0,0,hc.width,hc.height);requestAnimationFrame(()=>{if(token===hoverToken)hover.classList.add('is-on');});const im=await load(r.image);if(token!==hoverToken||!im)return;const px=sample(im,HG);if(px)startHover(px);}
 function hideHover(){hoverToken++;hoverId=null;stopHover();unsay();hover.classList.remove('is-on');setTimeout(()=>{if(!hoverId)hover.hidden=true;},180);}
 wall.addEventListener('pointerover',e=>{const t=e.target.closest('.tile');if(!t||t.hidden||t.dataset.id===hoverId)return;showHover(t);});
 wall.addEventListener('pointerout',e=>{const t=e.target.closest('.tile');if(!t)return;const to=e.relatedTarget?.closest?.('.tile');if(to===t)return;if(!to)hideHover();});
 wall.addEventListener('focusin',e=>{const t=e.target.closest('.tile');if(t)showHover(t);});wall.addEventListener('focusout',e=>{if(!e.relatedTarget?.closest?.('.tile'))hideHover();});
 window.addEventListener('scroll',()=>{if(hoverId)hideHover();},{passive:true});}
// Start a project: every sleeve and studio photograph on the wall turns into its dot figure, rippling out from the display, and then keeps moving the way the hover plate does (the band of tones sweeping, the dots breathing, pastel fringes), a lot slower (about a fifth of its speed) and starting later the further a tile is from the form. Only tiles in view are redrawn, about twenty times a second, each in a handful of batched fills. They turn back when the form closes.
if(canDraw){const DG=24,TAU=Math.PI*2,figs=new Map();let figsOn=false,figsRaf=0,figsT0=0,figsLast=0;
 const figDraw=(f,k)=>{const cv=f.cv,x2=f.ctx,S=cv.width,c=S/DG;x2.clearRect(0,0,S,S);x2.globalAlpha=Math.min(1,k*2.2);x2.fillStyle='#0e0e0d';x2.fillRect(0,0,S,S);const ghost={g:DG,ph:0,c,cells:f.cells,band:BAND};
  for(let y=0;y<DG;y++)for(let x=0;x<DG;x++){const on=tonal(f.cells,y*DG+x,BAND);const d=((x+y)/(2*DG-2))*.55,p=Math.max(0,Math.min(1,(k-d)/.45)),e=1-Math.pow(1-p,3);if(e<=0)continue;dot(x2,x*c+c/2,y*c+c/2,(on?c*.36:c*.14)*(.25+.75*e),'#ecebe7',(on?1:.16)*e,x,y,on,ghost);}x2.globalAlpha=1;};
 const figLive=(f,t)=>{const x2=f.ctx,S=f.cv.width,c=S/DG,cells=f.cells,ph=t/420,band=sweepBand(Math.max(0,t-f.dist*2.2)/1400),ease=Math.min(1,t/700),off=[],P=[[],[],[],[],[],[]],mid=(DG-1)/2;x2.globalAlpha=1;x2.fillStyle='#0e0e0d';x2.fillRect(0,0,S,S);x2.beginPath();
  for(let y=0;y<DG;y++)for(let x=0;x<DG;x++){const on=tonal(cells,y*DG+x,band);const w=Math.sin(ph*1.6+x*.42-y*.18)*.5+.5,s2=Math.sin(ph*.9-x*.12+y*.36)*.5+.5,g=1+(.86+.22*w+.12*s2-1)*ease;const r=Math.min((on?c*.36:c*.14)*g,c*.49),cx=x*c+c/2,cy=y*c+c/2;
   if(!on){off.push(cx,cy,r);continue;}x2.moveTo(cx+r,cy);x2.arc(cx,cy,r,0,TAU);
   if(ghostAt(x,y)){const an=Math.atan2(y-mid,x-mid)+ph*.6+(x*3+y*5)%7*.2,step=Math.sin(ph*1.3+x*.31+y*.27)>.3?2:1,sx=Math.round(Math.cos(an))*step,sy=Math.round(Math.sin(an))*step,nx=x+sx,ny=y+sy;if(nx>=0&&ny>=0&&nx<DG&&ny<DG&&!tonal(cells,ny*DG+nx,band))P[(x*5+y*11)%6].push(cx+sx*c,cy+sy*c,r*.9);}}
  x2.fillStyle='#ecebe7';x2.fill();x2.globalAlpha=.16;x2.beginPath();for(let i=0;i<off.length;i+=3){x2.moveTo(off[i]+off[i+2],off[i+1]);x2.arc(off[i],off[i+1],off[i+2],0,TAU);}x2.fill();
  x2.globalAlpha=.8*ease;for(let k=0;k<6;k++){const q=P[k];if(!q.length)continue;x2.fillStyle=PASTEL[k];x2.beginPath();for(let i=0;i<q.length;i+=3){x2.moveTo(q[i]+q[i+2],q[i+1]);x2.arc(q[i],q[i+1],q[i+2],0,TAU);}x2.fill();}x2.globalAlpha=1;};
 const figStep=now=>{figsRaf=0;let more=false;const t=now-figsT0,tick=now-figsLast>=48,vh=window.innerHeight;
  figs.forEach((f,tile)=>{if(!f.cells)return;if(f.live&&figsOn){more=true;if(tick){const b=tile.getBoundingClientRect();if(b.width&&b.bottom>0&&b.top<vh)figLive(f,(now-f.t0)*.22);}return;}
   const a=(t-f.delay)/(figsOn?520:300);const k=figsOn?Math.max(0,Math.min(1,a)):1-Math.max(0,Math.min(1,a));if(k!==f.k){f.k=k;figDraw(f,k);}if(figsOn&&k===1&&!reduced){f.live=true;f.t0=now;more=true;}if(figsOn?k<1:k>0)more=true;});
  if(tick)figsLast=now;if(!figsOn&&!more){figs.forEach(f=>f.cv.remove());figs.clear();return;}if(more)figsRaf=requestAnimationFrame(figStep);};
 const figKick=()=>{if(!figsRaf)figsRaf=requestAnimationFrame(figStep);};
 document.addEventListener('catalog:dots',e=>{const on=!!e.detail?.on;if(on===figsOn)return;figsOn=on;figsT0=performance.now();const d=$('display')?.getBoundingClientRect?.(),cx=d?d.left+d.width/2:window.innerWidth/2,cy=d?d.top+d.height/2:window.innerHeight/2;
  if(on){[...tiles,...wall.querySelectorAll('.fr')].forEach(tile=>{if(tile.hidden||figs.has(tile))return;const im0=tile.querySelector('img'),src=byId.get(tile.dataset.id)?.image||im0?.currentSrc||im0?.getAttribute('src');if(!src)return;const b=tile.getBoundingClientRect();if(!b.width)return;const cv=document.createElement('canvas');cv.width=cv.height=216;cv.className='tile-dots';cv.setAttribute('aria-hidden','true');const vis=b.bottom>-200&&b.top<window.innerHeight+200,dist=Math.hypot(b.left+b.width/2-cx,b.top+b.height/2-cy);const f={cv,ctx:cv.getContext('2d'),cells:null,k:-1,live:false,t0:0,dist,delay:vis?dist*.55:0};figs.set(tile,f);tile.appendChild(cv);
    load(src).then(im=>{if(!im||figs.get(tile)!==f)return;const px=sample(im,DG);if(!px)return;const L=luminance(px);f.cells=new Uint8Array(L.length);for(let i=0;i<L.length;i++)f.cells[i]=Math.round((1-L[i])*255);figKick();});});}
  else figs.forEach((f,tile)=>{f.live=false;f.k=-1;const b=tile.getBoundingClientRect();f.delay=Math.hypot(b.left+b.width/2-cx,b.top+b.height/2-cy)*.25;});
  figKick();});}
order();measure();
})();
