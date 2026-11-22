
/* ── 靈感拾取：記憶字卡 / 提取字卡 ── */
const NOLOCK=['rl','insp','insprule'];
let inspOpen=false,inspTab='mem',inspEdit=false,inspSel=[];
const INSP_STOP=new Set('的了嗎呢吧啊呀哦喔嘛啦誒欸哈嗯呃著過地得我你他她它您咱這那哪誰'.split(''));
const INSP_PRON=new Set(['我們','你們','他們','她們','它們','咱們','這個','那個','這裡','那裡','哪裡','什麼','怎麼','這樣','那樣','自己','大家','一下','一個']);
const inspOk=w=>[...w].length>=2&&!INSP_PRON.has(w)&&!('我你他她它您咱'.includes([...w][0])&&[...w].length<=2)&&!/^[\d\s]+$/.test(w)&&[...w].some(c=>!INSP_STOP.has(c));
function inspSeg(text){let seg;try{seg=new Intl.Segmenter('zh',{granularity:'word'})}catch(e){return null}const out=[];let cur=[];for(const x of seg.segment(text)){if(x.isWordLike)cur.push(x.segment);else{if(cur.length)out.push(cur);cur=[]}}if(cur.length)out.push(cur);return out}
function inspCands(text){const sents=[...new Set(String(text).split(/[。！？!?\n；;…]+/).map(x=>x.trim()).filter(x=>[...x].length>=2))],words=[],phrases=[],cl=inspSeg(String(text))||[];
  cl.forEach(c=>{c.forEach(w=>{if(inspOk(w)&&!words.includes(w))words.push(w)});for(let n=2;n<=3;n++)for(let i=0;i+n<=c.length;i++){const p=c.slice(i,i+n);if(p.some(inspOk)){let ch=[...p.join('')];while(ch.length&&INSP_STOP.has(ch[0]))ch.shift();while(ch.length&&INSP_STOP.has(ch[ch.length-1]))ch.pop();const t=ch.join('');if(ch.length>=3&&!phrases.includes(t))phrases.push(t)}}});
  return{words,phrases,sents}}
function memPicks(text){const c=inspCands(text),s=S.set,hit=p=>rnd()*100<p,out=[];
  if(!c.words.length&&!c.phrases.length){const z=c.sents.length?pk(c.sents):String(text).trim();return z?[z]:[]}
  c.words.forEach(w=>{if(hit(+s.memWord||0))out.push(w)});c.phrases.forEach(t=>{if(hit(+s.memPhrase||0))out.push(t)});c.sents.forEach(t=>{if(hit(+s.memSent||0))out.push(t)});return[...new Set(out)]}
function extPick(text,a){const c=inspCands(text),s=S.set,P=a?'aext':'ext',opts=[[c.words,s[P+'Word']],[c.phrases,s[P+'Phrase']],[c.sents,s[P+'Sent']]].map(([l,w])=>[l,Math.max(0,+w||0)]).filter(([l,w])=>l.length&&w>0);
  /* 權重抽取：數字越大越容易被選到，數字相同機率相同；權重 0 不會被選到 */
  if(opts.length){let r=rnd()*opts.reduce((x,o)=>x+o[1],0);for(const [l,w] of opts){if((r-=w)<0)return pk(l)}return pk(opts[opts.length-1][0])}
  return c.sents.length?pk(c.sents):String(text).trim()}
