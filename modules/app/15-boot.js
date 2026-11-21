
/* ── 啟動 ── */
(async()=>{
  await idb();
  if(!db)setTimeout(()=>{try{toast('此瀏覽器無法儲存資料（可能是無痕模式），關閉後資料會消失',5000)}catch(e){}},1500);
  const o=await load();
  S=mig(o&&Array.isArray(o.contacts)&&o.contacts.length?Object.assign(def(),o,{tags:o.tags}):def());
  $('#fi').addEventListener('change',e=>{const fs=[...e.target.files];e.target.value='';if(fs.length&&fiCb)fiMul?fiCb(fs):fiCb(fs[0])});
  Object.keys(S.next).forEach(k=>{if(S.next[k]<Date.now())S.next[k]=0});
  applyTheme();if(window.PearlaSplash)window.PearlaSplash.finish();setTimeout(perBoot,800);
  document.addEventListener('focusout',e=>{const n=e.target.dataset&&e.target.dataset.n;if(!n)return;const v=e.target.textContent.trim();let t;if(n==='m'){S.me=v||'我';t=S.me}else{const c=n==='c'?cur():S.contacts.find(x=>x.id===e.target.closest('[data-c]').dataset.c);c.name=v||'名字';t=c.name}e.target.textContent=t;save()});
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.n){e.preventDefault();e.target.blur()}});
  document.addEventListener('change',e=>{const k=e.target.dataset.n2;if(k){e.target.value=sget(k);if(activeSetting(k))resetA();else save()}});
  document.addEventListener('input',e=>{if(e.target.dataset.n2){const k=e.target.dataset.n2,v=parseFloat(e.target.value);if(!isNaN(v)){sput(k,e.target.dataset.u==='%'?Math.min(100,Math.max(0,v)):Math.max(0,v));if(activeSetting(k))resetA();else saveSoon()}}if(e.target.id==='memoin'){S.memo=e.target.value;saveSoon();const mt=$('.memo-txt');if(mt)mt.innerHTML=memoSlots()}if(e.target.id==='cphex'&&cpk){const rgb=hex2rgb(e.target.value);if(rgb){[cpk.h,cpk.s,cpk.v]=rgb2hsv(rgb);cpUI(true)}}if(e.target.dataset.md){mailDraft[e.target.dataset.md]=e.target.value}if(e.target.dataset.qd!=null){qd[e.target.dataset.qd]=e.target.value}if(e.target.dataset.qs){const [qa_,qb_]=e.target.dataset.qs.split('.'),qv=parseFloat(e.target.value);if(!isNaN(qv)&&S.qa[qa_]){S.qa[qa_][qb_]=Math.max(0,qv);saveSoon()}}if(e.target.id==='rq'){rQ=e.target.value;const rb=$('#rbody');if(rb)rb.innerHTML=rCard(rQ)}if(e.target.id==='sq'){sQ=e.target.value;$('#sl').innerHTML=sList()}if(e.target.id==='tc'){S.ink=e.target.value;applyTheme();saveSoon()}if(e.target.id==='markColor'){S.set.starColor=e.target.value;saveSoon();paint()}if(e.target.id==='lc'){S.line=e.target.value;document.documentElement.style.setProperty('--line',S.line);saveSoon()}if(e.target.id==='bgc'){S.bgColors=S.bgColors||{};S.bgColors[e.target.dataset.i]=e.target.value;saveSoon();render()}});
  document.addEventListener('scroll',e=>{const t=e.target;if(t.classList&&t.classList.contains('pager')){const n=Math.round(t.scrollLeft/t.clientWidth);document.querySelectorAll('.dots i').forEach((d,k)=>d.classList.toggle('on',k===n))}},true);
  document.addEventListener('focusin',e=>{if(e.target.id==='bt')$('#bph').style.display='none'});
  document.addEventListener('focusout',e=>{if(e.target.id==='bt'&&!e.target.value)$('#bph').style.display=''});
  document.addEventListener('input',e=>{const t=e.target;
    if(t.dataset&&t.dataset.cn){const x=S.cats.find(c=>c.id===t.dataset.cn),v=t.value.trim();if(x&&!x.un&&v){x.name=v;catDirty=true;saveSoon()}return}if(t.id==='gname'){const g=grp(gEditId);if(g)g.name=t.value;return}if(t.id==='abn'){t.value=t.value.replace(/\D/g,'').slice(0,15);abN=t.value;return}if(t.id==='abq'){abQ=t.value;return}if(t.id==='mh1'||t.id==='mh2'){t.value=t.value.replace(/\D/g,'').slice(0,15);if(t.id==='mh1')mhN1=t.value;else mhN2=t.value;return}if(t.id==='mht'){mhT=t.value;return}if(t.id==='mhq'){mhQ=t.value;return}if(t.id==='mhnote'){mhNote=t.value;return}if(t.id==='cq'){cq=t.value;if(delMode&&selC.length){const ok=new Set(cardSelIds()),n=selC.filter(x=>ok.has(x));if(n.length!==selC.length){selC=n;render();const f=$('#cq');if(f){f.focus();try{f.setSelectionRange(f.value.length,f.value.length)}catch(er){}}return}}const r=$('#cres'),m=$('#cmain'),on=cq.trim();r.innerHTML=on?cres():'';r.style.display=on?'':'none';m.style.display=on?'none':''}
    if(t.dataset&&t.dataset.t3){const k=t.dataset.t3;let T=0;t.closest('.sr').querySelectorAll('[data-t3]').forEach(x=>{T+=Math.max(0,parseInt(x.value)||0)*({h:3600,m:60,s:1}[x.dataset.p]||1)});sput(k,T);saveSoon()}});
  document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.t3){const k=t.dataset.t3,T=Math.round(sget(k)||0),row=t.closest('.sr'),hasH=!!row.querySelector('[data-p=h]');row.querySelectorAll('[data-t3]').forEach(x=>{const p=x.dataset.p;x.value=p==='h'?Math.floor(T/3600):p==='m'?(hasH?Math.floor(T%3600/60):Math.floor(T/60)):T%60});save()}});
  ['gesturestart','gesturechange'].forEach(g=>document.addEventListener(g,e=>e.preventDefault()));
  document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
  statusTick();
  dailyTick();
  save();render();
})();

