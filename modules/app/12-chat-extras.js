
/* ── 頭像：拖曳與縮放，讓圖片完整放進頭像框 ── */
let avcS=null;
/* 多選頭像：avM＝{files:[{f,url,im,k,ox,oy,k0,zoom,drop}],idx}；每張的裁剪位置各自保留，可左右切換 */
let avM=null;
function avLoad(it){return new Promise(res=>{if(it.im){res(true);return}const im=new Image();im.onload=()=>{const P=240,k0=Math.max(P/im.width,P/im.height);it.im=im;it.k0=k0;it.k=k0;it.ox=(P-im.width*k0)/2;it.oy=(P-im.height*k0)/2;it.zoom=100;res(true)};im.onerror=()=>res(false);im.src=it.url})}
function avCrop(f,id,back){
  if(id==='bk'&&back&&back.multi){avMulti(back.files);return}
  const url=URL.createObjectURL(f),im=new Image();im.onload=()=>{const P=240,k0=Math.max(P/im.width,P/im.height);avcS={im,id,url,back,P,k0,k:k0,ox:(P-im.width*k0)/2,oy:(P-im.height*k0)/2,drag:null};
  sheet('調整頭像','<div id="avc" class="avc"><img id="avi" src="'+url+'" draggable="false" alt=""></div><input id="avz" type="range" min="100" max="400" value="100" style="width:100%;margin:12px 0 4px"><p class="hint" style="margin:0 0 8px;text-align:center">拖曳選擇要裁哪個位置當頭像，滑桿放大縮小；圖片會一直鋪滿頭像框</p><div style="display:flex;gap:8px"><button class="btn" data-a="close" style="flex:1;margin-top:0">取消</button><button class="btn s" data-a="avok" style="flex:1;margin-top:0">確定</button></div>',1);avcUI()};im.onerror=()=>toast('無法讀取這張圖片');im.src=url}
async function avMulti(files){avM={items:files.map(f=>({f,url:URL.createObjectURL(f),im:null})),idx:0};const ok=await avLoad(avM.items[0]);if(!ok){avMFree();toast('無法讀取這張圖片');return}avMShow()}
function avMFree(){if(avM)avM.items.forEach(it=>{try{URL.revokeObjectURL(it.url)}catch(e){}});avM=null;avcS=null}
function avMKeep(){return avM.items.filter(it=>!it.drop)}
function avMStash(){const a=avcS,it=avM&&avM.items[avM.idx];if(!a||!it)return;it.k=a.k;it.ox=a.ox;it.oy=a.oy;const z=$('#avz');if(z)it.zoom=+z.value||100}
async function avMShow(){const it=avM.items[avM.idx];await avLoad(it);const P=240,keep=avMKeep(),pos=avM.items.slice(0,avM.idx+1).filter(x=>!x.drop).length,lastIdx=(()=>{for(let n=avM.items.length-1;n>=0;n--)if(!avM.items[n].drop)return n;return -1})(),isLast=avM.idx>=lastIdx;
  avcS={im:it.im,id:'bk',url:it.url,back:{multi:1},P,k0:it.k0,k:it.k,ox:it.ox,oy:it.oy,drag:null};
  const prev=avM.items.slice(0,avM.idx).some(x=>!x.drop),next=avM.items.slice(avM.idx+1).some(x=>!x.drop);
  sheet('調整頭像（'+pos+'／'+keep.length+'）','<div class="avc-wrap"><button type="button" class="avc-arr" data-a="avprev"'+(prev?'':' disabled')+' aria-label="上一張">‹</button><div id="avc" class="avc"><img id="avi" src="'+it.url+'" draggable="false" alt=""></div><button type="button" class="avc-arr" data-a="avnext"'+(next?'':' disabled')+' aria-label="下一張">›</button></div><input id="avz" type="range" min="100" max="400" value="'+(it.zoom||100)+'" style="width:100%;margin:12px 0 4px"><p class="hint" style="margin:0 0 8px;text-align:center">拖曳選擇要裁哪個位置當頭像，滑桿放大縮小；左右箭頭可以看上一張、下一張</p><div style="display:flex;gap:8px"><button class="btn" data-a="avskip" style="flex:1;margin-top:0">不要這張</button><button class="btn" data-a="avcancel" style="flex:1;margin-top:0">取消</button>'+(isLast?'<button class="btn s" data-a="avsaveall" style="flex:1.3;margin-top:0">儲存（'+keep.length+'）張頭像</button>':'<button class="btn s" data-a="avnext" style="flex:1;margin-top:0">下一張</button>')+'</div>',1);avcUI()}
async function avMGo(d){avMStash();let n=avM.idx+d;while(n>=0&&n<avM.items.length&&avM.items[n].drop)n+=d;if(n<0||n>=avM.items.length)return;avM.idx=n;await avMShow()}
function avMSave(){avMStash();const me=avScope==='me',ct=cur(),list=me?(S.meAvs=S.meAvs||[]):(ct.avs=ct.avs||[]);let n=0;
  avMKeep().forEach(it=>{const P=240,O=256,r=O/P,c=document.createElement('canvas');c.width=c.height=O;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,O,O);x.drawImage(it.im,it.ox*r,it.oy*r,it.im.width*it.k*r,it.im.height*it.k*r);list.push(c.toDataURL('image/jpeg',.9));n++});
  avMFree();save();avSheet();toast('已儲存 '+n+' 張頭像')}
function avcUI(){const a=avcS,i=$('#avi');if(!a||!i)return;a.ox=Math.min(0,Math.max(a.P-a.im.width*a.k,a.ox));a.oy=Math.min(0,Math.max(a.P-a.im.height*a.k,a.oy));i.style.width=a.im.width*a.k+'px';i.style.height=a.im.height*a.k+'px';i.style.transform='translate('+a.ox+'px,'+a.oy+'px)'}
document.addEventListener('pointerdown',e=>{if(!avcS||!e.target.closest('#avc'))return;avcS.drag={x:e.clientX,y:e.clientY,ox:avcS.ox,oy:avcS.oy};e.preventDefault()});
document.addEventListener('pointermove',e=>{const a=avcS;if(!a||!a.drag)return;a.ox=a.drag.ox+e.clientX-a.drag.x;a.oy=a.drag.oy+e.clientY-a.drag.y;avcUI()});
document.addEventListener('pointerup',()=>{if(avcS)avcS.drag=null});
document.addEventListener('input',e=>{const a=avcS;if(!a||e.target.id!=='avz')return;const nk=a.k0*Math.max(100,+e.target.value)/100,ix=(a.P/2-a.ox)/a.k,iy=(a.P/2-a.oy)/a.k;a.k=nk;a.ox=a.P/2-ix*nk;a.oy=a.P/2-iy*nk;avcUI()});
/* ── 已讀：我的訊息在該輪第一條發出 1 秒後顯示；他的訊息在我看到聊天室時顯示 ── */
function updateReads(){if(tab!=='chat')return;const l=$('#cl');if(!l)return;tobotUpdate();let ch=0;
  ms(S.cur).forEach(m=>{if(m.qa||m.f==='sys')return;if(m.f==='ta'&&!m.rd&&!document.hidden){m.rd=1;ch=1}
    if(!isRd(m))return;const mt=l.querySelector('#m-'+m.id+' .mt');if(mt&&!mt.querySelector('.rdt'))mt.insertAdjacentHTML('beforeend','<span class="rdt">已讀</span>')});if(ch)save()}
