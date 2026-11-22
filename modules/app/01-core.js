
/* 預設值只在這裡定義一次（資料升級時也用同一份） */
const LWMAX_DEF=28800,MOM_TMAX_DEF=21600;
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const rnd=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
const ri=n=>Math.floor(rnd()*n);
const tm=t=>{const d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
const ini=n=>String(n||'').trim().slice(0,1)||'TA';
const WAITS=[3,10,30,60,300,900,1800,3600,7200];
const WL=s=>s<60?s+' 秒':s<3600?s/60+' 分鐘':s/3600+' 小時';
let S,db,tab='home',scope='e',kind='card',selCat=null,askCb=null,jump=null,catDirty=false,emoScope='s',emoCat=null,notifBack=false,homeSnap=null,lastRenderedTab='';

/* ── IndexedDB ── */
const idb=()=>new Promise(r=>{try{const q=indexedDB.open('pearla',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>{db=q.result;r()};q.onerror=()=>r()}catch(e){r()}});
let myRev=0,saveWarnAt=0;
const load=()=>new Promise(r=>{if(!db)return r(null);try{const tx=db.transaction('kv'),st=tx.objectStore('kv'),q=st.get('s'),g=st.get('rev');g.onsuccess=()=>{myRev=+g.result||0};q.onsuccess=()=>r(q.result||null);q.onerror=()=>r(null)}catch(e){r(null)}});
/* 儲存：成功與否都會確認。背景中的視窗若發現別的視窗已存了較新的資料，不會覆蓋，改為重新讀取；儲存失敗會提醒 */
function saveFail(err){try{console.error('Pearla save failed',err)}catch(e){}const n=Date.now();if(n-saveWarnAt<20000)return;saveWarnAt=n;if(typeof toast==='function')toast('⚠ 儲存失敗（可能是儲存空間已滿）：請先到「設置→數據」備份並清理',6000)}
async function reloadFromDb(){try{const o=await load();if(!o||!Array.isArray(o.contacts)||!o.contacts.length)return;S=mig(Object.assign(def(),o,{tags:o.tags}));applyTheme();render();toast('已同步另一個視窗的最新資料',2500)}catch(e){}}
function syncCheck(){if(!db)return;try{const q=db.transaction('kv').objectStore('kv').get('rev');q.onsuccess=()=>{if((+q.result||0)>myRev)reloadFromDb()}}catch(e){}}
const save=()=>{try{if(!db||!S)return;const snap=JSON.parse(JSON.stringify(S)),tx=db.transaction('kv','readwrite'),st=tx.objectStore('kv'),g=st.get('rev');let conflict=false;
  g.onsuccess=()=>{const r=+g.result||0;if(r>myRev&&document.hidden){conflict=true;tx.abort();return}const nr=Math.max(Date.now(),r+1,myRev+1);st.put(snap,'s');st.put(nr,'rev');myRev=nr};
  tx.onabort=()=>{if(conflict)setTimeout(reloadFromDb,0);else saveFail(tx.error)};
  tx.onerror=()=>{}}catch(e){saveFail(e)}};
/* 關閉／切到背景前立刻存檔，流程進度（排程時間）不會因為 300ms 的延遲存檔而遺失；回到畫面時馬上補跑到期的流程 */
['pagehide','beforeunload'].forEach(ev=>addEventListener(ev,()=>{try{if(S)save()}catch(e){}}));
document.addEventListener('visibilitychange',()=>{try{if(!S)return;if(document.hidden)save();else{syncCheck();resumeTick()}}catch(e){}});
addEventListener('pageshow',()=>{try{if(S)resumeTick()}catch(e){}});

function def(){
  const a=uid(),b=uid(),c1=uid(),c2=uid(),c3=uid();
  return{me:'我',cur:a,contacts:[{id:a,name:'名字'}],msgs:{},kitchen:{attempts:0,products:[],unlocked:[]},
    cats:[],
    cards:[],
    set:{keepBg:0,wi:2,star:10,dailyMoodOn:1,starColor:'#5f5b8d',mood:15,heart:15,intent:15,pat:50,ghostLock:60,emoji:50,dailyOn:1,dailyProb:50,dailyWmin:600,dailyWmax:10800,moodSel:60,lpOn:1,lpT1:600,lpT2:1800,lpProb:50,lpRmin:3,lpRmax:120,dailyMin:1,dailyMax:5,dailyKao:10,dailyEmoji:10,statusOn:0,statusWindow:7200,statusProb:70},
    pend:[],dailies:{},todayMoodBy:{},locked:true};
}
const cur=()=>S.contacts.find(c=>c.id===S.cur)||S.contacts[0];
/* ── 每個聯絡人的設置分開 ──
   S.set 是一層代理：沒有被改過的設定沿用共用預設（base），在某位聯絡人底下改過的設定存到 S.cset[聯絡人id]，
   讀取時依「目前的聯絡人」（排程裡用 ctxSet(id) 切換；其餘情況用 S.cur）取值。通知聲音、背景、學習進度等全域設定不分開。 */
const GLOBAL_SET=new Set(['muted','autoInk','ntMeOn','ntMeSnd','ntTaOn','ntTaSnd','ntCurOn','ntCurSnd','ntOthOn','ntOthSnd','ntStarOn','ntStarSnd','penSnd','penVol','imgc','keepBg','keepFont','wi','starColor','calLaterH','calLaterM','lpOn','lpT1','lpT2','lpProb','lpRmin','lpRmax','momNotify','dailyNotify','letterNotify','letterBadge','recSound','mood','heart','intent']);
let __cx=null;
function ctxSet(cid){if(typeof cid==='string'){if(cid.indexOf('|')>0)cid=cid.split('|').pop();__cx=cid}else __cx=null;if(!ctxSet.q){ctxSet.q=1;queueMicrotask(()=>{__cx=null;ctxSet.q=0})}}
const ctxId=()=>__cx||(S&&S.cur);
function makeSet(raw,owner){if(raw&&raw.__raw)raw=raw.__raw;
  const ov=(create)=>{const id=ctxId();if(!id||!owner.contacts||!owner.contacts.some(c=>c.id===id))return null;owner.cset=owner.cset&&typeof owner.cset==='object'?owner.cset:{};return owner.cset[id]||(create?(owner.cset[id]={}):null)};
  return new Proxy(raw,{
    get(t,k,r){if(k==='toJSON')return()=>t;if(k==='__raw')return t;
      if(typeof k==='string'&&!GLOBAL_SET.has(k)){const o=ov(false);if(o&&Object.prototype.hasOwnProperty.call(o,k))return o[k];
        const v=Reflect.get(t,k,r);if(v&&typeof v==='object'){const oo=ov(true);if(oo){oo[k]=JSON.parse(JSON.stringify(v));return oo[k]}}return v}
      return Reflect.get(t,k,r)},
    set(t,k,v){if(typeof k==='string'&&!GLOBAL_SET.has(k)){const o=ov(true);if(o){o[k]=v;return true}}t[k]=v;return true},
    deleteProperty(t,k){if(typeof k==='string'&&!GLOBAL_SET.has(k)){const o=ov(false);if(o&&k in o)delete o[k]}return Reflect.deleteProperty(t,k)},
    has(t,k){const o=typeof k==='string'&&!GLOBAL_SET.has(k)?ov(false):null;return (o&&k in o)||Reflect.has(t,k)}})}
/* 免打擾：時間照樣跑，但判定、機率、功能都不會觸發 */
/* 字卡使用次數：S.cuse[聯絡人][字卡id]；第一次升級時依聊天紀錄回推 */
const cuse=(cid,k)=>{if(!S||!k||!k.id)return;const u=(S.cuse=S.cuse||{}),m=(u[cid]=u[cid]||{});m[k.id]=(m[k.id]||0)+1};
function backfillUse(o){o.cuse={};const cats=o.cats||[],kd=id=>{const g=cats.find(c=>c.id===id);return g?(g.kind||'card'):null};
  (o.contacts||[]).forEach(c=>{const mine=(o.cards||[]).filter(k=>{if(!k||!k.text)return false;const g=cats.find(x=>x.id===k.cat);if(!g)return false;if(!['card','mem','ext'].includes(g.kind||'card'))return false;return g.sc==='s'||g.own===c.id||(!g.own&&(g.as||[]).includes(c.id))}).sort((a,b)=>b.text.length-a.text.length);
    if(!mine.length)return;const cnt={};((o.msgs||{})[c.id]||[]).forEach(m=>{if(!m||m.f!=='ta'||!m.x||m.img)return;let s=String(m.x);mine.forEach(k=>{let i;while((i=s.indexOf(k.text))>=0){cnt[k.id]=(cnt[k.id]||0)+1;s=s.slice(0,i)+'\u0001'+s.slice(i+k.text.length)}})});o.cuse[c.id]=cnt})}
const isMuted=()=>!!(S&&S.set&&S.set.muted);
const qtHtml=m=>(m.q||m.qi)?'<div class="qt'+(m.qi?' qti':'')+'">'+(m.qi?'<img class="qt-img" src="'+m.qi+'" alt="">':'')+esc(m.q||'')+'</div>':'';
const isDnd=cid=>{const c=S&&S.contacts&&S.contacts.find(x=>x.id===cid);return !!(c&&c.dnd)};
const CMD={on:0,prob:50,wall:1,tmin:1200,tmax:MOM_TMAX_DEF};
const cmo=c=>(c.ms=Object.assign({},CMD,c.ms||{}));
const sget=k=>k.startsWith('cm.')?cmo(cur())[k.slice(3)]:S.set[k];
const sput=(k,v)=>{if(k.startsWith('cm.')){cmo(cur())[k.slice(3)]=v;if(k==='cm.tmin'||k==='cm.tmax')delete S.mst[cur().id]}else S.set[k]=v};
const ms=id=>S.msgs[id]||(S.msgs[id]=[]);
const kc=c=>c.kind||'card';
const INS=k=>k==='mem'||k==='ext';
const tabOn=k=>k===kind||(k==='insp'&&INS(kind));
const CTABS=[['card','常用'],['insp','靈感拾取'],['emoji','表情包'],['pat','拍一拍'],['kao','顏文字'],['other','其他']];

const egrid=c=>{const l=S.cards.filter(k=>k.cat===c.id);return l.length?'<div class="eg">'+l.map(k=>delMode?`<div class="ec" data-a="cs" data-i="${k.id}"><img src="${k.img||''}"><span class="ck ${selC.includes(k.id)?'on':''}" style="position:absolute;top:5px;left:5px"></span></div>`:`<div class="ec ${k.on?'':'off'}"><img src="${k.img||''}" data-a="ct" data-i="${k.id}"></div>`).join('')+'</div>':'<div class="empty">還沒有表情包，點下方上傳圖片。</div>'};
const mkS=p=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
const MK={star:mkS('<path d="m12 4.2 2.6 5.3 5.8.8-4.2 4 1 5.7-5.2-2.8-5.2 2.8 1-5.7-4.2-4 5.8-.8Z"/>'),fish:mkS('<path d="M3.6 12c3.2-3.8 7.4-4.4 10.4 0-3 4.4-7.2 3.8-10.4 0Z"/><path d="m14 12 4.4-3.2v6.4z"/><circle cx="7.2" cy="11.2" r=".7"/>'),pal:mkS('<path d="M12 3.4c4.8 0 8.5 3.2 8.5 6.9 0 3.2-2.7 4.4-4.9 4.6-1.7.2-2.8.8-2.8 2 0 1.2 1.1 1.6 1.1 2.7 0 .9-.9 1.4-2 1.4-4.7 0-8.4-3.5-8.4-8.2S7.2 3.4 12 3.4Z"/><circle cx="8.6" cy="8.2" r="1"/><circle cx="12.4" cy="6.6" r="1"/><circle cx="16.2" cy="8.7" r="1"/><circle cx="7.9" cy="12.8" r="1"/>'),heart:mkS('<path d="M12 19.5C5 14.8 4 10.4 6.4 8c1.8-1.7 4.3-1.1 5.6.7 1.3-1.8 3.8-2.4 5.6-.7 2.4 2.4 1.4 6.8-5.6 11.5Z"/>'),moon:mkS('<path d="M18.5 14.6A7.6 7.6 0 0 1 9.4 5.5 7.6 7.6 0 1 0 18.5 14.6Z"/>'),flower:mkS('<circle cx="12" cy="12" r="2"/><circle cx="12" cy="6.6" r="2.6"/><circle cx="17.3" cy="10.4" r="2.6"/><circle cx="15.3" cy="16.6" r="2.6"/><circle cx="8.7" cy="16.6" r="2.6"/><circle cx="6.7" cy="10.4" r="2.6"/>')};
const MKN={star:'星星',fish:'小魚',pal:'調色盤',heart:'愛心',moon:'月亮',flower:'小花'};
const KN={card:'字卡',emoji:'表情包',pat:'拍一拍',kao:'顏文字',other:'項目',mem:'記憶字卡',ext:'提取字卡'};

let pScope='s',mTab='interact',fiCb=null,fiMul=false;
const avh=(c,cl)=>{const id=c.id||'me',edit=cl.includes('msgav')?'':`data-a="avt" data-i="${id}"`;return c.av?`<div class="av ph ${cl}" ${edit} style="background-image:url(${c.av})"></div>`:`<div class="av ${id==='me'?'me':'pl'} ${cl}" ${edit}>${id==='me'?esc(ini(c.name)):'+'}</div>`};
function pick(cb,ac,mul){const f=$('#fi');f.accept=ac||'image/*';f.multiple=!!mul;fiMul=!!mul;fiCb=cb;f.click()}
function impText(t){t=String(t||'').replace(/^\uFEFF/,'').trim();
  if(!t){toast('還沒有貼上任何內容');return}
  let o;try{const i=t.indexOf('{'),j=t.lastIndexOf('}');if(i<0||j<i)throw 0;o=JSON.parse(t.slice(i,j+1))}catch(x){toast(t.indexOf('{')<0?'貼上的內容不是備份格式，未做任何更動':/\}\s*$/.test(t)?'內容不是 Pearla 備份的格式，未做任何更動':'備份內容不完整（可能複製時被截斷），請改用「下載備份檔」');return}
  if(!o||!Array.isArray(o.contacts)||!o.contacts.length||!Array.isArray(o.cats)||!Array.isArray(o.cards)){toast('這不是 Pearla 的備份內容，未做任何更動');return}
  try{S=mig(Object.assign(def(),o,{tags:o.tags}));save();closeSheet();tab='home';sPage=null;render();toast('已還原備份')}catch(x){toast('備份內容無法讀取：'+String(x&&x.message||x).slice(0,40))}}
 function rd(f,max,cb,fmt){const r=new FileReader();r.onload=()=>{if(!max)return cb(r.result);const im=new Image();im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);{const q=S.set.imgc?.7:.85;let u=fmt==='webp'?c.toDataURL('image/webp',q):'';if(!u||u.indexOf('data:image/webp')!==0)u=c.toDataURL('image/jpeg',q);cb(u)}};im.src=r.result};r.readAsDataURL(f)}
