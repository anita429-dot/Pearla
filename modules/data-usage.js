(function(){
'use strict';

/* 欄列：[id, 名稱, 補充說明] */
const ROWS=[
  ['chat','聊天室常用字卡','包含顏文字、emoji'],
  ['pat','拍一拍、表情包',''],
  ['tags','標籤','情緒、心意、交流意圖'],
  ['imem','靈感提取-記憶字卡',''],
  ['iext','靈感提取-提取字卡',''],
  ['qa','問題、吐槽',''],
  ['status','聊天室顯示狀態',''],
  ['daily','每日留言',''],
  ['mail','信箱',''],
  ['moments','朋友圈',''],
  ['group','群聊',''],
  ['doodle','塗鴉',''],
  ['shop','商城',''],
  ['gift','禮物櫃','']
];
const FREQ=['未使用','偶爾','常用','很常用'],RATE=['困難','有點難','一般','好上手','簡單'];

const LP=window.LP={open:false,rows:ROWS,rate:RATE,view:vLp,set:setRow,data:data};

function data(id){const d=(S.lp&&S.lp[id])||{};return{on:d.on!==false,p:d.p==null?30:Math.max(0,Math.min(100,+d.p||0)),f:Number.isInteger(d.f)?Math.max(0,Math.min(3,d.f)):-1,r:Number.isInteger(d.r)?Math.max(0,Math.min(4,d.r)):-1}}
/* 之後各功能要回報進度時呼叫：LP.set('chat',{p:35,f:2}) */
function setRow(id,v){if(!S.lp||typeof S.lp!=='object')S.lp={};S.lp[id]=Object.assign(S.lp[id]||{},v);try{save()}catch(e){}}

function row(r){
  const d=data(r[0]);
  return '<div class="lp-item'+(d.on?'':' off')+'"><div class="lp-top"><span class="lp-name">'+esc(r[1])+(r[2]?'<small>（'+esc(r[2])+'）</small>':'')+'</span><button type="button" class="sw'+(d.on?' on':'')+'" data-a="lp:sw" data-i="'+r[0]+'" aria-label="'+esc(r[1])+'"></button></div>'
   +'<div class="lp-pr"><span class="lp-pl">熟練度</span><div class="lp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+d.p+'"><i style="width:'+d.p+'%"></i></div><span class="lp-pct">'+d.p+'%</span></div>'
   +'<div class="lp-meta"><span>使用頻率　<b>'+(d.f<0?'—':FREQ[d.f])+'</b></span><span>評價　<b>'+(d.r<0?'—':RATE[d.r])+'</b></span></div></div>';
}
function vLp(){
  return '<div class="ph2"><button class="ib" data-a="lp:back">‹</button><h1>學習進度</h1></div>'+ROWS.map(row).join('')+'<button class="btn s lp-call" data-a="lp:call">喊他來</button>';
}

/* 只處理「進入」與「返回」；欄列本身沒有任何點擊反應 */
document.addEventListener('click',e=>{
  const t=e.target;if(!t||!t.closest)return;
  if(LP.open&&t.closest('[data-t]')&&!t.closest('[data-a]')){LP.open=false;return}   // 切換底部分頁時離開
  const A=t.closest('[data-a="lp"],[data-a="lp:back"],[data-a="lp:sw"],[data-a="lp:call"],[data-a="lp:callok"]');if(!A)return;
  e.stopPropagation();e.preventDefault();
  if(A.dataset.a==='lp:call'){const c=cur();sheet('喊他來','<p class="hint" style="margin:0 0 10px;line-height:1.7">要把「'+esc(c?c.name:'他')+'」叫來看看學習進度嗎？確認後，會依照學習進度設置的時間、機率，判定要不要變更學習進度狀態。</p><button class="btn s" data-a="lp:callok">確認</button><button class="btn" data-a="close">取消</button>',1);return}
  if(A.dataset.a==='lp:callok'){closeSheet();if(window.LPE&&LPE.call)LPE.call();return}
  if(A.dataset.a==='lp:sw'){const id=A.dataset.i,d=data(id);setRow(id,{on:!d.on});const v=document.querySelector('#v'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y;return}
  LP.open=A.dataset.a==='lp';render();
  const v=document.querySelector('#v');if(v)v.scrollTop=0;
},true);
})();

/* 學習進度引擎：禮拜日 0 點後 → 等判定時間 → 依機率判定 → 逐欄修改熟練度；整個流程結束後，當天的每日留言才開始 */
(function(){
const LSt=()=>{if(!S.lps||typeof S.lps!=='object')S.lps={};const L=S.lps;if(L.ph==null){Object.assign(L,{ph:'',due:0,week:'',from:'',cid:'',idx:0,mid:'',list:[]})}return L};
const dk=()=>localDayKey(new Date());
const nextSun=()=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+((7-d.getDay())%7||7));return localDayKey(d)};
const sec=(k,def)=>{const v=+S.set[k];return (isFinite(v)&&v>=0?v:def)*1000};
const rowName=id=>{const r=LP.rows.find(x=>x[0]===id);return r?r[1]:id};
function notice(text,reuse,t){const L=LSt(),c=S.contacts.find(x=>x.id===L.cid);if(!c)return;const x=c.name+text,a=ms(c.id),tt=t||Date.now();
  if(reuse&&L.mid){const m=a.find(y=>y.id===L.mid);if(m){m.x=x;save();const el=document.getElementById('m-'+m.id);if(el)el.textContent=x;return}}
  const m={id:uid(),f:'sys',pat:1,lp:1,x,t:tt};a.push(m);L.mid=m.id;save();
  if(tab==='chat'&&S.cur===c.id&&typeof paint==='function')paint()}
function dropNotice(){const L=LSt(),c=S.contacts.find(x=>x.id===L.cid);if(!c||!L.mid)return;const a=ms(c.id),i=a.findIndex(y=>y.id===L.mid);if(i>=0){a.splice(i,1);save();if(tab==='chat'&&S.cur===c.id&&typeof paint==='function')paint()}L.mid=''}
/* 時間一律以「排定的時間」為基準往下算，所以程式關閉期間錯過的步驟，重新打開後會依原本的時間表一口氣補上 */
function rowDue(base){return (base||Date.now())+inspRand(S.set.lpRmin==null?3:S.set.lpRmin,S.set.lpRmax==null?120:S.set.lpRmax)}
function showRow(base,prev){const L=LSt();notice((prev?'已更改 '+prev+'；':'')+'正在修改學習進度熟練條，目前正在修改：'+rowName(L.list[L.idx]),L.idx>0,base)}
function startRows(now){const L=LSt();L.list=LP.rows.map(r=>r[0]).filter(id=>LP.data(id).on);L.idx=0;L.mid='';L.last='';
  if(!L.list.length){L.ph='';save();if(typeof dailyTick==='function')setTimeout(dailyTick,500);return}
  L.ph='rows';showRow(now);L.due=rowDue(now);save()}
function judge(n,now){const L=LSt(),p=Math.max(0,Math.min(100,+S.set.lpProb||0));
  if(rnd()*100<p){startRows(now);return}
  L.mid='';
  if(n===1){L.ph='w2';L.due=now+sec('lpT2',1800);notice('決定晚點再看看學習進度',false,now);save()}
  else{L.ph='';notice('決定不改變學習進度',false,now);save();if(typeof dailyTick==='function')setTimeout(dailyTick,500)}}
/* 每一欄的流程：修改熟練條（立刻顯示新數值）→ 10 秒後隨機選擇評價（最後一步，選好立刻顯示）→ 等隨機時間 → 下一欄 */
function stepRow(now){const L=LSt();
  while(L.idx<L.list.length&&!LP.data(L.list[L.idx]).on){L.idx++}
  if(L.idx<L.list.length){const id=L.list[L.idx],d=LP.data(id),delta=[-20,-10,0,10,20][ri(5)],np=Math.max(0,Math.min(100,d.p+delta));LP.set(id,{p:np});L.rid=id;L.rp=[d.p,np];L.idx++;L.ph='rate';L.due=now+10000;
    notice('已更改 '+rowName(id)+' 熟練度 '+d.p+'%→'+np+'%，正在選擇評價',true,now);if(LP.open)render();save();return}
  afterRow(now)}
function rateRow(now){const L=LSt();let txt='';
  if(L.rid&&LP.data(L.rid).on!==false){const r=ri(5);LP.set(L.rid,{r});const p=L.rp||[LP.data(L.rid).p,LP.data(L.rid).p];txt=rowName(L.rid)+' 熟練度 '+p[0]+'%→'+p[1]+'%，評價「'+LP.rate[r]+'」'}
  L.last=txt;L.rid='';L.ph='rows';if(LP.open)render();afterRow(now,txt)}
function afterRow(now,txt){const L=LSt();
  while(L.idx<L.list.length&&!LP.data(L.list[L.idx]).on){L.idx++}
  if(L.idx>=L.list.length){L.ph='';L.list=[];if(txt)notice('已更改 '+txt+'；學習進度更新完成',true,now);L.mid='';save();if(typeof dailyTick==='function')setTimeout(dailyTick,500);return}
  showRow(now,txt);L.due=rowDue(now);save()}
function tick(){try{
  if(!S||!S.set||!S.contacts)return;const L=LSt(),now=Date.now();
  if(!S.set.lpOn){if(L.ph){if(L.ph==='rows'||L.ph==='rate')dropNotice();L.ph='';L.mid='';save();if(typeof dailyTick==='function')setTimeout(dailyTick,500)}return}
  const tk=dk(),sun=new Date().getDay()===0;
  if(!L.ph&&sun&&L.week!==tk&&(!L.from||tk>=L.from)){const c=cur();if(c){const mid=new Date();mid.setHours(0,0,0,0);const base=mid.getTime();L.week=tk;L.ph='w1';L.cid=c.id;L.idx=0;L.mid='';L.list=[];L.due=base+sec('lpT1',600);notice('正在選擇要不要更改學習進度',false,base);save()}}
  if(L.ph==='dwait'){L.ph='';save();return}   // 舊版殘留狀態
  /* 補跑：把已經到時間的步驟依序做完（程式關閉期間錯過的也一起補上），最多 400 步避免無限迴圈 */
  let g=0;while(g++<400&&L.ph&&now>=L.due){const ph=L.ph,du=L.due;
    if(ph==='w1')judge(1,du);else if(ph==='w2')judge(2,du);else if(ph==='rows')stepRow(du);else if(ph==='rate')rateRow(du);else break;
    if(L.ph===ph&&L.due===du)break}
}catch(e){}}
/* 今天是禮拜日、學習進度開著，且今天的流程還沒開始或還沒結束 → 每日留言先等 */
function busy(){try{if(!S||!S.set||!S.set.lpOn||!S.contacts||!S.contacts.length)return false;const L=LSt();
  if(L.ph&&L.ph!=='dwait')return L.week===dk();   // 跨過午夜才結束的流程，不再擋隔天的每日留言
  const tk=dk();return new Date().getDay()===0&&L.week!==tk&&(!L.from||tk>=L.from)}catch(e){return false}}
function callIn(){const L=LSt(),c=cur();if(!S.set.lpOn){toast('學習進度還沒開啟（設置→學習進度）');return}if(!c)return;if(c.dnd){toast(c.name+' 免打擾中');return}
  if(L.ph){toast('他正在處理學習進度了');return}const now=Date.now();L.ph='w1';L.cid=c.id;L.idx=0;L.mid='';L.list=[];L.due=now+sec('lpT1',600);notice('正在選擇要不要更改學習進度',false,now);save();toast('已喊 '+c.name+' 來看學習進度',2200)}
window.LPE={call:callIn,tick,busy,toggled(on){const L=LSt();if(L.ph==='rows'||L.ph==='rate')dropNotice();L.ph='';L.mid='';L.list=[];if(on)L.from=nextSun();save()}};
setInterval(tick,3000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(tick,300)});
setTimeout(tick,2500);
})();

