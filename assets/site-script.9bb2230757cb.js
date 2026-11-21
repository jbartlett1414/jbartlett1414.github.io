// Module photographs, a pile of prints (see styles.css). On wide screens the pile fills the top of the module, behind the name too (a frosted band keeps the name readable; --lift is how far the frame reaches up). A dozen record sleeves from the wall, drawn per visit, join the photographs, square and uncropped. Every print is large (the smaller ones still half the frame across or more, and they may hang a little off its edges), and each takes a shape of its own: about half keep the photograph's own proportions, uncropped; the rest are trimmed into long strips, squares or upright 4:5 prints around the photograph's focus. A print slides quickly onto the pile from the nearest edge every 4.5 to 8.5 s, one at a time, square to the frame, and stays where it lands. A large print lands when the frame is getting bare or every so often; small ones land away from the last few small ones. The radio's screen is part of the pile: each new song pops in on top (box._collage.raise gives it the next place in the pile), and while it plays new prints land over its edges, so the song starts to get buried, never more than a fifth of the screen while it plays; the radio's controls bar along the bottom stays on top. The radio reports where its screen is through box._collage.vid. A print covered over by newer ones is lifted away unseen; past eight in the pile the oldest is lifted. The page opens on the portrait, whole and clear under the band. The radio leaves stills of the songs it has played on the pile through box._collage.still. It waits while the tab is hidden, and holds still under reduced motion.
(()=>{'use strict';const box=document.getElementById('d-show');if(!box)return;const slides=[...box.querySelectorAll('.d-slide')];if(!slides.length)return;
 const rnd=(a,b)=>a+Math.random()*(b-a);
 const cap=box.querySelector('.d-cap'),vid=box.querySelector('.d-vid');
 // Record sleeves from the wall (the ones kept on this site), a dozen per visit.
 let sleeves=[];try{sleeves=[...document.querySelectorAll('#wall .tile img')].filter(i=>/^\/assets\/record-/.test(i.getAttribute('src')||'')).map(i=>[Math.random(),i]).sort((a,b)=>a[0]-b[0]).slice(0,12).map(([,i])=>{
  const name=(i.closest?.('.tile')?.getAttribute('aria-label')||'').replace(/^(Listen to|View credit for) /,''),k=name.indexOf(', '),artist=k>0?name.slice(0,k):'',title=k>0?name.slice(k+2):name;
  const f=document.createElement('figure'),im=document.createElement('img');f.className='d-slide d-sleeve';f.dataset.sleeve='';f.dataset.cap=[title,artist].filter(Boolean).join(' · ');f.style.setProperty('--fx','50%');f.style.setProperty('--fy','50%');
  im.alt=title?`Sleeve of ${title}${artist?` by ${artist}`:''}`:'';im.setAttribute('width','600');im.setAttribute('height','600');im.loading='lazy';im.decoding='async';im.src=i.getAttribute('src');f.append(im);box.insertBefore(f,vid||cap||null);return f;});}catch{sleeves=[];}
 const order=[slides[0],...slides.slice(1).concat(sleeves).map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1])];
 // How far the frame reaches up behind the name (wide screens; see styles.css).
 const disp=box.closest?.('.display'),head=box.parentElement;let seat=null;const reach=()=>{if(disp&&head)disp.style.setProperty('--lift',(head.offsetTop||0)+'px');seat?.();};
 reach();window.addEventListener?.('resize',reach);document.fonts?.ready?.then?.(reach);if(typeof ResizeObserver==='function'&&disp)new ResizeObserver(reach).observe(disp);
 const queue=order.slice();let live=[],z=0,vz=0,sinceBig=0,avoid=null,scr=null,guard=null,opening=true,keepR=[];const MAXB=.18;const still=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const warm=x=>{const img=x?.querySelector('img');if(img)img.loading='eager';};
 const inside=(r,x,y)=>x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3];
 const coverOf=(r,over)=>{let hit=0,all=0;for(let a=0;a<7;a++)for(let b=0;b<7;b++){const x=r[0]+r[2]*(a+.5)/7,y=r[1]+r[3]*(b+.5)/7;all++;if(over.some(o=>inside(o._rect,x,y)))hit++;}return hit/all;};
 // How bare the frame is: the share of it that prints cover.
 // How bare the visible part of the frame (under the frosted band) is: the share of it that prints cover.
 const frameCover=()=>{const Z=zone();let hit=0;for(let a=0;a<9;a++)for(let b=0;b<9;b++){const x=Z[0]+Z[2]*(a+.5)/9,y=Z[1]+Z[3]*(b+.5)/9;if(live.some(o=>inside(o._rect,x,y)))hit++;}return hit/81;};
 // How much of the playing song's screen the prints laid since it popped in now cover.
 // The same, finer, for the playing screen, so its cap holds closely.
 const coverFine=(r,over)=>{let hit=0;for(let a=0;a<16;a++)for(let b=0;b<12;b++){const x=r[0]+r[2]*(a+.5)/16,y=r[1]+r[3]*(b+.5)/12;if(over.some(o=>inside(o._rect,x,y)))hit++;}return hit/192;};
 const above=()=>live.filter(p=>p._z>vz),buried=()=>scr?coverFine(scr,above()):0;
 const natural=x=>{const i=x.querySelector('img'),w=+(i?.getAttribute('width')||0),h=+(i?.getAttribute('height')||0);return w>0&&h>0?w/h:1.5;};
 const shapeOf=n=>{const r=Math.random();return r<.5?n:r<.72?Math.max(n,rnd(1.8,2.3)):r<.88?1:.8;};
 // Where a print goes, in percent of the frame: [left, top, width, height, angle]. Sizes are worked out on the frame's real proportions so a print keeps its shape.
 // Prints are sized and placed on the visible part of the frame (under the frosted band), in that part's own units; a print may hang a little up into the band or off the sides.
 const place=(x,big,first=false)=>{if(x.dataset.small!=null)big=false;const W=box.clientWidth||640,H=box.clientHeight||320,Z=zone(),zx=Z[0]/100,zy=Z[1]/100,zw=Z[2]/100,zh=Z[3]/100,fa=(W*zw)/(H*zh);const a=first?Math.min(natural(x),fa*rnd(.72,.86)):x.dataset.sleeve!=null?1:shapeOf(natural(x));let w,h;
  if(big){h=first?1:rnd(.86,1);w=h*a/fa;if(w>.97){w=rnd(.86,.97);h=w*fa/a;}}else{w=rnd(.5,.74);h=w*fa/a;if(h>.95){h=rnd(.74,.95);w=h*a/fa;}}
  // While a song plays, most landings take a small bite out of its screen; the rest land beside it. A playing screen is never more than a fifth covered: a print that would take it past that waits for the next song.
  const recent=live.filter(y=>y.classList.contains('is-small')).slice(-3),top=scr?above():[],under=buried(),bury=!!scr&&!first&&under<MAXB-.05&&Math.random()<.7;let best=null;
  for(let t=0;t<(first?1:40);t++){const lz=first?rnd(0,1-w):rnd(-.1,1-w+.1),tz=first?(1-h)/2:rnd(-.16,1-h+.06),r=[(zx+lz*zw)*100,(zy+tz*zh)*100,w*zw*100,h*zh*100,0];let s=-(big?0:coverOf(r,recent)*1.5),ok=true;if(!first)keepR.forEach(k=>{s-=coverFine(k,[{_rect:r}])*2;});
   if(guard&&r[0]<guard[0]+guard[2]&&r[0]+r[2]>guard[0]&&r[1]<guard[1]+guard[3]&&r[1]+r[3]>guard[1])ok=false;
   if(scr){const after=coverFine(scr,top.concat({_rect:r})),o=after-under;s-=bury?Math.abs(after-MAXB*.75)*6:o*4;if(after>MAXB+.001&&o>0)ok=false;}if(!best||(ok&&!best.ok)||(ok===best.ok&&s>best.s))best={r,s,ok};}
  return best.ok?best.r:null;};
 const lay=(x,rect,big,instant=false,zAt)=>{const st=x.style;x._rect=rect;x.classList.toggle('is-small',!big);const [l,t,w,h,r]=rect;
  st.setProperty('--l',l+'%');st.setProperty('--t',t+'%');st.setProperty('--w',w+'%');st.setProperty('--h',h+'%');x._z=zAt??(z+=2);st.setProperty('--zi',String(x._z));warm(x);
  // Every print but the opening portrait is cropped in a little and drifts slowly in place while it sits (a long, even pan back and forth), so something is always moving.
  if(!still&&!x.classList.contains('is-pan')&&!(opening&&x===order[0])){const k=rnd(1.1,1.26),m=(k-1)/(2*k)*100*.9,p=()=>rnd(-m,m).toFixed(2)+'%';st.setProperty('--ks',k.toFixed(3));st.setProperty('--kx0',p());st.setProperty('--ky0',p());st.setProperty('--kx1',p());st.setProperty('--ky1',p());st.setProperty('--kd',rnd(16,30).toFixed(1)+'s');x.classList.add('is-pan');}
  // It slides in from the nearest edge of the frame, a fifth of its own size, quickly; nothing fades.
  if(!instant&&!still){const cx=l+w/2,cy=t+h/2,d=[cx,100-cx,cy,100-cy],k=d.indexOf(Math.min(...d)),D=22;x.classList.add('is-enter');st.setProperty('--dx',(k===0?-D:k===1?D:0)+'%');st.setProperty('--dy',(k===2?-D:k===3?D:0)+'%');x.dataset.on='';void x.offsetWidth;x.classList.remove('is-enter');st.setProperty('--dx','0%');st.setProperty('--dy','0%');}else x.dataset.on='';
  live.push(x);if(cap&&!guard)cap.textContent=x.dataset.cap||'';};
 const lift=x=>{delete x.dataset.on;live=live.filter(y=>y!==x);if(x._temp)x.remove();else queue.push(x);};
 const tidy=()=>{const snap=live.slice().sort((a,b)=>a._z-b._z);snap.forEach((x,i)=>{if(i<snap.length-1&&coverOf(x._rect,snap.slice(i+1))>=.94)lift(x);});while(live.length>8)lift(live[0]);};
 const next=()=>{const i=queue.findIndex(x=>!live.includes(x));return i<0?null:queue.splice(i,1)[0];};
 box._collage={
  // The radio's stills: a black-and-white frame of the song just played, left where its screen was.
  still(src,alt,label,rect){const f=document.createElement('figure'),img=document.createElement('img');f.className='d-slide d-still';f.dataset.cap=label||'';f._temp=true;f.style.setProperty('--fx','50%');f.style.setProperty('--fy','50%');img.alt=alt||'';img.decoding='async';img.addEventListener('error',()=>{if(live.includes(f))lift(f);else f.remove();},{once:true});img.src=src;f.append(img);box.insertBefore(f,vid||cap||null);lay(f,[...rect,0],false,true,vz-1);setTimeout(tidy,400);},
  // Where the radio's screen is, in percent of the frame (or null when it is away).
  vid(rect,screen){avoid=rect||null;scr=screen||null;if(rect){opening=false;guard=null;}placeCap();},
  // The earlier songs still showing (shrunk to the corners): prints would rather land elsewhere, so they stay in view for a while.
  keep(rects){keepR=rects||[];},
  // A new song's screen goes on top of the pile.
  raise(){vz=(z+=2);return vz;},
  // When a song gives way, a print slides over its screen, just under the new song's, covering it whole; false when there is none to hand.
  bury(rect){const x=next();if(!x)return false;const W=box.clientWidth||640,H=box.clientHeight||320,a=x.dataset.sleeve!=null?1:natural(x),rw=rect[2]/100*W,rh=rect[3]/100*H;
   const pw=Math.max(rw*rnd(1.08,1.24),rh*rnd(1.08,1.24)*a),ph=pw/a,px=rect[0]/100*W-(pw-rw)*Math.random(),py=rect[1]/100*H-(ph-rh)*Math.random();
   lay(x,[px/W*100,py/H*100,pw/W*100,ph/H*100,0],false,false,vz-1);warm(queue[0]);setTimeout(tidy,1200);return true;}};
 // (The collage has no captions; this keeps clear of the radio's screen any caption a page may still carry.)
 const placeCap=()=>{if(!cap)return;const st=cap.style;['left','right','max-width','visibility'].forEach(k=>st.removeProperty(k));if(!avoid||avoid[1]+avoid[3]<88)return;
  const W=box.clientWidth||640,lft=avoid[0]/100*W,rgt=W-(avoid[0]+avoid[2])/100*W,room=Math.max(lft,rgt)-20;
  if(room<110){st.setProperty('visibility','hidden');return;}if(rgt>lft){st.setProperty('left','auto');st.setProperty('right','10px');}st.setProperty('max-width',Math.round(room)+'px');};
 // The opening: the portrait fills the clear part of the frame (under the frosted band), whole and uncovered, and a few prints sit up in the band behind the name. Until the first song is on its way, nothing new lands.
 const zone=()=>{const W=box.clientWidth,H=box.clientHeight;if(!W||!H||!head||!box.getBoundingClientRect)return [0,0,100,100];const br=box.getBoundingClientRect(),hr=head.getBoundingClientRect();return [(hr.left-br.left)/W*100,(hr.top-br.top)/H*100,hr.width/W*100,hr.height/H*100];};
 const first=[next(),next(),next(),next()].filter(Boolean);
 const fit=(x,r)=>{const st=x.style;x._rect=r;['l','t','w','h'].forEach((k,i)=>st.setProperty('--'+k,r[i]+'%'));};
 if(first[0]){lay(first[0],[...zone(),0],true,true);guard=first[0]._rect;}
 seat=()=>{if(!opening||!first[0])return;const r=[...zone(),0];fit(first[0],r);guard=r;live.forEach(p=>{if(p!==first[0]&&p._rect[1]+p._rect[3]>r[1]){const n=[...p._rect];n[1]=r[1]-n[3];fit(p,n);}});};
 first.slice(1).forEach(x=>{const g=guard||[0,0,100,100];if(g[1]<8){queue.unshift(x);return;}const W=box.clientWidth||640,H=box.clientHeight||320,fa=W/H,a=x.dataset.sleeve!=null?1:natural(x),w=rnd(.42,.6),h=Math.min(.9,w*fa/a);
  lay(x,[rnd(-.06,1-w+.06)*100,g[1]-h*100-rnd(0,2),w*100,h*100,0],false,true);});
 if(cap&&first[0])cap.textContent=first[0].dataset.cap||'';warm(queue[0]);
 if(still||!queue.length||typeof setTimeout!=='function')return;
 const land=()=>{if(guard)return;const x=next();if(!x)return;sinceBig++;
  const big=!avoid&&!guard&&(frameCover()<.78||(sinceBig>4&&Math.random()<.35));if(big)sinceBig=0;
  const small=x.dataset.small!=null,r=place(x,big&&!small);if(!r){queue.unshift(x);return;}lay(x,r,big&&!small);warm(queue[0]);setTimeout(tidy,1000);};
 const playing=()=>vid&&(vid.dataset.state==='on'||vid.dataset.state==='tuning');
 const tick=()=>{if(!document.hidden)land();setTimeout(tick,rnd(4500,8500));};
 setTimeout(tick,2600);
})();
// Start a project. The brief goes to the studio inbox: posted to the form service when the form names one, otherwise written out in the visitor's email app (subject "Justin x <band>", the studio's thread style). The player's link carries the record now playing into the reference field. The recording question only shows once Recording is picked. Works on the standalone page and when the page is opened inside home.
(()=>{'use strict';const KEY='jb.start-ref';
document.addEventListener('click',e=>{if(!e.target.closest?.('#player-start'))return;const t=document.getElementById('playing-title')?.textContent.trim(),a=document.getElementById('playing-artist')?.textContent.split(' · ')[0].trim();try{if(t)sessionStorage.setItem(KEY,a?`${t} by ${a}`:t);}catch{}},true);
const val=(f,n)=>(f.elements[n]?.value||'').trim();
function brief(f){const services=[...f.querySelectorAll('input[name=services]:checked')].map(i=>i.value),days=f.querySelector('input[name=days]:checked')?.value||'';const rows=[['Name',val(f,'name')],['Band or artist',val(f,'band')],['Email',val(f,'email')],['Instagram',val(f,'instagram')],['Looking for',services.join(', ')],['Songs',val(f,'songs')],['Hoping to start',val(f,'timing')],['Recording days',services.includes('Recording')?days:''],['Links',val(f,'links')],['Sound like',val(f,'reference')],['Budget',val(f,'budget')],['Notes',val(f,'notes')]].filter(r=>r[1]);return {services,subject:`Justin x ${val(f,'band')||val(f,'name')}`,text:rows.map(r=>`${r[0]}: ${r[1]}`).join('\n')};}
function init(f){if(f.dataset.ready)return;f.dataset.ready='1';const done=document.getElementById('project-done'),err=f.querySelector('.f-error'),days=f.querySelector('.f-days');
 try{const ref=sessionStorage.getItem(KEY);if(ref){f.elements.reference.value=ref;sessionStorage.removeItem(KEY);}}catch{}
 const sync=()=>{if(days)days.hidden=!f.querySelector('input[name=services][value=Recording]:checked');};sync();f.addEventListener('change',sync);
 f.addEventListener('submit',async e=>{e.preventDefault();const b=brief(f);let msg='';if(!val(f,'name'))msg='Add your name.';else if(!f.elements.email.checkValidity()||!val(f,'email'))msg='Add an email so Ben can reply.';else if(!b.services.length)msg='Pick at least one thing you need.';
  err.hidden=!msg;err.textContent=msg;if(msg)return;
  const finish=sent=>{f.hidden=true;if(done){if(sent){done.querySelector('h2').textContent='Sent. Ben will get back to you with dates and a quote.';done.querySelector('.contact-intro').hidden=true;}done.hidden=false;done.focus({preventScroll:true});done.scrollIntoView({block:'center',behavior:'smooth'});}};
  const ep=f.dataset.endpoint;if(ep){try{const r=await fetch(ep,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({subject:b.subject,message:b.text,email:val(f,'email'),name:val(f,'name')})});if(r.ok){finish(true);return;}}catch{}}
  location.href=`mailto:${f.dataset.email}?subject=${encodeURIComponent(b.subject)}&body=${encodeURIComponent(b.text+'\n')}`;finish(false);});}
const check=()=>{const f=document.getElementById('project-form');if(f)init(f);};check();if(typeof MutationObserver==='function'&&document.body)new MutationObserver(check).observe(document.body,{childList:true,subtree:true});
})();
(()=>{'use strict';
const raw=document.getElementById('catalog-data');if(!raw)return;
const data=JSON.parse(raw.textContent),records=data.records,tracks=data.tracks,all=[...records,...tracks],byId=new Map(all.map(r=>[r.id,r]));
const $=id=>document.getElementById(id),search=$('catalog-search'),wall=$('wall'),panel=$('player'),media=$('player-media'),body=document.body;
const tiles=new Map([...wall.querySelectorAll('.tile')].map(el=>[el.dataset.id,el]));
const catalog=$('records'),list=$('tracklist'),trackRows=new Map(),groupHeads=new Map();
const VIEW_KEY='jb.artwork-geometry.view';let view='grid';try{view=sessionStorage.getItem(VIEW_KEY)==='list'?'list':'grid';}catch{}
let visible=[...records],queue=[],queueIndex=-1,current=null,lastTrigger=null,player=null,spotifyController=null,generation=0;
let ytPromise,spotifyPromise,playbackState='idle',mediaReady=false,progressTimer=null,duration=0,position=0;
// YouTube paints its title card, pause glyph and logo over any video that is not playing. The artwork covers the frame until playback is confirmed and returns whenever it stops.
let coverTimer=null,covered=false,holdCover=false;
// The media box (embed plus artwork cover) sits behind the frosted player layer; the artwork covers it until playback is confirmed and returns whenever it stops.
function setCover(on,delay=0){clearTimeout(coverTimer);coverTimer=null;const cover=$('media-cover');if(!cover)return;if(on){covered=true;cover.classList.remove('is-off');panel.classList.remove('is-uncovered');return;}if(!covered)return;const token=generation;const off=()=>{if(token!==generation)return;covered=false;cover.classList.add('is-off');panel.classList.add('is-uncovered');};if(delay>0)coverTimer=setTimeout(off,delay);else off();}
// Plate modes: Dots (the midtones figure), Art (the full artwork) or Video (the YouTube box moved onto the plate square). Otherwise the box stays behind the glass.
const box=$('media-box'),modes=$('plate-modes'),PLATE_KEY='jb.artwork-geometry.plate';let plateMode='dots',forcePlate=false;try{const saved=sessionStorage.getItem(PLATE_KEY);if(['dots','art','video'].includes(saved))plateMode=saved;}catch{}
// Fallbacks: an embed YouTube refuses is remembered for the session and the next target (another researched video, then Spotify) is used; the catalogue item itself is never rewritten.
const failed=new Set();let mountedSrc='';const srcOf=r=>r?[r.embed,...(r.alts||[])].find(u=>u&&!failed.has(u))||r.embed:'';
const canVideo=()=>!!mountedSrc&&!mountedSrc.includes('spotify.com');
function placeBox(){if(!box)return;const p=panel.getBoundingClientRect(),f=$('plate-frame').getBoundingClientRect();if(!(f.width>0&&p.width>0))return;box.style.setProperty('--mx',`${f.left-p.left}px`);box.style.setProperty('--my',`${f.top-p.top}px`);box.style.setProperty('--mw',`${f.width}px`);box.style.setProperty('--mh',`${f.height}px`);}
function applyPlate(){if(!box||!modes)return;const video=canVideo(),mode=plateMode==='video'&&!video?'dots':plateMode;panel.dataset.plate=mode;modes.querySelectorAll('[data-plate]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.plate===mode));if(b.dataset.plate==='video')b.disabled=!video;});const inPlate=(mode==='video'&&video)||forcePlate;box.classList.toggle('is-plate',inPlate);panel.classList.toggle('has-media',!!current);if(inPlate)placeBox();if(mode==='video'&&video)ensureShadow();else dropShadow();}
// Video mode keeps the picture behind the glass too: a second, muted YouTube player follows the main one (same video, position and state). It is never the source of playback state.
const back=$('media-back');let shadow=null,shadowTimer=null,shadowToken=0;
function dropShadow(){clearInterval(shadowTimer);shadowTimer=null;shadowToken++;try{shadow?.destroy();}catch{}shadow=null;if(back)back.replaceChildren();}
function ensureShadow(){if(!back||shadow||!player||!current?.embed)return;const token=++shadowToken,gen=generation,r=current;const f=document.createElement('iframe');f.title='';f.tabIndex=-1;f.setAttribute('aria-hidden','true');const url=new URL(mountedSrc);url.searchParams.set('mute','1');url.searchParams.set('autoplay','0');url.searchParams.set('origin',location.origin);f.src=url.href;f.allow='autoplay; encrypted-media';f.referrerPolicy='strict-origin-when-cross-origin';back.replaceChildren(f);
 loadYoutubeApi().then(YT=>{if(token!==shadowToken||gen!==generation){return;}shadow=new YT.Player(f,{events:{onReady:()=>{if(token!==shadowToken)return;try{shadow.mute();}catch{}syncShadow();shadowTimer=setInterval(syncShadow,1500);}}});});}
function syncShadow(){if(!shadow||!player)return;try{const main=player.getVideoData?.()?.video_id,copy=shadow.getVideoData?.()?.video_id;const t=player.getCurrentTime?.();if(main&&copy&&copy!==main){shadow.loadVideoById(main,t||0);shadow.mute?.();return;}const st=player.getPlayerState?.(),cs=shadow.getPlayerState?.();if(st===1){if(Number.isFinite(t)&&Math.abs((shadow.getCurrentTime?.()||0)-t)>1)shadow.seekTo(t,true);if(cs!==1)shadow.playVideo?.();}else if(cs===1)shadow.pauseVideo?.();}catch{}}
modes?.addEventListener('click',e=>{const b=e.target.closest('[data-plate]');if(!b||b.disabled)return;plateMode=b.dataset.plate;try{sessionStorage.setItem(PLATE_KEY,plateMode);}catch{}applyPlate();});
window.addEventListener('resize',()=>{if(box?.classList.contains('is-plate'))placeBox();});
function publishState(state){playbackState=state;panel.classList.toggle('is-playing',state==='playing');if(!holdCover&&$('media-cover')&&!$('media-cover').classList.contains('is-off')&&state==='playing')setCover(false,2500);$('play-toggle').disabled=!mediaReady;$('play-toggle').textContent=state==='playing'?'❚❚':'▶';$('play-toggle').setAttribute('aria-label',state==='playing'?'Pause':'Play');document.dispatchEvent(new CustomEvent('player:state',{detail:{state,canControl:mediaReady}}));}
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LIGATURES={'Æ':'AE','æ':'ae','Œ':'OE','œ':'oe','Ø':'O','ø':'o','ß':'ss','Đ':'D','đ':'d','Ł':'L','ł':'l'};
const normalized=s=>String(s??'').replace(/[ÆæŒœØøßĐđŁł]/g,ch=>LIGATURES[ch]).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const corpus=r=>[r.title,r.artist,r.credit,r.albumTitle||'',...(r.tracks||[]).map(id=>{const t=byId.get(id);return t?[t.title,t.artist,t.credit].join(' '):'';}),...foldedInto(r.id).flatMap(f=>[f.title,...(f.tracks||[]).map(id=>byId.get(id)?.title||'')])].join(' ');
// table.js reports singles whose artwork is the same picture as an album by the same artist; they fold into that album.
const folded=new Map();const foldedInto=id=>[...folded].filter(([,into])=>into===id).map(([single])=>byId.get(single)).filter(Boolean);
document.addEventListener('catalog:fold',e=>{folded.clear();for(const [single,into] of Object.entries(e.detail?.map||{}))if(byId.has(single)&&byId.has(into)&&single!==into)folded.set(single,into);tiles.forEach((el,id)=>el.classList.toggle('is-folded',folded.has(id)));applyFilters();if(current)updateDetails(current);});
const trackCorpus=t=>[t.title,t.artist,t.credit,t.releaseTitle||''].join(' ');
// Filtering hides tiles in place; ordering belongs to table.js.
// Under the Hue sort visible tiles are placed column by column in table.js's order, columns balanced to within one tile, so the spectrum runs left to right with no near-empty trailing column. Other sorts use reading order.
function wallColumns(){try{const n=getComputedStyle(wall).gridTemplateColumns.split(' ').filter(Boolean).length;if(n>0)return n;}catch{}const w=window.innerWidth||1440;return w<=820?5:10;}
// The profile module and the photographs among the sleeves. The module (name, collage and radio, who, numbers and booking) takes a block in the middle of the wall's first rows, sized to fit the first screen on wide windows (see moduleBlock), with the sleeves on either side; on a phone it spans the width. In List view it stands on its own above the list. While the wall shows everything (no search), each photograph takes a cell in its own band of rows, at a column drawn once per visit, kept off its neighbours and off the module. Under Hue the sleeves then fill column by column around them, the columns balanced to within one cell; under the other sorts the sleeves flow round them in their order. A search hides the photographs; the module stays.
const wallPhotos=[...wall.querySelectorAll('.fr')];const photoSeed=1+Math.floor(Math.random()*4e9);const mod=$('display');let modRows=6,resetRadio=()=>{};
function placeModule(){if(!mod)return;const solo=view==='list';const inWall=mod.parentElement===wall;if(solo===!inWall)return;resetRadio();if(solo){const anchor=$('tracklist');if(anchor?.parentElement)anchor.parentElement.insertBefore(mod,anchor);mod.classList.add('is-solo');['grid-column','grid-row'].forEach(k=>mod.style.setProperty(k,''));}else{wall.insertBefore(mod,wall.firstChild);mod.classList.remove('is-solo');}}
function moduleBlock(cols){if(!mod||mod.parentElement!==wall)return null;const span=cols>=10?6:cols;const c0=Math.floor((cols-span)/2);
 let pitch=0,gap=4;try{const cs=getComputedStyle(wall);gap=parseFloat(cs.columnGap)||4;const inner=wall.clientWidth-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0);pitch=(inner-(cols-1)*gap)/cols+gap;}catch{}
 // Rows, in whole rows of the wall. On wide screens the module fits the first screen: as many rows as fit between the wall's top and the bottom of the window, never fewer than it needs with the collage at its least (room for the radio's screen and tag), nor more than it takes with the collage at a wide crop. On phones it takes its own height.
 mod.style.setProperty('grid-column',`${c0+1} / span ${span}`);mod.style.setProperty('grid-row','1');
 const tall=k=>{mod.classList.add(k);const h=mod.offsetHeight;mod.classList.remove(k);return h;},rows=(h,room)=>Number.isFinite(h)&&h>0&&pitch>0?Math.ceil((h+room+gap)/pitch):0;
 const wide=rows(tall('is-measuring'),36);
 if(wide){if(cols>=10){const least=rows(tall('is-least'),20);let top=0;try{top=wall.getBoundingClientRect().top+(window.scrollY||0)+(parseFloat(getComputedStyle(wall).paddingTop)||0);}catch{}const fit=Math.floor((window.innerHeight-top+gap-2)/pitch);modRows=Math.max(3,least,Math.min(wide,fit));}else modRows=Math.max(3,wide);}
 mod.style.setProperty('grid-row',`1 / span ${modRows}`);return {r0:0,c0,span,rows:modRows};}
function planWall(n,cols){const block=moduleBlock(cols);const on=wallPhotos.length>0&&n>0&&!search.value.trim();wallPhotos.forEach(el=>{el.hidden=!on;el.style.setProperty('grid-column','');el.style.setProperty('grid-row','');});if(!on&&!block)return null;
 let seed=photoSeed;const rand=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296;};
 const spans=on?wallPhotos.map(el=>Math.max(1,Math.min(cols,+el.dataset.span||1))):[],k=spans.length,blockCells=block?block.span*block.rows:0;
 const rows=Math.max(block?block.rows:0,Math.ceil((n+spans.reduce((t,v)=>t+v*v,0)+blockCells)/cols)),taken=Array.from({length:rows},()=>new Array(cols).fill(false));
 if(block)for(let y=0;y<block.rows;y++)for(let x=block.c0;x<block.c0+block.span;x++)taken[y][x]=true;
 const fits=(r,c,v,pad)=>{if(r<0||c<0||r+v>rows||c+v>cols)return false;for(let y=r-pad;y<r+v+pad;y++)for(let x=c-pad;x<c+v+pad;x++)if(y>=0&&x>=0&&y<rows&&x<cols&&taken[y][x])return false;return true;};
 wallPhotos.forEach((el,i)=>{if(!on)return;const v=spans[i],lo=Math.floor(i*rows/k),hi=Math.max(lo+1,Math.floor((i+1)*rows/k));let spot=null;
  for(const pad of [1,0])for(let t=0;t<48&&!spot;t++){const r=Math.min(rows-v,lo+Math.floor(rand()*(hi-lo))),c=Math.floor(rand()*(cols-v+1));if(fits(r,c,v,pad))spot=[r,c];}
  for(let r=0;r<=rows-v&&!spot;r++)for(let c=0;c<=cols-v&&!spot;c++)if(fits(r,c,v,0))spot=[r,c];
  if(!spot){el.hidden=true;return;}const [r,c]=spot;for(let y=r;y<r+v;y++)for(let x=c;x<c+v;x++)taken[y][x]=true;el.style.setProperty('grid-column',`${c+1} / span ${v}`);el.style.setProperty('grid-row',`${r+1} / span ${v}`);});
 return {rows,cols,taken};}
function layoutWall(){const hue=wall.dataset.sort==='hue';
 const shown=[...tiles.values()].filter(el=>!el.hidden).sort((a,b)=>(+a.style.getPropertyValue('order')||0)-(+b.style.getPropertyValue('order')||0));const n=shown.length,grid=planWall(n,Math.max(1,wallColumns()));
 if(!hue){tiles.forEach(el=>{el.style.setProperty('grid-column','');el.style.setProperty('grid-row','');});return;}
 if(grid){const {rows,cols,taken}=grid;const held=(r,c)=>r<rows&&taken[r][c];
  // How many sleeves each column takes: one at a time to the column whose next free cell is highest, so the columns end level (photographs and the module counted); then the sleeves go in column by column, in order, so the spectrum still runs left to right.
  const next=new Array(cols).fill(0),count=new Array(cols).fill(0),skip=c=>{while(held(next[c],c))next[c]++;};for(let c=0;c<cols;c++)skip(c);
  for(let t=0;t<n;t++){let best=0;for(let c=1;c<cols;c++)if(next[c]<next[best])best=c;count[best]++;next[best]++;skip(best);}
  let i=0;for(let c=0;c<cols;c++){let r=0,k=0;while(k<count[c]){if(!held(r,c)){const el=shown[i++];el.style.setProperty('grid-column',String(c+1));el.style.setProperty('grid-row',String(r+1));k++;}r++;}}
  return;}
 const cols=Math.max(1,Math.min(wallColumns(),n)),base=Math.floor(n/cols),extra=n%cols;let c=0,r=0;
 shown.forEach(el=>{el.style.setProperty('grid-column',String(c+1));el.style.setProperty('grid-row',String(r+1));r++;if(r>=base+(c<extra?1:0)){r=0;c++;}});}
window.addEventListener('resize',layoutWall);document.addEventListener('catalog:order',layoutWall);
function applyFilters(){const words=normalized(search.value.trim()).split(/\s+/).filter(Boolean);
 visible=records.filter(r=>!folded.has(r.id)&&words.every(w=>normalized(corpus(r)).includes(w)));
 const ids=new Set(visible.map(r=>r.id));tiles.forEach((el,id)=>{el.hidden=!ids.has(id)||folded.has(id);});layoutWall();
 // List rows match the search on the track's own title, artist, credit and release; a heading stays while any of its rows (or a folded single's rows) remain.
 let shownRows=0;const live=new Set();trackRows.forEach((el,id)=>{const t=byId.get(id);const on=!!t&&words.every(w=>normalized(trackCorpus(t)).includes(w));el.hidden=!on;if(on){shownRows++;live.add(folded.get(el.dataset.release)||el.dataset.release);}});
 groupHeads.forEach((el,id)=>{el.hidden=folded.has(id)||!live.has(id);});
 const n=view==='list'?shownRows:visible.length;$('result-count').textContent=`${n} ${view==='list'?'track':'record'}${n===1?'':'s'}`;$('empty-state').hidden=n>0;$('hue-ruler').hidden=n===0||view==='list';
 document.dispatchEvent(new CustomEvent('catalog:filter',{detail:{records:visible,mode:'release',view}}));
}
search.addEventListener('input',applyFilters);$('clear-filters').addEventListener('click',()=>{search.value='';applyFilters();search.focus();});
document.addEventListener('keydown',e=>{const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);if(e.key==='/'&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&!typing){e.preventDefault();search.focus();}if(e.key==='Escape'&&!typing&&!panel.hidden)closePlayer();});
// Provider engine. Generation tokens reject callbacks that belong to previous media.
function stopProgress(){if(progressTimer){clearInterval(progressTimer);progressTimer=null;}}
function resetMedia(){generation++;dropShadow();panel.classList.remove('is-uncovered');mediaReady=false;stopProgress();duration=0;position=0;clearTimeout(coverTimer);coverTimer=null;holdCover=false;try{player?.destroy();}catch{}try{spotifyController?.destroy();}catch{}player=null;spotifyController=null;media.replaceChildren();setProgress(0,0);publishState('idle');}
function loadYoutubeApi(){if(window.YT?.Player)return Promise.resolve(window.YT);if(ytPromise)return ytPromise;ytPromise=new Promise(resolve=>{window.onYouTubeIframeAPIReady=()=>resolve(window.YT);const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.append(s);});return ytPromise;}
function loadSpotifyApi(){if(spotifyPromise)return spotifyPromise;spotifyPromise=new Promise(resolve=>{window.onSpotifyIframeApiReady=resolve;const s=document.createElement('script');s.src='https://open.spotify.com/embed/iframe-api/v1';document.head.append(s);});return spotifyPromise;}
function addIframe(r){const f=document.createElement('iframe');f.title=`${r.artist?`${r.artist} — `:''}${r.title}`;const url=new URL(srcOf(r));if(url.hostname==='www.youtube.com')url.searchParams.set('origin',location.origin);f.src=url.href;f.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';f.allowFullscreen=true;f.referrerPolicy='strict-origin-when-cross-origin';media.replaceChildren(f);return f;}
function next(delta){if(!queue.length)return;const position=queueIndex+delta;if(position<0||position>=queue.length)return;queueIndex=position;playItem(byId.get(queue[queueIndex]));}
function onEnded(){if(queueIndex+1<queue.length)next(1);}
const clock=s=>{s=Math.max(0,Math.floor(s||0));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
function setProgress(pos,dur){position=pos;duration=dur;const bar=$('progress'),dots=bar.children,n=dots.length;const ratio=dur>0?Math.min(1,pos/dur):0;for(let i=0;i<n;i++){const filled=i<Math.floor(ratio*n),head=i===Math.floor(ratio*n)&&dur>0;dots[i].className=head?'is-head':filled?'is-filled':'';}$('time-now').textContent=dur>0?clock(pos):'';$('time-total').textContent=dur>0?clock(dur):'';bar.setAttribute('aria-valuemax',String(Math.round(dur||0)));bar.setAttribute('aria-valuenow',String(Math.round(pos||0)));bar.setAttribute('aria-valuetext',dur>0?`${clock(pos)} of ${clock(dur)}`:'Position unknown');bar.classList.toggle('is-seekable',dur>0&&mediaReady);}
// Seeking goes through the provider that is actually playing; nothing moves until it reports the new position.
function seek(seconds){if(!mediaReady||!(duration>0))return false;const target=Math.max(0,Math.min(duration,seconds));try{if(spotifyController)spotifyController.seek(target);else if(player?.seekTo)player.seekTo(target,true);else return false;}catch{return false;}return true;}
$('progress').addEventListener('click',e=>{const bar=$('progress'),rect=bar.getBoundingClientRect();if(!(rect.width>0)||!(duration>0))return;seek((e.clientX-rect.left)/rect.width*duration);});
$('progress').addEventListener('keydown',e=>{const step=e.shiftKey?30:5;const map={ArrowRight:position+step,ArrowUp:position+step,ArrowLeft:position-step,ArrowDown:position-step,Home:0,End:duration};if(!(e.key in map))return;e.preventDefault();seek(map[e.key]);});
function mountMedia(r){resetMedia();forcePlate=false;mountedSrc=srcOf(r);const token=generation,spotify=mountedSrc.includes('spotify.com');media.classList.toggle('is-spotify',spotify);$('player-message').textContent='';$('media-cover').src=r.image;holdCover=spotify;
 // YouTube shows its picture at once: the frame is frosted by CSS until playback is confirmed (and again whenever it is not playing) and oversized so YouTube's own title bar and logo fall outside the box. Only Spotify sits behind the artwork.
 if(spotify)setCover(true);else{covered=false;$('media-cover').classList.add('is-off');panel.classList.add('is-uncovered');}
 if(!spotify){const f=addIframe(r);loadYoutubeApi().then(YT=>{if(token!==generation)return;player=new YT.Player(f,{events:{onReady:()=>{if(token===generation){mediaReady=true;publishState(playbackState);applyPlate();progressTimer=setInterval(()=>{if(token!==generation)return;const pos=player?.getCurrentTime?.(),dur=player?.getDuration?.();if(Number.isFinite(pos)&&Number.isFinite(dur))setProgress(pos,dur);},1000);}},onStateChange:e=>{if(token===generation&&shadow)syncShadow();if(token===generation)publishState(e.data===YT.PlayerState.PLAYING?'playing':e.data===YT.PlayerState.PAUSED?'paused':e.data===YT.PlayerState.BUFFERING?'buffering':'idle');if(token===generation&&e.data===YT.PlayerState.ENDED){if(new URL(mountedSrc).searchParams.has('list')){const playlist=e.target?.getPlaylist?.();const index=e.target?.getPlaylistIndex?.();if(playlist?.length&&index===playlist.length-1)onEnded();}else onEnded();}},onAutoplayBlocked:()=>{if(token===generation){publishState('paused');$('player-message').textContent='Press Play to begin listening.';}},onError:()=>{if(token!==generation)return;failed.add(mountedSrc);const next=srcOf(r);if(next&&next!==mountedSrc){mountMedia(r);if(next.includes('spotify.com'))$('player-message').textContent='The video will not play here, so this is the Spotify version.';try{updateDetails(r);}catch{}}else{publishState('idle');$('player-message').textContent='This recording is unavailable here. Choose another credit.';}}}});});
 }else{let mounted=false;const timeout=setTimeout(()=>{if(token!==generation||mounted)return;mounted=true;addIframe(r);holdCover=false;setCover(false);forcePlate=true;applyPlate();},3000);loadSpotifyApi().then(API=>{if(token!==generation||mounted)return;mounted=true;clearTimeout(timeout);const node=document.createElement('div');media.replaceChildren(node);const u=new URL(mountedSrc.includes('spotify.com')?mountedSrc:r.link);const parts=u.pathname.split('/').filter(Boolean);const uri=`spotify:${parts.at(-2)}:${parts.at(-1)}`;API.createController(node,{uri,width:'100%',height:152},controller=>{if(token!==generation){controller.destroy();return;}spotifyController=controller;controller.addListener('ready',()=>{if(token===generation){mediaReady=true;publishState(playbackState);}});let ended=false;controller.addListener('playback_update',e=>{const d=e.data;if(token===generation){publishState(d.isPaused===false&&d.isBuffering===false?'playing':d.isBuffering===true?'buffering':d.isPaused===true?'paused':'idle');if(d.duration>0)setProgress(d.position/1000,d.duration/1000);}if(token===generation&&!r.link.includes('/album/')&&d.duration>0&&d.position>=d.duration-200&&!ended){ended=true;publishState('idle');onEnded();}});controller.play();});});}
}
const releaseOf=r=>r.kind==='release'?r:records.find(record=>record.tracks.includes(r.id));

const compact=n=>n>=1e6?(n/1e6).toFixed(n>=1e7?0:1).replace(/\.0$/,'')+'M':n>=1e3?Math.round(n/1e3)+'K':String(n);
const provider=link=>link.includes('spotify.com')?'Spotify':link.includes('youtube')||link.includes('youtu.be')?'YouTube':'Muso.ai';
function updateDetails(r){const release=releaseOf(r),index=release?records.indexOf(release)+1:0,linked=release?.tracks?.map(id=>byId.get(id)).filter(Boolean)||[];
 $('playing-artwork').src=r.image;$('playing-title').textContent=r.title;$('playing-artist').textContent=[r.artist||'',release?.released||release?.year||''].filter(Boolean).join(' · ');$('playing-credit').textContent=r.credit;
 $('player-kind').textContent=`${r.embed?'Now playing':'Credit'} · ${String(index).padStart(3,'0')} / ${records.length}`;
 const at=linked.findIndex(t=>t.id===r.id);$('playing-track').textContent=r.kind==='track'?`Track ${r.trackNo||at+1} / ${release?.tracksOnRelease||linked.length}${release&&release.title!==r.title?` · ${release.title}`:''}`:r.embed?'':'Source link only';
 const bits=[`Source ${provider(srcOf(r)||r.link)}`];if(release?.releaseType)bits.push(release.releaseType);if(release?.label)bits.push(release.label);if(release?.tracksOnRelease)bits.push(`${release.tracksOnRelease} tracks · ${linked.length} credited`);else if(linked.length)bits.push(`${linked.length} credited track${linked.length===1?'':'s'}`);const streams=r.kind==='track'?r.streams:release?.streams;if(streams)bits.push(`${compact(streams)} Spotify streams`);$('playing-meta').textContent=bits.join(' · ');
 $('queue-position').textContent=queue.length>1?`${queueIndex+1} / ${queue.length}`:'';$('previous').disabled=queueIndex<=0;$('next').disabled=queueIndex>=queue.length-1;
 const full=(release?.tracklist||[]).filter(t=>t.trackId);
 if(full.length){const total=release?.tracksOnRelease||0,creditedCount=full.length;$('track-details').innerHTML=`<h3>${escape(release.title)}${total>creditedCount?` · ${total} tracks · ${creditedCount} credited`:` · ${creditedCount} track${creditedCount===1?'':'s'}`}</h3>`+full.map((t,i)=>{const hit=t.trackId?byId.get(t.trackId):null;const pos=t.position||'·';return hit?`<button class="detail-track${current?.id===hit.id?' is-active':''}" data-play="${escape(hit.id)}" data-release="${escape(release.id)}"><span>${pos}</span><span>${escape(hit.title)}<small>${escape(hit.credit)}${hit.streams?` · ${compact(hit.streams)} streams`:''}</small></span></button>`:`<p class="detail-track is-other"><span>${pos}</span><span>${t.title?escape(t.title):'—'}<small>Not credited</small></span></p>`;}).join('');}
 const also=release?foldedInto(release.id):[];
 const alsoHtml=also.map(f=>`<h3 class="also">Also released as ${escape(f.title)}${f.released?` · ${escape(f.released)}`:''}</h3>`+(f.tracks||[]).map(id=>byId.get(id)).filter(Boolean).map(t=>`<button class="detail-track${current?.id===t.id?' is-active':''}" data-play="${escape(t.id)}" data-release="${escape(f.id)}"><span>${t.trackNo||'·'}</span><span>${escape(t.title)}<small>${escape(t.credit)}${t.streams?` · ${compact(t.streams)} streams`:''}</small></span></button>`).join('')).join('');
 if(full.length){/* rendered above */}
 else if(linked.length){$('track-details').innerHTML=`<h3>${escape(release.title)} · ${linked.length} credited tracks</h3>`+linked.map((t,i)=>`<button class="detail-track${current?.id===t.id?' is-active':''}" data-play="${escape(t.id)}" data-release="${escape(release.id)}"><span>${i+1}</span><span>${escape(t.title)}<small>${escape(t.credit)}</small></span></button>`).join('');}
 else if(r.kind==='release'){$('track-details').innerHTML='';}else{$('track-details').innerHTML=`<p class="detail-note">Credit listed on <a href="${escape(r.sourceUrl||r.musoLink||data.muso.profileUrl)}" target="_blank" rel="noopener noreferrer">Muso.ai</a>${r.releaseDate?` · ${escape(r.releaseDate)}`:''}.</p>`;}
 if(alsoHtml)$('track-details').innerHTML+=alsoHtml;
 fitPlayer();onScroll();setTimeout(()=>{fitPlayer();onScroll();},0);
 document.dispatchEvent(new CustomEvent('player:change',{detail:{id:r.id,releaseId:release?.id,index}}));const shown=release&&folded.has(release.id)?folded.get(release.id):release?.id;document.querySelectorAll('[data-id]').forEach(el=>el.classList.toggle('is-active',el.dataset.id===r.id||el.dataset.id===shown));
}
document.addEventListener('player:toggle',()=>{if(!current?.embed||!mediaReady)return;try{if(playbackState==='playing'){if(spotifyController)spotifyController.pause();else player?.pauseVideo?.();}else{if(spotifyController)spotifyController.resume();else player?.playVideo?.();}}catch{}});
$('play-toggle').addEventListener('click',()=>document.dispatchEvent(new CustomEvent('player:toggle')));
function playItem(r){if(!r)return;panel.hidden=false;body.classList.add('has-player');onScroll();if(current?.id===r.id){updateDetails(r);publishState(playbackState);try{if(spotifyController)spotifyController.resume();else player?.playVideo?.();}catch{}return;}current=r;updateDetails(r);if(r.embed)mountMedia(r);else{resetMedia();forcePlate=false;media.classList.remove('is-spotify');$('media-cover').src=r.image;setCover(true);$('player-message').textContent='No listening link is listed for this credit. View the original credit on Muso.ai.';}applyPlate();}
function choose(id,trigger,releaseId,keyboard=false){let r=byId.get(id);if(!r)return;if(r.playTrackId){releaseId=r.id;r=byId.get(r.playTrackId);id=r.id;}lastTrigger=trigger||lastTrigger;let items=visible;
 if(releaseId){items=(byId.get(releaseId)?.tracks||[]).map(id=>byId.get(id)).filter(Boolean);}else if(!items.some(item=>item.id===id)){items=r.kind==='release'?records:tracks;}
 queue=r.embed?items.flatMap(item=>item.playTrackId?(item.tracks||[]).filter(id=>byId.get(id)?.embed):item.embed?[item.id]:[]):[r.id];queueIndex=queue.indexOf(id);playItem(r);if(keyboard)panel.focus({preventScroll:true});}
function inspect(id,trigger,keyboard=false){const r=byId.get(id);if(!r)return;lastTrigger=trigger||lastTrigger;queue=[r.id];queueIndex=0;playItem(r);if(keyboard)panel.focus({preventScroll:true});}
document.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;const play=e.target.closest('[data-play]');if(play){choose(play.dataset.play,play,play.dataset.release,e.detail===0);return;}const detail=e.target.closest('[data-detail]');if(detail)inspect(detail.dataset.detail,detail,e.detail===0);});
$('previous').addEventListener('click',()=>next(-1));$('next').addEventListener('click',()=>next(1));
function closePlayer(){resetMedia();current=null;forcePlate=false;covered=false;$('media-cover').classList.add('is-off');applyPlate();hold=null;setMinimized(false);body.style.removeProperty('--player');body.style.removeProperty('--k');body.style.removeProperty('--pad');document.dispatchEvent(new CustomEvent('player:change',{detail:{id:null,releaseId:null,index:0}}));panel.hidden=true;body.classList.remove('has-player');document.querySelectorAll('.is-active').forEach(el=>el.classList.remove('is-active'));if(lastTrigger?.isConnected&&!lastTrigger.closest('[hidden]'))lastTrigger.focus({preventScroll:true});else search.focus({preventScroll:true});}
$('player-close').addEventListener('click',closePlayer);
// The pinned player collapses with the scroll rather than in one step: its height tracks the distance scrolled (full at the top, the 92px band once the page has scrolled the difference), so the page scrolls into it and back out. --k (0 expanded … 1 band) lets the plate labels, spec and transport fade on the way; the band layout applies only at the end. Minimize and Expand hold their choice until the next return to the top (a Minimize at the top holds until Expand).
const MIN_H=92;let hold=null;
// The full panel is at least the base height (52vh, at most 560px) and grows to fit the whole tracklist, up to 92% of the window; a list longer than that gets exactly the remaining space and scrolls.
let fitH=0;const fullHeight=()=>{const vh=window.innerHeight||900;return Math.min(vh*.92,Math.max(Math.min(vh*.52,560),fitH||0));};
function fitPlayer(){if(panel.hidden||!pinned()||body.classList.contains('player-min'))return;const top=panel.querySelector('.top'),info=panel.querySelector('.info');if(!top||!info)return;const need=(top.scrollHeight||0)+(info.getBoundingClientRect().height-top.getBoundingClientRect().height)+40;fitH=Number.isFinite(need)&&need>0?Math.ceil(need):0;const td=$('track-details'),cap=Math.floor((window.innerHeight||900)*.92);if(td){if(fitH>cap){td.style.maxHeight=`${Math.max(120,cap-(fitH-(td.scrollHeight||0)))}px`;td.classList.add('is-scroll');}else{td.style.maxHeight='';td.classList.remove('is-scroll');}}}
function collapse(k){k=Math.max(0,Math.min(1,k));const on=k>=1,wasMin=body.classList.contains('player-min');if(on!==wasMin)body.classList.toggle('player-min',on);if(wasMin&&!on)fitPlayer();const full=fullHeight(),h=Math.round(full-(full-MIN_H)*k);body.style.setProperty('--player',`${h}px`);body.style.setProperty('--k',k.toFixed(3));body.style.setProperty('--pad',`${hold||body.classList.contains('is-away')?h:Math.round(full)}px`);if(box?.classList.contains('is-plate'))placeBox();}
function setMinimized(on){hold=on?'min':null;collapse(on?1:0);if(box?.classList.contains('is-plate'))setTimeout(placeBox,320);}
const pinned=()=>typeof matchMedia!=='function'||matchMedia('(min-width: 821px)').matches;
// The band re-expands on a click anywhere on it that is not a control (and from the screen-reader Expand button); the choice holds until the next return to the top. There is no manual Minimize: the collapse follows the scroll.
function expandPlayer(){hold='open';collapse(0);if(box?.classList.contains('is-plate'))setTimeout(placeBox,320);}
$('player-expand')?.addEventListener('click',expandPlayer);
panel.addEventListener('click',e=>{if(!body.classList.contains('player-min'))return;if(e.target.closest?.('button,a,input,[role=slider],#plate-modes'))return;expandPlayer();});
// Clicking the plate cycles Dots → Art → Video (skipping a disabled Video); the buttons still work on their own.
$('plate-frame')?.addEventListener('click',e=>{if(e.target.closest?.('#plate-modes')||body.classList.contains('player-min'))return;const bs=[...modes.querySelectorAll('[data-plate]')];const i=bs.findIndex(b=>b.dataset.plate===plateMode);for(let k=1;k<=bs.length;k++){const b=bs[(i+k)%bs.length];if(!b.disabled){b.click();break;}}});
function onScroll(){if(panel.hidden||!pinned()||body.classList.contains('is-away'))return;const y=window.scrollY||0;if(y<10&&hold==='open')hold=null;collapse(hold==='open'?0:hold==='min'?1:y/Math.max(1,fullHeight()-MIN_H));}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',()=>{fitPlayer();onScroll();});
// Verified YouTube view total, published by the hourly stats workflow. Hidden until a figure exists; drift between checks is labelled as an estimate.
let stats=null;const SP=data.spotify||{total:0};const thin=n=>Math.floor(n).toLocaleString('en-US').replace(/,/g,'\u2009');
function totalNow(){const now=Date.now();let total=SP.total||0,est=false;if(SP.ratePerSecond>0&&Number.isFinite(Date.parse(SP.checkedAt))){total+=SP.ratePerSecond*Math.max(0,(now-Date.parse(SP.checkedAt))/1000);est=true;}if(stats){total+=stats.total;if(stats.ratePerSecond>0){total+=stats.ratePerSecond*Math.max(0,(now-Date.parse(stats.checkedAt))/1000);est=true;}}return {total:Math.floor(total),est,exact:total};}
function renderTotal(){const {total,est}=totalNow();const parts=[`Spotify ${SP.when||''}`.trim()];let title=`Spotify play counts across ${SP.tracks||0} credited tracks, read on ${SP.when||SP.checkedAt}`;if(stats){const when=new Date(Date.parse(stats.checkedAt));const hhmm=`${String(when.getHours()).padStart(2,'0')}:${String(when.getMinutes()).padStart(2,'0')}`;parts.push(`YouTube ${hhmm}`);title+=`, plus ${stats.total.toLocaleString('en-US')} YouTube views across ${stats.videos} credited videos, verified ${when.toLocaleString()}`;}title+=est?'. Between readings the figure rises at the measured rate; it is an estimate until the next verified reading.':'.';document.querySelectorAll('[data-total]').forEach(el=>{el.textContent=thin(total);el.title=title;});document.querySelectorAll('[data-total-label]').forEach(el=>{el.textContent=`Streams · ${parts.join(' + ')}${est?' · est.':''}`;});}
function startCounter(){if(!document.querySelector('[data-total]'))return;SP.when=SP.when||(()=>{try{const d=new Date(Date.parse(SP.checkedAt));return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;}catch{return '';}})();let ticking=false,shown=-1,els=null;const calm=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;const rate=()=>(SP.ratePerSecond>0?SP.ratePerSecond:0)+(stats&&stats.ratePerSecond>0?stats.ratePerSecond:0);const count=()=>{const {total,exact}=totalNow();if(total!==shown){shown=total;const t=thin(total);(els||(els=[...document.querySelectorAll('[data-total]')])).forEach(el=>{el.textContent=t;});}const r=rate();setTimeout(count,r>0?Math.max(16,Math.min(1000,Math.ceil((Math.floor(exact)+1-exact)/r*1000)+1)):1000);};const tick=()=>{renderTotal();shown=totalNow().total;if(!ticking&&totalNow().est){ticking=true;setInterval(renderTotal,1000);if(!calm)count();}};tick();
 if(typeof fetch!=='function'||!data.statsUrl)return;const read=()=>fetch(data.statsUrl,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(s=>{if(!s||!(s.total>0)||!Number.isFinite(Date.parse(s.checkedAt||'')))return;if(!stats||Date.parse(s.checkedAt)>=Date.parse(stats.checkedAt))stats=s;tick();}).catch(()=>{});read();setInterval(read,300000);}
// List view: every credited track under its release, in the release's track order. Rows are the same play/credit controls as the tiles.
function rowsFor(r){const seen=new Set();return [...(r.tracklist||[]).map(t=>t.trackId).filter(Boolean),...(r.tracks||[])].filter(id=>!seen.has(id)&&seen.add(id)).map(id=>byId.get(id)).filter(Boolean);}
function buildList(){if(!list)return;list.innerHTML=records.map(r=>{const rows=rowsFor(r);const head=`<li class="group-head" data-id="${escape(r.id)}" data-release="${escape(r.id)}"><img src="${escape(r.image)}" alt="" width="40" height="40" loading="lazy" decoding="async"><span class="g-title">${escape(r.title)}<small>${escape(r.artist)}${r.released?` · ${escape(r.released.slice(0,4))}`:''}${r.releaseType?` · ${escape(r.releaseType)}`:''}</small></span><span class="g-count mono">${rows.length} credited</span></li>`;
 return head+rows.map((t,j)=>`<li class="row" data-id="${escape(t.id)}" data-release="${escape(r.id)}" data-pos="${j}" data-streams="${t.streams||0}"><button class="track" ${t.embed?'data-play':'data-detail'}="${escape(t.id)}" data-release="${escape(r.id)}" aria-label="${t.embed?'Listen to':'View credit for'} ${escape(t.artist)}, ${escape(t.title)}"><span class="c-no mono">${t.trackNo?String(t.trackNo).padStart(2,'0'):'—'}</span><img class="c-art" src="${escape(t.image||r.image)}" alt="" width="28" height="28" loading="lazy" decoding="async"><span class="c-title">${escape(t.title)}<small class="c-rel">${escape(t.artist)} · ${escape(r.title)}</small></span><span class="c-credit mono">${escape(t.credit)}</span><span class="c-year mono">${escape((t.releaseDate||r.released||'').slice(0,4))}</span><span class="c-streams mono">${t.streams?compact(t.streams):'—'}</span></button></li>`).join('');}).join('');
 list.querySelectorAll('.row').forEach(el=>trackRows.set(el.dataset.id,el));list.querySelectorAll('.group-head').forEach(el=>groupHeads.set(el.dataset.id,el));}
function setView(v){view=v==='list'?'list':'grid';placeModule();wall.hidden=view!=='grid';if(list)list.hidden=view!=='list';if(catalog)catalog.dataset.view=view;$('view-group')?.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));try{sessionStorage.setItem(VIEW_KEY,view);}catch{}applyFilters();}
$('view-group')?.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)setView(b.dataset.view);});
// The display's six frames: a random pick from the pool on each visit, then single frames swap out for unused ones at staggered, randomised intervals (8 to 20 s apart). Reduced motion keeps the first pick.
(function liveFrames(){const box=$('d-frames');if(!box)return;const all=[...box.querySelectorAll('.fr')];const n=Math.min(+box.dataset.show||6,all.length);if(all.length<=n)return;
 const grp=i=>all[i].dataset.g||'';const clash=(i,set)=>!!grp(i)&&set.some(j=>j!==i&&grp(j)===grp(i));
 const shuffled=all.map((el,i)=>[Math.random(),i]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);let shown=[],spare=[];for(const i of shuffled){if(shown.length<n&&!clash(i,shown))shown.push(i);else spare.push(i);}shown.sort((a,b)=>a-b);
 const apply=()=>{all.forEach((el,i)=>{const on=shown.includes(i);el.classList.toggle('is-on',on);if(on){const img=el.querySelector('img');if(img)img.loading='eager';}});
  // keep grid order equal to slot order: each shown frame takes the CSS order of its slot
  shown.forEach((i,slot)=>all[i].style.order=String(slot));};
 apply();box.classList.add('is-picked');
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced||typeof document.hidden==='undefined')return;
 const tick=()=>{if(!document.hidden&&spare.length){const slot=Math.floor(Math.random()*n);const outgoing=shown[slot];const rest=shown.filter((_,s)=>s!==slot);const ok=spare.map((v,k)=>k).filter(k=>!clash(spare[k],rest));if(!ok.length){setTimeout(tick,8000+Math.random()*12000);return;}const k=ok[Math.floor(Math.random()*ok.length)];const incoming=spare[k];spare[k]=outgoing;shown[slot]=incoming;const el=all[incoming];const img=el.querySelector('img');if(img)img.loading='eager';const out=all[outgoing];{const b=box.getBoundingClientRect(),o=out.getBoundingClientRect();out.style.setProperty('--l',`${o.left-b.left}px`);out.style.setProperty('--t',`${o.top-b.top}px`);out.style.setProperty('--w',`${o.width}px`);out.style.setProperty('--h',`${o.height}px`);}out.classList.remove('is-on');out.style.order='';out.classList.add('is-out');setTimeout(()=>{out.classList.remove('is-out');for(const k of['--l','--t','--w','--h'])out.style.removeProperty(k);},1300);el.style.order=String(slot);el.classList.remove('is-on');void el.offsetWidth;el.classList.add('is-on');}
  setTimeout(tick,3500+Math.random()*4500);};
 setTimeout(tick,2500+Math.random()*3000);})();