function rdSquare(f,max,cb){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const side=Math.min(im.width,im.height),sx=(im.width-side)/2,sy=(im.height-side)/2,scale=Math.min(1,(S.set.imgc?Math.min(max,720):max)/side),out=Math.round(side*scale),c=document.createElement('canvas');c.width=out;c.height=out;c.getContext('2d').drawImage(im,sx,sy,side,side,0,0,out,out);cb(c.toDataURL('image/jpeg',S.set.imgc?.78:.9))};im.src=r.result};r.readAsDataURL(f)}
function paintTabs(){const p=curDef(),de=document.documentElement;if(p.nav)de.dataset.nav='1';else delete de.dataset.nav;document.querySelectorAll('.tab').forEach(b=>{const g=b.querySelector('.gt svg');if(g&&!g.firstChild)g.innerHTML=GTAB[b.dataset.t]||'';const im=b.querySelector('img');if(im&&p.nav){const u=p.dir+'nav-'+b.dataset.t+'.webp';if(im.getAttribute('src')!==u)im.setAttribute('src',u)}})}
const CATI={inspiration:1,data:1,friends:1,'group-chat':1,mailbox:1,anniversary:1,records:1,'study-progress':1,files:1,'tomato-timer':1,'plum-divination':1,'answer-book':1,kitchen:1,doodle:1,tracking:1,mall:1,'gift-cabinet':1,period:1,'memo-card':1};
const MOONI={inspiration:1,data:1,friends:1,'group-chat':1,mailbox:1,anniversary:1,records:1,'study-progress':1,files:1,'tomato-timer':1,'plum-divination':1,'answer-book':1,kitchen:1,doodle:1,tracking:1,mall:1,'gift-cabinet':1,calendar:1,period:1,daily:1,'memo-card':1};
/* 主題註冊表：新增主題＝在這裡加一筆（另外要有 assets/<名稱>/ 與 styles/<名稱>.css，見 README）。
   family：'clay' 立體黏土版型／'glass' 霧海系版型　skin：<html data-skin>　tones：配色清單 [key,名稱,色塊]，第一個是預設（手帳；key 對應 <html data-tone>，深色模式用 dark）
   img：用插畫圖示（不用簡筆畫 GI/GM）　memo：備忘錄文字排版（沒寫就用該版型預設）
   dir／nav／art：圖片包（dir 資料夾；nav 有專屬導覽行圖；art 有專屬圖的名單，沒列的退回 assets/clay/）
   ink／line／shadow：「統一更改」重設時的預設墨水色、線條色、文字陰影色（可寫 {blue,mint} 依配色） */
