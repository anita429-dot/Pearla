

/* ── 事件 ── */
/* 通知／深色模式開關：重畫後維持在目前的主頁分頁，不跳回第一頁 */
function keepHomePos(){try{const pg=$('.pager');if(pg&&tab==='home')homeSnap={l:pg.scrollLeft,t:$('#v').scrollTop,sub:1}}catch(e){}}
function pokeSend(){const cid=S.cur;if(pokeBusy[cid])return;pokeBusy[cid]=1;if(tab==='chat')paint();const av=S.set.avatarSend,wait=Math.max(0,(av===undefined||av===null||av===''||isNaN(+av))?6:+av)*1000;setTimeout(()=>{pokeBusy[cid]=0;try{if(S.contacts.some(c=>c.id===cid)&&!isDnd(cid)){fireA(cid);save()}}finally{if(tab==='chat'&&S.cur===cid)paint()}},wait)}
/* ── 按下後移開再放開：不觸發點擊（必須在同一個按鈕上按下並放開才生效）── */
(()=>{const SEL='button,[data-a],[data-t],[data-c],a,label,summary,.tab,.stab';let dn=null;
document.addEventListener('pointerdown',e=>{dn=(e.pointerType==='mouse'&&e.button!==0)?null:{el:e.target&&e.target.closest?e.target.closest(SEL):null,x:e.clientX,y:e.clientY}},true);
document.addEventListener('pointercancel',()=>{dn=null},true);
document.addEventListener('click',e=>{if(!dn||e.detail===0||!e.isTrusted){dn=null;return}const d=dn;dn=null;if(!d.el||!d.el.isConnected)return;
  const up=document.elementFromPoint(e.clientX,e.clientY),ue=up&&up.closest?up.closest(SEL):null;
  if(ue!==d.el&&!(ue&&d.el.contains(ue))&&!(ue&&ue.contains(d.el))){e.stopImmediatePropagation();e.preventDefault()}},true)})();