setInterval(updateReads,250);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateReads()});
['wheel','touchmove','pointerdown'].forEach(ev=>document.addEventListener(ev,e=>{const l=e.target.closest&&e.target.closest('#cl');if(l)l._stick=false},{passive:true,capture:true}));
function tobotUpdate(){const l=$('#cl'),b=$('#tobot');if(!l||!b)return;b.classList.toggle('show',l.scrollHeight-l.scrollTop-l.clientHeight>160)}
document.addEventListener('scroll',e=>{if(e.target&&e.target.id==='cl')tobotUpdate()},true);
/* ── 備忘錄：文字依卡片的六條線排放 ── */
const MEMO={lines:[49.5,58,66.5,75],h:8.5,w:53,fs:.046};
const MEMO_G={lines:[47,61,75,89],h:14,w:82,fs:.052};/* 霧海備忘錄：自己的排版（行距較寬、文字下方有格線） */
const memoM=()=>curDef().memo||(isG()?MEMO_G:MEMO);
function memoLines(text){const cv=memoLines.cv||(memoLines.cv=document.createElement('canvas')),ctx=cv.getContext('2d'),W0=400,maxW=memoM().w/100*W0*0.97;
  ctx.font=(memoM().fs*W0)+'px '+getComputedStyle(document.body).fontFamily;const m=t=>ctx.measureText(t).width;let out=[];
  String(text||'').replace(/\r/g,'').split('\n').forEach(raw=>{let cur='';for(const ch of [...raw]){if(cur&&m(cur+ch)>maxW){out.push(cur);cur=ch}else cur+=ch}out.push(cur)});
  while(out.length&&out[out.length-1]==='')out.pop();
  const n=memoM().lines.length;if(out.length>n){out=out.slice(0,n);let t=out[n-1];while(t&&m(t+'⋯⋯')>maxW)t=[...t].slice(0,-1).join('');out[n-1]=t+'⋯⋯'}
  return out}
function memoSlots(){const L=memoLines(S.memo),ev=memoEvents(),sh=ev.length?1:0;return memoM().lines.map((y,i)=>sh&&i===0?'<div class="ml ml-ev" style="top:'+(y-memoM().h)+'%">'+'提醒：'+ev.map(o=>'<span>'+esc(o.n)+'</span>距離'+o.d+'天').join('　')+'</div>':'<div class="ml" style="top:'+(y-memoM().h)+'%">'+esc(L[i-sh]||'')+'</div>').join('')}
function qaRecBody(x){if(x.t==='survey'&&x.qs)return x.qs.map((q,i)=>'<div class="ltx" style="margin-top:4px;font-weight:500">'+(i+1)+'. '+esc(q.q)+(q.multi?'（多選）':'')+'</div><div class="ltx" style="color:var(--soft);font-size:calc(12.5px*var(--fz,1))">'+q.o.map(esc).join(' ／ ')+'</div><div class="ltx">他的答案：'+(x.ans&&x.ans[i]?(x.ans[i].length?esc(x.ans[i].join(' ／ ')):'（沒有選擇答案）'):'等待回答中⋯')+'</div>').join('');
  return '<div class="ltx" style="font-weight:500">'+esc(x.q)+'</div>'+(x.t!=='text'&&x.o.length?'<div class="ltx" style="color:var(--soft);font-size:calc(12.5px*var(--fz,1))">'+x.o.map(esc).join(' ／ ')+'</div>':'')+'<div class="ltx">他的答案：'+(x.ans?(x.ans.length?esc(x.ans.join(' ／ ')):'（沒有選擇答案）'):'等待回答中⋯')+'</div>'}
