
/* ── 提醒（各自計時）── */
const REM=[['water','rwater','rwaterT'],['meal','rmeal','rmealT'],['sport','rsport','rsportT']];
function reminderTick(){if(!S||!S.set)return;const now=Date.now();S.remClock=S.remClock||{};let ch=0;
  S.contacts.forEach(c=>{ctxSet(c.id);const rc=S.remClock[c.id]||(S.remClock[c.id]={});
    REM.forEach(([kd,pkey,tkey])=>{const T=Math.max(1,+S.set[tkey]||1)*1000;if(!rc[kd]){rc[kd]=now+T;ch=1;return}if(rc[kd]>now)return;rc[kd]=now+T;ch=1;if(c.dnd)return;
      const p=pool(kd,c.id);if(S.kon[kd]===0||!p.length||rnd()*100>=(+S.set[pkey]||0))return;
      const b=ms(c.id).length;ms(c.id).push({id:uid(),f:'ta',x:pk(p).text,t:Date.now()});notify(c.id,b);
      if(tab==='chat'&&S.cur===c.id)paint();else if(tab==='contacts'&&!document.activeElement.isContentEditable)render();badge()})});
  if(ch)save()}
setInterval(reminderTick,5000);
/* ── 聯絡人排序：長按「⇅」0.5 秒後上下拖曳 ── */
(()=>{let t=null,row=null,btn=null,drag=false,sy=0,y0=0,s0=0,lastY=0,info=[],di=0,shift=0,ti=0,iv=null;
const rows=()=>[...document.querySelectorAll('#v .con-wrap')];
const clean=()=>{clearInterval(iv);iv=null;clearTimeout(t);t=null;if(row)row.classList.remove('holding','drag');if(btn)btn.classList.remove('holding');rows().forEach(r=>{r.style.transform='';r.style.transition=''});row=null;btn=null;drag=false;window.__drag=false};
const apply=()=>{if(!drag||!row)return;const v=$('#v'),vr=v.getBoundingClientRect();if(lastY<vr.top+60)v.scrollTop-=10;else if(lastY>vr.bottom-60)v.scrollTop+=10;
  const dy=(lastY-y0)+(v.scrollTop-s0);row.style.transform='translateY('+dy+'px) scale(1.02)';
  const c=info[di].top+info[di].h/2+dy;let n=0;info.forEach((o,j)=>{if(j!==di&&o.top+o.h/2<c)n++});ti=n;
  info.forEach((o,j)=>{if(j===di)return;let y=0;if(ti>di&&j>di&&j<=ti)y=-shift;else if(ti<di&&j>=ti&&j<di)y=shift;o.r.style.transition='transform .15s';o.r.style.transform=y?'translateY('+y+'px)':''})};
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.mv');if(!b||tab!=='contacts')return;clean();row=b.closest('.con-wrap');btn=b;sy=lastY=e.clientY;row.classList.add('holding');b.classList.add('holding');
  t=setTimeout(()=>{const v=$('#v'),rs=rows();di=rs.indexOf(row);if(di<0){clean();return}drag=true;window.__drag=true;y0=sy;s0=v.scrollTop;
    info=rs.map(r=>{const q=r.getBoundingClientRect();return{r,top:q.top+v.scrollTop,h:q.height}});shift=info[di].h+(parseFloat(getComputedStyle(row).marginBottom)||10);
    row.classList.add('drag');row.style.transition='none';if(navigator.vibrate)try{navigator.vibrate(30)}catch(x){}toast('可以拖曳了，放開即完成',1500);iv=setInterval(apply,30)},500)});
