




/* ── 音效（Web Audio 合成，不需音檔） ── */
let AC=null;
let acUnl=false;
function acx(){try{if(!AC||AC.state==='closed'){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C();acUnl=false}
  try{if(navigator.audioSession&&navigator.audioSession.type!=='ambient')navigator.audioSession.type='ambient'}catch(e){}
  if(AC.state!=='running'){try{const p=AC.resume();if(p&&p.catch)p.catch(()=>{})}catch(e){}}
  return AC}catch(e){return null}}
function acUnlock(){const a=acx();if(!a)return;if(!acUnl){try{const b=a.createBuffer(1,1,22050),sr=a.createBufferSource();sr.buffer=b;sr.connect(a.destination);sr.start(0);acUnl=true}catch(e){}}}
['touchend','pointerup','click'].forEach(ev=>document.addEventListener(ev,acUnlock,{passive:true,capture:true}));
const acWake=()=>{if(document.visibilityState!=='visible'||!AC)return;try{if(AC.state!=='running'){const p=AC.resume();if(p&&p.catch)p.catch(()=>{});setTimeout(()=>{if(AC&&AC.state!=='running')acRebuild()},500)}}catch(e){acRebuild()}};
document.addEventListener('visibilitychange',acWake);window.addEventListener('pageshow',acWake);window.addEventListener('focus',acWake);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&AC){try{AC.__t=Date.now()}catch(e){}}});
['pointerdown','touchstart','keydown'].forEach(ev=>document.addEventListener(ev,()=>{acx()},{passive:true}));
const SND=[['bubble','泡泡'],['drop','水滴'],['ding','叮咚'],['chime','風鈴'],['tap','輕敲'],['bird','小鳥'],['marimba','馬林巴'],['soft','柔和提示']];
function sTone(a,t,f0,f1,dur,vol,type){const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.012);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+0.03)}
function sNoise(a,t,dur,vol,hp){const n=Math.max(1,Math.floor(a.sampleRate*dur)),buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=a.createBufferSource();s.buffer=buf;const f=a.createBiquadFilter();f.type='highpass';f.frequency.value=hp;const g=a.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(a.destination);s.start(t)}
/* iOS 回到前景後，AudioContext 可能停在 suspended / interrupted，或 resume 後仍沒有輸出：
   先 resume；0.35 秒內沒變成 running 就丟掉舊的、重建一個再播（建立在使用者互動後解鎖過的頁面上通常可行） */
function acRebuild(){try{if(AC)try{AC.close()}catch(e){}AC=null;acUnl=false}catch(e){}return acx()}
function playSnd(k){try{if(!k||k==='none')return;let a=acx();if(!a)return;
  const go=x=>{try{playSnd0(k,x);const s=x.createBufferSource();s.buffer=x.createBuffer(1,1,22050);s.connect(x.destination);s.start(0)}catch(e){}};
  if(a.state==='running'&&(a.__t==null||Date.now()-a.__t<1500||document.visibilityState==='visible')){go(a);return}
  let done=false;const tryRun=x=>{try{const p=x.resume();if(p&&p.then)p.then(()=>{if(!done&&x.state==='running'){done=true;go(x)}}).catch(()=>{})}catch(e){}};
  tryRun(a);
  setTimeout(()=>{if(done)return;const b=acRebuild();if(!b)return;if(b.state==='running'){done=true;go(b)}else{try{const p=b.resume();if(p&&p.then)p.then(()=>{if(!done&&b.state==='running'){done=true;go(b)}}).catch(()=>{})}catch(e){}}},350)}catch(e){}}