const THEME_DEFS={
 lav:{name:'黏土',swatch:'linear-gradient(135deg,#fdfcff,#cbc7ee 60%,#f4b6c8)',family:'clay',ink:'#5f5b8d',line:'#cbc7ee',shadow:'#ffffff',dir:'assets/clay/',nav:1},
 glass:{name:'霧海',swatch:'linear-gradient(160deg,#b9c9de,#7f98b8 55%,#dce7f2)',family:'glass',ink:'#ffffff',line:'#ffffff',shadow:'#6b7a90'},
 journal:{name:'手帳',swatch:'repeating-linear-gradient(0deg,transparent 0 6px,#b4c8e266 6px 7px),repeating-linear-gradient(90deg,transparent 0 6px,#b4c8e266 6px 7px),linear-gradient(135deg,#f4f8fd,#dbe7f6)',family:'glass',skin:'journal',tones:[['blue','淺藍','#cfe0f5'],['mint','青提','#a7d36b'],['dark','黑灰','#3a3a42']],ink:{blue:'#4b5b78',mint:'#55732f',dark:'#e8e8ed'},line:{blue:'#b9cbe3',mint:'#d7eea7',dark:'#3a3a42'},shadow:'#6b7a90'},
 pixel:{name:'像素',swatch:'repeating-linear-gradient(0deg,#2a1f5c26 0 1px,transparent 1px 3px),linear-gradient(135deg,#fbfaff,#f00f2d 55%,#5b8fd9)',family:'glass',skin:'pixel',ink:'#2a1f5c',line:'#2a1f5c',shadow:'#6b7a90'},
 moon:{name:'月眠',swatch:'linear-gradient(160deg,#2a1f5c,#5b45a8 55%,#e9dfff)',family:'glass',skin:'moon',img:1,ink:'#f6f1ff',line:'#ffffff',shadow:'#120a33',dir:'assets/moon/',nav:1,art:MOONI,memo:{lines:[46,58.5,71],h:12.5,w:42,fs:.054}},
 cat:{name:'黑貓',swatch:'linear-gradient(135deg,#fbfaf8,#d9d5cf 55%,#2d2d32)',family:'glass',skin:'cat',img:1,cssCal:1,tones:[['light','淺色','#fbfaf8'],['dark','深色','#2d2d32']],ink:{light:'#26262b',dark:'#e8e8ed'},line:{light:'#2d2d32',dark:'#4a4a53'},shadow:{light:'#ffffff',dark:'#000000'},dir:'assets/cat/',nav:1,art:CATI,memo:{lines:[56.5,66.5,79,91.5],h:12,w:66,fs:.056}}
};
const validTheme=k=>Object.prototype.hasOwnProperty.call(THEME_DEFS,k)?k:'lav';
const curTheme=()=>validTheme(S&&S.theme);
const curDef=()=>THEME_DEFS[curTheme()];
const isG=()=>!!S&&curDef().family==='glass';
const AS=n=>{const d=curDef();return((d.art&&d.art[n])?d.dir:'assets/clay/')+n+'.webp'};
const tonePick=v=>(v&&typeof v==='object')?(S&&v[S.jtone]!=null?v[S.jtone]:(v.blue!=null?v.blue:v.light)):v;
const themeInk=()=>tonePick(curDef().ink);
const themeShadow=()=>tonePick(curDef().shadow);
const themeLine=()=>tonePick(curDef().line);
const FONTS=[
 {g:'常用',id:'sys',name:'系統常用字體',stack:'"PingFang TC","Hiragino Sans","Microsoft JhengHei",system-ui,sans-serif'},
 {g:'常用',id:'noto',name:'思源黑體',stack:'"Noto Sans TC"',gf:'Noto+Sans+TC:wght@400;500'},
 {g:'可愛',id:'huninn',name:'粉圓體',stack:'"Huninn"',gf:'Huninn'},
 {g:'可愛',id:'chiron',name:'昭源圓體',stack:'"Chiron GoRound TC"',gf:'Chiron+GoRound+TC:wght@400;500'},
 {g:'可愛',id:'jason',name:'清松手寫體1',stack:'"PearlaJason"',local:'assets/fonts/JasonHandwriting1.woff',fam:'PearlaJason'},
 {g:'優雅',id:'yuluo',name:'辰宇落雁體',stack:'"PearlaYuluo"',local:'assets/fonts/ChenYuluoyan-2_0-Thin.woff',fam:'PearlaYuluo',adj:'118%'},
 {g:'優雅',id:'notoserif',name:'思源宋體',stack:'"Noto Serif TC"',gf:'Noto+Serif+TC:wght@400;500'},
 {g:'優雅',id:'wenkai',name:'霞鶩文楷',stack:'"LXGW WenKai TC"',gf:'LXGW+WenKai+TC'},
 {g:'古風',id:'cactus',name:'仙人掌明體',stack:'"Cactus Classical Serif"',gf:'Cactus+Classical+Serif'},
 {g:'古風',id:'kaiti',name:'楷體',stack:'"Kaiti TC","BiauKai","DFKai-SB","KaiTi","STKaiti","LXGW WenKai TC"',gf:'LXGW+WenKai+TC'},
 {g:'古風',id:'yuji',name:'悠二書體',stack:'"Yuji Syuku"',gf:'Yuji+Syuku'}];
