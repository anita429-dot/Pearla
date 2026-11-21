

/* ── 答案之書 ── */
let abOpen=false,abTab='num',abN='',abQ='',abRes=null;
const AB=["是的，毫無疑問。", "答案就在你心裡，你早已知道。", "現在還不是時候，再等一等。", "勇敢去做吧，結果會讓你驚喜。", "先放一放，過幾天再問自己一次。", "可以，但要多為自己留一點餘地。", "不必猶豫，跟著直覺走。", "答案是肯定的，只是過程需要耐心。", "這件事值得你認真對待。", "暫時不要，保存體力等待更好的時機。", "去問問信任的人，他們會給你力量。", "你比自己想像的更有能力。", "不要急著下結論，再多看一眼。", "是的，而且會比預期的更好。", "放下執著，事情自然會有出路。", "別害怕改變，改變正在帶你前往更好的地方。", "這次請先照顧好自己。", "可以試試看，失敗也是一種收穫。", "答案是否定的，但門並沒有關上。", "順其自然，不必強求。", "現在就開始，不要等到準備完美。", "換個角度，答案會不一樣。", "相信自己的選擇，它是對的。", "需要更多資訊，先去了解清楚。", "好事正在路上，請保持期待。", "不，但你會找到更適合的路。", "停下來，好好睡一覺再決定。", "讓時間來回答你。", "這是一個好主意，立刻行動。", "小心謹慎，細節裡藏著關鍵。", "答案很簡單：去做就對了。", "你已經走在正確的路上了。", "把這件事說出口，心裡會輕鬆許多。", "暫時保持沉默，觀察比表態更重要。", "放心，一切都會慢慢好起來。", "這個問題的答案，會在下一次相遇時揭曉。", "可以，但請先照顧好你自己的感受。", "你值得更好的，不要將就。", "答案是肯定的，請帶著微笑前進。", "先完成手邊的事，再回頭來看。", "不要和別人比較，你有自己的節奏。", "今天的你，已經做得很好了。", "請信任這個過程。", "有人正在默默支持著你。", "放手一搏，你不會後悔。", "答案是否定的，現在放棄反而是一種智慧。", "去喝杯熱飲，靜下來再想一想。", "機會就在眼前，伸手抓住它。", "不要被恐懼左右，恐懼往往比事實更大。", "你需要的不是答案，而是一點勇氣。", "是的，但要先學會說「不」。", "再耐心一點點，快要到了。", "換個方式嘗試，也許更輕鬆。", "有些事情不需要被解決，只需要被接受。", "聽聽身體的聲音，它比頭腦更誠實。", "答案是肯定的，記得和重要的人分享喜悅。", "暫時不要承諾任何事。", "讓自己休息吧，你已經夠努力了。", "去做一件讓自己開心的小事，答案自然浮現。", "這不是終點，而是新的開始。", "可以，但要先設好底線。", "不必立刻回答，你擁有選擇的時間。", "是的，而且是時候了。", "放寬心，事情沒有你想的那麼糟。", "勇敢說出你真正想要的。", "再確認一次，別讓衝動做決定。", "答案藏在你最近忽略的小事裡。", "你不是一個人，伸出手就有人接住。", "不，現在最重要的是讓心情平靜。", "一個溫柔的好消息正在靠近。", "先從最小的一步開始。", "相信緣分，該來的終會到來。", "可以的，只要你願意相信。", "請對自己多一點溫柔。", "今天不適合做重大決定。", "答案是肯定的，宇宙正在為你鋪路。", "不用再想了，你心裡早已有答案。", "放下過去，才能擁抱新的可能。", "會有轉機，只是它不會大聲敲門。", "去見見久未聯絡的人吧。", "保持好奇心，答案會自己走向你。", "這件事不如你想的那麼重要，不必太糾結。", "是的，你值得擁有。", "給自己一個擁抱，然後繼續前進。", "改變計畫並不丟臉，那是成長。", "先聽聽別人的想法，再做決定。", "不要太用力，輕輕地就好。", "你的直覺比任何理由都可靠。", "再給彼此一點空間。", "是的，但要保持謙虛。", "這是個學習的機會，不是考驗。", "答案是否定的，但你會因此遇見更好的。", "讓心安靜下來，聲音自然變得清楚。", "耐心等待，開花需要時間。", "你的努力沒有白費，只是尚未被看見。", "請相信，明天會更好。", "是的，帶著感謝去迎接它。", "勇敢向前，星星會替你照路。", "答案是：愛你自己，從現在開始。", "一切都在最好的安排之中。"];
const abPage=n=>((n-1)%AB.length)+1;
function abMake(n,mode){const p=abPage(n);abRes={id:uid(),t:Date.now(),mode,n,p,a:AB[p-1],q:abQ.trim()};render();const el=$('#abres');if(el)el.scrollIntoView({block:'center',behavior:'smooth'})}
function abGo(){const a=abN.trim();if(!/^\d+$/.test(a)){toast('請輸入一個正整數');return}const n=Number(a);if(!Number.isSafeInteger(n)||n<=0){toast('數字必須是正整數，且不可過大');return}abMake(n,'num')}
function abRand(){abMake(1+Math.floor(Math.random()*AB.length),'rand')}
function abResultHtml(x){return '<div class="ab-pg"><div class="ab-no">第 '+x.p+' 頁</div><div class="ab-tx">'+esc(x.a)+'</div><div class="ab-sub">'+(x.mode==='rand'?'隨機數字 ':'輸入數字 ')+x.n+(x.n!==x.p?' → 第 '+x.p+' 頁':'')+'</div></div>'}
function vAb(){
  const head='<div class="ph2"><button class="ib" data-a="abback">‹</button><h1>答案之書</h1></div>';
  const tabs='<div class="stabs" style="margin:-4px 0 10px">'+[['num','輸入數字'],['rand','隨機翻頁']].map(([k,n])=>'<button class="stab '+(abTab===k?'on':'')+'" style="flex:1" data-a="abtab" data-i="'+k+'">'+n+'</button>').join('')+'</div>';
  const q='<div class="abq-wrap"><textarea class="mh-in" id="abq" rows="3" placeholder="心中所問（可留空）" style="resize:none;line-height:1.6;min-height:88px;display:block;padding-right:42px">'+esc(abQ)+'</textarea><button type="button" class="abq-clear" data-a="abqclear" aria-label="清除問題">×</button></div>';
  const body=abTab==='num'
    ?'<input class="mh-in" id="abn" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="輸入任意正整數" value="'+esc(abN)+'" style="margin-top:12px"><p class="hint" style="margin:6px 2px 0">默念心中的問題，輸入一個數字。書共 '+AB.length+' 頁，超過 '+AB.length+' 的數字會從頭繞回（例如 '+(AB.length+1)+' → 第 1 頁）。</p><div style="display:flex;gap:10px;margin-top:14px"><button class="btn" style="flex:1;margin:0" data-a="abreset">重置</button><button class="btn s" style="flex:1;margin:0" data-a="abgo">翻開答案</button></div>'
    :'<p class="hint" style="margin:12px 2px 0">專心想著你的問題，讓書替你隨機抽一個數字（1–'+AB.length+'）並翻到那一頁。</p><div style="display:flex;gap:10px;margin-top:14px"><button class="btn" style="flex:1;margin:0" data-a="abreset">重置</button><button class="btn s" style="flex:1;margin:0" data-a="abrand">隨機翻頁</button></div>';
  return head+tabs+'<div class="card" style="margin-top:12px">'+q+body+'</div>'+(abRes?'<div class="card" id="abres" style="margin-top:12px">'+abResultHtml(abRes)+'<button class="btn" style="width:100%;margin:12px 0 0" data-a="absave">保存紀錄</button></div>':'')}