function playSnd0(k,a){try{const t=a.currentTime+0.02;
  switch(k){
  case 'bubble':sTone(a,t,300,820,0.13,0.3);sTone(a,t+0.15,420,1000,0.09,0.16);sTone(a,t+0.34,1900,320,0.045,0.3);sNoise(a,t+0.34,0.07,0.22,2600);break;
  case 'drop':sTone(a,t,1250,480,0.12,0.3);sTone(a,t+0.13,900,420,0.1,0.1);break;
  case 'ding':sTone(a,t,1319,0,0.5,0.22);sTone(a,t+0.16,1047,0,0.6,0.22);break;
  case 'chime':[1568,1760,2093,2349,2637].forEach((f,i)=>sTone(a,t+i*0.07,f,0,0.65,0.1));break;
  case 'tap':sTone(a,t,240,110,0.09,0.35);sNoise(a,t,0.03,0.1,1800);break;
  case 'bird':[0,0.11,0.22].forEach((d,i)=>sTone(a,t+d,2300+i*250,3300+i*250,0.08,0.13));break;
  case 'marimba':[[659,0],[880,0.14]].forEach(([f,d])=>{sTone(a,t+d,f,0,0.35,0.3);sTone(a,t+d,f*4,0,0.06,0.07)});break;
  case 'soft':sTone(a,t,660,0,0.28,0.2);sTone(a,t+0.12,880,0,0.4,0.2);break}
}catch(e){}}
const sndMe=()=>{if(S&&S.set&&S.set.ntMeOn)playSnd(S.set.ntMeSnd)};
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('select[data-snd]'))return;S.set[t.dataset.snd]=t.value;save();playSnd(t.value)});

/* ── 番茄鐘 ── */
let pomoOpen=false;
const PM_NAME={foc:'專注',brk:'休息',lng:'長休息'};
const pmDur=p=>(p.ph==='foc'?p.foc:p.ph==='brk'?p.brk:p.lng)*60000;
const pmLeft=()=>{const p=S.pomo;return p.run?Math.max(0,p.end-Date.now()):p.left};
const pmFmt=ms=>{const s=Math.ceil(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function pmToday(){const d=new Date(),k=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();if(S.pomo.day!==k){S.pomo.day=k;S.pomo.n=0}}
function pmChime(){try{const a=acx();if(!a)return;const go=()=>[[660,0],[880,.22],[1320,.44]].forEach(([f,d])=>{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+.02+d;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(.25,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+.5);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.55)});if(a.state==='running')go();else{const p=a.resume();if(p&&p.then)p.then(go).catch(()=>{})}}catch(e){}}
function pmDone(){const p=S.pomo;pmToday();const was=p.ph;
  if(was==='foc'){p.n++;p.idx++;p.ph=(p.idx%Math.max(1,p.cyc)===0)?'lng':'brk'}else p.ph='foc';
  p.left=pmDur(p);if(p.snd)pmChime();toast(was==='foc'?'專注完成，休息一下吧':'休息結束，準備開始專注',2200);
  if(p.auto){p.run=1;p.end=Date.now()+p.left}else{p.run=0;p.end=0}save()}
function pmPaint(){const p=S.pomo,t=document.getElementById('pmT'),a=document.getElementById('pmArc');if(!t&&!a)return;const l=pmLeft(),tot=pmDur(p)||1;if(t)t.textContent=pmFmt(l);if(a)a.style.strokeDashoffset=(2*Math.PI*96*(1-l/tot)).toFixed(2)}
setInterval(()=>{try{const p=S&&S.pomo;if(!p||!p.run)return;if(p.end-Date.now()<=0){const open=pomoOpen&&tab==='home';pmDone();if(open&&!(document.activeElement&&document.activeElement.tagName==='INPUT'))render();else pmPaint()}else pmPaint()}catch(x){}},250);
function vPomo(){const p=S.pomo;pmToday();const R=96,C=2*Math.PI*R,tot=pmDur(p)||1,l=pmLeft(),cyc=Math.max(1,p.cyc),fill=p.ph==='lng'?cyc:p.idx%cyc;
  const dots=Array.from({length:cyc},(_,i)=>'<span class="pm-dot'+(i<fill?' on':'')+'"></span>').join('');
  const SW=(k,l2)=>'<div class="sr" style="align-items:center"><span>'+l2+'</span><button class="sw '+(p[k]?'on':'')+'" data-a="pomosw" data-i="'+k+'"></button></div>';
  const NI=(k,l2,u,mx)=>'<div class="sr" style="align-items:center"><span>'+l2+'</span><span><input type="number" inputmode="numeric" data-pm="'+k+'" min="1" max="'+mx+'" value="'+p[k]+'" style="width:56px;text-align:right;padding:6px 4px"> '+u+'</span></div>';
  return '<div class="ph2"><button class="ib" data-a="pomoback">‹</button><h1>番茄鐘</h1></div>'
  +'<div class="card" style="text-align:center"><div style="font-size:calc(14px*var(--fz,1));color:var(--soft);margin-bottom:6px">'+PM_NAME[p.ph]+(p.run?'中':(l<tot?'（已暫停）':''))+'</div>'
  +'<div class="pm-wrap"><svg viewBox="0 0 220 220" width="220" height="220"><circle cx="110" cy="110" r="'+R+'" fill="none" stroke="var(--bub)" stroke-width="10"/><circle id="pmArc" cx="110" cy="110" r="'+R+'" fill="none" stroke="var(--lav)" stroke-width="10" stroke-linecap="round" transform="rotate(-90 110 110)" stroke-dasharray="'+C.toFixed(2)+'" style="stroke-dashoffset:'+(C*(1-l/tot)).toFixed(2)+'"/></svg><div class="pm-t" id="pmT">'+pmFmt(l)+'</div></div>'
  +'<div class="pm-dots">'+dots+'</div><div style="font-size:calc(13px*var(--fz,1));color:var(--soft);margin:2px 0 12px">今天完成 '+p.n+' 個番茄</div>'
  +'<div style="display:flex;gap:8px"><button class="btn" data-a="pomoreset" style="flex:1;margin:0">重置</button><button class="btn s" data-a="pomogo" style="flex:2;margin:0">'+(p.run?'暫停':(l<tot?'繼續':'開始'))+'</button><button class="btn" data-a="pomoskip" style="flex:1;margin:0">跳過</button></div></div>'
  +'<div class="card set"><h3>番茄鐘設置</h3>'+NI('foc','專注時間','分鐘',180)+NI('brk','休息時間','分鐘',60)+NI('lng','長休息時間','分鐘',120)+NI('cyc','幾輪後長休息','輪',12)+SW('auto','自動進入下一階段')+SW('snd','提示音')+'</div>'}
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.pm||!S||!S.pomo)return;const p=S.pomo,k=t.dataset.pm,v=Math.max(1,Math.min(+t.max||999,Math.round(+t.value)||0));if(!v)return;const full=!p.run&&p.left===pmDur(p);p[k]=v;if(full)p.left=pmDur(p);pmPaint();saveSoon()});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.pm&&S&&S.pomo){t.value=S.pomo[t.dataset.pm]}});