/* ── 紀錄 ── */
const QTN={single:'單選題',multi:'多選題',text:'字卡回答',survey:'問卷'};
function vRec(){const pg=recPage||'qa',head='<div class="stickh"><div class="ph2"><button class="ib" data-a="rback">‹</button><h1>紀錄</h1><span class="grow"></span><button class="btn" data-a="redit" style="width:auto;padding:6px 14px">'+(recEdit?'完成':'編輯')+'</button></div>',
  tabs='<div class="stabs">'+[['qa','問答'],['fav','收藏'],['rec','錄音'],['plum','梅花易數'],['book','答案之書']].map(([k,n])=>'<button class="stab '+(pg===k?'on':'')+'" data-a="rpage" data-i="'+k+'">'+n+'</button>').join('')+'</div></div>';
  if(pg==='qa'){const l=[...S.qlog].sort((a,b)=>b.ts-a.ts);
    const bar=recEdit?'<div class="selbar">'+selAllHtml('qa',l.map(x=>x.id),recSel)+'<button class="btn d" data-a="qdelsel" style="border-style:solid">刪除所選（'+recSel.length+'）</button></div>':'';
    return head+tabs+bar+(l.length?l.map(x=>'<div class="lt'+(recEdit?' pick'+(recSel.includes(x.id)?' sel':''):'')+'" '+(recEdit?'data-a="qsel" data-i="'+x.id+'" ':'')+'style="padding:12px 14px">'+(recEdit?'<span class="ck '+(recSel.includes(x.id)?'on':'')+'"></span>':'')+'<div class="ltt">'+esc(x.cn)+' · '+(x.src==='card'?'問題卡（'+QTN[x.t]+'）':QTN[x.t])+(x.ats?' · '+ltime(x.ats):'')+'</div>'+qaRecBody(x)+'</div>').join(''):'<div class="empty">還沒有問答紀錄。<br>在聊天室「⋯ → 工具 → 問問他」發送問題後會記錄在這裡。</div>');}
  if(pg==='rec'){const l=recList(),keys=l.map(([c,m])=>c.id+':'+m.id),bar=recEdit?'<div class="selbar">'+selAllHtml('rc',keys,recSel)+'<button class="btn d" data-a="rdelsel" style="border-style:solid">刪除所選（'+recSel.length+'）</button></div>':'';
    const row=([c,m])=>{const k=c.id+':'+m.id,sel=recSel.includes(k),info='<div class="grow"><div class="vm" style="min-width:0"><button type="button" class="vm-pl" data-a="rcplay" data-i="'+k+'" data-pl="'+m.id+'" aria-label="播放錄音">'+PLAY_SVG+'</button><span class="rec-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><b>'+recFmt(m.dur||0)+'</b></div><small>'+esc(c.name)+' · '+ltime(m.t)+'</small></div>';
      return recEdit?'<div class="ci pick'+(sel?' sel':'')+'" data-a="rcsel" data-i="'+k+'" style="align-items:flex-start;padding:8px 10px;cursor:pointer"><span class="ck '+(sel?'on':'')+'"></span>'+info+'</div>':'<div class="ci" style="align-items:flex-start;padding:8px 10px">'+info+'</div>'};
    return head+tabs+bar+(l.length?l.map(row).join(''):'<div class="empty">還沒有錄音。<br>在聊天室點右上角麥克風錄音並發送後，會記錄在這裡。</div>')}
  if(pg==='plum'){const l=[...(S.plum||[])].sort((a,b)=>b.t-a.t),bar=recEdit?'<div class="selbar">'+selAllHtml('pl',l.map(x=>x.id),recSel)+'<button class="btn d" data-a="pdelsel" style="border-style:solid">刪除所選（'+recSel.length+'）</button></div>':'';
    const row=x=>{const r=x.r,m=x.meta,inner='<div class="ltt">'+ltime(x.t)+' · '+(m.mode==='num'?'報數排盤':'時間排盤')+'</div>'+(x.q?'<div class="ltx" style="color:var(--soft);font-size:calc(12.5px*var(--fz,1))">所問：'+esc(x.q.length>30?x.q.slice(0,30)+'⋯':x.q)+'</div>':'')+'<div class="ltx" style="font-weight:500">'+esc(r.benGua)+' → '+esc(r.bianGua)+'（互：'+esc(r.huGua)+'）</div><div class="ltx" style="color:var(--soft);font-size:calc(12.5px*var(--fz,1))">'+(m.mode==='num'?'數字 '+m.n1+'、'+m.n2:m.time)+' · 動爻'+MH_YAO[r.movingLine-1]+' · '+esc(r.overall.level)+'</div>';
      return recEdit?'<div class="lt pick'+(recSel.includes(x.id)?' sel':'')+'" data-a="psel" data-i="'+x.id+'"><span class="ck '+(recSel.includes(x.id)?'on':'')+'"></span>'+inner+'</div>':'<div class="lt" data-a="pview" data-i="'+x.id+'" style="cursor:pointer">'+inner+'</div>'};
    return head+tabs+bar+(l.length?l.map(row).join(''):'<div class="empty">還沒有梅花易數紀錄。<br>在主頁「梅花易數」排盤後，結果會記錄在這裡。</div>')}
  if(pg==='book'){const l=[...(S.book||[])].sort((a,b)=>b.t-a.t),bar=recEdit?'<div class="selbar">'+selAllHtml('bk',l.map(x=>x.id),recSel)+'<button class="btn d" data-a="bdelsel" style="border-style:solid">刪除所選（'+recSel.length+'）</button></div>':'';
    const row=x=>{const inner='<div class="ltt">'+ltime(x.t)+' · '+(x.mode==='rand'?'隨機翻頁':'輸入數字')+'</div>'+(x.q?'<div class="ltx" style="color:var(--soft);font-size:calc(12.5px*var(--fz,1))">所問：'+esc(x.q.length>30?x.q.slice(0,30)+'⋯':x.q)+'</div>':'')+'<div class="ltx" style="font-weight:500">'+esc(x.a)+'</div><div class="ltx" style="color:var(--soft);font-size:calc(12.5px*var(--fz,1))">第 '+x.p+' 頁 · 數字 '+x.n+'</div>';
      return recEdit?'<div class="lt pick'+(recSel.includes(x.id)?' sel':'')+'" data-a="bsel" data-i="'+x.id+'"><span class="ck '+(recSel.includes(x.id)?'on':'')+'"></span>'+inner+'</div>':'<div class="lt" data-a="bview" data-i="'+x.id+'" style="cursor:pointer">'+inner+'</div>'};
    return head+tabs+bar+(l.length?l.map(row).join(''):'<div class="empty">還沒有答案之書紀錄。<br>在主頁「答案之書」翻開答案後，結果會記錄在這裡。</div>')}
  const key=recFav==='m'?'fav':'tfav',it=[],seen=recSeen[key]=recSeen[key]||{};S.contacts.forEach(c=>ms(c.id).forEach(m=>{if(m[key]&&!m.qa)seen[c.id+':'+m.id]=1}));S.contacts.forEach(c=>ms(c.id).forEach(m=>{if(!m.qa&&(m[key]||seen[c.id+':'+m.id]))it.push([c,m])}));it.sort((a,b)=>b[1].t-a[1].t);recAllKeys=it.map(([c,m])=>c.id+':'+m.id+':'+key);
  const seg='<div class="seg"><button class="'+(recFav==='h'?'on':'')+'" data-a="rfs" data-i="h">他的收藏</button><button class="'+(recFav==='m'?'on':'')+'" data-a="rfs" data-i="m">我的收藏</button></div>';
  const fbar=recEdit?'<div class="selbar">'+selAllHtml('fav',recAllKeys,recSel)+'<button class="btn s" data-a="funsel">取消收藏所選（'+recSel.length+'）</button></div>':'';
  const itemHtml=([c,m])=>{const k=c.id+':'+m.id+':'+key,sel=recSel.includes(k),body='<div class="grow" style="white-space:pre-wrap;word-break:break-word">'+qtHtml(m)+(m.img?'<img src="'+m.img+'" style="max-width:90px;max-height:90px;border-radius:8px;display:block">':'')+esc(m.x)+'<small>'+esc(c.name)+' · '+ltime(m.t)+'</small></div>';
    return recEdit?'<div class="ci pick'+(sel?' sel':'')+'" data-a="fsel" data-i="'+k+'" style="align-items:flex-start;padding:8px 10px;cursor:pointer"><span class="ck '+(sel?'on':'')+'"></span>'+body+'</div>':'<div class="ci" style="align-items:flex-start;padding:8px 10px">'+body+'<button class="ib" data-a="unf" data-i="'+k+'">'+(m[key]?'★':'☆')+'</button></div>'};
  return head+tabs+seg+fbar+(it.length?it.map(itemHtml).join(''):'<div class="empty">'+(recFav==='m'?'還沒有收藏任何訊息。<br>在聊天室點訊息旁的 ☆ 即可收藏。':'他還沒有收藏任何你的訊息。')+'</div>');}