document.addEventListener('pointermove',e=>{if(!row)return;lastY=e.clientY;if(!drag){if(Math.abs(e.clientY-sy)>12)clean();return}e.preventDefault();apply()},{passive:false});
const done=ok=>{if(!row)return;if(drag&&ok){apply();const ids=info.map(o=>o.r.dataset.c),id=ids.splice(di,1)[0];ids.splice(ti,0,id);S.contacts.sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id));save();clean();render()}else clean()};
document.addEventListener('pointerup',()=>done(true));document.addEventListener('pointercancel',()=>done(false));
document.addEventListener('contextmenu',e=>{if(e.target.closest('.mv'))e.preventDefault()});
})();
/* 常用：展開的大分類標題與搜尋列吸在「共用／專屬」下方 */
(()=>{const fix=()=>{const t=document.querySelector('.cards-top.big-top'),w=document.querySelector('.big-list');if(t&&w)w.style.setProperty('--bigtop',(t.offsetHeight-16)+'px')};
const r0=render;render=function(){const x=r0.apply(this,arguments);fix();requestAnimationFrame(fix);return x};window.addEventListener('resize',fix)})();
/* ── 分類編輯：長按「⇅」0.5 秒後上下拖曳，字卡裡的分類順序一起改 ── */
(()=>{let t=null,row=null,btn=null,drag=false,sy=0,y0=0,s0=0,lastY=0,info=[],di=0,shift=0,ti=0,iv=null,list=null;
const rows=()=>[...document.querySelectorAll('#sh .catedit-row')];
const clean=()=>{clearInterval(iv);iv=null;clearTimeout(t);t=null;if(row)row.classList.remove('holding','drag');if(btn)btn.classList.remove('holding');rows().forEach(r=>{r.style.transform='';r.style.transition=''});row=null;btn=null;list=null;drag=false;window.__drag=false};
const apply=()=>{if(!drag||!row||!list)return;const vr=list.getBoundingClientRect();if(lastY<vr.top+36)list.scrollTop-=8;else if(lastY>vr.bottom-36)list.scrollTop+=8;
  const dy=(lastY-y0)+(list.scrollTop-s0);row.style.transform='translateY('+dy+'px) scale(1.02)';
  const c=info[di].top+info[di].h/2+dy;let n=0;info.forEach((o,j)=>{if(j!==di&&o.top+o.h/2<c)n++});ti=n;
  info.forEach((o,j)=>{if(j===di)return;let y=0;if(ti>di&&j>di&&j<=ti)y=-shift;else if(ti<di&&j>=ti&&j<di)y=shift;o.r.style.transition='transform .15s';o.r.style.transform=y?'translateY('+y+'px)':''})};
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.cemv');if(!b)return;clean();row=b.closest('.catedit-row');list=row.parentElement;btn=b;sy=lastY=e.clientY;row.classList.add('holding');b.classList.add('holding');
  t=setTimeout(()=>{const rs=rows();di=rs.indexOf(row);if(di<0){clean();return}drag=true;window.__drag=true;y0=sy;s0=list.scrollTop;
    info=rs.map(r=>{const q=r.getBoundingClientRect();return{r,top:q.top+list.scrollTop,h:q.height}});shift=info[di].h+(parseFloat(getComputedStyle(row).marginBottom)||6);
    row.classList.add('drag');row.style.transition='none';if(navigator.vibrate)try{navigator.vibrate(30)}catch(x){}toast('可以拖曳了，放開即完成',1500);iv=setInterval(apply,30)},500)});
document.addEventListener('pointermove',e=>{if(!row)return;lastY=e.clientY;if(!drag){if(Math.abs(e.clientY-sy)>12)clean();return}e.preventDefault();apply()},{passive:false});
const done=ok=>{if(!row)return;if(drag&&ok){apply();const ids=info.map(o=>o.r.dataset.ce),id=ids.splice(di,1)[0];ids.splice(ti,0,id);
    const slots=[];S.cats.forEach((c,ix)=>{if(ids.includes(c.id))slots.push(ix)});const objs=ids.map(x=>S.cats.find(c=>c.id===x)).filter(Boolean);
    if(objs.length===slots.length){slots.forEach((ix,n)=>{S.cats[ix]=objs[n]});save()}
    clean();render();catEditSheet()}else clean()};