/* ── 經期 ── */
let perOpen=false,perEdit=false,perY=0,perM=0;
const PER_WK=['日','一','二','三','四','五','六'];
const pD=k=>{const a=k.split('-');return new Date(+a[0],+a[1]-1,+a[2])};
const pAdd=(k,n)=>{const d=pD(k);d.setDate(d.getDate()+n);return localDayKey(d)};
const pDiff=(a,b)=>Math.round((pD(a)-pD(b))/864e5);
const pFmt=k=>{const d=pD(k);return (d.getMonth()+1)+'/'+d.getDate()};
const pTodayK=()=>localDayKey(new Date());
function perInitMonth(){const d=new Date();perY=d.getFullYear();perM=d.getMonth()}
function perToPage2(){const pg=document.querySelector('.pager');if(!pg)return;pg.style.scrollBehavior='auto';pg.scrollLeft=pg.clientWidth;pg.style.scrollBehavior='';document.querySelectorAll('.dots i').forEach((d,k)=>d.classList.toggle('on',k===1))}
function perGroups(){const ds=Array.from(new Set(S.per.days)).sort(),g=[];ds.forEach(k=>{const l=g[g.length-1];if(l&&pDiff(k,l.e)===1){l.e=k;l.n++}else g.push({s:k,e:k,n:1})});return g}
function perStat(){const g=perGroups(),d=[];for(let i=1;i<g.length;i++){const x=pDiff(g[i].s,g[i-1].s);if(x>=15&&x<=60)d.push(x)}const ls=g.map(x=>x.n).filter(n=>n<=15);if(!d.length||!ls.length)return{};return{cyc:Math.round(d.reduce((a,b)=>a+b,0)/d.length),len:Math.round(ls.reduce((a,b)=>a+b,0)/ls.length)}}
function perCalc(){const p=S.per,g=perGroups(),map={},R={fw:1,ov:2,pp:3,p:4};
  const cyc=Math.max(15,Math.min(60,+p.cycle||28)),len=Math.max(1,Math.min(15,+p.len||6));
  const mark=(k,t)=>{if(!map[k]||R[t]>R[map[k]])map[k]=t};
  const fert=ov=>{for(let j=-5;j<=1;j++)mark(pAdd(ov,j),'fw');mark(ov,'ov')};
  p.days.forEach(k=>mark(k,'p'));
  g.forEach(x=>fert(pAdd(x.s,-14)));
  const out={g,map,cyc,len};
  if(g.length){const last=g[g.length-1],ended=p.ended||{},sh=(ended[last.s]&&last.n<len)?-(len-last.n):0;
    if(p.live&&p.live.s===last.s&&!ended[last.s]){for(let j=last.n;j<len;j++)mark(pAdd(last.s,j),'pp')}
    for(let k=1;k<=6;k++){const st=pAdd(last.s,cyc*k+sh);for(let j=0;j<len;j++)mark(pAdd(st,j),'pp');fert(pAdd(st,-14))}out.next=pAdd(last.s,cyc+sh);out.ov=pAdd(out.next,-14)}
  return out}