/* ── 問問他 ── */
const optsOf=t=>String(t||'').split('\n').map(x=>x.trim()).filter(Boolean);
const rnd2=(a,b)=>{const lo=Math.min(+a||0,+b||0),hi=Math.max(+a||0,+b||0);return lo+rnd()*(hi-lo)};
function parseSurvey(txt){const qs=[];let cur=null;String(txt||'').replace(/\r/g,'').split('\n').forEach(raw=>{const ln=raw.trim();if(!ln)return;
  if(ln[0]==='/'||ln[0]==='／'){const parts=ln.slice(1).split(/[\/／]/).map(x=>x.trim()),q=parts[0];if(!q){cur=null;return}cur={q,o:[],multi:false,mx:0};const m=/^多選\s*(\d*)$/.exec(parts[1]||'');if(m){cur.multi=true;cur.mx=m[1]?parseInt(m[1],10):0}qs.push(cur)}
  else if(cur)cur.o.push(ln)});return qs}
/* 單選：每個選項機率相同挑一個；多選：每個選項各 50%，超過上限就隨機剔除到上限，也可能一個都沒選（無保底） */
function qaPick(multi,n,mx){if(!multi)return[ri(n)];const sl=[];for(let i=0;i<n;i++)if(rnd()<.5)sl.push(i);const cap=mx>0?Math.min(mx,n):n;while(sl.length>cap)sl.splice(ri(sl.length),1);return sl}
function askSheet(keep){const Q=S.qa,sh=$('#sh'),old=$('.ask-body'),st=keep&&old?old.scrollTop:0;
  const NS=(path,label,unit)=>{const [a,b]=path.split('.');return '<div class="ask-set"><span>'+label+'</span><span><input type="number" inputmode="numeric" data-qs="'+path+'" value="'+Q[a][b]+'"> '+unit+'</span></div>'};
  const TW=(k,rows,ph)=>'<div class="tw"><textarea rows="'+rows+'" data-qd="'+k+'" placeholder="'+ph+'">'+esc(qd[k])+'</textarea><button type="button" class="tx" data-a="qclr" data-i="'+k+'" aria-label="清除">×</button></div>';
  const tabs='<div class="chat-pop-cats">'+[['single','單選題'],['multi','多選題'],['text','字卡回答'],['card','問題卡']].map(([k,n])=>'<button class="'+(qaTab===k?'on':'')+'" data-a="qtab" data-i="'+k+'">'+n+'</button>').join('')+'</div>';
  const qin=TW('q',2,'想問什麼？');
  let body='',foot='<div class="ask-foot"><button class="btn s" data-a="qsend">發送</button></div>';
  if(qaTab==='single'||qaTab==='multi')body=qin+TW('o',7,'答案選項；一行一個選項')+NS(qaTab+'.time','他回答的時間','秒')+(qaTab==='multi'?'<div class="ask-set"><span style="display:flex;align-items:center;gap:8px"><button type="button" class="sw '+(Q.multi.capOn?'on':'')+'" data-a="qcap" aria-label="開關"></button>選擇答案數量最多為</span>'+(Q.multi.capOn?'<span><input type="number" inputmode="numeric" data-qs="multi.max" value="'+Q.multi.max+'"> 個</span>':'')+'</div><p class="hint" style="margin:0 0 4px">關閉後，有幾個答案選項最多就能選幾個。</p>':'');
  else if(qaTab==='text')body=qin+NS('text.tmin','回答最短時間','秒')+NS('text.tmax','回答最長時間','秒')+NS('text.cmin','回答字卡數量最少','條')+NS('text.cmax','回答字卡數量最多','條');
  else{foot='';const cardBox=c=>{const sel=qcSels.includes(c.id),opts=c.o.map(esc).join('\n');
      if(qaEditMode)return '<div class="qcrow"><div class="qc pk'+(sel?' sel':'')+'" data-a="qcsel" data-i="'+c.id+'"><span class="ck '+(sel?'on':'')+'" style="position:absolute;top:10px;right:10px"></span><div class="qcq">'+esc(c.q)+'</div><div class="qco">'+opts+'</div></div></div>';
      return '<div class="qcrow"><div class="qc" data-a="qcpick" data-i="'+c.id+'"><button class="qcm" data-a="qcm" data-i="'+c.id+'">'+(c.multi?'多選':'單選')+'</button><div class="qcq">'+esc(c.q)+'</div><div class="qco">'+opts+'</div></div>'+(qcSel===c.id?'<div class="qcact"><div class="qmini"><button class="qm" data-a="qcmod" data-i="'+c.id+'">修改</button><button class="qm d" data-a="qcdel" data-i="'+c.id+'">刪除</button></div><button class="qsend" data-a="qcsend" data-i="'+c.id+'">發送</button></div>':'')+'</div>'};
    body='<div class="card set" style="padding:10px 12px;margin-bottom:10px">'+NS('card.time','回覆時間','秒')+'</div><div class="ask-top"><span>問題卡</span><span><button class="btn" data-a="qcadd">添加</button><button class="btn" data-a="qcedit">'+(qaEditMode?'完成':'編輯')+'</button></span></div>'+(qaEditMode?'<div class="selbar" style="margin:0 0 10px">'+selAllHtml('qc',(Q.cards||[]).map(c=>c.id),qcSels)+'<button class="btn d" data-a="qcdelsel" style="border-style:solid">刪除所選（'+qcSels.length+'）</button></div>':'')+(Q.cards.length?Q.cards.map(cardBox).join(''):'<div class="empty">還沒有問題卡。<br>點右上「添加」新增。</div>');}
  const ov=qaAdd?'<div id="addov"><div class="box" data-keep="1"><h2 style="margin-bottom:10px">'+(qaAdd===true?'添加問題卡':'編輯問題卡')+'</h2><textarea rows="2" data-qd="aq" placeholder="想問什麼？" style="margin-bottom:10px">'+esc(qd.aq)+'</textarea><textarea rows="7" data-qd="ao" placeholder="答案選項；一行一個選項">'+esc(qd.ao)+'</textarea><button class="btn s" data-a="qcok">儲存</button></div></div>':'';
  const cf=qaConfirm?'<div id="cfov"><div class="box" data-keep="1"><h2 style="margin-bottom:6px">是否確認刪除？</h2><p class="hint" style="margin:0 0 8px">將刪除 '+qaConfirm.ids.length+' 張問題卡。</p><div style="display:flex;gap:8px"><button class="btn" data-a="qcfno" style="flex:1;margin-top:0">取消</button><button class="btn d" data-a="qcfok" style="flex:1;margin-top:0">確認刪除</button></div></div></div>':'';
  sh.innerHTML='<div class="box" data-keep="1">'+tabs+'<div class="ask-body">'+body+'</div>'+foot+'</div>'+ov+cf;
  sh.classList.remove('mid','chat-pop','sv');sh.classList.add('ask','show');const nb=$('.ask-body');if(nb&&st)nb.scrollTop=st}