/* ── 群聊 ── */
let grpOpen=false,grpRoom=null,gEditId=null;
const grp=id=>(S.groups||[]).find(g=>g.id===id);
const gAv=g=>avh({id:g.id,av:g.av,name:g.name},'');
const gMembers=g=>g.members.filter(x=>S.contacts.some(c=>c.id===x));
function gDefName(exId){let n=1;const used=new Set((S.groups||[]).filter(g=>g.id!==exId).map(g=>g.name));while(used.has('群聊'+n))n++;return'群聊'+n}
function vGrpList(){const gs=S.groups||[];
  return '<div class="ph2"><button class="ib" data-a="grpback">‹</button><h1>群聊</h1></div>'
   +gs.map(g=>'<div class="row" data-a="gopen" data-i="'+g.id+'"><button class="cstar'+(S.gdef===g.id?' on':'')+'" data-a="gdef" data-i="'+g.id+'" aria-label="設為預設群聊">'+(S.gdef===g.id?'★':'☆')+'</button>'+(S.un[g.id]?'<b class="cb">'+S.un[g.id]+'</b>':'')+gAv(g)+'<div class="grow"><span class="nm">'+esc(g.name)+'</span><small>'+gMembers(g).length+' 位成員'+(S.gdef===g.id?' · 預設群聊':'')+'</small></div><button class="btn" data-a="gedit" data-i="'+g.id+'" style="width:auto;margin:0;padding:6px 12px">編輯</button></div>').join('')
   +(gs.length?'':'<div class="empty">還沒有群聊。</div>')
   +'<button class="btn s" style="width:100%" data-a="gadd">＋ 新增群聊</button><p class="hint">點群聊進入聊天室；按星號設為預設群聊後，點主頁的「群聊」會直接進入該聊天室。群聊裡的聯絡人各自依自己的設定發送字卡，互不影響。</p>'}
