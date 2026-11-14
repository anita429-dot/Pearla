/* ============================================================
 * Pearla「檔案」模組（主頁 → 檔案）：紀錄聯絡人檔案
 * 獨立檔案，不改動 index.html 也能載入；接上方式見 PROFILE_INTEGRATION.md
 * 對外只暴露 window.PF（PF.open / PF.view()），其餘全在閉包內。
 * 資料存放：S.pf = { tags:[固定標籤], d:{ [聯絡人id]:{ base:{}, lists:{}, finds:[] } } }
 *   - 聯絡人小分類直接取 S.contacts，新增／刪除聯絡人會自動同步，不另存分類
 *   - base.name 只存在「檔案」裡，修改不會影響聯絡人本身的名字
 * ============================================================ */
(function(){
'use strict';

const PF=window.PF={open:false,tab:'base',cid:null,page:null,modal:null,confirm:null,lv:0,view:vPf};

/* 基本資料欄位：t=text 直接輸入；t=page 點擊進入該欄位的分頁
 * 第 5 欄 form：solve／comm＝兩個輸入欄；level＝文字＋程度（五個圈圈） */
const BASE=[
  ['name','名字','text'],['nick','暱稱','text'],['bday','生日','text'],['age','年齡','text'],
  ['sex','性別','text'],['height','身高','text'],['weight','體重','text'],['body','體型','text'],
  ['blood','血型','text'],['person','性格','text'],
  ['interest','興趣','page','新增興趣，例如：攝影'],
  ['like','喜好','page','新增喜好，例如：草莓牛奶'],
  ['solve','處理問題的方式','page','','solve'],
  ['comm','溝通風格','page','','comm'],
  ['habit','小習慣','page','新增小習慣，例如：緊張時會摸耳朵'],
  ['love','喜歡的事物','page','新增喜歡的事物，例如：下雨天','level'],
  ['hate','討厭的事物','page','新增討厭的事物，例如：吵鬧的地方','level'],
  ['fear','害怕的事物','page','新增害怕的事物，例如：打雷','level'],
  ['sleep','作息時間','page','新增作息，例如：平日 23:30 睡'],
  ['diet','飲食習慣','page','新增飲食習慣，例如：不吃香菜'],
  ['topic','下次可以關心的話題','page','新增想關心的話題'],
  ['shared','一起經歷的事情','page','新增一起經歷的事情'],
  ['talk','特別的對話','page','新增特別的對話']
];
/* 兩個部分的欄位：[key, 標題, 必填, 提示] */
const FORMS={
  solve:[['problem','遇到的問題（選填）',false,'例如：吵架之後'],['way','他的方式',true,'他會怎麼處理']],
  comm:[['style','溝通風格',true,'例如：直接、慢熱、愛用表情符號'],['target','對象',true,'例如：對我、對朋友']]
};
const LVL={love:'喜歡程度',hate:'討厭程度',fear:'害怕程度'};
const FIELD=Object.fromEntries(BASE.map(f=>[f[0],f]));
const DEF_TAGS=['我觀察到的','他告訴我的','意想不到','他很在意','小習慣','可愛','心動','不太明白','不確定','🤨❓'];

/* ---------- 資料 ---------- */
function root(){
  if(!S.pf||typeof S.pf!=='object')S.pf={};
  if(!Array.isArray(S.pf.tags))S.pf.tags=DEF_TAGS.slice();
  if(!S.pf.d||typeof S.pf.d!=='object')S.pf.d={};
  return S.pf;
}
function D(cid){
  const d=root().d;
  const x=d[cid]||(d[cid]={});
  if(!x.base)x.base={};if(!x.lists)x.lists={};if(!Array.isArray(x.finds))x.finds=[];
  return x;
}
const contacts=()=>Array.isArray(S.contacts)?S.contacts:[];
function curCid(){
  const cs=contacts();if(!cs.length)return null;
  if(!cs.some(c=>c.id===PF.cid))PF.cid=cs.some(c=>c.id===S.cur)?S.cur:cs[0].id;
  return PF.cid;
}
let tmr;const later=()=>{clearTimeout(tmr);tmr=setTimeout(()=>{try{save()}catch(e){}},300)};
function R(keepScroll){const v=document.querySelector('#v'),y=v?v.scrollTop:0;render();if(keepScroll&&v)v.scrollTop=y}
const top0=()=>{const v=document.querySelector('#v');if(v)v.scrollTop=0};

/* ---------- 標籤解析：#標籤 後面一定要接空白才會形成標籤 ---------- */
const TAG_RE=/(^|\s)(#[^\s#]+)(?=\s)/g;
const tagsOf=t=>{const o=[];String(t).replace(TAG_RE,(m,a,b)=>{const k=b.slice(1);if(!o.includes(k))o.push(k);return m});return o};
const stripTags=t=>String(t).replace(TAG_RE,(m,a)=>a).replace(/[ \t]+\n/g,'\n').replace(/[ \t]{2,}/g,' ').trim();
const hl=t=>esc(t).replace(TAG_RE,(m,a,b)=>a+'<span class="pf-tg">'+b+'</span>')+'&#8203;';
function removeTag(text,tag){
  const re=new RegExp('(^|\\s)#'+tag.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=\\s)');
  return text.replace(re,'$1').replace(/[ \t]{2,}/g,' ');
}

/* ---------- 畫面 ---------- */
function vPf(){
  const cid=curCid(),ct=contacts().find(c=>c.id===cid);
  const head='<div class="ph2"><button class="ib" data-a="pf:back">‹</button><h1>'+(PF.page&&FIELD[PF.page]?esc(FIELD[PF.page][1]):'檔案')+'</h1></div>';
  if(!ct)return head+'<div class="empty">還沒有聯絡人。<br>先到「聯絡人」新增一位，檔案就會自動出現他的分類。</div>';
  if(PF.page&&FIELD[PF.page])return head+pageBody(ct)+modalHtml()+confirmHtml();
  const tabs='<div class="stabs">'+[['base','基本資料'],['find','我的發現']].map(([k,n])=>'<button class="stab '+(PF.tab===k?'on':'')+'" data-a="pf:tab" data-i="'+k+'">'+n+'</button>').join('')+'</div>';
  const cats='<div class="pf-cats">'+contacts().map(c=>'<button type="button" class="chip pf-chip'+(c.id===cid?' on':'')+'" data-a="pf:cat" data-i="'+esc(c.id)+'">'+esc(c.name)+'</button>').join('')+'</div>';
  return head+tabs+cats+(PF.tab==='find'?findBody(ct):baseBody(ct))+modalHtml()+confirmHtml();
}

function baseBody(ct){
  const B=D(ct.id).base,L=D(ct.id).lists;
  return '<div class="card pf-list">'+BASE.map(([k,n,ty])=>{
    if(ty==='page'){const c=(L[k]||[]).length;
      return '<button type="button" class="pf-row pf-go" data-a="pf:go" data-i="'+k+'"><span class="pf-k">'+n+'</span><span class="pf-sum">'+(c?c+' 項':'尚未記錄')+'</span><span class="pf-arr">›</span></button>'}
    const v=k==='name'&&B.name==null?ct.name:(B[k]||'');
    return '<label class="pf-row"><span class="pf-k">'+n+'</span><input class="pf-v" data-pfb="'+k+'" value="'+esc(v)+'" placeholder="點擊輸入" autocomplete="off" maxlength="60"></label>';
  }).join('')+'</div><p class="hint">「名字」預設是聯絡人的名字，在這裡修改只會改檔案，不會影響其他地方。</p>';
}

const dots=(lv,mk)=>[1,2,3,4,5].map(n=>'<button type="button" class="pf-dot'+(n<=lv?' on':'')+'" '+mk(n)+' aria-label="程度 '+n+'"></button>').join('');
function composer(f){
  const form=f[4];
  if(FORMS[form])return '<div class="pf-add pf-col">'+FORMS[form].map((p,k)=>'<label class="pf-cl"><span class="pf-pl">'+esc(p[1])+'</span><input id="pfn'+k+'" placeholder="'+esc(p[3])+'" maxlength="300" autocomplete="off"></label>').join('')+'<button class="btn s" data-a="pf:add">新增</button></div>';
  if(form==='level')return '<div class="pf-add pf-col"><input id="pfn0" placeholder="'+esc(f[3])+'" maxlength="300" autocomplete="off"><div class="pf-lvrow"><span class="pf-pl">'+LVL[f[0]]+'</span><div class="pf-dots" id="pfdots">'+dots(PF.lv,n=>'data-a="pf:lv" data-i="'+n+'"')+'</div></div><button class="btn s" data-a="pf:add">新增</button></div>';
  return '<div class="pf-add"><input id="pfn0" placeholder="'+esc(f[3]||'新增')+'" maxlength="300" autocomplete="off"><button class="btn s" data-a="pf:add">新增</button></div>';
}
function itemHtml(it,f){
  const form=f[4],id=esc(it.id),
    x='<button type="button" class="pf-x" data-a="pf:del" data-i="'+id+'" aria-label="刪除">✕</button>',
    ta=(k,ph)=>'<textarea class="pf-auto" rows="1" data-pfi="'+id+'" data-pff="'+k+'" placeholder="'+ph+'">'+esc(it[k]||'')+'</textarea>';
  if(FORMS[form])return '<div class="card pf-item"><div class="pf-parts">'+FORMS[form].map(p=>'<div class="pf-part"><span class="pf-pl">'+esc(p[1])+'</span>'+ta(p[0],p[2]?'':'未填')+'</div>').join('')+'</div>'+x+'</div>';
  if(form==='level')return '<div class="card pf-item"><div class="pf-parts">'+ta('text','')+'<div class="pf-lvrow"><span class="pf-pl">'+LVL[f[0]]+'</span><div class="pf-dots">'+dots(it.lv||0,n=>'data-a="pf:ilv" data-i="'+id+'" data-lv="'+n+'"')+'</div></div></div>'+x+'</div>';
  return '<div class="card pf-item"><div class="pf-parts">'+ta('text','')+'</div>'+x+'</div>';
}
function pageBody(ct){
  const k=PF.page,f=FIELD[k],items=D(ct.id).lists[k]||[];
  return '<div class="pf-sub">'+esc(ct.name)+' 的'+esc(f[1])+'</div>'+composer(f)
   +(items.length?items.map(it=>itemHtml(it,f)).join(''):'<div class="empty">還沒有記錄。<br>在上方輸入後按「新增」。</div>');
}

function findBody(ct){
  const fs=[...D(ct.id).finds].sort((a,b)=>b.t-a.t);
  return '<button type="button" class="btn s pf-addfind" data-a="pf:findadd">＋ 添加發現</button>'
   +(fs.length?fs.map(x=>{const d=new Date(x.t),ds=(d.getMonth()+1)+'/'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
     return '<div class="card pf-find" data-a="pf:findedit" data-i="'+esc(x.id)+'"><div class="pf-lead2">我發現⋯⋯</div><div class="pf-ftxt">'+esc(x.text)+'</div>'
      +((x.tags||[]).length?'<div class="pf-ftags">'+x.tags.map(t=>'<span class="pf-tg">#'+esc(t)+'</span>').join(' ')+'</div>':'')+'<div class="pf-fdate">'+ds+'</div></div>'}).join('')
     :'<div class="empty">還沒有發現。<br>把你注意到的小事記下來吧。</div>');
}

/* 「我發現⋯⋯」輸入浮窗 */
function fixedHtml(text){
  const on=tagsOf(text);
  return '<button type="button" class="pf-plus" data-a="pf:tagplus" aria-label="新增固定標籤">＋</button>'
   +root().tags.map(t=>'<button type="button" class="pf-fix'+(on.includes(t)?' on':'')+'" data-a="pf:tag" data-i="'+esc(t)+'">#'+esc(t)+'</button>').join('');
}
function modalHtml(){
  const m=PF.modal;if(!m)return '';
  return '<div class="pf-ov"><div class="pf-pop">'
   +'<div class="pf-lead">我發現⋯⋯</div>'
   +'<div class="pf-ta"><div class="pf-hl" aria-hidden="true">'+hl(m.text)+'</div><textarea id="pfta" spellcheck="false" placeholder="輸入發現的事項並添加標籤（選填）&#10;標籤輸入成功字體會變色&#10;#標籤1 #標籤2 ">'+esc(m.text)+'</textarea></div>'
   +'<div class="pf-fixed" id="pffixed">'+fixedHtml(m.text)+'</div>'
   +'<div class="pf-newtag" id="pfnewtag" hidden><input id="pfnt" placeholder="新增固定標籤（不用打 #）" maxlength="20" autocomplete="off"><button type="button" class="btn s" data-a="pf:tagok">加入</button></div>'
   +'<div class="pf-acts">'+(m.id?'<button type="button" class="btn d" data-a="pf:mdel">刪除</button>':'')+'<span class="grow"></span><button type="button" class="btn" data-a="pf:mcancel">取消</button><button type="button" class="btn s" data-a="pf:msave">'+(m.id?'儲存':'添加')+'</button></div>'
   +'</div></div>';
}
function confirmHtml(){
  if(!PF.confirm)return '';
  return '<div class="pf-ov pf-cf"><div class="box pf-cfbox" data-keep="1"><h2 style="margin-bottom:6px">是否確認刪除？</h2><p class="hint" style="margin:0 0 10px">'+(PF.confirm.k==='find'?'這則發現':'這筆記錄')+'刪除後無法復原。</p><div class="pf-cfa"><button type="button" class="btn" data-a="pf:cfno">取消</button><button type="button" class="btn d" data-a="pf:cfyes">確認刪除</button></div></div></div>';
}
function modalSync(){
  const m=PF.modal,ta=document.querySelector('#pfta');if(!m||!ta)return;
  const h=document.querySelector('.pf-hl');if(h)h.innerHTML=hl(ta.value);
  const f=document.querySelector('#pffixed');if(f)f.innerHTML=fixedHtml(ta.value);
}
function focusModal(){const t=document.querySelector('#pfta');if(t){t.focus();try{t.setSelectionRange(t.value.length,t.value.length)}catch(e){}}}

/* ---------- 點擊 ---------- */
function act(a,i,el){
  const cid=curCid();
  switch(a){
    case 'pf':PF.open=true;PF.tab='base';PF.page=null;PF.modal=null;PF.confirm=null;PF.lv=0;PF.cid=null;render();top0();return true;
    case 'pf:back':if(PF.modal)PF.modal=null;else if(PF.page)PF.page=null;else PF.open=false;PF.confirm=null;PF.lv=0;render();top0();return true;
    case 'pf:tab':PF.tab=i==='find'?'find':'base';PF.page=null;R();return true;
    case 'pf:cat':PF.cid=i;R(true);return true;
    case 'pf:go':PF.page=i;PF.confirm=null;PF.lv=0;R();top0();return true;
    case 'pf:lv':{const n=+i;PF.lv=PF.lv===n?0:n;document.querySelectorAll('#pfdots .pf-dot').forEach((d,k)=>d.classList.toggle('on',k<PF.lv));return true}
    case 'pf:ilv':{const n=+el.dataset.lv,it=(D(cid).lists[PF.page]||[]).find(x=>x.id===i);if(!it)return true;it.lv=it.lv===n?0:n;save();el.parentNode.querySelectorAll('.pf-dot').forEach((d,k)=>d.classList.toggle('on',k<it.lv));return true}
    case 'pf:add':{const f=FIELD[PF.page],form=f&&f[4],L=D(cid).lists;let it;
      if(FORMS[form]){
        const vals=FORMS[form].map((p,k)=>{const e=document.querySelector('#pfn'+k);return e?e.value.trim():''});
        const miss=FORMS[form].findIndex((p,k)=>p[2]&&!vals[k]);
        if(miss>=0){toast('請填寫「'+FORMS[form][miss][1]+'」');const e=document.querySelector('#pfn'+miss);if(e)e.focus();return true}
        it={id:uid(),t:Date.now()};FORMS[form].forEach((p,k)=>{it[p[0]]=vals[k]});
      }else{
        const e=document.querySelector('#pfn0'),v=e&&e.value.trim();if(!v){if(e)e.focus();return true}
        it={id:uid(),text:v,t:Date.now()};if(form==='level')it.lv=PF.lv||0;
      }
      (L[PF.page]=L[PF.page]||[]).unshift(it);PF.lv=0;save();R(true);const n=document.querySelector('#pfn0');if(n)n.focus();return true}
    case 'pf:del':PF.confirm={k:'item',id:i};R(true);return true;
    case 'pf:findadd':PF.modal={id:null,text:''};R(true);focusModal();return true;
    case 'pf:findedit':{const x=D(cid).finds.find(f=>f.id===i);if(!x)return true;
      PF.modal={id:i,text:x.text+((x.tags||[]).length?' '+x.tags.map(t=>'#'+t).join(' ')+' ':'')};R(true);focusModal();return true}
    case 'pf:mcancel':PF.modal=null;R(true);return true;
    case 'pf:msave':{const ta=document.querySelector('#pfta'),raw=ta?ta.value:PF.modal.text,text=stripTags(raw),tags=tagsOf(raw);
      if(!text){toast('請先輸入發現的內容');if(ta)ta.focus();return true}
      const F=D(cid).finds;
      if(PF.modal.id){const x=F.find(f=>f.id===PF.modal.id);if(x){x.text=text;x.tags=tags}}
      else F.push({id:uid(),text,tags,t:Date.now()});
      PF.modal=null;save();R(true);return true}
    case 'pf:mdel':PF.confirm={k:'find',id:PF.modal.id};R(true);return true;
    case 'pf:cfno':PF.confirm=null;R(true);return true;
    case 'pf:cfyes':{const c=PF.confirm;PF.confirm=null;if(!c)return true;
      if(c.k==='item'){const L=D(cid).lists;L[PF.page]=(L[PF.page]||[]).filter(x=>x.id!==c.id)}
      else{const F=D(cid).finds,k=F.findIndex(f=>f.id===c.id);if(k>=0)F.splice(k,1);PF.modal=null}
      save();R(true);return true}
    case 'pf:tag':{const ta=document.querySelector('#pfta');if(!ta)return true;let t=ta.value;
      if(tagsOf(t).includes(i))t=removeTag(t,i);
      else t=(t&&!/\s$/.test(t)?t+' ':t)+'#'+i+' ';
      ta.value=t;PF.modal.text=t;modalSync();ta.focus();try{ta.setSelectionRange(t.length,t.length)}catch(e){}return true}
    case 'pf:tagplus':{const w=document.querySelector('#pfnewtag');if(!w)return true;w.hidden=!w.hidden;if(!w.hidden){const n=document.querySelector('#pfnt');if(n)n.focus()}return true}
    case 'pf:tagok':{const n=document.querySelector('#pfnt');let v=n?n.value.replace(/^#+/,'').replace(/[\s#]+/g,''):'';
      if(!v){if(n)n.focus();return true}
      const T=root().tags;if(!T.includes(v))T.push(v);save();if(n)n.value='';const w=document.querySelector('#pfnewtag');if(w)w.hidden=true;modalSync();toast('已新增固定標籤 #'+v);return true}
  }
  return false;
}
document.addEventListener('click',e=>{
  const t=e.target;if(!t||!t.closest)return;
  if(PF.open&&t.closest('[data-t]')&&!t.closest('[data-a]')){PF.open=false;PF.page=null;PF.modal=null;return}   // 切換底部分頁時離開檔案
  const A=t.closest('[data-a="pf"],[data-a^="pf:"]');
  if(!A){
    if(PF.open&&PF.confirm&&t.classList&&t.classList.contains('pf-cf')){PF.confirm=null;R(true);return}
    if(PF.open&&PF.modal&&!PF.confirm&&t.classList&&t.classList.contains('pf-ov')){const ta=document.querySelector('#pfta');if(!ta||!ta.value.trim()){PF.modal=null;R(true)}}  // 點背景：內容空白才關閉，避免誤觸丟字
    return;
  }
  if(act(A.dataset.a,A.dataset.i,A)){e.stopPropagation();e.preventDefault()}
},true);
// 桌機點固定標籤時不要讓輸入框失焦
document.addEventListener('mousedown',e=>{if(e.target.closest&&e.target.closest('.pf-fix,.pf-plus'))e.preventDefault()});

/* ---------- 輸入 ---------- */
document.addEventListener('input',e=>{
  const t=e.target;if(!t||!t.dataset||!PF.open)return;
  const cid=curCid();if(!cid)return;
  if(t.dataset.pfb){const B=D(cid).base,k=t.dataset.pfb,v=t.value.trim();if(v)B[k]=v;else delete B[k];later();return}
  if(t.dataset.pfi){const it=(D(cid).lists[PF.page]||[]).find(x=>x.id===t.dataset.pfi);if(it){it[t.dataset.pff||'text']=t.value;later()}auto(t);return}
  if(t.id==='pfta'&&PF.modal){PF.modal.text=t.value;modalSync()}
});
document.addEventListener('change',e=>{   // 名字清空 → 回到聯絡人名字
  const t=e.target;if(!t||!t.dataset||!PF.open||t.dataset.pfb!=='name')return;
  const ct=contacts().find(c=>c.id===curCid());if(ct&&!t.value.trim())t.value=ct.name;
});
document.addEventListener('keydown',e=>{
  if(!PF.open)return;
  if(e.key==='Enter'&&/^pfn[01]$/.test(e.target.id||'')){e.preventDefault();const f=FIELD[PF.page];if(f&&FORMS[f[4]]&&e.target.id==='pfn0'){const n=document.querySelector('#pfn1');if(n)n.focus()}else act('pf:add')}
  if(e.key==='Enter'&&e.target.id==='pfnt'){e.preventDefault();act('pf:tagok');}
});
// 文字框自動長高（新畫面出現時）
function auto(t){t.style.height='auto';t.style.height=t.scrollHeight+'px'}
function autoAll(){document.querySelectorAll('textarea.pf-auto').forEach(auto)}
try{new MutationObserver(autoAll).observe(document.body,{childList:true,subtree:true})}catch(e){}

})();