function surveySheet(){const Q=S.qa.survey,sh=$('#sh'),NS=(k,l)=>'<div class="ask-set"><span>'+l+'</span><span><input type="number" inputmode="numeric" data-qs="survey.'+k+'" value="'+Q[k]+'"> 秒</span></div>';
  sh.innerHTML='<div class="box" data-keep="1"><h2 style="margin:0 0 8px">問卷</h2><div class="ask-body"><div class="tw"><textarea rows="12" data-qd="sv" placeholder="/第一個問題&#10;答案選項a&#10;答案選項b&#10;/第二個問題&#10;答案選項a&#10;答案選項b&#10;答案選項c&#10;/第三個問題/多選2&#10;答案選項a&#10;答案選項b&#10;答案選項c">'+esc(qd.sv)+'</textarea><button type="button" class="tx" data-a="qclr" data-i="sv" aria-label="清除">×</button></div><p class="hint" style="margin:0 0 6px">問題前面加「/」；多選題在問題後加「/多選數字」，數字是最多能選幾個，沒填就是有幾個選項最多選幾個（也可能一個都不選）。</p>'+NS('tmin','每一題選擇答案的時間最短')+NS('tmax','每一題選擇答案的時間最長')+'</div><div class="ask-foot"><button class="btn s" data-a="svsend">發送</button></div></div>';
  sh.classList.remove('mid','chat-pop');sh.classList.add('ask','sv','show')}
/* 單選題固定多兩個選項：第一個「我在忙，沒有選」、最後一個「我不想回答」，機率和其他選項一樣 */
const QA_BUSY='我在忙，沒有選',QA_NO='我不想回答';
const qaFix=o=>{o=(o||[]).filter(x=>x!==QA_BUSY&&x!==QA_NO);return [QA_BUSY].concat(o,[QA_NO])};
function qaSend(sp){sp=Object.assign({},sp);if(sp.t==='single')sp.o=qaFix(sp.o);else if(sp.t==='survey'&&Array.isArray(sp.qs))sp.qs=sp.qs.map(q=>q.multi?q:Object.assign({},q,{o:qaFix(q.o)}));const cid=S.cur,id=uid(),now=Date.now(),first=!ms(cid).some(m=>m.qa&&!m.qa.done),a={t:sp.t,src:sp.src||'',q:sp.q,o:sp.o||[],sel:null,done:false,tm:sp.time||0,mx:sp.mx||0};
  if(sp.t==='survey'){a.qs=sp.qs;a.qi=0;a.sel=[];a.tmin=sp.tmin;a.tmax=sp.tmax}
  a.due=first?now+(sp.t==='survey'?rnd2(a.tmin,a.tmax):a.tm)*1000:null;
  ms(cid).push({id,f:'me',x:sp.q,t:now,qa:a});S.qlog.push({id,cid,cn:cur().name,t:sp.t,src:a.src,q:sp.q,o:a.o,qs:sp.qs||null,ts:now,ans:null,ats:null});save();closeSheet();paint()}
const qaBox=(m,c)=>{const a=m.qa,grp=(q,o,sel,i)=>'<div class="qaq">'+(i!=null?(i+1)+'. ':'')+esc(q)+'</div>'+o.map((t,k)=>'<div class="qao'+(sel&&sel.includes(k)?' on':'')+'">'+esc(t)+'</div>').join('');
  const body=a.t==='survey'?a.qs.map((q,i)=>'<div class="qg">'+grp(q.q+(q.multi?'（多選）':''),q.o,a.sel&&a.sel[i],i)+'</div>').join(''):a.t==='text'?'<div class="qaq">'+esc(a.q)+'</div>':grp(a.q,a.o,a.sel);
  const none=a.done&&a.t!=='text'&&(a.t==='survey'?(a.sel||[]).every(z=>!z.length):(a.sel&&!a.sel.length));
  const st=a.done?(a.t==='text'?'已回答':none?'他沒有選擇答案':''):esc(c.name)+'正在選擇答案⋯';
  return '<div class="qabox">'+body+'<div class="qas">'+st+'</div></div>'};
function qaStep(cid,m){const a=m.qa,lg=S.qlog.find(x=>x.id===m.id),n=Date.now();let texts=[];
  if(a.t==='survey'){const q=a.qs[a.qi];(a.sel=a.sel||[]).push(qaPick(q.multi,q.o.length,q.mx));a.qi++;
    if(a.qi<a.qs.length){a.due=n+rnd2(a.tmin,a.tmax)*1000;return}
    a.done=true;const ans=a.qs.map((qq,i)=>a.sel[i].slice().sort((x,y)=>x-y).map(j=>qq.o[j]));
    if(ans.some(x=>x.length)){const b=ms(cid).length;ms(cid).push({id:uid(),f:'ta',x:ans.map((x,i)=>(i+1)+'. '+(x.length?x.join('、'):'（沒有選擇）')).join('\n'),t:n});notify(cid,b)}
    if(lg){lg.ans=ans;lg.ats=n}return}
  if(a.t==='text'&&!a.cd){const T0=S.qa.text,lo0=Math.round(Math.min(T0.cmin,T0.cmax)),hi0=Math.round(Math.max(T0.cmin,T0.cmax)),k0=Math.max(1,lo0+ri(hi0-lo0+1));a.cd=k0;a.due=n+k0*STEP;return}
  a.done=true;
  if(a.t==='text'){const pl=cardPool(cid),T=S.qa.text,lo=Math.round(Math.min(T.cmin,T.cmax)),hi=Math.round(Math.max(T.cmin,T.cmax)),k=a.cd||Math.max(1,lo+ri(hi-lo+1));
    if(pl.length){texts=Array.from({length:k},()=>{const _k=pk(pl);cuse(cid,_k);return _k.text});const b=ms(cid).length;ms(cid).push({id:uid(),f:'ta',x:texts.join('\n'),t:n});notify(cid,b)}else ms(cid).push({id:uid(),f:'sys',x:'目前沒有可抽取的字卡',t:n})}
  else{a.sel=qaPick(a.t==='multi',a.o.length,a.mx);texts=a.sel.slice().sort((x,y)=>x-y).map(i=>a.o[i]);if(texts.length){const b=ms(cid).length;ms(cid).push({id:uid(),f:'ta',x:texts.join('\n'),t:n});notify(cid,b)}}
  if(lg){lg.ans=texts;lg.ats=n}}
