/* ============================================================
   塗鴉（獨立模組・尚未接入 Pearla）
   用法與「紀念日 anniversary.js」相同：window.DD 提供 open / view，
   點擊用 data-a="dd" 與 data-a="dd:xxx"。接入步驟見 INTEGRATION.md
   資料存在 S.doodle：{set, colors, history, run}
   ============================================================ */
(function(){
'use strict';

const DD=window.DD={open:false,tab:'canvas',cid:'',exp:{},edit:false,sel:{},modal:null,confirm:null,view:vDD,fast:0,tick:tick,root:root};
const _r=()=>typeof rnd==='function'?rnd():Math.random();
const rint=(a,b)=>a+Math.floor(_r()*(b-a+1));
const rfl=(a,b)=>a+_r()*(b-a);
const pad=n=>String(n).padStart(2,'0');
const sc=()=>DD.fast||1;                       // 測試用時間倍率（正式為 1）
const contacts=()=>Array.isArray(S.contacts)?S.contacts:[];
const cname=id=>{const c=contacts().find(x=>x.id===id);return c?c.name:''};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

/* ---------- 預設值 ---------- */
const SHAPES=[['co','圓形（空心）'],['cs','圓形（實心）'],['tri','三角形'],['sq','正方形'],['rh','長方形（橫）'],['rv','長方形（豎）']];
const COLORS0=[['red','紅','#e57373'],['orange','橙','#f2a65a'],['yellow','黃','#f3d35f'],['green','綠','#7fc99b'],['blue','藍','#6ea8e4'],['indigo','靛','#5c63b5'],['purple','紫','#a883d6'],['gray','灰','#9b9aa8']];
const defSet=()=>({on:1,tmin:300,tmax:28800,cancel:50,nmin:1,nmax:5,smin:3,smax:180,
  w:{co:10,cs:10,tri:10,sq:10,rh:10,rv:10},pmin:10,pmax:50,overlap:1});
const defColors=()=>COLORS0.map(([id,n,c])=>({id,n,c,on:1,w:10,custom:0}));
const CANVAS={h:[500,300],v:[300,500],s:[400,400]};      // 橫 5:3、豎 3:5、正方形
const PLACE_GAP=600,STEP_GAP=500,HISTORY_MAX=500;

function fill(o,d){Object.keys(d).forEach(k=>{if(o[k]==null)o[k]=d[k]})}
function root(){
  if(!S.doodle||typeof S.doodle!=='object')S.doodle={};
  const d=S.doodle;
  if(!d.set||typeof d.set!=='object')d.set={};
  fill(d.set,defSet());
  if(!d.set.w||typeof d.set.w!=='object')d.set.w={};
  fill(d.set.w,defSet().w);
  if(!Array.isArray(d.colors))d.colors=defColors();
  defColors().forEach((c,i)=>{if(!d.colors.some(x=>x.id===c.id))d.colors.splice(i,0,c)});
  if(!Array.isArray(d.history))d.history=[];
  if(!d.run||typeof d.run!=='object')d.run={};
  return d;
}

/* ---------- 抽選工具 ---------- */
function wpick(items){
  const L=items.filter(x=>x.w>0);if(!L.length)return null;
  let t=L.reduce((a,x)=>a+x.w,0)*_r();
  for(const x of L){t-=x.w;if(t<0)return x.v}
  return L[L.length-1].v;
}
function dims(type,s){
  switch(type){
    case 'tri':return[s,s*0.866];
    case 'rh':return[s,s*0.6];      // 橫長方 5:3
    case 'rv':return[s*0.6,s];      // 豎長方 3:5
    default:return[s,s];
  }
}
const hit=(x,y,w,h,o)=>{const[ow,oh]=dims(o.type,o.s);return x<o.x+ow&&x+w>o.x&&y<o.y+oh&&y+h>o.y};
/* 位置＋大小：圖形一定完整在畫布內；不重疊時最多重試 60 個位置，仍放不下就逐步縮小，最後還放不下就略過這個圖形 */
function placeShape(type,w,h,existing){
  const st=root().set,short=Math.min(w,h);
  const lo=Math.min(st.pmin,st.pmax)/100*short,hi=Math.max(st.pmin,st.pmax)/100*short;
  let s=rfl(lo,hi);
  for(let k=0;k<14;k++){
    const[bw,bh]=dims(type,s);
    for(let t=0;t<60;t++){
      const x=rfl(0,w-bw),y=rfl(0,h-bh);
      if(st.overlap||!existing.some(o=>hit(x,y,bw,bh,o)))return{x:+x.toFixed(1),y:+y.toFixed(1),s:+s.toFixed(1)};
    }
    if(s<=lo)break;
    s=Math.max(lo,s*0.85);
  }
  return null;
}

/* ---------- 流程引擎 ----------
   每位聯絡人各跑各的：S.doodle.run[聯絡人id] = {st, due, ...}
   st：wait(等判定) → canvas → count → shape → color → pos →（下一個 shape…）→ place → placing → rest
   due 是絕對時間，所以關掉頁面再回來，到期的流程會依序補跑 */
function startCycle(R,now){
  const st=root().set;
  const lo=Math.min(st.tmin,st.tmax),hi=Math.max(st.tmin,st.tmax);
  Object.keys(R).forEach(k=>delete R[k]);
  R.st='wait';R.t0=now;R.max=Math.max(st.tmin,st.tmax);
  R.due=now+rint(lo,hi)*1000*sc();
  R.shapes=[];R.k=0;
}
function abort(R){R.st='rest';R.due=0;R.shapes=[]}
function step(cid,R,now){
  const d=root(),st=d.set;let changed=true;
  switch(R.st){
    case 'wait':{                                   // 時間到：決定要不要畫
      const dnd=typeof isDnd==='function'&&isDnd(cid);
      if(dnd||_r()*100<st.cancel){
        R.st='rest';R.due=R.t0+R.max*1000*sc();     // 取消：要等到最長時間過了才有下一次判定
        R.shapes=[];
      }else{R.st='canvas';R.due+=STEP_GAP*sc()}
      break}
    case 'canvas':{                                 // 畫布：橫／豎／正方形隨機
      R.cv=['h','v','s'][rint(0,2)];R.st='count';R.due+=STEP_GAP*sc();break}
    case 'count':{                                  // 放幾個
      const lo=Math.min(st.nmin,st.nmax),hi=Math.max(st.nmin,st.nmax);
      R.n=rint(lo,hi);R.k=0;R.st='shape';
      R.due+=rint(Math.min(st.smin,st.smax),Math.max(st.smin,st.smax))*1000*sc();   // 第一個圖形的選擇時間
      break}
    case 'shape':{                                  // 形狀（可重複、沒有保底）
      const t=wpick(SHAPES.map(([k])=>({v:k,w:+st.w[k]||0})));
      if(!t){abort(R);break}
      R.cur={type:t};R.st='color';R.due+=STEP_GAP*sc();break}
    case 'color':{                                  // 顏色
      const c=wpick(d.colors.filter(x=>x.on).map(x=>({v:x.c,w:+x.w||0})));
      if(!c){abort(R);break}
      R.cur.color=c;R.st='pos';R.due+=STEP_GAP*sc();break}
    case 'pos':{                                    // 大小與位置
      const[w,h]=CANVAS[R.cv],p=placeShape(R.cur.type,w,h,R.shapes);
      if(p)R.shapes.push({type:R.cur.type,color:R.cur.color,x:p.x,y:p.y,s:p.s});
      R.cur=null;R.k++;
      if(R.k<R.n){R.st='shape';R.due+=rint(Math.min(st.smin,st.smax),Math.max(st.smin,st.smax))*1000*sc()}   // 下一個圖形的選擇時間
      else{R.st='place';R.due+=STEP_GAP*sc()}
      break}
    case 'place':{                                  // 全部選完：建立畫布，準備依序放上去
      if(!R.shapes.length){abort(R);break}
      const[w,h]=CANVAS[R.cv],rec={id:uid(),cid,t:R.due,cv:R.cv,w,h,shapes:[]};
      d.history.unshift(rec);
      if(d.history.length>HISTORY_MAX)d.history.length=HISTORY_MAX;
      R.rid=rec.id;R.pi=0;R.st='placing';
      break}
    case 'placing':{
      const rec=d.history.find(x=>x.id===R.rid);
      if(rec&&R.shapes[R.pi])rec.shapes.push(R.shapes[R.pi]);
      R.pi++;
      if(R.pi>=R.shapes.length)abort(R);            // 畫完：馬上開始下一輪計時
      else R.due+=PLACE_GAP*sc();
      break}
    case 'rest':startCycle(R,now);break;
    default:startCycle(R,now);
  }
  return changed;
}
function tick(){
  try{
    if(typeof S==='undefined'||!S||!Array.isArray(S.contacts))return;
    const d=root(),now=Date.now();let ch=false;
    if(!d.set.on){if(Object.keys(d.run).length){d.run={};ch=true}}
    else{
      contacts().forEach(c=>{
        let R=d.run[c.id];
        if(!R){R=d.run[c.id]={};startCycle(R,now);ch=true}
        let g=0;
        while(R.due<=now&&g++<400){step(c.id,R,now);ch=true}
      });
      Object.keys(d.run).forEach(id=>{if(!contacts().some(c=>c.id===id)){delete d.run[id];ch=true}});
    }
    if(ch){save();refresh()}
  }catch(e){console.error('[doodle]',e)}
}
function startTimer(){
  if(DD._t)return;
  DD._t=setInterval(tick,500);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});
  addEventListener('pageshow',tick);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startTimer);else startTimer();