document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.pw!=null){const l=ensurePunct(),v=parseFloat(t.value);if(l[+t.dataset.pw]&&!isNaN(v)){l[+t.dataset.pw].w=Math.max(0,v);saveSoon()}}});

/* ── 返回主頁時的閃爍：先預載並解碼圖示；圖示或字體還沒好時，先隱藏主頁最多 1.2 秒，避免出現擠在一起的 alt 文字和空白圖示 ── */
(()=>{const keep=window.__artKeep=window.__artKeep||{};
  const pre=u=>{if(keep[u])return;const im=new Image();im.decoding='sync';im.src=u;keep[u]=im;if(im.decode)im.decode().catch(()=>{})};
  window.preloadArt=()=>{try{['anniversary','answer-book','daily','data','doodle','files','friends','gift-cabinet','group-chat','inspiration','kitchen','mailbox','mall','memo-card','period','plum-divination','records','study-progress','tomato-timer','tracking'].forEach(n=>pre(AS(n)))}catch(e){}};
  window.artWait=()=>{const v=$('#v');if(!v||tab!=='home')return;const im=[...v.querySelectorAll('img')].filter(i=>!(i.complete&&i.naturalWidth)),fl=!!(document.fonts&&document.fonts.status==='loading');if(!im.length&&!fl)return;v.classList.add('art-wait');
    const ps=im.map(i=>new Promise(r=>{i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true})}));if(fl)ps.push(document.fonts.ready);
    Promise.race([Promise.all(ps),new Promise(r=>setTimeout(r,1200))]).then(()=>v.classList.remove('art-wait'))};
  const r0=render;render=function(){const x=r0.apply(this,arguments);try{artWait()}catch(e){}return x};
  const a0=applyTheme;applyTheme=function(){const x=a0.apply(this,arguments);try{preloadArt()}catch(e){}return x};
  preloadArt();
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){preloadArt()}});
})();

/* 以聯絡人為第一個參數的函式：進入時切換到該聯絡人的設置 */
(()=>{['fireA','fire','gen','roundQ','preRound','schedule','genLetter','dailyPick','stkRoll','patRoll','patMsg','qmPick','extStart','extDone','memSchedule','momNext','inspStep'].forEach(n=>{const f=window[n];if(typeof f!=='function'||f.__cx)return;const w=function(){const a=arguments;if(typeof a[0]==='string')ctxSet(a[0]);else if(a[0]&&typeof a[0]==='object'&&typeof a[0].cid==='string')ctxSet(a[0].cid);return f.apply(this,a)};w.__cx=1;try{window[n]=w}catch(e){}})})();