const fontOf=id=>FONTS.find(f=>f.id===id);
const fontFaces={};
/* 內建字體：第一次選用時存進瀏覽器的字體庫（Cache Storage），之後離線也能用；可在「數據」清除 */
async function loadLocalFont(f,retry){if(fontFaces[f.id]&&!retry)return;fontFaces[f.id]=1;let buf=null,c=null,fromCache=false;
  try{if(window.caches){c=await caches.open('pearla-fonts');const r=await c.match(f.local);if(r){buf=await r.arrayBuffer();fromCache=true}}}catch(e){}
  try{
    if(!buf||buf.byteLength<1000){fromCache=false;toast(f.name+'下載中⋯',2500);const net=await fetch(f.local);if(!net.ok)throw new Error('下載失敗（'+net.status+'）');const cl=net.clone();buf=await net.arrayBuffer();if(c){try{await c.put(f.local,cl)}catch(e){}}}
    if(f.adj){const url=URL.createObjectURL(new Blob([buf],{type:'font/woff'})),st=document.createElement('style');st.textContent='@font-face{font-family:"'+f.fam+'";src:url('+url+') format("woff");size-adjust:'+f.adj+'}';document.head.appendChild(st);fontFaces[f.id]={_st:st,_url:url};await document.fonts.load('16px "'+f.fam+'"','你好');if(!document.fonts.check('16px "'+f.fam+'"','你好'))throw new Error('字體檔無法使用')}
    else{const ff=new FontFace(f.fam,buf);await ff.load();document.fonts.add(ff);fontFaces[f.id]=ff}
  }catch(e){
    const old=fontFaces[f.id];if(old&&old._st){old._st.remove()}delete fontFaces[f.id];
    if(fromCache&&!retry){try{if(c)await c.delete(f.local)}catch(x){}return loadLocalFont(f,true)}
    toast(f.name+'載入失敗：'+((e&&e.message)||'請確認網路後再試'),3500)}}
