// Module photographs, a pile of prints (see styles.css). On wide screens the pile fills the top of the module, behind the name too (a frosted band keeps the name readable; --lift is how far the frame reaches up). When a song comes on the radio, the sleeve of its own record slides in beside its screen (box._collage.sleeve), square and uncropped. Every print is large (the smaller ones still half the frame across or more, and they may hang a little off its edges), and each takes a shape of its own: about half keep the photograph's own proportions, uncropped; the rest are trimmed into long strips, squares or upright 4:5 prints around the photograph's focus. A print slides quickly onto the pile from the nearest edge every 4.5 to 8.5 s, one at a time, square to the frame, and stays where it lands. A large print lands when the frame is getting bare or every so often; small ones land away from the last few small ones. The radio's screen is part of the pile: each new song pops in on top (box._collage.raise gives it the next place in the pile), and while it plays new prints land over its edges, so the song starts to get buried, never more than a fifth of the screen while it plays; the radio's controls bar along the bottom stays on top. The radio reports where its screen is through box._collage.vid. A print covered over by newer ones is lifted away unseen; past eight in the pile the oldest is lifted. The page opens on the portrait, whole and clear under the band. The radio leaves stills of the songs it has played on the pile through box._collage.still. It waits while the tab is hidden, and holds still under reduced motion.
// A spectrum for a glass edge: a long smooth run of the rainbow round the ring (seven to nine hues, each 24 to 33 degrees on from the last, so most of the wheel), with one or two white bands and one or two black bands slipped in between hues and a short stretch of clear glass, from a random start or anywhere within about eighty degrees of a given hue stretched round the edge and blended, with stretches of clear glass, a white haze and a dark band set between them, each at its own strength, so it reads as light caught in glass rather than a flag. dressEdge gives an edge its own spectrum and its own slow pace of turning and breathing; the edges on the page share one family of hues that walks slowly round the wheel as they are dressed, so pieces that arrive together glow alike and the whole collage reads as one thing. The same spectrum, with its dark band taken out and its white haze faint, is what spills from an edge into the space around it (--spill-grad), so only light leaks out, never a shadow.
function brokenSpectrum(base){const h0=base==null?Math.random()*360:(base+(Math.random()-.5)*160+360)%360,n=7+Math.floor(Math.random()*3),step=24+Math.random()*9,dir=Math.random()<.5?1:-1,a=(lo,hi)=>(lo+Math.random()*(hi-lo)).toFixed(2);
 // The run of hues, in order round the wheel; white and black bands slipped in between some of them (one or two of each), and a short stretch of clear glass before the run comes round again.
 const toks=Array.from({length:n},(_,i)=>({c:`hsl(${Math.round((h0+dir*step*i+720)%360)} 90% 62% / ${a(.78,1)})`,w:1})),gaps=[...Array(n-1).keys()].map(k=>k+1).sort(()=>Math.random()-.5),monos=[];
 const nw=1+(Math.random()<.5?1:0),nb=1+(Math.random()<.5?1:0);for(let k=0;k<nw;k++)monos.push({at:gaps[k],t:{c:`rgba(246,245,241,${a(.6,.9)})`,w:.55}});for(let k=0;k<nb;k++)monos.push({at:gaps[nw+k],t:{c:`rgba(10,10,9,${a(.65,.9)})`,w:.6}});
 monos.sort((x,y)=>y.at-x.at).forEach(m=>toks.splice(m.at,0,m.t));toks.push({c:'rgba(0,0,0,0)',w:.7});
 const tot=toks.reduce((x,t)=>x+t.w,0);let at=0;const stops=toks.map(t=>{const p=(at+t.w/2)/tot*360;at+=t.w;return `${t.c} ${p.toFixed(1)}deg`;});const first=toks[0].c;
 return `conic-gradient(from ${Math.round(Math.random()*360)}deg,${first} 0deg,${stops.join(',')},${first} 360deg)`;}
