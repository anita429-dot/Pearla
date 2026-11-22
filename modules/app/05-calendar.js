


/* ── 日曆：查看聯絡人每天的每日留言與心情；可寫我自己的每日留言與心情；可回覆聯絡人的留言（每則只能回覆一次） ── */
let calOpen=false,calY=0,calM=0,calSel='';
const calPad=n=>String(n).padStart(2,'0'),calKey=(y,m,d)=>y+'-'+calPad(m+1)+'-'+calPad(d);
function calInit(){const n=new Date();if(!calY){calY=n.getFullYear();calM=n.getMonth()}if(!calSel)calSel=localDayKey(n)}
function calDayData(key){const out=[];(S.contacts||[]).forEach(c=>{const r=S.dlog&&S.dlog[c.id]&&S.dlog[c.id][key];if(r&&Array.isArray(r.items)&&r.items.length)out.push({c,r})});return out}
/* ── 月曆：農曆顯示、提醒、事件紀錄 ── */
let calTab='day',calPicked=false,remEdit=false,remSel=[],evEdit=false,evSel=[],remDraft=null,remAskSess=false,remLastDay='';
const LUN=(()=>{try{const f=new Intl.DateTimeFormat('en-u-ca-chinese',{year:'numeric',month:'numeric',day:'numeric'});f.format(new Date());return f}catch(e){return null}})();
const _lc={},pdk=k=>{const a=k.split('-').map(Number);return new Date(a[0],a[1]-1,a[2],12)},addD=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n,12),fmtD=k=>{const a=k.split('-').map(Number);return a[0]+'/'+a[1]+'/'+a[2]},WDN=['日','一','二','三','四','五','六'];
function lunOf(d){if(!LUN)return null;const k=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();if(_lc[k])return _lc[k];const p={};LUN.formatToParts(new Date(d.getFullYear(),d.getMonth(),d.getDate(),12)).forEach(x=>{p[x.type]=x.value});const mm=String(p.month);return _lc[k]={y:+p.relatedYear,m:parseInt(mm,10),d:+p.day,leap:/bis/.test(mm)?1:0}}
const LMN=['正','二','三','四','五','六','七','八','九','十','冬','臘'],lunMName=(m,leap)=>(leap?'閏':'')+LMN[m-1]+'月',lunDName=n=>n===20?'二十':n===30?'三十':['初','十','廿'][Math.floor((n-1)/10)]+'一二三四五六七八九十'[(n-1)%10];
const lunText=d=>{const L=lunOf(d);return L?(L.d===1?lunMName(L.m,L.leap):lunDName(L.d)):''};
function lunToSolar(ly,lm,ld,leap){if(!LUN)return null;for(let pass=0;pass<2;pass++){const want=pass?Math.min(ld,29):ld;for(let d=new Date(ly,0,10,12),e=new Date(ly+1,2,20,12);d<=e;d=addD(d,1)){const L=lunOf(d);if(L.y===ly&&L.m===lm&&L.leap===(leap?1:0)&&L.d===want)return localDayKey(d)}if(ld<30)break}return null}
/* 這一天符合這個提醒嗎（含重複；該月沒有這個日期就直接略過，不會挪到月底） */
function remMatch(r,d){const k=localDayKey(d);if(k<r.sk)return false;if(!r.rep)return k===r.sk;
  if(r.cal==='l'){const L=lunOf(d);if(!L)return false;const dayOk=L.d===r.ld;return r.rep==='m'?dayOk:(L.m===r.lm&&L.leap===(r.lleap?1:0)&&dayOk)}
  const m=d.getMonth()+1,dd=d.getDate(),dayOk=dd===r.d;return r.rep==='m'?dayOk:(m===r.m&&dayOk)}