async function fontScan(){const out=[];try{if(!window.caches)return out;const c=await caches.open('pearla-fonts');for(const f of FONTS.filter(x=>x.local)){const r=await c.match(f.local);if(r){const b=await r.blob();out.push({id:f.id,name:f.name,bytes:b.size})}}}catch(e){}return out}
function loadFont(f){if(f&&f.local){loadLocalFont(f);return}if(!f||!f.gf||document.getElementById('gf-'+f.id))return;const l=document.createElement('link');l.id='gf-'+f.id;l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+f.gf+'&display=swap';document.head.appendChild(l)}
let fntSel=[],fntList=[],fontTarget=null;
function fntSheet(l){fntList=l;sheet('字體',(l.length?'<div class="selbar">'+selAllHtml('fnt',l.map(x=>x.id),fntSel)+'<button type="button" class="btn d" data-a="fntdel" style="border-style:solid">清除所選（'+fntSel.length+'）</button></div>'+l.map(x=>'<div class="ci cal2-row" data-a="fntck" data-i="'+x.id+'" style="cursor:pointer"><span class="ck '+(fntSel.includes(x.id)?'on':'')+'"></span><div class="grow">'+esc(x.name)+'</div><small style="color:var(--soft)">'+dFmt(x.bytes)+'</small></div>').join('')+'<p class="hint" style="margin:8px 2px 0">清除後如果又選用這個字體，會重新下載。線上字體（思源、粉圓等）由瀏覽器管理，不會顯示在這裡。</p>':'<p class="hint" style="margin:0 0 8px">目前沒有下載到本機的字體。選用「清松手寫體1」或「辰宇落雁體」後才會出現在這裡。</p>')+'<button class="btn" data-a="close">關閉</button>')}
function fontSheet(){FONTS.filter(f=>!f.local).forEach(loadFont);const groups=['常用','可愛','優雅','古風'],tg=fontTarget||curTheme(),cf=tg===curTheme()?S.font:((S.themeFonts||{})[tg]||''),tn=(THEMES.find(t=>t[0]===tg)||[])[1]||'';
  sheet('字體'+(fontTarget?'（'+tn+'）':''),'<button type="button" class="btn font-opt'+(cf?'':' on')+'" data-a="fontpick" data-i="">主題預設字體'+(curTheme()==='glass'?'（霞鶩文楷）':'')+'</button>'+groups.map(g=>'<div class="cal2-k">'+g+'</div>'+FONTS.filter(f=>f.g===g).map(f=>'<button type="button" class="btn font-opt'+(cf===f.id?' on':'')+'" data-a="fontpick" data-i="'+f.id+'" style="font-family:'+(f.local?'inherit':f.stack+',sans-serif')+'">'+f.name+(f.local?'　（約 5.5 MB，選用時才下載）':'　字體預覽 Aa 123')+'</button>').join('')).join('')+'<p class="hint" style="margin:8px 2px 0">第一次選用會從網路下載字體，沒網路時會先用系統字體。</p><button class="btn" data-a="close">關閉</button>')}