document.addEventListener('pointerup',()=>done(true));document.addEventListener('pointercancel',()=>done(false));
document.addEventListener('contextmenu',e=>{if(e.target.closest('.cemv'))e.preventDefault()});
})();
/* ── 常用大分類：左滑露出「停用／刪除」 ── */
(()=>{let cur=null,x0=0,y0=0,base=0,W=0,mode=0,pid=null,opened=null,blockUntil=0;
const setP=(sw,off,anim)=>{const p=Math.min(1,Math.max(0,-off/W));sw.style.setProperty('--p',p);const r=sw.querySelector('.big-row');if(r){r.style.transition=anim?'transform .32s cubic-bezier(.2,.85,.3,1)':'none';r.style.transform='translateX('+off+'px)'}const a=sw.querySelector('.big-acts');if(a)a.style.transition=anim?'opacity .2s':'none';sw.querySelectorAll('.big-act').forEach(b=>{b.style.transition=anim?'transform .2s':'none'})};
const RB=o=>58*(1-Math.exp(-o/72));
const closeAll=(except)=>{document.querySelectorAll('.big-swipe.sopen').forEach(e=>{if(e!==except){e.classList.remove('sopen');setP(e,0,true)}})};
document.addEventListener('pointerdown',e=>{const sw=e.target.closest('.big-swipe');if(!sw||e.target.closest('.bigmv,.mv,.big-act')){if(!e.target.closest('.big-act'))closeAll();return}
  if(window.__drag)return;closeAll(sw.classList.contains('sopen')?sw:null);cur=sw;W=+sw.dataset.w||120;x0=e.clientX;y0=e.clientY;base=sw.classList.contains('sopen')?-W:0;mode=0;pid=e.pointerId});
document.addEventListener('pointermove',e=>{if(!cur||e.pointerId!==pid)return;const dx=e.clientX-x0,dy=e.clientY-y0;
  if(!mode){if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)*1.2){mode=1;try{cur.setPointerCapture(e.pointerId)}catch(x){}}else if(Math.abs(dy)>8){cur=null;return}}
  if(mode===1){e.preventDefault();let off=base+dx;/* 超過範圍後越拉越吃力（像繩子拉緊），左右兩邊都一樣 */if(off<-W)off=-W-RB(-W-off);else if(off>0)off=RB(off);setP(cur,off,false)}},{passive:false});