function remNext(r,from){for(let i=0;i<=Math.max(0,+r.before||0);i++){const d=addD(from,i);if(remMatch(r,d))return{d,days:i,key:localDayKey(d)}}return null}
const todayNoon=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate(),12)};
function remDue(){const t=todayNoon(),out=[];(S.rems||[]).forEach(r=>{if(!r.on)return;const n=remNext(r,t);if(n)out.push({r,days:n.days,key:n.key})});return out}
const calCut=()=>{const t=new Date();return localDayKey(new Date(t.getFullYear()-2,t.getMonth(),t.getDate()))};
/* 月曆上某一天的事件：只看最近兩年；已刪除提醒留下的紀錄也會算進來 */
function evOnDay(key){const out=[];if(key<calCut())return out;const d=pdk(key),ids=new Set();(S.rems||[]).forEach(r=>{if(r.rec&&remMatch(r,d)){out.push({rid:r.id,name:r.name||'提醒',note:r.note||''});ids.add(r.id)}});(S.evlog||[]).forEach(e=>{if(e.date===key&&!ids.has(e.rid)){out.push({rid:e.rid,name:e.name,note:e.note||''});ids.add(e.rid)}});return out}
/* 事件紀錄：通知開始那天起記下來，永久保留（月曆上只顯示兩年內） */
function evSync(){if(!S)return;S.evlog=S.evlog||[];S.evdel=S.evdel||[];const t0=todayNoon(),tk=localDayKey(t0),has=new Set(S.evlog.map(e=>e.rid+'|'+e.date).concat(S.evdel)),cutK=localDayKey(addD(t0,-730));let ch=0;
  (S.rems||[]).forEach(r=>{if(!r.rec)return;const endK=localDayKey(addD(t0,Math.max(0,+r.before||0)));let from=pdk(r.sk>cutK?r.sk:cutK);if(r.evScan&&r.evScan>localDayKey(from))from=addD(pdk(r.evScan),-1);
    for(let d=from;localDayKey(d)<=endK;d=addD(d,1)){if(remMatch(r,d)){const k=localDayKey(d),key=r.id+'|'+k;if(!has.has(key)){has.add(key);S.evlog.push({id:uid(),rid:r.id,name:r.name||'提醒',note:r.note||'',date:k,t:Date.now()});ch=1}}}
    if(r.evScan!==tk){r.evScan=tk;ch=1}});if(ch)save()}
function remAsk(){if(remAskSess)return;const sh=$('#sh');if(sh&&sh.classList.contains('show'))return;const tk=localDayKey(new Date()),nw=Date.now(),due=remDue().filter(x=>x.r.shown!==tk&&!(x.r.later&&x.r.later>nw)&&!(x.r.tmr&&x.r.tmr>tk));if(!due.length)return;remAskSess=true;
  sheet('月曆提醒',due.map(x=>{const d=pdk(x.key);return '<div style="margin:0 0 12px"><b style="font-weight:500">'+esc(x.r.name||'提醒')+'</b><div class="hint" style="margin:2px 0 0">'+(x.days?'還有 '+x.days+' 天（'+(d.getMonth()+1)+'月'+d.getDate()+'日 週'+WDN[d.getDay()]+'）':'就是今天')+'</div>'+(x.r.note?'<p class="hint" style="margin:4px 0 0;white-space:pre-wrap">'+esc(x.r.note)+'</p>':'')+'</div>'}).join('')+'<button class="btn s" data-a="remok">知道了</button><button class="btn" data-a="remlater">晚點提醒</button><button class="btn" data-a="remtmr">明日提醒</button>',1)}