function inspCat(cid,kd){let g=S.cats.find(c=>kc(c)===kd&&c.un&&c.own===cid);if(!g){g={id:uid(),sc:'e',kind:kd,name:'未分類',on:1,as:[],own:cid,un:1};S.cats.push(g)}return g}
function inspSavedCat(cid){let g=S.cats.find(c=>kc(c)==='ext'&&c.sv&&c.own===cid);if(!g){inspCat(cid,'ext');g={id:uid(),sc:'e',kind:'ext',name:'我保存的',on:1,as:[],own:cid,un:1,sv:1};S.cats.push(g)}return g}
/* 手動保存提取事件：放進「我保存的」；已有相同文字的字卡則移到「我保存的」 */
function inspSave(cid,text,src){const g=inspSavedCat(cid),ids=new Set(S.cats.filter(c=>kc(c)==='ext'&&c.own===cid).map(c=>c.id));let k=S.cards.find(x=>ids.has(x.cat)&&(x.text===text||x.orig===text));if(!k){k={id:uid(),cat:g.id,text,orig:text,on:1,srcs:[]};S.cards.push(k)}else k.cat=g.id;k.srcs=k.srcs||[];k.srcs.push(src);return k}
function inspAdd(cid,kd,text,src){const ids=new Set(S.cats.filter(c=>kc(c)===kd&&c.own===cid).map(c=>c.id));let k=S.cards.find(x=>ids.has(x.cat)&&(x.text===text||x.orig===text));if(!k){k={id:uid(),cat:inspCat(cid,kd).id,text,orig:text,on:1,srcs:[]};S.cards.push(k)}k.srcs=k.srcs||[];k.srcs.push(src);return k}
const inspLog=(kd,r)=>{const a=S.insp[kd];a.push(r);if(a.length>1000)a.splice(0,a.length-1000)};
const inspRand=(a,b)=>{a=Math.max(0,+a||0);b=Math.max(a,+b||0);return(a+rnd()*(b-a))*1000};
function memSchedule(cid,m){if(!S.set||!S.set.inspOn||!S.set.memOn||m.img||m.qa||!m.x||[...String(m.x).trim()].length<2)return;S.ipend.push({id:uid(),k:'m1',cid,mid:m.id,x:m.x,mt:m.t||Date.now(),due:Date.now()+inspRand(S.set.memJmin,S.set.memJmax)})}
/* 提取字卡流程入口。a=1：主動發送用的設置（aext*）；r=1：被動回覆的回合，流程結束後要接著開始回覆流程。回傳是否真的啟動 */
function extStart(cid,a,r){const s=S.set,P=a?'aext':'ext';if(!s.inspOn||!s[P+'On'])return false;S.ipend.push({id:uid(),k:'e1',cid,a:a?1:0,r:r?1:0,due:Date.now()+inspRand(s[P+'Wmin'],s[P+'Wmax'])});return true}
/* 被動回覆：提取字卡流程結束（成功發出、判定失敗、無可提取內容、功能被關閉都算）→ 開始回覆流程（等待輸入時間 → 發送字卡） */
function extDone(cid,n){const R=S.rounds[cid];if(!R||R.ph!==3)return;n=n||Date.now();const s=S.set,mn=Math.max(0,+s.rmin||0)*1000,mx=Math.max(mn,(+s.rmax||0)*1000);R.ph=2;R.due=n+mn+rnd()*(mx-mn);save()}

function inspStep(p){const s=S.set,n=Date.now(),hit=x=>rnd()*100<x;if(!s.inspOn){if(p.r)extDone(p.cid,n);return}const X=k=>s[(p.a?'aext':'ext')+k];
  if(p.k==='m1'){if(s.memOn&&hit(+s.memProb||0))S.ipend.push({...p,k:'m2',id:uid(),due:n+inspRand(s.memPmin,s.memPmax)})}
  else if(p.k==='m2'){memPicks(p.x).forEach(t=>{inspAdd(p.cid,'mem',t,{id:p.mid,x:p.x,mt:p.mt,t:n});inspLog('mem',{id:uid(),cid:p.cid,text:t,src:p.x,sid:p.mid,mt:p.mt,t:n})})}
  else if(p.k==='e1'){if(X('On')&&hit(+X('Prob')||0))S.ipend.push({id:uid(),k:'e2',cid:p.cid,a:p.a,r:p.r,due:n+Math.max(0,+X('Delay')||0)*1000});else if(p.r)extDone(p.cid,n)}
  else if(p.k==='e2'){const h=ms(p.cid).filter(m=>m.f==='me'&&!m.qa&&!m.img&&m.x&&[...String(m.x).trim()].length>=2);if(!h.length){if(p.r)extDone(p.cid,n);return}const src=pk(h),t=extPick(src.x,p.a);if(!t){if(p.r)extDone(p.cid,n);return}
    const m={id:uid(),f:'ta',x:t,t:n,tags:['提取字卡'],ext:1};sendQ(p.cid,[m]);const ev={id:uid(),cid:p.cid,text:t,src:src.x,sid:src.id,mt:src.t,t:m.t,saved:false};
    if(hit(+X('Save')||0)){inspAdd(p.cid,'ext',t,{id:src.id,x:src.x,mt:src.t,t:m.t});ev.saved=true;inspLog('ext',{id:uid(),cid:p.cid,text:t,src:src.x,sid:src.id,mt:src.t,t:m.t})}inspLog('ev',ev);if(p.r)extDone(p.cid,n)}}