function qaTick(){if(!S||!S.qa)return;const n=Date.now();let ch=0;
  S.contacts.forEach(c=>{ctxSet(c.id);if(c.dnd)return;const pend=ms(c.id).filter(m=>m.qa&&!m.qa.done);if(!pend.length)return;const m=pend[0],a=m.qa;
    if(a.due==null){a.due=n+(a.t==='survey'?rnd2(a.tmin,a.tmax):(a.tm||0))*1000;ch=1;return}
    if(a.due>n)return;ch=1;qaStep(c.id,m)});
  if(ch){save();if(tab==='chat')paint();else if(tab==='contacts'&&!document.activeElement.isContentEditable)render();badge()}}
setInterval(qaTick,1000);
function qtBar(){const b=$('#qtb');if(!b)return;const on=qtDraft&&qtDraft.cid===S.cur;b.style.display=on?'flex':'none';b.innerHTML=on?'<span class="qtt">引用：'+(qtDraft.img?'<img class="qt-img qt-bar" src="'+qtDraft.img+'" alt="">':'')+esc(qtDraft.x)+'</span><button type="button" class="ib" data-a="qtx">✕</button>':''}

/* ── 錄音（語音訊息）：模式切換、錄音、試聽、發送 ── */
let recMode=false,recSt='idle',recMR=null,recStream=null,recChunks=[],recT0=0,recTick=null,recData=null,recPrev=null,vAud=null,vAudId=null,rcState=null,recAC=null;
const recFmt=n=>{n=Math.max(0,Math.round(n));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')};
const REC_BPS=24000;
const MIC_SVG='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/></svg>',
STOP_SVG='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>',
PLAY_SVG='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>',
PAUSE_SVG='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>';
const recTypes=()=>['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus'].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))||'';
function recBox(){
  const live=recSt==='rec',ready=recSt==='ready'&&recData;
  let info;
  if(live)info='<span class="rec-dot"></span><span>錄音中</span><b id="rec-t">'+recFmt((Date.now()-recT0)/1000)+'</b>';
  else if(ready)info=(recData.url?'<button type="button" class="rec-pl" data-a="recplay" aria-label="試聽錄音">'+(recPrev&&!recPrev.paused?PAUSE_SVG:PLAY_SVG)+'</button>':'')+'<span class="rec-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><b>'+recFmt(recData.dur)+'</b><button type="button" class="rec-x" data-a="recdel" aria-label="刪除錄音">✕</button>';
  else info='<span class="rec-dot"></span><span>點右側麥克風開始錄音</span>';
  return '<div id="recbox" class="rec-box'+(live?' live':'')+'"><div class="rec-info">'+info+'</div><button type="button" class="rec-mic" data-a="'+(live?'recstop':'recgo')+'" aria-label="'+(live?'停止錄音':'開始錄音')+'">'+(live?STOP_SVG:MIC_SVG)+'</button></div>'}
function recUI(){const o=$('#recbox');if(o)o.outerHTML=recBox()}
function recCleanup(){clearInterval(recTick);recTick=null;if(recStream){recStream.getTracks().forEach(t=>t.stop());recStream=null}}
function recClear(){if(recPrev){recPrev.pause();recPrev=null}if(recData&&recData.url)URL.revokeObjectURL(recData.url);recData=null;recChunks=[];if(recMR&&recMR.state!=='inactive'){recMR.onstop=null;try{recMR.stop()}catch(_){}}recMR=null;recCleanup();recSt='idle'}
function recToggle(){
  if(recMode){recClear();recMode=false}else{recMode=true;recSt='idle'}
  const hb=$('.chh [data-a=vrec]');if(hb)hb.classList.toggle('rec-on',recMode);
  const f=$('#f'),cur0=f&&f.querySelector('#in,#recbox');if(cur0)cur0.outerHTML=recMode?recBox():'<input id="in" placeholder="說點什麼…" autocomplete="off">';
}
function recTickStart(){recTick=setInterval(()=>{const t=$('#rec-t');if(!t||!$('#recbox')){recClear();return}const sec=(Date.now()-recT0)/1000;t.textContent=recFmt(sec);if(sec>=60)recStop()},250)}
/* 麥克風權限：在使用者點擊時直接呼叫 getUserMedia，瀏覽器就會跳出「允許使用麥克風」的確認；被拒絕時顯示原因與開啟方式 */
function micExplain(e){const n=e&&e.name||'',https=window.isSecureContext===false;let why;
  if(https||!navigator.mediaDevices)why='目前的網址不是 https（或瀏覽器不支援），瀏覽器會直接禁止錄音。請用 https 網址開啟（例如放到 GitHub Pages、Netlify），或用 localhost 測試。';
  else if(n==='NotAllowedError'||n==='SecurityError')why='麥克風權限被拒絕了。<br>iPhone：「設定 → Safari → 麥克風」改成「詢問」或「允許」；如果是加到主畫面的 App，請到「設定 → 隱私權與安全性 → 麥克風」確認有開，或清除網站資料後重新開啟。<br>電腦：點網址列左邊的鎖頭 → 麥克風 → 允許。';
  else if(n==='NotFoundError'||n==='OverconstrainedError')why='找不到可用的麥克風。';
  else if(n==='NotReadableError'||n==='AbortError')why='麥克風正被其他程式使用，請先關掉其他使用麥克風的 App 再試。';
  else why='無法開啟麥克風（'+esc(n||'未知錯誤')+'）。';
  sheet('需要麥克風權限','<p class="hint" style="margin:0 0 10px;line-height:1.7">'+why+'</p><p class="hint" style="margin:0 0 10px;font-size:calc(12px*var(--fz,1))">錯誤代碼：'+esc((e&&e.name)||'無')+(e&&e.message?'（'+esc(String(e.message).slice(0,80))+'）':'')+'</p><button class="btn s" data-a="micretry">再試一次</button><button class="btn" data-a="mictest">測試麥克風</button><button class="btn" data-a="close">關閉</button>',1)}