const remPending=()=>{const tk=localDayKey(new Date()),nw=Date.now();return remDue().filter(x=>x.r.shown!==tk&&!(x.r.later&&x.r.later>nw)&&!(x.r.tmr&&x.r.tmr>tk))};
function remCheck(){try{if(!S||!S.set||!S.rems)return;const sp=document.getElementById('splash');if(sp&&getComputedStyle(sp).display!=='none')return;const tk=localDayKey(new Date());if(remLastDay!==tk){remLastDay=tk;evSync()}remAsk()}catch(e){}}
setInterval(remCheck,4000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')remAskSess=false});
const memoEvents=()=>{try{const m=new Map();remDue().forEach(x=>{const n=x.r.name||'提醒';if(!m.has(n)||m.get(n)>x.days)m.set(n,x.days)});return[...m].map(([n,d])=>({n,d}))}catch(e){return[]}};
const calHM=t=>{const d=new Date(t);return calPad(d.getHours())+':'+calPad(d.getMinutes())};
function remDesc(r){let ds;if(r.cal==='l')ds=r.rep==='m'?'每個農曆月'+lunDName(r.ld):r.rep==='y'?'每年農曆'+lunMName(r.lm,r.lleap)+lunDName(r.ld):'農曆'+lunMName(r.lm,r.lleap)+lunDName(r.ld)+'（'+fmtD(r.sk)+'）';else{const a=r.sk.split('-').map(Number);ds=r.rep==='m'?'每月'+a[2]+'日':r.rep==='y'?'每年'+a[1]+'月'+a[2]+'日':a[0]+'/'+a[1]+'/'+a[2]}return ds+'・前 '+(+r.before||0)+' 天通知'+(r.rec?'・記錄事件':'')}
function moodSplit(str){str=String(str||'');let g='';try{g=[...new Intl.Segmenter('zh',{granularity:'grapheme'}).segment(str)].map(x=>x.segment)[0]||''}catch(e){g=[...str][0]||''}if(g&&/\p{Extended_Pictographic}/u.test(g))return[g,str.slice(g.length).trim()];return['',str]}
function closeCalPop(){const o=document.getElementById('calpop');if(o)o.remove()}
function calMoodPop(btn){closeCalPop();const r=btn.getBoundingClientRect(),o=document.createElement('div');o.id='calpop';o.innerHTML='<div class="calpop-box"><div class="cal2-moods">'+ensureTodayMoods().map(mm=>'<button type="button" class="cal2-mc" data-a="calmood" data-i="'+mm.id+'">'+esc(mm.emoji+mm.text)+'</button>').join('')+'<button type="button" class="cal2-mc add" data-a="calmoodadd">＋新增心情</button></div></div>';document.body.appendChild(o);
  const bx=o.firstChild,w=bx.offsetWidth,h=bx.offsetHeight;let left=Math.max(12,Math.min(r.left,window.innerWidth-w-12)),top=r.bottom+6;if(top+h>window.innerHeight-12)top=Math.max(12,r.top-h-6);bx.style.left=left+'px';bx.style.top=top+'px'}
function calDayBody(){
  const [y,m,d]=calSel.split('-').map(Number),rows=calDayData(calSel),evs=evOnDay(calSel);
  let det='<div class="cal2-box"><h3>'+y+' 年 '+m+' 月 '+d+' 日'+(lunOf(pdk(calSel))?'　農曆'+(()=>{const L=lunOf(pdk(calSel));return lunMName(L.m,L.leap)+lunDName(L.d)})():'')+'</h3>';
  if(!rows.length)det+='<div class="cal2-v" style="color:var(--soft)">這天沒有聯絡人的每日留言。</div>';
  rows.forEach(({c,r})=>{const mo=r.mood&&(r.mood.emoji||r.mood.text)?esc((r.mood.emoji||'')+(r.mood.text||'')):'';
    det+='<div class="cal2-ct"><div class="cal2-nm">'+esc(c.name)+(r.t?'<small class="cal2-tm">留言時間 '+calHM(r.t)+'</small>':'')+'</div>'+(mo?'<div class="cal2-k">今日心情</div><div class="cal2-v">'+mo+'</div>':'')+'<div class="cal2-k">每日留言</div><div class="cal2-v">'+r.items.map(x=>esc(x)).join(' ')+'</div>'
      +(r.reply?'<div class="cal2-k">我的回覆（已回覆）</div><div class="cal2-v cal2-re">'+esc(r.reply.x)+'</div>':'<div class="cal2-k">回覆這則留言（只能回覆一次）</div><textarea class="cal2-in" id="cal-re-'+c.id+'" rows="2" maxlength="200" placeholder="寫下你的回覆"></textarea><button type="button" class="btn s" data-a="calreply" data-i="'+c.id+'" style="margin:6px 0 0">回覆</button>')+'</div>'});
  det+='</div>';
  if(evs.length)det+='<div class="cal2-box"><h3>當日事件</h3>'+evs.map(e=>'<div class="cal2-ct"><div class="cal2-nm">'+esc(e.name)+'</div>'+(e.note?'<div class="cal2-v" style="color:var(--soft)">'+esc(e.note)+'</div>':'')+'</div>').join('')+'</div>';
  const mine=(S.dmine&&S.dmine[calSel])||{},mv0=moodSplit(mine.mood||'');
  const my='<div class="cal2-box"><h3>我的每日留言與心情</h3><div class="cal2-k" style="margin-top:0">今日心情</div><button type="button" class="btn cal2-pick" data-a="calmoodpick">選擇心情</button><div class="cal2-mrow"><input class="cal2-in cal2-em" id="cal-me" type="text" maxlength="4" placeholder="😊" value="'+esc(mv0[0])+'"><input class="cal2-in" id="cal-mood" type="text" maxlength="20" placeholder="直接輸入只會記錄這天的心情，不會加入心情清單" value="'+esc(mv0[1])+'"></div><div class="cal2-k">每日留言</div><textarea class="cal2-in" id="cal-msg" rows="3" maxlength="300" placeholder="寫下這天想留的話">'+esc(mine.x||'')+'</textarea><button type="button" class="btn s" data-a="calsave" style="margin:8px 0 0">'+(mine.x||mine.mood?'儲存修改':'儲存')+'</button></div>';
  return det+my}
function calRemBody(){const list=S.rems||[],ids=list.map(r=>r.id);
  let h='<div class="cal2-box"><div class="cal2-tools"><button type="button" class="btn s" data-a="remadd">＋添加提醒</button><button type="button" class="btn" data-a="remmulti">'+(remEdit?'完成':'多選編輯')+'</button></div>';
  if(remEdit)h+='<div class="selbar">'+selAllHtml('cvr',ids,remSel)+'<button type="button" class="btn d" data-a="remdelsel" style="border-style:solid">刪除所選（'+remSel.length+'）</button></div>';
  if(!list.length)h+='<div class="cal2-v" style="color:var(--soft)">還沒有提醒。</div>';
  list.forEach(r=>{const sel=remSel.includes(r.id),info='<div class="grow" style="min-width:0"><b style="font-weight:500">'+esc(r.name||'提醒')+'</b><small class="cal2-sub">'+esc(remDesc(r))+'</small></div>';
    h+=remEdit?'<div class="ci cal2-row" data-a="remsel" data-i="'+r.id+'" style="cursor:pointer"><span class="ck '+(sel?'on':'')+'"></span>'+info+'</div>':'<div class="ci cal2-row'+(r.on?'':' off')+'">'+info+'<button type="button" class="sw '+(r.on?'on':'')+'" data-a="remsw" data-i="'+r.id+'" aria-label="開關"></button><button type="button" class="rem-ed" data-a="remedit1" data-i="'+r.id+'" aria-label="編輯">✎</button></div>'});
  return h+'</div>'}
function calEvBody(){const list=(S.evlog||[]).slice().sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:b.t-a.t),ids=list.map(e=>e.id),tk=localDayKey(new Date());
  let h='<div class="cal2-box"><div class="cal2-tools"><span class="cal2-v" style="flex:1;color:var(--soft);font-size:calc(12.5px*var(--fz,1))">所有通知事件都保留在這裡；月曆上只顯示最近兩年。</span><button type="button" class="btn" data-a="evmulti">'+(evEdit?'完成':'多選編輯')+'</button></div>';
  if(evEdit)h+='<div class="selbar">'+selAllHtml('cve',ids,evSel)+'<button type="button" class="btn d" data-a="evdelsel" style="border-style:solid">刪除所選（'+evSel.length+'）</button></div>';
  if(!list.length)h+='<div class="cal2-v" style="color:var(--soft)">還沒有事件紀錄。添加提醒並開啟「紀錄事件」後，會記在這裡。</div>';
  list.forEach(e=>{const sel=evSel.includes(e.id),d=pdk(e.date),L=lunOf(d),info='<div class="grow" style="min-width:0"><b style="font-weight:500">'+esc(e.name)+'</b><small class="cal2-sub">'+fmtD(e.date)+(L?'（農曆'+lunMName(L.m,L.leap)+lunDName(L.d)+'）':'')+(e.date>tk?'・即將到來':'')+'</small>'+(e.note?'<small class="cal2-sub">'+esc(e.note)+'</small>':'')+'</div>';
    h+=evEdit?'<div class="ci cal2-row" data-a="evsel" data-i="'+e.id+'" style="cursor:pointer"><span class="ck '+(sel?'on':'')+'"></span>'+info+'</div>':'<div class="ci cal2-row" data-a="evopen" data-i="'+e.id+'" style="cursor:pointer">'+info+'</div>'});
  return h+'</div>'}