function gsheet(id){const g=grp(id);if(!g)return;gEditId=id;
  const mem=S.contacts.map(c=>{const on=g.members.includes(c.id);return '<div class="lt pick gmem'+(on?' sel':'')+'" data-a="gmem" data-i="'+c.id+'">'+avh(c,'msgav')+'<span style="flex:1;min-width:0">'+esc(c.name)+'</span><span class="ck '+(on?'on':'')+'"></span></div>'}).join('');
  sheet('編輯群聊','<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">'+gAv(g)+'<input id="gname" value="'+esc(g.name)+'" placeholder="群聊名稱" style="flex:1;min-width:0"></div><p class="hint" style="margin:0 0 6px">點頭像可更換群聊照片；名稱留空會自動命名。</p><div class="sr" style="margin:6px 0"><span>群聊成員</span></div><div style="max-height:34vh;overflow:auto">'+(mem||'<div class="empty">還沒有聯絡人，請先到「聯絡人」新增。</div>')+'</div><button class="btn s" data-a="gdone">完成</button><button class="btn d" data-a="gdel" data-i="'+id+'">刪除群聊</button>',1)}
function vGrpRoom(){const g=grp(grpRoom);if(!g){grpRoom=null;return vGrpList()}
  return '<div class="ch"><div class="chh"><button class="ib" data-a="grpback" aria-label="返回">‹</button>'+avh({id:g.id,av:g.av,name:g.name},'msgav')+'<div class="grow"><b style="font-weight:500">'+esc(g.name)+'</b><small class="chat-status">'+gMembers(g).length+' 位成員</small></div></div><div class="clw"><div id="cl" class="cl"></div><button id="tobot" class="tobot" type="button" data-a="tobot" aria-label="回到最新消息"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg></button></div><form id="f"><input id="in" placeholder="說點什麼…" autocomplete="off"><button class="btn s" style="flex:none">送出</button></form></div>'}
