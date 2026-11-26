/* 修正與新增：輸入框視覺換行、鍵盤避讓、引用訊息連點跳轉 */
(function(){
'use strict';
/* ── 1. 單行輸入框 → 自動增高、不插入換行的文字框 ── */
var SKIP_ID={cphex:1,mh1:1,mh2:1,abn:1,'cal-me':1,'mn-emoji':1,punt:1};
var TEXTY={text:1,search:1,tel:1,url:1,email:1,'':1};
var COPY=['id','class','placeholder','maxlength','style','disabled','readonly','autocomplete','enterkeyhint','spellcheck','autocapitalize','aria-label','title','name'];
function wanted(i){
  var ty=(i.getAttribute('type')||'').toLowerCase();
  if(!TEXTY[ty])return false;
  if(i.id&&SKIP_ID[i.id])return false;
  var im=(i.getAttribute('inputmode')||'').toLowerCase();
  if(im==='numeric'||im==='decimal'||im==='tel')return false;
  if(i.hasAttribute('data-nosl')||i.hasAttribute('list'))return false;
  return true;
}
function fit(t,full){
  if(!t||!t.isConnected)return;
  var len=t.value.length,w=t.clientWidth;
  /* 只是多打幾個字、而且還沒滿：不用重量（避免每個字都讓整個聊天室重排兩次） */
  if(!full&&t._h&&t._w===w&&len>=(t._ll||0)&&t.scrollHeight<=t.clientHeight+1){t._ll=len;return}
  if(!full&&t._h&&t._w===w&&len>=(t._ll||0)&&t.scrollHeight>t.clientHeight+1&&t._bw!=null){
    var g=t.scrollHeight+t._bw;t.style.height=g+'px';t._h=g;t._ll=len;return}
  t.style.height='auto';
  var h=t.scrollHeight;
  if(!h)return;
  var cs=getComputedStyle(t),bw=(parseFloat(cs.borderTopWidth)||0)+(parseFloat(cs.borderBottomWidth)||0);
  t._bw=cs.boxSizing==='border-box'?bw:0;
  h+=t._bw;
  t.style.height=h+'px';
  t._h=h;t._w=t.clientWidth;t._ll=len;
}
var fq=null,fqs=[];
function fitSoon(t){if(fqs.indexOf(t)<0)fqs.push(t);if(fq)return;fq=requestAnimationFrame(function(){fq=null;var l=fqs;fqs=[];l.forEach(function(x){fit(x)})})}
/* 程式把 value 清空／改掉時（例如送出後 i.value=''）也要重新量高度 */
try{var vd=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value');
Object.defineProperty(HTMLTextAreaElement.prototype,'value',{configurable:true,enumerable:vd.enumerable,get:vd.get,set:function(v){vd.set.call(this,v);if(this.classList&&this.classList.contains('sl')){var s=this;fit(s,1);requestAnimationFrame(function(){fit(s,1)})}}})}catch(e){}
var ro=window.ResizeObserver?new ResizeObserver(function(es){es.forEach(function(e){var t=e.target;if(t._w!==t.clientWidth)fitSoon(t)})}):null;
function conv(i){
  var t=document.createElement('textarea');
  COPY.forEach(function(a){if(i.hasAttribute(a))t.setAttribute(a,i.getAttribute(a))});
  Object.keys(i.dataset).forEach(function(k){t.dataset[k]=i.dataset[k]});
  t.rows=1;t.classList.add('sl');
  t.value=(i.getAttribute('value')!=null?i.getAttribute('value'):i.value)||'';
  i.replaceWith(t);
  if(ro)ro.observe(t);
  requestAnimationFrame(function(){fit(t,1)});
}
function sweep(root){
  if(!root||!root.querySelectorAll)return;
  var l=root.querySelectorAll('input');
  for(var k=0;k<l.length;k++)if(wanted(l[k]))conv(l[k]);
}
try{
  var d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  Object.defineProperty(Element.prototype,'innerHTML',{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){d.set.call(this,v);if(typeof v==='string'&&v.indexOf('<input')>-1)sweep(this)}});
  var ia=Element.prototype.insertAdjacentHTML;
  Element.prototype.insertAdjacentHTML=function(p,h){ia.call(this,p,h);if(typeof h==='string'&&h.indexOf('<input')>-1)sweep((p==='beforebegin'||p==='afterend')?this.parentNode:this)};
  var od=Object.getOwnPropertyDescriptor(Element.prototype,'outerHTML');
  Object.defineProperty(Element.prototype,'outerHTML',{configurable:true,enumerable:od.enumerable,get:od.get,set:function(v){var p=this.parentNode;od.set.call(this,v);if(p&&typeof v==='string'&&v.indexOf('<input')>-1)sweep(p)}});
}catch(e){}
document.addEventListener('DOMContentLoaded',function(){sweep(document.body)});
document.addEventListener('input',function(e){
  var t=e.target;
  if(!t||!t.classList||!t.classList.contains('sl'))return;
  if(t.id!=='in'&&/[\r\n]/.test(t.value)){var p=t.selectionStart,v=t.value,n=v.replace(/[\r\n]+/g,'');t.value=n;try{t.setSelectionRange(Math.max(0,p-(v.length-n.length)),Math.max(0,p-(v.length-n.length)))}catch(x){}}
  fitSoon(t);
},true);
document.addEventListener('keydown',function(e){
  var t=e.target;
  if(e.key==='Enter'&&!e.isComposing&&t&&t.classList&&t.classList.contains('sl')&&t.id!=='in')e.preventDefault();
});
document.addEventListener('focusin',function(e){var t=e.target;if(t&&t.classList&&t.classList.contains('sl'))setTimeout(function(){fit(t,1)},0)});
addEventListener('resize',function(){document.querySelectorAll('textarea.sl').forEach(function(t){fit(t,1)})});

/* ── 2. 鍵盤避讓：輸入框在鍵盤下面時自動移到鍵盤上面 ── */
var vv=window.visualViewport,root=document.documentElement;
function kbVars(){
  if(!vv)return;
  var full=Math.max(0,innerHeight-vv.height),kb=Math.max(0,full-vv.offsetTop);
  var open=full>100&&(vv.scale||1)<1.05;
  var ae=document.activeElement,kc=open&&!!(ae&&ae.closest&&ae.closest('#f'));
  if(root.classList.contains('kb-open')!==open)root.classList.toggle('kb-open',open);
  if(root.classList.contains('kb-chat')!==kc)root.classList.toggle('kb-chat',kc);
  var key=open?Math.round(vv.offsetTop)+'|'+Math.round(vv.height)+'|'+Math.round(kb):'0';
  if(key===kbVars._k)return;kbVars._k=key;
  if(open){root.style.setProperty('--vvt',vv.offsetTop+'px');root.style.setProperty('--vvh',vv.height+'px');root.style.setProperty('--kb',kb+'px')}
  else{root.style.removeProperty('--vvt');root.style.removeProperty('--vvh');root.style.setProperty('--kb','0px')}
}
function isField(el){return !!(el&&el.matches&&el.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]):not([type=button]),textarea,[contenteditable=""],[contenteditable="true"]'))}
function reveal(){
  var el=document.activeElement;
  if(!isField(el)||!vv)return;
  var r=el.getBoundingClientRect(),bottom=vv.offsetTop+vv.height-12,top=vv.offsetTop+8;
  var d=0;
  if(r.bottom>bottom)d=r.bottom-bottom;else if(r.top<top&&r.height<vv.height)d=r.top-top;
  if(!d)return;
  var p=el.parentElement;
  while(p&&p!==document.body&&p!==root){
    var cs=getComputedStyle(p);
    if(/(auto|scroll)/.test(cs.overflowY)&&p.scrollHeight>p.clientHeight+1){
      var before=p.scrollTop;
      p.scrollTop=before+d;
      d-=(p.scrollTop-before);
      if(Math.abs(d)<2)return;
    }
    p=p.parentElement;
  }
  /* 沒有可捲動的容器（例如固定在底部的輸入列）：交給瀏覽器 */
  try{el.scrollIntoView({block:'nearest'})}catch(x){}
}
var kt=null;
function kbSoon(){clearTimeout(kt);kt=setTimeout(function(){kbVars();reveal()},60)}
if(vv){vv.addEventListener('resize',kbSoon);vv.addEventListener('scroll',function(){kbVars()})}
document.addEventListener('focusin',function(e){
  if(!isField(e.target))return;
  [120,350,700].forEach(function(ms){setTimeout(function(){kbVars();reveal()},ms)});
});
document.addEventListener('focusout',function(){setTimeout(function(){if(!isField(document.activeElement))kbVars()},200)});

/* ── 3. 聊天室引用訊息：點一下跳到被引用的訊息 ── */
function findTarget(msgEl){
  var id=msgEl.id.slice(2);
  try{
    var list=ms(S.cur),i=list.findIndex(function(x){return x.id===id}),m=list[i];
    if(!m)return null;
    if(m.qid&&list.some(function(x){return x.id===m.qid}))return m.qid;
    for(var k=i-1;k>=0;k--){var x=list[k];if(m.qi?x.img===m.qi:(m.q&&((x.x===m.q)||(m.q==='[語音]'&&x.audio)||(m.q==='[表情包]'&&x.img&&!x.x))))return x.id}
  }catch(e){}
  return null;
}
document.addEventListener('click',function(e){
  var q=e.target.closest&&e.target.closest('#cl .qt');
  if(!q)return;
  var msg=q.closest('.m');if(!msg||!msg.id)return;
  e.stopPropagation();e.preventDefault();
  var old=document.querySelector('#cl .mact');if(old)old.remove();
  var tid=findTarget(msg),tg=tid&&document.getElementById('m-'+tid);
  if(!tg){try{toast('找不到原本的訊息，可能已被刪除')}catch(x){}return}
  tg.scrollIntoView({block:'center',behavior:'smooth'});
  tg.classList.add('qt-flash');setTimeout(function(){tg.classList.remove('qt-flash')},1600);
},true);

/* ── 4. 朋友圈吸頂：量標題高度，讓分頁籤接在標題下面 ── */
function mhh(){
  var v=document.getElementById('v'),h=v&&v.querySelector('.mom-stkh');
  if(h)v.style.setProperty('--mhh',Math.round(h.getBoundingClientRect().height-16)+'px');
}
var vEl=null;
function watchV(){
  var v=document.getElementById('v');
  if(!v||v===vEl)return;
  vEl=v;
  new MutationObserver(mhh).observe(v,{childList:true});
  mhh();
}
document.addEventListener('DOMContentLoaded',function(){watchV();setInterval(watchV,1500)});

/* ── 5. 請瀏覽器把資料標成「持久儲存」，降低被系統自動清掉的機率 ── */
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
})();
