

/* ── 朋友圈 ── */
let momOpen=false;
const MOM_PEN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
let momTab='ct',momCD=null,momPop=null,momDraft=null,momPlacing=null,momPK='kao',momSK='emoji',momStkPost=null;
const stkPool=cid=>pool('emoji',cid).concat(pool('emj',cid));
const mItem=k=>({img:k.img||'',x:k.img?'':k.text});
function momWall(p){const w=p.wall;if(!w)return '';
  const it=Array.isArray(w.items)?w.items:[],st=Array.isArray(w.st)?w.st:[];
  const cell=o=>'<div class="mw-c">'+(o.img?'<img src="'+o.img+'" alt="">':esc(o.x||''))+'</div>',blank='<div class="mw-c"></div>';
  let rows='',buf=[];const flush=()=>{if(!buf.length)return;const n=Math.ceil(buf.length/3)*3;rows+='<div class="mw-g">'+buf.map(cell).join('')+blank.repeat(n-buf.length)+'</div>';buf=[]};
  it.forEach(o=>{if(o.k==='i'){flush();rows+='<div class="mw-i"><img src="'+o.img+'" alt=""></div>'}else buf.push(o)});flush();
  if(!rows)rows='<div class="mw-g">'+blank.repeat(st.length?6:3)+'</div>';
  const pl=!!(momPlacing&&momPlacing.pid===p.id);
  const sk=st.map(t=>'<div class="mom-stk'+(t.by==='me'?' mine':'')+'" style="left:'+t.px+'%;top:'+t.py+'%"'+(t.by==='me'&&!momPlacing?' data-a="stkdel" data-i="'+p.id+'|'+t.id+'"':'')+'>'+(t.img?'<img src="'+t.img+'" alt="">':esc(t.x||''))+'</div>').join('');
  return '<div class="mom-wall'+(S.momStk===0?' nostk':'')+(pl?' placing':'')+'"><div class="mw-in"'+(pl?' data-a="momplace" data-i="'+p.id+'"':'')+'>'+rows+sk+'</div></div>'}