const gTyping=(gid,cid)=>{const k=gid+'|'+cid,R=S.rounds[k];return !!((R&&R.ph===2)||tqOn(typingQ[k]))};
function paintG(){const l=$('#cl');if(!l||!grpRoom)return;const g=grp(grpRoom);if(!g)return;const a=ms(g.id);
  l.innerHTML=a.length?a.map(m=>{if(m.f==='sys')return '<div class="sys'+(m.pat?' pat':'')+'" id="m-'+m.id+'">'+esc(m.x)+'</div>';
    const c=m.f==='me'?{id:'me',av:S.meAv,name:S.me}:(S.contacts.find(x=>x.id===m.u)||{id:'x',name:'已退出的聯絡人',av:''});
    return '<div class="m '+m.f+'" id="m-'+m.id+'">'+avh(c,'msgav')+'<div class="b'+(m.img?' media-b':'')+'">'+(m.f==='ta'?'<div class="gnm">'+esc(c.name)+'</div>':'')+qtHtml(m)+(m.img?'<img src="'+m.img+'">':'')+esc(m.x)+((m.star||(m.tags&&m.tags.length))?'<div class="msg-tags">'+(m.star?'<span class="mk" style="--mark:'+esc(S.set.starColor||S.ink||'#5f5b8d')+'">'+MK[S.set.mk||'star']+'</span>':'')+(m.tags||[]).map(t=>'<span class="tg">'+esc(t)+'</span>').join('')+'</div>':'')+'</div><div class="mt"><span>'+tm(m.t)+'</span></div></div>'}).join(''):'<div class="empty">還沒有訊息。<br>說點什麼，群裡的聯絡人會各自依字卡隨機回覆。</div>';
  gMembers(g).filter(cid=>gTyping(g.id,cid)).forEach(cid=>{const c=S.contacts.find(x=>x.id===cid);l.insertAdjacentHTML('beforeend','<div class="sys typing"><span>'+esc(c.name)+'正在輸入</span><span class="td">⋯</span></div>')});
  const bot=()=>{l.scrollTop=l.scrollHeight};bot();requestAnimationFrame(bot);l.querySelectorAll('img').forEach(im=>{if(!im.complete)im.addEventListener('load',bot,{once:true})})}
function gSend(v){const g=grp(grpRoom);if(!g)return;sndMe();const m={id:uid(),f:'me',x:v,t:Date.now()};if(rnd()*100<Math.max(0,Math.min(100,+S.set.favProb||0)))m.tfav=1;ms(g.id).push(m);
  gMembers(g).forEach(cid=>{if(isDnd(cid))return;const key=g.id+'|'+cid,R=S.rounds[key],now=Date.now();if(R){const add=Math.min(1500,12000-R.ext);R.due+=add;R.ext+=add;R.qx=v;return}S.rounds[key]={due:now+PRE,ext:0,ph:1,qx:v,lock:0,readAt:now+1000}});
  save();paintG()}
function gTick(key,R,n){const[gid,cid]=key.split('|'),g=grp(gid);if(!g||!g.members.includes(cid)||!S.contacts.some(c=>c.id===cid)||isDnd(cid)){delete S.rounds[key];return}
  if(R.ph===1){const s=S.set,hit=p=>rnd()*100<p;if(hit(s.ghost)){delete S.rounds[key];return}const a=Math.round(Math.min(s.cmin,s.cmax)),b=Math.round(Math.max(s.cmin,s.cmax)),mn=Math.max(0,+s.rmin||0)*1000,mx=Math.max(mn,(+s.rmax||0)*1000);R.ph=2;R.n=a+ri(b-a+1);const pre=preRound(cid,s.pat,'');R.pm=pre.pm;R.sm=pre.sm;R.pre=1;R.due=n+pre.ms+mn+rnd()*(mx-mn)}
  else{delete S.rounds[key];fireG(g,cid,R)}}
