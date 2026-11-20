
/* ── 信箱 ── */
const TRASH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5"/></svg>';
const PENCIL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19l-4 1zM14.5 6.5l3 3"/></svg>';
const ltime=t=>{const d=new Date(t);return d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()+' '+tm(t)};
const limgs=L=>(L.imgs||[]).length?'<div class="limgs">'+(L.imgs||[]).map(u=>'<img src="'+u+'">').join('')+'</div>':'';
function genLetter(cid){const s=S.set,cards=cardPool(cid).filter(k=>k.text);if(!cards.length)return null;
  const a=Math.round(Math.min(s.lcmin,s.lcmax)),b=Math.round(Math.max(s.lcmin,s.lcmax)),n=Math.max(1,a+ri(b-a+1)),hit=p=>rnd()*100<(+p||0),
    stk=pool('emoji',cid).filter(k=>k.img),emj=pool('emj',cid).filter(k=>k.text),kao=pool('kao',cid).filter(k=>k.text),max=Math.max(0,Math.round(+s.lemomax||0)),imgs=[],lines=[];let ms=0;
  /* 每張字卡：字卡抽取 → emoji判定 → 選擇emoji → 顏文字判定 → 選擇顏文字 → 表情包貼圖；每個步驟 0.5 秒 */
  for(let i=0;i<n;i++){ms+=STEP;let x=pk(cards).text;const wrap=z=>{x=rnd()<.5?z+' '+x:x+' '+z};
    if(+s.lemj>0){ms+=STEP;if(emj.length&&hit(s.lemj)){ms+=STEP;wrap(pk(emj.map(k=>k.text)))}}
    if(+s.lkao>0){ms+=STEP;if(kao.length&&hit(s.lkao)){ms+=STEP;wrap(pk(kao.map(k=>k.text)))}}
    if(+s.lemo>0&&stk.length&&imgs.length<max){ms+=STEP;if(hit(s.lemo)){ms+=STEP;imgs.push(pk(stk).img)}}
    lines.push(x)}
  return{text:lines.reduce(cjR,''),imgs,ms}}