function applyTheme(){paintTabs();const de=document.documentElement;de.dataset.theme=isG()?'glass':'lav';const df=curDef();if(df.skin){de.dataset.skin=df.skin;if(df.tones&&S.jtone&&S.jtone!==df.tones[0][0]&&df.tones.some(t=>t[0]===S.jtone))de.dataset.tone=S.jtone;else delete de.dataset.tone}else{delete de.dataset.skin;delete de.dataset.tone};const r=de.style;{const F=fontOf(S.font)||(curTheme()==='glass'?fontOf('wenkai'):null);if(F){de.dataset.ff='1';r.setProperty('--ff',F.stack+',"PingFang TC","Microsoft JhengHei",sans-serif');loadFont(F)}else{delete de.dataset.ff;r.removeProperty('--ff')}}if(S.ink){r.setProperty('--ink',S.ink);r.setProperty('--soft','color-mix(in srgb,'+S.ink+' 65%,transparent)')}else{r.removeProperty('--ink');r.removeProperty('--soft')}if(S.line&&!(df.tones&&['#cbc7ee','#b9cbe3','#bfe3d0','#d7eea7','#3a3a42'].includes(S.line.toLowerCase())))r.setProperty('--line',S.line);else r.removeProperty('--line');if(S.shadow)r.setProperty('--tsh','color-mix(in srgb,'+S.shadow+' 70%,transparent)');else r.removeProperty('--tsh');try{localStorage.setItem('pearla-skin',JSON.stringify({t:de.dataset.theme,s:de.dataset.skin||'',k:de.dataset.tone||''}))}catch(e){}de.classList.remove('boot')}
function chatSheet(html){sheet('',html,0);$('#sh').classList.add('chat-pop')}
function moreSheet(){let b='';
  if(mTab==='interact')b='<div class="chat-pop-cats"><button class="on" data-a="mt" data-i="interact">互動</button><button data-a="mt" data-i="tool">工具</button></div><div class="chat-pop-grid sm"><button class="pop-action" data-a="patopen"><span class="pat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11"/><path d="M10 10V4.8a1.5 1.5 0 0 1 3 0V11"/><path d="M13 10V6a1.5 1.5 0 0 1 3 0v6"/><path d="M16 11V8.5a1.5 1.5 0 0 1 3 0v5.2c0 4.1-2.4 6.3-6.3 6.3h-1.2c-2.3 0-3.5-1.1-4.7-2.6L4 14.3a1.5 1.5 0 0 1 2.3-1.9L7 13.1"/></svg></span><small>拍一拍</small></button><button class="pop-action" data-a="avopen"><span class="pat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.6-3.6 3.5-5.6 7.2-5.6s6.6 2 7.2 5.6"/></svg></span><small>頭像</small></button><button class="pop-action" data-a="feedopen"><span class="pat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v6a2 2 0 0 0 4 0V3M9 3v18"/><path d="M17 21V3c-2.2 1.2-3.5 3.8-3.5 7 0 1.6.9 2.5 3.5 2.5"/></svg></span><small>餵食</small></button></div>';
  else b='<div class="chat-pop-cats"><button data-a="mt" data-i="interact">互動</button><button class="on" data-a="mt" data-i="tool">工具</button></div><div class="chat-pop-grid sm"><button class="pop-action" data-a="qn"><span class="pat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5h6V7H9z"/><path d="M8.5 11.5l1.2 1.2 2-2.2M13.5 12h2.5M8.5 16.5l1.2 1.2 2-2.2M13.5 17h2.5"/></svg></span><small>問卷</small></button><button class="pop-action" data-a="askopen"><span class="pat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5h16v11H11l-5.5 3v-3H4z"/><path d="M10 9.5a2 2 0 1 1 2.8 1.8c-.6.3-.8.7-.8 1.2M12 14.3v.1"/></svg></span><small>問問他</small></button><button class="pop-action" data-a="hidenote"><span class="pat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'+(S.hideNote?'<path d="M4 4l16 16"/>':'')+'</svg></span><small>'+(S.hideNote?'顯示通知':'隱藏通知')+'</small></button></div>';
  chatSheet(b);$('#sh').classList.add('more')
}
function patSheet(){const l=(pScope==='m'?S.cards.filter(k=>{const g=S.cats.find(c=>c.id===k.cat);return k.on&&g&&g.on&&kc(g)==='pat'&&g.sc==='m'}):pool('pat',S.cur)).filter(k=>{const g=S.cats.find(c=>c.id===k.cat);return g&&g.sc===pScope});chatSheet('<div class="chat-pop-cats"><button class="'+(pScope==='s'?'on':'')+'" data-a="psc" data-i="s">共用拍一拍</button><button class="'+(pScope==='e'?'on':'')+'" data-a="psc" data-i="e">專屬拍一拍</button><button class="'+(pScope==='m'?'on':'')+'" data-a="psc" data-i="m">我的拍一拍</button></div>'+(l.length?l.map(k=>'<button class="pop-row" data-a="pgo" data-i="'+k.id+'">'+esc(k.text)+'</button>').join(''):'<div class="empty">這裡還沒有拍一拍。<br>到「字卡」頁新增，或在下方直接輸入。</div>')+'<div class="add"><input id="pt" placeholder="輸入拍一拍文字…"><button class="btn" data-a="psv" style="flex:none;width:auto;margin:0">存入</button><button class="btn s" data-a="psd" style="flex:none;width:auto;margin:0">發送</button></div>')}
let avScope='ta';
function avSheet(){const me=avScope==='me',ct=cur(),list=me?(S.meAvs=S.meAvs||[]):(ct.avs=ct.avs||[]),now=me?S.meAv:ct.av;
  chatSheet('<div class="chat-pop-cats"><button class="'+(me?'':'on')+'" data-a="avsc" data-i="ta">他的頭像</button><button class="'+(me?'on':'')+'" data-a="avsc" data-i="me">我的頭像</button></div><div class="av-grid">'+list.map((u,n)=>'<div class="av-it'+(u===now?' on':'')+'"><button type="button" class="av-pick" data-a="avuse" data-i="'+n+'"><img src="'+u+'" alt=""></button><button type="button" class="av-x" data-a="avdel" data-i="'+n+'" aria-label="刪除">✕</button></div>').join('')+'<button type="button" class="av-add" data-a="avadd" aria-label="新增備用頭像">＋</button></div>'+(list.length?'':'<p class="hint" style="margin:8px 2px 0;text-align:center">按「＋」添加圖片作為備用頭像，點一下就能直接換。</p>'));$('#sh').classList.add('more')}