function fireG(g,cid,R){const s=S.set,pm=R.pre?R.pm:patRoll(cid,s.pat),q=roundQ(cid,'',R.n,pm,{mid:g.id,skipSys:1,sm:R.pre?R.sm:undefined});if(!q.length)return;sendG(g.id,cid,q)}
function sendG(gid,cid,q){const key=gid+'|'+cid;typeHold(key,q,0);
  const send=m=>{if(!grp(gid))return;m.t=Date.now();m.u=cid;const b=ms(gid).length;ms(gid).push(m);gNotify(gid,b,cid);save();if(tab==='home'&&grpRoom===gid)paintG();else if(tab==='home'&&grpOpen&&!grpRoom)render()};
  q.forEach(m=>{const d=m._rd||0;delete m._rd;d?setTimeout(()=>send(m),d):send(m)})}
function gNotify(gid,b,cid){if(tab==='home'&&grpRoom===gid)return;const g=grp(gid),c=S.contacts.find(x=>x.id===cid);if(!g||!c)return;S.un[gid]=(S.un[gid]||0)+(ms(gid).length-b);updateGrpBadge();banner(g.name+'：'+c.name+'發送了一條消息')}

/* ── 數據：各功能佔用空間 ── */
let dataOpen=false,dCache=null;
const dSize=x=>{try{return new Blob([JSON.stringify(x)]).size}catch(e){return 0}};
const dFmt=n=>n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB';
function dCalc(){
  const cids=new Set(S.contacts.map(c=>c.id)),gids=new Set((S.groups||[]).map(g=>g.id)),pick=set=>{const o={};Object.keys(S.msgs).forEach(k=>{if(set.has(k))o[k]=S.msgs[k]});return o};
  const kindOf=new Map(S.cats.map(c=>[c.id,kc(c)])),cd=f=>dSize({c:S.cats.filter(c=>f(kc(c))),k:S.cards.filter(k=>f(kindOf.get(k.cat)||'card'))});
  const items=[
    {id:'chat',name:'私聊聊天紀錄',size:Math.max(0,dSize(pick(cids))-recBytes()),clear:1,risk:1},
    {id:'rec',name:'錄音',size:recBytes(),clear:1,risk:1,label:'錄音'},
    {id:'grp',name:'群聊（含聊天紀錄）',size:dSize({g:(S.groups||[]).map(g=>({...g,av:''})),m:pick(gids)}),clear:1,risk:1,label:'群聊聊天紀錄'},
    {id:'card',name:'常用字卡',size:cd(k=>k==='card'),clear:1,risk:1},
    {id:'emoji',name:'表情包',size:cd(k=>k==='emoji'),clear:1,risk:1},
    {id:'pat',name:'拍一拍',size:cd(k=>k==='pat'),clear:1,risk:1},
    {id:'kao',name:'顏文字',size:cd(k=>k==='kao'),clear:1,risk:1},
    {id:'ins',name:'靈感拾取字卡',size:cd(k=>k==='mem'||k==='ext'),clear:1,risk:1},
    {id:'oth',name:'其他分類（情緒、心意、emoji 等）',size:cd(k=>!['card','emoji','pat','kao','mem','ext'].includes(k)),clear:1,risk:1},
    {id:'insp',name:'靈感拾取紀錄',size:dSize(S.insp),clear:1},
    {id:'plum',name:'梅花易數紀錄',size:dSize(S.plum),clear:1},
    {id:'book',name:'答案之書紀錄',size:dSize(S.book),clear:1},
    {id:'mail',name:'信箱',size:dSize(S.letters),clear:1,risk:1},
    {id:'qlog',name:'問答紀錄',size:dSize(S.qlog),clear:1},
    {id:'img',name:'頭像與背景',size:dSize({a:S.contacts.map(c=>c.av),m:S.meAv,mc:S.momCover,g:(S.groups||[]).map(g=>g.av),b:S.bgs,ba:S.bgAll})}
  ];
  const total=dSize(S),sum=items.reduce((a,b)=>a+b.size,0);items.push({id:'rest',name:'設定與其他資料',size:Math.max(0,total-sum)});
  dCache={items,total}}