function dressEdge(el){if(!el||!el.style)return;const st=el.style;brokenSpectrum.h=((brokenSpectrum.h??Math.random()*360)+3+Math.random()*7)%360;const g=brokenSpectrum(brokenSpectrum.h);st.setProperty('--edge-grad',g);st.setProperty('--spill-grad',g.replace(/rgba\(12,12,11,[\d.]+\)/g,'rgba(0,0,0,0)').replace(/rgba\(244,243,239,([\d.]+)\)/g,(m,a)=>`rgba(244,243,239,${(a*.3).toFixed(2)})`));st.setProperty('--es',(22+Math.random()*14).toFixed(1)+'s');st.setProperty('--eb',(9+Math.random()*8).toFixed(2)+'s');st.setProperty('--ebd',(-Math.random()*17).toFixed(2)+'s');}
(()=>{'use strict';const box=document.getElementById('d-show');if(!box)return;const slides=[...box.querySelectorAll('.d-slide')];if(!slides.length)return;
 const rnd=(a,b)=>a+Math.random()*(b-a);
 const cap=box.querySelector('.d-cap'),vid=box.querySelector('.d-vid');
 const order=[slides[0],...slides.slice(1).map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1])];
 // How far the frame reaches up behind the name (wide screens; see styles.css).
 // And where it is cut off: just under the intro, so no print or screen sits behind the type (--cut, from the top of the frame).
 const disp=box.closest?.('.display'),head=box.parentElement,lede=disp?.querySelector?.('.d-lede');let seat=null;const reach=()=>{if(disp&&head)disp.style.setProperty('--lift',(head.offsetTop||0)+'px');if(disp&&lede)disp.style.setProperty('--cut',((lede.offsetTop||0)+(lede.offsetHeight||0)+10)+'px');seat?.();};
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
 const lay=(x,rect,big,instant=false,zAt)=>{const st=x.style;x._rect=rect;if(!x._crop){const im=x.querySelector('img'),crop=document.createElement('span');crop.className='d-crop';if(im)crop.appendChild(im);x.insertBefore(crop,x.firstChild);x._crop=crop;}x.classList.toggle('is-small',!big);const [l,t,w,h,r]=rect;
  st.setProperty('--l',l+'%');st.setProperty('--t',t+'%');st.setProperty('--w',w+'%');st.setProperty('--h',h+'%');x._z=zAt??(z+=2);st.setProperty('--zi',String(x._z));warm(x);
  // Every print but the opening portrait is cropped in a little and drifts slowly in place while it sits (a long, even pan back and forth), so something is always moving.
  if(!still&&!x.classList.contains('is-pan')&&!x.classList.contains('d-sleeve')&&!(opening&&x===order[0])){const k=rnd(1.1,1.26),m=(k-1)/(2*k)*100*.9,p=()=>rnd(-m,m).toFixed(2)+'%';st.setProperty('--ks',k.toFixed(3));st.setProperty('--kx0',p());st.setProperty('--ky0',p());st.setProperty('--kx1',p());st.setProperty('--ky1',p());st.setProperty('--kd',rnd(16,30).toFixed(1)+'s');x.classList.add('is-pan');}
  // It slides in from the nearest edge of the frame, a fifth of its own size, quickly; nothing fades.
  if(!instant&&!still){const cx=l+w/2,cy=t+h/2,d=[cx,100-cx,cy,100-cy],k=d.indexOf(Math.min(...d)),D=22;x.classList.add('is-enter');st.setProperty('--dx',(k===0?-D:k===1?D:0)+'%');st.setProperty('--dy',(k===2?-D:k===3?D:0)+'%');x.dataset.on='';void x.offsetWidth;x.classList.remove('is-enter');st.setProperty('--dx','0%');st.setProperty('--dy','0%');}else x.dataset.on='';
  live.push(x);if(cap&&!guard)cap.textContent=x.dataset.cap||'';};
 const lift=x=>{delete x.dataset.on;live=live.filter(y=>y!==x);if(x._temp)x.remove();else queue.push(x);};
 const tidy=()=>{const snap=live.slice().sort((a,b)=>a._z-b._z);snap.forEach((x,i)=>{if(i<snap.length-1&&coverOf(x._rect,snap.slice(i+1))>=.94)lift(x);});while(live.length>8)lift(live[0]);};
 const next=()=>{const i=queue.findIndex(x=>!live.includes(x));return i<0?null:queue.splice(i,1)[0];};

 // The grid. Once the radio has a screen, everything in the collage sits in cells lined up edge to edge with the same gap (G) between every two of them, nothing overlapping: the playing song's screen, the sleeve of its record beside it (square, whole), and photographs (and stills of songs played) in the rest. The cells span the frame's full width (the width of the radio bar and the button below) and sit from just under the intro down to the radio bar, a gap above it. Of a handful of arrangements (the screen, then the sleeve column, then nothing, one or two columns of photographs; the sleeve column may carry a photograph under the sleeve) the one that best balances a large screen, a large sleeve, a few photographs and no wasted height is used; space left over above the row, if deep enough, becomes a row of photographs. The screen may crop the sides or top of the video a little (the player itself is never smaller than YouTube's 356 × 200). Each new song mirrors the arrangement, so everything shifts across; every few seconds one photograph cell takes a new print. Where no arrangement fits (narrow frames) the pile below is used instead.
 const G=10;let gridOn=false,gLeft=Math.random()<.5,gcells=[],ghold=[],gscreen=null,gAt=0;
 const colSpec={S:h=>({min:h,max:h,pref:h}),SP:h=>({min:96,max:Math.max(96,h-G-44),pref:h*.62}),P:h=>({min:.8*h,max:1.9*h,pref:1.3*h}),PP:h=>{const e=(h-G)/2;return {min:.75*e,max:1.9*e,pref:1.3*e};}};
 const TPL=[[],['S'],['SP'],['S','P'],['S','PP'],['SP','P'],['SP','PP'],['S','PP','PP'],['S','P','PP'],['SP','PP','PP']];
 const fitRow=(tpl,h,W)=>{const items=[{min:1.3*h,max:16/9*h,pref:16/9*h}].concat(tpl.map(t=>colSpec[t](h))),avail=W-G*tpl.length,mn=items.reduce((a,i)=>a+i.min,0),mx=items.reduce((a,i)=>a+i.max,0);if(avail<mn-.5||avail>mx+.5)return null;
  let w=items.map(i=>i.pref),d=avail-w.reduce((a,x)=>a+x,0);for(let k=0;k<5&&Math.abs(d)>.5;k++){const room=items.map((i,j)=>Math.max(0,d>0?i.max-w[j]:w[j]-i.min)),R=room.reduce((a,x)=>a+x,0);if(R<=0)break;w=w.map((x,j)=>x+d*room[j]/R);d=avail-w.reduce((a,x)=>a+x,0);}return w;};
 const solve=(W,UH)=>{let best=null;for(const tpl of TPL){for(let h=Math.floor(UH);h>=110;h-=2){const w=fitRow(tpl,h,W);if(!w)continue;let photos=0,shape=0,L=UH-h,top=0,n=0;
   // How far each photograph cell is from a comfortable shape (between square and a little over 2:1).
   const pa=a=>{photos++;shape+=a<1?(1-a)*1.2:a>2.2?(a-2.2)*.6:0;};tpl.forEach((t,j)=>{const cw=w[j+1];if(t==='SP')pa(cw/Math.max(1,h-cw-G));else if(t==='P')pa(cw/h);else if(t==='PP'){const e=(h-G)/2;pa(cw/e);pa(cw/e);}});
   if(L>=70+G){top=L-G;n=Math.max(2,Math.min(5,Math.round(W/(1.45*top))));const tw=(W-(n-1)*G)/n;for(let k=0;k<n;k++)pa(tw/top);L=0;}
   const slA=tpl[0]==='S'?h*h:tpl[0]==='SP'?w[1]*w[1]:0,sc=3*w[0]*h/(W*UH)+3*slA/(W*UH)+.3*Math.min(photos,4)-.3*Math.max(0,photos-5)-shape-1.5*L/UH-1.6*(16/9-w[0]/h)-(tpl.length?0:1)-(photos<2?1.2:0);
   if(!best||sc>best.sc)best={sc,tpl,h,w,top,n};}}return best;};
 // Lay out the cells (in pixels of the frame), mirrored on alternate songs.
 const layout=()=>{const W=box.clientWidth,H=box.clientHeight;if(!W||!H||!head||!box.getBoundingClientRect)return null;const br=box.getBoundingClientRect(),hr=head.getBoundingClientRect(),bar=box.querySelector('.radio-body'),bh=(bar&&bar.offsetHeight)||46;
  const top=Math.max(0,hr.top-br.top),bottom=H-bh-G,UH=bottom-top;if(UH<110)return null;const S=solve(W,UH);if(!S)return null;
  const cells=[],y=bottom-S.h,add=(x,yy,w,h,kind)=>cells.push({kind,px:[gLeft?x:W-x-w,yy,w,h]});let x=0;add(0,y,S.w[0],S.h,'screen');x=S.w[0]+G;
  S.tpl.forEach((t,j)=>{const w=S.w[j+1];if(t==='S')add(x,y,w,S.h,'sleeve');else if(t==='SP'){add(x,y,w,w,'sleeve');add(x,y+w+G,w,S.h-w-G,'photo');}else if(t==='P')add(x,y,w,S.h,'photo');else{const e=(S.h-G)/2;add(x,y,w,e,'photo');add(x,y+e+G,w,e,'photo');}x+=w+G;});
  if(S.top){const n=S.n,w=(W-(n-1)*G)/n;for(let i=0;i<n;i++)add(i*(w+G),top,w,S.top,'photo');}
  cells.forEach(c=>{c.r=[c.px[0]/W*100,c.px[1]/H*100,c.px[2]/W*100,c.px[3]/H*100,0];});return cells;};
 // Fill a photograph cell with a new print, sliding in over whatever was there (which is lifted once it is covered).
 const swapIn=(i,x)=>{const c=gcells[i];if(!c||!x)return;const old=ghold[i];x.classList.remove('is-hero');lay(x,c.r,false,false,z+=2);ghold[i]=x;if(old&&old!==x)setTimeout(()=>{if(live.includes(old)&&!ghold.includes(old))lift(old);},700);warm(queue[0]);};
 const fill=i=>{const x=next();if(x)swapIn(i,x);};
 // Everything already in the collage moves to the new cells (the latest sleeve to the sleeve cell, the rest to the nearest photograph cells; older sleeves and anything left over are lifted), and empty cells fill one after another.
 const reflow=cells=>{gcells=cells;ghold=cells.map(()=>null);const sl=cells.findIndex(c=>c.kind==='sleeve'),ph=cells.map((c,i)=>c.kind==='photo'?i:-1).filter(i=>i>=0);
  const sleeves=live.filter(x=>x.classList.contains('d-sleeve')).sort((a,b)=>b._z-a._z);if(sl>=0&&sleeves[0]){ghold[sl]=sleeves[0];fit(sleeves[0],cells[sl].r);}
  live.filter(x=>!ghold.includes(x)).sort((a,b)=>b._z-a._z).forEach(x=>{if(x.classList.contains('d-sleeve')){lift(x);return;}let bi=-1,bd=1e9;const cx=x._rect[0]+x._rect[2]/2,cy=x._rect[1]+x._rect[3]/2;
   ph.forEach(i=>{if(ghold[i])return;const r=cells[i].r,d=Math.hypot(r[0]+r[2]/2-cx,r[1]+r[3]/2-cy);if(d<bd){bd=d;bi=i;}});if(bi<0){lift(x);return;}ghold[bi]=x;x.classList.remove('is-hero');fit(x,cells[bi].r);});
  ph.filter(i=>!ghold[i]).forEach((i,k)=>setTimeout(()=>{if(gcells===cells&&!ghold[i])fill(i);},140+170*k));};
 // A new song's arrangement is worked out when it is chosen (so its player can load in the right cell) and put in place when its screen appears (commit), so the collage never waits around an empty cell: until the first screen appears the portrait stays as it opened.
 let pending=null;const commit=()=>{const cells=pending;if(!cells)return;pending=null;gridOn=true;opening=false;guard=null;box.classList.add('is-grid');reflow(cells);gscreen=cells.find(c=>c.kind==='screen').px;};
 const plan=(mirror=true)=>{if(mirror)gLeft=!gLeft;const cells=layout();if(!cells){pending=null;gridOn=false;box.classList.remove('is-grid');return null;}pending=cells;return cells.find(c=>c.kind==='screen').px.slice();};
 box._collage={
  // The radio's stills: a black-and-white frame of the song just played, left where its screen was.
  // The grid: the radio asks for the arrangement for a new song (the screen's cell, in pixels of the frame) and whether there is one.
  plan(){return plan(true);},
  commit(){commit();},
  isGrid(){return gridOn;},
  still(src,alt,label,rect){if(gridOn){const ph=gcells.map((c,i)=>c.kind==='photo'?i:-1).filter(i=>i>=0),cx=rect[0]+rect[2]/2,cy=rect[1]+rect[3]/2,si=gcells.findIndex(c=>c.kind==='screen');let bi=ph[0],bd=1e9;ph.forEach(i=>{const r=gcells[i].r,d=Math.hypot(r[0]+r[2]/2-cx,r[1]+r[3]/2-cy);if(d<bd){bd=d;bi=i;}});if(si>=0&&inside(gcells[si].r,cx,cy))bi=si;if(bi==null)return;
    const f=document.createElement('figure'),img=document.createElement('img');f.className='d-slide d-still';f.dataset.cap=label||'';f._temp=true;f.style.setProperty('--fx','50%');f.style.setProperty('--fy','50%');img.alt=alt||'';img.decoding='async';img.addEventListener('error',()=>{if(live.includes(f))lift(f);else f.remove();},{once:true});img.src=src;f.append(img);box.insertBefore(f,vid||cap||null);swapIn(bi,f);return;}
   const f=document.createElement('figure'),img=document.createElement('img');f.className='d-slide d-still';f.dataset.cap=label||'';f._temp=true;f.style.setProperty('--fx','50%');f.style.setProperty('--fy','50%');img.alt=alt||'';img.decoding='async';img.addEventListener('error',()=>{if(live.includes(f))lift(f);else f.remove();},{once:true});img.src=src;f.append(img);box.insertBefore(f,vid||cap||null);lay(f,[...rect,0],false,true,vz-1);setTimeout(tidy,400);},
  // The playing song's own record: its sleeve slides in beside the new screen, about the screen's height, tucked a little under the screen's edge on whichever side has more room, just under the screen in the pile.
  sleeve(src,alt,label,scr){if(!src||!scr)return;const W=box.clientWidth||640,H=box.clientHeight||320,Z=zone(),f=document.createElement('figure'),img=document.createElement('img');f.className='d-slide d-sleeve';f.dataset.sleeve='';f.dataset.cap=label||'';f._temp=true;f.style.setProperty('--fx','50%');f.style.setProperty('--fy','50%');img.alt=alt||'';img.decoding='async';img.addEventListener('error',()=>{if(live.includes(f))lift(f);else f.remove();},{once:true});img.src=src;f.append(img);box.insertBefore(f,vid||cap||null);
   if(gridOn){const sl=gcells.findIndex(c=>c.kind==='sleeve');if(sl<0){f.remove();return;}swapIn(sl,f);return;}
   const side=Math.min(scr[3]/100*H*rnd(.8,.96),Z[3]/100*H*.92),sw=side/W*100,sh=side/H*100,room=[scr[0]-Z[0],Z[0]+Z[2]-scr[0]-scr[2]],ov=sw*rnd(.14,.24);
   let x=room[1]>=room[0]?scr[0]+scr[2]-ov:scr[0]-sw+ov;x=Math.max(Z[0]-sw*.12,Math.min(x,Z[0]+Z[2]-sw*.88));let y=scr[1]+(scr[3]-sh)*rnd(.15,.85);y=Math.max(Z[1],Math.min(y,Z[1]+Z[3]-sh));
   lay(f,[x,y,sw,sh,0],false,false,vz-1);setTimeout(tidy,1200);},
  // Where the radio's screen is, in percent of the frame (or null when it is away).
  vid(rect,screen){avoid=rect||null;scr=screen||null;if(rect){opening=false;guard=null;}placeCap();},
  // The earlier songs still showing (slid aside): prints would rather land elsewhere, so they stay in view for a while.
  keep(rects){keepR=rects||[];},
  // A new song's screen goes on top of the pile.
  raise(){vz=(z+=2);return vz;},
  // When a song gives way, a print slides over its screen, just under the new song's, covering it whole; false when there is none to hand.
  bury(rect){if(gridOn)return false;const x=next();if(!x)return false;const W=box.clientWidth||640,H=box.clientHeight||320,a=x.dataset.sleeve!=null?1:natural(x),rw=rect[2]/100*W,rh=rect[3]/100*H;
   const pw=Math.max(rw*rnd(1.08,1.24),rh*rnd(1.08,1.24)*a),ph=pw/a,px=rect[0]/100*W-(pw-rw)*Math.random(),py=rect[1]/100*H-(ph-rh)*Math.random();
   lay(x,[px/W*100,py/H*100,pw/W*100,ph/H*100,0],false,false,vz-1);warm(queue[0]);setTimeout(tidy,1200);return true;}};
 // (The collage has no captions; this keeps clear of the radio's screen any caption a page may still carry.)
 const placeCap=()=>{if(!cap)return;const st=cap.style;['left','right','max-width','visibility'].forEach(k=>st.removeProperty(k));if(!avoid||avoid[1]+avoid[3]<88)return;
  const W=box.clientWidth||640,lft=avoid[0]/100*W,rgt=W-(avoid[0]+avoid[2])/100*W,room=Math.max(lft,rgt)-20;
  if(room<110){st.setProperty('visibility','hidden');return;}if(rgt>lft){st.setProperty('left','auto');st.setProperty('right','10px');}st.setProperty('max-width',Math.round(room)+'px');};
 // The opening: the portrait fills the clear part of the frame (under the frosted band), whole and uncovered, and a few prints sit up in the band behind the name. Until the first song is on its way, nothing new lands.
 const zone=()=>{const W=box.clientWidth,H=box.clientHeight;if(!W||!H||!head||!box.getBoundingClientRect)return [0,0,100,100];const br=box.getBoundingClientRect(),hr=head.getBoundingClientRect();return [(hr.left-br.left)/W*100,(hr.top-br.top)/H*100,hr.width/W*100,hr.height/H*100];};
 // The collage opens on the portrait alone, as large as the window allows (see pr). Nothing lands on it until the radio's first screen; then the pile builds quickly for a few prints and settles to its usual pace.
 const portrait=next();
 const fit=(x,r)=>{const st=x.style;x._rect=r;['l','t','w','h'].forEach((k,i)=>st.setProperty('--'+k,r[i]+'%'));};
 const dims=()=>{const Z=zone(),W=box.clientWidth||640,H=box.clientHeight||320;return {Z,W,H,fa:(W*Z[2])/(H*Z[3])};};
 // The opening portrait, alone, edge to edge across the frame: his head just under the intro (where the frame's cut ends) and his waist at the bottom of the clear part, so the rest of him runs on out of sight below. In this photograph his head starts about 8.5% of the way down and his waist sits about 70% down. It is never blown up past about 1.9 times its own pixels.
 const pr=()=>{const {Z,H}=dims(),W=box.clientWidth||640,a=natural(portrait)||1.5,nh=+(portrait.querySelector('img')?.getAttribute('height')||477),dpr=window.devicePixelRatio||1,cut=parseFloat(disp?.style?.getPropertyValue?.('--cut'))||Z[1]/100*H,top=cut+18,low=(Z[1]+Z[3])/100*H;
  let fh=Math.max(40,(low-top)/(.70-.085));fh=Math.max(W/a,Math.min(fh,nh*1.9/dpr));const y=top-.085*fh;return [0,y/H*100,100,fh/H*100,0];};
 if(portrait){const P=pr();
  portrait.classList.add('is-hero');lay(portrait,P,true,true);guard=portrait._rect;}
 seat=()=>{if(gridOn){const now=Date.now();if(now-gAt<120)return;gAt=now;const cells=layout();if(!cells)return;reflow(cells);gscreen=cells.find(c=>c.kind==='screen').px;box._replan?.(gscreen.slice());return;}if(!opening||!portrait)return;const r=pr();fit(portrait,r);guard=r;};
 if(cap&&portrait)cap.textContent=portrait.dataset.cap||'';warm(queue[0]);
 if(still||!queue.length||typeof setTimeout!=='function')return;
 let gLast=-1;const land=()=>{if(gridOn){const ph=gcells.map((c,i)=>c.kind==='photo'?i:-1).filter(i=>i>=0&&i!==gLast);if(!ph.length)return;const i=ph[Math.floor(Math.random()*ph.length)];gLast=i;fill(i);return;}if(guard)return;const x=next();if(!x)return;sinceBig++;
  const big=!avoid&&!guard&&(frameCover()<.78||(sinceBig>4&&Math.random()<.35));if(big)sinceBig=0;
  const small=x.dataset.small!=null,r=place(x,big&&!small);if(!r){queue.unshift(x);return;}lay(x,r,big&&!small);warm(queue[0]);setTimeout(tidy,1000);};
 const playing=()=>vid&&(vid.dataset.state==='on'||vid.dataset.state==='tuning');
 let quick=6;const tick=()=>{if(!document.hidden)land();setTimeout(tick,!gridOn&&!guard&&quick>0?(quick--,rnd(1200,2400)):rnd(4500,8500));};
 setTimeout(tick,2600);
})();
// The photographs on the wall change hands with the collage: every few seconds one that is on screen (not under the pointer) trades itself for another session photograph from the collage's set, one not already on the wall and never the other crop of a moment that is. The change happens like a small monochrome display redrawing: the picture breaks into one-bit dots that grow coarser, the new picture comes in coarse and sharpens back, and its figure number and label tick over to the new one. It waits while the tab is hidden, and nothing changes under reduced motion.
(()=>{'use strict';const wall=document.getElementById('wall'),show=document.getElementById('d-show');if(!wall||!show)return;const cells=[...wall.querySelectorAll('.fr')];if(!cells.length)return;
 if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(typeof setTimeout!=='function'||typeof Image!=='function')return;
 const pool=[...show.querySelectorAll('.d-slide:not(.d-sleeve):not(.d-still)')].map(f=>{const i=f.querySelector('img');if(!i)return null;const w=+i.getAttribute('width'),h=+i.getAttribute('height');if(!(w>0&&h>0)||w/h>1.8)return null;const m=(f.dataset.cap||'').match(/^(Fig\. \d+) · (.+)$/);if(!m)return null;const cs=f.style;return {src:i.getAttribute('src'),alt:i.getAttribute('alt')||'',num:m[1],label:m[2],g:f.dataset.g||'',w,h,pos:`${(cs.getPropertyValue('--fx')||'50%').trim()} ${(cs.getPropertyValue('--fy')||'50%').trim()}`};}).filter(Boolean);
 if(pool.length<2)return;
 const rnd=(a,b)=>a+Math.random()*(b-a);const srcOf=c=>c.querySelector('img')?.getAttribute('src')||'';
 let bag=[],last=null,busy=false;
 // The next photograph to bring in: from a shuffled bag, so every one comes round before any repeats.
 const draw=cell=>{const onWall=cells.filter(c=>c!==cell),srcs=new Set(onWall.map(srcOf)),groups=new Set(onWall.map(c=>c.dataset.g).filter(Boolean));srcs.add(srcOf(cell));
  const fits=p=>!srcs.has(p.src)&&!(p.g&&groups.has(p.g));if(!bag.some(fits))bag=pool.map(p=>[Math.random(),p]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);const k=bag.findIndex(fits);return k<0?null:bag.splice(k,1)[0];};
 const seen=c=>{if(c.hidden||c===last||c.classList.contains('is-swapping')||c.matches?.(':hover'))return false;const r=c.getBoundingClientRect?.();if(!r||r.width<40)return false;const vh=window.innerHeight||0,vw=window.innerWidth||0;return r.top>-r.height*.2&&r.bottom<vh+r.height*.2&&r.left>=-4&&r.right<=vw+4;};
 // A picture drawn as one-bit dots (ordered dither) at a given dot size, cropped the way the photograph is (cover, at its focus), in the wall's ink on black.
 const B=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
 const pos=v=>{const t=String(v||'').trim().split(/\s+/),f=x=>x==='left'||x==='top'?0:x==='right'||x==='bottom'?1:x==='center'||x==null?.5:/%$/.test(x)?parseFloat(x)/100:.5;return [f(t[0]),f(t[1]??'center')];};
 const dots=(cv,img,focus,W,H,px)=>{const cw=Math.max(4,Math.ceil(W/px)),ch=Math.max(4,Math.ceil(H/px));cv.width=cw;cv.height=ch;const c=cv.getContext('2d',{willReadFrequently:true});if(!c)return false;
  const nw=img.naturalWidth||img.width,nh=img.naturalHeight||img.height;if(!nw||!nh)return false;const sc=Math.max(cw/nw,ch/nh),dw=nw*sc,dh=nh*sc,[fx,fy]=pos(focus);c.imageSmoothingEnabled=true;c.fillStyle='#0e0e0d';c.fillRect(0,0,cw,ch);c.drawImage(img,(cw-dw)*fx,(ch-dh)*fy,dw,dh);
  let d;try{d=c.getImageData(0,0,cw,ch);}catch{return false;}const a=d.data;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const i=(y*cw+x)*4;let l=(a[i]*.299+a[i+1]*.587+a[i+2]*.114)/255;l=((l-.5)*1.35+.5)*.92;const on=l>(B[(y&3)*4+(x&3)]+.5)/16;a[i]=on?236:14;a[i+1]=on?235:14;a[i+2]=on?231:13;a[i+3]=255;}c.putImageData(d,0,0);return true;};
 // The label ticks over: each character spins through digits or letters until its turn to settle, left to right.
 const tick=(node,to,ms)=>{if(!node)return;const n=Math.ceil(ms/40);let k=0;const glyph=ch=>/\d/.test(ch)?String(Math.floor(Math.random()*10)):/[a-z]/.test(ch)?'abcdefghkmnoprstuvwxyz'[Math.floor(Math.random()*22)]:/[A-Z]/.test(ch)?'ABCDEFGHKMNPRSTUVWXYZ'[Math.floor(Math.random()*21)]:ch;
  const go=()=>{k++;node.textContent=[...to].map((ch,i)=>k>=n*(.35+.65*i/Math.max(1,to.length))?ch:glyph(ch)).join('');if(k<n)setTimeout(go,40);else node.textContent=to;};go();};
 const swap=cell=>{const img=cell.querySelector('img'),p=draw(cell);if(!img||!p)return Promise.resolve();busy=true;cell.classList.add('is-swapping');
  const done=()=>{busy=false;cell.classList.remove('is-swapping');};const nu=new Image();
  // Loaded, not decode(): decode() can wait forever in a page that is not being drawn. A photograph slow to arrive is given up on.
  return new Promise((ok,no)=>{nu.onload=ok;nu.onerror=no;setTimeout(()=>no(new Error('slow')),6000);nu.src=p.src;if(nu.complete&&nu.naturalWidth)ok();}).then(()=>{const r=cell.getBoundingClientRect(),W=Math.round(r.width),H=Math.round(r.height);if(W<40||H<40||!img.complete){done();return;}
   const cv=document.createElement('canvas');cv.className='fr-dots';cv.setAttribute('aria-hidden','true');const cap=cell.querySelector('figcaption');cell.insertBefore(cv,cap||null);const old=getComputedStyle(img).objectPosition;
   const steps=[[img,old,2],[img,old,3.5],[img,old,6],[nu,p.pos,9],[nu,p.pos,5.5],[nu,p.pos,3],[nu,p.pos,2]];let k=0;
   const step=()=>{try{if(k===3){img.src=p.src;img.alt=p.alt;img.width=p.w;img.height=p.h;img.style.objectPosition=p.pos;img.loading='eager';if(cap){const t=cap.firstChild;if(t&&t.nodeType===3)tick(t,p.num,360);tick(cap.querySelector('span'),p.label,520);}}
    if(k>=steps.length){cv.remove();done();return;}const [im,fo,px]=steps[k];if(!dots(cv,im,fo,W,H,px)){cv.remove();done();return;}k++;setTimeout(step,k===3?120:k===4?90:65);}catch{cv.remove();done();}};step();last=cell;}).catch(done);};
 const loop=()=>{if(!document.hidden&&!busy){const ok=cells.filter(seen);if(ok.length)swap(ok[Math.floor(Math.random()*ok.length)]);}setTimeout(loop,rnd(4200,8800));};
 setTimeout(loop,rnd(3500,6000));
})();
// Light washing over the wall (styles.css .wall.is-lit): the album covers and the wall's photographs sit dimmed, and shafts of light from above the top left of the window, never drawn themselves, wash across them. One light source: the shafts lean down to the right together. Each drifts, widens and narrows, and comes and goes on its own slow cycle, sometimes fading out altogether, and slow bands of brighter light pour down along it. Over minutes the light as a whole rises and falls, from a few thin shafts over a dark wall to broad light over most of it, and every so often a wide wash sweeps right across. The light follows the pointer lazily (over a couple of seconds): the shafts lean and drift towards it and a soft pool of light gathers round it. On each cover on screen the light is sampled at its two edges and its middle, across the shafts, and the cover's veil follows (--d0..2 darkness, --g0..2 greyness, --w0..2 haze, --la), eased in CSS so it changes gradually: out of the light a cover is dim and nearly black and white, and its colour comes back ahead of its brightness as the light reaches it. Under reduced motion, or where the wall has no size (tests), nothing is dimmed.
(()=>{'use strict';const wall=document.getElementById('wall');if(!wall||typeof requestAnimationFrame!=='function'||typeof performance==='undefined'||!(window.innerWidth>0)||!(wall.getBoundingClientRect?.().width>0))return;
 if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const clamp=(v,a,b)=>v<a?a:v>b?b:v,rnd=(a,b)=>a+Math.random()*(b-a);
 const beams=[{x:.06,w:.22,ph:0,pull:.3},{x:.34,w:.15,ph:1.7,pull:.42},{x:.6,w:.27,ph:3.4,pull:.22},{x:.88,w:.18,ph:5.1,pull:.36}].map((b,i)=>Object.assign(b,{f1:.027+i*.006,f2:.015+i*.004,f3:.043-i*.006}));
 let vw=window.innerWidth,vh=window.innerHeight,lean=0,t=0,day=.6,mx=null,my=null,ex=vw*.5,ey=vh*.4,near=0,lastMove=-1e9,sweep=null,nextSweep=rnd(25,50);
 window.addEventListener('resize',()=>{vw=window.innerWidth;vh=window.innerHeight;});
 window.addEventListener('pointermove',e=>{if(e.pointerType&&e.pointerType!=='mouse')return;mx=e.clientX;my=e.clientY;lastMove=t;},{passive:true});
 document.addEventListener('pointerleave',()=>{mx=null;},{passive:true});
 const state=dt=>{
  // How much light there is overall: two slow tides (about five and thirteen minutes), from a dim wall to a bright one.
  day=clamp(.55+.32*Math.sin(t*.021+1)+.2*Math.sin(t*.0081+2.3),.12,1);
  // The pointer, followed lazily; the pool of light round it fades in while it is about and out once it has been still a while or left.
  const k=1-Math.exp(-dt/2.2),here=mx!=null&&t-lastMove<9;if(here){ex+=(mx-ex)*k;ey+=(my-ey)*k;}near+=((here?1:0)-near)*(1-Math.exp(-dt/1.6));
  lean=(21+3*Math.sin(t*.041)+clamp((ex/vw-.5)*2,-1,1)*5*near)*Math.PI/180;
  beams.forEach(b=>{const home=(b.x+.045*Math.sin(t*b.f1+b.ph)+.025*Math.sin(t*b.f2*1.7+b.ph*2))*vw;b.cx=home+(ex-home)*b.pull*near*.6;b.bw=b.w*vw*(1+.14*Math.sin(t*b.f2+b.ph))*(.75+.75*day);b.L=1.7*vh;b.a=clamp(.42+.55*Math.sin(t*b.f3+b.ph)+.2*Math.sin(t*b.f1*2.3+b.ph*1.3)+.25*(day-.5),0,1);});
  // Now and then a broad wash of light sweeps right across the wall, over ten seconds or so.
  if(!sweep&&t>nextSweep){sweep={t0:t,dur:rnd(9,15),w:rnd(.45,.7)*vw};}
  if(sweep){const f=(t-sweep.t0)/sweep.dur;if(f>=1){sweep=null;nextSweep=t+rnd(35,80);}else{sweep.cx=(-.35+1.7*f)*vw;sweep.a=Math.sin(Math.PI*f)*.95;}}};
 // The light at a point on screen: each shaft is a cone from just above the window, brightest along its middle and towards the top, with bands of brighter light sliding down it; the sweep is one more, wider shaft; the pool is round the pointer.
 const shaft=(b,x,y,S,C)=>{const vx=x-b.cx,vy=y+.12*vh,s=vx*S+vy*C;if(s<=0)return 0;const f=s/b.L,lf=f<.06?f/.06:f<.5?1-(f-.06)/.44*.25:f<.95?.75*(1-(f-.5)/.45):0;if(lf<=0)return 0;
   const p=vx*C-vy*S,hw=b.bw/2*(.4+.6*f),q=Math.abs(p)/hw;if(q>=1)return 0;return b.a*lf*(1-q*q)*(1-q*q)*(.76+.24*Math.sin(s/150-t*.55+(b.ph||0)));};
 const lightAt=(x,y)=>{const S=Math.sin(lean),C=Math.cos(lean);let sum=0;for(const b of beams)if(b.a>.01)sum+=shaft(b,x,y,S,C);if(sweep)sum+=shaft({cx:sweep.cx,bw:sweep.w,L:1.9*vh,a:sweep.a},x,y,S,C);
   if(near>.01){const dx=x-ex,dy=y-ey;sum+=.5*near*Math.exp(-(dx*dx+dy*dy)/(240*240));}return sum;};
 const HAZE=.09;let list=[],listAt=-1e9;
 const paint=now=>{if(now-listAt>1500){list=[...wall.querySelectorAll(':scope>.tile,:scope>.fr')];listAt=now;}const S=Math.sin(lean),C=Math.cos(lean),ga=(90-lean*180/Math.PI).toFixed(1)+'deg',base=.62-.24*day,gain=1.15+.55*day;
  for(const el of list){if(el.hidden)continue;const r=el.getBoundingClientRect();if(r.width<8||r.bottom<-60||r.top>vh+60)continue;const cx=r.left+r.width/2,cy=r.top+r.height/2,half=(r.width*C+r.height*S)/2,st=el.style;
   for(let k=-1;k<=1;k++){const L=Math.min(1,lightAt(cx+k*half*C,cy-k*half*S)*gain),d=(base*(1-Math.pow(L,.8))).toFixed(3),g=(.92*(1-Math.pow(L,.7))).toFixed(3),w=(HAZE*Math.max(0,(L-.66)/.34)).toFixed(3),n=k+1;if(el['_d'+n]!==d){el['_d'+n]=d;st.setProperty('--d'+n,d);}if(el['_g'+n]!==g){el['_g'+n]=g;st.setProperty('--g'+n,g);}if(el['_w'+n]!==w){el['_w'+n]=w;st.setProperty('--w'+n,w);}}
   if(el._la!==ga){el._la=ga;st.setProperty('--la',ga);}}};
 wall.classList.add('is-lit');
 const t0=performance.now();let last=-1e9,prev=t0;
 const loop=now=>{t=(now-t0)/1000;if(now-last>90){const dt=Math.min(.5,(now-prev)/1000);prev=now;last=now;state(dt);paint(now);}requestAnimationFrame(loop);};requestAnimationFrame(loop);
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
function applyPlate(){if(!box||!modes)return;const video=canVideo(),mode=plateMode==='video'&&!video?'dots':plateMode;panel.dataset.plate=mode;modes.querySelectorAll('[data-plate]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.plate===mode));if(b.dataset.plate==='video')b.disabled=!video;});const inPlate=(mode==='video'&&video)||forcePlate;box.classList.toggle('is-plate',inPlate);panel.classList.toggle('has-media',!!current);if(inPlate)placeBox();if(video&&(mode==='video'||back?.classList.contains('is-amb')))ensureShadow();else dropShadow();}
// Video mode keeps the picture behind the glass too: a second, muted YouTube player follows the main one (same video, position and state). It is never the source of playback state.
const back=$('media-back');let shadow=null,shadowTimer=null,shadowToken=0;
// On wide screens the muted copy lives in the frosted page behind everything (with the radio's), so the page carries the record's picture whatever the plate shows; it is moved there before it ever holds a player.
{const amb=$('d-amb');if(amb&&back&&typeof matchMedia==='function'&&matchMedia('(min-width: 821px)').matches){amb.append(back);back.classList.add('is-amb');}}
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
const byRecord=new Map(records.map(r=>[r.id,r]));
function layoutWall(){const hue=wall.dataset.sort==='hue';
 const shown=[...tiles.values()].filter(el=>!el.hidden).sort((a,b)=>(+a.style.getPropertyValue('order')||0)-(+b.style.getPropertyValue('order')||0));const n=shown.length,grid=planWall(n,Math.max(1,wallColumns()));
 if(!hue){tiles.forEach(el=>{el.style.setProperty('grid-column','');el.style.setProperty('grid-row','');});return;}
 if(grid){const {rows,cols,taken}=grid;const held=(r,c)=>r<rows&&taken[r][c];
  // How many sleeves each column takes: one at a time to the column whose next free cell is highest, so the columns end level (photographs and the module counted); then the sleeves go in column by column, in order, so the spectrum still runs left to right, and within each column the records with the most streams sit highest.
  const next=new Array(cols).fill(0),count=new Array(cols).fill(0),skip=c=>{while(held(next[c],c))next[c]++;};for(let c=0;c<cols;c++)skip(c);
  for(let t=0;t<n;t++){let best=0;for(let c=1;c<cols;c++)if(next[c]<next[best])best=c;count[best]++;next[best]++;skip(best);}
  const plays=el=>byRecord.get(el.dataset.id)?.streams||0;let i=0;for(let c=0;c<cols;c++){const mine=shown.slice(i,i+count[c]).sort((a,b)=>plays(b)-plays(a));i+=count[c];let r=0,k=0;while(k<count[c]){if(!held(r,c)){const el=mine[k];el.style.setProperty('grid-column',String(c+1));el.style.setProperty('grid-row',String(r+1));k++;}r++;}}
  return;}
 const cols=Math.max(1,Math.min(wallColumns(),n)),base=Math.floor(n/cols),extra=n%cols;let c=0,r=0;
 shown.forEach(el=>{el.style.setProperty('grid-column',String(c+1));el.style.setProperty('grid-row',String(r+1));r++;if(r>=base+(c<extra?1:0)){r=0;c++;}});}
window.addEventListener('resize',layoutWall);document.addEventListener('catalog:order',layoutWall);
function applyFilters(){const words=normalized(search.value.trim()).split(/\s+/).filter(Boolean);$('records')?.classList.toggle('is-searching',words.length>0);
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
function playItem(r){if(!r)return;dressEdge(panel.querySelector('.card-edge'));panel.hidden=false;body.classList.add('has-player');onScroll();setTimeout(()=>{modKey='';onScroll();},450);if(current?.id===r.id){updateDetails(r);publishState(playbackState);try{if(spotifyController)spotifyController.resume();else player?.playVideo?.();}catch{}return;}current=r;updateDetails(r);if(r.embed)mountMedia(r);else{resetMedia();forcePlate=false;media.classList.remove('is-spotify');$('media-cover').src=r.image;setCover(true);$('player-message').textContent='No listening link is listed for this credit. View the original credit on Muso.ai.';}applyPlate();}
function choose(id,trigger,releaseId,keyboard=false){let r=byId.get(id);if(!r)return;if(r.playTrackId){releaseId=r.id;r=byId.get(r.playTrackId);id=r.id;}lastTrigger=trigger||lastTrigger;let items=visible;
 if(releaseId){items=(byId.get(releaseId)?.tracks||[]).map(id=>byId.get(id)).filter(Boolean);}else if(!items.some(item=>item.id===id)){items=r.kind==='release'?records:tracks;}
 queue=r.embed?items.flatMap(item=>item.playTrackId?(item.tracks||[]).filter(id=>byId.get(id)?.embed):item.embed?[item.id]:[]):[r.id];queueIndex=queue.indexOf(id);playItem(r);if(keyboard)panel.focus({preventScroll:true});}
function inspect(id,trigger,keyboard=false){const r=byId.get(id);if(!r)return;lastTrigger=trigger||lastTrigger;queue=[r.id];queueIndex=0;playItem(r);if(keyboard)panel.focus({preventScroll:true});}
document.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;const play=e.target.closest('[data-play]');if(play){choose(play.dataset.play,play,play.dataset.release,e.detail===0);return;}const detail=e.target.closest('[data-detail]');if(detail)inspect(detail.dataset.detail,detail,e.detail===0);});
$('previous').addEventListener('click',()=>next(-1));$('next').addEventListener('click',()=>next(1));
function closePlayer(){leaveModule();resetMedia();current=null;forcePlate=false;covered=false;$('media-cover').classList.add('is-off');applyPlate();hold=null;setMinimized(false);body.style.removeProperty('--player');body.style.removeProperty('--k');body.style.removeProperty('--pad');document.dispatchEvent(new CustomEvent('player:change',{detail:{id:null,releaseId:null,index:0}}));panel.hidden=true;body.classList.remove('has-player');document.querySelectorAll('.is-active').forEach(el=>el.classList.remove('is-active'));if(lastTrigger?.isConnected&&!lastTrigger.closest('[hidden]'))lastTrigger.focus({preventScroll:true});else search.focus({preventScroll:true});}
$('player-close').addEventListener('click',closePlayer);
// The pinned player collapses with the scroll rather than in one step: its height tracks the distance scrolled (full at the top, the 92px band once the page has scrolled the difference), so the page scrolls into it and back out. --k (0 expanded … 1 band) lets the plate labels, spec and transport fade on the way; the band layout applies only at the end. Minimize and Expand hold their choice until the next return to the top (a Minimize at the top holds until Expand).
const MIN_H=92;let hold=null;
// The full panel is at least the base height (52vh, at most 560px) and grows to fit the whole tracklist, up to 92% of the window; a list longer than that gets exactly the remaining space and scrolls.
let fitH=0;const fullHeight=()=>{const vh=window.innerHeight||900;return Math.min(vh*.92,Math.max(Math.min(vh*.52,560),fitH||0));};
function fitPlayer(){if(modOn){const td=$('track-details');if(td){td.style.maxHeight='';td.classList.remove('is-scroll');}return;}if(panel.hidden||!pinned()||body.classList.contains('player-min'))return;const top=panel.querySelector('.top'),info=panel.querySelector('.info');if(!top||!info)return;const need=(top.scrollHeight||0)+(info.getBoundingClientRect().height-top.getBoundingClientRect().height)+40;fitH=Number.isFinite(need)&&need>0?Math.ceil(need):0;const td=$('track-details'),cap=Math.floor((window.innerHeight||900)*.92);if(td){if(fitH>cap){td.style.maxHeight=`${Math.max(120,cap-(fitH-(td.scrollHeight||0)))}px`;td.classList.add('is-scroll');}else{td.style.maxHeight='';td.classList.remove('is-scroll');}}}
function collapse(k){k=Math.max(0,Math.min(1,k));const on=k>=1,wasMin=body.classList.contains('player-min');if(on!==wasMin)body.classList.toggle('player-min',on);if(wasMin&&!on)fitPlayer();const full=fullHeight(),h=Math.round(full-(full-MIN_H)*k);body.style.setProperty('--player',`${h}px`);body.style.setProperty('--k',k.toFixed(3));body.style.setProperty('--pad',`${hold||body.classList.contains('is-away')?h:Math.round(full)}px`);if(box?.classList.contains('is-plate'))placeBox();}
function setMinimized(on){hold=on?'min':null;collapse(on?1:0);if(box?.classList.contains('is-plate'))setTimeout(placeBox,320);}
const pinned=()=>typeof matchMedia!=='function'||matchMedia('(min-width: 821px)').matches;
// Wide screens: the player opens inside the centre box rather than as a band of its own. It lies over the box: the record's title, artist and credit in a compact frosted band where the name was, then the open record in the middle of the collage with air round it (the plate, as large as the room allows, and a gap away a softly frosted panel with the whole tracklist, then the details and the booking link; prints keep landing around them), and the transport where the radio's bar runs. Under the catalogue bar the box is cut off rather than drawn over the bar, and once it has scrolled almost out of sight the band drops in at the top; clicking the band scrolls back to the box. Phones, and any layout where the box has no size, keep the pinned player.
const modBox=$('display');let modOn=false,modBand=false,modKey='';
const modular=()=>typeof matchMedia==='function'&&matchMedia('(min-width: 821px)').matches&&!!modBox&&!modBox.hidden&&modBox.offsetWidth>0&&!body.classList.contains('is-away');
const modVars=['--pt','--pl','--pw','--ph','--zx','--zy','--zw','--zh','--band','--sx','--sy','--ss','--cx','--cy','--cw','--cs','--qx','--qw'];
function leaveModule(){if(!modOn)return;modOn=false;modBand=false;modKey='';body.classList.remove('is-modular');panel.style.removeProperty('clip-path');modVars.forEach(k=>panel.style.removeProperty(k));modBox?.style.removeProperty('--mband');$('d-show')?._collage?.vid(null,null);}
function layoutModule(){
 if(panel.hidden||!modular()){leaveModule();return false;}
 if(!modOn){modOn=true;body.classList.add('is-modular');}
 const d=modBox,dr=d.getBoundingClientRect(),hr=(d.querySelector('.d-head')||d).getBoundingClientRect(),barH=document.querySelector('#records .bar')?.offsetHeight||0;
 // How much of the box's player part is still in view below the catalogue bar.
 const left=hr.bottom-barH;
 if(modBand?left<170:left<60){if(!modBand){modBand=true;panel.style.removeProperty('clip-path');collapse(1);}return true;}
 modBand=false;body.classList.remove('player-min');
 body.style.setProperty('--player','0px');body.style.setProperty('--k','0');body.style.setProperty('--pad','0px');
 const op=panel.offsetParent||document.body,or=op.getBoundingClientRect(),st=panel.style,px=v=>`${Math.round(v)}px`,BAR=40;
 const zx=hr.left-dr.left,zy=hr.top-dr.top,zw=hr.width,zh=hr.height,bottom=zy+zh-BAR-10;
 // The band is as tall as the title, artist and credit need; the open record takes the rest down to the transport, with air all round so the collage shows on every side: the plate square and, a gap away, the panel, the pair centred.
 const H=(panel.querySelector('.top')?.offsetHeight||zy)+6,availH=Math.max(160,bottom-H),GAP=14,s=Math.max(200,Math.min(availH*.92,zw*.5)),qw=Math.max(160,Math.min(zw*.9-s-GAP,s*.95)),cw=s+GAP+qw,cx=zx+(zw-cw)/2,cy=H+Math.max(0,(availH-s)/2);
 [['--pt',dr.top-or.top],['--pl',dr.left-or.left],['--pw',dr.width],['--ph',hr.bottom-dr.top],['--zx',zx],['--zy',zy],['--zw',zw],['--zh',zh],['--band',H],['--sx',cx],['--sy',cy],['--ss',s],['--cx',cx],['--cy',cy],['--cw',cw],['--cs',s],['--qx',cx+s+GAP],['--qw',qw]].forEach(([k,v])=>st.setProperty(k,px(v)));
 d.style.setProperty('--mband',px(H));
 const sx=cx,sy=cy;
 const cut=Math.max(0,barH-dr.top);if(cut>0)st.setProperty('clip-path',`inset(${Math.round(cut)}px 0 0 0)`);else st.removeProperty('clip-path');
 const show=$('d-show'),c=show?._collage;if(c){const sr=show.getBoundingClientRect();if(sr.width>0&&sr.height>0){const r=[(dr.left+cx-sr.left)/sr.width*100,(dr.top+cy-sr.top)/sr.height*100,cw/sr.width*100,s/sr.height*100],key=r.map(v=>v.toFixed(1)).join();if(key!==modKey){modKey=key;c.vid(r,r);}}}
 if(box?.classList.contains('is-plate'))placeBox();
 return true;}
if(typeof ResizeObserver==='function'&&modBox){const ro=new ResizeObserver(()=>{if(!panel.hidden)onScroll();});ro.observe(modBox);const tp=panel.querySelector('.top');if(tp)ro.observe(tp);}
// The band re-expands on a click anywhere on it that is not a control (and from the screen-reader Expand button); the choice holds until the next return to the top. There is no manual Minimize: the collapse follows the scroll.
function expandPlayer(){if(modOn&&modBand){const y=(window.scrollY||0)+modBox.getBoundingClientRect().top-(document.querySelector('#records .bar')?.offsetHeight||0)-12;window.scrollTo({top:Math.max(0,y),behavior:'smooth'});return;}hold='open';collapse(0);if(box?.classList.contains('is-plate'))setTimeout(placeBox,320);}
$('player-expand')?.addEventListener('click',expandPlayer);
panel.addEventListener('click',e=>{if(!body.classList.contains('player-min'))return;if(e.target.closest?.('button,a,input,[role=slider],#plate-modes'))return;expandPlayer();});
// Clicking the plate cycles Dots → Art → Video (skipping a disabled Video); the buttons still work on their own.
$('plate-frame')?.addEventListener('click',e=>{if(e.target.closest?.('#plate-modes')||body.classList.contains('player-min'))return;const bs=[...modes.querySelectorAll('[data-plate]')];const i=bs.findIndex(b=>b.dataset.plate===plateMode);for(let k=1;k<=bs.length;k++){const b=bs[(i+k)%bs.length];if(!b.disabled){b.click();break;}}});
function onScroll(){if(layoutModule())return;if(panel.hidden||!pinned()||body.classList.contains('is-away'))return;const y=window.scrollY||0;if(y<10&&hold==='open')hold=null;collapse(hold==='open'?0:hold==='min'?1:y/Math.max(1,fullHeight()-MIN_H));}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',()=>{fitPlayer();onScroll();});
// Verified YouTube view total, published by the hourly stats workflow. Hidden until a figure exists; drift between checks is labelled as an estimate.
let stats=null,bursting=false;const SP=data.spotify||{total:0};const thin=n=>Math.floor(n).toLocaleString('en-US').replace(/,/g,'\u2009');
function totalNow(){const now=Date.now();let total=SP.total||0,est=false;if(SP.ratePerSecond>0&&Number.isFinite(Date.parse(SP.checkedAt))){total+=SP.ratePerSecond*Math.max(0,(now-Date.parse(SP.checkedAt))/1000);est=true;}if(stats){total+=stats.total;if(stats.ratePerSecond>0){total+=stats.ratePerSecond*Math.max(0,(now-Date.parse(stats.checkedAt))/1000);est=true;}}return {total:Math.floor(total),est,exact:total};}
function renderTotal(){const {total,est}=totalNow();const parts=[`Spotify ${SP.when||''}`.trim()];let title=`Spotify play counts across ${SP.tracks||0} credited tracks, read on ${SP.when||SP.checkedAt}`;if(stats){const when=new Date(Date.parse(stats.checkedAt));const hhmm=`${String(when.getHours()).padStart(2,'0')}:${String(when.getMinutes()).padStart(2,'0')}`;parts.push(`YouTube ${hhmm}`);title+=`, plus ${stats.total.toLocaleString('en-US')} YouTube views across ${stats.videos} credited videos, verified ${when.toLocaleString()}`;}title+=est?'. Between readings the figure rises at the measured rate; it is an estimate until the next verified reading.':'.';document.querySelectorAll('[data-total]').forEach(el=>{if(!bursting)el.textContent=thin(total);el.title=title;});document.querySelectorAll('[data-total-label]').forEach(el=>{el.textContent=`Streams · ${parts.join(' + ')}${est?' · est.':''}`;});}
function startCounter(){if(!document.querySelector('[data-total]'))return;SP.when=SP.when||(()=>{try{const d=new Date(Date.parse(SP.checkedAt));return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;}catch{return '';}})();let ticking=false,shown=-1,els=null;const calm=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;const rate=()=>(SP.ratePerSecond>0?SP.ratePerSecond:0)+(stats&&stats.ratePerSecond>0?stats.ratePerSecond:0);const rr=(a,b)=>a+Math.random()*(b-a);
 const write=n=>{shown=n;const t=thin(n);(els||(els=[...document.querySelectorAll('[data-total]')])).forEach(el=>{el.textContent=t;});};
 // The number moves the way plays come in: it sits for a moment (mostly a fraction of a second, sometimes a few seconds), then runs up one number at a time in a quick burst, catching up on all or part of what has come in meanwhile. It never runs ahead of the estimate, so over a minute it keeps the measured pace. After a long gap (a hidden tab) it jumps most of the way first, and a new verified reading is shown at once.
 const gap=()=>{const r=Math.random();return r<.45?rr(120,450):r<.8?rr(500,1400):rr(1500,3700);};
 const count=()=>{const {total}=totalNow();let d=total-shown;if(d<=0){if(d<0)write(total);setTimeout(count,gap());return;}
  if(d>Math.max(80,rate()*8)){write(total-Math.floor(Math.random()*12));d=total-shown;}
  const goal=shown+(Math.random()<.55?d:Math.max(1,Math.round(d*rr(.3,.8)))),pace=Math.max(11.5,Math.min(rr(20,44),1000/(Math.max(1,rate())*rr(2.8,3.6))));
  const run=()=>{if(shown<goal&&shown<totalNow().total){write(shown+1);setTimeout(run,pace*rr(.8,1.5));}else setTimeout(count,gap());};run();};
 const tick=fresh=>{renderTotal();const t=totalNow().total;if(fresh||shown<0||!bursting||Math.abs(t-shown)>Math.max(80,rate()*8))write(t);if(!ticking&&totalNow().est){ticking=true;setInterval(renderTotal,1000);if(!calm){bursting=true;count();}}};tick();
 if(typeof fetch!=='function'||!data.statsUrl)return;const read=()=>fetch(data.statsUrl,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(s=>{if(!s||!(s.total>0)||!Number.isFinite(Date.parse(s.checkedAt||'')))return;let fresh=false;if(!stats||Date.parse(s.checkedAt)>=Date.parse(stats.checkedAt)){fresh=!stats||s.checkedAt!==stats.checkedAt||s.total!==stats.total;stats=s;}tick(fresh);}).catch(()=>{});read();setInterval(read,300000);}
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
 leaveModule();if(!panel.hidden)collapse(1);document.title=`${ROUTES[path]} | Justin Bartlett | Recording | Mixing | Mastering`;markNav(path);if(push)history.pushState({path},'',path);window.scrollTo(0,0);}
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
// Radio: the records page plays twenty seconds of a credited song at a time (the order leaning on the streams, so the big songs mostly come first), from the moment it opens, muted, each from a point inside the middle of the song (drawn from the sheet's track length). Sound on (the orange chip on the tag, or a click anywhere on the collage) unmutes it and gives the song its full twenty seconds again; Sound off mutes it. Stations are the tracks whose listening link is a single YouTube video carrying that song alone. The video plays in a screen on the collage's pile: at each new station it pops up on top in a new place, overlapping and offset from the last, and a black-and-white still of the song before stays behind where it was. While it plays, new prints land over its edges, never covering more than a fifth of it; the controls (the song, Sound on, Next) sit in a bar along the bottom of the collage, on top of everything. When a new song pops up, the one before keeps playing, muted, where it was, until a print slides over it and it stops. Behind the whole box a second, silent copy of the playing song runs enlarged under frosted glass. Two players take turns: the next song loads and plays hidden and muted for a few seconds before it is shown, so YouTube's start-up overlay has cleared by the time it appears, and the switch is instant; the pointer never reaches the video, so YouTube's hover overlay never shows. A needle on the ruler above the wall runs to the record's place on the spectrum and its sleeve lights up. The page opens on the collage alone; the first song joins after a few seconds. Muted, it plays only while at least half the collage is on screen and the tab is in front, and starts again with a new song when it comes back; with the sound on it keeps going as the visitor scrolls. Under reduced motion, or when the browser will not play it, the screen waits with a song cued (its picture) and Listen starts it with the sound on. Opening a record or leaving the page ends it; it starts again muted on the way back.
(()=>{const box=$('radio');if(!box)return;
 const CLIP=20,XF=3.2,TAG=28,LEAD=3.2,PREP=7.5,GOING=5000,TUCK=1800;
 const secs=v=>{const m=String(v||'').match(/^(\d+):(\d{2})$/);return m?(+m[1])*60+(+m[2]):0;};
 const vidOf=u=>{const x=String(u||'');return x.includes('list=')?'':(x.match(/youtube\.com\/embed\/([\w-]{11})/)||[])[1]||'';};
 const norm=t=>String(t||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
 const homeOf=new Map();records.forEach(r=>(r.tracks||[]).forEach(id=>{if(!homeOf.has(id))homeOf.set(id,r.id);}));
 const byVid=new Map();tracks.forEach(t=>{const v=vidOf(t.embed);if(v){if(!byVid.has(v))byVid.set(v,[]);byVid.get(v).push(t);}});
 // Songs Justin didn't work on himself (data.radioSkip, from generate.py) never come on the radio.
 const skip=new Set(data.radioSkip||[]);
 const stations=[...byVid.entries()].filter(([,ts])=>ts.every(t=>norm(t.title)===norm(ts[0].title))&&!ts.some(t=>skip.has(t.id))).map(([v,ts])=>({v,t:ts[0],len:secs(ts[0].length),home:homeOf.get(ts[0].id)}));
 if(!stations.length){box.hidden=true;return;}
 const q=id=>$(id),el={video:q('radio-video'),poster:q('radio-poster'),title:q('radio-title'),sub:q('radio-sub'),count:q('radio-count'),needle:q('radio-needle'),play:q('radio-play'),skip:q('radio-skip'),full:q('radio-full')};
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 let state='off',muted=true,blocked=reduced,inView=false,cur=null,clipAt=0,tuneAt=0,movedAt=0,lastCt=-1,timer=0,swapAt=0,want=false,bag=[],last=null;const failed=new Set();
 const busy=()=>body.classList.contains('has-player')||body.classList.contains('is-away')||body.classList.contains('is-dissolving');
 // Where the screen goes: inside the clear part of the collage, as large as it allows and at least 356 × 200 (YouTube's smallest), and offset from where it last was. The collage is told, so its prints can land over it.
 let vrect=null;const frame=()=>document.getElementById('d-show');
 {const fb=frame();if(fb)fb._replan=g=>{const z=zoneBox();if(!z||!g)return;vrect={x:g[0],y:g[1],w:g[2],h:g[3],W:z.W,H:z.H};if(live?.el){live.rect=vrect;live.home=vrect;size(live.el.style,vrect);}tellCollage();};}
 const zoneBox=()=>{const b=frame();if(!b)return null;const W=b.clientWidth,H=b.clientHeight;if(!W||!H)return null;
  // The clear part of the frame, under the frosted band: the collage's own box.
  const br=b.getBoundingClientRect(),hr=(b.parentElement||b).getBoundingClientRect();return {W,H,X0:Math.max(0,hr.left-br.left),Y0:Math.max(0,hr.top-br.top),ZW:Math.min(W,hr.width||W),ZH:Math.min(H,hr.height||H)};};
 const placeScreen=()=>{const z=zoneBox();if(!z)return;const {W,H,X0,Y0,ZW,ZH}=z,crowd=ago.length>0;
  // In the collage's grid the screen takes the cell it is given.
  const g=frame()?._collage?.plan?.();if(g){vrect={x:g[0],y:g[1],w:g[2],h:g[3],W,H};box.style.setProperty('--vx',(g[0]/W*100).toFixed(2)+'%');box.style.setProperty('--vy',(g[1]/H*100).toFixed(2)+'%');box.style.setProperty('--vw',(g[2]/W*100).toFixed(2)+'%');box.style.setProperty('--vh',(g[3]/H*100).toFixed(2)+'%');return;}
  // Large: up to the full height of the clear part and most of its width (the controls bar may lie over its lower edge); a little smaller while earlier songs are still showing, so they have room.
  let w=Math.min(ZW,Math.max(356,Math.min(ZW*(crowd?.7+Math.random()*.1:.86),ZH*16/9))),h=w*9/16;if(h<200){h=200;w=Math.min(ZW,h*16/9);}
  const maxX=Math.max(0,ZW-w),maxY=Math.max(0,ZH-h);let x=X0+Math.random()*maxX,y=Y0+Math.random()*maxY;
  // A new song goes to the far side from the last, so the earlier ones show beside it.
  if(vrect){const fx=Math.random()*(crowd?.06:.25),fy=Math.random()*.3;x=vrect.x<X0+maxX/2?X0+maxX*(1-fx):X0+maxX*fx;y=vrect.y<Y0+maxY/2?Y0+maxY*(1-fy):Y0+maxY*fy;}
  vrect={x,y,w,h,W,H};box.style.setProperty('--vx',(x/W*100).toFixed(2)+'%');box.style.setProperty('--vy',(y/H*100).toFixed(2)+'%');box.style.setProperty('--vw',(w/W*100).toFixed(2)+'%');tuck(z);};
 // The earlier songs still showing keep their size and slide, under the new screen, to wherever most of them stays in view. They keep their place in the pile.
 const coverR=(r,over)=>{let hit=0;for(let a=0;a<10;a++)for(let b=0;b<6;b++){const x=r[0]+r[2]*(a+.5)/10,y=r[1]+r[3]*(b+.5)/6;if(over.some(o=>x>=o[0]&&x<=o[0]+o[2]&&y>=o[1]&&y<=o[1]+o[3]))hit++;}return hit/60;};
 const tuck=z=>{if(!vrect)return;const {W,H,X0,Y0,ZW,ZH}=z,taken=[[vrect.x,vrect.y,vrect.w,vrect.h]];
  // Each earlier song keeps its own size and slides to wherever most of it shows round the new screen (and the earlier songs already moved), a little past the edges of the clear part if need be; it would rather not travel far.
  ago.slice().reverse().forEach(o=>{const hm=o.home;if(!o.el||!hm)return;const vw=hm.w,vh=hm.h;let best=null;
   for(let t=0;t<30;t++){const a=t%6,b=Math.floor(t/6),x=X0-vw*.16+(ZW-vw+vw*.32)*a/5,y=Y0-vh*.1+(ZH-vh+vh*.22)*b/4,r=[x,y,vw,vh];let sc=1-coverR(r,taken);if(o.rect)sc-=Math.hypot(o.rect.x-x,o.rect.y-y)/(ZW+ZH)*.2;sc+=Math.random()*.05;if(!best||sc>best.sc)best={sc,x,y};}
   const st=o.el.style;st.setProperty('--ts','1');st.setProperty('--tx',((best.x-hm.x)/hm.w*100).toFixed(2)+'%');st.setProperty('--ty',((best.y-hm.y)/hm.h*100).toFixed(2)+'%');
   o.rect={x:best.x,y:best.y,w:vw,h:vh,W,H};taken.push([best.x,best.y,vw,vh]);});
  keepTell();};
 const keepTell=()=>{const c=frame()?._collage;if(c?.keep)c.keep(ago.filter(o=>o.rect).map(o=>pct(o.rect)));};
 const tellCollage=()=>{const c=frame()?._collage;if(!c)return;const on=vrect&&state!=='off';c.vid(on?[vrect.x/vrect.W*100,vrect.y/vrect.H*100,vrect.w/vrect.W*100,vrect.h/vrect.H*100]:null,on?[vrect.x/vrect.W*100,vrect.y/vrect.H*100,vrect.w/vrect.W*100,vrect.h/vrect.H*100]:null);};
 const pct=r=>[r.x/r.W*100,r.y/r.H*100,r.w/r.W*100,r.h/r.H*100];
 const leaveStill=(x,r=vrect)=>{const c=frame()?._collage;if(!c||!r||!x)return;c.still(`https://i.ytimg.com/vi/${x.v}/hqdefault.jpg`,`Still from ${x.t.title}`,[x.t.title,x.t.artist].filter(Boolean).join(' · '),pct(r));};
 const label=()=>{const going=state==='on'||state==='tuning';if(el.play){el.play.textContent=!going?'▶︎ Listen':muted?'Sound on':'Sound off';el.play.setAttribute('aria-pressed',String(going&&!muted));el.play.classList.toggle('is-call',!going||muted);}if(el.full)el.full.hidden=!cur||!going||muted;};
 const setState=v=>{state=v;box.dataset.state=v;label();if(el.skip)el.skip.disabled=!(v==='on'||v==='tuning');tellCollage();};
 const fill=n=>[...(el.count?.children||[])].forEach((d,i)=>d.classList.toggle('is-filled',i<n));
 // The order leans on the streams: each song's place is its stream count (in orders of magnitude) plus a random shake of up to one and a half, so the big songs mostly come up first while songs of a similar size still trade places.
 const pick=()=>{if(!bag.length)bag=stations.filter(x=>!failed.has(x.v)).map(x=>[Math.log10((x.t?.streams||0)+1000)+Math.random()*1.4,x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);let x=bag.pop();if(x&&last&&x.v===last.v&&bag.length)x=bag.pop();return x||null;};
 const startFor=x=>{const L=x.len;if(L>CLIP+30){const lo=Math.max(20,L*.28),hi=Math.max(lo,Math.min(L*.62,L-CLIP-10));return Math.round(lo+Math.random()*(hi-lo));}return L>CLIP+4?Math.round((L-CLIP)/2):0;};
 // Where a record sits on the dial: under Hue, its column and row on the wall (the spectrum runs left to right); under the other sorts, its place in the order.
 const posOf=id=>{const tile=tiles.get(id);if(!tile)return .5;const cols=Math.max(1,wallColumns()),gc=parseInt(tile.style.getPropertyValue('grid-column'),10),gr=parseInt(tile.style.getPropertyValue('grid-row'),10);
  if(wall.dataset.sort==='hue'&&gc){let rows=1;tiles.forEach(t=>{if(t.style.getPropertyValue('grid-column')===String(gc))rows=Math.max(rows,parseInt(t.style.getPropertyValue('grid-row'),10)||1);});return Math.min(1,Math.max(0,(gc-1+((gr||1)-.5)/rows)/cols));}
  let max=1;tiles.forEach(t=>{max=Math.max(max,+t.style.getPropertyValue('order')||0);});return Math.min(1,Math.max(0,(+tile.style.getPropertyValue('order')||0)/max));};
 // Four players: the live one, the two songs before it (still playing, muted, shrunk into the corners), and the next one loading out of sight. Each keeps its song, where it starts, and when it began playing.
 const slots=[0,1,2,3].map(i=>({i,el:null,yt:null,vol:0,fT:0,x:null,startAt:0,since:0,sought:false,code:-1,at:0,mk:false,rect:null,home:null,gt:0,gx:null,buried:false,tp:null}));let live=null,nxt=null;const ago=[];
 const keepN=()=>frame()?._collage?.isGrid?.()?0:typeof matchMedia==='function'&&matchMedia('(min-width: 821px)').matches?2:1;
 const showing=s=>s===live||ago.includes(s)||!!s.el?.classList.contains('is-going');
 const other=()=>{if(!nxt||showing(nxt))nxt=slots.find(s=>!showing(s))||ago[0]||slots.find(s=>s!==live);return nxt;};
 const host=s=>{if(!s.el){s.el=document.createElement('div');s.el.className='radio-slot';el.video?.append(s.el);}return s.el;};
 const ready=(s,lead)=>!!s&&!!s.x&&s.code===1&&s.since>0&&performance.now()-s.since>=lead*1000;
 // Each player's volume is faded on its own, on equal-power curves, so one song crosses into the next (the old one down while the new one comes up). The screen's glass edge follows its volume (--v), and every print's edge rises with the loudest song (--live on the collage). A player faded out is muted (and its volume left alone: YouTube unmutes a player whose volume is set).
 const level=(s,v)=>{s.vol=v;try{s.yt?.setVolume?.(v);}catch{}s.el?.style.setProperty('--v',(v/100).toFixed(3));s.el?.classList.toggle('is-loud',v>40);frame()?.style.setProperty('--live',(Math.max(0,...slots.map(o=>o.vol||0))/100).toFixed(2));};
 const quiet=s=>{clearInterval(s.fT);s.fT=0;s.vol=0;try{s.yt?.mute?.();}catch{}s.el?.style.setProperty('--v','0');s.el?.classList.remove('is-loud');};
 const fade=(s,to,ms,then)=>{clearInterval(s.fT);s.fT=0;if(!s.yt?.setVolume){then?.();return;}const from=s.vol||0,t0=performance.now(),up=to>from;
  s.fT=setInterval(()=>{const k=Math.min(1,(performance.now()-t0)/Math.max(1,ms)),e=up?Math.sin(k*Math.PI/2):1-Math.cos(k*Math.PI/2);level(s,Math.round(from+(to-from)*e));if(k>=1){clearInterval(s.fT);s.fT=0;then?.();}},40);};
 const hush=()=>slots.forEach(quiet);
 // The tag and the dial: the song, who it is by and the credit; the needle and the sleeve on air.
 const show=x=>{if(el.title)el.title.textContent=x.t.title;if(el.sub){const a=document.createElement('span'),c=document.createElement('span');a.className='radio-band';a.textContent=x.t.artist||'';c.className='radio-role';c.textContent=x.t.credit?(x.t.artist?' · ':'')+x.t.credit:'';el.sub.replaceChildren(a,c);}
  if(el.poster){el.poster.src=`https://i.ytimg.com/vi/${x.v}/hqdefault.jpg`;el.poster.alt='';el.poster.hidden=false;}
  if(el.needle){el.needle.hidden=false;el.needle.style.left=`${(posOf(x.home)*100).toFixed(2)}%`;}tiles.forEach(t=>t.classList.toggle('is-on-air',t.dataset.id===x.home));
  };
 // Each screen has its own place and its own height in the pile, so the song before can stay where it was while the new one pops up on top somewhere else.
 const size=(st,r)=>{const [x,y,w,h]=pct(r);st.setProperty('--x',x.toFixed(2)+'%');st.setProperty('--y',y.toFixed(2)+'%');st.setProperty('--w',w.toFixed(2)+'%');st.setProperty('--hh',h.toFixed(2)+'%');st.setProperty('--iw',Math.ceil(Math.max(r.w,r.h*16/9,356))+'px');};
 const seat=s=>{const r=vrect;if(!r||!s.el)return;s.rect=r;s.home=r;const st=s.el.style;['--ts','--tx','--ty'].forEach(k=>st.removeProperty(k));size(st,r);const c=frame()?._collage;if(c)st.setProperty('--z',String(c.raise()));};
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
  loadYoutubeApi().then(YT=>{const holder=document.createElement('div'),keep=[...h.querySelectorAll('.glass-spill,.radio-edge')];h.replaceChildren(holder);keep.forEach(k=>h.appendChild(k));
   s.yt=new YT.Player(holder,{width:'100%',height:'100%',videoId:x.v,playerVars:{autoplay:1,mute:1,start:s.startAt,controls:0,playsinline:1,rel:0,iv_load_policy:3,cc_load_policy:0,disablekb:1,fs:0,modestbranding:1,origin:location.origin},
    events:{onReady:e=>{try{e.target.mute();if(!s.x){e.target.pauseVideo();return;}if(s.x.v!==x.v)e.target.loadVideoById({videoId:s.x.v,startSeconds:s.startAt});else e.target.playVideo();}catch{}},onStateChange:e=>onState(s,e.data),
     onError:()=>{if(s.x)failed.add(s.x.v);if(s===live)want=true;else if(state!=='off'&&s.x){s.x=null;}},
     onAutoplayBlocked:()=>{blocked=true;if(state==='tuning'){stop();idle();}}}});});};
 const prepare=()=>{const x=pick();if(x)load(other(),x);};
 // The hidden player becomes the live one: its screen pops up on top in a new place, the song before stays where it was for a few seconds (see retire), and the sound (if on) comes up.
 const reveal=s=>{const old=live,xf=want?1200:XF*1000;live=s;nxt=null;if(old){if(!muted&&state==='on')fade(old,0,xf,()=>quiet(old));else quiet(old);untwin(old);old.el?.classList.remove('is-live');if(state==='on'){old.el?.classList.add('is-going');old.gx=old.x;old.buried=false;ago.push(old);const grid=!!frame()?._collage?.isGrid?.();while(ago.length>keepN())retire(ago[0],grid?xf+200:TUCK);}else end(old);old.x=null;old.since=0;placeScreen();}
  seat(s);frame()?._collage?.commit?.();{const c=frame()?._collage,im=tiles.get(s.x.home)?.querySelector('img'),src=im?.getAttribute('src');if(c?.sleeve&&src&&vrect)c.sleeve(src,`Sleeve of ${s.x.t.title}${s.x.t.artist?` by ${s.x.t.artist}`:''}`,[s.x.t.title,s.x.t.artist].filter(Boolean).join(' · '),pct(vrect));}cur=last=s.x;s.el.classList.add('is-live');const tw=T(s);if(tw){tw.el.classList.add('is-live');try{tw.tw?.seekTo?.((s.yt?.getCurrentTime?.()||s.startAt)+.3,true);tw.tw?.playVideo?.();}catch{}}const p=s.yt;clipAt=p?.getCurrentTime?.()||0;lastCt=clipAt;movedAt=performance.now();swapAt=0;want=false;fill(0);setState('on');show(s.x);
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
 const idle=()=>{const x=cur&&!failed.has(cur.v)?cur:pick();if(!x)return;cur=last=x;live=null;placeScreen();frame()?._collage?.commit?.();const c=frame()?._collage;if(c)box.style.setProperty('--vz',String(c.raise()));setState('idle');show(x);};
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