const isExtracting=cid=>!!(S.ipend&&S.ipend.some(p=>p.k==='e2'&&p.cid===cid));
function inspTick(){if(!S||!S.ipend||!S.ipend.length)return;const n=Date.now(),due=S.ipend.filter(p=>p.due<=n);if(!due.length)return;S.ipend=S.ipend.filter(p=>p.due>n);const isE=p=>p.k==='e1'||p.k==='e2',hasE=due.some(isE);due.filter(p=>hasE&&!isE(p)).forEach(p=>S.ipend.push({...p,due:n+STEP}));due.filter(p=>!hasE||isE(p)).forEach(p=>{if(S.contacts.some(c=>c.id===p.cid)&&!isDnd(p.cid))inspStep(p)});save();if(tab==='chat')paint();else if(tab==='home'&&inspOpen)render()}
setInterval(inspTick,1000);

/* 功能流程順序（設置 → 關於）：每個箭頭＝間隔 0.5 秒；判定失敗就不會有後面的「選擇」 */
function FLOWPAGE(){const B=(t,rows)=>'<div class="card" style="margin-bottom:12px"><h3 style="margin:0 0 8px;font-weight:500">'+t+'</h3>'+rows.map(([k,v])=>'<div style="margin:0 0 10px"><b style="font-weight:500">'+k+'</b><div style="font-size:calc(13px*var(--fz,1));line-height:1.9;color:var(--soft)">'+v+'</div></div>').join('')+'</div>',A=' → ';
  const msg='引用判定'+A+'字卡抽取'+A+'emoji判定'+A+'選擇emoji'+A+'顏文字判定'+A+'選擇顏文字'+A+'（字卡有幾張就重複「字卡抽取～選擇顏文字」）'+A+'情緒判定'+A+'選擇情緒（一輪只出現一次）'+A+'心意判定'+A+'選擇心意'+A+'交流意圖判定'+A+'選擇交流意圖'+A+'星標判定'+A+'發送';
  return '<p class="hint" style="margin:0 0 10px">每個「→」之間間隔 0.5 秒；判定沒中就沒有後面的「選擇」。emoji／顏文字／標籤的「選擇時間」設定仍會另外加在對應步驟前。</p>'
  +B('聊天室',[
   ['被動回覆順','你發送訊息'+A+'（等 6 秒）已讀不回判定'+A+'提取字卡流程（若有觸發，結束後才繼續）'+A+'拍一拍判定'+A+'選擇拍一拍'+A+'表情包判定'+A+'選擇表情包'+A+'回幾條'+A+'（等回覆時間）'+A+'每一條回覆：'+msg+'<br>一條發送後，等 3 秒才開始下一條；表情包排在某一條之前或最後。'],
   ['主動發送','主動發送時間到'+A+'取消判定（0.5 秒後換下一步）'+A+'拍一拍判定'+A+'選擇拍一拍'+A+'表情包判定'+A+'選擇表情包'+A+'回幾條'+A+'每一條回覆：同被動回覆（發出第一則後才開始提取字卡）'],
   ['群聊回覆','同被動回覆（已讀不回判定'+A+'拍一拍'+A+'表情包'+A+'回幾條'+A+'每一條回覆），沒有提取字卡。'],
   ['問答字卡回覆','等待回答時間'+A+'抽字卡（每張字卡間隔 0.5 秒）'+A+'全部抽完後一次送出。']])
  +B('靈感提取',[
   ['提取字卡與記憶字卡','兩者同時發生時：提取字卡先處理'+A+'記憶字卡延後 0.5 秒再處理。'],
   ['提取字卡','觸發判定'+A+'提取延遲'+A+'從你說過的話挑選'+A+'發送提取字卡'],
   ['記憶字卡','記憶判定'+A+'等待記憶挑選時間'+A+'挑選字詞／詞組／句子並存入']])
  +B('信箱',[
   ['寄信與回信','每一張字卡：字卡抽取'+A+'emoji判定'+A+'選擇emoji'+A+'顏文字判定'+A+'選擇顏文字'+A+'表情包貼圖判定'+A+'選擇表情包貼圖'+A+'下一張字卡⋯⋯'+A+'全部抽完，信件才送達並通知。'],
   ['通知','信件送達時會通知（設置→信箱設置→信件通知）：主頁信箱出現未讀提示，點擊通知會跳到信箱；聊天室在對方有新信時也會收到提示。']])
  +B('塗鴉',[
   ['流程','塗鴉功能還沒開放，開放後的流程會寫在這裡。']])
  +B('朋友圈',[
   ['發文','字卡抽取'+A+'emoji判定'+A+'選擇emoji'+A+'顏文字判定'+A+'選擇顏文字'+A+'下一張字卡（重複）'+A+'表情包判定'+A+'選擇表情包'+A+'貼圖牆貼紙判定'+A+'選擇貼紙'+A+'選擇位置'+A+'發布'],
   ['留言','字卡抽取'+A+'emoji判定'+A+'選擇emoji'+A+'顏文字判定'+A+'選擇顏文字'+A+'（多張字卡重複）'+A+'表情包判定'+A+'選擇表情包（排在最後）'+A+'發送留言'],
   ['貼圖回覆','回覆判定'+A+'等待回覆時間'+A+'選擇貼紙'+A+'選擇位置'+A+'下一張貼紙（重複）'],
   ['通知','聯絡人發新貼文時會通知（設置→通知設置→朋友圈通知）：主頁朋友圈出現未讀提示，點擊通知會跳到「朋友圈 → 聯絡人貼文」。']])
  +B('學習進度',[
   ['流程','每週日 0 點起（時間照排定的時間表算，程式關閉期間錯過的步驟，重新打開後會依原本時間補上）'+A+'等判定時間'+A+'依機率判定要不要更改（沒中且是第一次判定：等「晚點再看看」的時間再判定一次）'+A+'逐欄：修改熟練條'+A+'10 秒後隨機選擇評價（困難／有點難／一般／好上手／簡單，是每一欄的最後一步）'+A+'等隨機時間'+A+'下一欄'+A+'全部完成後，當天的每日留言才開始。'],
   ['通知','聊天室會顯示系統通知（目前聯絡人）：正在選擇要不要更改、決定晚點再看看／不改變、每一欄改完立刻顯示新的熟練度與評價，全部完成後顯示「學習進度更新完成」。整個流程同一時間只跑一條，欄與欄之間依序進行，不會同時判定多欄。']])
  +B('每日留言',[
   ['留言內容','每一張字卡：字卡抽取'+A+'emoji判定'+A+'選擇emoji'+A+'顏文字判定'+A+'選擇顏文字'+A+'下一張字卡（重複）'+A+'抽完送出並記下留言時間。emoji、顏文字機率預設各 10%。']])
  +B('月曆提醒',[
   ['提醒通知','打開程式'+A+'把到了通知日的事件記進事件紀錄'+A+'跳出通知窗（有開關的提醒才會跳；備注只在通知窗顯示）'+A+'通知期間內事件名顯示在備忘錄第一排。'],
   ['事件保留','月曆上只顯示最近兩年的事件；事件紀錄會永久保留，可多選刪除。']])}