function vData(){if(!dCache)dCalc();const{items,total}=dCache,mx=Math.max(1,...items.map(i=>i.size));
  return '<div class="ph2"><button class="ib" data-a="dback">‹</button><h1>數據</h1></div>'
   +'<div class="card"><div class="sr"><span>Pearla 目前佔用</span><b style="font-weight:500">'+dFmt(total)+'</b></div><div id="dq" class="hint" style="margin:6px 0 0">正在讀取瀏覽器可用空間⋯</div><p class="hint" style="margin:8px 0 0">大小是依目前資料估算的，實際占用會略有出入。圖片（頭像、表情包、背景）通常佔最多。</p></div>'
   +'<div class="card" style="margin-top:12px"><h3 style="margin:0 0 8px;font-weight:500">各功能佔用</h3>'+items.map(i=>'<div style="margin:0 0 12px"><div class="sr" style="margin:0 0 4px;align-items:center"><span>'+esc(i.name)+'</span><span style="display:flex;align-items:center;gap:8px"><span style="color:var(--soft);font-size:calc(13px*var(--fz,1))">'+dFmt(i.size)+'</span>'+(i.clear?'<button class="btn" data-a="dclr" data-i="'+i.id+'" style="width:auto;margin:0;padding:4px 10px;font-size:calc(12px*var(--fz,1))">清除</button>':'')+'</span></div><div class="dbar"><i style="width:'+Math.max(i.size?2:0,Math.round(i.size/mx*100))+'%"></i></div></div>').join('')+'<div style="margin:0 0 4px"><div class="sr" style="margin:0 0 4px;align-items:center"><span>字體</span><span style="display:flex;align-items:center;gap:8px"><span id="dfs" style="color:var(--soft);font-size:calc(13px*var(--fz,1))">⋯</span><button class="btn" data-a="fntsel" style="width:auto;margin:0;padding:4px 10px;font-size:calc(12px*var(--fz,1))">選擇</button></span></div></div></div>'
   +'<div class="card" style="margin-top:12px"><h3 style="margin:0 0 8px;font-weight:500">圖片壓縮</h3><button class="btn s" style="width:100%;margin:0" data-a="icopen">壓縮現有圖片</button><button class="btn" style="width:100%;margin:8px 0 0" data-a="icset">圖片自動壓縮設定（目前：'+(S.set.imgc?'開':'關')+'）</button><p class="hint" style="margin:8px 0 0">先掃描、顯示預計省下多少，確認後才會真正壓縮。GIF 動圖與有透明背景的圖不會被處理。</p></div>'
   +'<div class="card" style="margin-top:12px"><h3 style="margin:0 0 8px;font-weight:500">錄音壓縮</h3><button class="btn s" style="width:100%;margin:0" data-a="rcopen">壓縮現有錄音</button><p class="hint" style="margin:8px 0 0">新的錄音會直接用較低的位元率儲存（語音約每分鐘 180 KB）。已存在的舊錄音可以重新編碼變小，但需要即時重播一遍，所以花的時間約等於錄音總長度。</p></div>'
   +'<div class="card" style="margin-top:12px"><h3 style="margin:0 0 8px;font-weight:500">暫存</h3><button class="btn" style="width:100%;margin:0" data-a="dtmp">清除暫存</button><p class="hint" style="margin:8px 0 0">取消排隊中、還沒發出的回覆與靈感拾取任務，不會刪除任何聊天紀錄、字卡或設定。這個小程式沒有另外的程式快取，所以沒有需要清的檔案快取。</p></div>'
   +'<div class="card" style="margin-top:12px"><h3 style="margin:0 0 8px;font-weight:500">備份</h3><button class="btn s" style="width:100%;margin:0" data-a="bak">備份與還原</button><p class="hint" style="margin:8px 0 0">清除聊天紀錄、信箱前建議先備份。iPhone 的 Safari 若長時間沒有開啟，可能自動清掉網頁資料；把 Pearla 加入主畫面並定期備份最保險。</p></div>'}