/* ---------- 畫布繪製 ---------- */
const f1=n=>(+n).toFixed(1);
function shapeSvg(sh,pop){
  const cl=pop?' class="dd-pop"':'',c=esc(sh.color),s=sh.s,x=sh.x,y=sh.y;
  switch(sh.type){
    case 'co':{const w=Math.max(2,s*0.1);return '<circle'+cl+' cx="'+f1(x+s/2)+'" cy="'+f1(y+s/2)+'" r="'+f1((s-w)/2)+'" fill="none" stroke="'+c+'" stroke-width="'+f1(w)+'"/>'}
    case 'cs':return '<circle'+cl+' cx="'+f1(x+s/2)+'" cy="'+f1(y+s/2)+'" r="'+f1(s/2)+'" fill="'+c+'"/>';
    case 'tri':{const h=s*0.866;return '<polygon'+cl+' points="'+f1(x+s/2)+','+f1(y)+' '+f1(x)+','+f1(y+h)+' '+f1(x+s)+','+f1(y+h)+'" fill="'+c+'"/>'}
    default:{const[w,h]=dims(sh.type,s);return '<rect'+cl+' x="'+f1(x)+'" y="'+f1(y)+'" width="'+f1(w)+'" height="'+f1(h)+'" fill="'+c+'"/>'}
  }
}
function svgOf(rec,id){
  return '<svg class="dd-svg" '+(id?'id="ddsvg" data-id="'+esc(rec.id)+'" data-n="'+rec.shapes.length+'" ':'')+'viewBox="0 0 '+rec.w+' '+rec.h+'" style="aspect-ratio:'+rec.w+'/'+rec.h+'" xmlns="http://www.w3.org/2000/svg">'
    +'<rect width="'+rec.w+'" height="'+rec.h+'" fill="#fffefb"/>'+rec.shapes.map(s=>shapeSvg(s)).join('')+'</svg>';
}
const when=t=>{const d=new Date(t);return d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 '+pad(d.getHours())+':'+pad(d.getMinutes())};
const curOf=cid=>root().history.find(h=>h.cid===cid);
function statusText(){
  const R=root().run[DD.cid];if(!R)return '';
  const n=cname(DD.cid)||'對方';
  if(['canvas','count','shape','color','pos'].includes(R.st))return n+'正在構思…';
  if(R.st==='place'||R.st==='placing')return n+'正在畫…';
  return '';
}
/* 引擎有動靜時：只在「畫布」分頁微調畫面，不整頁重畫 */
function refresh(){
  if(!DD.open||DD.modal||DD.confirm||DD.tab!=='canvas')return;
  const stat=document.querySelector('#ddstat');if(stat)stat.textContent=statusText();
  const rec=curOf(DD.cid),el=document.querySelector('#ddsvg');
  if(!rec){if(el)R(true);return}
  if(!el||el.dataset.id!==rec.id){R(true);return}
  const n=+el.dataset.n;
  if(rec.shapes.length>n){
    for(let i=n;i<rec.shapes.length;i++)el.insertAdjacentHTML('beforeend',shapeSvg(rec.shapes[i],true));
    el.dataset.n=rec.shapes.length;
  }
}

/* ---------- 畫面 ---------- */
function R(keep){const v=document.querySelector('#v'),y=v?v.scrollTop:0;render();if(keep&&v)v.scrollTop=y}
const top0=()=>{const v=document.querySelector('#v');if(v)v.scrollTop=0};
const TABS=[['canvas','畫布'],['past','過往畫布'],['set','設置'],['help','說明']];

function vDD(){
  const d=root();
  if(!DD.cid||!contacts().some(c=>c.id===DD.cid))DD.cid=(S.cur&&contacts().some(c=>c.id===S.cur))?S.cur:(contacts()[0]||{}).id||'';
  let h='<div class="dd-bar0"><span>塗鴉</span></div><div class="ph2 dd-ph"><button class="ib" data-a="dd:back">‹</button></div>'
   +'<div class="dd-top"><div class="dd-tabs">'+TABS.map(([k,n])=>'<button type="button" class="chip dd-tab'+(DD.tab===k?' on':'')+'" data-a="dd:tab" data-i="'+k+'">'+n+'</button>').join('')+'</div></div>';
  if(DD.tab==='canvas'||DD.tab==='past')h+=chips();
  h+=DD.tab==='canvas'?vCanvas():DD.tab==='past'?vPast():DD.tab==='set'?vSet():vHelp();
  return h+modalHtml()+confirmHtml();
}
function chips(){
  const L=contacts();if(L.length<2&&DD.tab==='canvas')return '';
  const items=(DD.tab==='past'?[['','全部']]:[]).concat(L.map(c=>[c.id,c.name]));
  const cur=DD.tab==='past'?(DD.pcid||''):DD.cid;
  return '<div class="an-cats">'+items.map(([id,n])=>'<button type="button" class="chip an-chip'+(cur===id?' on':'')+'" data-a="dd:cat" data-i="'+esc(id)+'">'+esc(n)+'</button>').join('')+'</div>';
}
function vCanvas(){
  const rec=curOf(DD.cid);
  if(!rec)return '<div class="empty" id="ddempty">還沒有畫布。<br>聯絡人隨機決定要畫畫後，畫布會出現在這裡。</div><div class="dd-stat" id="ddstat">'+esc(statusText())+'</div>';
  return '<div class="card dd-cv"><div class="dd-cvh"><span>'+esc(cname(rec.cid))+'</span><small>'+when(rec.t)+'</small></div>'+svgOf(rec,true)+'</div><div class="dd-stat" id="ddstat">'+esc(statusText())+'</div>';
}
function pastList(){
  const cid=DD.pcid||'';
  return root().history.filter(h=>curOf(h.cid)!==h&&(!cid||h.cid===cid));
}
function vPast(){
  const L=pastList();
  if(DD.edit)Object.keys(DD.sel).forEach(id=>{if(!L.some(x=>x.id===id))delete DD.sel[id]});
  const n=Object.keys(DD.sel).length,all=L.length&&n===L.length;
  let h='';
  if(L.length){
    h+='<div class="dd-bar">'+(DD.edit
      ?'<button type="button" class="dd-ck selall'+(all?' on':'')+'" data-a="dd:all" aria-label="全選"></button><span class="dd-n0">已選 '+n+'</span><span class="grow"></span><button type="button" class="btn d" data-a="dd:del"'+(n?'':' disabled')+'>刪除</button><button type="button" class="btn" data-a="dd:done">完成</button>'
      :'<span class="dd-n0">共 '+L.length+' 張</span><span class="grow"></span><button type="button" class="btn" data-a="dd:edit">編輯</button>')+'</div>';
    h+=L.map(rec=>{
      const open=!DD.edit&&DD.exp[rec.id];
      return '<div class="dd-item'+(open?' open':'')+'"><div class="dd-ih" data-a="dd:tog" data-i="'+esc(rec.id)+'">'
        +(DD.edit?'<span class="dd-ck'+(DD.sel[rec.id]?' on':'')+'"></span>':'')
        +'<div class="dd-it"><b>'+when(rec.t)+'</b><small>'+esc(cname(rec.cid))+' · '+rec.shapes.length+' 個圖形</small></div>'
        +(DD.edit?'':'<span class="dd-chev">›</span>')+'</div>'
        +(open?'<div class="dd-body">'+svgOf(rec)+'</div>':'')+'</div>';
    }).join('');
  }else h+='<div class="empty">還沒有過往畫布。<br>新的畫布出現後，上一張會收進這裡。</div>';
  return h;
}

/* 設置 */
const mm=s=>Math.floor(s/60),ss=s=>s%60;
function numIn(key,val,extra){return '<input class="dd-n" type="text" inputmode="numeric" maxlength="3" data-dd="'+key+'"'+(extra||'')+' value="'+val+'" autocomplete="off">'}
function rowSw(label,key,on){return '<div class="dd-row"><span class="dd-l">'+label+'</span><button type="button" class="sw'+(on?' on':'')+'" data-a="dd:sw" data-i="'+key+'" aria-label="'+label+'"></button></div>'}
function rowN(label,inner){return '<div class="dd-row"><span class="dd-l">'+label+'</span><span class="dd-v">'+inner+'</span></div>'}
function cell(c){
  return '<div class="dd-cc'+(c.on?'':' off')+'"><button type="button" class="sw'+(c.on?' on':'')+'" data-a="dd:csw" data-i="'+esc(c.id)+'" aria-label="'+esc(c.n)+'"></button>'
    +'<span class="dd-dot" style="background:'+esc(c.c)+'"></span><span class="dd-cn">'+esc(c.n)+'</span>'+numIn('cw',c.w,' data-id="'+esc(c.id)+'"')+'</div>';
}
function vSet(){
  const d=root(),s=d.set,tmax=s.tmax;
  let h='<div class="dd-sec">一般</div><div class="card dd-card">'
   +rowSw('塗鴉功能','on',s.on)
   +rowN('塗鴉時間最短',numIn('tmin',mm(s.tmin),' data-u="m"')+'分'+numIn('tmin',ss(s.tmin),' data-u="s"')+'秒')
   +rowN('塗鴉時間最長',numIn('tmax',Math.floor(tmax/3600),' data-u="h"')+'時'+numIn('tmax',mm(tmax%3600),' data-u="m"')+'分'+numIn('tmax',ss(tmax),' data-u="s"')+'秒')
   +rowN('取消塗鴉機率',numIn('cancel',s.cancel)+'%')
   +rowN('每次放置圖形最少',numIn('nmin',s.nmin)+'個')
   +rowN('每次放置圖形最多',numIn('nmax',s.nmax)+'個')
   +'</div><p class="hint">取消塗鴉後，要等到最長時間過了才會進行下一次判定。</p>';
  h+='<div class="dd-sec">圖形</div><div class="card dd-card">'
   +rowN('每個圖形選擇時間最短',numIn('smin',s.smin)+'秒')
   +rowN('每個圖形選擇時間最長',numIn('smax',s.smax)+'秒')
   +SHAPES.map(([k,n])=>rowN(n+'權重',numIn('w',s.w[k],' data-id="'+k+'"'))).join('')
   +rowN('圖形最小為畫布短邊的',numIn('pmin',s.pmin)+'%')
   +rowN('圖形最大為畫布短邊的',numIn('pmax',s.pmax)+'%')
   +'</div>';
  h+='<div class="dd-sec">圖形位置</div><div class="card dd-card">'+rowSw('圖形重疊','overlap',s.overlap)+'</div>'
   +'<p class="hint">關閉重疊時，放不下的圖形會自動縮小再試；還是放不下就會略過。</p>';
  const base=d.colors.filter(c=>!c.custom),cus=d.colors.filter(c=>c.custom);
  h+='<div class="dd-sec">圖形顏色權重</div><div class="card dd-card"><div class="dd-cg">'+base.map(cell).join('')+'</div>'
   +(cus.length?'<div class="dd-cus">'+cus.map(c=>'<div class="dd-cc dd-cu'+(c.on?'':' off')+'"><button type="button" class="sw'+(c.on?' on':'')+'" data-a="dd:csw" data-i="'+esc(c.id)+'" aria-label="'+esc(c.n)+'"></button><span class="dd-dot" style="background:'+esc(c.c)+'"></span><span class="dd-cn">'+esc(c.n)+'</span><span class="grow"></span>'+numIn('cw',c.w,' data-id="'+esc(c.id)+'"')+'<button type="button" class="dd-x" data-a="dd:cdel" data-i="'+esc(c.id)+'" aria-label="刪除顏色">✕</button></div>').join('')+'</div>':'')
   +'</div>'
   +'<button type="button" class="btn dd-wide" data-a="dd:cadd">＋ 添加自訂顏色</button>'
   +'<button type="button" class="btn d dd-wide" data-a="dd:reset">恢復默認設定</button>'
   +'<p class="hint">不刪除手動添加的自訂顏色</p>';
  return h;
}

/* 說明 */
function vHelp(){
  const P=(t,b)=>'<div class="dd-sec">'+t+'</div><div class="card dd-hc">'+b+'</div>';
  return P('塗鴉是什麼','<p>你的聯絡人偶爾會在空閒時隨手畫一張畫：先挑畫布，再一個一個選圖形、顏色和位置，最後依序放到畫布上。畫好的畫布會出現在「畫布」分頁，每位聯絡人各畫各的。</p>')
   +P('一次塗鴉怎麼進行','<p>① 在「最短～最長時間」之間隨機等一段時間。<br>② 時間到了，先依「取消塗鴉機率」決定要不要畫。不畫的話，要等到最長時間過了才會進行下一次判定。<br>③ 要畫就依序決定：畫布 → 放幾個圖形 → 第一個圖形的形狀 → 顏色 → 位置，有第二個、第三個就照同樣順序繼續。<br>④ 每個步驟之間隔 0.5 秒；每個圖形開始前，還會等一段「圖形選擇時間」。<br>⑤ 全部選完才會一個一個放上畫布。畫完後，馬上開始下一次計時。</p>')
   +P('畫布與圖形','<p>畫布隨機是橫長方形、豎長方形或正方形，長方形比例固定 3:5。<br>圖形有空心圓、實心圓、三角形、正方形、橫長方形、豎長方形（長方形同樣 3:5）。每次都是獨立隨機，不保底，所以可能連續出現同樣的圖形。<br>大小、位置、顏色也都是隨機，圖形一定完整落在畫布裡。</p>')
   +P('設置說明','<p><b>權重</b>：數字越大越容易被選到，0 代表不會出現。顏色的開關關掉就不會使用。<br><b>圖形大小</b>：以畫布短邊為基準的百分比，是圖形最長那一邊的長度。<br><b>圖形重疊</b>：關掉後，圖形盡量不互相壓到；放不下時會先縮小再試，還是不行就略過這個圖形。<br><b>自訂顏色</b>：可以自己添加，也能單獨設定權重或刪除。<br><b>恢復默認設定</b>：所有數值回到預設，但不會刪除你添加的自訂顏色。</p>')
   +P('過往畫布','<p>聯絡人畫出新的畫布後，上一張就會收進「過往畫布」，標有日期與時間。點一下可以展開查看；按「編輯」可以多選、全選並刪除，刪除前會再確認一次。</p>')
   +P('小提醒','<p>關掉頁面後，時間仍然照常計算；再打開時，到期的塗鴉會接著完成。聯絡人開了免打擾時，時間照跑，但不會塗鴉。</p>');
}

/* 浮窗 */
function modalHtml(){
  const m=DD.modal;if(!m)return '';
  return '<div class="an-ov"><div class="an-pop box" data-keep="1"><h2 class="an-mt">添加自訂顏色</h2>'
   +'<div class="an-f dd-pick"><span class="an-pl">顏色</span><input id="ddcol" type="color" data-ddm="c" value="'+esc(m.c)+'"></div>'
   +'<label class="an-f"><span class="an-pl">名稱（選填）</span><input id="ddname" data-ddm="n" value="'+esc(m.n)+'" placeholder="例如：粉、奶茶" maxlength="6" autocomplete="off"></label>'
   +'<div class="an-acts"><span class="grow"></span><button type="button" class="btn" data-a="dd:mno">取消</button><button type="button" class="btn s" data-a="dd:myes">添加</button></div></div></div>';
}
function confirmHtml(){
  const c=DD.confirm;if(!c)return '';
  const T={
    del:['是否確認刪除？','選取的 '+Object.keys(DD.sel).length+' 張畫布刪除後無法復原。','確認刪除'],
    cdel:['是否確認刪除？','這個自訂顏色刪除後無法復原。','確認刪除'],
    reset:['是否恢復默認設定？','所有設置回到預設值，不會刪除自訂顏色。','確認恢復']
  }[c.k];
  return '<div class="an-ov an-cf"><div class="box an-cfbox" data-keep="1"><h2 style="margin-bottom:6px">'+T[0]+'</h2><p class="hint" style="margin:0 0 10px">'+T[1]+'</p><div class="an-cfa"><button type="button" class="btn" data-a="dd:cfno">取消</button><button type="button" class="btn d" data-a="dd:cfyes">'+T[2]+'</button></div></div></div>';
}

/* ---------- 點擊 ---------- */
function act(a,i,el){
  const d=root(),s=d.set;
  switch(a){
    case 'dd':DD.open=true;DD.tab='canvas';DD.cid=S.cur||'';DD.pcid='';DD.edit=false;DD.sel={};DD.exp={};DD.modal=null;DD.confirm=null;render();top0();return true;
    case 'dd:back':if(DD.confirm)DD.confirm=null;else if(DD.modal)DD.modal=null;else DD.open=false;render();top0();return true;
    case 'dd:tab':DD.tab=i;DD.edit=false;DD.sel={};R();top0();return true;
    case 'dd:cat':if(DD.tab==='past'){DD.pcid=i;DD.sel={}}else DD.cid=i;R(true);return true;
    case 'dd:tog':if(DD.edit){if(DD.sel[i])delete DD.sel[i];else DD.sel[i]=1}else{if(DD.exp[i])delete DD.exp[i];else DD.exp[i]=1}R(true);return true;
    case 'dd:edit':DD.edit=true;DD.sel={};R(true);return true;
    case 'dd:done':DD.edit=false;DD.sel={};R(true);return true;
    case 'dd:all':{const L=pastList();if(Object.keys(DD.sel).length===L.length)DD.sel={};else{DD.sel={};L.forEach(x=>DD.sel[x.id]=1)}R(true);return true}
    case 'dd:del':if(Object.keys(DD.sel).length){DD.confirm={k:'del'};R(true)}return true;
    case 'dd:sw':s[i]=s[i]?0:1;el.classList.toggle('on',!!s[i]);save();return true;
    case 'dd:csw':{const c=d.colors.find(x=>x.id===i);if(c){c.on=c.on?0:1;el.classList.toggle('on',!!c.on);const cc=el.closest('.dd-cc');if(cc)cc.classList.toggle('off',!c.on);save()}return true}
    case 'dd:cadd':DD.modal={c:'#e8a6c8',n:''};R(true);return true;
    case 'dd:mno':DD.modal=null;R(true);return true;
    case 'dd:myes':{
      const m=DD.modal,n=(m.n||'').trim()||('自訂'+(d.colors.filter(x=>x.custom).length+1));
      d.colors.push({id:'u'+uid(),n,c:m.c,on:1,w:10,custom:1});
      DD.modal=null;save();R(true);return true}
    case 'dd:cdel':DD.confirm={k:'cdel',id:i};R(true);return true;
    case 'dd:reset':DD.confirm={k:'reset'};R(true);return true;
    case 'dd:cfno':DD.confirm=null;R(true);return true;
    case 'dd:cfyes':{
      const c=DD.confirm;DD.confirm=null;
      if(c.k==='del'){d.history=d.history.filter(x=>!DD.sel[x.id]);DD.sel={};DD.edit=false}
      else if(c.k==='cdel'){d.colors=d.colors.filter(x=>x.id!==c.id)}
      else if(c.k==='reset'){
        const cus=d.colors.filter(x=>x.custom).map(x=>Object.assign(x,{on:1,w:10}));
        d.set=defSet();d.colors=defColors().concat(cus);d.run={};
      }
      save();R(true);return true}
  }
  return false;
}
document.addEventListener('click',e=>{
  const t=e.target;if(!t||!t.closest)return;
  if(DD.open&&t.closest('[data-t]')&&!t.closest('[data-a]')){DD.open=false;DD.modal=null;DD.confirm=null;return}   // 切換底部分頁時離開
  const A=t.closest('[data-a="dd"],[data-a^="dd:"]');
  if(!A){
    if(DD.open&&DD.confirm&&t.classList&&t.classList.contains('an-cf')){DD.confirm=null;R(true)}
    return;
  }
  if(act(A.dataset.a,A.dataset.i,A)){e.stopPropagation();e.preventDefault()}
},true);

/* ---------- 輸入 ---------- */
document.addEventListener('input',e=>{
  const t=e.target;if(!t||!t.dataset||!DD.open||!DD.modal||!t.dataset.ddm)return;
  DD.modal[t.dataset.ddm]=t.value;
});
function num(el){return Math.max(0,parseInt(String(el.value).replace(/\D/g,''),10)||0)}
function timeOf(key){
  let sum=0;
  document.querySelectorAll('[data-dd="'+key+'"]').forEach(x=>{const u=x.dataset.u,v=num(x);sum+=u==='h'?v*3600:u==='m'?v*60:v});
  return sum;
}
document.addEventListener('change',e=>{
  const t=e.target;if(!t||!t.dataset||!DD.open||DD.tab!=='set'||!t.dataset.dd)return;
  const s=root().set,k=t.dataset.dd,v=num(t);
  switch(k){
    case 'tmin':s.tmin=Math.max(1,timeOf('tmin'));if(s.tmin>s.tmax)s.tmax=s.tmin;break;
    case 'tmax':s.tmax=Math.max(1,timeOf('tmax'));if(s.tmax<s.tmin)s.tmin=s.tmax;break;
    case 'cancel':s.cancel=clamp(v,0,100);break;
    case 'nmin':s.nmin=clamp(v,1,99);if(s.nmin>s.nmax)s.nmax=s.nmin;break;
    case 'nmax':s.nmax=clamp(v,1,99);if(s.nmax<s.nmin)s.nmin=s.nmax;break;
    case 'smin':s.smin=Math.max(1,v);if(s.smin>s.smax)s.smax=s.smin;break;
    case 'smax':s.smax=Math.max(1,v);if(s.smax<s.smin)s.smin=s.smax;break;
    case 'pmin':s.pmin=clamp(v,1,100);if(s.pmin>s.pmax)s.pmax=s.pmin;break;
    case 'pmax':s.pmax=clamp(v,1,100);if(s.pmax<s.pmin)s.pmin=s.pmax;break;
    case 'w':s.w[t.dataset.id]=clamp(v,0,999);break;
    case 'cw':{const c=root().colors.find(x=>x.id===t.dataset.id);if(c)c.w=clamp(v,0,999);break}
    default:return;
  }
  save();R(true);
});
})();