const end=()=>{if(!cur)return;const sw=cur;cur=null;if(mode!==1)return;blockUntil=Date.now()+350;const r=sw.querySelector('.big-row'),m=r&&/translateX\((-?[\d.]+)px\)/.exec(r.style.transform),off=m?parseFloat(m[1]):0,open=off<-W/2;sw.classList.toggle('sopen',open);setP(sw,open?-W:0,true)};
document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
document.addEventListener('click',e=>{if(Date.now()<blockUntil&&e.target.closest('.big-swipe')){e.stopPropagation();e.preventDefault();return}
  const sw=e.target.closest('.big-swipe');if(sw&&sw.classList.contains('sopen')&&!e.target.closest('.big-act')){e.stopPropagation();e.preventDefault();closeAll()}},true);
})();
/* ── 常用大分類：長按「⇅」0.5 秒後上下拖曳排序（「未分類」固定在最後） ── */
(()=>{let t=null,wrap=null,btn=null,drag=false,sy=0,y0=0,s0=0,lastY=0,info=[],di=0,shift=0,ti=0,iv=null,list=null,sc=null;
const wraps=()=>list?[...list.querySelectorAll('.big-wrap')].filter(w=>w.querySelector('.bigmv')):[];
const clean=()=>{clearInterval(iv);iv=null;clearTimeout(t);t=null;if(list)list.classList.remove('bigdrag');if(wrap)wrap.classList.remove('holding','drag');if(btn)btn.classList.remove('holding');wraps().forEach(r=>{r.style.transform='';r.style.transition=''});wrap=null;btn=null;list=null;sc=null;drag=false;window.__drag=false};
const apply=()=>{if(!drag||!wrap||!sc)return;const vr=sc.getBoundingClientRect();if(lastY<vr.top+50)sc.scrollTop-=9;else if(lastY>vr.bottom-50)sc.scrollTop+=9;
  const dy=(lastY-y0)+(sc.scrollTop-s0);wrap.style.transform='translateY('+dy+'px)';
  const c=info[di].top+info[di].h/2+dy;let n=0;info.forEach((o,j)=>{if(j!==di&&o.top+o.h/2<c)n++});ti=n;
  info.forEach((o,j)=>{if(j===di)return;let y=0;if(ti>di&&j>di&&j<=ti)y=-shift;else if(ti<di&&j>=ti&&j<di)y=shift;o.r.style.transition='transform .15s';o.r.style.transform=y?'translateY('+y+'px)':''})};
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.bigmv');if(!b)return;clean();wrap=b.closest('.big-wrap');list=wrap.parentElement;sc=document.querySelector('#v');btn=b;sy=lastY=e.clientY;wrap.classList.add('holding');b.classList.add('holding');
  t=setTimeout(()=>{list.classList.add('bigdrag');const rs=wraps();di=rs.indexOf(wrap);if(di<0){clean();return}drag=true;window.__drag=true;y0=sy;s0=sc.scrollTop;
    info=rs.map(r=>{const q=r.getBoundingClientRect();return{r,top:q.top+sc.scrollTop,h:q.height}});shift=info[di].h;
    wrap.classList.add('drag');wrap.style.transition='none';if(navigator.vibrate)try{navigator.vibrate(30)}catch(x){}toast('可以拖曳了，放開即完成',1500);iv=setInterval(apply,30)},500)});
document.addEventListener('pointermove',e=>{if(!wrap)return;lastY=e.clientY;if(!drag){if(Math.abs(e.clientY-sy)>12)clean();return}e.preventDefault();apply()},{passive:false});
const done=ok=>{if(!wrap)return;if(drag&&ok){apply();const ids=info.map(o=>o.r.dataset.b),id=ids.splice(di,1)[0];ids.splice(ti,0,id);
    const all=bigsAll(),slots=[];all.forEach((c,ix)=>{if(ids.includes(c.id))slots.push(ix)});const objs=ids.map(x=>all.find(c=>c.id===x)).filter(Boolean);
    if(objs.length===slots.length){slots.forEach((ix,n)=>{all[ix]=objs[n]});save()}
    clean();render()}else clean()};
document.addEventListener('pointerup',()=>done(true));document.addEventListener('pointercancel',()=>done(false));
document.addEventListener('contextmenu',e=>{if(e.target.closest('.bigmv'))e.preventDefault()});
})();
/* ── 聯絡人名字還是預設「名字」時，點擊先清空，直接輸入 ── */
document.addEventListener('focusin',e=>{const el=e.target;if(el&&el.dataset&&(el.dataset.a==='ren'||el.dataset.n==='c')&&el.isContentEditable&&el.textContent.trim()==='名字')el.textContent=''});
/* ── 美化：確認浮窗與選色器 ── */
const PN={home:'主頁',contacts:'聯絡人',chat:'聊天室',cards:'字卡',set:'設定'};
function askChange(item,key,fn,reset){pendingChange=fn;const sc=(!key||key==='all')?'此程式所有':'「'+(PN[key]||key)+'」介面的';
  sheet('確認變更','<p style="margin:0 0 8px;line-height:1.8;font-size:calc(15px*var(--fz,1))">將'+(reset?'還原':'變更')+sc+item+(reset?'為預設':'')+'，是否確認？</p><div style="display:flex;gap:8px"><button class="btn" data-a="close" style="flex:1;margin-top:0">取消</button><button class="btn s" data-a="bcok" style="flex:1;margin-top:0">確認</button></div>',1)}