const recEmoPush=id=>{if(!id)return;S.recEmo=[id].concat((S.recEmo||[]).filter(x=>x!==id)).slice(0,20)};
function emoSheet(){const rec=emoScope==='recent',type=(emoScope==='kao'||emoScope==='kao-e')?'kao':'emoji',scopeKey=(emoScope==='e'||emoScope==='kao-e')?'e':'s',l=rec?(S.recEmo||[]).map(id=>S.cards.find(k=>k.id===id)).filter(Boolean).slice(0,20):pool(type,S.cur).filter(k=>{const g=S.cats.find(c=>c.id===k.cat);return g&&g.sc===scopeKey});const tabs=[['kao','顏文字'],['kao-e','他的專屬顏文字'],['s','共用表情包'],['e','他的專屬表情包']];
  const cs=rec?[]:S.cats.filter(g=>l.some(k=>k.cat===g.id)),item=k=>'<button data-a="'+(k.img?'es':'ek')+'" data-i="'+k.id+'">'+(k.img?'<img src="'+k.img+'">':esc(k.text))+'</button>';
  const cur1=cs.find(g=>g.id===emoCat)||cs[0];emoCat=cur1?cur1.id:null;
  const chips=cs.length>1?'<div class="emo-cats">'+cs.map(g=>'<button type="button" class="'+(g.id===emoCat?'on':'')+'" data-a="ecsw" data-i="'+g.id+'">'+esc(g.name)+'</button>').join('')+'</div>':'';
  const body=rec?'<div class="eg chat-eg">'+l.map(item).join('')+'</div>':cur1?'<div class="eg chat-eg">'+l.filter(k=>k.cat===cur1.id).map(item).join('')+'</div>':'';
  chatSheet('<div class="emo-sticky"><div class="chat-pop-cats"><button class="emo-recent'+(rec?' on':'')+'" data-a="esw" data-i="recent" aria-label="最近使用"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg></button>'+tabs.map(([k,n])=>'<button class="'+(emoScope===k?'on':'')+'" data-a="esw" data-i="'+k+'">'+n+'</button>').join('')+'</div>'+(l.length?chips:'')+'</div>'+(l.length?body:'<div class="empty">'+(rec?'還沒有最近使用的表情。<br>送出表情包或顏文字後會出現在這裡（最多 20 個）。':'這裡還沒有內容。<br>到「字卡」頁新增。')+'</div>'));$('#sh').classList.add('emo')}
const scOff=(kd,sc,cid)=>{const ct=S.contacts.find(c=>c.id===cid);return !!(ct&&ct.scOff&&ct.scOff[kd+':'+sc])};
const cardPool=cid=>pool('card',cid).concat(pool('mem',cid),pool('ext',cid));
const pool=(kd,cid)=>S.cards.filter(k=>{const g=S.cats.find(c=>c.id===k.cat);return k.on&&g&&g.on&&kc(g)===kd&&(g.sc==='s'||g.own===cid||(!g.own&&g.as.includes(cid)))&&!scOff(kd,g.sc,cid)});
const pk=a=>a[ri(a.length)];

function toast(t,d=3000){const e=$('#tt');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),d)}
function sheet(title,html,mid){$('#sh').innerHTML='<div class="box" data-keep="1"><h2>'+title+'</h2>'+html+'</div>';$('#sh').classList.toggle('mid',!!mid);$('#sh').classList.remove('chat-pop','ask','emo','sv','more','coninfo');$('#sh').classList.add('show')}
function closeSheet(){$('#sh').classList.remove('show');if(catDirty){catDirty=false;setTimeout(()=>{try{render()}catch(e){}},0)}}
function ask(title,val,cb){askCb=cb;sheet(title,'<input id="ai" value="'+esc(val)+'"><button class="btn s" data-a="askok">確定</button><button class="btn" data-a="close">取消</button>',1)}