function perCardTxt(){const c=perCalc(),g=c.g;if(!g.length)return '<small>點此設定經期</small>';
  const t=pTodayK(),last=g[g.length-1];
  if(t>=last.s&&t<=last.e)return '<div class="per-current"><small>第</small><b>'+(pDiff(t,last.s)+1)+'</b><small>天</small></div><small>下次 '+pFmt(c.next)+'</small>';
  const dd=pDiff(c.next,t),od=pDiff(c.ov,t);
  return '<small>'+(dd>=0?'距下次經期':'經期已延後')+'</small><b>'+(dd>0?dd+' 天':dd===0?'今天':(-dd)+' 天')+'</b><small>'+(od>=0?'排卵日 '+pFmt(c.ov):'預計 '+pFmt(c.next))+'</small>'}
function perSumHtml(){const c=perCalc(),g=c.g;
  if(!g.length)return '<div class="per-empty">還沒有經期紀錄<br>按下方「編輯經期」，在日曆上點選經期來的日子，<br>就能計算下一次經期與排卵期。</div>';
  const t=pTodayK(),last=g[g.length-1];
  const row=(l,v,s)=>'<div class="per-r"><span>'+l+'</span><b>'+v+'</b>'+(s?'<small>'+s+'</small>':'')+'</div>';
  const dd=pDiff(c.next,t),od=pDiff(c.ov,t),f1=pAdd(c.ov,-5),f2=pAdd(c.ov,1);
  const nd=pD(c.next);
  let cur='';if(t>=last.s&&t<=last.e)cur='目前是經期第 '+(pDiff(t,last.s)+1)+' 天';else if(t>=f1&&t<=f2)cur=(t===c.ov?'今天是排卵日':'目前在易孕期');
  return (cur?'<div class="per-now">'+cur+'</div>':'')
   +row('上次經期',pFmt(last.s)+(last.n>1?' – '+pFmt(last.e):''),last.n+' 天')
   +row('預計下次經期',pFmt(c.next)+'（週'+PER_WK[nd.getDay()]+'）',dd>0?'還有 '+dd+' 天':dd===0?'就是今天':'已延後 '+(-dd)+' 天')
   +row('預計排卵日',pFmt(c.ov),od>0?'還有 '+od+' 天':od===0?'就是今天':'已過 '+(-od)+' 天')
   +row('易孕期',pFmt(f1)+' – '+pFmt(f2),'')}
