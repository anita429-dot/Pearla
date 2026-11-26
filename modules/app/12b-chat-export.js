/* ── 聊天室：導出聊天紀錄 ──
   工具 → 導出聊天紀錄 → 多選訊息模式（預設範圍模式）→ 底部「導出」→ 產生帶圖 HTML → 儲存至檔案
   狀態：xp = {cid, mode:'range'|'single', sel:Set(訊息id), anchor:訊息id|null, st:進入時的捲動位置} */
let xp=null,xKeep=null,xBusy=false,xFile=null;
const xOn=()=>!!xp&&tab==='chat'&&xp.cid===S.cur;
/* 可選：一般訊息（含圖片、表情包、語音、問卷）與「拍一拍」；其他功能的通知、已讀不回等系統訊息不可選 */
const xSelectable=m=>m.f!=='sys'||!!m.pat;
const xList=()=>ms(S.cur).filter(xSelectable);
const xCirc=id=>'<button type="button" class="xc" data-a="xsel" data-i="'+id+'" aria-label="選取訊息"><i></i></button>';
const xCls=id=>(xp.sel.has(id)?' xs':'')+(xp.anchor===id?' xa':'');

function xHeadIn(){const m=xp.mode;
  return '<button type="button" class="xm'+(m==='range'?' on':'')+'" data-a="xmode" data-i="range">範圍模式</button>'
    +'<button type="button" class="xm'+(m==='single'?' on':'')+'" data-a="xmode" data-i="single">單選模式</button>'
    +'<button type="button" class="xm xexit" data-a="xexit">退出</button>'}
const xHead=()=>'<div class="chh xh" id="xhead">'+xHeadIn()+'</div>';
function xBarIn(){const n=xp.sel.size,L=xList(),all=L.length>0&&L.every(m=>xp.sel.has(m.id));
  const tip=(xp.mode==='range'&&xp.anchor!=null)?'已選起點，請點範圍終點':'已選 '+n+' 則';
  return '<span class="xcnt">'+tip+'</span><button type="button" class="xb" data-a="xall">'+(all?'取消全選':'全選')+'</button><button type="button" class="xb xgo" data-a="xgo"'+(n?'':' disabled')+'>導出</button>'}
const xBar=()=>'<div class="xbar" id="xbar">'+xBarIn()+'</div>';

/* 不重畫整個聊天室：只更新選取外觀，捲動位置不會跳 */
function xRefresh(){if(!xp)return;
  document.querySelectorAll('#cl [data-xid]').forEach(e=>{const id=e.dataset.xid;e.classList.toggle('xs',xp.sel.has(id));e.classList.toggle('xa',xp.anchor===id)});
  const h=$('#xhead'),b=$('#xbar');if(h)h.innerHTML=xHeadIn();if(b)b.innerHTML=xBarIn()}

function xStart(){const l=$('#cl');if(!ms(S.cur).some(xSelectable)){toast('還沒有可以導出的訊息',1800);return}
  chS={open:0,d:'',k:''};xp={cid:S.cur,mode:'range',sel:new Set(),anchor:null,st:l?l.scrollTop:null};
  closeSheet();render()}
function xExitAsk(){sheet('退出導出聊天紀錄','<p style="margin:0 0 12px;line-height:1.7">確定要退出嗎？已選的訊息會全部取消。</p><div class="confirm-btns"><button class="btn" data-a="close">取消</button><button class="btn d" data-a="xexitok">退出</button></div>',1)}
function xExit(){closeSheet();const l=$('#cl');xKeep=l?l.scrollTop:null;xp=null;xFile=null;render()}

function xTap(id){if(!xOn())return;const L=xList().map(m=>m.id),s=xp.sel;if(!L.includes(id))return;
  const tog=k=>{s.has(k)?s.delete(k):s.add(k)};
  if(xp.mode==='single'){tog(id)}
  else if(xp.anchor==null){xp.anchor=id}
  else{
    const i=L.indexOf(xp.anchor),j=L.indexOf(id);xp.anchor=null;
    if(i<0){xp.anchor=id}
    else{
      const lo=Math.min(i,j),hi=Math.max(i,j),seg=L.slice(lo,hi+1),st=seg.map(k=>s.has(k));
      /* A～D 狀態全部相同才整段一起選／取消；否則只改變 A 和 D */
      if(seg.length>1&&st.every(v=>v===st[0]))seg.forEach(k=>{st[0]?s.delete(k):s.add(k)});
      else new Set([L[i],L[j]]).forEach(tog)
    }
  }
  xRefresh()}
function xMode(m){if(!xOn())return;xp.mode=m==='single'?'single':'range';xp.anchor=null;xRefresh()}
function xAll(){if(!xOn())return;const L=xList(),all=L.length>0&&L.every(m=>xp.sel.has(m.id));L.forEach(m=>{all?xp.sel.delete(m.id):xp.sel.add(m.id)});xp.anchor=null;xRefresh()}

