

/* ── 朋友圈 ── */
let momOpen=false;
const MOM_PEN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
let momTab='me',momDraft=null,momPlacing=null,momPK='kao',momSK='emoji',momStkPost=null;
const stkPool=cid=>pool('emoji',cid).concat(pool('emj',cid));
const mItem=k=>({img:k.img||'',x:k.img?'':k.text});
function momWall(p){const w=p.wall;if(!w)return '';
  const it=Array.isArray(w.items)?w.items:[],st=Array.isArray(w.st)?w.st:[];
  const cell=o=>'<div class="mw-c">'+(o.img?'<img src="'+o.img+'" alt="">':esc(o.x||''))+'</div>',blank='<div class="mw-c"></div>';
  let rows='',buf=[];const flush=()=>{if(!buf.length)return;const n=Math.ceil(buf.length/3)*3;rows+='<div class="mw-g">'+buf.map(cell).join('')+blank.repeat(n-buf.length)+'</div>';buf=[]};
  it.forEach(o=>{if(o.k==='i'){flush();rows+='<div class="mw-i"><img src="'+o.img+'" alt=""></div>'}else buf.push(o)});flush();
  if(!rows)rows='<div class="mw-g">'+blank.repeat(3)+'</div>';
  const pl=!!(momPlacing&&momPlacing.pid===p.id);
  const sk=st.map(t=>'<div class="mom-stk'+(t.by==='me'?' mine':'')+'" style="left:'+t.px+'%;top:'+t.py+'%"'+(t.by==='me'&&!momPlacing?' data-a="stkdel" data-i="'+p.id+'|'+t.id+'"':'')+'>'+(t.img?'<img src="'+t.img+'" alt="">':esc(t.x||''))+'</div>').join('');
  return '<div class="mom-wall'+(S.momStk===0?' nostk':'')+(pl?' placing':'')+'"><div class="mw-in"'+(pl?' data-a="momplace" data-i="'+p.id+'"':'')+'>'+rows+sk+'</div></div>'}
