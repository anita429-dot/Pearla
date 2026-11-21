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

const LP=window.LP={open:false,rows:ROWS,view:vLp,set:setRow,data:data};

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
  return '<div class="ph2"><button class="ib" data-a="lp:back">‹</button><h1>學習進度</h1></div>'+ROWS.map(row).join('');
}

/* 只處理「進入」與「返回」；欄列本身沒有任何點擊反應 */
document.addEventListener('click',e=>{
  const t=e.target;if(!t||!t.closest)return;
  if(LP.open&&t.closest('[data-t]')&&!t.closest('[data-a]')){LP.open=false;return}   // 切換底部分頁時離開
  const A=t.closest('[data-a="lp"],[data-a="lp:back"],[data-a="lp:sw"]');if(!A)return;
  e.stopPropagation();e.preventDefault();
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
function notice(text,reuse){const L=LSt(),c=S.contacts.find(x=>x.id===L.cid);if(!c)return;const x=c.name+text,a=ms(c.id);
  if(reuse&&L.mid){const m=a.find(y=>y.id===L.mid);if(m){m.x=x;save();const el=document.getElementById('m-'+m.id);if(el)el.textContent=x;return}}
  const m={id:uid(),f:'sys',pat:1,lp:1,x,t:Date.now()};a.push(m);L.mid=m.id;save();
  if(tab==='chat'&&S.cur===c.id&&typeof paint==='function')paint()}
function dropNotice(){const L=LSt(),c=S.contacts.find(x=>x.id===L.cid);if(!c||!L.mid)return;const a=ms(c.id),i=a.findIndex(y=>y.id===L.mid);if(i>=0){a.splice(i,1);save();if(tab==='chat'&&S.cur===c.id&&typeof paint==='function')paint()}L.mid=''}
function showRow(){const L=LSt();notice('正在修改學習進度熟練條，目前正在修改：'+rowName(L.list[L.idx]),L.idx>0)}
function rowDue(){return Date.now()+inspRand(S.set.lpRmin==null?3:S.set.lpRmin,S.set.lpRmax==null?120:S.set.lpRmax)}
function startRows(now){const L=LSt();L.list=LP.rows.map(r=>r[0]).filter(id=>LP.data(id).on);L.idx=0;L.mid='';
  if(!L.list.length){L.ph='';save();if(typeof dailyTick==='function')setTimeout(dailyTick,500);return}
  L.ph='rows';showRow();L.due=rowDue();save()}
function judge(n,now){const L=LSt(),p=Math.max(0,Math.min(100,+S.set.lpProb||0));
  if(rnd()*100<p){startRows(now);return}
  L.mid='';
  if(n===1){L.ph='w2';L.due=now+sec('lpT2',1800);notice('決定晚點再看看學習進度');save()}
  else{L.ph='';notice('決定不改變學習進度');save();if(typeof dailyTick==='function')setTimeout(dailyTick,500)}}
/* 每一欄的流程：修改熟練條 → 10 秒後隨機選擇評價（最後一步）→ 下一欄 */
function stepRow(now){const L=LSt();
  while(L.idx<L.list.length&&!LP.data(L.list[L.idx]).on){L.idx++}
  if(L.idx<L.list.length){const id=L.list[L.idx],d=LP.data(id),delta=[-20,-10,0,10,20][ri(5)];LP.set(id,{p:Math.max(0,Math.min(100,d.p+delta))});L.rid=id;L.idx++;L.ph='rate';L.due=now+10000;if(LP.open)render();save();return}
  afterRow(now)}
function rateRow(now){const L=LSt();if(L.rid&&LP.data(L.rid).on!==false)LP.set(L.rid,{r:ri(5)});L.rid='';L.ph='rows';if(LP.open)render();afterRow(now)}
function afterRow(now){const L=LSt();
  while(L.idx<L.list.length&&!LP.data(L.list[L.idx]).on){L.idx++}
  if(L.idx>=L.list.length){L.ph='';dropNotice();L.list=[];save();if(typeof dailyTick==='function')setTimeout(dailyTick,500);return}
  showRow();L.due=rowDue();save()}
function tick(){try{
  if(!S||!S.set||!S.contacts)return;const L=LSt(),now=Date.now();
  if(!S.set.lpOn){if(L.ph){if(L.ph==='rows'||L.ph==='rate')dropNotice();L.ph='';L.mid='';save();if(typeof dailyTick==='function')setTimeout(dailyTick,500)}return}
  const tk=dk(),sun=new Date().getDay()===0;
  if(!L.ph&&sun&&L.week!==tk&&(!L.from||tk>=L.from)){const c=cur();if(c){L.week=tk;L.ph='w1';L.cid=c.id;L.idx=0;L.mid='';L.list=[];L.due=now+sec('lpT1',600);notice('正在選擇要不要更改學習進度');save();return}}
  if(L.ph==='dwait'){L.ph='';save();return}   // 舊版殘留狀態
  if(L.ph==='w1'&&now>=L.due)judge(1,now);
  else if(L.ph==='w2'&&now>=L.due)judge(2,now);
  else if(L.ph==='rows'&&now>=L.due)stepRow(now);
  else if(L.ph==='rate'&&now>=L.due)rateRow(now);
}catch(e){}}
/* 今天是禮拜日、學習進度開著，且今天的流程還沒開始或還沒結束 → 每日留言先等 */
function busy(){try{if(!S||!S.set||!S.set.lpOn||!S.contacts||!S.contacts.length)return false;const L=LSt();
  if(L.ph&&L.ph!=='dwait')return L.week===dk();   // 跨過午夜才結束的流程，不再擋隔天的每日留言
  const tk=dk();return new Date().getDay()===0&&L.week!==tk&&(!L.from||tk>=L.from)}catch(e){return false}}
window.LPE={tick,busy,toggled(on){const L=LSt();if(L.ph==='rows'||L.ph==='rate')dropNotice();L.ph='';L.mid='';L.list=[];if(on)L.from=nextSun();save()}};
setInterval(tick,3000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(tick,300)});
setTimeout(tick,2500);
})();