function perCalHtml(){const c=perCalc(),t=pTodayK(),y=perY,m=perM,first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),CL={p:'pc-a',pp:'pc-pp',ov:'pc-ov',fw:'pc-fw'};
  let cells='';for(let i=0;i<first;i++)cells+='<span class="pc-d out"></span>';
  for(let d=1;d<=dim;d++){const k=localDayKey(new Date(y,m,d)),ty=c.map[k],cls='pc-d'+(ty?' '+CL[ty]:'')+(k===t?' pc-t':'');
    cells+=perEdit?'<button type="button" class="'+cls+'" data-a="perday" data-i="'+k+'">'+d+'</button>':'<span class="'+cls+'">'+d+'</span>'}
  return '<div class="pc-head"><button class="ib" data-a="permo" data-i="-1" aria-label="上個月">‹</button><b>'+y+' 年 '+(m+1)+' 月</b><button class="ib" data-a="permo" data-i="1" aria-label="下個月">›</button></div>'
   +'<div class="pc-grid">'+PER_WK.map(w=>'<span class="pc-w">'+w+'</span>').join('')+'</div><div class="pc-grid'+(perEdit?' ed':'')+'">'+cells+'</div>'
   +'<div class="pc-lg"><span><i class="pc-a"></i>經期</span><span><i class="pc-pp"></i>預測經期</span><span><i class="pc-fw"></i>易孕期</span><span><i class="pc-ov"></i>排卵日</span></div>'
   +(perEdit?'<p class="hint" style="margin:8px 2px 0">編輯中：點日曆標記經期來的日子，再點一次取消，可切換月份補登。從今天開始的經期會自動延續到每一天；提前結束請按「結束經期」。</p>':'')
   +(perEdit&&perCanEnd()?'<button class="btn" data-a="perend" style="width:100%;margin:12px 0 0">結束經期</button>':'')+'<div style="display:flex;gap:8px;margin-top:12px"><button class="btn" data-a="pertoday" style="flex:1;margin:0">回到今天</button><button class="btn s" data-a="peredit" style="flex:2;margin:0">'+(perEdit?'完成':'編輯經期')+'</button></div>'}

/* 經期自動延續：開始後每天自動算進經期，到設定天數那天打開程式會問「經期結束了嗎」 */
let perAskSess=false,perDay=pTodayK(),perChanged=false;
const pLen=()=>Math.max(1,Math.min(15,+S.per.len||6));
function perAuto(){const p=S.per,L=p.live;if(!L||!L.s)return false;
  const t=pTodayK(),len=pLen(),due=pAdd(L.s,len-1);
  if(pDiff(t,L.s)<0){p.live=null;return false}
  const cap=L.ext?t:(pDiff(due,t)<0?due:t);
  let ch=false;for(let k=L.s;pDiff(k,cap)<=0;k=pAdd(k,1)){if(!p.days.includes(k)){p.days.push(k);ch=true}}
  if(ch){perChanged=true;save()}
  return pDiff(t,due)>=0&&L.hold!==t}
function perLiveSync(){const p=S.per,t=pTodayK(),g=perGroups(),gt=g.find(x=>pDiff(t,x.s)>=0&&pDiff(t,x.e)<=0);
  Object.keys(p.ended).forEach(k=>{if(!g.some(x=>x.s===k))delete p.ended[k]});
  if(!gt||p.ended[gt.s]){p.live=null;return}
  if(!p.live||p.live.s!==gt.s)p.live={s:gt.s,ext:(p.live&&p.live.ext)?1:0,hold:p.live?p.live.hold:''}}
function perEndNow(){const p=S.per,t=pTodayK();let g=perGroups();
  if(p.live){perAuto();g=perGroups()}
  const gt=g.find(x=>(p.live&&x.s===p.live.s)||(pDiff(t,x.s)>=0&&pDiff(t,x.e)<=0));
  if(!gt)return false;
  p.days=p.days.filter(k=>!(pDiff(k,t)>0&&pDiff(k,gt.s)>=0&&pDiff(k,gt.e)<=0));
  p.ended[gt.s]=1;p.live=null;save();return true}
function perCanEnd(){const p=S.per,g=perGroups(),t=pTodayK();if(p.live)return true;const l=g[g.length-1];return !!(l&&!p.ended[l.s]&&pDiff(t,l.s)>=0&&pDiff(t,l.e)<=0)}
function perAsk(){if(perAskSess||!S.per.live)return;const sh=$('#sh');if(sh&&sh.classList.contains('show'))return;
  perAskSess=true;const n=pDiff(pTodayK(),S.per.live.s)+1;
  sheet('經期結束了嗎？','<p class="hint" style="margin:0 0 12px">今天是經期第 '+n+' 天，已經到了你設定的 '+pLen()+' 天。</p><button class="btn s" data-a="perq2">結束了</button><button class="btn" data-a="perq1">還沒</button><button class="btn" data-a="perq0">晚點再問</button>',1)}