// About and Contact open inside this page so a playing record keeps playing: the other page's header and main are fetched and shown in place of the display and catalogue, with the player kept (minimized) above them. Direct loads of /about/ and /contact/ are still their own pages.
const ROUTES={'/about/':'About','/contact/':'Contact','/start/':'Start a project'};const routeBox=document.createElement('div');routeBox.id='route';routeBox.hidden=true;const cat=$('records');if(cat?.parentElement)cat.parentElement.insertBefore(routeBox,cat.nextSibling);else document.body.append(routeBox);const pageCache={};let routeToken=0;
function markNav(path){document.querySelectorAll('.nav a').forEach(a=>{const here=(a.getAttribute('href')||'')===path;if(here)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
async function loadRoute(path){let html=pageCache[path];if(!html){const r=await fetch(path,{credentials:'same-origin',cache:'no-cache'});if(!r.ok)throw 0;html=await r.text();pageCache[path]=html;}const tmp=document.createElement('div');tmp.innerHTML=html;return [tmp.querySelector('.site-header'),tmp.querySelector('main')].filter(Boolean);}
function showRoute(path,nodes,push){routeBox.replaceChildren(...nodes);routeBox.dataset.page=path.replace(/\//g,'');routeBox.hidden=false;body.classList.add('is-away');const d=$('display');if(d)d.hidden=true;if(cat)cat.hidden=true;hideHoverPlate();
 if(!panel.hidden)collapse(1);document.title=`${ROUTES[path]} | Justin Bartlett | Recording | Mixing | Mastering`;markNav(path);if(push)history.pushState({path},'',path);window.scrollTo(0,0);}
async function goAway(path,push){const token=++routeToken;let nodes;try{nodes=await loadRoute(path);}catch{location.href=path;return;}if(token!==routeToken)return;showRoute(path,nodes,push);}
function goHome(push){routeToken++;routeBox.hidden=true;routeBox.replaceChildren();body.classList.remove('is-away');const d=$('display');if(d)d.hidden=false;if(cat)cat.hidden=false;document.title='Justin Bartlett | Recording | Mixing | Mastering';markNav('/');if(push)history.pushState({path:'/'},'','/');window.scrollTo(0,0);onScroll();}
// Transmute: clicking a display photograph turns it, in place and at its own size, into its midtone dots (the middle third of its tones, as on the plates); the dots then leave as snakes (short chains crawling cell by cell along the grid with right-angle turns, the body following the head's path) while the black display grows to the About hero's height, and About takes over beneath at the same height, the portrait and its header fading in, so the black screen becomes the hero rather than one page replacing another. Dots turn to ink once they cross onto the paper. A photograph on the wall dissolves where it sits, in the same dots and snakes at the same dot size, and the black opens out from the photograph itself over the sleeves to the About hero's place at the top of the window, so it is still the black that becomes the hero; the Records page is black, so its dots stay light until About's paper arrives. Reduced motion, or no canvas, goes straight to About.
let dissolving=false;
const heroHeight=()=>{const vh=window.innerHeight||900;return (window.innerWidth||1440)<=820?Math.max(360,vh*.7):Math.max(420,Math.min(760,vh*.82));};
function dissolveInto(fr,href){if(dissolving)return;const img=fr?.querySelector('img'),disp=$('display');const cv=document.createElement('canvas');const still=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;if(!img||!disp||!cv.getContext||still){goAway(href,true);return;}
 const ctx=cv.getContext('2d');if(!ctx){goAway(href,true);return;}dissolving=true;const token=++routeToken;const loading=loadRoute(href).catch(()=>null);const inWall=!disp.contains(fr);if(!inWall)window.scrollTo({top:0,behavior:'instant'});
 const dpr=Math.min(2,window.devicePixelRatio||1),W=window.innerWidth,H=window.innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=`${W}px`;cv.style.height=`${H}px`;cv.className='dissolve';cv.setAttribute('aria-hidden','true');document.body.append(cv);ctx.scale(dpr,dpr);
 const r=fr.getBoundingClientRect(),COLS=inWall?Math.max(18,Math.min(56,Math.round(r.width/5))):56,ROWS=Math.max(8,Math.round(COLS*r.height/r.width)),c=r.width/COLS;
 const sc=document.createElement('canvas');sc.width=COLS;sc.height=ROWS;const sx=sc.getContext('2d');let lum=null;try{const nw=img.naturalWidth||img.width,nh=img.naturalHeight||img.height;const pos=(img.style.objectPosition||'center 38%').split(/\s+/).map(v=>v==='center'?50:v==='top'||v==='left'?0:v==='bottom'||v==='right'?100:parseFloat(v)||50);const scale=Math.max(r.width/nw,r.height/nh),cw=r.width/scale,ch=r.height/scale,ox=(nw-cw)*(pos[0]/100),oy=(nh-ch)*((pos[1]??50)/100);sx.drawImage(img,ox,oy,cw,ch,0,0,COLS,ROWS);const d=sx.getImageData(0,0,COLS,ROWS).data;lum=new Float32Array(COLS*ROWS);let lo=1,hi=0;for(let i=0;i<COLS*ROWS;i++){const v=(.2126*d[i*4]+.7152*d[i*4+1]+.0722*d[i*4+2])/255;lum[i]=v;if(v<lo)lo=v;if(v>hi)hi=v;}const span=Math.max(.05,hi-lo);for(let i=0;i<lum.length;i++)lum[i]=(lum[i]-lo)/span;}catch{lum=null;}
 if(!lum){lum=new Float32Array(COLS*ROWS);for(let i=0;i<lum.length;i++)lum[i]=.5;}
 // Midtones only, as on the plates: a cell is lit when its darkness falls in the middle third; nothing else is drawn. Snakes: each row's runs of lit cells are cut into chains of up to seven, and about half of those of three cells or more are kept (the rest of the dots simply stay and fade with the frame). After its delay a chain moves one cell per tick along the grid, turning a right angle now and then (never back on itself), the body following the head's path exactly, and fades as it goes: dotted segments crawling off in every direction on the same grid the picture was drawn on.
 const seed=(a,b)=>((a*73+b*151)%97)/97,lit=i=>{const d=1-lum[i];return d>=.33&&d<.66;},DIRS=[[1,0],[0,1],[-1,0],[0,-1]],snakes=[];
 for(let y=0;y<ROWS;y++){let run=[];const flush=()=>{for(let k=0;k<run.length;k+=7){const xs=run.slice(k,k+7);const x0=xs[0],s0=seed(x0,y),s1=seed(y,x0);if(xs.length<3||seed(x0+5,y+11)<.5)continue;const cells=xs.map(x=>[x,y]);if(s0<.5)cells.reverse();snakes.push({cells,dir:Math.floor(s1*4),tick:34+26*seed(x0+3,y+5),turn:.14+.16*seed(x0+9,y+1),delay:300+520*seed(x0+2,y+7),next:0,n:0});}run=[];};for(let x=0;x<COLS;x++){if(lit(y*COLS+x))run.push(x);else flush();}flush();}
 fr.classList.add('is-dots');body.classList.add('is-dissolving');const h0=disp.getBoundingClientRect().height,h1=heroHeight();if(!inWall)disp.style.height=`${h0}px`;
 // On the wall the black is drawn on the canvas: from the photograph's own rectangle to the hero's (the top of the window, full width, the hero's height), on the display's own curve and timing.
 const ease=x=>{let lo=0,hi=1,t=x;for(let k=0;k<24;k++){t=(lo+hi)/2;const u=1-t,bx=3*u*u*t*.65+3*u*t*t*.3+t*t*t;if(bx<x)lo=t;else hi=t;}const u=1-t;return 3*u*t*t+t*t*t;},blackAt=t=>{const p=ease(Math.min(1,Math.max(0,(t-360)/1000)));return {x:r.left*(1-p),y:r.top*(1-p),w:r.width+(W-r.width)*p,h:r.height+(h1-r.height)*p};};
 const start=performance.now();let swapped=false,released=false;const release=()=>{if(released)return;released=true;routeBox.classList.remove('is-arriving');};
 if(!inWall)setTimeout(()=>{disp.style.transition='height 1000ms cubic-bezier(.65,0,.3,1)';disp.style.height=`${h1}px`;},360);
 const swap=async()=>{if(swapped)return;swapped=true;const nodes=await loading;if(token!==routeToken){cv.remove();return;}if(!nodes){location.href=href;return;}routeBox.classList.add('is-arriving');if(inWall)window.scrollTo({top:0,behavior:'instant'});showRoute(href,nodes,true);disp.style.height='';disp.style.transition='';fr.classList.remove('is-dots');body.classList.remove('is-dissolving');if(!cv.isConnected)requestAnimationFrame(()=>requestAnimationFrame(release));};
 setTimeout(swap,1380);
 // The portrait is held back (#route.is-arriving) until every snake has faded or left the window, so the picture never loads in behind them.
 const rest=[];for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(lit(y*COLS+x))rest.push([x,y]);const inSnake=new Set(snakes.flatMap(sn=>sn.cells.map(([x,y])=>y*COLS+x)));const restDots=rest.filter(([x,y])=>!inSnake.has(y*COLS+x));
 const rad=c*.36,frame=now=>{const t=now-start;ctx.clearRect(0,0,W,H);const dark=(swapped?(routeBox.querySelector('.hero')||disp):disp).getBoundingClientRect().bottom;let alive=0;
  const bk=inWall&&!swapped?blackAt(t):null;if(bk){ctx.globalAlpha=1;ctx.fillStyle='#0e0e0d';ctx.fillRect(bk.x,bk.y,bk.w,bk.h);}const onBlack=(x,y)=>inWall&&!swapped?true:y<dark;
  {const sa=Math.max(0,1-Math.max(0,t-520)/380);if(sa>0){ctx.globalAlpha=sa;for(const [gx,gy] of restDots){const x=r.left+gx*c+c/2,y=r.top+gy*c+c/2;ctx.fillStyle=onBlack(x,y)?'#ecebe7':'#141412';ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();}alive++;}}
  for(const sn of snakes){const a=t-sn.delay;if(a>0){if(sn.next===0)sn.next=a;while(a>=sn.next){sn.next+=sn.tick;sn.n++;const r0=seed(sn.n*7+sn.cells.length,sn.dir+sn.n*3);if(r0<sn.turn)sn.dir=(sn.dir+(r0<sn.turn/2?1:3))%4;const h=sn.cells[0],d=DIRS[sn.dir];sn.cells.unshift([h[0]+d[0],h[1]+d[1]]);sn.cells.pop();}}
   const alpha=a<=0?1:Math.max(0,1-Math.max(0,a-160)/420);if(alpha<=0)continue;ctx.globalAlpha=alpha;for(const [gx,gy] of sn.cells){const x=r.left+gx*c+c/2,y=r.top+gy*c+c/2;if(x<-8||x>W+8||y<-8||y>H+8)continue;alive++;ctx.fillStyle=onBlack(x,y)?'#ecebe7':'#141412';ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();}}
  ctx.globalAlpha=1;if(swapped&&alive===0)release();if(cv.isConnected&&t<3000&&!(swapped&&alive===0))requestAnimationFrame(frame);else{cv.remove();dissolving=false;if(!swapped)swap().then(release);else release();}};
 requestAnimationFrame(frame);}
function hideHoverPlate(){const h=$('hover-plate');if(h){h.hidden=true;h.classList.remove('is-on');}}
document.addEventListener('click',e=>{if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button)return;const a=e.target.closest('a[href]');if(!a)return;const href=a.getAttribute('href');if(a.classList.contains('fr-link')){e.preventDefault();dissolveInto(a.closest('.fr'),href);return;}if(href in ROUTES){e.preventDefault();goAway(href,true);}else if(href==='/'&&body.classList.contains('is-away')){e.preventDefault();goHome(true);}});
window.addEventListener('popstate',e=>{const path=e.state?.path||location.pathname;if(path in ROUTES)goAway(path,false);else goHome(false);});
if(location.pathname in ROUTES)goAway(location.pathname,false);else history.replaceState({path:'/'},'',location.pathname);
// Radio: the records page plays twenty seconds of a random credited song at a time, from the moment it opens, muted, each from a point inside the middle of the song (drawn from the sheet's track length). Sound on (the orange chip on the tag, or a click anywhere on the collage) unmutes it and gives the song its full twenty seconds again; Sound off mutes it. Stations are the tracks whose listening link is a single YouTube video carrying that song alone. The video plays in a screen on the collage's pile: at each new station it pops up on top in a new place, overlapping and offset from the last, and a black-and-white still of the song before stays behind where it was. While it plays, new prints land over its edges, never covering more than a fifth of it; the controls (the song, Sound on, Next) sit in a bar along the bottom of the collage, on top of everything. When a new song pops up, the one before keeps playing, muted, where it was, until a print slides over it and it stops. Behind the whole box a second, silent copy of the playing song runs enlarged under frosted glass. Two players take turns: the next song loads and plays hidden and muted for a few seconds before it is shown, so YouTube's start-up overlay has cleared by the time it appears, and the switch is instant; the pointer never reaches the video, so YouTube's hover overlay never shows. A needle on the ruler above the wall runs to the record's place on the spectrum and its sleeve lights up. The page opens on the collage alone; the first song joins after a few seconds. Muted, it plays only while at least half the collage is on screen and the tab is in front, and starts again with a new song when it comes back; with the sound on it keeps going as the visitor scrolls. Under reduced motion, or when the browser will not play it, the screen waits with a song cued (its picture) and Listen starts it with the sound on. Opening a record or leaving the page ends it; it starts again muted on the way back.
(()=>{const box=$('radio');if(!box)return;
 const CLIP=20,XF=3.2,TAG=28,LEAD=3.2,PREP=7.5,GOING=5000,TUCK=1800;
 const secs=v=>{const m=String(v||'').match(/^(\d+):(\d{2})$/);return m?(+m[1])*60+(+m[2]):0;};
 const vidOf=u=>{const x=String(u||'');return x.includes('list=')?'':(x.match(/youtube\.com\/embed\/([\w-]{11})/)||[])[1]||'';};
 const norm=t=>String(t||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
 const homeOf=new Map();records.forEach(r=>(r.tracks||[]).forEach(id=>{if(!homeOf.has(id))homeOf.set(id,r.id);}));
 const byVid=new Map();tracks.forEach(t=>{const v=vidOf(t.embed);if(v){if(!byVid.has(v))byVid.set(v,[]);byVid.get(v).push(t);}});
 const stations=[...byVid.entries()].filter(([,ts])=>ts.every(t=>norm(t.title)===norm(ts[0].title))).map(([v,ts])=>({v,t:ts[0],len:secs(ts[0].length),home:homeOf.get(ts[0].id)}));
 if(!stations.length){box.hidden=true;return;}
 const q=id=>$(id),el={video:q('radio-video'),poster:q('radio-poster'),title:q('radio-title'),sub:q('radio-sub'),count:q('radio-count'),needle:q('radio-needle'),play:q('radio-play'),skip:q('radio-skip'),full:q('radio-full')};
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 let state='off',muted=true,blocked=reduced,inView=false,cur=null,clipAt=0,tuneAt=0,movedAt=0,lastCt=-1,timer=0,swapAt=0,want=false,bag=[],last=null;const failed=new Set();
 const busy=()=>body.classList.contains('has-player')||body.classList.contains('is-away')||body.classList.contains('is-dissolving');
 // Where the screen goes: inside the clear part of the collage, as large as it allows and at least 356 × 200 (YouTube's smallest), and offset from where it last was. The collage is told, so its prints can land over it.
 let vrect=null;const frame=()=>document.getElementById('d-show');
 const zoneBox=()=>{const b=frame();if(!b)return null;const W=b.clientWidth,H=b.clientHeight;if(!W||!H)return null;
  // The clear part of the frame, under the frosted band: the collage's own box.
  const br=b.getBoundingClientRect(),hr=(b.parentElement||b).getBoundingClientRect();return {W,H,X0:Math.max(0,hr.left-br.left),Y0:Math.max(0,hr.top-br.top),ZW:Math.min(W,hr.width||W),ZH:Math.min(H,hr.height||H)};};
 const placeScreen=()=>{const z=zoneBox();if(!z)return;const {W,H,X0,Y0,ZW,ZH}=z,crowd=ago.length>0;
  // Large: up to the full height of the clear part and most of its width (the controls bar may lie over its lower edge); a little smaller while earlier songs are still showing, so they have room.
  let w=Math.min(ZW,Math.max(356,Math.min(ZW*(crowd?.7+Math.random()*.1:.86),ZH*16/9))),h=w*9/16;if(h<200){h=200;w=Math.min(ZW,h*16/9);}
  const maxX=Math.max(0,ZW-w),maxY=Math.max(0,ZH-h);let x=X0+Math.random()*maxX,y=Y0+Math.random()*maxY;
  // A new song goes to the far side from the last, so the earlier ones show beside it.
  if(vrect){const fx=Math.random()*(crowd?.06:.25),fy=Math.random()*.3;x=vrect.x<X0+maxX/2?X0+maxX*(1-fx):X0+maxX*fx;y=vrect.y<Y0+maxY/2?Y0+maxY*(1-fy):Y0+maxY*fy;}
  vrect={x,y,w,h,W,H};box.style.setProperty('--vx',(x/W*100).toFixed(2)+'%');box.style.setProperty('--vy',(y/H*100).toFixed(2)+'%');box.style.setProperty('--vw',(w/W*100).toFixed(2)+'%');tuck(z);};
 // The earlier songs still showing shrink and slide, under the new screen, to whichever corners or edges leave most of them in view: the one just before about half the clear part's width, the one before that about a third. They keep their place in the pile.
 const coverR=(r,over)=>{let hit=0;for(let a=0;a<10;a++)for(let b=0;b<6;b++){const x=r[0]+r[2]*(a+.5)/10,y=r[1]+r[3]*(b+.5)/6;if(over.some(o=>x>=o[0]&&x<=o[0]+o[2]&&y>=o[1]&&y<=o[1]+o[3]))hit++;}return hit/60;};
 const tuck=z=>{if(!vrect)return;const {W,H,X0,Y0,ZW,ZH}=z,taken=[[vrect.x,vrect.y,vrect.w,vrect.h]];
  ago.slice().reverse().forEach((o,i)=>{const hm=o.home;if(!o.el||!hm)return;const vw=Math.min(hm.w,ZW*((i?.34:.46)+Math.random()*.04)),vh=vw*9/16;let best=null;
   for(let t=0;t<9;t++){const x=X0+(ZW-vw)*(t%3)/2,y=Y0+(ZH-vh)*Math.floor(t/3)/2,r=[x,y,vw,vh];let sc=1-coverR(r,taken);if(o.rect)sc-=Math.hypot(o.rect.x-x,o.rect.y-y)/(ZW+ZH)*.15;sc+=Math.random()*.04;if(!best||sc>best.sc)best={sc,x,y};}
   const st=o.el.style;st.setProperty('--ts',(vw/hm.w).toFixed(4));st.setProperty('--tx',((best.x-hm.x)/hm.w*100).toFixed(2)+'%');st.setProperty('--ty',((best.y-hm.y)/hm.h*100).toFixed(2)+'%');
   o.rect={x:best.x,y:best.y,w:vw,h:vh,W,H};taken.push([best.x,best.y,vw,vh]);});
  keepTell();};
 const keepTell=()=>{const c=frame()?._collage;if(c?.keep)c.keep(ago.filter(o=>o.rect).map(o=>pct(o.rect)));};
 const tellCollage=()=>{const c=frame()?._collage;if(!c)return;const on=vrect&&state!=='off';c.vid(on?[vrect.x/vrect.W*100,vrect.y/vrect.H*100,vrect.w/vrect.W*100,vrect.h/vrect.H*100]:null,on?[vrect.x/vrect.W*100,vrect.y/vrect.H*100,vrect.w/vrect.W*100,vrect.h/vrect.H*100]:null);};
 const pct=r=>[r.x/r.W*100,r.y/r.H*100,r.w/r.W*100,r.h/r.H*100];
 const leaveStill=(x,r=vrect)=>{const c=frame()?._collage;if(!c||!r||!x)return;c.still(`https://i.ytimg.com/vi/${x.v}/hqdefault.jpg`,`Still from ${x.t.title}`,[x.t.title,x.t.artist].filter(Boolean).join(' · '),pct(r));};
 const label=()=>{const going=state==='on'||state==='tuning';if(el.play){el.play.textContent=!going?'▶︎ Listen':muted?'Sound on':'Sound off';el.play.setAttribute('aria-pressed',String(going&&!muted));el.play.classList.toggle('is-call',!going||muted);}if(el.full)el.full.hidden=!cur||!going||muted;};
 const setState=v=>{state=v;box.dataset.state=v;label();if(el.skip)el.skip.disabled=!(v==='on'||v==='tuning');tellCollage();};
 const fill=n=>[...(el.count?.children||[])].forEach((d,i)=>d.classList.toggle('is-filled',i<n));
 const pick=()=>{if(!bag.length)bag=stations.filter(x=>!failed.has(x.v)).map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);let x=bag.pop();if(x&&last&&x.v===last.v&&bag.length)x=bag.pop();return x||null;};
 const startFor=x=>{const L=x.len;if(L>CLIP+30){const lo=Math.max(20,L*.28),hi=Math.max(lo,Math.min(L*.62,L-CLIP-10));return Math.round(lo+Math.random()*(hi-lo));}return L>CLIP+4?Math.round((L-CLIP)/2):0;};
 // Where a record sits on the dial: under Hue, its column and row on the wall (the spectrum runs left to right); under the other sorts, its place in the order.
 const posOf=id=>{const tile=tiles.get(id);if(!tile)return .5;const cols=Math.max(1,wallColumns()),gc=parseInt(tile.style.getPropertyValue('grid-column'),10),gr=parseInt(tile.style.getPropertyValue('grid-row'),10);
  if(wall.dataset.sort==='hue'&&gc){let rows=1;tiles.forEach(t=>{if(t.style.getPropertyValue('grid-column')===String(gc))rows=Math.max(rows,parseInt(t.style.getPropertyValue('grid-row'),10)||1);});return Math.min(1,Math.max(0,(gc-1+((gr||1)-.5)/rows)/cols));}
  let max=1;tiles.forEach(t=>{max=Math.max(max,+t.style.getPropertyValue('order')||0);});return Math.min(1,Math.max(0,(+tile.style.getPropertyValue('order')||0)/max));};
 // Four players: the live one, the two songs before it (still playing, muted, shrunk into the corners), and the next one loading out of sight. Each keeps its song, where it starts, and when it began playing.
 const slots=[0,1,2,3].map(i=>({i,el:null,yt:null,vol:0,fT:0,x:null,startAt:0,since:0,sought:false,code:-1,at:0,mk:false,rect:null,home:null,gt:0,gx:null,buried:false,tp:null}));let live=null,nxt=null;const ago=[];
 const keepN=()=>typeof matchMedia==='function'&&matchMedia('(min-width: 821px)').matches?2:1;
 const showing=s=>s===live||ago.includes(s)||!!s.el?.classList.contains('is-going');
 const other=()=>{if(!nxt||showing(nxt))nxt=slots.find(s=>!showing(s))||ago[0]||slots.find(s=>s!==live);return nxt;};
 const host=s=>{if(!s.el){s.el=document.createElement('div');s.el.className='radio-slot';const edge=document.createElement('i');edge.className='radio-edge';edge.setAttribute('aria-hidden','true');s.el.append(edge);el.video?.append(s.el);}return s.el;};
 const ready=(s,lead)=>!!s&&!!s.x&&s.code===1&&s.since>0&&performance.now()-s.since>=lead*1000;
 // Each player's volume is faded on its own, on equal-power curves, so one song crosses into the next (the old one down while the new one comes up). The screen's glass edge follows its volume (--v). A player faded out is muted (and its volume left alone: YouTube unmutes a player whose volume is set).
 const level=(s,v)=>{s.vol=v;try{s.yt?.setVolume?.(v);}catch{}s.el?.style.setProperty('--v',(v/100).toFixed(3));};
 const quiet=s=>{clearInterval(s.fT);s.fT=0;s.vol=0;try{s.yt?.mute?.();}catch{}s.el?.style.setProperty('--v','0');};
 const fade=(s,to,ms,then)=>{clearInterval(s.fT);s.fT=0;if(!s.yt?.setVolume){then?.();return;}const from=s.vol||0,t0=performance.now(),up=to>from;
  s.fT=setInterval(()=>{const k=Math.min(1,(performance.now()-t0)/Math.max(1,ms)),e=up?Math.sin(k*Math.PI/2):1-Math.cos(k*Math.PI/2);level(s,Math.round(from+(to-from)*e));if(k>=1){clearInterval(s.fT);s.fT=0;then?.();}},40);};
 const hush=()=>slots.forEach(quiet);
 // The tag and the dial: the song, who it is by and the credit; the needle and the sleeve on air.
 const show=x=>{if(el.title)el.title.textContent=x.t.title;if(el.sub)el.sub.textContent=[x.t.artist,x.t.credit].filter(Boolean).join(' · ');
  if(el.poster){el.poster.src=`https://i.ytimg.com/vi/${x.v}/hqdefault.jpg`;el.poster.alt='';el.poster.hidden=false;}
  if(el.needle){el.needle.hidden=false;el.needle.style.left=`${(posOf(x.home)*100).toFixed(2)}%`;}tiles.forEach(t=>t.classList.toggle('is-on-air',t.dataset.id===x.home));
  };
 // Each screen has its own place and its own height in the pile, so the song before can stay where it was while the new one pops up on top somewhere else.
 const seat=s=>{const r=vrect;if(!r||!s.el)return;s.rect=r;s.home=r;const st=s.el.style,[x,y,w]=pct(r);['--ts','--tx','--ty'].forEach(k=>st.removeProperty(k));st.setProperty('--x',x.toFixed(2)+'%');st.setProperty('--y',y.toFixed(2)+'%');st.setProperty('--w',w.toFixed(2)+'%');const c=frame()?._collage;if(c)st.setProperty('--z',String(c.raise()));};
 // The songs before keep playing, muted; when a third comes along (or one runs out), a print slides over the oldest (just under the new screen), and once it is covered it stops. With no print to hand it freezes into its still instead.
 const end=o=>{clearTimeout(o.gt);o.gt=0;const k=ago.indexOf(o);if(k>=0)ago.splice(k,1);o.el?.classList.remove('is-going');if(o!==live)try{o.yt?.pauseVideo();}catch{}};
 const retire=(o,ms)=>{clearTimeout(o.gt);o.buried=false;const k=ago.indexOf(o);if(k>=0)ago.splice(k,1);const r=o.rect;o.gt=setTimeout(()=>{const c=frame()?._collage;if(c&&r&&c.bury(pct(r))){o.buried=true;o.gt=setTimeout(()=>end(o),650);}else{leaveStill(o.gx,r);o.buried=true;end(o);}keepTell();},ms);};
 // Behind the whole box (wide screens), a second, silent copy of the playing song, enlarged and frosted.
 const amb=document.getElementById('d-amb'),ambOn=()=>!!amb&&typeof matchMedia==='function'&&matchMedia('(min-width: 821px)').matches;
 // The frosted copy plays small (400 × 225) and is scaled up to cover the window, so the heavy frosting is cheap and YouTube sends a small stream.
 const fitAmb=()=>{if(amb&&typeof innerWidth==='number'&&innerWidth>0)amb.style.setProperty('--ambk',(Math.max(innerWidth/400,innerHeight/225)*1.15).toFixed(3));};fitAmb();if(typeof window!=='undefined')window.addEventListener?.('resize',fitAmb);
 const tws=[0,1].map(()=>({el:null,tw:null,mk:false,owner:null})),T=s=>s.tp&&s.tp.owner===s?s.tp:null;
 const twin=(s,x)=>{if(!ambOn())return;let t=T(s);if(!t){t=tws.find(u=>!u.owner)||tws.find(u=>u.owner!==live);if(!t)return;if(t.owner)t.owner.tp=null;t.owner=s;s.tp=t;}
  if(!t.el){t.el=document.createElement('div');t.el.className='radio-amb';amb.append(t.el);}t.el.classList.remove('is-live');
  if(t.tw){try{t.tw.mute();t.tw.loadVideoById({videoId:x.v,startSeconds:s.startAt});}catch{}return;}if(t.mk)return;t.mk=true;
  loadYoutubeApi().then(YT=>{const holder=document.createElement('div');t.el.replaceChildren(holder);
   t.tw=new YT.Player(holder,{width:'100%',height:'100%',videoId:x.v,playerVars:{autoplay:1,mute:1,start:s.startAt,controls:0,playsinline:1,rel:0,iv_load_policy:3,cc_load_policy:0,disablekb:1,fs:0,modestbranding:1,origin:location.origin},
    events:{onReady:e=>{try{e.target.mute();const o=t.owner;if(!o||!o.x){e.target.pauseVideo();return;}if(o.x.v!==x.v)e.target.loadVideoById({videoId:o.x.v,startSeconds:o.startAt});else e.target.playVideo();}catch{}},onStateChange:e=>{if(e.data===1)noCaptions(t.tw);}}});});};
 const untwin=s=>{const t=T(s);if(!t)return;try{t.tw?.pauseVideo?.();}catch{}t.el?.classList.remove('is-live');t.owner=null;s.tp=null;};
 // YouTube's captions (which it turns on by itself for a muted video) are switched off as soon as a song plays.
 const noCaptions=p=>{try{p.unloadModule?.('captions');p.unloadModule?.('cc');}catch{}};
 const onState=(s,code)=>{s.code=code;if(code===1)noCaptions(s.yt);
  if(code===1&&!s.since){const p=s.yt,ct=p.getCurrentTime?.()||0,dur=p.getDuration?.()||0;
   // The sheet's length is the song's; a video can run longer (an intro, a skit) or the length can be missing, so once the video reports its own duration a start outside its middle is moved there, still hidden.
   if(!s.sought&&dur>CLIP+20&&(s.startAt<dur*.2||s.startAt>dur-CLIP-5)){s.sought=true;s.startAt=Math.round(dur*(.3+Math.random()*.25));try{p.seekTo(s.startAt,true);T(s)?.tw?.seekTo?.(s.startAt,true);}catch{}return;}
   if(!s.sought&&s.startAt>3&&ct<s.startAt-3){s.sought=true;try{p.seekTo(s.startAt,true);T(s)?.tw?.seekTo?.(s.startAt,true);}catch{}return;}
   s.since=performance.now();}
  if(code===2||code===5||code===-1){if(s!==live)s.since=0;}
  // An earlier song that runs out, or that YouTube pauses, is covered straight away, before YouTube's end or pause screen can show.
  if((code===0||code===2)&&s!==live&&ago.includes(s))retire(s,0);
  if(s===live&&state==='on'){if(code===0)want=true;
   // The browser refused the sound and paused it: carry on muted.
   else if(code===2){muted=true;hush();try{s.yt.playVideo();}catch{}label();}}};
 // A song loads into the hidden player, muted, from its start point.
 const load=(s,x)=>{if(s.el?.classList.contains('is-going')){if(!s.buried)leaveStill(s.gx,s.rect);end(s);}keepTell();quiet(s);
  s.x=x;s.startAt=startFor(x);s.since=0;s.sought=false;s.code=-1;s.at=performance.now();const h=host(s);h.classList.remove('is-live');twin(s,x);
  if(s.yt){try{s.yt.mute();s.yt.loadVideoById({videoId:x.v,startSeconds:s.startAt});}catch{failed.add(x.v);s.x=null;}return;}
  if(s.mk)return;s.mk=true;
  loadYoutubeApi().then(YT=>{const holder=document.createElement('div'),edge=h.querySelector('.radio-edge');h.replaceChildren(holder);if(edge)h.append(edge);
   s.yt=new YT.Player(holder,{width:'100%',height:'100%',videoId:x.v,playerVars:{autoplay:1,mute:1,start:s.startAt,controls:0,playsinline:1,rel:0,iv_load_policy:3,cc_load_policy:0,disablekb:1,fs:0,modestbranding:1,origin:location.origin},
    events:{onReady:e=>{try{e.target.mute();if(!s.x){e.target.pauseVideo();return;}if(s.x.v!==x.v)e.target.loadVideoById({videoId:s.x.v,startSeconds:s.startAt});else e.target.playVideo();}catch{}},onStateChange:e=>onState(s,e.data),
     onError:()=>{if(s.x)failed.add(s.x.v);if(s===live)want=true;else if(state!=='off'&&s.x){s.x=null;}},
     onAutoplayBlocked:()=>{blocked=true;if(state==='tuning'){stop();idle();}}}});});};
 const prepare=()=>{const x=pick();if(x)load(other(),x);};
 // The hidden player becomes the live one: its screen pops up on top in a new place, the song before stays where it was for a few seconds (see retire), and the sound (if on) comes up.
 const reveal=s=>{const old=live,xf=want?1200:XF*1000;live=s;nxt=null;if(old){if(!muted&&state==='on')fade(old,0,xf,()=>quiet(old));else quiet(old);untwin(old);old.el?.classList.remove('is-live');if(state==='on'){old.el?.classList.add('is-going');old.gx=old.x;old.buried=false;ago.push(old);while(ago.length>keepN())retire(ago[0],TUCK);}else end(old);old.x=null;old.since=0;placeScreen();}
  seat(s);cur=last=s.x;s.el.classList.add('is-live');const tw=T(s);if(tw){tw.el.classList.add('is-live');try{tw.tw?.seekTo?.((s.yt?.getCurrentTime?.()||s.startAt)+.3,true);tw.tw?.playVideo?.();}catch{}}const p=s.yt;clipAt=p?.getCurrentTime?.()||0;lastCt=clipAt;movedAt=performance.now();swapAt=0;want=false;fill(0);setState('on');show(s.x);
  if(!muted){level(s,0);try{p.unMute();}catch{}fade(s,100,old?xf:450);}else quiet(s);};
 function tune(x){x=x||pick();if(!x){stop();if(el.sub)el.sub.textContent='Nothing will play here right now.';return;}
  live=null;cur=last=x;placeScreen();tuneAt=performance.now();swapAt=0;fill(0);setState('tuning');show(x);load(other(),x);if(!timer)timer=setInterval(step,100);}
 function stop(){if(state==='off')return;const was=live;live=null;if(state==='on'&&was)leaveStill(was.x,was.rect);clearInterval(timer);timer=0;hush();
  slots.forEach(s=>{if(s.el?.classList.contains('is-going')&&!s.buried)leaveStill(s.gx,s.rect);clearTimeout(s.gt);s.gt=0;try{s.yt?.mute();s.yt?.pauseVideo();}catch{}untwin(s);s.x=null;s.since=0;s.el?.classList.remove('is-live','is-going');});ago.length=0;nxt=null;keepTell();swapAt=0;want=false;
  setState('off');tiles.forEach(t=>t.classList.remove('is-on-air'));if(el.needle)el.needle.hidden=true;fill(0);}
 function step(){if(busy()){stop();return;}const now=performance.now(),nx=other();
  if(state==='tuning'){if(ready(nx,want?1.6:LEAD))reveal(nx);else if(now-tuneAt>14000){if(nx.x)failed.add(nx.x.v);tune();}return;}
  if(state!=='on'||!live)return;
  ago.slice().forEach(o=>{const c=o.yt?.getCurrentTime?.(),d=o.yt?.getDuration?.();if(d>0&&Number.isFinite(c)&&c>d-3)retire(o,0);});
  const ct=live.yt?.getCurrentTime?.();if(!Number.isFinite(ct))return;if(ct<clipAt-1)clipAt=ct;if(Math.abs(ct-lastCt)>.01){lastCt=ct;movedAt=now;}else if(now-movedAt>8000)want=true;
  const t=ct-clipAt;fill(Math.min(12,Math.floor(t/CLIP*12)+1));
  if(!nx.x&&(t>=CLIP-PREP||want))prepare();else if(nx.x&&!nx.since&&now-nx.at>12000){failed.add(nx.x.v);prepare();}
  // The next song comes in a little before the twenty seconds are up, so the crossfade is centred on the change.
  if(want?ready(nx,1.6):t>=CLIP-XF/2&&ready(nx,LEAD))reveal(nx);}
 // The screen waits with a song cued (its picture, the song and Listen) when it cannot start on its own.
 const idle=()=>{const x=cur&&!failed.has(cur.v)?cur:pick();if(!x)return;cur=last=x;live=null;placeScreen();const c=frame()?._collage;if(c)box.style.setProperty('--vz',String(c.raise()));setState('idle');show(x);};
 // Muted, the radio starts once half the collage is on screen with the tab in front, and rests when either changes.
 const born=performance.now();
 const wake=()=>{if(state!=='off'||busy()||!inView||document.hidden||performance.now()-born<6500)return;if(blocked){idle();return;}muted=true;tune();};
 const rest=()=>{if(muted&&(state==='on'||state==='tuning'))stop();};
 const press=()=>{
  if(state==='on'){const p=live?.yt;if(muted){muted=false;level(live,0);try{p?.unMute();}catch{}fade(live,100,450);const ct=p?.getCurrentTime?.();if(Number.isFinite(ct)){clipAt=ct;lastCt=ct;movedAt=performance.now();}swapAt=0;
    // A fresh twenty seconds: the song waiting behind is let go and loads again later.
    const nx=other();if(nx.x){try{nx.yt?.pauseVideo();}catch{}nx.x=null;nx.since=0;}}
   else{muted=true;hush();if(!inView||document.hidden)rest();}label();return;}
  if(state==='tuning'){muted=!muted;label();return;}
  muted=false;blocked=false;tune(state==='idle'?cur:null);want=true;};
 resetRadio=()=>{stop();hush();slots.forEach(s=>{try{s.yt?.destroy?.();}catch{}s.yt=null;s.mk=false;s.el?.remove();s.el=null;s.tp=null;});tws.forEach(t=>{try{t.tw?.destroy?.();}catch{}t.tw=null;t.mk=false;t.el?.remove();t.el=null;t.owner=null;});live=null;nxt=null;};
 el.play?.addEventListener('click',press);
 // A click anywhere on the collage (outside the tag's buttons) does the same as the button: sound on, sound off, or Listen.
 frame()?.addEventListener('click',e=>{if(e.target.closest?.('.radio-body')||state==='off')return;press();});el.skip?.addEventListener('click',()=>{if(state==='on')want=true;else if(state==='tuning')tune();});
 el.full?.addEventListener('click',e=>{e.preventDefault();const x=cur;stop();if(x)choose(x.t.id,el.full);});
 el.poster?.addEventListener('error',()=>{el.poster.hidden=true;});
 if(typeof IntersectionObserver==='function'){const f=frame();if(f)new IntersectionObserver(es=>{const e=es[es.length-1];inView=!!e&&e.isIntersecting&&e.intersectionRatio>=.5;if(inView)wake();else rest();},{threshold:[0,.5,1]}).observe(f);}else{inView=true;blocked=true;}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)rest();else wake();});
 // Back from a record, a page or a change of view: the radio picks up again.
 setInterval(()=>{if(state==='off')wake();},2000);
 wake();
})();
buildList();setView(view);startCounter();
})();