function closeDaily(){const d=$('#daily-pop');if(d)d.classList.remove('show')}
function positionDailyPopover(d){const trigger=$('.daily-message-trigger'),box=d&&d.querySelector('.daily-box');if(!trigger||!box)return;const r=trigger.getBoundingClientRect(),w=Math.min(360,window.innerWidth-24),left=Math.max(12,Math.min(r.left+r.width/2-w/2,window.innerWidth-w-12)),top=Math.max(8,Math.min(r.bottom+7,window.innerHeight-box.offsetHeight-12));d.style.setProperty('--daily-pop-left',Math.round(left)+'px');d.style.setProperty('--daily-pop-top',Math.round(top)+'px')}function openDaily(){const d=$('#daily-pop');if(!d)return;const day=localDayKey(new Date()),dy=dly(S.cur),a=(dy.day===day&&Array.isArray(dy.items))?dy.items:[],dailyReady=!!(dy.day===day&&dy.done&&a.length),enabled=!!S.set&&S.set.dailyMoodOn!==0&&S.set.dailyMoodOn!==false,m=enabled?todayMood():null,mv=m?esc((m.emoji||'')+(m.text||'')):!enabled?'已關閉':dailyReady?'沒有啟用的心情':'';d.innerHTML='<div class="daily-box"><div class="daily-mood-row"><div class="daily-title">今日心情</div><div class="daily-mood-value">'+mv+'</div></div><div class="daily-section"><div class="daily-title">每日留言</div>'+(a.length?'<div class="daily-copy">'+a.map(x=>esc(x)).join(' ')+'</div>':'<div class="daily-copy">他今天還沒留言</div>')+'</div></div>';d.classList.add('show');requestAnimationFrame(()=>positionDailyPopover(d))}
function dailyPick(cid){cid=cid||S.cur;const s=S.set||{},cards=cardPool(cid).filter(k=>k.text),kao=pool('kao',cid).filter(k=>k.text),emoji=pool('emj',cid).filter(k=>k.text),hit=p=>rnd()*100<(+p||0);const all=[];const n=Math.max(1,Math.min(20,ri(Math.max(1,(+s.dailyMax||1)-(+s.dailyMin||1)+1))+(+s.dailyMin||1)));
  /* 每張字卡：字卡抽取 → emoji判定 → 選擇emoji → 顏文字判定 → 選擇顏文字（機率各自獨立） */
  for(let i=0;i<n;i++){const base=cards.length?cards:(kao.length?kao:emoji);if(!base.length)break;const _k=pk(base);if(cards.length)cuse(cid,_k);let x=_k.text;if(cards.length){if(emoji.length&&hit(s.dailyEmoji)){const z=pk(emoji).text;x=rnd()<.5?z+' '+x:x+' '+z}if(kao.length&&hit(s.dailyKao)){const z=pk(kao).text;x=rnd()<.5?z+' '+x:x+' '+z}}all.push(x)}return all}
/* 每日留言紀錄（給日曆用）：S.dlog[聯絡人][日期]={items,mood,reply}；S.dmine[日期]={x,mood} */
function dlogPut(cid,day,items,mood,at){S.dlog=S.dlog||{};const L=S.dlog[cid]=S.dlog[cid]||{},r=L[day]=L[day]||{};if(items&&items.length){r.items=items.slice();if(!r.t)r.t=at||Date.now()}if(mood)r.mood={emoji:mood.emoji||'',text:mood.text||''}}
function dlogSync(){const day=localDayKey(new Date());(S.contacts||[]).forEach(c=>{const D=dly(c.id);if(D.day===day&&D.done&&Array.isArray(D.items)&&D.items.length){let m=null;try{m=todayMood(c.id)}catch(e){}dlogPut(c.id,day,D.items,m,D.at)}})}
function dly(cid){S.dailies=S.dailies||{};return S.dailies[cid]||(S.dailies[cid]={day:'',base:0,next:0,done:false,items:[]})}
function dailyTick(){if(!S||!S.set)return;const now=Date.now(),day=localDayKey(new Date(now)),hold=!!(window.LPE&&LPE.busy&&LPE.busy());let ch=0;(S.contacts||[]).forEach(c=>{ctxSet(c.id);const D=dly(c.id);if(D.day!==day){if(D.day&&D.done&&Array.isArray(D.items)&&D.items.length)dlogPut(c.id,D.day,D.items,null,D.at);Object.assign(D,{day,base:now,next:0,done:false,items:[]});ch=1}if(D.done||hold||!S.set.dailyOn)return;const win=Math.max(1000,inspRand(S.set.dailyWmin==null?600:S.set.dailyWmin,S.set.dailyWmax==null?10800:S.set.dailyWmax));if(D.next&&now<D.next)return;ch=1;if(!c.dnd&&rnd()*100<Math.max(0,Math.min(100,+S.set.dailyProb||0))){const items=dailyPick(c.id);if(items.length){D.items=items;D.done=true;D.at=now;D.next=0;if(S.set.dailyMoodOn!==0&&S.set.dailyMoodOn!==false){D.moodAt=now+Math.max(0,+S.set.moodSel||0)*1000;if(S.todayMoodBy)delete S.todayMoodBy[c.id]}return}}D.next=now+win});dlogSync();if(ch)save()}
/* ── 刪除確認框：真正執行刪除的按鈕要連按兩次（第一次變成「再按一次確認」，3.5 秒內再按才執行） ── */
(()=>{const OK=new Set(['an:cfyes','bdelok','bigclrok','bigdelok','cdelok','cdlok','dclrok','evdelok','gdelok','idelok','ldelok','mdelmok','mdelok','mdrm','mldelok','momdel','pdelok','perrecdelok','avcancelok','pf:cfyes','qcfok','qdelok','rdelok','remdelok','stkdelok','dtmpok']);
let armed=null,tm=null;
const disarm=()=>{if(armed&&armed.isConnected&&armed.dataset.orig){armed.textContent=armed.dataset.orig;armed.classList.remove('armed')}armed=null;clearTimeout(tm)};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button[data-a]');
  if(!b||!OK.has(b.dataset.a)){if(armed)disarm();return}
  if(armed===b){armed=null;clearTimeout(tm);return}
  e.stopImmediatePropagation();e.preventDefault();disarm();armed=b;b.dataset.orig=b.textContent;b.textContent='再按一次確認';b.classList.add('armed');tm=setTimeout(disarm,3500)},true)})();