/* 日期下方的小心情：左邊他的（目前聯絡人）、右邊我的，只顯示 emoji */
function calMoodRow(k){const h=S.dlog&&S.dlog[S.cur]&&S.dlog[S.cur][k]&&S.dlog[S.cur][k].mood,he=h&&h.emoji?h.emoji:'',mi=S.dmine&&S.dmine[k]&&S.dmine[k].mood?moodSplit(S.dmine[k].mood)[0]:'';
  return (he||mi)?'<span class="cal2-mo"><b>'+he+'</b><b>'+mi+'</b></span>':''}
function vCal(){calInit();dlogSync();
  const first=new Date(calY,calM,1),dim=new Date(calY,calM+1,0).getDate(),lead=first.getDay(),today=localDayKey(new Date());
  let cells='';for(let i=0;i<lead;i++)cells+='<span class="cal2-d o"></span>';
  for(let d=1;d<=dim;d++){const k=calKey(calY,calM,d),dt=new Date(calY,calM,d,12),L=lunOf(dt),has=calDayData(k).length,me=S.dmine&&S.dmine[k]&&(S.dmine[k].x||S.dmine[k].mood),ev=evOnDay(k).length;
    cells+='<button type="button" class="cal2-d'+(k===today?' today':'')+(k===calSel?' sel':'')+(L&&L.d===1?' l1':'')+(L&&L.d===15?' l15':'')+'" data-a="calsel" data-i="'+k+'"><span class="cal2-n">'+d+'</span><span class="cal2-lu">'+lunText(dt)+'</span>'+calMoodRow(k)+'<span class="cal2-dots">'+(has?'<i></i>':'')+(me?'<i class="me"></i>':'')+(ev?'<i class="ev"></i>':'')+'</span></button>'}
  const head='<div class="cal2-bar"><button type="button" class="btn" data-a="calprev" style="width:auto;margin:0;padding:6px 14px">‹</button><b>'+calY+' 年 '+(calM+1)+' 月</b><button type="button" class="btn" data-a="calnext" style="width:auto;margin:0;padding:6px 14px">›</button></div>';
  const wk='<div class="cal2-grid">'+WDN.map(x=>'<span class="cal2-w">'+x+'</span>').join('')+cells+'</div>'+(LUN?'<div class="cal2-lg"><i class="l1"></i>農曆初一、十五</div>':'');
  const tabs='<div class="stabs cal2-tabs">'+[['day','當日'],['rem','提醒'],['ev','事件紀錄']].map(([k,n])=>'<button type="button" class="stab '+(calTab===k?'on':'')+'" data-a="caltab" data-i="'+k+'">'+n+'</button>').join('')+'</div>';
  return '<div class="ph2"><button class="ib" data-a="calback">‹</button><h1>月曆</h1></div>'+head+wk+tabs+(calTab==='rem'?calRemBody():calTab==='ev'?calEvBody():calDayBody())}