const MI={edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',del:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',face:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14c1.8 2 5.2 2 7 0"/><circle cx="9" cy="10" r=".6" fill="currentColor"/><circle cx="15" cy="10" r=".6" fill="currentColor"/></svg>'};
const momCm=(m,pid)=>'<div'+(m.id&&m.cid&&pid?' class="mom-rp" data-a="momrep" data-i="'+pid+'|'+m.id+'"':'')+'><b style="font-weight:500">'+esc(m.n)+'</b>'+(m.rt?' 回覆 <b style="font-weight:500">'+esc(m.rt)+'</b>':'')+'：'+esc(m.x||'')+(m.img?'<img class="mom-cimg" src="'+m.img+'" alt="">':'')+'</div>';
function momPost(p){const me=p.cid==='me',c=me?{id:'me',av:S.meAv,name:S.me}:S.contacts.find(x=>x.id===p.cid);if(!c)return '';const im=Array.isArray(p.imgs)?p.imgs.slice(0,9):[],likes=Array.isArray(p.likes)?p.likes:[],cm=Array.isArray(p.cmts)?p.cmts:[];
  const top='<button class="mom-top" data-a="'+(me?'mompedit':'momdelask')+'" data-i="'+p.id+'" aria-label="'+(me?'編輯貼文':'刪除貼文')+'">'+(me?MI.edit:MI.del)+'</button>';
  const acts='<div class="mom-acts"><button class="mom-ic'+(p.liked?' lk':'')+'" data-a="momlike" data-i="'+p.id+'" aria-label="點贊">'+(p.liked?'♥':'♡')+'</button><button class="mom-ic" data-a="momcmt" data-i="'+p.id+'" aria-label="留言"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.6-.8L4 20l1.4-3.4A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg></button><button class="mom-ic" data-a="mstk" data-i="'+p.id+'" aria-label="貼紙">'+MI.face+'</button><button class="mom-ic'+(p.fav?' fv':'')+'" data-a="momfav" data-i="'+p.id+'" aria-label="收藏">'+(p.fav?'★':'☆')+'</button></div>';
  return '<div class="mom-post">'+top+'<div class="mom-hd">'+avh(c,'msgav')+'<div><div class="mom-nm">'+esc(c.name)+'</div><div class="mom-time">'+ltime(p.t)+(p.edited?' · 已編輯':'')+'</div></div></div><div class="mom-bd">'+(p.x?'<div class="mom-tx">'+esc(p.x)+'</div>':'')+(im.length?'<div class="mom-imgs'+(im.length===1?' one':'')+'">'+im.map(u=>'<img src="'+u+'" alt="">').join('')+'</div>':'')+momWall(p)+acts+((likes.length||cm.length)?'<div class="mom-re">'+(likes.length?'♡ '+likes.map(esc).join('、'):'')+(p.cmx?cm:cm.slice(0,3)).map(m=>momCm(m,p.id)).join('')+(cm.length>3?'<button type="button" class="mom-cx" data-a="momcx" data-i="'+p.id+'">'+(p.cmx?'收起留言':'展開留言（共 '+cm.length+' 條）')+'</button>':'')+'</div>':'')+'</div></div>'}
function vMom(){
  const head='<div class="ph2"><button class="ib" data-a="momback">‹</button><h1>朋友圈</h1><span class="grow"></span><span class="mom-stksw">貼紙<button class="sw '+(S.momStk===0?'':'on')+'" data-a="momstk" aria-label="顯示或隱藏貼紙"></button></span></div>';
  const sig=S.momSig||'',cv=S.momCover;
  const cover='<div class="mom-head"><div class="mom-cover" data-a="momcover" role="button" aria-label="朋友圈封面"'+(cv?' style="background-image:url('+cv+')"':'')+'>'+(cv?'':'<div class="mom-hint"><b>＋</b>點擊放上封面圖片</div>')+'</div>'+avh({id:'me',av:S.meAv,name:S.me},'big')+'<label class="mom-sig">'+MOM_PEN+'<input id="momsigin" type="text" maxlength="40" placeholder="寫下你的簽名" autocomplete="off" value="'+esc(sig)+'"></label></div>';
  const bar=momPlacing?'<div class="mom-bar"><span>點一下貼圖牆，把貼紙放在想要的位置</span><button class="btn" data-a="momcancel">取消</button></div>':'';
  const tabs='<div class="stabs">'+[['me','我的空間'],['ct','聯繫人貼文']].map(([k,n])=>'<button class="stab '+(momTab===k?'on':'')+'" data-a="momtab" data-i="'+k+'">'+n+'</button>').join('')+'</div>';
  const all=[...(S.moments||[])].sort((x,y)=>y.t-x.t);let body;
  if(momTab==='me'){const l=all.filter(p=>p.cid==='me');body='<div class="mom-pubfix"><button class="btn s" data-a="mompost">發布貼文</button></div><div style="height:56px"></div>'+(l.length?'<div class="card" style="padding:4px 14px">'+l.map(momPost).join('')+'</div>':'<div class="empty">你還沒有發布過貼文。</div>')}
  else{const l=all.filter(p=>p.cid!=='me'&&S.contacts.some(c=>c.id===p.cid));if(l.some(p=>!p.seen)){l.forEach(p=>{p.seen=1});saveSoon()}body=l.length?'<div class="card" style="padding:4px 14px">'+l.map(momPost).join('')+'</div>':'<div class="empty">還沒有朋友圈貼文。<br>聯絡人發布的貼文會顯示在這裡。</div>'}
  return head+bar+cover+tabs+body}
/* 發布貼文（我的空間） */
function momSync(){const e=$('#momtx');if(e&&momDraft)momDraft.x=e.value}
function momCompose(){const d=momDraft;sheet(d.edit?'編輯貼文':'發布貼文','<textarea class="mh-in" id="momtx" rows="4" maxlength="500" placeholder="寫點什麼…" style="resize:none">'+esc(d.x)+'</textarea><div class="mom-tools"><button class="btn" data-a="mpkopen">顏文字 / emoji / 表情包</button><button class="btn" data-a="mpimg">圖片</button></div>'+(d.items.length?'<div class="mom-dr">'+d.items.map((o,n)=>'<div class="mom-dc'+(o.k==='i'?' mom-dc-photo':'')+'">'+(o.img?'<img src="'+o.img+'" alt="">':esc(o.x||''))+'<b data-a="mdrmask" data-i="'+n+'" aria-label="移除">×</b></div>').join('')+'</div><p class="hint" style="margin:6px 2px">只能點擊右上角「×」移除圖片或表情包。</p>':'')+'<div style="display:flex;gap:8px;margin-top:10px"><button class="btn" data-a="close" style="flex:1;margin:0">取消</button><button class="btn s" data-a="momsend" style="flex:1;margin:0">'+(d.edit?'儲存':'發布')+'</button></div>'+(d.edit?'<button class="btn d" data-a="momdelask" data-i="'+d.edit+'">刪除貼文</button>':''),0)}
function momPvHtml(){const it=(momDraft&&momDraft.items||[]).filter(o=>o.k==='s');return it.length?it.map(o=>'<span class="mom-pvc">'+(o.img?'<img src="'+o.img+'" alt="">':esc(o.x||''))+'</span>').join(''):'<small>選擇的表情包會顯示在這裡</small>'}
function momPicker(){momSync();const T=[['kao','顏文字'],['emj','emoji'],['emoji','表情包']],l=pool(momPK,S.cur);
  sheet('選擇內容','<div class="mom-pv" id="mompv">'+momPvHtml()+'</div><div class="stabs">'+T.map(([k,n])=>'<button class="stab '+(momPK===k?'on':'')+'" data-a="mpktab" data-i="'+k+'">'+n+'</button>').join('')+'</div>'+(l.length?'<div class="mom-pg mom-pgs t-'+momPK+'">'+l.map(k=>'<button data-a="mpkadd" data-i="'+k.id+'">'+(k.img?'<img src="'+k.img+'" alt="">':esc(k.text))+'</button>').join('')+'</div>':'<div class="empty">這裡還沒有內容。<br>到「字卡」頁新增。</div>')+'<button class="btn s" data-a="mpkdone">完成</button>',0)}
function stkPicker(){const p=S.moments.find(x=>x.id===momStkPost);if(!p)return;const oc=p.cid==='me'?S.cur:p.cid,l=pool(momSK,oc);
  sheet('選擇貼紙','<div class="stabs">'+[['emoji','表情包'],['emj','emoji']].map(([k,n])=>'<button class="stab '+(momSK===k?'on':'')+'" data-a="mstktab" data-i="'+k+'">'+n+'</button>').join('')+'</div>'+(l.length?'<div class="mom-pg t-'+(momSK==='emj'?'emj':'emoji')+'">'+l.map(k=>'<button data-a="mstkpick" data-i="'+k.id+'">'+(k.img?'<img src="'+k.img+'" alt="">':esc(k.text))+'</button>').join('')+'</div>':'<div class="empty">這裡還沒有內容。<br>到「字卡」頁新增。</div>')+'<button class="btn" data-a="close">取消</button>',0)}
function momRefresh(){if(tab!=='home'||!momOpen||momPlacing||$('#sh').classList.contains('show')||(document.activeElement&&document.activeElement.id==='momsigin'))return;const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y}
const momPos=()=>+(6+rnd()*88).toFixed(1),momHit=p=>rnd()*100<Math.max(0,Math.min(100,+p||0)),momRange=(a,b)=>{a=Math.max(0,Math.round(+a||0));b=Math.max(a,Math.round(+b||0));return a+ri(b-a+1)};
/* ── 聯絡人發布朋友圈：字卡 → 表情包 → 貼紙，全部完成後一起發布 ── */
function momNext(cid,n){const c=S.contacts.find(x=>x.id===cid);if(!c)return;const m=cmo(c),old=S.mst[cid],mx=Math.max(+m.tmin||0,+m.tmax||0,1)*1000,rs=old&&old.rs?Math.max(n,old.rs+mx):n;/* 一輪從 rs 開始；最長時間結束後（rs+最長）才開始下一輪 */S.mst[cid]={ph:'j',rs,due:rs+inspRand(m.tmin,m.tmax)}}
function momStartCard(cid,st,n){const pl=cardPool(cid);if(!pl.length){momNext(cid,n);return}const s=S.set;st.d.cur={t:pk(pl).text};st.q=[['emj','mpemj'],['kao','mpkao']].filter(a=>(+s[a[1]]||0)>0).map(a=>a[0]);momNextQ(cid,st,n+STEP)}
function momNextQ(cid,st,n){const s=S.set;if(st.q.length){const k=st.q[0];st.ph='s';st.due=n+Math.max(0,+s[k==='emj'?'mpemjT':'mpkaoT']||0)*1000+STEP;return}
  st.d.cards.push(st.d.cur.t);st.d.cur=null;if(st.d.cards.length<st.d.n)momStartCard(cid,st,n);else momAfterCards(cid,st,n)}
function momFinish(cid,text,d,n){const np={id:uid(),cid,t:Date.now(),x:text,wall:((d.items&&d.items.length)||(d.st&&d.st.length))?{items:d.items||[],st:d.st||[]}:null};np.nt=1;S.moments.push(np);mcmPost(np);momNext(cid,n);try{updateMomBadge();const c=S.contacts.find(z=>z.id===cid);if(c&&S.set.momNotify!==0){const x=c.name+' 發布了朋友圈';ms(cid).push({id:uid(),f:'sys',x,t:Date.now(),go:'mom'});banner(x,6000,'mom');if(tab==='chat'&&S.cur===cid)paint()}}catch(e){}}
function momAfterCards(cid,st,n){const c=S.contacts.find(x=>x.id===cid),text=st.d.cards.reduce(cjR,'');
  if(!cmo(c).wall||!stkPool(cid).length){momFinish(cid,text,{},n);return}
  st.d.text=text;st.d.items=[];st.d.st=[];st.ph='e';st.due=n+inspRand(S.set.mwEmin,S.set.mwEmax)+STEP}
function momTick(){if(!S||!S.mst)return false;const n=Date.now(),s=S.set;let ch=false;
  Object.keys(S.mst).forEach(id=>{const c=S.contacts.find(x=>x.id===id);if(!c||!cmo(c).on){delete S.mst[id];ch=true}});
  S.contacts.forEach(c=>{const m=cmo(c);if(!m.on)return;const cid=c.id,st=S.mst[cid];
    if(!st){momNext(cid,n);ch=true;return}if(st.due>n)return;ch=true;
    switch(st.ph){
      case 'j':if(momHit(m.prob)){st.ph='c';st.due=n+inspRand(s.mpcmin,s.mpcmax)}else momNext(cid,n);break;
      case 'c':st.d={cards:[],n:Math.max(1,momRange(s.mpnmin,s.mpnmax)),cur:null};momStartCard(cid,st,n);break;
      case 's':{const k=st.q.shift(),items=pool(k,cid);let ex=0;if(items.length&&momHit(s[k==='emj'?'mpemj':'mpkao'])){const z=pk(items).text;st.d.cur.t=rnd()<.5?z+' '+st.d.cur.t:st.d.cur.t+' '+z;ex=STEP}momNextQ(cid,st,n+ex);break}
      case 'e':{const em=pool('emoji',cid);let ex=0;if(em.length&&momHit(s.mwEp)){const k=momRange(s.mwNmin,s.mwNmax);for(let i=0;i<k;i++)st.d.items.push(Object.assign({k:'s'},mItem(pk(em))));ex=STEP}st.ph='k';st.due=n+ex+inspRand(s.mwSmin,s.mwSmax)+STEP;break}
      case 'k':{const sp=stkPool(cid);if(sp.length&&momHit(s.mwSp)){const k=momRange(s.mwKmin,s.mwKmax);st.d.pend=Array.from({length:k},()=>mItem(pk(sp)));if(st.d.pend.length){st.ph='p';st.due=n+STEP+Math.max(0,+s.mwPlace||0)*1000+STEP;break}}momFinish(cid,st.d.text,st.d,n);break}
      case 'p':st.d.st=st.d.pend.map(o=>({id:uid(),img:o.img,x:o.x,px:momPos(),py:momPos(),by:cid,t:n}));momFinish(cid,st.d.text,st.d,n);break;
      default:momNext(cid,n)}});
  return ch}
/* ── 貼圖回覆：使用者貼貼紙後，聯絡人判定是否回覆貼紙 ── */
function mrepSchedule(p){const s=S.set;if(!s.srOn||!p)return;const oc=p.cid==='me'?S.cur:p.cid;S.mrep.push({id:uid(),cid:oc,pid:p.id,ph:'j',due:Date.now()+Math.max(0,+s.srJudge||0)*1000})}
function mrepTick(){if(!S||!S.mrep||!S.mrep.length)return false;const n=Date.now(),s=S.set;let ch=false;const keep=[];
  S.mrep.forEach(r=>{const post=S.moments.find(x=>x.id===r.pid);if(!post||!post.wall||!S.contacts.some(c=>c.id===r.cid)){ch=true;return}
    if(r.due>n){keep.push(r);return}ch=true;
    if(r.ph==='j'){if(momHit(s.srProb)){r.ph='c';r.due=n+inspRand(s.srMin,s.srMax);keep.push(r)}return}
    if(r.ph==='c'){const sp=stkPool(r.cid);if(!sp.length)return;r.q=Array.from({length:momRange(s.srNmin,s.srNmax)},()=>mItem(pk(sp)));if(!r.q.length)return;r.ph='p';r.due=n+STEP+Math.max(0,+s.srPlace||0)*1000+STEP;keep.push(r);return}
    if(r.ph==='p'){const o=r.q.shift();post.wall.st=post.wall.st||[];post.wall.st.push({id:uid(),img:o.img,x:o.x,px:momPos(),py:momPos(),by:r.cid,t:n});if(r.q.length){r.due=n+STEP+STEP;keep.push(r)}}});
  S.mrep=keep;return ch}
/* ── 聯絡人留言：主動留言（其他聯絡人的貼文）／回覆留言（其他聯絡人的留言） ── */
const MCM_GAP=1500;
function mcmCfg(k){const s=S.set,p=(k!=='p'&&!s.crSame)?'cr':'cm';return{prob:+s[p+'Prob']||0,tmin:s[p+'Tmin'],tmax:s[p+'Tmax'],nmin:s[p+'Nmin'],nmax:s[p+'Nmax'],fmin:s[p+'Fmin'],fmax:s[p+'Fmax'],ep:+s[p+'Ep']||0,emj:+s[p+'Emj']||0,emjT:s[p+'EmjT'],kao:+s[p+'Kao']||0,kaoT:s[p+'KaoT']}}
function mcmPost(post){if(!S.set.cmOn||!post||post.cid==='me')return;S.mcm=S.mcm||[];const n=Date.now();S.contacts.forEach(c=>{if(c.id!==post.cid)S.mcm.push({id:uid(),k:'p',cid:c.id,pid:post.id,ph:'j',due:n+1000})})}
function mcmReply(post,cm){if(!S.set.crOn||!post||!cm||!cm.cid)return;S.mcm=S.mcm||[];const n=Date.now();S.contacts.forEach(c=>{if(c.id!==cm.cid)S.mcm.push({id:uid(),k:'r',cid:c.id,pid:post.id,mid:cm.id,to:cm.n,ph:'j',due:n+1000})})}
/* 先排好本輪所有留言與送出時間：每條字卡後 emoji／顏文字各自等待選擇時間再判定；表情包每輪只判定一次，抽中當作一條留言插在隨機位置（與聊天室相同） */
/* 你留言／回覆後，被回覆的聯絡人依回覆設置的機率判定是否回覆你；你再回覆，就再判定一次，直到判定失敗或你不再回覆 */
function mcmUser(post,cm,tcid){if(!S.set.crOn||!post||post.cid==='me'||!cm||!cm.id||!S.contacts.some(c=>c.id===tcid))return;S.mcm=S.mcm||[];S.mcm.push({id:uid(),k:'u',cid:tcid,pid:post.id,mid:cm.id,to:S.me,ph:'j',due:Date.now()+1000})}
function mcmBuild(j,n){const cf=mcmCfg(j.k),cid=j.cid,pl=cardPool(cid);if(!pl.length)return[];
  const EJ=pool('emj',cid),KA=pool('kao',cid),cnt=(a,b)=>Math.max(1,momRange(a,b));let off=n;const out=[];
  for(let i=0,N=cnt(cf.nmin,cf.nmax);i<N;i++){
    const x=Array.from({length:cnt(cf.fmin,cf.fmax)},()=>{off+=STEP;let c=pk(pl).text;[[EJ,cf.emj,cf.emjT],[KA,cf.kao,cf.kaoT]].forEach(([items,p,T])=>{if(p<=0)return;off+=Math.max(0,+T||0)*1000+STEP;if(items.length&&momHit(p)){off+=STEP;const z=pk(items).text;c=rnd()<.5?z+' '+c:c+' '+z}});return c}).reduce(cjR,'');
    out.push({x,at:off});off+=MCM_GAP}
  const em=pool('emoji',cid);if(em.length&&cf.ep>0){off+=STEP;if(momHit(cf.ep)){off+=STEP;const e=mItem(pk(em));out.push({x:e.x,img:e.img,at:off})}}
  let prev=n-MCM_GAP;out.forEach(o=>{o.at=Math.max(o.at==null?0:o.at,prev+MCM_GAP);prev=o.at});return out}
function mcmSend(j,o,post){const c=S.contacts.find(x=>x.id===j.cid);if(!c)return;post.cmts=Array.isArray(post.cmts)?post.cmts:[];const m={id:uid(),cid:j.cid,n:c.name,x:o.x||'',img:o.img||''};if(j.k!=='p'){m.rt=j.to;m.rid=j.mid}post.cmts.push(m);if(j.k==='p')mcmReply(post,m)}
function mcmTick(){if(!S||!S.mcm||!S.mcm.length)return false;const n=Date.now(),s=S.set;let ch=false;const list=S.mcm;S.mcm=[];const keep=S.mcm;
  list.forEach(j=>{const post=S.moments.find(x=>x.id===j.pid);if(!post||!S.contacts.some(c=>c.id===j.cid)||!(j.k==='p'?s.cmOn:s.crOn)){ch=true;return}
    if(j.due>n){keep.push(j);return}ch=true;
    if(j.ph==='j'){const cf=mcmCfg(j.k);if(momHit(cf.prob)){j.ph='w';j.due=n+inspRand(cf.tmin,cf.tmax);keep.push(j)}return}
    if(j.ph==='w'){j.q=mcmBuild(j,n);if(j.q.length){j.ph='s';j.due=j.q[0].at;keep.push(j)}return}
    if(j.ph==='s'){do{const o=j.q.shift();mcmSend(j,o,post)}while(j.q.length&&j.q[0].at<=n);if(j.q.length){j.due=j.q[0].at;keep.push(j)}}});
  return ch}
function resumeTick(){try{const a=momTick(),b=mrepTick(),c=mcmTick();if(a||b||c){save();momRefresh()}}catch(x){}try{letterTick()}catch(x){}}
setInterval(()=>{try{const a=momTick(),b=mrepTick(),c=mcmTick();if(a||b||c){save();momRefresh()}}catch(x){}},1000);
document.addEventListener('input',e=>{if(e.target.id==='momsigin'){S.momSig=e.target.value.slice(0,40);saveSoon()}});