const IT=[['mem','記憶字卡'],['ext','提取字卡'],['ev','提取事件紀錄']];
const inspRows=()=>(S.insp[inspTab]||[]).filter(r=>r.cid===S.cur).sort((a,b)=>b.t-a.t);
function vInspHome(){return '<div class="ph2"><button class="ib" data-a="inspback">‹</button><h1>靈感拾取</h1></div>'+inspPage()}
function inspPage(){const rows=inspRows(),all=rows.length&&rows.every(r=>inspSel.includes(r.id));
  const tabs='<div class="seg">'+IT.map(([k,n])=>'<button class="'+(inspTab===k?'on':'')+'" data-a="itab" data-i="'+k+'">'+n+'</button>').join('')+'</div>';
  const top='<div style="display:flex;align-items:center;margin:0 0 10px"><span class="hint" style="margin:0;flex:1">「'+esc(cur().name)+'」的'+IT.find(x=>x[0]===inspTab)[1]+'</span><button class="btn" data-a="iedit" style="width:auto;margin:0;padding:6px 14px">'+(inspEdit?'完成':'編輯')+'</button></div>';
  const bar=inspEdit?'<div class="selbar">'+selAllHtml('ins',rows.map(r=>r.id),inspSel)+'<button class="btn d" data-a="idel" style="border-style:solid">刪除所選（'+inspSel.length+'）</button></div>':'';
  const lab=inspTab==='mem'?'記憶時間':inspTab==='ext'?'提取時間':'提取時間';
  const row=r=>{const inner='<div class="ltt">'+lab+' '+ltime(r.t)+(inspTab==='ev'?' · '+(r.saved?'已保存':'未保存'):'')+'</div><div class="ltx"><b style="font-weight:500">'+esc(r.text)+'</b></div><div class="ltx" style="color:var(--soft);font-size:calc(12.5px*var(--fz,1))">來源：'+esc(r.src)+'（'+ltime(r.mt)+'）'+(r.edited?' · 已編輯':'')+'</div>';
    return inspEdit?'<div class="lt pick'+(inspSel.includes(r.id)?' sel':'')+'" data-a="isel" data-i="'+r.id+'"><span class="ck '+(inspSel.includes(r.id)?'on':'')+'"></span>'+inner+'</div>':'<div class="lt">'+(inspTab==='ev'&&!r.saved?'<button class="btn ev-save" data-a="evsave" data-i="'+r.id+'">保存</button>':'')+inner+'</div>'};
  return tabs+top+bar+(rows.length?rows.map(row).join(''):'<div class="empty">還沒有紀錄。</div>')}