function dQuota(){fontScan().then(l=>{const el=$('#dfs');if(el)el.textContent=dFmt(l.reduce((a,x)=>a+x.bytes,0))});const e=$('#dq');if(!e)return;if(!(navigator.storage&&navigator.storage.estimate)){e.textContent='這個瀏覽器無法讀取可用空間。';return}
  navigator.storage.estimate().then(r=>{const el=$('#dq');if(!el)return;el.textContent=r&&r.quota?'瀏覽器配給的空間約 '+dFmt(r.quota)+'，網頁整體已用約 '+dFmt(r.usage||0)+'。':'無法取得瀏覽器可用空間。'}).catch(()=>{const el=$('#dq');if(el)el.textContent='無法取得瀏覽器可用空間。'})}
function dClear(id){const ids=S.contacts.map(c=>c.id),gs=S.groups||[];
  if(id==='chat'){ids.forEach(k=>{S.msgs[k]=[];S.un[k]=0});Object.keys(S.rounds).forEach(k=>{if(k.indexOf('|')<0)delete S.rounds[k]})}
  else if(id==='grp'){gs.forEach(g=>{S.msgs[g.id]=[];S.un[g.id]=0});Object.keys(S.rounds).forEach(k=>{if(k.indexOf('|')>0)delete S.rounds[k]})}
  else if(id==='rec')recDelAll();
  else if(id==='insp')S.insp={mem:[],ext:[],ev:[]};
  else if(id==='plum')S.plum=[];
  else if(id==='book')S.book=[];
  else if(id==='mail')S.letters=[];
  else if(id==='qlog')S.qlog=[]
  else if(DKIND[id]){const f=DKIND[id],kindOf=new Map(S.cats.map(c=>[c.id,kc(c)])),gone=new Set(S.cats.filter(c=>f(kc(c))).map(c=>c.id));S.cards=S.cards.filter(k=>!gone.has(k.cat));S.cats=S.cats.filter(c=>!gone.has(c.id));if(id==='card'){S.bigs=[];S.cuse={}}selCat=null;bigOpen=null;delMode=false;selC=[]}}
const DKIND={card:k=>k==='card',emoji:k=>k==='emoji',pat:k=>k==='pat',kao:k=>k==='kao',ins:k=>k==='mem'||k==='ext',oth:k=>!['card','emoji','pat','kao','mem','ext'].includes(k)};

/* ── 圖片壓縮 ── */
let icState=null;
const IC_LV={std:{n:'標準',bg:[900,.7],img:[720,.78]},hi:{n:'強力',bg:[720,.6],img:[540,.65]}};
function imgRecompress(u,max,q){return new Promise(res=>{const m=/^data:image\/(\w+)/.exec(u);if(!m||m[1]==='gif'||m[1]==='svg'){res(null);return}const im=new Image();
  im.onload=()=>{try{const sc=Math.min(1,max/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*sc)),h=Math.max(1,Math.round(im.height*sc)),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
    if(m[1]==='png'||m[1]==='webp'){x.drawImage(im,0,0,w,h);const d=x.getImageData(0,0,w,h).data;for(let i=3;i<d.length;i+=4)if(d[i]<250){res(null);return}}
    x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);res(c.toDataURL('image/jpeg',q))}catch(e){res(null)}};im.onerror=()=>res(null);im.src=u})}