const cname=id=>{const c=S.contacts.find(z=>z.id===id);return c?c.name:'已刪除的聯絡人'};
const flow=t=>esc(String(t||'').split('\n').join(' '));
const replySameDay=r=>!!r&&localDayKey(new Date(r.t))===localDayKey(new Date());
const mailUnseen=()=>(S.letters||[]).filter(x=>(x.from==='ta'&&!x.seen)||(x.from==='me'&&x.reply&&!x.rseen)).length;
const mailBadge=()=>{const n=mailUnseen();return(S.set&&S.set.letterBadge&&n)?'<b class="nb mbd">'+(n>9?'9+':n)+'</b>':''};
const grpBadge=()=>{const n=(S.groups||[]).reduce((a,g)=>a+(S.un[g.id]||0),0);return n?'<b class="nb mbd">'+(n>9?'9+':n)+'</b>':''};
function updateGrpBadge(){const t=document.querySelector('.tile[data-a=grp]');if(!t)return;const o=t.querySelector('.mbd');if(o)o.remove();t.insertAdjacentHTML('afterbegin',grpBadge())}
const momUnseen=()=>(S.moments||[]).filter(p=>p.cid!=='me'&&!p.seen&&S.contacts.some(c=>c.id===p.cid)).length;
const momBadge=()=>{const n=momUnseen();return n?'<b class="nb mbd mom-bd">'+(n>9?'9+':n)+'</b>':''};
function updateMomBadge(){const t=document.querySelector('.tile[data-a=mom]');if(!t)return;const o=t.querySelector('.mbd');if(o)o.remove();t.insertAdjacentHTML('afterbegin',momBadge())}
function updateMailBadge(){const t=document.querySelector('.tile[data-a=mail]');if(!t)return;const o=t.querySelector('.mbd');if(o)o.remove();t.insertAdjacentHTML('afterbegin',mailBadge())}
// pen-synth.js — 合成版寫信沙沙聲（備援：找不到音檔時使用）
// 用法：
//   PenSound.attach(document.querySelector('#letterTextarea'));
//   PenSound.setEnabled(true);   // 預設關閉，之後接設置開關
//   PenSound.setVolume(0.5);     // 0 ~ 1
const PenSynth = (() => {
  // 連續的書寫音：先合成一段約 6 秒、由許多筆畫組成的紙上書寫聲，打字時循環播放，
  // 停止打字約 0.35 秒後淡出並停止。
  let ctx = null, loop = null, enabled = false, volume = 0.7;
  let src = null, gain = null, idle = null, playing = false;
  const IDLE_MS = 350;

  function makeLoop() {
    const sr = ctx.sampleRate, dur = 6, n = Math.floor(sr * dur);
    const buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
    // 1) 筆畫排程：每劃一道速度先升後降，筆畫之間有短暫換向；偶爾有較長的停頓（換字）
    const sp = new Float32Array(n), fq = new Float32Array(n);
    let t = 0.15;
    while (t < dur - 0.6) {
      const len = 0.12 + Math.random() * 0.34, a = 0.55 + Math.random() * 0.45, f = 0.7 + Math.random() * 0.6;
      const i0 = Math.floor(t * sr), i1 = Math.min(n - 1, Math.floor((t + len) * sr));
      for (let i = i0; i <= i1; i++) {
        const x = (i - i0) / Math.max(1, i1 - i0), v = Math.pow(Math.sin(Math.PI * x), 0.8) * a;
        if (v > sp[i]) { sp[i] = v; fq[i] = f; }
      }
      t += len + (Math.random() < 0.2 ? 0.1 + Math.random() * 0.14 : 0.008 + Math.random() * 0.04);
    }
    // 2) 合成：帶通濾波的柔和噪音（音色隨筆速變化）× 紙纖維顆粒 + 稀疏的細小摩擦「喀沙」
    let low = 0, band = 0, gs = Math.random(), gt = Math.random(), cr = 0, y = 0;
    const gstep = Math.floor(sr / 110), Q = 0.55;
    for (let i = 0; i < n; i++) {
      const v = sp[i];
      if (v < 0.002) { d[i] = 0; y *= 0.9; continue; }
      const fc = 380 + 1000 * v * fq[i], F = 2 * Math.sin(Math.PI * fc / sr);
      const w = Math.random() * 2 - 1;
      low += F * band; const high = w - low - Q * band; band += F * high;
      const k = i % gstep; if (k === 0) { gs = gt; gt = Math.random(); }
      const gr = 0.5 + 0.5 * (gs + (gt - gs) * (k / gstep));
      if (Math.random() < v * 0.010) cr = (Math.random() * 2 - 1);
      cr *= 0.82;
      const x = (band * 0.6 * gr + cr * 0.6) * v;
      y += 0.3 * (x - y); d[i] = y;
    }
    let pk = 0; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(d[i]));
    const m = pk ? 0.9 / pk : 1; for (let i = 0; i < n; i++) d[i] *= m;
    const fade = Math.floor(sr * 0.04);
    for (let i = 0; i < fade; i++) { const r = i / fade; d[i] *= r; d[n - 1 - i] *= r; }
    return buf;
  }

  function init() {
    if (ctx) { if (ctx.state !== 'running') { try { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) {} } return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = (window.acx && window.acx()) || new AC();
    loop = makeLoop();
  }

  function start() {
    if (!enabled || !ctx || !loop) return;
    if (ctx.state !== 'running') { try { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
    const t = ctx.currentTime, target = 0.85 * volume;
    if (!playing) {
      src = ctx.createBufferSource(); src.buffer = loop; src.loop = true;
      gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(Math.max(target, 0.0002), t + 0.06);
      src.connect(gain); gain.connect(ctx.destination);
      src.start(0, Math.random() * (loop.duration - 0.8));
      playing = true;
    } else {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
      gain.gain.linearRampToValueAtTime(Math.max(target, 0.0002), t + 0.04);
    }
    clearTimeout(idle);
    idle = setTimeout(stop, IDLE_MS);
  }

  function stop() {
    clearTimeout(idle);
    if (!playing) return;
    playing = false;
    const g = gain, s = src, t = ctx.currentTime;
    src = null; gain = null;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t);
    g.gain.linearRampToValueAtTime(0.0001, t + 0.18);
    try { s.stop(t + 0.2); } catch (e) {}
  }

  function attach(el) {
    if (!el) return;
    el.addEventListener('pointerdown', init);
    el.addEventListener('focus', init);
    el.addEventListener('input', start);
    el.addEventListener('blur', stop);
  }

  return {
    attach,
    unlock: init,
    play: start,
    stop,
    setEnabled(v) { enabled = !!v; if (enabled) init(); else stop(); },
    setVolume(v) { volume = Math.min(1, Math.max(0, Number(v) || 0)); },
    _loop: () => loop,
  };
})();

// pen-sound.js — Pearla 寫信沙沙聲（使用「使用者提供的影片原始音軌」，連續循環版）
// 音檔：public/assets/shared/pearla-writing-sound-from-video.wav（相對路徑，GitHub Pages 子路徑也能讀到）
// 打字時整段音軌無縫循環播放、不會中斷；停止打字約 0.35 秒後淡出並停止，刪除文字不會觸發。
// 找不到音檔時自動退回合成沙沙聲（PenSynth）。
const PenSound = (() => {
  const SOUND_URL = 'assets/shared/pearla-writing-sound-from-video.wav';
  const IDLE_MS = 350;      // 停止打字多久後停止播放
  const XFADE = 0.25;       // 首尾交叉淡化秒數，讓循環接縫聽不出來
  const BASE_GAIN = 0.7;
  let ctx = null, loop = null, loading = false, failed = false;
  let enabled = false, volume = 0.5;
  let src = null, gain = null, idle = null, playing = false;
  const lens = new WeakMap();

  // 把原音軌首尾做等功率交叉淡化，產生可無縫循環的 buffer
  function makeSeamless(b) {
    const sr = b.sampleRate, L = b.length;
    const xf = Math.min(Math.floor(sr * XFADE), Math.floor(L / 3));
    const out = ctx.createBuffer(b.numberOfChannels, L - xf, sr);
    for (let c = 0; c < b.numberOfChannels; c++) {
      const d = b.getChannelData(c), o = out.getChannelData(c);
      for (let i = 0; i < L - xf; i++) o[i] = d[i];
      for (let i = 0; i < xf; i++) {
        const r = i / xf, a = Math.sin(r * Math.PI / 2), z = Math.cos(r * Math.PI / 2);
        o[i] = d[i] * a + d[L - xf + i] * z;
      }
    }
    return out;
  }

  function load() {
    if (loop || loading || failed || !ctx) return;
    loading = true;
    fetch(SOUND_URL)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
      .then(ab => new Promise((ok, no) => ctx.decodeAudioData(ab, ok, no)))
      .then(b => { loop = makeSeamless(b); })
      .catch(() => { failed = true; })
      .then(() => { loading = false; });
  }

  function init(el) {
    if (el && el.value != null) lens.set(el, el.value.length);
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { failed = true; return; }
      ctx = (window.acx && window.acx()) || new AC();
    }
    if (ctx.state !== 'running') { try { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
    load();
  }

  function play(el, force) {
    if (!enabled && !force) return;
    if (el && el.value != null) {
      const n = el.value.length, prev = lens.has(el) ? lens.get(el) : n - 1;
      lens.set(el, n);
      if (n <= prev) return;            // 只在新增文字時續播
    }
    init();
    if (!loop) {                         // 音檔載入失敗 → 備援合成音；載入中 → 先靜音
      if (failed) { PenSynth.setVolume(volume); PenSynth.setEnabled(true); PenSynth.play(); }
      return;
    }
    const t = ctx.currentTime, target = Math.max(volume * BASE_GAIN, 0.0002);
    if (!playing) {
      src = ctx.createBufferSource(); src.buffer = loop; src.loop = true;
      gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(target, t + 0.06);
      src.connect(gain); gain.connect(ctx.destination);
      src.start(0, Math.random() * loop.duration);
      playing = true;
    } else {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
      gain.gain.linearRampToValueAtTime(target, t + 0.04);
    }
    clearTimeout(idle);
    idle = setTimeout(stop, IDLE_MS);
  }

  function stop() {
    clearTimeout(idle);
    if (failed) PenSynth.stop();
    if (!playing) return;
    playing = false;
    const g = gain, s = src, t = ctx.currentTime;
    src = null; gain = null;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t);
    g.gain.linearRampToValueAtTime(0.0001, t + 0.18);
    try { s.stop(t + 0.2); } catch (e) {}
  }

  function attach(el) {
    if (!el) return;
    el.addEventListener('pointerdown', () => init(el));
    el.addEventListener('focus', () => init(el));
    el.addEventListener('input', () => play(el));
    el.addEventListener('blur', stop);
  }

  return {
    attach,
    unlock: init,
    play,
    stop,
    setEnabled(v) { enabled = !!v; if (enabled) init(); else stop(); },
    setVolume(v) { volume = Math.min(1, Math.max(0, Number(v) || 0)); PenSynth.setVolume(volume); },
    preview() { init(); let k = 0; const tick = () => { if (k++ < 6) { play(null, true); setTimeout(tick, 150); } }; tick(); },
  };
})();

// crab-mail.js — Pearla 重要信件：螃蟹送信動畫（獨立模組，尚未接入主程式）
// 用法（點信箱、且有重要信件時）：
//   CrabMail.show({
//     content: '信件內容文字',
//     onSave: () => { /* 這裡寫保存信件的動作，可回傳 Promise */ },
//     skipAnimation: false,   // true＝略過螃蟹，直接顯示信件
//   });
// 流程：螃蟹從右邊走到中間 → 點信件，螃蟹往左走出去 → 再點信件打開
//       → 打開後只有「保存信件」有反應，按了保存才會關閉。
const CrabMail = (() => {
  const CSS = `
  .cm-overlay{position:fixed;inset:0;z-index:9999;background:rgba(80,60,110,.38);
    touch-action:none;overflow:hidden;-webkit-user-select:none;user-select:none}
  .cm-wrap{position:absolute;left:50%;top:36%;width:160px;margin-left:-80px;
    display:flex;flex-direction:column;align-items:center}
  .cm-in{animation:cm-in 2.6s ease-out forwards}
  .cm-out{animation:cm-out 2.2s ease-in forwards}
  @keyframes cm-in{from{transform:translateX(calc(50vw + 120px))}to{transform:translateX(0)}}
  @keyframes cm-out{from{transform:translateX(0)}to{transform:translateX(calc(-50vw - 120px))}}
  .cm-env{width:96px;height:66px;margin-bottom:-16px;cursor:pointer;position:relative;z-index:1}
  .cm-env-fixed{position:fixed;margin:0}
  .cm-pulse{animation:cm-pulse 1s ease-in-out infinite alternate}
  @keyframes cm-pulse{from{transform:scale(1)}to{transform:scale(1.1)}}
  .cm-crab{width:160px;height:120px;display:block;position:relative;z-index:2;pointer-events:none}
  .cm-walking .cm-crab{animation:cm-bob .4s ease-in-out infinite alternate}
  .cm-walking .legsA{animation:cm-legA .3s ease-in-out infinite alternate}
  .cm-walking .legsB{animation:cm-legB .3s ease-in-out infinite alternate}
  .legsA,.legsB{transform-origin:80px 75px}
  @keyframes cm-bob{from{transform:translateY(0) rotate(-1.5deg)}to{transform:translateY(-4px) rotate(1.5deg)}}
  @keyframes cm-legA{from{transform:rotate(-9deg)}to{transform:rotate(9deg)}}
  @keyframes cm-legB{from{transform:rotate(9deg)}to{transform:rotate(-9deg)}}
  .cm-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
    width:86vw;max-width:420px;max-height:72vh;display:flex;flex-direction:column;
    background:#fffaf6;border:2px solid #b9a0d4;border-radius:18px;padding:18px;
    box-shadow:0 8px 30px rgba(80,60,110,.3);touch-action:pan-y}
  .cm-text{overflow-y:auto;white-space:pre-wrap;word-break:break-word;font-size:16px;
    line-height:1.7;color:#5a4670;-webkit-user-select:text;user-select:text}
  .cm-save{margin-top:14px;padding:11px;border:0;border-radius:12px;font-size:16px;
    background:#e9a3c0;color:#fff;cursor:pointer}
  .cm-save:disabled{opacity:.6}`;

  const ENV_SVG = `<svg viewBox="0 0 96 66" width="96" height="66">
    <rect x="3" y="3" width="90" height="60" rx="6" fill="#fff5f7" stroke="#8f6fae" stroke-width="3"/>
    <path d="M5 8 L48 38 L91 8" fill="none" stroke="#8f6fae" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="48" cy="38" r="7" fill="#f29ab0" stroke="#8f6fae" stroke-width="2"/></svg>`;

  const CRAB_SVG = `<svg class="cm-crab" viewBox="0 0 160 120">
    <g class="legsA" stroke="#9b7bb8" stroke-width="5" stroke-linecap="round" fill="none">
      <path d="M48 76 L22 88 L14 108"/><path d="M58 88 L38 104 L34 116"/>
      <path d="M108 74 L132 70 L144 82"/></g>
    <g class="legsB" stroke="#9b7bb8" stroke-width="5" stroke-linecap="round" fill="none">
      <path d="M52 66 L26 70 L16 82"/><path d="M102 88 L122 104 L126 116"/>
      <path d="M112 76 L138 88 L146 108"/></g>
    <g stroke="#8f6fae" stroke-width="3" fill="#f6a5b9">
      <path d="M52 60 Q30 54 34 32" fill="none" stroke-width="5" stroke="#9b7bb8" stroke-linecap="round"/>
      <path d="M108 60 Q130 54 126 32" fill="none" stroke-width="5" stroke="#9b7bb8" stroke-linecap="round"/>
      <ellipse cx="33" cy="26" rx="12" ry="14"/><ellipse cx="127" cy="26" rx="12" ry="14"/>
      <ellipse cx="80" cy="76" rx="40" ry="28"/></g>
    <g stroke="#9b7bb8" stroke-width="3" stroke-linecap="round"><path d="M68 52 L66 40"/><path d="M92 52 L94 40"/></g>
    <circle cx="66" cy="38" r="6" fill="#fff" stroke="#8f6fae" stroke-width="2"/>
    <circle cx="94" cy="38" r="6" fill="#fff" stroke="#8f6fae" stroke-width="2"/>
    <circle cx="66" cy="38" r="2.5" fill="#5a4670"/><circle cx="94" cy="38" r="2.5" fill="#5a4670"/>
    <path d="M72 82 Q80 90 88 82" fill="none" stroke="#8f6fae" stroke-width="3" stroke-linecap="round"/></svg>`;

  let styled = false;
  function addStyle() {
    if (styled) return;
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
    styled = true;
  }

  function show({ content = '', onSave = null, skipAnimation = false } = {}) {
    addStyle();
    return new Promise((resolve) => {
      let state = 'enter'; // enter → hold → taking → ready → open
      const overlay = document.createElement('div');
      overlay.className = 'cm-overlay';
      // 蓋住整個畫面，底下的按鈕都點不到
      overlay.addEventListener('click', (e) => e.stopPropagation());

      const env = document.createElement('div');
      env.className = 'cm-env';
      env.innerHTML = ENV_SVG;

      const wrap = document.createElement('div');
      wrap.className = 'cm-wrap cm-walking cm-in';
      wrap.appendChild(env);
      wrap.insertAdjacentHTML('beforeend', CRAB_SVG);
      overlay.appendChild(wrap);
      document.body.appendChild(overlay);

      function placeEnvFixed(left, top) {
        overlay.appendChild(env);
        env.classList.add('cm-env-fixed', 'cm-pulse');
        env.style.left = left + 'px';
        env.style.top = top + 'px';
      }

      function openLetter() {
        state = 'open';
        env.remove();
        const card = document.createElement('div');
        card.className = 'cm-card';
        const text = document.createElement('div');
        text.className = 'cm-text';
        text.textContent = content; // 用純文字顯示，避免信件內容被當成程式
        const btn = document.createElement('button');
        btn.className = 'cm-save';
        btn.textContent = '保存信件';
        let saving = false;
        btn.addEventListener('click', async () => {
          if (saving) return;
          saving = true;
          btn.disabled = true;
          try { if (onSave) await onSave(); } finally {
            overlay.remove();
            resolve();
          }
        });
        card.append(text, btn);
        overlay.appendChild(card);
      }

      env.addEventListener('click', () => {
        if (state === 'hold') {
          state = 'taking';
          const r = env.getBoundingClientRect();
          placeEnvFixed(r.left, r.top);
          wrap.className = 'cm-wrap cm-walking cm-out';
        } else if (state === 'ready') {
          openLetter();
        }
      });

      wrap.addEventListener('animationend', (e) => {
        if (e.target !== wrap) return;
        if (state === 'enter') {
          state = 'hold';
          wrap.classList.remove('cm-walking');
          env.classList.add('cm-pulse');
        } else if (state === 'taking') {
          wrap.remove();
          state = 'ready';
        }
      });

      if (skipAnimation) {
        wrap.remove();
        placeEnvFixed(window.innerWidth / 2 - 48, window.innerHeight * 0.38);
        state = 'ready';
      }
    });
  }

  return { show };
})();

/* 寫信音效：信箱的寫信 / 回信輸入框打字時沙沙聲（設置-信箱設置-效果 可開關、調音量） */
function penSync(){PenSound.setEnabled(!!(S&&S.set&&S.set.penSnd));PenSound.setVolume(S&&S.set&&S.set.penVol!=null?(+S.set.penVol||0)/100:.5)}
document.addEventListener('input',e=>{const t=e.target;if(t&&t.matches&&t.matches('input[data-pvol]')){const v=Math.max(0,Math.min(100,+t.value||0));S.set.penVol=v;const l=document.getElementById('pvl');if(l)l.textContent=v+'%';penSync();saveSoon()}},true);
document.addEventListener('change',e=>{const t=e.target;if(t&&t.matches&&t.matches('input[data-pvol]')){penSync();PenSound.preview()}},true);
['pointerdown','focusin'].forEach(ev=>document.addEventListener(ev,e=>{if(e.target.matches&&e.target.matches('#lt,#lrt')){penSync();PenSound.unlock(e.target)}},true));
document.addEventListener('input',e=>{if(e.target.matches&&e.target.matches('#lt,#lrt')&&1){penSync();PenSound.play(e.target)}},true);document.addEventListener('focusout',e=>{if(e.target.matches&&e.target.matches('#lt,#lrt'))PenSound.stop()},true);
/* 重要聯繫人來信：點信箱時，依序播放尚未看過的重要聯絡人來信 */
async function crabMailRun(){if(!S.set.crabMail||window.__crabBusy)return;const imp=c=>S.contacts.some(x=>x.id===c&&x.star),list=(S.letters||[]).filter(x=>x.from==='ta'&&!x.seen&&imp(x.cid)).sort((a,b)=>a.t-b.t);if(!list.length)return;
  window.__crabBusy=1;try{for(let i=0;i<list.length;i++){const L=list[i];await CrabMail.show({content:(cname(L.cid)+' 寄來的信\n\n')+L.text,skipAnimation:i>0,onSave:()=>{L.seen=1;save()}})}}finally{window.__crabBusy=0}
  updateMailBadge();if(mailOpen&&tab==='home'){const v=$('#v'),y=v.scrollTop;render();v.scrollTop=y}}
function vMail(){const c=cur(),all=[...(S.letters||[])].sort((x,y)=>y.t-x.t);
  const head='<div class="stickh"><div class="ph2"><button class="ib" data-a="mback">‹</button><h1>信箱</h1><span class="grow"></span><button class="btn" data-a="medit" style="width:auto;padding:6px 14px">'+(mailEdit?'完成':'編輯')+'</button></div><div class="seg mail-seg">'+[['w','寫信與回信'],['r','收到的信'],['i','重要信件']].map(([k,n])=>'<button class="'+(mailTab===k?'on':'')+'" data-a="mtab" data-i="'+k+'">'+n+'</button>').join('')+'</div></div>';
  const bar=mailEdit?'<div class="selbar">'+selAllHtml('mail',mailIds(),mailSel)+'<button class="btn d" data-a="mdelsel" style="border-style:solid">刪除所選（'+mailSel.length+'）</button></div>':'';
  const wrap=(x,inner)=>mailEdit?'<div class="lt pick'+(mailSel.includes(x.id)?' sel':'')+'" data-a="msel" data-i="'+x.id+'"><span class="ck '+(mailSel.includes(x.id)?'on':'')+'"></span>'+inner+'</div>':'<div class="lt">'+inner+'</div>';
  let dirty=0;
  if(mailTab==='w'){const l=all.filter(x=>x.from==='me'&&x.cid===S.cur);l.forEach(x=>{if(x.reply&&!x.rseen){x.rseen=1;dirty=1}});if(dirty)save();
    return head+bar+(mailEdit?'':'<button class="btn s" style="width:100%;margin-bottom:12px" data-a="lnew">＋ 寫信給 '+esc(c.name)+'</button>')+(l.length?l.map(x=>wrap(x,(mailEdit?'':'<button class="ltd" data-a="ldel" data-i="'+x.id+'" aria-label="刪除信件">'+TRASH+'</button>')+'<div class="ltt">'+ltime(x.t)+'</div><div class="ltx">'+esc(x.text)+'</div>'+(x.reply&&!mailEdit?'<div class="ltb"><button class="btn" data-a="lrep" data-i="'+x.id+'">'+esc(cname(x.cid))+'的回信 '+(mailRep[x.id]?'▴':'▾')+'</button></div>'+(mailRep[x.id]?'<div class="rp"><div class="ltt">'+esc(cname(x.cid))+'的回信 · '+ltime(x.reply.t)+'</div><div class="ltx">'+flow(x.reply.text)+limgs(x.reply)+'</div></div>':''):''))).join(''):'<div class="empty">還沒有寫過信。<br>點上方按鈕寫第一封。</div>')}
  const recv=x=>{const rs=x.replies||[];return wrap(x,(mailEdit?'':'<button class="ltd lst'+(x.star?' on':'')+'" data-a="lstar" data-i="'+x.id+'" aria-label="加入重要信件">'+(x.star?'★':'☆')+'</button>')+'<div class="ltt">'+esc(cname(x.cid))+' · '+ltime(x.t)+'</div><div class="ltx">'+flow(x.text)+limgs(x)+'</div>'+rs.map(r=>mailRepEdit===x.id&&!mailEdit?'<div class="rp"><div class="ltt">編輯回信（只能在回信當天修改）</div><textarea id="lrt" rows="3" data-md="'+x.id+'" placeholder="寫回信…">'+esc(mailDraft[x.id]!=null?mailDraft[x.id]:r.text)+'</textarea><div class="ltb"><button class="btn" data-a="lrecancel">取消</button><button class="btn s" data-a="lresave">儲存</button></div></div>':'<div class="rp"><div class="ltt">我的回信 · '+ltime(r.t)+(r.edited?'（已編輯）':'')+'</div><div class="ltx">'+esc(r.text)+'</div>'+(!mailEdit&&replySameDay(r)?'<div class="ltb"><button class="btn" data-a="lre" data-i="'+x.id+'">編輯回信</button></div>':'')+'</div>').join('')+(mailEdit||rs.length?'':(mailReplyId===x.id?'<div class="rp"><textarea id="lrt" rows="3" data-md="'+x.id+'" placeholder="寫回信…">'+esc(mailDraft[x.id]||'')+'</textarea><div class="ltb"><button class="btn" data-a="lrcancel">取消</button><button class="btn s" data-a="lrsend">發送</button></div></div>':'<div class="ltb"><button class="btn" data-a="lrop" data-i="'+x.id+'">回信</button></div>')))};
  const got=all.filter(x=>x.from==='ta');
  if(mailTab==='r'){got.forEach(x=>{if(!x.seen){x.seen=1;dirty=1}});if(dirty)save();
    return head+bar+(got.length?got.map(recv).join(''):'<div class="empty">還沒有收到信。</div>')}
  got.forEach(x=>{if(x.star)mailKeep[x.id]=1;if(x.star&&!x.seen){x.seen=1;dirty=1}});if(dirty)save();
  const imp=got.filter(x=>x.star||mailKeep[x.id]);
  return head+bar+(imp.length?imp.map(recv).join(''):'<div class="empty">還沒有重要信件。<br>在「收到的信」點信件右上角的 ☆ 就會出現在這裡。</div>')}
const lrand=(a,b)=>{const lo=Math.max(1,+a||1)*1000,hi=Math.max(lo,(+b||0)*1000);return lo+rnd()*(hi-lo)};
function letterNote(cid,x){try{const c=S.contacts.find(z=>z.id===cid);if(!c)return;if(S.set.letterNotify){ms(cid).push({id:uid(),f:'sys',x,t:Date.now(),go:'mail'});banner(x,6000,'mail');if(tab==='chat'&&S.cur===cid)paint()}}catch(e){}}
function letterTick(){if(!S||!S.set)return;const s=S.set,now=Date.now();S.letters=S.letters||[];S.lnext=S.lnext||{};S.lpend=S.lpend||[];let ch=0,shown=0,arrived=0;
  /* 信件的抽取流程要花時間，抽完才送達 */
  {const due=S.lpend.filter(p=>p.due<=now);if(due.length){S.lpend=S.lpend.filter(p=>p.due>now);ch=1;const gc={};due.forEach(p=>{if(!S.contacts.some(c=>c.id===p.cid))return;if(p.k==='n'){S.letters.push(Object.assign({},p.L,{nt:1}));gc[p.cid]=(gc[p.cid]||0)+1}else{const L=S.letters.find(x=>x.id===p.lid);if(L){L.reply={t:now,text:p.text,imgs:p.imgs};L.rnt=1;letterNote(L.cid,cname(L.cid)+' 回信了')}}arrived=1;if(mailOpen)shown=1});Object.keys(gc).forEach(cid=>{const c=S.contacts.find(z=>z.id===cid);if(c)letterNote(cid,gc[cid]>1?c.name+' 寄來 '+gc[cid]+' 封信':c.name+' 寄來一封信')})}}
  S.letters.forEach(L=>{if(L.from==='me'&&L.rdue&&L.rdue<=now){L.rdue=0;ch=1;if(!S.contacts.some(c=>c.id===L.cid))return;const g=genLetter(L.cid);if(g)S.lpend.push({k:'r',cid:L.cid,lid:L.id,text:g.text,imgs:g.imgs,due:now+g.ms})}});
  /* 關閉程式期間錯過的寄信時間點，開啟後依序補算（每個時間點各判定一次，仍受每日上限限制） */
  S.lround=S.lround||{};const lmx=Math.max(+s.lwmin||0,+s.lwmax||0,1)*1000;S.contacts.forEach(c=>{let tt=S.lnext[c.id];if(!tt){S.lround[c.id]=now;S.lnext[c.id]=now+lrand(s.lwmin,s.lwmax);ch=1;return}if(tt>now)return;ch=1;let g=0,got=0,rs=S.lround[c.id]||(tt-Math.max(0,+s.lwmin||0)*1000);
    while(tt<=now&&g++<500){if(rnd()*100<Math.max(0,Math.min(100,+s.lwrite||0))){const day=localDayKey(new Date(tt)),cnt=S.letters.filter(l=>l.cid===c.id&&l.from==='ta'&&localDayKey(new Date(l.t))===day).length+S.lpend.filter(p=>p.k==='n'&&p.cid===c.id&&localDayKey(new Date(p.L.t))===day).length;
        if(cnt<Math.max(0,Math.round(+s.lday||0))){const gl=genLetter(c.id);if(gl){S.lpend.push({k:'n',cid:c.id,L:{id:uid(),cid:c.id,from:'ta',t:tt,text:gl.text,imgs:gl.imgs},due:now+gl.ms});got++}}}
      /* 最長時間結束後才開始下一輪，這一輪內只會有一次主動寫信流程 */rs+=lmx;tt=rs+lrand(s.lwmin,s.lwmax)}
    S.lround[c.id]=rs;S.lnext[c.id]=tt});
  if(ch)save();if(arrived)updateMailBadge();if(shown&&tab==='home'&&!$('#sh').classList.contains('show'))render()}
setInterval(letterTick,5000);
/* 開啟程式時，把還沒通知過的未讀信件、朋友圈貼文補發到對應聯絡人的聊天室 */
let _cuDone=0;
function catchUpNotices(){if(_cuDone||!S||!S.set||!S.contacts)return;_cuDone=1;let ch=0;const push=(cid,x,go)=>{ms(cid).push({id:uid(),f:'sys',x,t:Date.now(),go});ch=1};
  if(S.set.letterNotify){S.contacts.forEach(c=>{const got=(S.letters||[]).filter(L=>L.cid===c.id&&L.from==='ta'&&!L.seen&&!L.nt);if(got.length){got.forEach(L=>{L.nt=1});push(c.id,got.length>1?c.name+' 寄來 '+got.length+' 封信':c.name+' 寄來一封信','mail')}
    const rp=(S.letters||[]).filter(L=>L.cid===c.id&&L.from==='me'&&L.reply&&!L.rseen&&!L.rnt);if(rp.length){rp.forEach(L=>{L.rnt=1});push(c.id,c.name+' 回信了','mail')}})}
  if(S.set.momNotify!==0){S.contacts.forEach(c=>{const ps=(S.moments||[]).filter(p=>p.cid===c.id&&!p.seen&&!p.nt);if(ps.length){ps.forEach(p=>{p.nt=1});push(c.id,ps.length>1?c.name+' 發布了 '+ps.length+' 則朋友圈':c.name+' 發布了朋友圈','mom')}})}
  if(ch){save();if(tab==='chat')paint()}updateMailBadge();updateMomBadge()}
setInterval(catchUpNotices,800);