/* 測試麥克風：真的呼叫 getUserMedia，回報實際結果；瀏覽器回報的權限狀態只當參考（iOS Safari 的 Permissions API 常與實際不符） */
async function micTest(){
  const out=[];let st=null;const show=(t,done)=>sheet('測試麥克風','<div style="font-size:calc(13.5px*var(--fz,1));line-height:1.8">'+t+'</div>'+(done?'<button class="btn s" data-a="mictest">再測一次</button>':'')+'<button class="btn" data-a="close">關閉</button>',1);
  show('正在要求麥克風⋯⋯');
  let perm='（此瀏覽器不提供）';try{if(navigator.permissions&&navigator.permissions.query){const p=await navigator.permissions.query({name:'microphone'});perm=p.state}}catch(e){}
  out.push('瀏覽器回報的權限狀態：'+esc(perm)+'（僅供參考）');
  out.push('安全環境（https）：'+(window.isSecureContext?'是':'否'));
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){out.push('<b>結果：這個瀏覽器沒有 getUserMedia，無法錄音。</b>');show(out.join('<br>'),1);return}
  try{st=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){out.push('<b>結果：實際無法取得麥克風</b><br>錯誤：'+esc(e&&e.name||'')+(e&&e.message?'（'+esc(String(e.message).slice(0,80))+'）':''));show(out.join('<br>'),1);return}
  const tr=st.getAudioTracks()[0];out.push('<b>實際取得麥克風：成功</b>');
  if(tr){out.push('裝置：'+esc(tr.label||'（未提供名稱）'));out.push('狀態：'+esc(tr.readyState)+(tr.muted?'，目前被靜音':'')+(tr.enabled===false?'，已停用':''))}
  show(out.join('<br>')+'<br>正在偵測聲音，請對著手機說話 3 秒⋯⋯');
  let peak=0;try{const AC=window.AudioContext||window.webkitAudioContext,ac=new AC(),src=ac.createMediaStreamSource(st),an=ac.createAnalyser();an.fftSize=1024;src.connect(an);if(ac.state==='suspended')await ac.resume();const buf=new Uint8Array(an.fftSize),t0=Date.now();
    await new Promise(res=>{const iv=setInterval(()=>{an.getByteTimeDomainData(buf);let m=0;for(let i=0;i<buf.length;i++)m=Math.max(m,Math.abs(buf[i]-128));peak=Math.max(peak,m/128);if(Date.now()-t0>3000){clearInterval(iv);res()}},60)});try{ac.close()}catch(e){}}catch(e){out.push('無法偵測音量：'+esc(e&&e.name||''))}
  st.getTracks().forEach(t=>t.stop());window.__micOK=1;
  out.push(peak>0.04?'<b>有收到聲音</b>（最大音量約 '+Math.round(peak*100)+'%）':'<b>沒有偵測到聲音</b>（最大音量 '+Math.round(peak*100)+'%）：權限正常，但可能沒說話、麥克風被遮住或被其他 App 佔用');
  show(out.join('<br>'),1)}
async function micAsk(){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){micExplain(null);return null}
  let err=null;for(const c of [{audio:true},{audio:{channelCount:1}}]){try{return await navigator.mediaDevices.getUserMedia(c)}catch(e){err=e;if(e&&(e.name==='NotAllowedError'||e.name==='SecurityError'))break}}
  micExplain(err);return null}
async function recStart(){
  if(recSt==='rec')return;
  recClear();recMode=true;
  /* 收入聲音關閉：不真的錄音，只計算秒數 */
  if(!S.set.recSound){recMR=null;recT0=Date.now();recSt='rec';recUI();recTickStart();return}
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||typeof MediaRecorder==='undefined'){toast('這個瀏覽器不支援錄音');return}
  recStream=await micAsk();if(!recStream){recSt='idle';recUI();return}
  const mt=recTypes();
  try{recMR=new MediaRecorder(recStream,Object.assign({audioBitsPerSecond:REC_BPS},mt?{mimeType:mt}:{}))}catch(_){recCleanup();toast('無法開始錄音');return}
  recChunks=[];const mr=recMR;mr.ondataavailable=e=>{if(e.data&&e.data.size)recChunks.push(e.data)};
  mr.onstop=()=>{const dur=(Date.now()-recT0)/1000,type=mr.mimeType||mt||'audio/webm',blob=new Blob(recChunks,{type});recCleanup();
    if(!recMode||!blob.size){recSt='idle';recUI();return}
    const fr=new FileReader();fr.onload=()=>{recData={url:URL.createObjectURL(blob),dataUrl:fr.result,dur:Math.max(1,dur)};recSt='ready';recUI()};fr.readAsDataURL(blob)};
  mr.start();recT0=Date.now();recSt='rec';recUI();recTickStart();
}
function recStop(){
  if(recSt!=='rec')return;clearInterval(recTick);recTick=null;
  if(!recMR){recData={url:null,dataUrl:'',dur:Math.max(1,(Date.now()-recT0)/1000)};recSt='ready';recUI();return}
  recSt='saving';try{recMR.stop()}catch(_){recSt='idle'}recUI()}
function recPreview(){if(!recData||!recData.url)return;if(recPrev&&!recPrev.paused){recPrev.pause();recUI();return}
  if(!recPrev){recPrev=new Audio(recData.url);recPrev.onended=()=>{recUI()}}recPrev.muted=isMuted();recPrev.currentTime=0;recPrev.play().then(recUI).catch(()=>toast('無法播放錄音'))}
function recSend(){
  if(recSt==='rec'){toast('請先按停止錄音');return}
  if(recSt!=='ready'||!recData){toast(recSt==='saving'?'錄音處理中，請稍候':'請先錄音');return}
  const d=recData;if(d.url)URL.revokeObjectURL(d.url);if(recPrev){recPrev.pause();recPrev=null}recData=null;recSt='idle';
  myMsg(d.dataUrl?{id:uid(),f:'me',x:'',audio:d.dataUrl,dur:d.dur,t:Date.now()}:{id:uid(),f:'me',x:'語音',t:Date.now()});
  if(S.set.recReply)schedule(S.cur,'[語音]');save();paint();recUI()}