/* ── 輸出 HTML ── */
const xP2=n=>String(n).padStart(2,'0');
const xDate=t=>{const d=new Date(t);return d.getFullYear()+'/'+xP2(d.getMonth()+1)+'/'+xP2(d.getDate())};
const xTime=t=>{const d=new Date(t);return d.getHours()+':'+xP2(d.getMinutes())};
const xFname=t=>{const d=new Date(t);return d.getFullYear()+xP2(d.getMonth()+1)+xP2(d.getDate())+'_'+xP2(d.getHours())+xP2(d.getMinutes())+'.html'};
const xTick=()=>new Promise(r=>setTimeout(r,0));
function xLoadImg(src){return new Promise(r=>{const im=new Image();im.onload=()=>r(im);im.onerror=()=>r(null);im.src=src})}
/* 縮圖並內嵌：max＝最長邊像素；alpha＝保留透明（表情包）。回傳 {u,w,h}，失敗回傳 null */
const xImgCache=new Map();
async function xImg(src,max,alpha){if(!src)return null;const key=max+(alpha?'a':'p')+'|'+src;if(xImgCache.has(key))return xImgCache.get(key);
  let out=null;
  try{
    const im=await xLoadImg(src);
    if(im&&im.naturalWidth){
      const W=im.naturalWidth,H=im.naturalHeight,sc=Math.min(1,max/Math.max(W,H)),w=Math.max(1,Math.round(W*sc)),h=Math.max(1,Math.round(H*sc));
      if(sc>=1&&src.startsWith('data:'))out={u:src,w,h};
      else{
        const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d');
        if(!alpha){cx.fillStyle='#fff';cx.fillRect(0,0,w,h)}
        cx.drawImage(im,0,0,w,h);
        let u=alpha?cv.toDataURL('image/webp',.85):cv.toDataURL('image/jpeg',.85);
        out={u,w,h}
      }
    }
  }catch(e){out=null}
  xImgCache.set(key,out);return out}

function xQaText(m){const a=m.qa;if(!a)return '[問卷]';const pick=(o,sel)=>(sel&&sel.length)?' → '+sel.map(k=>o[k]).filter(Boolean).join('、'):'';
  if(a.t==='survey')return '[問卷]\n'+(a.qs||[]).map((q,i)=>(i+1)+'. '+q.q+pick(q.o||[],a.sel&&a.sel[i])).join('\n');
  if(a.t==='text')return '[問卷] '+(a.q||'');
  return '[問卷] '+(a.q||'')+pick(a.o||[],a.sel)}