const hex2rgb=h=>{const m=/^#?([0-9a-f]{6})$/i.exec((h||'').trim());if(!m)return null;const n=parseInt(m[1],16);return[n>>16&255,n>>8&255,n&255]};
const rgb2hsv=([r,g,b])=>{r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}return[h,mx?d/mx:0,mx]};
const hsv2hex=(h,s,v)=>{const f=n=>{const k=(n+h/60)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1))};return '#'+[f(5),f(3),f(1)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')};
const CPRE=['#5f5b8d','#8a84d6','#aca6e4','#cbc7ee','#f6f2ff','#ffffff','#f4b6c8','#ffd6e0','#a7c7e7','#bfe3d0','#ffe9b8','#3c366a','#333333','#000000'];
function colorSheet(){const T={tc:'選擇字體顏色',lc:'選擇外框顏色',bgc:'選擇背景顏色'}[cpk.t];
  sheet(T,'<div class="cp-prev"><div><span class="pv" style="background:'+cpk.orig+'"></span><small>原本</small></div><div><span class="pv" id="cpnew"></span><small>目前選的</small></div><input id="cphex" maxlength="7" autocomplete="off" spellcheck="false"></div><div id="cpsv" class="cp-sv"><i id="cpdot"></i></div><div id="cph" class="cp-h"><i id="cphd"></i></div><div class="cp-pre">'+CPRE.map(c=>'<button type="button" data-a="cppre" data-i="'+c+'" style="background:'+c+'" aria-label="'+c+'"></button>').join('')+'</div><p class="hint" style="margin:0 0 8px">可以隨意拖曳、重複挑選，按「確定」才會往下一步。</p><div class="cp-btns"><button class="btn" data-a="close">取消</button><button class="btn s" data-a="cpok">確定</button></div>',1);cpUI()}
function cpUI(skipHex){if(!cpk||!$('#cpsv'))return;const hx=hsv2hex(cpk.h,cpk.s,cpk.v);cpk.hex=hx;$('#cpnew').style.background=hx;if(!skipHex)$('#cphex').value=hx;
  $('#cpsv').style.background='linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl('+cpk.h+',100%,50%))';
  const d=$('#cpdot');d.style.left=cpk.s*100+'%';d.style.top=(1-cpk.v)*100+'%';$('#cphd').style.left=cpk.h/360*100+'%'}
function cpSet(hx){const rgb=hex2rgb(hx);if(!rgb||!cpk)return;[cpk.h,cpk.s,cpk.v]=rgb2hsv(rgb);cpUI()}
function cpMove(e){const el=cpk&&cpk.drag&&$('#'+cpk.drag);if(!el)return;const r=el.getBoundingClientRect(),x=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),y=Math.min(1,Math.max(0,(e.clientY-r.top)/r.height));if(cpk.drag==='cpsv'){cpk.s=x;cpk.v=1-y}else cpk.h=Math.min(359.9,x*360);cpUI()}
document.addEventListener('pointerdown',e=>{const a=cpk&&e.target.closest('#cpsv,#cph');if(!a)return;cpk.drag=a.id;try{a.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault();cpMove(e)});
document.addEventListener('pointermove',e=>{if(cpk&&cpk.drag)cpMove(e)});
document.addEventListener('pointerup',()=>{if(cpk)cpk.drag=null});
/* ── 輸入框：點擊全選，留空則還原 ── */
const isTxt=el=>el&&((el.tagName==='INPUT'&&!['date','color','range','file','checkbox','radio','button','submit'].includes(el.type))||(el.tagName==='TEXTAREA'&&el.classList.contains('sl')));
document.addEventListener('focusin',e=>{const el=e.target;if(isTxt(el)){el.dataset.orig=el.value;if(el.id!=='newContactName'&&!((tab==='chat'||tab==='contacts')&&el.type!=='number'))setTimeout(()=>{if(document.activeElement===el){try{el.select()}catch(x){}}},0)}
  else if(el&&el.isContentEditable&&!(el.dataset&&el.dataset.a==='ren')){setTimeout(()=>{if(document.activeElement===el){const r=document.createRange();r.selectNodeContents(el);const g=getSelection();g.removeAllRanges();g.addRange(r)}},0)}});
const restoreEmpty=e=>{const el=e.target;if(isTxt(el)&&(el.type==='number'||el.id==='ai'||el.id==='today-mood-text')&&el.value.trim()===''&&el.dataset.orig){el.value=el.dataset.orig;el.dispatchEvent(new Event('input',{bubbles:true}))}};
document.addEventListener('change',restoreEmpty,true);document.addEventListener('focusout',restoreEmpty,true);

document.addEventListener('click',e=>{if(tab!=='chat'||xOn())return;if(e.target.closest('.mact')){setTimeout(()=>{const o=$('#cl .mact');if(o)o.remove()},0);return}
  const bub=e.target.closest('#cl .m .b'),old=$('#cl .mact');let same=false;if(old){same=!!bub&&old.parentNode===bub;old.remove()}
  if(!bub||same||bub.classList.contains('qa-b'))return;
  const id=bub.closest('.m').id.slice(2),m=ms(S.cur).find(x=>x.id===id);if(!m)return;
  const b=(a,t)=>'<button type="button" data-a="'+a+'" data-i="'+id+'">'+t+'</button>';
  bub.insertAdjacentHTML('afterbegin','<div class="mact">'+b('qt','引用')+(m.f==='me'?(m.img?'':b('medt','編輯'))+b('mdelm','刪除'):'')+'</div>')});
/* ── 聯絡人資料浮窗：背景卡片、頭像、狀態，左半邊是最常用字卡（前 50） ── */
function conTopCards(cid,n){const u=(S.cuse||{})[cid]||{},fm=((S.cfirst||{})[cid])||{},msgs=ms(cid)||[];
  const first=k=>{if(fm[k.id])return fm[k.id];const m=msgs.find(x=>x&&x.f==='ta'&&x.x&&String(x.x).indexOf(k.text)>-1);return m?m.t:Infinity};
  return S.cards.filter(k=>k.text&&u[k.id]>0).map(k=>[k,u[k.id],first(k)]).sort((a,b)=>b[1]-a[1]||a[2]-b[2]).slice(0,n).map(o=>[o[0],o[1]])}
/* ── 聯絡人資料卡：背景可裁剪、右下角設定（配色／排名清除）、常用字卡＋表情包排行台 ── */
const CI_DEF={bg:'#fdfcff',ink:'#5f5b8d',line:'#cbc7ee',topInk:'#5f5b8d',topBg:'#f6f2ff',rankBg:'#f6f2ff'};
const CI_LBL=[['bg','整張卡的顏色'],['ink','字體顏色'],['line','方框顏色'],['topInk','常用字卡的字體顏色'],['topBg','常用字卡的區塊背景'],['rankBg','表情包排行的區塊背景']];
const ciCol=(c,k)=>(c.ci&&c.ci[k])||'';
function conTopEmoji(c,n){const m={},t0=c.eclr||0;(ms(c.id)||[]).forEach(x=>{if(x&&x.f==='ta'&&x.img&&x.t>=t0)m[x.img]=(m[x.img]||0)+1});return Object.keys(m).map(u=>[u,m[u]]).sort((a,b)=>b[1]-a[1]).slice(0,n)}
function ciRankHtml(c){const r=conTopEmoji(c,6),cell=(o,i)=>o?'<img src="'+o[0]+'" alt=""><b>×'+o[1]+'</b>':'<span class="ci-no">—</span>';
  const pod=[[2,'p3'],[0,'p1'],[1,'p2']].map(([ix,cl])=>'<div class="pc '+cl+'"><div class="pi">'+cell(r[ix])+'</div><div class="base">'+(ix+1)+'</div></div>').join('');
  const low=[3,4,5].map(ix=>'<div class="lc"><div class="pi">'+cell(r[ix])+'</div><i>'+(ix+1)+'</i></div>').join('');
  return '<h3>表情包排行</h3><div class="ci-rbox"><div class="ci-pod">'+pod+'</div><div class="ci-low">'+low+'</div></div>'}
function conInfoSheet(cid){const c=S.contacts.find(x=>x.id===cid);if(!c)return;const top=conTopCards(cid,50);
  const cv=c.cover,head='<div class="ci-head"><div class="ci-cover" data-a="cicover" data-i="'+c.id+'" role="button" aria-label="更換背景卡片"'+(cv?' style="background-image:url('+cv+')"':'')+'>'+(cv?'':'<div class="mom-hint"><b>＋</b>點擊放上背景圖片</div>')+'</div>'+(cv?'<button type="button" class="ci-cx" data-a="cicdelask" data-i="'+c.id+'" aria-label="移除背景"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>':'')+'<button type="button" class="ci-gear" data-a="cigear" data-i="'+c.id+'" aria-label="資料卡設定"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg></button>'+avh(c,'ci-av msgav')+'<div class="ci-who"><b>'+esc(c.name)+'</b><small class="chat-status">'+esc(c.status||'尚未抽取狀態')+'</small></div></div>';
  const list=top.length?'<ol class="ci-top">'+top.map(([k,n],ix)=>'<li><i>'+(ix+1)+'</i><span>'+esc(k.text)+'</span><b>×'+n+'</b></li>').join('')+'</ol>':'<div class="empty" style="padding:18px 6px">還沒有使用紀錄。<br>他發送過字卡後會顯示在這裡。</div>';
  sheet('',head+'<div class="ci-body"><div class="ci-left"><h3>常用字卡</h3><div class="ci-scroll">'+list+'</div></div><div class="ci-right">'+ciRankHtml(c)+'</div></div><button class="btn" data-a="close" style="margin:10px 0 0;flex:none">關閉</button>',1);$('#sh').classList.add('coninfo');
  const bx=$('#sh .box'),ci=c.ci||{};if(ci.bg)bx.style.background=ci.bg;if(ci.ink){bx.style.setProperty('--ink',ci.ink);bx.style.color=ci.ink}if(ci.line){bx.style.setProperty('--line',ci.line);bx.style.borderColor=ci.line}
  if(ci.topInk)bx.style.setProperty('--ci-topink',ci.topInk);if(ci.topBg)bx.style.setProperty('--ci-topbg',ci.topBg);if(ci.rankBg)bx.style.setProperty('--ci-rankbg',ci.rankBg)}
function ciSettings(cid){const c=S.contacts.find(x=>x.id===cid);if(!c)return;
  sheet('資料卡設定','<div style="max-height:56vh;overflow-y:auto">'+CI_LBL.map(([k,n])=>'<div class="sr" style="align-items:center"><span>'+n+'</span><span style="display:flex;align-items:center;gap:8px"><input type="color" data-ci="'+k+'" data-cid="'+c.id+'" value="'+(ciCol(c,k)||CI_DEF[k])+'" style="width:44px;height:30px;padding:0;border:1px solid var(--line);border-radius:8px;background:transparent"><button class="btn" data-a="cireset" data-i="'+c.id+'|'+k+'" style="width:auto;margin:0;padding:4px 10px;font-size:calc(12px*var(--fz,1))">預設</button></span></div>').join('')+'<button class="btn" data-a="ciclrcard" data-i="'+c.id+'">清除字卡排名</button><button class="btn" data-a="ciclremo" data-i="'+c.id+'">清除表情包排名</button></div><button class="btn s" data-a="ciback" data-i="'+c.id+'">完成</button>',1);sheetBack=()=>conInfoSheet(c.id)}
/* 背景卡片裁剪：拖曳移動、滑桿縮放，框的比例和資料卡背景一樣 */
let ciCrop=null;
function coverCrop(file,cid){const cw=($('.ci-cover')||{}).offsetWidth||320,ch=($('.ci-cover')||{}).offsetHeight||118,Fw=Math.min(cw,innerWidth-60),Fh=Math.round(Fw*ch/cw),r=new FileReader();
  r.onload=()=>{const im=new Image();im.onload=()=>{const min=Math.max(Fw/im.width,Fh/im.height);ciCrop={cid,im,Fw,Fh,min,k:min,ox:(Fw-im.width*min)/2,oy:(Fh-im.height*min)/2,src:r.result};ciCropSheet()};im.src=r.result};r.readAsDataURL(file)}
function ciClamp(){const a=ciCrop;a.ox=Math.min(0,Math.max(a.Fw-a.im.width*a.k,a.ox));a.oy=Math.min(0,Math.max(a.Fh-a.im.height*a.k,a.oy))}
function ciCropPaint(){const a=ciCrop,e=$('#ciimg');if(!a||!e)return;ciClamp();e.style.width=a.im.width*a.k+'px';e.style.height=a.im.height*a.k+'px';e.style.transform='translate('+a.ox+'px,'+a.oy+'px)'}
function ciCropSheet(){const a=ciCrop;if(!a)return;sheet('選擇背景範圍','<div id="ciframe" class="ci-frame" style="width:'+a.Fw+'px;height:'+a.Fh+'px"><img id="ciimg" src="'+a.src+'" alt="" draggable="false"></div><input type="range" id="cizoom" min="100" max="400" value="'+Math.round(a.k/a.min*100)+'" style="width:100%;margin:12px 0 2px"><p class="hint" style="margin:0 0 8px">拖曳移動位置，滑桿放大縮小。</p><div class="cp-btns"><button class="btn" data-a="cicropx" data-i="'+a.cid+'">取消</button><button class="btn s" data-a="cicropok">確定</button></div>',1);ciCropPaint();
  const fr=$('#ciframe');let d=null;fr.addEventListener('pointerdown',e=>{d={x:e.clientX,y:e.clientY,ox:a.ox,oy:a.oy};try{fr.setPointerCapture(e.pointerId)}catch(x){}});fr.addEventListener('pointermove',e=>{if(!d)return;a.ox=d.ox+e.clientX-d.x;a.oy=d.oy+e.clientY-d.y;ciCropPaint()});['pointerup','pointercancel'].forEach(t=>fr.addEventListener(t,()=>{d=null}));
  $('#cizoom').addEventListener('input',e=>{const cx=a.Fw/2,cy=a.Fh/2,sx=(cx-a.ox)/a.k,sy=(cy-a.oy)/a.k;a.k=a.min*(+e.target.value/100);a.ox=cx-sx*a.k;a.oy=cy-sy*a.k;ciCropPaint()})}
function ciCropDone(){const a=ciCrop;if(!a)return;const OW=Math.min(900,Math.round(a.Fw*2.5)),OH=Math.round(OW*a.Fh/a.Fw),c=document.createElement('canvas');c.width=OW;c.height=OH;c.getContext('2d').drawImage(a.im,-a.ox/a.k,-a.oy/a.k,a.Fw/a.k,a.Fh/a.k,0,0,OW,OH);
  const ct=S.contacts.find(x=>x.id===a.cid);if(ct){ct.cover=c.toDataURL('image/jpeg',S.set.imgc?.75:.85);save()}ciCrop=null;conInfoSheet(a.cid)}
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.ci){const c=S.contacts.find(x=>x.id===t.dataset.cid);if(c){c.ci=c.ci||{};c.ci[t.dataset.ci]=t.value;saveSoon()}}});