function icTargets(sc){const t=[],add=(kind,get,set)=>{const u=get();if(typeof u==='string'&&u.startsWith('data:image/')&&u.length>30000)t.push({kind,set,len:u.length,u})};
  if(sc.bg){if(S.bgAll)add('bg',()=>S.bgAll,v=>{S.bgAll=v});Object.keys(S.bgs||{}).forEach(k=>add('bg',()=>S.bgs[k],v=>{S.bgs[k]=v}))}
  if(sc.img)S.cards.forEach(k=>{if(k.img)add('img',()=>k.img,v=>{k.img=v})});
  if(sc.msg){Object.keys(S.msgs).forEach(id=>(S.msgs[id]||[]).forEach(m=>{if(m.img)add('img',()=>m.img,v=>{m.img=v})}));(S.letters||[]).forEach(L=>(L.imgs||[]).forEach((u,i)=>add('img',()=>L.imgs[i],v=>{L.imgs[i]=v})))}
  return t}
function icSheet(){const st=icState;if(!st)return;const all={bg:icTargets({bg:1}),img:icTargets({img:1}),msg:icTargets({msg:1})},fm=a=>a.length+' 張 · '+dFmt(a.reduce((x,y)=>x+y.len,0));
  const row=(k,n)=>'<div class="lt pick gmem'+(st.scope[k]?' sel':'')+'" data-a="ictg" data-i="'+k+'"><span style="flex:1;min-width:0">'+n+'<br><small style="color:var(--soft)">'+fm(all[k])+'</small></span><span class="ck '+(st.scope[k]?'on':'')+'"></span></div>';
  const info=st.busy?'<p class="hint" style="margin:8px 0">掃描中 '+esc(st.prog||'')+'⋯</p>':st.res?'<p style="margin:8px 0;font-size:calc(14px*var(--fz,1))">'+(st.res.list.length?'可壓縮 '+st.res.list.length+' 張（共掃描 '+st.res.total+' 張），預計省下約 '+dFmt(st.res.saved):'沒有可再壓縮的圖片（共掃描 '+st.res.total+' 張）')+'</p>':'';
  sheet('壓縮現有圖片','<p class="hint" style="margin:0 0 6px">壓縮不可還原，建議先備份。掃描時不會改動任何圖片。</p>'+row('bg','背景')+row('img','表情包')+row('msg','聊天與信件中的圖片')
   +'<div class="seg" style="margin:10px 0 4px">'+['std','hi'].map(k=>'<button class="'+(st.level===k?'on':'')+'" data-a="iclv" data-i="'+k+'">'+IC_LV[k].n+'</button>').join('')+'</div><p class="hint" style="margin:0 0 4px">標準：表情包最長邊 720px、畫質 78%；強力：540px、畫質 65%（背景保留較大尺寸）。</p>'+info
   +(st.res&&st.res.list.length?'<button class="btn d" data-a="icgo">套用壓縮</button>':'<button class="btn s" data-a="icscan"'+(st.busy?' disabled':'')+'>'+(st.busy?'掃描中⋯':'開始掃描')+'</button>')+'<button class="btn" data-a="bak">先去備份</button><button class="btn" data-a="close">關閉</button>',1)}
async function icScan(){const st=icState;st.busy=true;st.res=null;icSheet();const lv=IC_LV[st.level],ts=icTargets({bg:st.scope.bg,img:st.scope.img,msg:st.scope.msg}),cache=new Map(),list=[];let n=0;
  for(const t of ts){n++;const p=t.kind==='bg'?lv.bg:lv.img,key=p.join('/')+t.u;let nu=cache.get(key);if(nu===undefined){nu=await imgRecompress(t.u,p[0],p[1]);cache.set(key,nu)}if(nu&&nu.length<t.len*.9)list.push({t,nu});if(n%2===0){st.prog=n+'/'+ts.length;icSheet()}}
  st.res={list,total:ts.length,saved:list.reduce((a,x)=>a+x.t.len-x.nu.length,0)};st.busy=false;icSheet()}