document.addEventListener('click',e=>{
  {const A0=e.target.closest('.pager [data-a]');if(A0&&tab==='home'){const pg=A0.closest('.pager');homeSnap={l:pg.scrollLeft,t:$('#v').scrollTop}}}
  const T=e.target.closest('[data-t]');
  if(T&&!e.target.closest('[data-a]')){const nt=T.dataset.t,pt=tab;if(nt!=='chat')chS={open:0,d:'',k:''};notifBack=false;homeSnap=null;if(pt==='home'&&nt!=='home'&&kitchenOpen){kitchenOpen=false;kitchenSelected=[]}if(pt==='set'&&nt!=='set')keepSet=(sTab===1&&sPage)?{sTab:1,sPage:sPage}:null;tab=nt;if(nt==='cards'&&pt!=='cards'&&kind==='card')scope='e';calOpen=false;inspOpen=false;dataOpen=false;grpOpen=false;grpRoom=null;mhOpen=false;mhClear();abOpen=false;momOpen=false;pomoOpen=false;perOpen=false;perEdit=false;mailOpen=false;mailEdit=false;mailSel=[];mailReplyId=null;mailKeep={};recOpen=false;recEdit=false;recSel=[];recPage=null;recSeen={};sPage=null;oPage=null;delMode=false;selC=[];if(nt==='set'){if(pt==='set'){sTab=0;keepSet=null}else if(keepSet){sTab=keepSet.sTab;sPage=keepSet.sPage;keepSet=null}else sTab=0}closeSheet();render();return}
  if(e.target.id==='calpop'){closeCalPop();return}
  if(e.target.id==='cfov'){qaConfirm=null;askSheet(1);return}if(e.target.id==='addov'){qaAdd=null;askSheet(1);return}if(e.target.id==='sh'){if(typeof sheetBack==='function'){const b=sheetBack;sheetBack=null;b();return}closeSheet();return}if($('#sh')?.classList.contains('chat-pop')&&$('#sh').classList.contains('show')&&!e.target.closest('#sh .box')&&!e.target.closest('[data-a=emo]')&&!e.target.closest('[data-a=more]')){closeSheet()}if(e.target.id==='daily-pop'){closeDaily();return}
  const A=e.target.closest('[data-a]');
  const R=e.target.closest('[data-c]');
  if(!A){if(R){S.cur=R.dataset.c;save();render();toast('已切換聯絡人 · '+cur().name)}return}
  const a=A.dataset.a,i=A.dataset.i,cid=R&&R.dataset.c;if(tab==='set'&&sTab===0&&sPage&&!NOLOCK.includes(sPage)&&S.locked&&a!=='lock'&&a!=='stab'&&a!=='sback'&&a!=='help'){toast('設定已鎖定，請先解除鎖定');return}
  const cat=S.cats.find(c=>c.id===selCat);
  switch(a){
    case 'close':closeSheet();break;
    case 'hidenote':S.hideNote=!S.hideNote;save();paint();moreSheet();toast(S.hideNote?'已隱藏聯絡人行為通知':'已顯示聯絡人行為通知',1500);break;
    case 'mail':mailRepEdit=null;mailOpen=true;mailTab='w';mailEdit=false;mailSel=[];mailReplyId=null;mailKeep={};render();$('#v').scrollTop=0;break;
    case 'mback':mailRepEdit=null;mailOpen=false;mailEdit=false;mailSel=[];mailReplyId=null;mailKeep={};if(notifBack){notifBack=false;const CT=$('[data-t="chat"]');if(CT){CT.click();break}}render();break;
    case 'mtab':mailRepEdit=null;mailTab=i;mailEdit=false;mailSel=[];mailReplyId=null;render();break;
    case 'lnew':lcD={id:null,x:'',imgs:[]};lcTab='emoji';lcSheet();break;
    case 'ledit1':{const L=S.letters.find(x=>x.id===i);if(!lcEditable(L)){toast('這封信已經不能編輯了');break}lcD={id:L.id,x:L.text,imgs:(L.imgs||[]).slice()};lcTab='emoji';lcSheet();break}
    case 'lcclose':lcD=null;closeSheet();break;
    case 'lcemo':lcSync();lcEmoSheet();break;
    case 'lcback':lcSheet();break;
    case 'lctab':lcTab=i;lcEmoSheet();break;
    case 'lcimgx':{lcSync();if(lcD)lcD.imgs.splice(+i,1);lcSheet();break}
    case 'lcpick':{const k=S.cards.find(x=>x.id===i);if(!k||!lcD)break;if(lcTab==='emoji'&&k.img)lcD.imgs.push(k.img);else lcD.x=(lcD.x||'')+(lcD.x&&!/\s$/.test(lcD.x)?' ':'')+k.text;lcSheet();break}
    case 'lsend':{lcSync();const v=((lcD&&lcD.x)||'').trim(),imgs=lcD?lcD.imgs.slice():[];if(!v&&!imgs.length){toast('信件還沒有內容');break}
      if(lcD&&lcD.id){const L0=S.letters.find(x=>x.id===lcD.id);if(!lcEditable(L0)){lcD=null;closeSheet();render();toast('這封信已經不能編輯了');break}L0.text=v;L0.imgs=imgs;L0.edited=1;lcD=null;save();closeSheet();render();toast('已儲存');break}
      const now=Date.now(),L={id:uid(),cid:S.cur,from:'me',t:now,text:v,imgs,reply:null,rdue:0};lcD=null;if(rnd()*100<Math.max(0,Math.min(100,+S.set.lreply||0)))L.rdue=now+lrand(S.set.lrmin,S.set.lrmax);S.letters.push(L);save();closeSheet();render();toast('信已寄出');break}
    case 'ldel':sheet('是否刪除此信件？','<button class="btn d" data-a="ldelok" data-i="'+i+'">刪除</button><button class="btn" data-a="close">取消</button>',1);break;
    case 'ldelok':S.letters=S.letters.filter(l=>l.id!==i);mailEdit=false;mailSel=[];save();closeSheet();render();break;
    case 'lrep':mailRep[i]=!mailRep[i];render();break;
    case 'medit':mailRepEdit=null;mailEdit=!mailEdit;mailSel=[];mailReplyId=null;{const st=$('#v').scrollTop;render();$('#v').scrollTop=st}break;
    case 'msel':{mailSel=mailSel.includes(i)?mailSel.filter(x=>x!==i):mailSel.concat(i);const st=$('#v').scrollTop;render();$('#v').scrollTop=st;break}
    case 'mdelsel':{if(!mailSel.length){toast('請先選擇信件');break}sheet('是否確認刪除？','<p class="hint" style="margin:0 0 4px">將刪除所選的 '+mailSel.length+' 封信件。'+(mailTab==='i'?'（收到的信裡也會一併刪除）':'')+'</p><button class="btn d" data-a="mldelok">確認刪除</button><button class="btn" data-a="close">取消</button>',1);break}
    case 'mldelok':{S.letters=S.letters.filter(l=>!mailSel.includes(l.id));mailSel=[];mailEdit=false;save();closeSheet();render();break}
    case 'lrop':{mailReplyId=i;const st=$('#v').scrollTop;render();$('#v').scrollTop=st;setTimeout(()=>{const t=$('#lrt');if(t){t.focus();t.scrollIntoView({block:'nearest'})}},0);break}
    case 'lrcancel':{mailReplyId=null;const st=$('#v').scrollTop;render();$('#v').scrollTop=st;break}
    case 'lre':{const L=S.letters.find(x=>x.id===i),r=L&&(L.replies||[])[0];if(!r)break;if(!replySameDay(r)){toast('回信只能在當天編輯');render();break}mailRepEdit=i;mailReplyId=null;mailDraft[i]=r.text;const st=$('#v').scrollTop;render();$('#v').scrollTop=st;setTimeout(()=>{const t=$('#lrt');if(t){t.focus();t.setSelectionRange(t.value.length,t.value.length)}},0);break}
    case 'lrecancel':{delete mailDraft[mailRepEdit];mailRepEdit=null;const st=$('#v').scrollTop;render();$('#v').scrollTop=st;break}
    case 'lresave':{const L=S.letters.find(x=>x.id===mailRepEdit),r=L&&(L.replies||[])[0],v=(mailDraft[mailRepEdit]||'').trim();if(!r){mailRepEdit=null;render();break}if(!replySameDay(r)){toast('已經過了當天，無法再編輯');delete mailDraft[mailRepEdit];mailRepEdit=null;render();break}if(!v){toast('回信不能是空的');break}r.text=v;r.edited=Date.now();delete mailDraft[mailRepEdit];mailRepEdit=null;save();const st=$('#v').scrollTop;render();$('#v').scrollTop=st;toast('已更新回信');break}
    case 'lrsend':{const L=S.letters.find(x=>x.id===mailReplyId),v=(mailDraft[mailReplyId]||'').trim();if(!L)break;if((L.replies||[]).length){toast('這封信已經回過了');mailReplyId=null;render();break}if(!v){toast('回信還沒有內容');break}L.replies=[{t:Date.now(),text:v}];delete mailDraft[mailReplyId];mailReplyId=null;save();const st=$('#v').scrollTop;render();$('#v').scrollTop=st;break}
    case 'lock':S.locked=!S.locked;save();render();toast(S.locked?'設定已鎖定':'設定已解除鎖定');break;
    case 'kitchen':kitchenOpen=true;kitchenSelected=[];kitchenTab='kitchen';closeSheet();render();$('#v').scrollTop=0;break;
    case 'kback':kitchenOpen=false;kitchenSelected=[];render();requestAnimationFrame(()=>perToPage2());break;
    case 'ktab':kitchenTab=['kitchen','products','recipes'].includes(i)?i:'kitchen';render();$('#v').scrollTop=0;break;
    case 'kpick':{const fridge=$('.kitchen-ingredients'),fridgeY=fridge?fridge.scrollTop:0;if(kitchenSelected.includes(i))kitchenSelected=kitchenSelected.filter(x=>x!==i);else if(kitchenSelected.length>=5){toast('一次最多放 5 種不同食材');break}else kitchenSelected.push(i);render();requestAnimationFrame(()=>{const el=$('.kitchen-ingredients');if(el)el.scrollTop=fridgeY});break}
    case 'kclear':kitchenSelected=[];render();break;
    case 'kcook':cookKitchen();break;
    case 'kstray':{const k=S.kitchen;k.products=(k.products||[]).filter(x=>x.id!==i);save();render();toast('已餵給小流浪');break}
    case 'feedopen':feedSheet();break;
    case 'feedselect':feedKitchenFood(i);break;
    case 'kitchenFromChat':tab='home';kitchenOpen=true;kitchenSelected=[];kitchenTab='kitchen';closeSheet();render();$('#v').scrollTop=0;break;
    case 'soon':toast('這個功能在後續階段製作');break;
    case 'askok':{const v=$('#ai').value.trim();const f=askCb;closeSheet();if(f&&v)f(v);break}
    case 'sback':inspEdit=false;inspSel=[];sPage=null;rQ='';render();break;
    case 'srow':sPage=i;rQ='';render();$('#v').scrollTop=0;if(sTab===0&&S.locked)toast('設定已鎖定',6000);break;
    case 'dm':delMode=!delMode;selC=[];render();break;
    case 'cs':{selC=selC.includes(i)?selC.filter(x=>x!==i):selC.concat(i);render();break}
    case 'ce':{const k=S.cards.find(x=>x.id===i);if(k)ask('編輯字卡',k.text,v=>{k.text=v;save();render()});break}
    case 'mdel':if(!selC.length){toast('請先選擇字卡');break}sheet('確認刪除','<p class="hint" style="margin:0">確定要刪除所選的 '+selC.length+' 張字卡嗎？此操作無法復原。</p><button class="btn d" data-a="mdelok">刪除</button><button class="btn" data-a="close">取消</button>',1);break;
    case 'mdelok':S.cards=S.cards.filter(k=>!selC.includes(k.id));selC=[];delMode=false;save();closeSheet();render();toast('已刪除');break;
    case 'mmov':{if(!selC.length){toast('請先選擇字卡');break}const base=(kind==='other'&&oPage)?ocats(oPage):cats(),ts=base.filter(x=>searchOn()||x.id!==selCat);if(!ts.length){toast('沒有其他分類可移動');break}sheet('移動到哪個分類',ts.map(x=>'<button class="btn" data-a="mgo" data-i="'+x.id+'">'+esc(x.name)+'</button>').join(''),1);break}
    case 'mgo':S.cards.forEach(k=>{if(selC.includes(k.id))k.cat=i});selC=[];delMode=false;save();closeSheet();render();toast('已移動');break;
    case 'ctgl':catsOpen=!catsOpen;render();break;
    case 'actgl':actsOpen=!actsOpen;render();break;
    case 'orow':cq='';oPage=i;delMode=false;selC=[];moodEditMode=false;render();$('#v').scrollTop=0;break;
    case 'today-mood-mode':moodEditMode=!moodEditMode;render();break; case 'today-mood-add':moodDraft={id:null,emoji:'',text:''};sheet('新增今日心情',todayMoodEditor());break; case 'today-mood-edit':{const m=ensureTodayMoods().find(x=>x.id===i);if(m){moodDraft={id:m.id,emoji:m.emoji,text:m.text};sheet('修改今日心情',todayMoodEditor())}break} case 'today-mood-emoji':if(moodDraft){moodDraft.text=$('#today-mood-text')?$('#today-mood-text').value:moodDraft.text;moodDraft.emoji=i;sheet(moodDraft.id?'修改今日心情':'新增今日心情',todayMoodEditor())}break; case 'today-mood-save':{const text=$('#today-mood-text')?.value.trim()||'';if(!moodDraft||!moodDraft.emoji){toast('請先選擇一個表情符號');break}if(!text){toast('請輸入心情說明');break}const moods=ensureTodayMoods();if(moodDraft.id){const m=moods.find(x=>x.id===moodDraft.id);if(m){m.emoji=moodDraft.emoji;m.text=text}}else moods.push({id:uid(),emoji:moodDraft.emoji,text,on:1});moodDraft=null;moodEditMode=false;save();closeSheet();render();toast('心情已保存');break} case 'today-mood-toggle':{const m=ensureTodayMoods().find(x=>x.id===i);if(m){m.on=m.on===0?1:0;todayMood();save();render()}break} case 'osw':S.kon[i]=S.kon[i]===0?1:0;save();render();break;
    case 'bgp':pick(f=>rd(f,900,u=>{askChange('背景圖片',i,()=>{if(i==='all')S.bgAll=u;else S.bgs[i]=u;save();render()})},'webp'));break;
    case 'bgx':askChange('背景圖片',i,()=>{if(i==='all'){S.bgAll='';S.bgs={};S.bg=''}else{delete S.bgs[i];if(i==='home')S.bg=''}save();render()},1);break;
    case 'mk':S.set.mk=i;save();render();break;
    case 'bat':{const c=S.cats.find(x=>x.id===selCat);if(!c)break;sheet('一鍵添加','<div style="position:relative"><textarea id="bt" rows="9"></textarea><div id="bph" class="phd">'+(batchCats(c)?'一行就是一個字卡\n\n【分類1】\n第一個字卡\n第二個字卡\n【分類2】\n第一個字卡':kind==='other'?'一行就是一個字卡':'添加到此分類\n一行就是一個字卡')+'</div></div><button class="btn s" data-a="bok" data-i="'+c.id+'">添加</button><button class="btn" data-a="close">取消</button>',1);break}
    case 'bok':{const c=S.cats.find(x=>x.id===i);if(!c)break;const ents=[];
      /* 分成區塊：每個【分類】一塊；分類或字卡都有編號時，依編號排序後加入 */
      const blocks=[{tg:{id:c.id},hn:null,L:[]}];
      $('#bt').value.split('\n').map(x=>x.trim()).filter(Boolean).forEach(l=>{let num='',ni=null,t=l;const m=t.match(NUMRE);if(m){ni=parseInt(m[0],10);num=ni+'.';t=t.slice(m[0].length).trim()}
        const cm=batchCats(c)&&(m?l:t).match(/^【(.+?)】$/);if(cm){let nm=cm[1].trim(),hn=null;const hm=nm.match(NUMRE);if(hm){hn=parseInt(hm[0],10);nm=nm.slice(hm[0].length).trim()}const g=S.cats.find(x=>x.sc===c.sc&&kc(x)===kc(c)&&x.own===c.own&&x.name===nm);blocks.push({tg:g?{id:g.id}:{newName:nm},hn,L:[]})}else if(t)blocks[blocks.length-1].L.push({text:t,num,ni})});
      const hb=blocks.slice(1);if(hb.length>1&&hb.every(b=>b.hn!=null)){const k=hb.map((b,ix)=>({b,ix})).sort((x,y)=>(x.b.hn-y.b.hn)||(x.ix-y.ix)).map(z=>z.b);blocks.splice(1,blocks.length-1,...k)}
      blocks.forEach(b=>{sortByNum(b.L).forEach(o=>ents.push({cat:b.tg.id||null,newName:b.tg.newName||null,text:o.text,num:o.num}))});
      if(!ents.length){toast('還沒有輸入內容');break}addEntries(ents,c);break}
    case 'dupkeep':{const d=pendDup;pendDup=null;if(d)addCommit(d.all,d.base);break}
    case 'dupcancel':pendDup=null;closeSheet();break;
    case 'duptg':{const d=pendDup;if(!d)break;const[k,w]=i.split('|'),x=d.dups[+k];if(!x)break;x.del=x.del===w?'':w;dupSheet();break}
    case 'dupdel':{const d=pendDup;pendDup=null;if(!d)break;const gone=new Set(),drop=new Set();d.dups.forEach(x=>{if(x.del==='o'){if(x.oldIds)x.oldIds.forEach(id=>gone.add(id));if(x.oe)drop.add(x.oe)}else if(x.del==='n')drop.add(x.dup)});S.cards=S.cards.filter(k=>!gone.has(k.id));addCommit(d.all.filter(e=>!drop.has(e)),d.base);break}
    case 'dl':{(async()=>{const done=busy('正在產生備份檔，請稍候⋯');try{await new Promise(r=>setTimeout(r,60));const fn='pearla-backup-'+new Date().toISOString().slice(0,10)+'.json',d=typeof claude!=='undefined'?await claude.use('downloads'):null;if(!d){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download=fn;document.body.appendChild(a);a.click();a.remove();return toast('已下載備份檔')}await d.save({filename:fn,data:JSON.stringify(S)});toast('已儲存備份檔')}catch(x){if(!x||x.code!=='declined')toast('下載失敗，請改用複製文字')}finally{done()}})();break}
    case 'fimp':pick(f=>{const r=new FileReader();r.onload=()=>impText(r.result);r.readAsText(f)},'.json,.txt,application/json,text/plain');break;
    case 'sndtest':playSnd(S.set[i]);break;
    case 'autoink':{S.set.autoInk=autoInkOn()?0:1;save();applyAutoInk();const st=$('#v').scrollTop;render();$('#v').scrollTop=st;break}
    case 'mute':{keepHomePos();S.set.muted=S.set.muted?0:1;if(S.set.muted){try{PenSound.stop()}catch(e){}try{if(vAud)vAud.pause()}catch(e){}try{if(recPrev)recPrev.pause()}catch(e){}}save();render();toast(S.set.muted?'已關閉所有聲音':'已打開所有聲音',1600);break}
    case 'dark':keepHomePos();toggleDark();break;
    case 'sw':S.set[i]=S.set[i]?0:1;if(i==='lpOn'&&window.LPE)LPE.toggled(S.set.lpOn);if(i==='aon')resetA();else save();render();break;
    case 'help':sheet('回覆設置說明','<div style="font-size:calc(14px*var(--fz,1));line-height:1.9"><p style="margin:0 0 8px"><b>回覆條數</b>：這一輪對方會發幾則訊息（在「條數最少～最多」之間隨機）。</p><p style="margin:0 0 8px"><b>一條回覆裡的字卡</b>：每一則訊息裡放幾張字卡併在一起（在「最少～最多」之間隨機）。</p><p style="margin:0 0 8px">例如：回覆條數 2、一條裡 3 張字卡，對方就會發 2 則訊息，每則由 3 張字卡組成。</p><p style="margin:0 0 8px"><b>時間</b>：回覆（或主動發送）的時間，會在「最短～最長」之間隨機。</p><p style="margin:0"><b>機率</b>：已讀不回、拍一拍、表情包每一輪各擲一次；引用消息、情緒標籤以外的標籤、emoji、顏文字則是每則訊息各擲一次（情緒標籤一輪最多出現一次）；一條回覆全部抽完後，等 3 秒才換下一條，字卡一律從字卡抽取。</p></div>',1);break;
    case 'shelp':{const r=SETS.flatMap(t=>t[1]).find(x=>x[2]===i);sheet(r[0],'<p class="hint" style="margin:0">'+esc(r[1])+'</p>',1);break}
    case 'stab':sTab=+i;sQ='';sPage=null;render();break;
    case 'ren':break;
    case 'up':{const k=S.contacts.findIndex(x=>x.id===cid);if(k>0){[S.contacts[k-1],S.contacts[k]]=[S.contacts[k],S.contacts[k-1]];save();render()}break}
    case 'addc':{const id=uid();S.contacts.push({id,name:'名字'});save();render();setTimeout(()=>{const el=document.querySelector('[data-c="'+id+'"] .nm');if(el){el.scrollIntoView({block:'nearest'});el.focus();const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const g=getSelection();g.removeAllRanges();g.addRange(r)}},0);break}
    case 'addcok':{const n=$('#newContactName')?.value.trim();if(!n){toast('請輸入聯絡人名字');$('#newContactName')?.focus();break}S.contacts.push({id:uid(),name:n});addContact=false;save();render();break}
    case 'addccancel':addContact=false;render();break;
    case 'del':{const c=S.contacts.find(x=>x.id===cid);sheet('刪除聯絡人','<p class="hint" style="margin:0">將刪除「'+esc(c.name)+'」與其聊天紀錄。建議先備份。</p><button class="btn" data-a="bak">先去備份</button><button class="btn d" data-a="delok" data-i="'+c.id+'">永久刪除</button><button class="btn" data-a="close">取消</button>',1);break}
    case 'delok':{S.contacts=S.contacts.filter(c=>c.id!==i);if(S.cuse)delete S.cuse[i];if(S.cset)delete S.cset[i];delete S.msgs[i];delete S.rounds[i];(S.groups||[]).forEach(g=>{g.members=g.members.filter(x=>x!==i)});Object.keys(S.rounds).forEach(k=>{if(k.endsWith('|'+i))delete S.rounds[k]});S.letters=(S.letters||[]).filter(l=>l.cid!==i);delete S.lnext[i];if(S.lround)delete S.lround[i];delete S.remClock[i];delete S.un[i];if(S.dlog)delete S.dlog[i];{const dead=S.cats.filter(c=>c.own===i).map(c=>c.id);S.cats=S.cats.filter(c=>c.own!==i);S.cards=S.cards.filter(k=>!dead.includes(k.cat))}S.cats.forEach(c=>c.as=c.as.filter(x=>x!==i));S.ipend=(S.ipend||[]).filter(p=>p.cid!==i);['mem','ext','ev'].forEach(k=>{S.insp[k]=(S.insp[k]||[]).filter(r=>r.cid!==i)});if(!S.contacts.length)S.contacts.push({id:uid(),name:'名字'});if(S.cur===i)S.cur=S.contacts[0].id;save();closeSheet();render();break}
    case 'pat':closeSheet();ms(S.cur).push(patMsg(S.cur,true));save();paint();break;
    case 'poke':pokeSend();break;
    case 'chpic':pick(fs=>{let n=0;const out=[];fs.forEach((f,j)=>rd(f,1400,u=>{out[j]=u;if(++n===fs.length){chImgsCid=S.cur;out.forEach(x=>x&&chImgs.push(x));chPvRefresh()}}))},'image/*',true);break;
    case 'chpicx':chImgs.splice(+i,1);chPvRefresh();break;
    case 'avcard':{const id=i||S.cur;if(S.contacts.some(c=>c.id===id))conInfoSheet(id);break}
    case 'pokebtn':{const n=Date.now();if(pokeArm&&n-pokeArm<3000){pokeArm=0;A.classList.remove('rec-on');pokeSend()}else{pokeArm=n;A.classList.add('rec-on');toast('再點一次，讓對方主動發訊息',1800);setTimeout(()=>{if(pokeArm===n){pokeArm=0;A.classList.remove('rec-on')}},3000)}break}
    case 'avt':pick(f=>avCrop(f,i));break;
    case 'avok':{const a=avcS;if(!a)break;const bk=a.back;const c=document.createElement('canvas'),O=256,r=O/a.P;c.width=c.height=O;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,O,O);x.drawImage(a.im,a.ox*r,a.oy*r,a.im.width*a.k*r,a.im.height*a.k*r);const u=c.toDataURL('image/jpeg',.9);if(bk){const me=avScope==='me',ct=cur(),list=me?(S.meAvs=S.meAvs||[]):(ct.avs=ct.avs||[]);list.push(u);try{URL.revokeObjectURL(a.url)}catch(e){}avcS=null;if(bk.rest.length)avCrop(bk.rest[0],'bk',{n:bk.n,i:bk.i+1,rest:bk.rest.slice(1)});else{save();avSheet()}break}if(a.id==='me'){S.meAv=u;(S.meAvs=S.meAvs||[]).push(u)}else{const ct=S.contacts.find(z=>z.id===a.id)||(S.groups||[]).find(z=>z.id===a.id);if(ct){ct.av=u;if(S.contacts.includes(ct))(ct.avs=ct.avs||[]).push(u)}}try{URL.revokeObjectURL(a.url)}catch(e){}avcS=null;save();closeSheet();render();if(gEditId&&a.id===gEditId&&(S.groups||[]).some(g=>g.id===gEditId))gsheet(gEditId);break}
    
    
    case 'theme':{const k=validTheme(i);if(curTheme()===k)break;pickTheme(k);break}
    case 'tone':{const t=THEME_DEFS.journal.tones.some(x=>x[0]===i)?i:'blue';if(curTheme()==='journal'){S.jtone=t;S.ink='';S.line='';applyTheme();save();render();break}pickTheme('journal',t);break}
    case 'punadd':{const t=($('#punt')||{}).value.trim(),w=parseFloat(($('#punw')||{}).value);if(!t){toast('請輸入標點符號');break}const l=ensurePunct();if(l.some(p=>p.t===t)){toast('已經有這個標點了');break}l.push({t,w:isNaN(w)?10:Math.max(0,w)});save();const y=$('#v').scrollTop;render();$('#v').scrollTop=y;break}
    case 'pundel':{const l=ensurePunct();l.splice(+i,1);save();const y=$('#v').scrollTop;render();$('#v').scrollTop=y;break}
    case 'ctone':{const T=THEME_DEFS.cat.tones,t=T.some(x=>x[0]===i)?i:T[0][0];if(curTheme()==='cat'){S.dmPrev=null;S.jtone=t;S.ink='';S.line='';applyTheme();save();render();break}pickTheme('cat',t);break}
    case 'thmoon':{const th=validTheme(i),cur=darkKey(th),nm=(THEMES.find(t=>t[0]===th)||[])[1]||'';sheet('深色模式（'+esc(nm)+'）','<p class="hint" style="margin:0 0 10px">在主頁按右上角的月亮時，「'+esc(nm)+'」會切換成下面選的深色模式。</p>'+DARKS.map(d=>'<button type="button" class="btn font-opt'+(d[0]===cur?' on':'')+'" data-a="thmoonpick" data-i="'+th+'|'+d[0]+'">'+d[1]+'</button>').join('')+'<button class="btn" data-a="close">關閉</button>',1);break}
    case 'thmoonpick':{const [th,k]=i.split('|');if(!DARKS.some(d=>d[0]===k)||!THEME_DEFS[th])break;S.darkPick=S.darkPick||{};S.darkPick[th]=k;save();thmoonRefresh(th);break}
    case 'tcx':askChange('字體','all',()=>{S.ink='';applyTheme();save();render()},1);break;
    case 'scx':askChange('字體陰影','all',()=>{S.shadow='';applyTheme();save();render()},1);break;
    case 'lcx':askChange('外框顏色','all',()=>{S.line='';document.documentElement.style.removeProperty('--line');save();render()},1);break;
    case 'markColorReset':S.set.starColor=S.ink||'#5f5b8d';save();render();break;
    case 'bgcx':askChange('背景顏色',i,()=>{S.bgColors=S.bgColors||{};if(i==='all')S.bgColors={};else delete S.bgColors[i];save();render()},1);break;
    case 'mt':mTab=i;moreSheet();break;
    case 'patopen':pScope='s';patSheet();break;
    case 'psc':pScope=i;patSheet();break;
    case 'pgo':{const k=S.cards.find(x=>x.id===i);if(k){ms(S.cur).push(patMsg(S.cur,true,k.text));save();closeSheet();paint()}break}
    case 'psd':{const v=$('#pt').value.trim();if(v){ms(S.cur).push(patMsg(S.cur,true,v));save();closeSheet();paint()}break}
    case 'psv':{const v=(parseCardLines($('#pt').value)[0]||{}).text;if(!v)break;let g=S.cats.find(c=>kc(c)==='pat'&&c.sc===pScope);if(!g){g={id:uid(),sc:pScope,kind:'pat',name:'預設',on:1,as:pScope==='e'?[S.cur]:[]};S.cats.push(g)}S.cards.push({id:uid(),cat:g.id,text:v,on:1});save();patSheet();toast('已存入拍一拍');break}
    case 'mictest':micTest();break;
    case 'micretry':{closeSheet();micAsk().then(st=>{if(st){st.getTracks().forEach(t=>t.stop());window.__micOK=1;toast('已取得麥克風權限，可以錄音了',2200)}});break}
    case 'vrec':recToggle();break; case 'recgo':recStart();break; case 'recstop':recStop();break; case 'recplay':recPreview();break; case 'recdel':recClear(true);recUI();break; case 'vplay':vPlay(i,A,S.cur);break;
    case 'qa':toast('問答功能待設計');break;
    case 'more':mTab='interact';moreSheet();break;
    case 'scsw':{if(scope!==i){scope=i;selCat=null;delMode=false;selC=[];cq='';render();break}const ct=cur();ct.scOff=ct.scOff||{};const k=kind+':'+i;ct.scOff[k]=ct.scOff[k]?0:1;save();render();break}
    case 'tobot':{const l=$('#cl');if(l)l.scrollTo({top:l.scrollHeight,behavior:'smooth'});break}
    case 'lstar':{const L=S.letters.find(x=>x.id===i);if(L){L.star=!L.star;save();A.textContent=L.star?'★':'☆';A.classList.toggle('on',!!L.star)}break}
    case 'ek':{const k=S.cards.find(x=>x.id===i),inp=$('#in');if(k&&inp){recEmoPush(k.id);inp.value=(inp.value||'')+(k.text||'');closeSheet();inp.focus();try{inp.setSelectionRange(inp.value.length,inp.value.length)}catch(x){}}break}
    case 'cdnd':{const c=S.contacts.find(x=>x.id===i);if(!c)break;c.dnd=c.dnd?0:1;if(c.dnd){delete S.rounds[c.id];Object.keys(S.rounds).forEach(k=>{if(k.endsWith('|'+c.id))delete S.rounds[k]});S.ipend=(S.ipend||[]).filter(p=>p.cid!==c.id);delete typingQ[c.id]}save();const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y;toast(c.dnd?c.name+' 已開啟免打擾，所有功能暫停':c.name+' 已關閉免打擾，功能恢復',2400);break}
    case 'cinfo':conInfoSheet(i);break;
    case 'cicover':{const c=S.contacts.find(x=>x.id===i);if(!c)break;pick(f=>coverCrop(f,c.id));break}
    case 'cicropok':ciCropDone();break;
    case 'cicropx':ciCrop=null;conInfoSheet(i);break;
    case 'cigear':ciSettings(i);break;
    case 'ciback':conInfoSheet(i);break;
    case 'cireset':{const[cid,k]=i.split('|'),c=S.contacts.find(x=>x.id===cid);if(c&&c.ci){delete c.ci[k];save()}ciSettings(cid);break}
    case 'ciclrcard':sheet('是否確認清除字卡排名？','<p class="hint" style="margin:0 0 8px">會清除這位聯絡人的字卡使用次數，之後重新計算，字卡本身不受影響。</p><div class="confirm-btns"><button class="btn" data-a="cigear" data-i="'+i+'">取消</button><button class="btn d" data-a="ciclrcardok" data-i="'+i+'">確認清除</button></div>',1);{const id=i;sheetBack=()=>ciSettings(id)}break;
    case 'ciclrcardok':{if(S.cuse)S.cuse[i]={};save();ciSettings(i);toast('已清除字卡排名');break}
    case 'ciclremo':sheet('是否確認清除表情包排名？','<p class="hint" style="margin:0 0 8px">排名會從現在開始重新計算，聊天紀錄與表情包不受影響。</p><div class="confirm-btns"><button class="btn" data-a="cigear" data-i="'+i+'">取消</button><button class="btn d" data-a="ciclremook" data-i="'+i+'">確認清除</button></div>',1);{const id=i;sheetBack=()=>ciSettings(id)}break;
    case 'ciclremook':{const c=S.contacts.find(x=>x.id===i);if(c){c.eclr=Date.now();save()}ciSettings(i);toast('已清除表情包排名');break}
    case 'cicdel':{const c=S.contacts.find(x=>x.id===i);if(!c)break;c.cover='';save();conInfoSheet(c.id);break}
    case 'cstar':{const c=S.contacts.find(x=>x.id===i);if(!c)break;c.star=!c.star;save();A.textContent=c.star?'★':'☆';A.classList.toggle('on',!!c.star);if(c.star)toast('標記為重要聯絡人',5000);break}
    case 'redit':{recEdit=!recEdit;recSel=[];const st=$('#v').scrollTop;render();$('#v').scrollTop=st;break}
    case 'qsel':{recSel=recSel.includes(i)?recSel.filter(x=>x!==i):recSel.concat(i);const st=$('#v').scrollTop;render();$('#v').scrollTop=st;break}
    case 'qdelsel':{if(!recSel.length){toast('請先選擇紀錄');break}sheet('是否確認刪除？','<p class="hint" style="margin:0 0 4px">將刪除所選的 '+recSel.length+' 筆問答紀錄。</p><button class="btn d" data-a="qdelok">確認刪除</button><button class="btn" data-a="close">取消</button>',1);break}
    case 'rcsel':{recSel=recSel.includes(i)?recSel.filter(x=>x!==i):recSel.concat(i);const st=$('#v').scrollTop;render();$('#v').scrollTop=st;break}
    case 'rdelsel':{if(!recSel.length){toast('請先選擇錄音');break}sheet('是否確認刪除？','<p class="hint" style="margin:0 0 4px">將刪除所選的 '+recSel.length+' 則錄音。聊天室裡的該則訊息會只剩下「語音」兩個字。</p><button class="btn d" data-a="rdelok">確認刪除</button><button class="btn" data-a="close">取消</button>',1);break}
    case 'rdelok':{recDelKeys(recSel);recSel=[];recEdit=false;save();closeSheet();render();break}
    case 'rcplay':{const [c1,m1]=i.split(':');vPlay(m1,A,c1);break}
    case 'rcopen':rcState={busy:false,prog:'',res:null};rcSheet();break;
    case 'rcgo':rcRun();break;
    case 'qdelok':{S.qlog=S.qlog.filter(x=>!recSel.includes(x.id));recSel=[];recEdit=false;save();closeSheet();render();break}
    case 'memo':sheet('備忘錄','<textarea id="memoin" rows="10" placeholder="寫下備忘…&#10;每一行對應卡片上的一行">'+esc(S.memo||'')+'</textarea><p class="hint" style="margin:6px 0 0">每一行對應卡片上的一行；太長會自動換到下一行，放不下時最後一行會顯示⋯⋯</p><button class="btn s" data-a="close">完成</button>',1);break;
    case 'bcok':{const f=pendingChange;pendingChange=null;closeSheet();if(f)f();break}
    case 'pickc':{const [t,k]=i.split(':'),c0=t==='tc'?(S.ink||themeInk()):t==='sc'?(S.shadow||themeShadow()):t==='lc'?(S.line||themeLine()):((S.bgColors&&S.bgColors[k])||'#f6f2ff'),[h,sa,v]=rgb2hsv(hex2rgb(c0)||[246,242,255]);cpk={t,k,h,s:sa,v,orig:c0,hex:c0,drag:null};colorSheet();break}
    case 'cppre':cpSet(i);break;
    case 'cpok':{const hx=cpk.hex,t=cpk.t,k=cpk.k;cpk=null;
      if(t==='tc')askChange('字體','all',()=>{S.ink=hx;applyTheme();save();render()});
      else if(t==='sc')askChange('字體陰影','all',()=>{S.shadow=hx;applyTheme();save();render()});
      else if(t==='lc')askChange('外框顏色','all',()=>{S.line=hx;document.documentElement.style.setProperty('--line',hx);save();render()});
      else askChange('背景顏色',k,()=>{S.bgColors=S.bgColors||{};S.bgColors[k]=hx;save();render()});break}
    case 'qn':surveySheet();break;
    case 'askopen':qaTab='single';qaAdd=null;qaEditMode=false;qcSel=null;qcSels=[];qaConfirm=null;askSheet();break;
    case 'qtab':qaTab=i;qcSel=null;qcSels=[];qaConfirm=null;qaAdd=null;qaEditMode=false;askSheet();break;
    case 'qsend':{const q=(qd.q||'').trim();if(!q){toast('請輸入問題');break}
      if(qaTab==='text'){const T=S.qa.text,lo=Math.min(T.tmin,T.tmax),hi=Math.max(T.tmin,T.tmax);qaSend({t:'text',q,o:[],time:lo+rnd()*(hi-lo)})}
      else{const o=optsOf(qd.o);if(!o.length){toast('請輸入答案選項');break}qaSend({t:qaTab,q,o,time:S.qa[qaTab].time,mx:qaTab==='multi'?(S.qa.multi.capOn?S.qa.multi.max:0):0})}
      break}
    case 'qcap':S.qa.multi.capOn=!S.qa.multi.capOn;save();askSheet(1);break;
    case 'qclr':{qd[i]='';const ta=document.querySelector('[data-qd="'+i+'"]');if(ta){ta.value='';ta.focus()}break}
    case 'svsend':{const qs=parseSurvey(qd.sv);if(!qs.length){toast('請依格式輸入：每個問題前面要加 /');break}const bad=qs.findIndex(x=>!x.o.length);if(bad>=0){toast('第 '+(bad+1)+' 題還沒有答案選項');break}const V=S.qa.survey;qaSend({t:'survey',q:qs[0].q+(qs.length>1?'⋯（共 '+qs.length+' 題）':''),qs,tmin:V.tmin,tmax:V.tmax});break}
    case 'qcadd':qd.aq='';qd.ao='';qaAdd=true;askSheet(1);break;
    case 'qcedit':qaEditMode=!qaEditMode;qcSel=null;qcSels=[];askSheet(1);break;
    case 'qcpick':qcSel=qcSel===i?null:i;askSheet(1);break;
    case 'qcsel':qcSels=qcSels.includes(i)?qcSels.filter(x=>x!==i):qcSels.concat(i);askSheet(1);break;
    case 'qcmod':{const c=S.qa.cards.find(x=>x.id===i);if(c){qd.aq=c.q;qd.ao=c.o.join('\n');qaAdd=c.id}askSheet(1);break}
    case 'qcdelsel':{if(!qcSels.length){toast('請先選擇問題卡');break}qaConfirm={ids:qcSels.slice()};askSheet(1);break}
    case 'qcfno':qaConfirm=null;askSheet(1);break;
    case 'qcfok':{const ids=qaConfirm?qaConfirm.ids:[];S.qa.cards=S.qa.cards.filter(c=>!ids.includes(c.id));if(ids.includes(qcSel))qcSel=null;qcSels=[];qaConfirm=null;qaEditMode=false;save();askSheet(1);break}
    case 'qcm':{const c=S.qa.cards.find(x=>x.id===i);if(c){c.multi=!c.multi;save()}askSheet(1);break}
    case 'qcdel':qaConfirm={ids:[i]};askSheet(1);break;
    case 'qcok':{const q=(qd.aq||'').trim(),o=optsOf(qd.ao);if(!q){toast('請輸入問題');break}if(!o.length){toast('請輸入答案選項');break}
      if(qaAdd&&qaAdd!==true){const c=S.qa.cards.find(x=>x.id===qaAdd);if(c){c.q=q;c.o=o}}else S.qa.cards.push({id:uid(),q,o,multi:false});
      qaAdd=null;save();askSheet(1);break}
    case 'qcsend':{const c=S.qa.cards.find(x=>x.id===i);if(!c)break;qaSend({t:c.multi?'multi':'single',src:'card',q:c.q,o:c.o.slice(),time:S.qa.card.time,mx:0});qcSel=null;break}
    case 'emo':emoSheet();break;
    case 'esw':emoScope=i;emoCat=null;emoSheet();break; case 'ecsw':emoCat=i;emoSheet();break;
    case 'ecj':{const h=document.getElementById('eh-'+i),bx=document.querySelector('#sh .box');if(h&&bx){const st=bx.querySelector('.chat-pop-cats');bx.scrollTo({top:h.offsetTop-(st?st.offsetHeight:0)-8,behavior:'smooth'})}break}
    case 'avopen':avScope='ta';avSheet();break;
    case 'avsc':avScope=i;avSheet();break;
    case 'avadd':pick(fs=>{fs=[].slice.call(fs);if(fs.length)avMulti(fs)},'image/*',true);break;
    case 'avprev':avMGo(-1);break;
    case 'avnext':avMGo(1);break;
    case 'avcancel':{if(!avM)break;avMStash();sheet('這次操作不儲存','<p class="hint" style="margin:0 0 6px">取消後，這次選的頭像都不會儲存。</p><div class="confirm-btns"><button class="btn" data-a="avback">回去繼續</button><button class="btn d" data-a="avcancelok">確定不儲存</button></div>',1);break}
    case 'avback':avMShow();break;
    case 'avcancelok':avMFree();avSheet();break;
    case 'avskip':{if(!avM)break;avMStash();sheet('不要這張？','<p class="hint" style="margin:0 0 6px">這張不會儲存。</p><div class="confirm-btns"><button class="btn" data-a="avback">回去</button><button class="btn s" data-a="avskipok">不要這張</button></div>',1);break}
    case 'avskipok':{if(!avM)break;avM.items[avM.idx].drop=1;const k=avMKeep();if(!k.length){avMFree();avSheet();toast('沒有要儲存的頭像');break}let n=avM.idx;while(n<avM.items.length&&avM.items[n].drop)n++;if(n>=avM.items.length){n=avM.idx;while(n>=0&&avM.items[n].drop)n--}avM.idx=n;avMShow();break}
    case 'avsaveall':avMSave();break;
    case 'avcx':{const a=avcS;if(a){try{URL.revokeObjectURL(a.url)}catch(e){}}avcS=null;save();avSheet();break}
    case 'avuse':{const me=avScope==='me',ct=cur(),list=me?(S.meAvs||[]):(ct.avs||[]),u=list[+i];if(!u)break;if(me)S.meAv=u;else ct.av=u;save();render();avSheet();toast('已更換頭像');break}
    case 'avdel':{const me=avScope==='me',ct=cur(),list=me?(S.meAvs||[]):(ct.avs||[]);list.splice(+i,1);save();avSheet();break}
    case 'es':{const k=S.cards.find(x=>x.id===i);if(k){recEmoPush(k.id);myMsg({id:uid(),f:'me',x:k.text||'',img:k.img,t:Date.now()});schedule(S.cur,k.text||'[表情包]');save();closeSheet();paint()}break}
    case 'srch':{chS.open=chS.open?0:1;const h=$('.chh');if(h){const o=h.querySelector('.chs-pop');if(o)o.remove();if(chS.open)h.insertAdjacentHTML('beforeend',chSrchHtml());const sb=h.querySelector('[data-a=srch]');if(sb)sb.classList.toggle('rec-on',!!chS.open)}break}
    case 'sgo':{const d=$('#sd').value,k=$('#sk').value.trim();const m=ms(S.cur).find(x=>(!d||new Date(x.t).toLocaleDateString('sv')===d)&&(!k||(x.x||'').includes(k)));if(!m)toast('沒有符合的訊息');else{jump=m.id;closeSheet();paint()}break}
    case 'cimg':pick(fs=>{let d=0;fs.forEach(f=>rdSquare(f,900,u=>{if(selCat)S.cards.push({id:uid(),cat:selCat,text:'',img:u,on:1});if(++d===fs.length){save();render()}}))},'image/*',true);break;
    case 'kind':{const was=INS(kind);if(i==='insp'){if(!was)kind='mem';scope='e'}else{kind=i;if(was||(i!=='pat'&&scope==='m'))scope='s';if(i==='card')scope='e'}selCat=null;delMode=false;selC=[];oPage=null;cq='';render();break}
    case 'fv':{const m=ms(S.cur).find(x=>x.id===i);if(m){m.fav=!m.fav;save();A.classList.toggle('f',!!m.fav);A.textContent=m.fav?'★':'☆'}break}
    case 'qt':{const m=ms(S.cur).find(x=>x.id===i);if(m){qtDraft={cid:S.cur,id:m.id,x:m.x||(m.audio?'[語音]':(m.img?'':'[表情包]')),img:m.img||''};qtBar();const l=$('#cl');if(l)l.scrollTop=l.scrollHeight;const inp=$('#in');if(inp)inp.focus()}break}
    case 'medt':{const m=ms(S.cur).find(x=>x.id===i);if(m&&m.f==='me'&&!m.img)ask('編輯訊息',m.x||'',v=>{const old=m.x;['mem','ext','ev'].forEach(k=>(S.insp[k]||[]).forEach(r=>{if(r.sid===m.id||(!r.sid&&r.mt===m.t&&r.src===old))r.edited=1}));m.x=v;m.edited=1;save();paint()});break}
    case 'mdelm':sheet('刪除訊息','<p class="hint" style="margin:0">是否刪除這則訊息？</p><button class="btn d" data-a="mdelmok" data-i="'+i+'">刪除</button><button class="btn" data-a="close">取消</button>',1);break;
    case 'mdelmok':{const a=ms(S.cur),k=a.findIndex(x=>x.id===i);if(k>=0&&a[k].f==='me'){a.splice(k,1);if(qtDraft&&qtDraft.id===i){qtDraft=null;qtBar()}save()}closeSheet();paint();break}
    case 'qtx':qtDraft=null;qtBar();break;
    case 'unf':{const [c,m,k]=i.split(':');const x=(S.msgs[c]||[]).find(y=>y.id===m);if(x){x[k]=!x[k];save();A.textContent=x[k]?'★':'☆'}break}
    case 'rec':recOpen=true;recEdit=false;recSel=[];recPage='qa';recSeen={};render();$('#v').scrollTop=0;break;
    case 'rback':recOpen=false;recEdit=false;recSel=[];recSeen={};render();break;
    case 'rpage':recPage=i;recEdit=false;recSel=[];render();$('#v').scrollTop=0;break;
    case 'rpback':recPage=null;render();break;
    case 'rfs':recFav=i;recSel=[];render();break;
    case 'fsel':{recSel=recSel.includes(i)?recSel.filter(x=>x!==i):recSel.concat(i);const st=$('#v').scrollTop;render();$('#v').scrollTop=st;break}
    case 'funsel':{if(!recSel.length){toast('請先選擇訊息');break}recSel.forEach(k=>{const [c,m,kk]=k.split(':'),x=(S.msgs[c]||[]).find(y=>y.id===m);if(x)x[kk]=false});recSel=[];recEdit=false;save();render();toast('已取消收藏');break}
    case 'scope':scope=i;selCat=null;delMode=false;selC=[];cq='';render();break;
    case 'cat':selCat=i;delMode=false;selC=[];render();break;
    case 'bigtog':bigOpen=bigOpen===i?null:i;selCat=null;delMode=false;selC=[];cq='';render();break;
    case 'bigren':{const b=bigsAll().find(x=>x.id===i);if(!b||b.un)break;sheet('編輯大分類名稱','<input id="ai" value="'+esc(b.name||'')+'" placeholder="無分類名"><button class="btn s" data-a="bigrenok" data-i="'+i+'">確定</button><button class="btn" data-a="close">取消</button>',1);break}
    case 'bigrenok':{const b=bigsAll().find(x=>x.id===i),v=($('#ai')||{}).value||'';closeSheet();if(b&&!b.un){b.name=v.trim();save();render()}break}
    case 'bignew':ask('新增大分類名稱','',v=>{const n={id:uid(),sc:scope,own:scope==='e'?S.cur:undefined,name:v};bigsAll().push(n);bigOpen=n.id;selCat=null;save();render()});break;
    case 'bigdel':{const b=bigsAll().find(x=>x.id===i);if(!b||b.un)break;bigDelAll=true;bigDelSheet(i);break}
    case 'bigclr':{const b=bigsAll().find(x=>x.id===i);if(!b||!b.un)break;sheet('是否確認清空【'+esc(bigName(b))+'】？','<p class="hint" style="margin:0 0 4px">會清空裡面所有的分類和字卡，無法復原。</p><div class="confirm-btns"><button class="btn" data-a="close">取消</button><button class="btn d" data-a="bigclrok" data-i="'+i+'">確認清空</button></div>',1);break}
    case 'bigclrok':{closeSheet();const b=bigsAll().find(x=>x.id===i);if(!b||!b.un)break;const sm=S.cats.filter(x=>x.sc===scope&&kc(x)==='card'&&(scope!=='e'||x.own===S.cur)&&bigOf(x)===b.id),ids=new Set(sm.map(x=>x.id));S.cards=S.cards.filter(k=>!ids.has(k.cat));S.cats=S.cats.filter(c=>!ids.has(c.id));selCat=null;delMode=false;selC=[];if(bigOpen===i)bigOpen=null;save();render();toast('已清空');break}
    case 'bigoff':{const sm=S.cats.filter(x=>x.sc===scope&&kc(x)==='card'&&(scope!=='e'||x.own===S.cur)&&bigOf(x)===i),b=bigsAll().find(x=>x.id===i);if(!b)break;if(!sm.length){toast('這個大分類還沒有小分類');break}const anyOn=sm.some(x=>x.on);sm.forEach(x=>{x.on=anyOn?0:1});save();render();toast(anyOn?'已停用「'+bigName(b)+'」裡的小分類':'已啟用「'+bigName(b)+'」裡的小分類');break}
    case 'bigdsw':{bigDelAll=!bigDelAll;bigDelSheet(i);break}
    case 'bigdelok':{closeSheet();const b=bigsAll().find(x=>x.id===i);if(!b||b.un)break;const ids=S.cats.filter(c=>c.big===b.id&&!c.un).map(c=>c.id);if(bigDelAll){S.cards=S.cards.filter(k=>!ids.includes(k.cat));S.cats=S.cats.filter(c=>!ids.includes(c.id))}else S.cats.forEach(c=>{if(c.big===b.id)delete c.big});S.bigs=S.bigs.filter(x=>x.id!==b.id);bigOpen=null;selCat=null;delMode=false;selC=[];save();render();toast(bigDelAll?'已刪除大分類和裡面的內容':'已刪除，小分類與字卡移到「未分類」');break}
    case 'bigbat':{sheet('一鍵添加','<p class="hint" style="margin:0 0 8px">一行就是一個字卡。填入已有的分類名會自動歸入；沒有分類的字卡會放到【未分類/未分類】。</p><textarea id="bbt" rows="10" placeholder="一行就是一個字卡&#10;&#10;【大分類名/小分類名】&#10;字卡1&#10;字卡2&#10;&#10;【小分類名】&#10;字卡1&#10;字卡2"></textarea><button class="btn s" data-a="bigbatok">添加</button><button class="btn" data-a="close">取消</button>',1);break}
    case 'bigbatok':{const t=($('#bbt')||{}).value||'';if(!t.trim()){toast('還沒有內容');break}const r=bigBatch(t);closeSheet();save();render();toast(r.n?'已添加 '+r.n+' 條'+(r.dup?'，略過重複 '+r.dup+' 條':''):'沒有新增（全部重複）');break}
    case 'cmvb':{const x=S.cats.find(c=>c.id===i);if(!x)break;const ts=bigList().filter(b=>b.id!==bigOf(x));if(!ts.length){toast('沒有其他大分類可以移動');break}sheet('「'+esc(x.name)+'」移到哪個大分類',ts.map(b=>'<button class="btn" data-a="cmvbok" data-i="'+i+'|'+b.id+'" style="width:100%;margin-bottom:8px">'+esc(bigName(b))+'</button>').join('')+'<button class="btn" data-a="cedit" style="width:100%">返回</button>',1);break}
    case 'cmvbok':{const [cid,bid]=String(i).split('|'),x=S.cats.find(c=>c.id===cid),b=bigsAll().find(z=>z.id===bid);if(!x||!b)break;if(b.un)delete x.big;else x.big=b.id;if(selCat===cid)selCat=null;save();render();catEditSheet();toast('已移動');break}
    case 'ocat':selCat=i;delMode=false;selC=[];render();break;
    case 'ocgl':catsOpen=!catsOpen;render();break;
    case 'ikind':kind=i;scope='e';selCat=null;delMode=false;selC=[];cq='';render();break;
    case 'isw':{if(kind!==i){kind=i;selCat=null;delMode=false;selC=[];cq='';render();break}const ct=cur();ct.scOff=ct.scOff||{};const k=i+':e';ct.scOff[k]=ct.scOff[k]?0:1;save();render();break}
    case 'sall':{const st=$('#v').scrollTop,tg=(arr,ids)=>{const all=ids.length&&ids.every(x=>arr.includes(x));return all?arr.filter(x=>!ids.includes(x)):[...new Set(arr.concat(ids))]};
      if(i==='c')selC=tg(selC,cardSelIds());else if(i==='mail')mailSel=tg(mailSel,mailIds());else if(i==='qa')recSel=tg(recSel,(S.qlog||[]).map(x=>x.id));else if(i==='fav')recSel=tg(recSel,recAllKeys);else if(i==='rc')recSel=tg(recSel,recList().map(([c,m])=>c.id+':'+m.id));else if(i==='pl')recSel=tg(recSel,(S.plum||[]).map(x=>x.id));else if(i==='bk')recSel=tg(recSel,(S.book||[]).map(x=>x.id));else if(i==='ins')inspSel=tg(inspSel,inspRows().map(r=>r.id));else if(i==='fnt')fntSel=tg(fntSel,fntList.map(x=>x.id));else if(i==='cvr')remSel=tg(remSel,(S.rems||[]).map(r=>r.id));else if(i==='cve')evSel=tg(evSel,(S.evlog||[]).map(e=>e.id));else if(i==='qc'){qcSels=tg(qcSels,((S.qa&&S.qa.cards)||[]).map(c=>c.id));askSheet(1);break}
      render();$('#v').scrollTop=st;break}
    case 'grp':{const d=S.gdef&&grp(S.gdef);grpOpen=true;grpRoom=d?d.id:null;if(d)S.un[d.id]=0;render();$('#v').scrollTop=0;break}
    case 'grpback':{if(grpRoom)grpRoom=null;else grpOpen=false;render();break}
    case 'gopen':{grpRoom=i;S.un[i]=0;save();render();break}
    case 'gadd':{const g={id:uid(),name:gDefName(),av:'',members:[]};S.groups.push(g);save();render();gsheet(g.id);break}
    case 'gedit':gsheet(i);break;
    case 'gmem':{const g=grp(gEditId);if(!g)break;const on=g.members.includes(i);g.members=on?g.members.filter(x=>x!==i):g.members.concat(i);A.classList.toggle('sel',!on);const ck=A.querySelector('.ck');if(ck)ck.classList.toggle('on',!on);save();break}
    case 'gdone':{const g=grp(gEditId);if(g)g.name=(g.name||'').trim()||gDefName(g.id);save();closeSheet();render();break}
    case 'gdef':{S.gdef=S.gdef===i?'':i;save();render();toast(S.gdef?'已設為預設群聊，點主頁「群聊」會直接進入':'已取消預設群聊');break}
    case 'gdel':{const g=grp(i);if(!g)break;sheet('是否確認刪除【'+esc(g.name)+'】？','<p class="hint" style="margin:0 0 4px">群聊的聊天紀錄也會一起刪除，聯絡人本身不受影響。</p><div class="confirm-btns"><button class="btn" data-a="gedit" data-i="'+g.id+'">取消</button><button class="btn d" data-a="gdelok" data-i="'+g.id+'">確認刪除</button></div>',1);break}
    case 'gdelok':{S.groups=S.groups.filter(g=>g.id!==i);delete S.msgs[i];delete S.un[i];Object.keys(S.rounds).forEach(k=>{if(k.startsWith(i+'|'))delete S.rounds[k]});if(S.gdef===i)S.gdef='';if(grpRoom===i)grpRoom=null;save();closeSheet();render();toast('已刪除');break}
    case 'data':dataOpen=true;dCalc();render();$('#v').scrollTop=0;break;
    case 'dback':dataOpen=false;render();break;
    case 'dclr':{const it=dCache&&dCache.items.find(x=>x.id===i);if(!it)break;const nm=it.label||it.name;sheet('是否確認清除【'+esc(nm)+'】？',(it.risk?'<p class="hint" style="margin:0 0 4px">'+(['card','emoji','pat','kao','ins','oth'].includes(it.id)?'會清除這個項目的所有分類和字卡，':'')+'這會永久刪除這些資料，無法復原，建議先備份。</p><button class="btn" data-a="bak">先去備份</button>':'<p class="hint" style="margin:0 0 4px">只會清除紀錄，不影響字卡與設定。</p>')+'<div class="confirm-btns"><button class="btn" data-a="close">取消</button><button class="btn d" data-a="dclrok" data-i="'+i+'">確認清除</button></div>',1);break}
    case 'dstkc':stkcSt={busy:0,res:null};stkcSheet();break;
    case 'stkscan':stkcScan();break;
    case 'stkgo':{const st=stkcSt;if(!st||!st.res)break;st.res.list.forEach(x=>{x.t.img=x.nu});save();dCalc();stkcSt=null;closeSheet();render();toast('已壓縮朋友圈貼紙');break}
    case 'dclrok':{dClear(i);save();dCalc();closeSheet();render();toast('已清除');break}
    case 'dtmp':sheet('是否確認清除暫存？','<p class="hint" style="margin:0 0 4px">會取消排隊中、尚未發出的回覆與靈感拾取任務，不影響任何資料。</p><div class="confirm-btns"><button class="btn" data-a="close">取消</button><button class="btn d" data-a="dtmpok">確認清除</button></div>',1);break;
    case 'dtmpok':{S.ipend=[];S.rounds={};S.next={};Object.keys(typingQ).forEach(k=>delete typingQ[k]);save();closeSheet();render();toast('已清除暫存');break}
    case 'icopen':icState={scope:{bg:1,img:1,av:1,msg:1},level:'std',res:null,busy:false,prog:''};icSheet();break;
    case 'ictg':if(icState&&!icState.busy){icState.scope[i]=icState.scope[i]?0:1;icState.res=null;icSheet()}break;
    case 'iclv':if(icState&&!icState.busy){icState.level=i;icState.res=null;icSheet()}break;
    case 'icscan':if(icState&&!icState.busy)icScan();break;
    case 'icgo':{const st=icState;if(!st||!st.res)break;const saved=st.res.saved,n=st.res.list.length;st.res.list.forEach(x=>x.t.set(x.nu));icState=null;save();dCalc();closeSheet();render();toast('已壓縮 '+n+' 張，省下約 '+dFmt(saved),4000);break}
    case 'icset':dataOpen=false;tab='set';sTab=2;sPage='imgc';render();$('#v').scrollTop=0;break;
    case 'cedit':catEditSheet();break;
    case 'mh':mhClear();mhOpen=true;render();$('#v').scrollTop=0;break;
    case 'mhback':mhOpen=false;mhClear();render();break;
    case 'pomo':pomoOpen=true;render();$('#v').scrollTop=0;break;
    case 'pomoback':pomoOpen=false;render();break;
    case 'pomogo':{const p=S.pomo;if(p.run){p.left=Math.max(0,p.end-Date.now());p.run=0;p.end=0}else{acx();p.run=1;p.end=Date.now()+(p.left>0?p.left:pmDur(p))}save();render();break}
    case 'pomoreset':{const p=S.pomo;p.run=0;p.end=0;p.left=pmDur(p);save();render();break}
    case 'pomoskip':{const p=S.pomo;if(p.ph==='foc'){p.idx++;p.ph=(p.idx%Math.max(1,p.cyc)===0)?'lng':'brk'}else p.ph='foc';p.run=0;p.end=0;p.left=pmDur(p);save();render();break}
    case 'pomosw':{S.pomo[i]=S.pomo[i]?0:1;save();render();break}
    case 'per':perOpen=true;perEdit=false;perInitMonth();render();$('#v').scrollTop=0;break;
    case 'perback':perOpen=false;perEdit=false;render();perToPage2();break;
    case 'peredit':perEdit=!perEdit;perPaint();break;
    case 'permo':{perM+=+i;if(perM<0){perM=11;perY--}else if(perM>11){perM=0;perY++}perPaint();break}
    case 'pertoday':perInitMonth();perPaint();break;
    case 'perday':{const d=S.per.days,x=d.indexOf(i);if(x>=0)d.splice(x,1);else d.push(i);perLiveSync();save();perPaint();break}
    case 'perend':{if(perEndNow()){toast('已結束經期，預測已更新');perPaint()}else toast('目前沒有進行中的經期');break}
    case 'perq0':closeSheet();break;
    case 'perq1':{const L=S.per.live;if(L){L.hold=pTodayK();L.ext=1;perAuto();save()}closeSheet();perPaint();toast('明天打開程式時會再問一次',2000);break}
    case 'perq2':{perEndNow();closeSheet();perPaint();const v=$('#v');if(tab==='home'&&!perOpen){const y=v.scrollTop;render();v.scrollTop=y}toast('已結束經期');break}
    case 'perrecdel':{const g=perGroups().find(x=>x.s===i);if(!g)break;sheet('刪除經期紀錄','<p class="hint" style="margin:0 0 12px">確定要刪除 '+pFmt(g.s)+(g.n>1?' – '+pFmt(g.e):'')+'（'+g.n+' 天）這筆紀錄嗎？預測會依剩下的紀錄重新計算。</p><button class="btn d" data-a="perrecdelok" data-i="'+i+'">刪除</button><button class="btn" data-a="close">取消</button>',1);break}
    case 'perrecdelok':{const p=S.per,g=perGroups().find(x=>x.s===i);if(g){p.days=p.days.filter(k=>!(pDiff(k,g.s)>=0&&pDiff(k,g.e)<=0));delete p.ended[g.s];if(p.live&&p.live.s===g.s)p.live=null;save()}closeSheet();perPaint();toast('已刪除紀錄');break}
    case 'perapply':{const st=perStat();if(st.cyc){S.per.cycle=st.cyc;S.per.len=st.len;save();const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y;toast('已套用平均週期與經期天數')}break}
    case 'perclear':{if(S.per.days.length&&confirm('確定要清除所有經期紀錄嗎？')){S.per.days=[];S.per.live=null;S.per.ended={};perEdit=false;save();const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y;toast('已清除經期紀錄')}break}
    case 'mom':momOpen=true;momTab='ct';render();$('#v').scrollTop=0;break;
    case 'momback':momOpen=false;momPlacing=null;if(notifBack){notifBack=false;const CT=$('[data-t="chat"]');if(CT){CT.click();break}}render();break;
    case 'momcover':{if(!S.momCover){pick(f=>rd(f,1000,u=>{S.momCover=u;save();render()}));break}sheet('朋友圈封面','<button class="btn s" style="width:100%;margin:0 0 8px" data-a="momcpick">更換圖片</button><button class="btn d" style="width:100%;margin:0 0 8px" data-a="momcdel">移除封面</button><button class="btn" style="width:100%;margin:0" data-a="close">取消</button>',1);break}
    case 'momcpick':closeSheet();pick(f=>rd(f,1000,u=>{S.momCover=u;save();render()}));break;
    case 'momcdel':S.momCover='';save();closeSheet();render();break;
    case 'momsig':sheet('個性簽名','<input class="mh-in" id="momsigin" type="text" maxlength="40" placeholder="寫下你的簽名" value="'+esc(S.momSig||'')+'"><p class="hint" style="margin:6px 2px 10px">最多 40 字，留空則清除簽名。</p><button class="btn s" style="width:100%;margin:0 0 8px" data-a="momsigok">儲存</button><button class="btn" style="width:100%;margin:0" data-a="close">取消</button>',1);setTimeout(()=>{const e=$('#momsigin');if(e)e.focus()},50);break;
    case 'momsigok':{const e=$('#momsigin');S.momSig=e?e.value.trim().slice(0,40):S.momSig;save();closeSheet();render();break}
    case 'cmsw':{const m=cmo(cur());m[i]=m[i]?0:1;if(i==='on')delete S.mst[cur().id];save();render();break}
    case 'momtab':momTab=i;momCSync();render();break;
    case 'momstk':S.momStk=S.momStk===0?1:0;save();render();break;
    case 'mompost':momDraft={x:'',items:[]};momCompose();break;
    case 'mnemo':momEmoOpen('n',null);break;
    case 'mnimg':pick(fs=>{let n=0;const out=[];fs.forEach((f,j)=>rd(f,1200,u=>{out[j]=u;if(++n===fs.length){out.forEach(x=>x&&momNew.items.push({k:'i',img:x}));const pv=$('#momnpv');if(pv)pv.innerHTML=momNewPv()}}))},'image/*',true);break;
    case 'mnrm':{momNew.items.splice(+i,1);const pv=$('#momnpv');if(pv)pv.innerHTML=momNewPv();break}
    case 'mnsend':{const t=$('#momntx');if(t)momNew.x=t.value;const x=(momNew.x||'').trim();if(!x&&!momNew.items.length){toast('還沒有內容');break}S.moments.push({id:uid(),cid:'me',t:Date.now(),x,wall:momNew.items.length?{items:momNew.items.map(o=>Object.assign({},o)),st:[]}:null});momNew={x:'',items:[]};momTab='me';save();closeSheet();render();toast('已發布',1200);break}
    case 'mpkopen':momPicker();break;
    case 'mpktab':momPK=i;momPicker();break;
    case 'mpkadd':{const k=S.cards.find(x=>x.id===i);if(!k||!momDraft)break;if(momPK==='emoji')momDraft.items.push(Object.assign({k:'s'},mItem(k)));else momDraft.x=(momDraft.x||'')+k.text;const pv=$('#mompv');if(pv)pv.innerHTML=momPvHtml();toast('已加入',900);break}
    case 'mpkdone':momCompose();break;
    case 'mpimg':momSync();pick(fs=>{let n=0;const out=[];fs.forEach((f,j)=>rd(f,1200,u=>{out[j]=u;if(++n===fs.length&&momDraft){out.forEach(x=>x&&momDraft.items.push({k:'i',img:x}));momCompose()}}))},'image/*',true);break;
    case 'mdrmask':{momSync();const o=momDraft.items[+i];if(!o)break;sheet(o.k==='i'?'移除圖片':'移除表情包','<p class="hint" style="margin:0 0 10px">確定要移除這個'+(o.k==='i'?'圖片':'表情包')+'嗎？</p><button class="btn d" data-a="mdrm" data-i="'+i+'">確認移除</button><button class="btn" data-a="mdrmno">取消</button>',1);break}
    case 'mdrmno':momCompose();break;
    case 'mdrm':momSync();momDraft.items.splice(+i,1);momCompose();toast('已移除',1200);break;
    case 'momsend':{momSync();const d=momDraft,x=(d.x||'').trim();if(d.edit){const p=S.moments.find(q=>q.id===d.edit);if(!p){closeSheet();break}const hasSt=p.wall&&p.wall.st&&p.wall.st.length;if(!x&&!d.items.length&&!hasSt){toast('還沒有內容');break}p.x=x;if(d.items.length||hasSt)p.wall={items:d.items,st:(p.wall&&p.wall.st)||[]};else p.wall=null;p.edited=1;momDraft=null;save();closeSheet();render();break}
      if(!x&&!d.items.length){toast('還沒有內容');break}S.moments.push({id:uid(),cid:'me',t:Date.now(),x,wall:d.items.length?{items:d.items,st:[]}:null});momDraft=null;momTab='me';save();closeSheet();render();break}
    case 'mompedit':{const p=S.moments.find(q=>q.id===i);if(!p)break;momDraft={x:p.x||'',items:(p.wall&&p.wall.items?p.wall.items.map(o=>Object.assign({},o)):[]),edit:p.id};momCompose();break}
    case 'momdelask':sheet('刪除貼文','<p class="hint" style="margin:0 0 10px">確定要刪除這則貼文嗎？刪除後無法復原。</p><button class="btn d" data-a="momdel" data-i="'+i+'">確認刪除</button><button class="btn" data-a="close">取消</button>',1);break;
    case 'momcsel':{const[pid,mid]=i.split('|');momSel=(momSel&&momSel.mid===mid)?null:{pid,mid};momCSync();{const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y}break}
    case 'momcsx':{momSel=null;momCSync();{const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y}break}
    case 'momcedit':{const[pid,mid]=i.split('|'),p=S.moments.find(q=>q.id===pid),t=p&&(p.cmts||[]).find(q=>q.id===mid);if(!t)break;ask('編輯留言',t.x||'',v=>{v=(v||'').trim();if(!v&&!t.img){toast('留言不能是空的');return}t.x=v;momSel=null;save();render()});break}
    case 'momcdel':{const[pid,mid]=i.split('|'),p=S.moments.find(q=>q.id===pid);if(!p||!p.cmts)break;const gone=new Set([mid]);let ch=true;while(ch){ch=false;p.cmts.forEach(c=>{if(c.rid&&gone.has(c.rid)&&!gone.has(c.id)){gone.add(c.id);ch=true}})}p.cmts=p.cmts.filter(c=>!gone.has(c.id));momSel=null;save();momCSync();{const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y}toast('已刪除留言',1200);break}
    case 'momcx':{const[pid,rid]=i.split('|'),p=S.moments.find(q=>q.id===pid);if(!p)break;p.cxs=p.cxs&&typeof p.cxs==='object'?p.cxs:{};if(p.cxs[rid])delete p.cxs[rid];else p.cxs[rid]=1;save();momCSync();{const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y}break}
    case 'momlike':{const p=S.moments.find(q=>q.id===i);if(!p)break;p.likes=Array.isArray(p.likes)?p.likes:[];if(p.liked){p.liked=0;const k=p.likes.indexOf(S.me);if(k>=0)p.likes.splice(k,1)}else{p.liked=1;p.likes.push(S.me);momPop=p.id;setTimeout(()=>{momPop=null},700)}save();{const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y}break}
    case 'momfav':{const p=S.moments.find(q=>q.id===i);if(!p)break;p.fav=p.fav?0:1;save();render();break}
    case 'momcmt':{momFocusIn(i);break}
    case 'momrep':{const[pid,mid]=i.split('|'),p=S.moments.find(q=>q.id===pid),t=p&&(p.cmts||[]).find(q=>q.id===mid);if(!t)break;const d=momDrOf(pid);momCSync();d.rid=mid;d.rt=t.n;d.rx=t.x||(t.img?'[表情包]':'');d.rcid=t.cid||null;momCRender(pid);break}
    case 'momcrx':{const d=momDrOf(i);momCSync();d.rid=null;d.rt=null;d.rx='';d.rcid=null;momCRender(i);break}
    case 'momcimgx':{const d=momDrOf(i);momCSync();d.img='';momCRender(i);break}
    case 'momcemo':{momCSync();momEmoOpen('c',i);break}
    case 'momcsend':{momCSync();const p=S.moments.find(q=>q.id===i);if(!p)break;const d=momDrOf(i),x=(d.x||'').trim();if(!x&&!d.img){toast('還沒有內容');break}p.cmts=Array.isArray(p.cmts)?p.cmts:[];const m={id:uid(),n:S.me,x};if(d.img)m.img=d.img;if(d.rid){m.rt=d.rt;m.rid=d.rid;p.cmts.push(m);p.cxs=p.cxs&&typeof p.cxs==='object'?p.cxs:{};p.cxs[momRootId(p.cmts,m)]=1;if(d.rcid)mcmUser(p,m,d.rcid)}else{p.cmts.push(m);mcmUser(p,m,p.cid)}delete momDr[i];save();{const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y}break}
    case 'momdel':S.moments=S.moments.filter(p=>p.id!==i);S.mrep=S.mrep.filter(r=>r.pid!==i);S.mcm=(S.mcm||[]).filter(r=>r.pid!==i);save();closeSheet();render();break;
    case 'mstk':{const p=S.moments.find(q=>q.id===i);if(!p||!p.wall){toast('這則貼文沒有貼圖牆');break}momCSync();momEmoOpen('s',i);break}
    case 'mesw':{if(!momEmo)break;momEmo.scope=i;momEmo.cat=null;momEmoSheet();break}
    case 'mecsw':{if(!momEmo)break;momEmo.cat=i;momEmoSheet();break}
    case 'mes':case 'mek':{const E=momEmo,k=S.cards.find(x=>x.id===i);if(!E||!k)break;if(E.ctx==='n'){if(E.type==='emoji')momNew.items.push(Object.assign({k:'s'},mItem(k)));else{momNew.x=(momNew.x||'')+(k.text||'');const t=$('#momntx');if(t)t.value=momNew.x}const pv=$('#momnpv');if(pv)pv.innerHTML=momNewPv();toast('已加入',800)}else if(E.ctx==='c'){const d=momDrOf(E.pid);momCSync();if(k.img)d.img=k.img;else d.x=(d.x||'')+k.text;momEmo=null;closeSheet();momCRender(E.pid)}else{momPlacing=Object.assign({pid:E.pid},mItem(k));S.momStk=1;momEmo=null;closeSheet();render()}break}
    case 'momcancel':momPlacing=null;render();break;
    case 'momplace':{const p=S.moments.find(x=>x.id===i);if(!p||!momPlacing)break;const r=A.getBoundingClientRect(),cl=v=>Math.min(96,Math.max(4,v));p.wall.st=p.wall.st||[];{const t0={id:uid(),img:momPlacing.img,x:momPlacing.x,px:+cl((e.clientX-r.left)/r.width*100).toFixed(1),py:+cl((e.clientY-r.top)/r.height*100).toFixed(1),by:'me',t:Date.now()};p.wall.st.push(t0);stkShrink(t0)}momPlacing=null;save();render();mrepSchedule(p);break}
    case 'stkdel':sheet('移除貼紙','<p class="hint" style="margin:0 0 10px">要把這張貼紙從貼圖牆上拿掉嗎？</p><button class="btn d" data-a="stkdelok" data-i="'+i+'">移除</button><button class="btn" data-a="close">取消</button>',1);break;
    case 'stkdelok':{const [pid,sid]=i.split('|'),p=S.moments.find(x=>x.id===pid);if(p&&p.wall)p.wall.st=(p.wall.st||[]).filter(t=>t.id!==sid);save();closeSheet();render();break}
    case 'ab':abOpen=true;abTab='num';abN='';abQ='';abRes=null;render();$('#v').scrollTop=0;break;
    case 'abback':abOpen=false;render();break;
    case 'abtab':abTab=i;abRes=null;render();$('#v').scrollTop=0;break;
    case 'abgo':abGo();break;
    case 'abrand':abRand();break;
    case 'abqclear':abQ='';{const q=$('#abq');if(q){q.value='';q.focus()}}break;
    case 'abreset':abN='';abQ='';abRes=null;render();break;
    case 'absave':{if(!abRes){toast('請先翻開答案');break}S.book=S.book||[];const ex=S.book.find(x=>x.id===abRes.id);if(ex){ex.q=abQ.trim();save();toast('已更新紀錄');break}S.book.push({...abRes,q:abQ.trim()});if(S.book.length>300)S.book.splice(0,S.book.length-300);save();toast('已保存到紀錄');break}
    case 'bview':{const x=(S.book||[]).find(p=>p.id===i);if(x)sheet('答案之書',(x.q?'<p class="hint" style="margin:0 0 10px">所問：'+esc(x.q)+'</p>':'')+abResultHtml(x)+'<button class="btn" style="width:100%;margin-top:12px" data-a="close">關閉</button>',1);break}
    case 'bsel':{recSel=recSel.includes(i)?recSel.filter(x=>x!==i):recSel.concat(i);const st=$('#v').scrollTop;render();$('#v').scrollTop=st;break}
    case 'bdelsel':{if(!recSel.length){toast('請先選擇紀錄');break}sheet('是否確認刪除？','<p class="hint" style="margin:0 0 4px">將刪除所選的 '+recSel.length+' 筆答案之書紀錄。</p><button class="btn d" data-a="bdelok">確認刪除</button><button class="btn" data-a="close">取消</button>',1);break}
    case 'bdelok':{S.book=(S.book||[]).filter(x=>!recSel.includes(x.id));recSel=[];recEdit=false;save();closeSheet();render();break}
    case 'mhtab':mhResBy[mhTab]=mhRes;mhTab=i;mhRes=mhResBy[i]||null;render();$('#v').scrollTop=0;break;
    case 'mhs':{mhSeason=i;const st=$('#v').scrollTop;render();$('#v').scrollTop=st;break}
    case 'mhreset':{const had=mhN1||mhN2||mhQ||mhNote||mhRes,u=had?mhSnap():null;mhClear();mhUndo=u;render();break}
    case 'mhundo':{if(!mhUndo){toast('沒有可以退回的重置');break}const u=mhUndo;mhUndo=null;mhN1=u.n1;mhN2=u.n2;mhT=u.t;mhQ=u.q;mhNote=u.note;mhSeason=u.se;mhRes=u.res;mhResBy=u.by;render();toast('已退回重置',1500);break}
    case 'mhgo':mhGo();break;
    case 'mhcopy':{if(!mhRes){toast('請先排盤');break}const r=mhRes.r,mv=r.movingLine,yl=mv===1?'初爻':mv===6?'上爻':'第'+MH_YAO[mv-1],q=(mhQ||'').trim(),t=(q?q+' ':'')+r.benGua+yl+' 互卦'+r.huGua+' 變卦'+r.bianGua,ok=()=>toast('已複製'),fb=()=>{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';document.body.appendChild(ta);ta.select();let d=false;try{d=document.execCommand('copy')}catch(x){}ta.remove();d?ok():toast('複製失敗，請手動選取')};try{navigator.clipboard.writeText(t).then(ok,fb)}catch(x){fb()}break}
    case 'mhsave':{if(!mhRes){toast('請先排盤');break}S.plum=S.plum||[];const ex=S.plum.find(x=>x.id===mhRes.id);if(ex){ex.q=mhQ.trim();ex.note=mhNote.trim();save();toast('已更新紀錄');break}S.plum.push({...mhRes,q:mhQ.trim(),note:mhNote.trim()});if(S.plum.length>300)S.plum.splice(0,S.plum.length-300);save();toast('已保存到紀錄');break}
    case 'pview':{const x=(S.plum||[]).find(p=>p.id===i);if(x)sheet('梅花易數',mhResultHtml(x)+'<div class="sheet-foot pv-foot"><button class="btn" data-a="pcopy" data-i="'+x.id+'">複製問題與卦象</button><button class="btn" data-a="close">關閉</button></div>',1);break}
    case 'pcopy':{const x=(S.plum||[]).find(p=>p.id===i);if(!x||!x.r)break;const r=x.r,mv=r.movingLine,yl=mv===1?'初爻':mv===6?'上爻':'第'+MH_YAO[mv-1],q=(x.q||'').trim(),t=(q?q+' ':'')+r.benGua+yl+' 互卦'+r.huGua+' 變卦'+r.bianGua,ok=()=>toast('已複製'),fb=()=>{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';document.body.appendChild(ta);ta.select();let d=false;try{d=document.execCommand('copy')}catch(e2){}ta.remove();d?ok():toast('複製失敗，請手動選取')};try{navigator.clipboard.writeText(t).then(ok,fb)}catch(e2){fb()}break}
    case 'psel':{recSel=recSel.includes(i)?recSel.filter(x=>x!==i):recSel.concat(i);const st=$('#v').scrollTop;render();$('#v').scrollTop=st;break}
    case 'pdelsel':{if(!recSel.length){toast('請先選擇紀錄');break}sheet('是否確認刪除？','<p class="hint" style="margin:0 0 4px">將刪除所選的 '+recSel.length+' 筆梅花易數紀錄。</p><button class="btn d" data-a="pdelok">確認刪除</button><button class="btn" data-a="close">取消</button>',1);break}
    case 'pdelok':{S.plum=(S.plum||[]).filter(x=>!recSel.includes(x.id));recSel=[];recEdit=false;save();closeSheet();render();break}
    case 'gonotice':{const fromChat=tab==='chat';const T=$('[data-t="home"]');if(T)T.click();notifBack=fromChat;closeSheet();$('#bn').classList.remove('show');if(i==='mail'){mailOpen=true;mailTab='r';mailEdit=false;mailSel=[];mailReplyId=null;mailKeep={};render();$('#v').scrollTop=0}else if(i==='mom'){momOpen=true;momTab='ct';render();$('#v').scrollTop=0}else if(i==='daily'){setTimeout(()=>{try{openDaily()}catch(e){}},60)}break}
    case 'calopen':calOpen=true;calY=0;calSel='';calTab='day';calPicked=false;remEdit=false;remSel=[];evEdit=false;evSel=[];closeSheet();render();$('#v').scrollTop=0;break;
    case 'calback':calOpen=false;render();break;
    case 'calprev':calM--;if(calM<0){calM=11;calY--}render();break;
    case 'calnext':calM++;if(calM>11){calM=0;calY++}render();break;
    case 'calsel':calSel=i;calPicked=true;{const st=$('#v').scrollTop;render();$('#v').scrollTop=st}break;
    case 'caltab':calTab=i;remEdit=false;remSel=[];evEdit=false;evSel=[];render();break;
    case 'remadd':remDraft=remNew();remSheet();break;
    case 'remedit1':{const r=(S.rems||[]).find(x=>x.id===i);if(!r)break;const L=lunOf(pdk(r.sk))||{y:+r.sk.slice(0,4),m:1,d:1,leap:0};remDraft={id:r.id,name:r.name||'',note:r.note||'',cal:r.cal==='l'?'l':'s',sk:r.sk,ly:r.cal==='l'?(lunOf(pdk(r.sk))||L).y:L.y,lm:r.cal==='l'?r.lm:L.m,ld:r.cal==='l'?r.ld:L.d,lleap:r.cal==='l'?r.lleap:L.leap,before:+r.before||0,rep:r.rep||0,rec:r.rec?1:0};remSheet();break}
    case 'remcal':{remRead();const d=remDraft;if(!d||i===d.cal)break;if(i==='l'){const L=lunOf(pdk(d.sk));if(L){d.ly=L.y;d.lm=L.m;d.ld=L.d;d.lleap=L.leap}}else{const k=lunToSolar(d.ly,d.lm,d.ld,d.lleap);if(k)d.sk=k}d.cal=i;remSheet();break}
    case 'remrec':remRead();remDraft.rec=remDraft.rec?0:1;remSheet();break;
    case 'remsave':{remRead();const d=remDraft;if(!d)break;let sk=d.sk;if(d.cal==='l'){sk=lunToSolar(d.ly,d.lm,d.ld,d.lleap);if(!sk){toast('找不到這個農曆日期，請檢查年份、月份和日期');break}}if(!sk){toast('請選擇日期');break}
      const a=sk.split('-').map(Number),r0=d.id&&(S.rems||[]).find(x=>x.id===d.id),r=Object.assign(r0||{id:uid(),on:1},{name:d.name,note:d.note,cal:d.cal,sk,m:a[1],d:a[2],lm:d.lm,ld:d.ld,lleap:d.lleap,rep:d.rep,before:d.before,rec:d.rec?1:0});delete r.evScan;delete r.shown;if(d.cal==='l'){r.m=undefined;r.d=undefined}
      S.rems=S.rems||[];if(!r0)S.rems.push(r);evSync();save();closeSheet();remDraft=null;{const st=$('#v').scrollTop;render();$('#v').scrollTop=st}toast('已儲存');break}
    case 'remsw':{const r=(S.rems||[]).find(x=>x.id===i);if(r){r.on=r.on?0:1;save();const st=$('#v').scrollTop;render();$('#v').scrollTop=st}break}
    case 'remmulti':remEdit=!remEdit;remSel=[];render();break;
    case 'remsel':remSel=remSel.includes(i)?remSel.filter(x=>x!==i):remSel.concat(i);{const st=$('#v').scrollTop;render();$('#v').scrollTop=st}break;
    case 'remdelsel':{if(!remSel.length){toast('請先選擇提醒');break}sheet('是否確認刪除？','<p class="hint" style="margin:0 0 4px">將刪除所選的 '+remSel.length+' 個提醒。已經記在事件紀錄裡的事件會保留。</p><button class="btn d" data-a="remdelok">確認刪除</button><button class="btn" data-a="close">取消</button>',1);break}
    case 'remdelok':S.rems=(S.rems||[]).filter(r=>!remSel.includes(r.id));remSel=[];remEdit=false;save();closeSheet();render();break;
    case 'evmulti':evEdit=!evEdit;evSel=[];render();break;
    case 'evsel':evSel=evSel.includes(i)?evSel.filter(x=>x!==i):evSel.concat(i);{const st=$('#v').scrollTop;render();$('#v').scrollTop=st}break;
    case 'evdelsel':{if(!evSel.length){toast('請先選擇事件');break}sheet('是否確認刪除？','<p class="hint" style="margin:0 0 4px">將從事件紀錄刪除所選的 '+evSel.length+' 筆事件。</p><button class="btn d" data-a="evdelok">確認刪除</button><button class="btn" data-a="close">取消</button>',1);break}
    case 'evdelok':{S.evdel=S.evdel||[];(S.evlog||[]).filter(e=>evSel.includes(e.id)).forEach(e=>S.evdel.push(e.rid+'|'+e.date));S.evlog=(S.evlog||[]).filter(e=>!evSel.includes(e.id));evSel=[];evEdit=false;save();closeSheet();render();break}
    case 'evopen':{const e=(S.evlog||[]).find(x=>x.id===i);if(!e)break;sheet('編輯事件','<div class="cal2-k" style="margin-top:0">'+fmtD(e.date)+'</div><div class="cal2-k">事件名</div><input id="ev-name" class="cal2-in" maxlength="30" value="'+esc(e.name)+'"><div class="cal2-k">備注</div><textarea id="ev-note" class="cal2-in" rows="2" maxlength="200">'+esc(e.note||'')+'</textarea><button class="btn s" data-a="evsave" data-i="'+e.id+'">儲存</button><button class="btn d" data-a="evdel1" data-i="'+e.id+'">刪除這筆事件</button><button class="btn" data-a="close">取消</button>');break}
    case 'evsave':{const e=(S.evlog||[]).find(x=>x.id===i);if(e){e.name=(($('#ev-name')||{}).value||'').trim()||'提醒';e.note=(($('#ev-note')||{}).value||'').trim();save()}closeSheet();render();break}
    case 'evdel1':{const e=(S.evlog||[]).find(x=>x.id===i);if(e){S.evdel=S.evdel||[];S.evdel.push(e.rid+'|'+e.date);S.evlog=S.evlog.filter(x=>x.id!==i);save()}closeSheet();render();break}
    case 'remok':{const tk=localDayKey(new Date());remDue().forEach(x=>{x.r.shown=tk;delete x.r.later;delete x.r.tmr});save();closeSheet();break}
    case 'remlater':{const s=S.set,ms2=(Math.max(0,+s.calLaterH||0)*60+Math.max(0,+s.calLaterM||0))*60000||5*3600000,nw=Date.now();remPending().forEach(x=>{x.r.later=nw+ms2});save();closeSheet();remAskSess=false;toast('稍後會再提醒你',1800);break}
    case 'remtmr':{const tm2=localDayKey(addD(todayNoon(),1));remPending().forEach(x=>{x.r.tmr=tm2;delete x.r.later});save();closeSheet();remAskSess=false;toast('明天會再提醒你',1800);break}
    case 'fontopen':fontTarget=null;fontSheet();break;
    case 'thfont':fontTarget=i;fontSheet();break;
    case 'fntsel':fontScan().then(l=>{fntSel=[];fntSheet(l)});break;
    case 'fntck':fontScan().then(l=>{fntSel=fntSel.includes(i)?fntSel.filter(x=>x!==i):fntSel.concat(i);fntSheet(l)});break;
    case 'fntall':fontScan().then(l=>{fntSel=fntSel.length===l.length?[]:l.map(x=>x.id);fntSheet(l)});break;
    case 'fntdel':{if(!fntSel.length){toast('請先選擇字體');break}const ids=fntSel.slice();(async()=>{try{if(window.caches){const c=await caches.open('pearla-fonts');for(const id of ids){const f=fontOf(id);if(f)await c.delete(f.local)}}}catch(e){}ids.forEach(id=>{const ff=fontFaces[id];if(ff&&ff._st){ff._st.remove();try{URL.revokeObjectURL(ff._url)}catch(e){}}else if(ff&&ff.family)try{document.fonts.delete(ff)}catch(e){}delete fontFaces[id]});if(ids.includes(S.font)){S.font='';applyTheme()}save();fntSel=[];closeSheet();render();toast('已清除字體')})();break}
    case 'fontpick':{const fid=fontOf(i)?i:'',tg=fontTarget||curTheme();S.themeFonts=S.themeFonts||{};S.themeFonts[tg]=fid;if(tg===curTheme()){S.font=fid;applyTheme()}fontTarget=null;save();closeSheet();render();break}
    case 'calmoodpick':calMoodPop(A);break;
    case 'calmood':{const m=ensureTodayMoods().find(x=>x.id===i),el=$('#cal-mood'),ee=$('#cal-me');if(m&&el){el.value=m.text;if(ee)ee.value=m.emoji}closeCalPop();break}
    case 'calmoodadd':closeCalPop();sheet('新增心情','<div class="cal2-k" style="margin-top:0">表情符號</div><input id="mn-emoji" class="cal2-in" maxlength="4" placeholder="😊"><div class="cal2-k">心情文字</div><input id="mn-text" class="cal2-in" maxlength="12" placeholder="例如：期待"><button class="btn s" data-a="calmoodok">加入心情清單並選用</button><button class="btn" data-a="close">取消</button>',1);break;
    case 'calmoodok':{const em=(($('#mn-emoji')||{}).value||'').trim()||'😊',tx=(($('#mn-text')||{}).value||'').trim();if(!tx){toast('請輸入心情文字');break}ensureTodayMoods().push({id:uid(),emoji:em,text:tx,on:1});const msg=(($('#cal-msg')||{}).value||'').trim();S.dmine=S.dmine||{};S.dmine[calSel]={x:msg,mood:em+tx,t:Date.now()};save();closeSheet();{const st=$('#v').scrollTop;render();$('#v').scrollTop=st}toast('已新增心情');break}
    case 'calsave':{const x=($('#cal-msg')||{}).value||'',mo=((($('#cal-me')||{}).value||'').trim()+(($('#cal-mood')||{}).value||'').trim());S.dmine=S.dmine||{};if(!x.trim()&&!mo.trim()){delete S.dmine[calSel]}else S.dmine[calSel]={x:x.trim(),mood:mo.trim(),t:Date.now()};save();{const st=$('#v').scrollTop;render();$('#v').scrollTop=st}toast('已儲存');break}
    case 'calreply':{const el=$('#cal-re-'+i),v=el?el.value.trim():'';const r=S.dlog&&S.dlog[i]&&S.dlog[i][calSel];if(!r||r.reply)break;if(!v){toast('請先輸入回覆');break}r.reply={x:v,t:Date.now()};save();{const st=$('#v').scrollTop;render();$('#v').scrollTop=st}toast('已回覆');break}
    case 'insphome':inspOpen=true;inspEdit=false;inspSel=[];closeSheet();render();$('#v').scrollTop=0;break;
    case 'inspback':inspOpen=false;inspEdit=false;inspSel=[];render();break;
    case 'itab':inspTab=i;inspEdit=false;inspSel=[];render();break;
    case 'iedit':inspEdit=!inspEdit;inspSel=[];render();break;
    case 'insevsave':{const r=S.insp.ev.find(x=>x.id===i);if(!r||r.saved)break;inspSave(r.cid,r.text,{id:r.sid,x:r.src,mt:r.mt,t:r.t});r.saved=true;inspLog('ext',{id:uid(),cid:r.cid,text:r.text,src:r.src,sid:r.sid,mt:r.mt,t:Date.now()});save();{const st=$('#v').scrollTop;render();$('#v').scrollTop=st}toast('已保存到「我保存的」');break}
    case 'isel':inspSel=inspSel.includes(i)?inspSel.filter(x=>x!==i):inspSel.concat(i);{const st=$('#v').scrollTop;render();$('#v').scrollTop=st}break;
    case 'idel':if(!inspSel.length){toast('請先選擇紀錄');break}sheet('是否確認刪除？','<p class="hint" style="margin:0 0 4px">將刪除所選的 '+inspSel.length+' 筆紀錄。（只刪除紀錄，不會刪除字卡）</p><div class="confirm-btns"><button class="btn" data-a="close">取消</button><button class="btn d" data-a="idelok">確認刪除</button></div>',1);break;
    case 'idelok':S.insp[inspTab]=S.insp[inspTab].filter(r=>!inspSel.includes(r.id));inspSel=[];inspEdit=false;save();closeSheet();render();toast('已刪除');break;
    case 'cren':{const x=S.cats.find(c=>c.id===i);if(!x||x.un)break;ask('修改分類名字',x.name,v=>{x.name=v;save();render();catEditSheet()});break}
    case 'cdl':{const x=S.cats.find(c=>c.id===i);if(!x||x.un)break;catConfirm(x);break}
    case 'keep':break;
    case 'cdlno':{const o=$('#sh2');if(o)o.remove();break}
    case 'cdlok':{const o=$('#sh2');if(o)o.remove();if((S.cats.find(c=>c.id===i)||{}).un)break;S.cards=S.cards.filter(k=>k.cat!==i);S.cats=S.cats.filter(c=>c.id!==i);if(selCat===i)selCat=null;delMode=false;selC=[];save();render();catEditSheet();toast('已刪除');break}
    case 'cnew':ask('新增分類名稱','',v=>{const useKind=(kind==='other'&&oPage)?oPage:kind;const n={id:uid(),sc:useKind==='other'?'s':scope,kind:useKind,name:v,on:1,as:[],own:useKind==='other'||scope!=='e'?undefined:S.cur};if(useKind==='card'&&bigOpen){const bo=bigsAll().find(b=>b.id===bigOpen);if(bo&&!bo.un)n.big=bo.id}S.cats.push(n);selCat=n.id;save();render()});break;
    case 'ctog':cat.on=cat.on?0:1;save();render();break;
    case 'cdel':sheet('刪除分類','<p class="hint" style="margin:0">將刪除「'+esc(cat.name)+'」與其中的字卡。</p><button class="btn d" data-a="cdelok">確定刪除</button><button class="btn" data-a="close">取消</button>');break;
    case 'cdelok':if(cat&&cat.un)break;S.cards=S.cards.filter(k=>k.cat!==selCat);S.cats=S.cats.filter(c=>c.id!==selCat);selCat=null;delMode=false;selC=[];save();closeSheet();render();break;
    case 'cperm':sheet('分類權限 · '+esc(cat.name),'<p class="hint" style="margin:0 0 8px">指定可使用此分類的聯絡人。</p>'+S.contacts.map(c=>`<div class="ci"><span class="grow">${esc(c.name)}</span><button class="sw ${cat.as.includes(c.id)?'on':''}" data-a="pm" data-i="${c.id}"></button></div>`).join('')+'<button class="btn s" data-a="close">完成</button>');break;
    case 'pm':{cat.as=cat.as.includes(i)?cat.as.filter(x=>x!==i):cat.as.concat(i);A.classList.toggle('on');save();break}
    case 'ct':{const k=S.cards.find(x=>x.id===i);k.on=k.on?0:1;save();render();break}
    case 'cx':S.cards=S.cards.filter(k=>k.id!==i);save();render();break;
    case 'cadd':{const ents=sortByNum(parseCardLines($('#nc').value)).map(o=>({cat:selCat,newName:null,text:o.text,num:o.num}));if(!ents.length)break;addEntries(ents,S.cats.find(x=>x.id===selCat));break}
    case 'me':ask('你的名稱',S.me,v=>{S.me=v;save();render()});break;
    case 'bak':bak();break;
    case 'copy':{const done=busy('正在產生備份，請稍候⋯');let t='';const mk=()=>(t=JSON.stringify(S)),kb=()=>{const k=t.length/1024;return k>1024?(k/1024).toFixed(1)+'MB':Math.ceil(k)+'KB'},ok=()=>{done();toast('已複製備份（'+kb()+'）')},fb=()=>{if(!t)mk();const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';document.body.appendChild(ta);ta.select();let fin=false;try{fin=document.execCommand('copy')}catch(x){}ta.remove();done();fin?toast('已複製備份（'+kb()+'）'):toast('資料太大無法複製，請改用「下載備份檔」')};
      if(window.ClipboardItem&&navigator.clipboard&&navigator.clipboard.write){const pr=new Promise(r=>setTimeout(()=>r(new Blob([mk()],{type:'text/plain'})),60));navigator.clipboard.write([new ClipboardItem({'text/plain':pr})]).then(ok,fb)}else{setTimeout(()=>{mk();try{navigator.clipboard.writeText(t).then(ok,fb)}catch(x){fb()}},60)}break}
    case 'imp':impText($('#im').value);break;
    case 'reset':sheet('重設全部資料','<p class="hint" style="margin:0">這會清除本機所有 Pearla 資料。</p><button class="btn d" data-a="resetok">確定重設</button><button class="btn" data-a="close">取消</button>');break;
    case 'resetok':S=def();save();closeSheet();tab='home';render();break;
  }
});
document.addEventListener('input',e=>{if(tab==='set'&&sTab===0&&sPage&&!NOLOCK.includes(sPage)&&S.locked){e.stopImmediatePropagation();render()}},true);
document.addEventListener('pointerdown',e=>{if(tab==='set'&&sTab===0&&sPage&&!NOLOCK.includes(sPage)&&S.locked&&e.target.closest('input,textarea,select,button:not(#lockBtn):not([data-a="sback"]):not([data-a="help"])')){e.preventDefault();e.stopImmediatePropagation();toast('設定已鎖定，請先解除鎖定')}},true);
document.addEventListener('focusin',e=>{if(tab==='set'&&sTab===0&&sPage&&!NOLOCK.includes(sPage)&&S.locked&&e.target.matches('input,textarea,select')){e.preventDefault();e.target.blur();toast('設定已鎖定，請先解除鎖定')}},true);
document.addEventListener('change',e=>{if(tab==='set'&&sTab===0&&sPage&&!NOLOCK.includes(sPage)&&S.locked){e.stopImmediatePropagation();render()}},true);
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='newContactName'){e.preventDefault();$('[data-a=addcok]')?.click()}if(e.key==='Escape'&&e.target.id==='newContactName'){$('[data-a=addccancel]')?.click()}});
document.addEventListener('submit',e=>{
  if(e.target.id!=='f')return;e.preventDefault();
  if(recMode&&tab==='chat'){recSend();return}
  const i=$('#in'),v=i.value.trim(),imgs=(tab==='chat'&&chImgs.length)?chImgs.slice():[];if(!v&&!imgs.length)return;if(tab==='home'&&grpRoom){gSend(v);i.value='';return}
  imgs.forEach(u=>myMsg({id:uid(),f:'me',x:'',img:u,pic:1,t:Date.now()}));if(imgs.length){chImgs=[];chPvRefresh()}
  if(v)myMsg({id:uid(),f:'me',x:v,t:Date.now()});i.value='';schedule(S.cur,v||'[圖片]');save();paint();
});
document.addEventListener('input',e=>{
  const k=e.target.dataset.k,g=e.target.dataset.tg;
  if(k){S.set[k]=+e.target.value;$('#o-'+k).textContent=k==='wi'?WL(WAITS[S.set.wi]):S.set[k]+'%';saveSoon()}
  if(g){S.tags[g]=e.target.value.split('\n').map(x=>x.trim()).filter(Boolean);saveSoon()}
});
let st;function saveSoon(){clearTimeout(st);st=setTimeout(save,300)}
function busy(msg){let e=document.getElementById('bz');if(e)e.remove();e=document.createElement('div');e.id='bz';e.innerHTML='<div class="bzb"><i class="bzs"></i><span></span></div>';e.querySelector('span').textContent=msg||'請稍候⋯';document.body.appendChild(e);let off=0;const f=()=>{if(off)return;off=1;e.remove()};setTimeout(f,90000);return f}
function bak(){
  sheet('備份與還原','<p class="hint" style="margin:0 0 6px">備份：建議用「下載備份檔」，圖片多時資料會很大，檔案最穩。也可以複製成文字。</p><button class="btn s" data-a="dl">下載備份檔</button><button class="btn" data-a="copy">複製備份文字</button><p class="hint">還原：選擇先前下載的備份檔，或貼上備份文字。會覆蓋目前所有資料。</p><button class="btn" data-a="fimp">選擇備份檔還原</button><textarea id="im" rows="3" placeholder="或在這裡貼上備份文字…"></textarea><button class="btn d" data-a="imp">貼上的文字還原</button><button class="btn" data-a="close">關閉</button>');
}