function perCheck(){try{if(!S||!S.per)return;perChanged=false;const need=perAuto();if(perChanged){if(perOpen)perPaint();else if(tab==='home'&&!(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))){const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y}}if(need)perAsk()}catch(e){}}
function perBoot(){const sp=document.getElementById('splash');if(sp&&getComputedStyle(sp).display!=='none'){setTimeout(perBoot,600);return}perCheck()}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')perAskSess=false;else setTimeout(perCheck,400)});
setInterval(()=>{const k=pTodayK();if(k!==perDay){perDay=k;perAskSess=false;perCheck()}},30000);
function perRecHtml(){const g=perGroups().slice().reverse(),p=S.per,len=pLen();
  if(!g.length)return '<h3>經期紀錄</h3><div class="per-empty" style="padding:6px 0">還沒有經期紀錄</div>';
  const fm=k=>{const d=pD(k);return d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()};
  return '<h3>經期紀錄</h3>'+g.map(x=>{const on=p.live&&p.live.s===x.s,tag=on?'進行中':(p.ended[x.s]&&x.n<len?'提前結束':'');
    return '<div class="sr per-rec" style="align-items:center"><span><b style="font-weight:500">'+fm(x.s)+(x.n>1?' – '+pFmt(x.e):'')+'</b><small style="display:block;color:var(--soft);font-size:calc(12px*var(--fz,1))">'+x.n+' 天'+(tag?'　'+tag:'')+'</small></span><button class="btn" data-a="perrecdel" data-i="'+x.s+'" style="margin:0;padding:6px 12px;font-size:calc(12px*var(--fz,1))">刪除</button></div>'}).join('')}
function perAvgHtml(){const s=perStat();if(!s.cyc||(s.cyc===S.per.cycle&&s.len===S.per.len))return '';
  return '<div class="sr" style="align-items:center"><span style="color:var(--soft);font-size:calc(12px*var(--fz,1))">依紀錄：平均週期 '+s.cyc+' 天、經期 '+s.len+' 天</span><button class="btn" data-a="perapply" style="margin:0;padding:5px 10px;font-size:calc(12px*var(--fz,1))">套用</button></div>'}
function perPaint(){const a=$('#perSum'),b=$('#perCal'),c=$('#perAvg'),d=$('#perRec');if(a)a.innerHTML=perSumHtml();if(b)b.innerHTML=perCalHtml();if(c)c.innerHTML=perAvgHtml();if(d)d.innerHTML=perRecHtml()}
function vPer(){const p=S.per;
  const NI=(k,l2,u,mn,mx)=>'<div class="sr" style="align-items:center"><span>'+l2+'</span><span><input type="number" inputmode="numeric" data-per="'+k+'" min="'+mn+'" max="'+mx+'" value="'+p[k]+'" style="width:56px;text-align:right;padding:6px 4px"> '+u+'</span></div>';
  return '<div class="ph2"><button class="ib" data-a="perback">‹</button><h1>經期</h1></div>'
  +'<div class="card" id="perSum">'+perSumHtml()+'</div>'
  +'<div class="card" id="perCal" style="margin-top:12px">'+perCalHtml()+'</div>'
  +'<div class="card set" style="margin-top:12px"><h3>經期設置</h3>'+NI('cycle','幾天來一次經期（週期）','天',15,60)+NI('len','經期持續天數（預測用）','天',1,15)+'<div id="perAvg" style="margin-top:8px">'+perAvgHtml()+'</div>'
  +'<div class="sr" style="align-items:center;margin-top:12px"><span style="color:var(--soft);font-size:calc(12px*var(--fz,1))">排卵日以「下次經期前 14 天」推算，易孕期為排卵日前 5 天到後 1 天。</span></div>'
  +'<button class="btn" data-a="perclear" style="width:100%;margin:12px 0 0">清除所有經期紀錄</button></div>'
  +'<p class="hint">預測只依你填的週期推算，每個人的週期會有變動，僅供參考，不能當作避孕或醫療依據。</p>'
  +'<div class="card set" id="perRec" style="margin-top:12px">'+perRecHtml()+'</div>'}
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.per||!S||!S.per)return;const v=Math.round(+t.value);if(!(v>=+t.min&&v<=+t.max))return;S.per[t.dataset.per]=v;perPaint();saveSoon()});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.per&&S&&S.per)t.value=S.per[t.dataset.per]});