/* 提醒編輯 */
function remRead(){const d=remDraft,g=id=>document.getElementById(id);if(!d||!g('rm-name'))return;d.name=g('rm-name').value.trim();d.note=g('rm-note').value.trim();d.before=Math.max(0,Math.min(60,Math.round(+g('rm-bf').value||0)));d.rep=g('rm-rep').value==='0'?0:g('rm-rep').value;if(d.cal==='l'){d.ly=+g('rm-ly').value||d.ly;d.lm=+g('rm-lm').value;d.ld=+g('rm-ld').value;d.lleap=g('rm-ll').checked?1:0}else d.sk=g('rm-date').value||d.sk}
function remSheet(){const d=remDraft,mo=LMN.map((n,i)=>'<option value="'+(i+1)+'"'+(d.lm===i+1?' selected':'')+'>'+n+'月</option>').join(''),dayo=Array.from({length:30},(_,i)=>'<option value="'+(i+1)+'"'+(d.ld===i+1?' selected':'')+'>'+lunDName(i+1)+'</option>').join('');
  const dateRow=d.cal==='l'?'<div class="cal2-k">農曆日期</div><div class="rem-lrow"><input id="rm-ly" type="number" class="cal2-in" value="'+d.ly+'"><select id="rm-lm" class="cal2-in">'+mo+'</select><select id="rm-ld" class="cal2-in">'+dayo+'</select><label class="rem-leap">閏月<input type="checkbox" id="rm-ll"'+(d.lleap?' checked':'')+'></label></div>':'<div class="cal2-k">國曆日期</div><input id="rm-date" type="date" class="cal2-in" value="'+d.sk+'">';
  const opt=(v,n)=>'<option value="'+v+'"'+(String(d.rep)===String(v)?' selected':'')+'>'+n+'</option>';
  sheet(d.id?'編輯提醒':'添加提醒','<div class="cal2-k" style="margin-top:0">事件名（選填）</div><input id="rm-name" class="cal2-in" maxlength="30" value="'+esc(d.name)+'" placeholder="例如：媽媽生日"><div class="cal2-k">備注（選填，只會顯示在跳出的通知框）</div><textarea id="rm-note" class="cal2-in" rows="2" maxlength="200">'+esc(d.note)+'</textarea><div class="cal2-k">日期種類</div><div class="seg"><button type="button" class="'+(d.cal==='s'?'on':'')+'" data-a="remcal" data-i="s">國曆</button>'+(LUN?'<button type="button" class="'+(d.cal==='l'?'on':'')+'" data-a="remcal" data-i="l">農曆</button>':'')+'</div>'+dateRow+'<div class="cal2-k">在此日期幾天前開始通知</div><input id="rm-bf" type="number" min="0" max="60" class="cal2-in" value="'+d.before+'"><div class="cal2-k">重複</div><select id="rm-rep" class="cal2-in">'+opt(0,'不重複')+opt('m','每個月重複')+opt('y','每年重複')+'</select><p class="hint" style="margin:4px 2px 0">每月／每年重複時，遇到沒有那一天的月份（例如 31 號、農曆三十）就不會提醒。</p><div class="sr" style="align-items:center;margin-top:12px"><span>紀錄事件（顯示在月曆與事件紀錄）</span><button type="button" class="sw '+(d.rec?'on':'')+'" data-a="remrec" aria-label="紀錄事件"></button></div><button class="btn s" data-a="remsave">儲存</button><button class="btn" data-a="close">取消</button>')}
function remNew(){const k=calPicked&&calSel?calSel:localDayKey(new Date()),L=lunOf(pdk(k))||{y:+k.slice(0,4),m:1,d:1,leap:0};return{id:null,name:'',note:'',cal:'s',sk:k,ly:L.y,lm:L.m,ld:L.d,lleap:L.leap,before:2,rep:0,rec:1,on:1}}