const MI_H=f=>'<svg viewBox="0 0 24 24" fill="'+(f?'currentColor':'none')+'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.2C5.2 15.5 3.6 11.2 5.8 8.3c1.8-2.3 4.9-2 6.2.3 1.3-2.3 4.4-2.6 6.2-.3 2.2 2.9.6 7.2-6.2 11.9Z"/></svg>',MI_S='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3 10.5 13.5"/><path d="M21 3l-6.5 18-4-7.5L3 9.5z"/></svg>';
const MI={edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',del:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',face:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14c1.8 2 5.2 2 7 0"/><circle cx="9" cy="10" r=".6" fill="currentColor"/><circle cx="15" cy="10" r=".6" fill="currentColor"/></svg>'};
/* ── 留言：一則一欄；回覆放在該留言下方、同一欄；每一欄、每條回覆都有「回覆」鍵 ── */
const momRootId=(cm,m)=>{let c=m,g=0;while(c&&c.rid&&g++<60){const up=cm.find(x=>x.id===c.rid);if(!up)break;c=up}return c.id};
function momThreads(cm){const roots=[],by={};cm.forEach(m=>{if(momRootId(cm,m)===m.id){roots.push(m);by[m.id]=[]}});cm.forEach(m=>{const r=momRootId(cm,m);if(r!==m.id&&by[r])by[r].push(m)});return roots.map(r=>({root:r,rep:by[r.id]}))}
const momCTime=t=>{const d=new Date(t);return (d.getMonth()+1)+'/'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
let momSel=null;
const momLine=(m,pid,isRep)=>{const sel=!!(momSel&&m.id&&momSel.mid===m.id&&momSel.pid===pid),k=pid+'|'+m.id,
  bar=sel?'<div class="mom-cbar"><button type="button" data-a="momcmdel" data-i="'+k+'">刪除</button><button type="button" data-a="momcedit" data-i="'+k+'">編輯</button><button type="button" data-a="momcsx" aria-label="取消">×</button></div>':'';
  return '<div class="mom-cw">'+bar+'<div class="mom-cl'+(isRep?' rp':'')+(sel?' sel':'')+'"><div class="mom-ct"'+(m.id&&pid?' data-a="momcsel" data-i="'+k+'"':'')+'><b>'+esc(m.n)+'</b>'+(isRep&&m.rt?' 回覆 <b>'+esc(m.rt)+'</b>':'')+'：'+esc(m.x||'')+(m.img?'<img class="mom-cimg" src="'+m.img+'" alt="">':'')+(m.t?'<span class="mom-cts">'+momCTime(m.t)+'</span>':'')+'</div>'+(m.id&&pid?'<button type="button" class="mom-rpb" data-a="momrep" data-i="'+k+'">回覆</button>':'')+'</div></div>'};
document.addEventListener('click',e=>{if(!momSel||e.target.closest('.mom-cw'))return;momSel=null;try{momCSync();const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y}catch(x){}});
function momCols(p){const cm=Array.isArray(p.cmts)?p.cmts:[];if(!cm.length)return '';p.cxs=p.cxs&&typeof p.cxs==='object'?p.cxs:{};
  return '<div class="mom-cols">'+momThreads(cm).map(t=>{const rid=t.root.id,open=!!p.cxs[rid],reps=t.rep,show=open?reps:reps.slice(0,1);
    return '<div class="mom-col">'+momLine(t.root,p.id,0)+(show.length?'<div class="mom-reps">'+show.map(m=>momLine(m,p.id,1)).join('')+'</div>':'')+(reps.length>1?'<button type="button" class="mom-cx" data-a="momcx" data-i="'+p.id+'|'+rid+'">'+(open?'收起留言':'展開留言（共 '+reps.length+' 條回覆）')+'</button>':'')+'</div>'}).join('')+'</div>'}
/* ── 留言草稿：每則貼文各自一份，輸入框一直在留言下方，重畫畫面也不會掉內容 ── */
let momDr={};
const momDrOf=pid=>momDr[pid]||(momDr[pid]={x:'',img:'',rid:null,rt:null,rcid:null});
const momOwner=p=>p.cid==='me'?S.cur:p.cid;
function momCSync(){document.querySelectorAll('.mom-cin').forEach(e=>{const p=e.dataset.pid;if(p)momDrOf(p).x=e.value})}
/* 點留言圖示／回覆鍵＝點該貼文的輸入框：捲到輸入框的位置並開始輸入 */
function momFocusIn(pid){const v=$('#v'),e=document.querySelector('.mom-cin[data-pid="'+pid+'"]');if(!e)return;
  try{e.focus({preventScroll:true});const n=e.value.length;e.setSelectionRange(n,n)}catch(x){}
  const go=()=>{try{const box=e.closest('.mom-cbox')||e,r=box.getBoundingClientRect(),vr=v.getBoundingClientRect(),room=Math.min(vr.height*.45,260);if(r.bottom>vr.bottom-room||r.top<vr.top+8)v.scrollTop+=r.bottom-(vr.bottom-room)}catch(x){}};go();setTimeout(go,350)}
function momCRender(pid){const v=$('#v'),y=v.scrollTop;momCSync();render();v.scrollTop=y;momFocusIn(pid)}
function momCBox(p){const d=momDrOf(p.id);
  return '<div class="mom-cbox">'+(d.rt?'<div class="mom-cto"><span>回覆 '+esc(d.rt)+'：'+esc(d.rx||'')+'</span><button type="button" data-a="momcrx" data-i="'+p.id+'" aria-label="取消回覆">×</button></div>':'')+(d.img?'<div class="mom-cpv"><img src="'+d.img+'" alt=""><button type="button" data-a="momcimgx" data-i="'+p.id+'" aria-label="移除表情包">×</button></div>':'')+
  '<div class="mom-crow"><button type="button" class="mom-cem" data-a="momcemo" data-i="'+p.id+'" aria-label="選擇表情包">'+MI.face+'</button><input class="mom-cin" data-pid="'+p.id+'" type="text" maxlength="100" enterkeyhint="send" placeholder="'+(d.rt?'回覆 '+esc(d.rt)+'…':'寫下留言…')+'" autocomplete="off" value="'+esc(d.x||'')+'"><button type="button" class="mom-csend" data-a="momcsend" data-i="'+p.id+'" aria-label="送出留言">'+MI_S+'</button></div></div>'}
function momPost(p){const me=p.cid==='me',c=me?{id:'me',av:S.meAv,name:S.me}:S.contacts.find(x=>x.id===p.cid);if(!c)return '';const im=Array.isArray(p.imgs)?p.imgs.slice(0,9):[],likes=Array.isArray(p.likes)?p.likes:[],cm=Array.isArray(p.cmts)?p.cmts:[];
  const top=(momEd&&momEd.id===p.id&&me)?'':'<button class="mom-top" data-a="'+(me?'mompedit':'momdelask')+'" data-i="'+p.id+'" aria-label="'+(me?'編輯貼文':'刪除貼文')+'">'+(me?MI.edit:MI.del)+'</button>';
  const acts='<div class="mom-acts"><button class="mom-ic mom-heart'+(p.liked?' lk':'')+(p.liked&&momPop===p.id?' pop':'')+'" data-a="momlike" data-i="'+p.id+'" aria-label="點贊">'+MI_H(p.liked)+'</button><button class="mom-ic" data-a="momcmt" data-i="'+p.id+'" aria-label="留言"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.6-.8L4 20l1.4-3.4A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg></button><button class="mom-ic" data-a="mstk" data-i="'+p.id+'" aria-label="貼紙">'+MI.face+'</button><button class="mom-ic'+(p.fav?' fv':'')+'" data-a="momfav" data-i="'+p.id+'" aria-label="收藏">'+(p.fav?'★':'☆')+'</button></div>';
  return '<div class="mom-post">'+top+'<div class="mom-hd">'+avh(c,'msgav')+'<div><div class="mom-nm">'+esc(c.name)+'</div><div class="mom-time">'+ltime(p.t)+(p.edited?' · 已編輯':'')+'</div></div></div><div class="mom-bd">'+((momEd&&momEd.id===p.id&&me)?momEdHtml(p):(p.x?'<div class="mom-tx">'+esc(p.x)+'</div>':''))+(im.length?'<div class="mom-imgs'+(im.length===1?' one':'')+'">'+im.map(u=>'<img src="'+u+'" alt="">').join('')+'</div>':'')+((momEd&&momEd.id===p.id&&me)?'':momWall(p))+acts+(likes.length?'<div class="mom-re"><span class="mom-lk">'+MI_H(1)+likes.map(esc).join('、')+'</span></div>':'')+momCols(p)+momCBox(p)+'</div></div>'}
/* ── 我的空間：直接在頁面上發文（不用另外按「發布貼文」跳浮窗） ── */
let momNew={x:'',items:[]},momEd=null;
const momEdPv=()=>momEd?momEd.items.map((o,n)=>'<div class="mom-dc'+(o.k==='i'?' mom-dc-photo':'')+'">'+(o.img?'<img src="'+o.img+'" alt="">':esc(o.x||''))+'<b data-a="mern" data-i="'+n+'" aria-label="移除">×</b></div>').join(''):'';
const momEdHtml=p=>'<div class="mom-new mom-ed"><textarea class="mh-in" id="momedtx" rows="3" maxlength="500" placeholder="寫點什麼…" style="resize:none">'+esc(momEd.x)+'</textarea><div class="mom-dr" id="momedpv">'+momEdPv()+'</div><div class="mom-ntools"><button type="button" class="ib" data-a="medel" data-i="'+p.id+'" aria-label="刪除貼文">'+MI.del+'</button><span class="grow"></span><button type="button" class="ib" data-a="meemo" aria-label="顏文字、emoji、表情包">'+MI.face+'</button><button type="button" class="ib" data-a="meimg" aria-label="圖片">'+MI_IMG+'</button><button type="button" class="ib" data-a="mecancel" aria-label="取消編輯"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l16 16M18 6L6 18"/></svg></button><button type="button" class="ib mn-send" data-a="mesave" aria-label="儲存">'+MI_S+'</button></div></div>';
document.addEventListener('input',e=>{if(e.target.id==='momedtx'&&momEd)momEd.x=e.target.value});
const MI_IMG='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 18 5-5 3.5 3.5 2.5-2.5 4 4"/></svg>';
const momNewPv=()=>momNew.items.map((o,n)=>'<div class="mom-dc'+(o.k==='i'?' mom-dc-photo':'')+'">'+(o.img?'<img src="'+o.img+'" alt="">':esc(o.x||''))+'<b data-a="mnrm" data-i="'+n+'" aria-label="移除">×</b></div>').join('');
const momNewHtml=()=>'<div class="card mom-new"><textarea class="mh-in" id="momntx" rows="3" maxlength="500" placeholder="寫點什麼…" style="resize:none">'+esc(momNew.x)+'</textarea><div class="mom-dr" id="momnpv">'+momNewPv()+'</div><div class="mom-ntools"><button type="button" class="ib" data-a="mnemo" aria-label="顏文字、emoji、表情包">'+MI.face+'</button><button type="button" class="ib" data-a="mnimg" aria-label="圖片">'+MI_IMG+'</button><button type="button" class="ib mn-send" data-a="mnsend" aria-label="發布">'+MI_S+'</button></div></div>';
document.addEventListener('input',e=>{if(e.target.id==='momntx')momNew.x=e.target.value});
function vMom(){
  const head='<div class="stickh mom-stkh"><div class="ph2"><button class="ib" data-a="momback">‹</button><h1>朋友圈</h1><span class="grow"></span><span class="mom-stksw">貼紙<button class="sw '+(S.momStk===0?'':'on')+'" data-a="momstk" aria-label="顯示或隱藏貼紙"></button></span></div></div>';
  const sig=S.momSig||'',cv=S.momCover;
  const cover='<div class="mom-head"><div class="mom-cover" data-a="momcover" role="button" aria-label="朋友圈封面"'+(cv?' style="background-image:url('+cv+')"':'')+'>'+(cv?'':'<div class="mom-hint"><b>＋</b>點擊放上封面圖片</div>')+'</div>'+avh({id:'me',av:S.meAv,name:S.me},'big')+'<label class="mom-sig">'+MOM_PEN+'<input id="momsigin" type="text" maxlength="40" placeholder="寫下你的簽名" autocomplete="off" value="'+esc(sig)+'"></label></div>';
  const bar=momPlacing?'<div class="mom-bar"><span>點一下貼圖牆，把貼紙放在想要的位置</span><button class="btn" data-a="momcancel">取消</button></div>':'';
  const tabs='<div class="cards-top mom-sticky"><div class="stabs">'+[['me','我的空間'],['ct','聯絡人貼文']].map(([k,n])=>'<button class="stab '+(momTab===k?'on':'')+'" data-a="momtab" data-i="'+k+'">'+n+'</button>').join('')+'</div></div>';
  const all=[...(S.moments||[])].sort((x,y)=>y.t-x.t);let body;
  if(momTab==='me'){const l=all.filter(p=>p.cid==='me');body=momNewHtml()+(l.length?l.map(p=>'<div class="card mom-one" style="padding:4px 14px">'+momPost(p)+'</div>').join(''):'<div class="empty">你還沒有發布過貼文。</div>')}
  else{const l=all.filter(p=>p.cid!=='me'&&S.contacts.some(c=>c.id===p.cid));if(l.some(p=>!p.seen)){l.forEach(p=>{p.seen=1});saveSoon()}body=l.length?l.map(p=>'<div class="card mom-one" style="padding:4px 14px">'+momPost(p)+'</div>').join(''):'<div class="empty">還沒有朋友圈貼文。<br>聯絡人發布的貼文會顯示在這裡。</div>'}
  return head+bar+cover+tabs+body}
/* 發布貼文（我的空間） */
function momSync(){const e=$('#momtx');if(e&&momDraft)momDraft.x=e.value}
function momCompose(){const d=momDraft;sheet(d.edit?'編輯貼文':'發布貼文','<textarea class="mh-in" id="momtx" rows="4" maxlength="500" placeholder="寫點什麼…" style="resize:none">'+esc(d.x)+'</textarea><div class="mom-tools"><button class="btn" data-a="mpkopen">顏文字 / emoji / 表情包</button><button class="btn" data-a="mpimg">圖片</button></div>'+(d.items.length?'<div class="mom-dr">'+d.items.map((o,n)=>'<div class="mom-dc'+(o.k==='i'?' mom-dc-photo':'')+'">'+(o.img?'<img src="'+o.img+'" alt="">':esc(o.x||''))+'<b data-a="mdrmask" data-i="'+n+'" aria-label="移除">×</b></div>').join('')+'</div><p class="hint" style="margin:6px 2px">只能點擊右上角「×」移除圖片或表情包。</p>':'')+'<div style="display:flex;gap:8px;margin-top:10px"><button class="btn" data-a="close" style="flex:1;margin:0">取消</button><button class="btn s" data-a="momsend" style="flex:1;margin:0">'+(d.edit?'儲存':'發布')+'</button></div>'+(d.edit?'<button class="btn d" data-a="momdelask" data-i="'+d.edit+'">刪除貼文</button>':''),0)}
function momPvHtml(){const it=(momDraft&&momDraft.items||[]).filter(o=>o.k==='s');return it.length?it.map(o=>'<span class="mom-pvc">'+(o.img?'<img src="'+o.img+'" alt="">':esc(o.x||''))+'</span>').join(''):'<small>選擇的表情包會顯示在這裡</small>'}
function momPicker(){momSync();const T=[['kao','顏文字'],['emj','emoji'],['emoji','表情包']],l=pool(momPK,S.cur);
  sheet('選擇內容','<div class="mom-pv" id="mompv">'+momPvHtml()+'</div><div class="stabs">'+T.map(([k,n])=>'<button class="stab '+(momPK===k?'on':'')+'" data-a="mpktab" data-i="'+k+'">'+n+'</button>').join('')+'</div>'+(l.length?'<div class="mom-pg mom-pgs t-'+momPK+'">'+l.map(k=>'<button data-a="mpkadd" data-i="'+k.id+'">'+(k.img?'<img src="'+k.img+'" alt="">':esc(k.text))+'</button>').join('')+'</div>':'<div class="empty">這裡還沒有內容。<br>到「字卡」頁新增。</div>')+'<button class="btn s" data-a="mpkdone">完成</button>',0)}
/* 表情包／貼紙浮窗：與聊天室的表情浮窗相同（分頁＋分類晶片）；留言沒有顏文字，貼紙多了 emoji */
let momEmo=null;
const MEMO_TABS={n:[['s','共用<br>表情包','emoji','s'],['e','他的專屬<br>表情包','emoji','e'],['k','共用<br>顏文字','kao','s'],['ke','他的專屬<br>顏文字','kao','e'],['m','emoji','emj','']],c:[['s','共用<br>表情包','emoji','s'],['e','他的專屬<br>表情包','emoji','e'],['k','共用<br>顏文字','kao','s'],['ke','他的專屬<br>顏文字','kao','e']],s:[['s','共用<br>表情包','emoji','s'],['e','他的專屬<br>表情包','emoji','e'],['es','共用 emoji','emj','s'],['ee','他的專屬 emoji','emj','e']]};
function momEmoOpen(ctx,pid){let oc=S.cur;if(ctx!=='n'){const p=S.moments.find(x=>x.id===pid);if(!p)return;oc=momOwner(p)}momEmo={ctx,pid,oc,scope:'e',cat:null};momEmoSheet()}
function momEmoSheet(){const E=momEmo;if(!E)return;const tabs=MEMO_TABS[E.ctx],t=tabs.find(x=>x[0]===E.scope)||tabs[0];E.scope=t[0];
  const l=pool(t[2],E.oc).filter(k=>{const g=S.cats.find(c=>c.id===k.cat);return g&&(!t[3]||g.sc===t[3])});E.type=t[2];
  const cs=S.cats.filter(g=>l.some(k=>k.cat===g.id)),cur1=cs.find(g=>g.id===E.cat)||cs[0];E.cat=cur1?cur1.id:null;
  const item=k=>'<button data-a="'+(k.img?'mes':'mek')+'" data-i="'+k.id+'">'+(k.img?'<img src="'+k.img+'">':esc(k.text))+'</button>';
  const chips=cs.length>1?'<div class="emo-cats">'+cs.map(g=>'<button type="button" class="'+(g.id===E.cat?'on':'')+'" data-a="mecsw" data-i="'+g.id+'">'+esc(g.name)+'</button>').join('')+'</div>':'';
  const body=cur1?'<div class="eg chat-eg">'+l.filter(k=>k.cat===cur1.id).map(item).join('')+'</div>':'';
  chatSheet('<div class="emo-sticky"><div class="chat-pop-cats">'+tabs.map(([k,n])=>'<button class="'+(E.scope===k?'on':'')+'" data-a="mesw" data-i="'+k+'">'+n+'</button>').join('')+'</div>'+(l.length?chips:'')+'</div>'+(l.length?body:'<div class="empty">這裡還沒有內容。<br>到「字卡」頁新增。</div>'));$('#sh').classList.add('emo')}
function momRefresh(){if(tab!=='home'||!momOpen||momPlacing||momEd||$('#sh').classList.contains('show')||(document.activeElement&&(document.activeElement.id==='momsigin'||document.activeElement.classList.contains('mom-cin'))))return;const v=$('#v'),y=v.scrollTop;momCSync();render();v.scrollTop=y}
const momPos=()=>+(6+rnd()*88).toFixed(1),momHit=p=>rnd()*100<Math.max(0,Math.min(100,+p||0)),momRange=(a,b)=>{a=Math.max(0,Math.round(+a||0));b=Math.max(a,Math.round(+b||0));return a+ri(b-a+1)};
/* ── 聯絡人發布朋友圈：字卡 → 表情包 → 貼紙，全部完成後一起發布 ── */
function momNext(cid,n,ok){const c=S.contacts.find(x=>x.id===cid);if(!c)return;const m=cmo(c),old=S.mst[cid],lo=Math.min(+m.tmin||0,+m.tmax||0),hi=Math.max(+m.tmin||0,+m.tmax||0),mx=Math.max(ok?lo:hi,1)*1000,rs=old&&old.rs?Math.max(n,old.rs+mx):n;/* 一輪從 rs 開始；判定發布成功：最短時間結束後就開始下一輪；判定失敗：最長時間結束後才開始下一輪 */S.mst[cid]={ph:'j',rs,due:rs+inspRand(m.tmin,m.tmax)}}
function momStartCard(cid,st,n){const pl=cardPool(cid);if(!pl.length){momNext(cid,n);return}const s=S.set;const _k=pk(pl);cuse(cid,_k);st.d.cur={t:_k.text};st.q=[['emj','mpemj'],['kao','mpkao']].filter(a=>(+s[a[1]]||0)>0).map(a=>a[0]);momNextQ(cid,st,n+STEP)}
function momNextQ(cid,st,n){const s=S.set;if(st.q.length){const k=st.q[0];st.ph='s';st.due=n+Math.max(0,+s[k==='emj'?'mpemjT':'mpkaoT']||0)*1000+STEP;return}
  st.d.cards.push(st.d.cur.t);st.d.cur=null;if(st.d.cards.length<st.d.n)momStartCard(cid,st,n);else momAfterCards(cid,st,n)}
function momFinish(cid,text,d,n){const np={id:uid(),cid,t:Date.now(),x:text,wall:((d.items&&d.items.length)||(d.st&&d.st.length))?{items:d.items||[],st:d.st||[]}:null};np.nt=1;S.moments.push(np);mcmPost(np);momNext(cid,n,true);try{updateMomBadge();const c=S.contacts.find(z=>z.id===cid);if(c&&S.set.momNotify!==0){const x=c.name+' 發布了朋友圈';ms(cid).push({id:uid(),f:'sys',x,t:Date.now(),go:'mom'});banner(x,6000,'mom');if(tab==='chat'&&S.cur===cid)paint()}}catch(e){}}
function momAfterCards(cid,st,n){const c=S.contacts.find(x=>x.id===cid),text=st.d.cards.reduce(cjR,'');
  if(!cmo(c).wall||!stkPool(cid).length){momFinish(cid,text,{},n);return}
  st.d.text=text;st.d.items=[];st.d.st=[];st.ph='e';st.due=n+inspRand(S.set.mwEmin,S.set.mwEmax)+STEP}
function momTick(){if(!S||!S.mst)return false;const n=Date.now(),s=S.set;let ch=false;
  Object.keys(S.mst).forEach(id=>{const c=S.contacts.find(x=>x.id===id);if(!c||!cmo(c).on){delete S.mst[id];ch=true}});
  S.contacts.forEach(c=>{try{ctxSet(c.id);const m=cmo(c);if(!m.on)return;const cid=c.id,st=S.mst[cid];
    if(!st){momNext(cid,n);ch=true;return}if(st.due>n)return;ch=true;
    if(c.dnd){momNext(cid,n);return}
    switch(st.ph){
      case 'j':if(momHit(m.prob)){st.ph='c';st.due=n+inspRand(s.mpcmin,s.mpcmax)}else momNext(cid,n);break;
      case 'c':st.d={cards:[],n:Math.max(1,momRange(s.mpnmin,s.mpnmax)),cur:null};momStartCard(cid,st,n);break;
      case 's':{const k=st.q.shift(),items=pool(k,cid);let ex=0;if(items.length&&momHit(s[k==='emj'?'mpemj':'mpkao'])){const z=pk(items).text;st.d.cur.t=rnd()<.5?z+' '+st.d.cur.t:st.d.cur.t+' '+z;ex=STEP}momNextQ(cid,st,n+ex);break}
      case 'e':{const em=pool('emoji',cid);let ex=0;if(em.length&&momHit(s.mwEp)){const k=momRange(s.mwNmin,s.mwNmax);for(let i=0;i<k;i++)st.d.items.push(Object.assign({k:'s'},mItem(pk(em))));ex=STEP}st.ph='k';st.due=n+ex+inspRand(s.mwSmin,s.mwSmax)+STEP;break}
      case 'k':{const sp=stkPool(cid);if(sp.length&&momHit(s.mwSp)){const k=momRange(s.mwKmin,s.mwKmax);st.d.pend=Array.from({length:k},()=>mItem(pk(sp)));if(st.d.pend.length){st.ph='p';st.due=n+STEP+Math.max(0,+s.mwPlace||0)*1000+STEP;break}}momFinish(cid,st.d.text,st.d,n);break}
      case 'p':st.d.st=st.d.pend.map(o=>({id:uid(),img:o.img,x:o.x,px:momPos(),py:momPos(),by:cid,t:n}));st.d.st.forEach(stkShrink);momFinish(cid,st.d.text,st.d,n);break;
      default:momNext(cid,n)}}catch(err){try{console.error('momTick',err);momNext(c.id,Date.now())}catch(e){}ch=true}});
  return ch}
/* ── 貼圖回覆：使用者貼貼紙後，聯絡人判定是否回覆貼紙 ── */
function mrepSchedule(p){const s=S.set;if(!s.srOn||!p)return;const oc=p.cid==='me'?S.cur:p.cid;S.mrep.push({id:uid(),cid:oc,pid:p.id,ph:'j',due:Date.now()+Math.max(0,+s.srJudge||0)*1000})}
function mrepTick(){if(!S||!S.mrep||!S.mrep.length)return false;const n=Date.now(),s=S.set;let ch=false;const keep=[];
  S.mrep.forEach(r=>{try{const post=S.moments.find(x=>x.id===r.pid);if(!post||!post.wall||!S.contacts.some(c=>c.id===r.cid)){ch=true;return}
    if(r.due>n){keep.push(r);return}ch=true;ctxSet(r.cid);if(isDnd(r.cid))return;
    if(r.ph==='j'){if(momHit(s.srProb)){r.ph='c';r.due=n+inspRand(s.srMin,s.srMax);keep.push(r)}return}
    if(r.ph==='c'){const sp=stkPool(r.cid);if(!sp.length)return;r.q=Array.from({length:momRange(s.srNmin,s.srNmax)},()=>mItem(pk(sp)));if(!r.q.length)return;r.ph='p';r.due=n+STEP+Math.max(0,+s.srPlace||0)*1000+STEP;keep.push(r);return}
    if(r.ph==='p'){const o=r.q.shift();post.wall.st=post.wall.st||[];{const t0={id:uid(),img:o.img,x:o.x,px:momPos(),py:momPos(),by:r.cid,t:n};post.wall.st.push(t0);stkShrink(t0);try{save()}catch(e){}}if(r.q.length){r.due=n+STEP+STEP;keep.push(r)}}}catch(err){console.error('mrepTick',err);ch=true}});
  S.mrep=keep;return ch}
/* ── 聯絡人留言：主動留言（其他聯絡人的貼文）／回覆留言（其他聯絡人的留言） ── */
const MCM_GAP=1500;
function mcmCfg(k){const s=S.set,p=(k!=='p'&&!s.crSame)?'cr':'cm';return{prob:+s[p+'Prob']||0,tmin:s[p+'Tmin'],tmax:s[p+'Tmax'],nmin:s[p+'Nmin'],nmax:s[p+'Nmax'],fmin:s[p+'Fmin'],fmax:s[p+'Fmax'],ep:+s[p+'Ep']||0,emj:+s[p+'Emj']||0,emjT:s[p+'EmjT'],kao:+s[p+'Kao']||0,kaoT:s[p+'KaoT']}}
function mcmPost(post){if(!post||post.cid==='me')return;S.mcm=S.mcm||[];const n=Date.now();S.contacts.forEach(c=>{ctxSet(c.id);if(!S.set.cmOn)return;if(c.id!==post.cid)S.mcm.push({id:uid(),k:'p',cid:c.id,pid:post.id,ph:'j',due:n+1000})})}
function mcmReply(post,cm){if(!post||!cm||!cm.cid)return;S.mcm=S.mcm||[];const n=Date.now();S.contacts.forEach(c=>{ctxSet(c.id);if(!S.set.crOn)return;if(c.id!==cm.cid)S.mcm.push({id:uid(),k:'r',cid:c.id,pid:post.id,mid:cm.id,to:cm.n,ph:'j',due:n+1000})})}
/* 先排好本輪所有留言與送出時間：每條字卡後 emoji／顏文字各自等待選擇時間再判定；表情包每輪只判定一次，抽中當作一條留言插在隨機位置（與聊天室相同） */
/* 你留言／回覆後，被回覆的聯絡人依回覆設置的機率判定是否回覆你；你再回覆，就再判定一次，直到判定失敗或你不再回覆 */
function mcmUser(post,cm,tcid){if(!S.contacts.some(c=>c.id===tcid))return;const keep=S.cur;ctxSet(tcid);const on=S.set.crOn;ctxSet(keep);if(!on||!post||post.cid==='me'||!cm||!cm.id||!S.contacts.some(c=>c.id===tcid))return;S.mcm=S.mcm||[];S.mcm.push({id:uid(),k:'u',cid:tcid,pid:post.id,mid:cm.id,to:S.me,ph:'j',due:Date.now()+1000})}
function mcmBuild(j,n){const cf=mcmCfg(j.k),cid=j.cid,pl=cardPool(cid);if(!pl.length)return[];
  const EJ=pool('emj',cid),KA=pool('kao',cid),cnt=(a,b)=>Math.max(1,momRange(a,b));let off=n;const out=[];
  for(let i=0,N=cnt(cf.nmin,cf.nmax);i<N;i++){
    const x=Array.from({length:cnt(cf.fmin,cf.fmax)},()=>{off+=STEP;const _k=pk(pl);cuse(cid,_k);let c=_k.text;[[EJ,cf.emj,cf.emjT],[KA,cf.kao,cf.kaoT]].forEach(([items,p,T])=>{if(p<=0)return;off+=Math.max(0,+T||0)*1000+STEP;if(items.length&&momHit(p)){off+=STEP;const z=pk(items).text;c=rnd()<.5?z+' '+c:c+' '+z}});return c}).reduce(cjR,'');
    out.push({x,at:off});off+=MCM_GAP}
  const em=pool('emoji',cid);if(em.length&&cf.ep>0){off+=STEP;if(momHit(cf.ep)){off+=STEP;const e=mItem(pk(em));out.push({x:e.x,img:e.img,at:off})}}
  let prev=n-MCM_GAP;out.forEach(o=>{o.at=Math.max(o.at==null?0:o.at,prev+MCM_GAP);prev=o.at});return out}
/* 朋友圈通知：和信箱一樣放頂部通知窗，也在該聯絡人的聊天室留一條系統提示 */
function momNote(cid,x){try{if(S.set.momNotify===0)return;ms(cid).push({id:uid(),f:'sys',x,t:Date.now(),go:'mom'});banner(x,6000,'mom');if(tab==='chat'&&S.cur===cid)paint()}catch(e){}}
function mcmSend(j,o,post){const c=S.contacts.find(x=>x.id===j.cid);if(!c)return;post.cmts=Array.isArray(post.cmts)?post.cmts:[];const m={id:uid(),cid:j.cid,n:c.name,x:o.x||'',img:o.img||'',t:Date.now()};if(j.k!=='p'){m.rt=j.to;m.rid=j.mid;/* 回覆出現在該留言同一欄；有新回覆就讓該欄的展開鈕保持原狀 */}post.cmts.push(m);
  if(!j.nt){j.nt=1;const ow=post.cid==='me'?S.me:((S.contacts.find(z=>z.id===post.cid)||{}).name||'');let x;if(j.k==='p')x=c.name+' 在'+(post.cid==='me'?'你':ow)+'的朋友圈留言了';else x=j.to===S.me?c.name+' 回覆了你的留言':c.name+' 回覆了'+j.to+'的留言';momNote(j.cid,x)}
  try{save()}catch(e){}
  /* 聯絡人也會回覆「留言的回覆」：同一串最多 8 則，避免無限對話 */
  {const cm=post.cmts,r=momRootId(cm,m);if(j.k==='p'||cm.filter(x=>momRootId(cm,x)===r).length<8)mcmReply(post,m)}}
function mcmTick(){if(!S||!S.mcm||!S.mcm.length)return false;const n=Date.now(),s=S.set;let ch=false;const list=S.mcm;S.mcm=[];const keep=S.mcm;
  list.forEach(j=>{try{const post=S.moments.find(x=>x.id===j.pid);if(!post||!S.contacts.some(c=>c.id===j.cid)){ch=true;return}
    /* 用這個任務所屬聯絡人的設定判斷（以前用的是「目前選到的聯絡人」的設定，點到別的聯絡人時回覆就被丟掉） */
    ctxSet(j.cid);if(!(j.k==='p'?s.cmOn:s.crOn)){ch=true;return}
    if(j.due>n){keep.push(j);return}ch=true;ctxSet(j.cid);if(isDnd(j.cid))return;
    if(j.ph==='j'){const cf=mcmCfg(j.k);if(momHit(cf.prob)){j.ph='w';j.due=n+inspRand(cf.tmin,cf.tmax);keep.push(j)}return}
    if(j.ph==='w'){j.q=mcmBuild(j,n);if(j.q.length){j.ph='s';j.due=j.q[0].at;keep.push(j)}return}
    if(j.ph==='s'){do{const o=j.q.shift();mcmSend(j,o,post)}while(j.q.length&&j.q[0].at<=n);if(j.q.length){j.due=j.q[0].at;keep.push(j)}}}catch(err){console.error('mcmTick',err);ch=true}});
  return ch}
function resumeTick(){try{const a=momTick(),b=mrepTick(),c=mcmTick();if(a||b||c){save();momRefresh()}}catch(x){}try{letterTick()}catch(x){}}
setInterval(()=>{try{const a=momTick(),b=mrepTick(),c=mcmTick();if(a||b||c){save();momRefresh()}}catch(x){}},1000);
document.addEventListener('input',e=>{if(e.target.id==='momsigin'){S.momSig=e.target.value.slice(0,40);saveSoon()}});
document.addEventListener('input',e=>{const t=e.target;if(t.classList&&t.classList.contains('mom-cin')&&t.dataset.pid)momDrOf(t.dataset.pid).x=t.value});
document.addEventListener('keydown',e=>{const t=e.target;if(e.key==='Enter'&&!e.isComposing&&t.classList&&t.classList.contains('mom-cin')){e.preventDefault();const b=t.closest('.mom-cbox').querySelector('.mom-csend');if(b)b.click()}});