function vmHtml(m){const on=vAudId===m.id&&vAud&&!vAud.paused;return '<div class="vm"><button type="button" class="vm-pl" data-a="vplay" data-i="'+m.id+'" data-pl="'+m.id+'" aria-label="播放語音">'+(on?PAUSE_SVG:PLAY_SVG)+'</button><span class="rec-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><b>'+recFmt(m.dur||0)+'</b></div>'}
function vReset(id,svg){document.querySelectorAll('[data-pl="'+id+'"]').forEach(b=>b.innerHTML=svg)}
function vPlay(id,btn,cid){const m=ms(cid||S.cur).find(x=>x.id===id);if(!m||!m.audio)return;
  if(vAud&&vAudId===id&&!vAud.paused){vAud.pause();vReset(id,PLAY_SVG);return}
  if(vAud){vAud.pause();vReset(vAudId,PLAY_SVG)}
  vAud=new Audio(m.audio);vAud.muted=isMuted();vAudId=id;vAud.onended=()=>vReset(id,PLAY_SVG);
  vReset(id,PAUSE_SVG);vAud.play().catch(()=>{vReset(id,PLAY_SVG);toast('無法播放語音')})}
/* 錄音資料：列表、容量、刪除（聊天室該則訊息只剩「語音」） */
function recList(){const it=[];S.contacts.forEach(c=>ms(c.id).forEach(m=>{if(m.audio)it.push([c,m])}));it.sort((a,b)=>b[1].t-a[1].t);return it}
function recBytes(){let n=0;Object.keys(S.msgs||{}).forEach(k=>(S.msgs[k]||[]).forEach(m=>{if(m.audio)n+=m.audio.length}));return n}
function recStrip(m){delete m.audio;delete m.dur;m.x='語音'}
function recDelKeys(keys){if(vAud){vAud.pause();vAud=null;vAudId=null}keys.forEach(k=>{const [c,id]=k.split(':'),m=(S.msgs[c]||[]).find(x=>x.id===id);if(m&&m.audio)recStrip(m)})}
function recDelAll(){if(vAud){vAud.pause();vAud=null;vAudId=null}Object.keys(S.msgs||{}).forEach(k=>(S.msgs[k]||[]).forEach(m=>{if(m.audio)recStrip(m)}))}
/* 壓縮現有錄音：解碼後以低位元率重新編碼（需即時重播一遍） */
const rcBytesOf=m=>Math.round((m.audio.length-(m.audio.indexOf(',')+1))*.75);
function rcTargets(){return recList().map(([c,m])=>m).filter(m=>(m.dur||0)>0&&rcBytesOf(m)/m.dur>REC_BPS/8*1.3)}
function rcSheet(){const st=rcState;if(!st)return;const l=rcTargets(),tot=recList().length,sec=l.reduce((a,m)=>a+(m.dur||0),0),sz=l.reduce((a,m)=>a+rcBytesOf(m),0);
  const info=st.busy?'<p class="hint" style="margin:8px 0">壓縮中 '+esc(st.prog||'')+'，請保持此頁面開著⋯</p>':st.res?'<p style="margin:8px 0;font-size:calc(14px*var(--fz,1))">'+esc(st.res)+'</p>':l.length?'<p style="margin:8px 0;font-size:calc(14px*var(--fz,1))">可壓縮 '+l.length+' 則（共 '+tot+' 則錄音），目前約 '+dFmt(sz)+'，預計需要 '+recFmt(sec)+'。</p>':'<p style="margin:8px 0;font-size:calc(14px*var(--fz,1))">沒有可再壓縮的錄音（共 '+tot+' 則）。</p>';
  sheet('壓縮現有錄音','<p class="hint" style="margin:0 0 6px">壓縮不可還原，音質會略降（語音仍清楚），建議先備份。</p>'+info+(l.length&&!st.busy&&!st.res?'<button class="btn d" data-a="rcgo">開始壓縮</button>':'')+'<button class="btn" data-a="bak">先去備份</button><button class="btn" data-a="close">關閉</button>',1)}
function rcDecode(dataUrl,ac){const b64=dataUrl.slice(dataUrl.indexOf(',')+1),bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Promise((ok,no)=>{const p=ac.decodeAudioData(u.buffer,ok,no);if(p&&p.catch)p.catch(no)})}
function rcEncode(ab,ac){return new Promise((ok,no)=>{try{const mt=recTypes(),dest=ac.createMediaStreamDestination(),mr=new MediaRecorder(dest.stream,Object.assign({audioBitsPerSecond:REC_BPS},mt?{mimeType:mt}:{})),ch=[],src=ac.createBufferSource();src.buffer=ab;src.connect(dest);
  mr.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data)};
  mr.onstop=()=>{const bl=new Blob(ch,{type:mr.mimeType||mt||'audio/webm'}),fr=new FileReader();fr.onload=()=>ok(fr.result);fr.onerror=no;fr.readAsDataURL(bl)};
  src.onended=()=>setTimeout(()=>{try{mr.stop()}catch(e){no(e)}},200);mr.start();src.start()}catch(e){no(e)}})}
async function rcRun(){const st=rcState;if(!st||st.busy)return;const l=rcTargets();if(!l.length)return;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC||typeof MediaRecorder==='undefined'){st.res='這個瀏覽器不支援錄音壓縮。';rcSheet();return}
  if(!recAC||recAC.state==='closed')recAC=new AC();try{await recAC.resume()}catch(_){}
  st.busy=true;rcSheet();let n=0,saved=0,done=0;
  for(const m of l){n++;st.prog=n+'/'+l.length;rcSheet();
    try{const ab=await rcDecode(m.audio,recAC),nu=await rcEncode(ab,recAC);if(nu&&nu.length<m.audio.length*.9){saved+=m.audio.length-nu.length;m.audio=nu;done++}}catch(_){}}
  st.busy=false;save();dCalc();st.res='已壓縮 '+done+' 則，省下約 '+dFmt(Math.round(saved*.75))+'。';
  if(dataOpen)render();rcSheet()}
function myMsg(m){sndMe();if(qtDraft&&qtDraft.cid===S.cur){m.q=qtDraft.x;if(qtDraft.img)m.qi=qtDraft.img;qtDraft=null}if(rnd()*100<Math.max(0,Math.min(100,+S.set.favProb||0)))m.tfav=1;ms(S.cur).push(m);memSchedule(S.cur,m);return m}