async function xBuild(){
  if(!xOn()||xBusy)return;
  const c=cur(),all=ms(S.cur),list=all.filter(m=>xp.sel.has(m.id)&&xSelectable(m));
  if(!list.length)return;
  xBusy=true;
  const meName=S.me||'我',taName=c.name||'聯絡人';
  sheet('導出聊天紀錄','<p class="hint" id="xprog" style="margin:0;line-height:1.7">整理中…（0 / '+list.length+'）</p>',1);
  const prog=$('#xprog');
  try{
    const css=[],kmap=new Map();
    /* 同一張圖只內嵌一次（以 CSS 類別引用），表情包重複出現不會讓檔案變大 */
    const imgBox=async(src,max,alpha,dispMax,cls)=>{
      const r=await xImg(src,max,alpha);if(!r)return null;
      let k=kmap.get(r.u);if(k==null){k='k'+kmap.size;kmap.set(r.u,k);css.push('.'+k+'{background-image:url("'+r.u+'")}')}
      const s=Math.min(1,dispMax/Math.max(r.w,r.h));
      return '<div class="im '+(cls||'')+' '+k+'" style="width:'+Math.round(r.w*s)+'px;height:'+Math.round(r.h*s)+'px"></div>'};
    const body=[];let lastDay='';
    for(let n=0;n<list.length;n++){
      const m=list[n],day=xDate(m.t);
      if(day!==lastDay){body.push('<div class="day"><span>日期'+day+'</span></div>');lastDay=day}
      const tt=xTime(m.t);
      if(m.f==='sys'){body.push('<div class="pat"><span>'+tt+'　'+esc(m.x||'')+'</span></div>')}
      else{
        const me=m.f==='me',nm=me?meName:taName;let inner='';
        if(m.qa){inner=esc(xQaText(m))}
        else if(m.audio){inner='[語音]'}
        else if(m.img){
          const st=!m.pic;
          const box=st?await imgBox(m.img,240,true,110,'stk'):await imgBox(m.img,800,false,220,'pho');
          inner=box||(st?'[表情包]':'[圖片]');
          if(m.x)inner+='<div class="tx">'+esc(m.x)+'</div>'
        }else inner=esc(m.x||'');
        let qt='';
        if(m.q||m.qi){
          let qn='';const qm=m.qid&&all.find(x=>x.id===m.qid);if(qm&&qm.f!=='sys')qn=(qm.f==='me'?meName:taName);
          const qimg=m.qi?await imgBox(m.qi,160,true,44,'qi'):null;
          qt='<div class="q">引用'+(qn?'「'+esc(qn)+'」':'')+'：'+(qimg||'')+esc(m.q||(m.qi&&!qimg?'[圖片]':''))+'</div>'
        }
        const media=!!m.img&&!m.qa;
        body.push('<div class="r '+(me?'me':'ta')+'"><div class="mt">'+tt+'　'+esc(nm)+'</div><div class="b'+(media?' md':'')+'">'+inner+qt+'</div></div>')
      }
      if(prog&&(n%5===4||n===list.length-1)){prog.textContent='整理中…（'+(n+1)+' / '+list.length+'）';await xTick()}
    }
    const first=list[0].t,last=list[list.length-1].t,title='與'+taName+'的聊天紀錄';
    const html='<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>'
      +'*{box-sizing:border-box}body{margin:0;background:#f6f4fb;color:#4a4670;font:15px/1.7 -apple-system,"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif}'
      +'.w{max-width:640px;margin:0 auto;padding:20px 14px 40px}h1{font-size:18px;font-weight:600;margin:0 0 2px;text-align:center}.sub{margin:0 0 14px;text-align:center;font-size:12px;color:#8b86bd}'
      +'.day{text-align:center;margin:18px 0 8px}.day span{display:inline-block;font-size:12px;color:#8b86bd;background:#fff;border:1px solid #e1ddf5;border-radius:999px;padding:2px 14px}'
      +'.pat{text-align:center;margin:8px 0}.pat span{font-size:12px;color:#8b86bd;border:1px dashed #cbc7ee;border-radius:999px;padding:2px 12px}'
      +'.r{display:flex;flex-direction:column;align-items:flex-start;margin:10px 0}.r.me{align-items:flex-end}'
      +'.mt{font-size:11px;color:#8b86bd;margin:0 6px 2px}'
      +'.b{max-width:80%;padding:8px 12px;background:#fff;border:1.4px solid #e1ddf5;border-radius:16px 16px 16px 5px;white-space:pre-wrap;word-break:break-word}.r.me .b{background:#ece8fb;border-radius:16px 16px 5px 16px}'
      +'.b.md{background:none;border:0;padding:0}.tx{margin-top:4px}'
      +'.im{background-repeat:no-repeat;background-position:center;background-size:contain;border-radius:6px;max-width:100%}.im.qi{display:inline-block;vertical-align:middle;margin-right:6px}'
      +'.q{margin-top:6px;padding:4px 8px;font-size:12px;color:#8b86bd;background:#00000008;border-left:3px solid #cbc7ee;border-radius:4px}'
      +css.join('')+'</style></head><body><div class="w"><h1>'+esc(title)+'</h1><p class="sub">共 '+list.length+' 則　'+xDate(first)+' '+xTime(first)+' ～ '+xDate(last)+' '+xTime(last)+'</p>'
      +body.join('')+'</div></body></html>';
    const name=xFname(first);
    xFile=new File([html],name,{type:'text/html'});
    const kb=xFile.size/1024,sz=kb>=1024?(kb/1024).toFixed(1)+' MB':Math.max(1,Math.round(kb))+' KB';
    sheet('導出聊天紀錄','<p style="margin:0 0 6px;line-height:1.7">共 '+list.length+' 則訊息，檔案約 '+sz+'。</p><p class="hint" style="margin:0 0 12px;word-break:break-all">'+esc(name)+'</p><div class="confirm-btns"><button class="btn" data-a="close">關閉</button><button class="btn s" data-a="xsave">儲存至檔案</button></div>',1)
  }catch(err){
    console.error(err);sheet('導出失敗','<p style="margin:0 0 12px;line-height:1.7">整理聊天紀錄時發生錯誤，請稍後再試，或縮小選取範圍。</p><div class="confirm-btns"><button class="btn" data-a="close">關閉</button></div>',1)
  }finally{xBusy=false}
}

/* 儲存至檔案：先整理好檔案，這一步才呼叫分享面板（iPhone 要求必須直接由點擊觸發） */
async function xSave(){if(!xFile)return;
  try{
    if(navigator.canShare&&navigator.canShare({files:[xFile]})){await navigator.share({files:[xFile]});closeSheet();return}
  }catch(e){if(e&&e.name==='AbortError')return}
  const u=URL.createObjectURL(xFile),a=document.createElement('a');a.href=u;a.download=xFile.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);
  toast('已開始下載',1800)}