const IR=(t,b)=>'<div class="card set"><h3>'+t+'</h3><div style="font-size:calc(14px*var(--fz,1));line-height:1.9">'+b+'</div></div>';
const INSPRULE=IR('靈感拾取說明',`<p style="margin:0 0 8px">靈感拾取是一項從日常聊天中收集文字的功能。Pearla 會在使用者與聯絡人的互動過程中，隨機拾取曾經說過的詞語、片語或句子，將它們保存成獨立的字卡。</p><p style="margin:0 0 8px">每一次拾取都是獨立的隨機事件。Pearla 不會替使用者改寫文字，也不會自行創作新的內容，而是保留原本說過的話，讓它們有機會再次出現在往後的對話中。</p><p style="margin:0 0 4px"><b>靈感拾取擁有以下性質：</b></p><ol style="margin:0 0 8px;padding-left:20px"><li>獨立性：記憶字卡與提取字卡有各自獨立的觸發流程。</li><li>隨機性：每次提取都獨立判定，不依照歷史結果調整機率。</li><li>原文性：只使用使用者實際說過的文字，不自行生成內容。</li><li>專屬性：每位聯絡人的聊天內容及字卡資料互不混用。</li><li>可追溯性：主頁-靈感拾取裡會記錄每張字卡的來源訊息。</li><li>自主性：使用者可以管理字卡、編輯文字及決定是否加入抽卡範圍。</li><li>非強制性：提取字卡可以只發送、不保存，讓偶然出現的文字不一定都成為永久收藏。</li><li>不重複性：不會保存重複的字卡。</li></ol><p style="margin:0 0 8px"><b>記憶字卡</b>功能可以從使用者主動發送的訊息中拾取文字：每當使用者發送一則符合條件的文字訊息，Pearla 就會依照設定的機率，獨立判定是否進行提取。若判定成功，Pearla 會從該則訊息中隨機擷取適合的文字，建立一張記憶字卡。</p><p style="margin:0 0 8px"><b>提取字卡</b>功能在 Pearla 回覆字卡後，額外拾取使用者過去說過的文字：聯絡人每次回覆（被動回覆在確認不是已讀不回後）或主動發送，就會啟動一次獨立的提取判定流程。判定成功後，Pearla 會從目前聯絡人的歷史聊天訊息中，隨機提取一段使用者曾經說過的文字，並在等待時間結束後，額外發送一則帶有「提取字卡」標籤的訊息。這張字卡不一定會被永久保存，發送後還會進行一次獨立的保存機率判定。因此，有些文字會成為提取字卡儲存，有些則只會在當下短暫出現。</p><p style="margin:0 0 4px"><b>記憶與提取內容：</b></p><ol style="margin:0 0 8px;padding-left:20px"><li>單字：具有獨立意義的完整詞語。</li><li>連續詞組：原始訊息中連續出現的詞語組合。</li><li>完整句子：原始訊息中的完整句子。</li><li>排除沒有獨立意義的助詞及代詞。</li><li>如果無法可靠辨識詞語，則改為提取完整句子。</li></ol><p style="margin:0 0 8px">中文分詞由瀏覽器內建的分詞（Intl.Segmenter）負責，Pearla 自行控制隨機抽取及提取機率。兩者是獨立模組。</p><p style="margin:0">保存後的記憶字卡與提取字卡將加入抽卡範圍，與一般字卡一起被抽取，完全隨機、不保底（可看作為一般字卡中的兩個特殊分類）。</p>`)
+IR('靈感拾取之記憶字卡流程與規則',`<p style="margin:0 0 4px"><b>記憶字卡流程：</b></p><ol style="margin:0 0 8px;padding-left:20px"><li>Pearla 獨立判定本次使用者發送的訊息是否觸發提取。</li><li>若判定失敗，本次流程結束。</li><li>若判定成功，瀏覽器內建的分詞（Intl.Segmenter）辨識訊息中的詞語。</li><li>Pearla 從原始訊息的位置擷取文字並驗證。成功擷取後，建立或更新記憶字卡。</li></ol><p style="margin:0 0 4px"><b>記憶字卡規則：</b></p><ol style="margin:0;padding-left:20px"><li>當每條訊息記憶判定成功後，依照設置隨機時間開始抽取要新增哪些詞語。</li><li>每個詞語新增至記憶字卡的機率依照設置，每個詞語互不影響、完全隨機。</li><li>記憶字卡會永久保存於對應聯絡人的字卡分類中，除非使用者自行刪除。</li></ol>`)
+IR('靈感拾取之拾取字卡流程與規則',`<p style="margin:0 0 8px">提取字卡分為「被動回覆」與「主動發送」兩種，各有獨立設置。被動回覆：你發送訊息後，先判定是否已讀不回；已讀不回就不提取也不回覆，否則先走完整個提取字卡流程，結束後才開始回覆字卡。主動發送：第一則字卡訊息實際發出後，才啟動提取流程。</p><ul style="margin:0 0 8px;padding-left:20px"><li><b>第一階段：等待提取判定。</b>每一次聯絡人字卡回覆會從設定的最短與最長等待時間之間，隨機選取一個等待時間。等待時間結束後，才依設置機率進行提取觸發機率判定。若判定失敗，本次流程結束，不會發送提取字卡。</li><li><b>第二階段：等待實際提取。</b>若第一階段判定成功，不會立即提取，而是依照設置時間等待，時間結束後，才正式開始提取。</li><li><b>第三階段：提取及額外發送。</b>從目前聯絡人所有符合條件的歷史聊天訊息中，隨機挑選一則，再依「單字權重、連續詞組權重、完整句子權重」決定提取哪一種文字（數字越大越容易被選到，數字相同則機率相同，權重 0 不會被選到）。提取成功後額外發送一則提取字卡訊息，訊息顯示「提取字卡」標籤、不佔用原本字卡回覆的消息條數。</li><li><b>第四階段：判定是否保存。</b>提取字卡發送後才依設置進行保存機率判定。若判定成功，將文字保存至提取字卡分類。若判定失敗，這張字卡只會在本次對話中發送，不會加入提取字卡收藏庫。</li></ul><p style="margin:0">無論保存與否，本次提取事件都會留下紀錄（包括來源、時間、是否被保存）。（主頁-靈感拾取-提取事件）</p>`)
+IR('重複字卡處理',`<p style="margin:0 0 8px">記憶字卡與提取字卡都採用相同的重複文字處理方式。相同文字只保留一張卡片，但允許累積多筆來源紀錄。</p><p style="margin:0 0 4px">例如，同一段文字被提取三次：</p><ul style="margin:0 0 8px;padding-left:20px"><li>不會建立三張相同內容的卡片。</li><li>只保留一張卡片。</li><li>將三次提取的來源分別記錄。</li></ul><p style="margin:0">如果使用者編輯過卡片文字，系統必須保留編輯結果，不可因為後續再次提取到原始文字而覆蓋使用者的修改。</p>`);