/* ============================================================
   塗鴉（獨立模組・尚未接入 Pearla）
   用法與「紀念日 anniversary.js」相同：window.DD 提供 open / view，
   點擊用 data-a="dd" 與 data-a="dd:xxx"。接入步驟見 INTEGRATION.md
   資料存在 S.doodle：{set, colors, history, run}
   ============================================================ */
(function () {
    'use strict';
    const DD = window.DD = { open: false, tab: 'canvas', cid: '', exp: {}, edit: false, sel: {}, modal: null, confirm: null, view: vDD, fast: 0, tick: tick, root: root, rec: recOf, userCm: userCm, go: goDD, post: cmPost };
    const _r = () => typeof rnd === 'function' ? rnd() : Math.random();
    const rint = (a, b) => a + Math.floor(_r() * (b - a + 1));
    const rfl = (a, b) => a + _r() * (b - a);
    const pad = n => String(n).padStart(2, '0');
    const sc = () => DD.fast || 1; // 測試用時間倍率（正式為 1）
    const contacts = () => Array.isArray(S.contacts) ? S.contacts : [];
    const cname = id => { const c = contacts().find(x => x.id === id); return c ? c.name : ''; };
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    /* ---------- 預設值 ---------- */
    const SHAPES = [['co', '圓形（空心）'], ['cs', '圓形（實心）'], ['tri', '三角形'], ['sq', '正方形'], ['rh', '長方形（橫）'], ['rv', '長方形（豎）']];
    const COLORS0 = [['red', '紅', '#e57373'], ['orange', '橙', '#f2a65a'], ['yellow', '黃', '#f3d35f'], ['green', '綠', '#7fc99b'], ['blue', '藍', '#6ea8e4'], ['indigo', '靛', '#5c63b5'], ['purple', '紫', '#a883d6'], ['gray', '灰', '#9b9aa8']];
    const defSet = () => ({ on: 1, tmin: 300, tmax: 28800, cancel: 50, nmin: 1, nmax: 5, smin: 3, smax: 180,
        w: { co: 10, cs: 10, tri: 10, sq: 10, rh: 10, rv: 10 }, pmin: 10, pmax: 50, overlap: 1,
        cm: 0, cmProb: 50, cmTmin: 3, cmTmax: 180, cmNmin: 1, cmNmax: 2, cmFmin: 1, cmFmax: 2, cmEp: 20, cmEmj: 20, cmEmjT: 10, cmKao: 20, cmKaoT: 10 });
    const defColors = () => COLORS0.map(([id, n, c]) => ({ id, n, c, on: 1, w: 10, custom: 0 }));
    const CANVAS = { h: [500, 300], v: [300, 500], s: [400, 400] }; // 橫 5:3、豎 3:5、正方形
    const PLACE_GAP = 600, STEP_GAP = 500, HISTORY_MAX = 500;
    function fill(o, d) { Object.keys(d).forEach(k => { if (o[k] == null)
        o[k] = d[k]; }); }
    function root() {
        if (!S.doodle || typeof S.doodle !== 'object')
            S.doodle = {};
        const d = S.doodle;
        if (!d.set || typeof d.set !== 'object')
            d.set = {};
        fill(d.set, defSet());
        if (!d.set.w || typeof d.set.w !== 'object')
            d.set.w = {};
        fill(d.set.w, defSet().w);
        if (!Array.isArray(d.colors))
            d.colors = defColors();
        defColors().forEach((c, i) => { if (!d.colors.some(x => x.id === c.id))
            d.colors.splice(i, 0, c); });
        if (!Array.isArray(d.history))
            d.history = [];
        if (!d.run || typeof d.run !== 'object')
            d.run = {};
        if (!Array.isArray(d.cq))
            d.cq = [];
        return d;
    }
    /* ---------- 抽選工具 ---------- */
    function wpick(items) {
        const L = items.filter(x => x.w > 0);
        if (!L.length)
            return null;
        let t = L.reduce((a, x) => a + x.w, 0) * _r();
        for (const x of L) {
            t -= x.w;
            if (t < 0)
                return x.v;
        }
        return L[L.length - 1].v;
    }
    function dims(type, s) {
        switch (type) {
            case 'tri': return [s, s * 0.866];
            case 'rh': return [s, s * 0.6]; // 橫長方 5:3
            case 'rv': return [s * 0.6, s]; // 豎長方 3:5
            default: return [s, s];
        }
    }
    const hit = (x, y, w, h, o) => { const [ow, oh] = dims(o.type, o.s); return x < o.x + ow && x + w > o.x && y < o.y + oh && y + h > o.y; };
    /* 位置＋大小：圖形一定完整在畫布內；不重疊時最多重試 60 個位置，仍放不下就逐步縮小，最後還放不下就略過這個圖形 */
    function placeShape(type, w, h, existing) {
        const st = root().set, short = Math.min(w, h);
        const lo = Math.min(st.pmin, st.pmax) / 100 * short, hi = Math.max(st.pmin, st.pmax) / 100 * short;
        let s = rfl(lo, hi);
        for (let k = 0; k < 14; k++) {
            const [bw, bh] = dims(type, s);
            for (let t = 0; t < 60; t++) {
                const x = rfl(0, w - bw), y = rfl(0, h - bh);
                if (st.overlap || !existing.some(o => hit(x, y, bw, bh, o)))
                    return { x: +x.toFixed(1), y: +y.toFixed(1), s: +s.toFixed(1) };
            }
            if (s <= lo)
                break;
            s = Math.max(lo, s * 0.85);
        }
        return null;
    }
    /* ---------- 流程引擎 ----------
       每位聯絡人各跑各的：S.doodle.run[聯絡人id] = {st, due, ...}
       st：wait(等判定) → canvas → count → shape → color → pos →（下一個 shape…）→ place → placing → rest
       due 是絕對時間，所以關掉頁面再回來，到期的流程會依序補跑 */
    function startCycle(R, now) {
        const st = root().set;
        const lo = Math.min(st.tmin, st.tmax), hi = Math.max(st.tmin, st.tmax);
        Object.keys(R).forEach(k => delete R[k]);
        R.st = 'wait';
        R.t0 = now;
        R.max = Math.max(st.tmin, st.tmax);
        R.due = now + rint(lo, hi) * 1000 * sc();
        R.shapes = [];
        R.k = 0;
    }
    /* 中止／結束：保留 R.due（這一步原本該發生的時間），下一輪從那個時間起算；
       這樣關掉程式再打開，補跑的塗鴉和後面的計時都不會被「重新打開的那一刻」影響 */
    function abort(R) { R.st = 'rest'; R.shapes = []; }
    function step(cid, R, now) {
        const d = root(), st = d.set;
        let changed = true;
        switch (R.st) {
            case 'wait': { // 時間到：決定要不要畫
                const dnd = typeof isDnd === 'function' && isDnd(cid);
                if (dnd || _r() * 100 < st.cancel) {
                    R.st = 'rest';
                    R.due = R.t0 + R.max * 1000 * sc(); // 取消：要等到最長時間過了才有下一次判定
                    R.shapes = [];
                }
                else {
                    R.st = 'canvas';
                    R.due += STEP_GAP * sc();
                }
                break;
            }
            case 'canvas': { // 畫布：橫／豎／正方形隨機
                R.cv = ['h', 'v', 's'][rint(0, 2)];
                R.st = 'count';
                R.due += STEP_GAP * sc();
                break;
            }
            case 'count': { // 放幾個
                const lo = Math.min(st.nmin, st.nmax), hi = Math.max(st.nmin, st.nmax);
                R.n = rint(lo, hi);
                R.k = 0;
                R.st = 'shape';
                R.due += rint(Math.min(st.smin, st.smax), Math.max(st.smin, st.smax)) * 1000 * sc(); // 第一個圖形的選擇時間
                break;
            }
            case 'shape': { // 形狀（可重複、沒有保底）
                const t = wpick(SHAPES.map(([k]) => ({ v: k, w: +st.w[k] || 0 })));
                if (!t) {
                    abort(R);
                    break;
                }
                R.cur = { type: t };
                R.st = 'color';
                R.due += STEP_GAP * sc();
                break;
            }
            case 'color': { // 顏色
                const c = wpick(d.colors.filter(x => x.on).map(x => ({ v: x.c, w: +x.w || 0 })));
                if (!c) {
                    abort(R);
                    break;
                }
                R.cur.color = c;
                R.st = 'pos';
                R.due += STEP_GAP * sc();
                break;
            }
            case 'pos': { // 大小與位置
                const [w, h] = CANVAS[R.cv], p = placeShape(R.cur.type, w, h, R.shapes);
                if (p)
                    R.shapes.push({ type: R.cur.type, color: R.cur.color, x: p.x, y: p.y, s: p.s });
                R.cur = null;
                R.k++;
                if (R.k < R.n) {
                    R.st = 'shape';
                    R.due += rint(Math.min(st.smin, st.smax), Math.max(st.smin, st.smax)) * 1000 * sc();
                } // 下一個圖形的選擇時間
                else {
                    R.st = 'place';
                    R.due += STEP_GAP * sc();
                }
                break;
            }
            case 'place': { // 全部選完：建立畫布，準備依序放上去
                if (!R.shapes.length) {
                    abort(R);
                    break;
                }
                const [w, h] = CANVAS[R.cv], rec = { id: uid(), cid, t: R.due, cv: R.cv, w, h, shapes: [] };
                d.history.unshift(rec);
                while (d.history.length > HISTORY_MAX) {
                    let k = d.history.length - 1;
                    while (k > 0 && d.history[k].fav)
                        k--;
                    if (d.history[k].fav)
                        break;
                    d.history.splice(k, 1);
                }
                R.rid = rec.id;
                R.pi = 0;
                R.st = 'placing';
                break;
            }
            case 'placing': {
                const rec = d.history.find(x => x.id === R.rid);
                if (rec && R.shapes[R.pi])
                    rec.shapes.push(R.shapes[R.pi]);
                R.pi++;
                if (R.pi >= R.shapes.length) {
                    if (rec)
                        cmPost(rec, R.due);
                    abort(R);
                    {
                        const _iv = st.iv == null || st.iv === '' ? Math.min(st.tmin, st.tmax) : Math.max(0, +st.iv || 0);
                        R.due = Math.max(R.due, (R.t0 || R.due) + Math.max(1, _iv) * 1000 * sc());
                    }
                } // 畫完：通知其他聯絡人可以留言，並馬上開始下一輪計時
                else
                    R.due += PLACE_GAP * sc();
                break;
            }
            case 'rest':
                startCycle(R, R.due || now);
                break;
            default: startCycle(R, now);
        }
        return changed;
    }
    function tick() {
        try {
            if (typeof S === 'undefined' || !S || !Array.isArray(S.contacts))
                return;
            const d = root(), now = Date.now();
            let ch = false;
            if (!d.set.on) {
                if (Object.keys(d.run).length) {
                    d.run = {};
                    ch = true;
                }
            }
            else {
                contacts().forEach(c => {
                    let R = d.run[c.id];
                    if (!R) {
                        R = d.run[c.id] = {};
                        startCycle(R, now);
                        ch = true;
                    }
                    let g = 0;
                    while (R.due <= now && g++ < 400) {
                        step(c.id, R, now);
                        ch = true;
                    }
                });
                Object.keys(d.run).forEach(id => { if (!contacts().some(c => c.id === id)) {
                    delete d.run[id];
                    ch = true;
                } });
            }
            if (cmTick(now))
                ch = true;
            if (ch) {
                save();
                refresh();
            }
        }
        catch (e) {
            console.error('[doodle]', e);
        }
    }
    function startTimer() {
        if (DD._t)
            return;
        DD._t = setInterval(tick, 500);
        document.addEventListener('visibilitychange', () => { if (!document.hidden)
            tick(); });
        addEventListener('pageshow', tick);
    }
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', startTimer);
    else
        startTimer();
    /* ---------- 留言（跟朋友圈留言同一套：版面、字卡／emoji／顏文字／表情包的選法都沿用 09-moments.js） ----------
       留言存在畫布本身：rec.cmts（和朋友圈貼文的 cmts 一樣），排程存在 S.doodle.cq。
       任務：{k:'p'|'r'|'u', cid(留言的聯絡人), rid(畫布id), mid(被回覆的留言id), to(被回覆者名字), ph:j(判定)→w(等待)→s(送出), due}
       k：p＝其他聯絡人主動留言　r＝其他聯絡人回覆留言　u＝你留言／回覆後，被回覆的聯絡人回覆你
       due 與每條留言的 at 都是絕對時間，所以關掉程式再打開，到期的會依「原本該發生的時間」補跑 */
    function recOf(id) { return root().history.find(x => x.id === id) || null; }
    const cmCfg = () => { const s = root().set; return { prob: clamp(+s.cmProb || 0, 0, 100), tmin: s.cmTmin, tmax: s.cmTmax, nmin: s.cmNmin, nmax: s.cmNmax, fmin: s.cmFmin, fmax: s.cmFmax, ep: +s.cmEp || 0, emj: +s.cmEmj || 0, emjT: s.cmEmjT, kao: +s.cmKao || 0, kaoT: s.cmKaoT }; };
    const hit100 = p => _r() * 100 < clamp(+p || 0, 0, 100);
    // 一張畫畫完：其他聯絡人各自判定要不要留言
    function cmPost(rec, at) {
        const d = root();
        if (!d.set.cm || !rec)
            return;
        contacts().forEach(c => { if (c.id !== rec.cid)
            d.cq.push({ id: uid(), k: 'p', cid: c.id, rid: rec.id, ph: 'j', due: at + 1000 }); });
    }
    // 有聯絡人留言／回覆後，其他聯絡人各自判定要不要回覆
    function cmReply(rec, m, at) {
        const d = root();
        if (!d.set.cm || !rec || !m || !m.cid)
            return;
        contacts().forEach(c => { if (c.id !== m.cid)
            d.cq.push({ id: uid(), k: 'r', cid: c.id, rid: rec.id, mid: m.id, to: m.n, ph: 'j', due: at + 1000 }); });
    }
    // 你留言／回覆後：被回覆的聯絡人判定要不要回覆你（你再回覆就再判定一次）
    function userCm(rec, cm, tcid) {
        if (!rec || !cm || !cm.id || !contacts().some(c => c.id === tcid))
            return;
        root().cq.push({ id: uid(), k: 'u', cid: tcid, rid: rec.id, mid: cm.id, to: S.me, ph: 'j', due: Date.now() + 1000 });
    }
    function cmNote(j, c, rec) {
        try {
            if (S.set.momNotify === 0)
                return;
            const x = j.k === 'p' ? c.name + ' 在' + (cname(rec.cid) || '聯絡人') + '的塗鴉留言了' : (j.to === S.me ? c.name + ' 回覆了你的塗鴉留言' : c.name + ' 回覆了' + j.to + '的塗鴉留言');
            ms(j.cid).push({ id: uid(), f: 'sys', x, t: Date.now(), go: 'dd', ref: [rec.id] });
            banner(x, 6000, 'dd');
            if (tab === 'chat' && S.cur === j.cid)
                paint();
        }
        catch (e) { }
    }
    function cmSend(j, o, rec, at) {
        const c = contacts().find(x => x.id === j.cid);
        if (!c)
            return;
        rec.cmts = Array.isArray(rec.cmts) ? rec.cmts : [];
        const m = { id: uid(), cid: j.cid, n: c.name, x: o.x || '', img: o.img || '', t: at || Date.now() };
        if (j.k !== 'p') {
            m.rt = j.to;
            m.rid = j.mid;
        }
        if (j.to === S.me)
            m.us = 1;
        rec.cmts.push(m);
        if (!j.nt) {
            j.nt = 1;
            cmNote(j, c, rec);
        }
        /* 同一串最多 8 則，避免無限對話 */
        const cm = rec.cmts, r = momRootId(cm, m);
        if (j.k === 'p' || cm.filter(x => momRootId(cm, x) === r).length < 8)
            cmReply(rec, m, at || Date.now());
    }
    function cmTick(now) {
        const d = root();
        if (!d.cq.length)
            return false;
        let ch = false;
        const list = d.cq;
        d.cq = [];
        list.forEach(j => {
            try {
                const rec = recOf(j.rid);
                if (!rec || !contacts().some(c => c.id === j.cid)) {
                    ch = true;
                    return;
                }
                if (j.k !== 'u' && !d.set.cm) {
                    ch = true;
                    return;
                }
                for (let g = 0; g < 40; g++) {
                    if (j.due > now) {
                        d.cq.push(j);
                        break;
                    }
                    ch = true;
                    if (typeof isDnd === 'function' && isDnd(j.cid))
                        break; // 免打擾：這一次不留言
                    const cf = cmCfg();
                    if (j.ph === 'j') {
                        if (hit100(cf.prob)) {
                            j.ph = 'w';
                            j.due = j.due + inspRand(cf.tmin, cf.tmax);
                        }
                        else
                            break;
                    }
                    else if (j.ph === 'w') {
                        ctxSet(j.cid);
                        j.q = mcmBuild(j, j.due, cf);
                        if (j.q.length) {
                            j.ph = 's';
                            j.due = j.q[0].at;
                        }
                        else
                            break;
                    }
                    else if (j.ph === 's') {
                        while (j.q.length && j.q[0].at <= now) {
                            const o = j.q.shift();
                            cmSend(j, o, rec, o.at);
                        }
                        if (j.q.length)
                            j.due = j.q[0].at;
                        else
                            break;
                    }
                    else
                        break;
                }
            }
            catch (e) {
                console.error('[doodle cm]', e);
                ch = true;
            }
        });
        return ch;
    }
    function goDD() { DD.open = true; DD.tab = 'canvas'; DD.pcid = ''; DD.fcid = ''; DD.dexp = {}; DD.edit = false; DD.sel = {}; DD.exp = {}; DD.modal = null; DD.confirm = null; DD.cid = S.cur || DD.cid; render(); top0(); }
    /* ---------- 畫布繪製 ---------- */
    const f1 = n => (+n).toFixed(1);
    function shapeSvg(sh, pop) {
        const cl = pop ? ' class="dd-pop"' : '', c = esc(sh.color), s = sh.s, x = sh.x, y = sh.y;
        switch (sh.type) {
            case 'co': {
                const w = Math.max(2, s * 0.1);
                return '<circle' + cl + ' cx="' + f1(x + s / 2) + '" cy="' + f1(y + s / 2) + '" r="' + f1((s - w) / 2) + '" fill="none" stroke="' + c + '" stroke-width="' + f1(w) + '"/>';
            }
            case 'cs': return '<circle' + cl + ' cx="' + f1(x + s / 2) + '" cy="' + f1(y + s / 2) + '" r="' + f1(s / 2) + '" fill="' + c + '"/>';
            case 'tri': {
                const h = s * 0.866;
                return '<polygon' + cl + ' points="' + f1(x + s / 2) + ',' + f1(y) + ' ' + f1(x) + ',' + f1(y + h) + ' ' + f1(x + s) + ',' + f1(y + h) + '" fill="' + c + '"/>';
            }
            default: {
                const [w, h] = dims(sh.type, s);
                return '<rect' + cl + ' x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" fill="' + c + '"/>';
            }
        }
    }
    function svgOf(rec, id) {
        return '<svg class="dd-svg" ' + (id ? 'data-live="1" data-id="' + esc(rec.id) + '" data-n="' + rec.shapes.length + '" ' : '') + 'viewBox="0 0 ' + rec.w + ' ' + rec.h + '" style="aspect-ratio:' + rec.w + '/' + rec.h + '" xmlns="http://www.w3.org/2000/svg">'
            + '<rect width="' + rec.w + '" height="' + rec.h + '" fill="#fffefb"/>' + rec.shapes.map(s => shapeSvg(s)).join('') + '</svg>';
    }
    const when = t => { const d = new Date(t); return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
    function statusText() {
        const R = root().run[DD.cid];
        if (!R)
            return '';
        const n = cname(DD.cid) || '對方';
        if (['canvas', 'count', 'shape', 'color', 'pos'].includes(R.st))
            return n + '正在構思…';
        if (R.st === 'place' || R.st === 'placing')
            return n + '正在畫…';
        return '';
    }
    /* 一天裡畫的畫布放在一起：今天的在「畫布」，過了今天才進「過往畫布」 */
    const dayOf = t => localDayKey(new Date(t));
    const isToday = r => dayOf(r.t) === localDayKey(new Date());
    const todayList = cid => root().history.filter(h => h.cid === cid && isToday(h)).sort((a, b) => b.t - a.t);
    const hm = t => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
    const dayLabel = k => { const a = k.split('-').map(Number), d = new Date(a[0], a[1] - 1, a[2], 12); return a[0] + '年' + a[1] + '月' + a[2] + '日 週' + '日一二三四五六'[d.getDay()]; };
    const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z"/></svg>';
    const starBtn = rec => '<button type="button" class="dd-fav' + (rec.fav ? ' on' : '') + '" data-a="dd:fav" data-i="' + esc(rec.id) + '" aria-label="' + (rec.fav ? '取消收藏' : '收藏') + '">' + STAR + '</button>';
    /* 引擎有動靜時：只微調畫面，不整頁重畫（正在輸入留言時完全不動，免得打到一半被洗掉） */
    const cmSig = r => r && Array.isArray(r.cmts) ? r.cmts.length + ':' + (r.cmts.length ? r.cmts[r.cmts.length - 1].id : '') : '';
    function typing() { const a = document.activeElement, sh = document.querySelector('#sh'); return !!((a && a.classList && a.classList.contains('mom-cin')) || (sh && sh.classList.contains('show'))); }
    function refresh() {
        if (!DD.open || DD.modal || DD.confirm)
            return;
        /* 跨過午夜：今天的畫布變成過往畫布 */
        if (DD._day && DD._day !== localDayKey(new Date()) && !typing()) {
            R(true);
            return;
        }
        if (DD.tab === 'canvas') {
            const stat = document.querySelector('#ddstat');
            if (stat)
                stat.textContent = statusText();
            const recs = todayList(DD.cid);
            const dom = [...document.querySelectorAll('svg[data-live]')].map(e => e.dataset.id).join(',');
            if (dom !== recs.map(r => r.id).join(',')) {
                R(true);
                return;
            }
            recs.forEach(rec => {
                const el = document.querySelector('svg[data-live][data-id="' + rec.id + '"]');
                if (!el)
                    return;
                const n = +el.dataset.n;
                if (rec.shapes.length > n) {
                    for (let i = n; i < rec.shapes.length; i++)
                        el.insertAdjacentHTML('beforeend', shapeSvg(rec.shapes[i], true));
                    el.dataset.n = rec.shapes.length;
                }
            });
            if (recs.map(cmSig).join('|') !== DD._cs && !typing()) {
                momCSync();
                R(true);
            }
        }
        else if (DD.tab === 'past' || DD.tab === 'fav') {
            const sig = shownList().map(cmSig).join('|');
            if (sig !== DD._cs && !typing()) {
                momCSync();
                R(true);
            }
        }
    }
    /* ---------- 畫面 ---------- */
    function R(keep) { const v = document.querySelector('#v'), y = v ? v.scrollTop : 0; render(); if (keep && v)
        v.scrollTop = y; }
    const top0 = () => { const v = document.querySelector('#v'); if (v)
        v.scrollTop = 0; };
    const TABS = [['canvas', '畫布'], ['past', '過往畫布'], ['fav', '收藏'], ['set', '設置'], ['help', '說明']];
    /* 小紅點：別的分頁有你還沒看過的新回覆時，分頁上顯示（看到那張畫布就算已讀） */
    const hasUs = r => Array.isArray(r.cmts) && r.cmts.some(m => m.us);
    function unseenDots() {
        const H = root().history;
        return { canvas: DD.tab !== 'canvas' && H.some(r => isToday(r) && hasUs(r)), past: DD.tab !== 'past' && H.some(r => !isToday(r) && hasUs(r)) };
    }
    function markSeen(rec) { if (rec && hasUs(rec)) {
        rec.cmts.forEach(m => { m.us = 0; });
        try {
            saveSoon();
        }
        catch (e) { }
    } }
    function vDD() {
        const d = root();
        if (!DD.cid || !contacts().some(c => c.id === DD.cid))
            DD.cid = (S.cur && contacts().some(c => c.id === S.cur)) ? S.cur : (contacts()[0] || {}).id || '';
        const dots = unseenDots();
        DD._cs = '';
        DD._day = localDayKey(new Date());
        DD.dexp = DD.dexp || {};
        let h = '<div class="dd-bar0"><span>塗鴉</span></div><div class="ph2 dd-ph"><button class="ib" data-a="dd:back">‹</button></div>'
            + '<div class="dd-top"><div class="stabs dd-tabs">' + TABS.map(([k, n]) => '<button type="button" class="stab dd-tab' + (DD.tab === k ? ' on' : '') + '" data-a="dd:tab" data-i="' + k + '">' + n + (dots[k] ? '<i class="mom-dot" aria-label="有新內容"></i>' : '') + '</button>').join('') + '</div></div>';
        if (DD.tab === 'canvas' || DD.tab === 'past' || DD.tab === 'fav')
            h += chips();
        h += DD.tab === 'canvas' ? vCanvas() : DD.tab === 'past' ? vPast() : DD.tab === 'fav' ? vFav() : DD.tab === 'set' ? vSet() : vHelp();
        return h + modalHtml() + confirmHtml();
    }
    /* 聯絡人分類：跟設置頁上方的分類（stabs）同一套樣式 */
    function chips() {
        const L = contacts();
        if (L.length < 2 && DD.tab === 'canvas')
            return '';
        const all = DD.tab === 'past' || DD.tab === 'fav';
        const items = (all ? [['', '全部']] : []).concat(L.map(c => [c.id, c.name]));
        const cur = DD.tab === 'past' ? (DD.pcid || '') : DD.tab === 'fav' ? (DD.fcid || '') : DD.cid;
        return '<div class="stabs dd-cs">' + items.map(([id, n]) => '<button type="button" class="stab' + (cur === id ? ' on' : '') + '" data-a="dd:cat" data-i="' + esc(id) + '">' + esc(n) + '</button>').join('') + '</div>';
    }
    const cmHtml = rec => '<div class="dd-cm">' + momCols(rec) + momCBox(rec) + '</div>';
    function vCanvas() {
        const L = todayList(DD.cid);
        if (!L.length)
            return '<div class="empty" id="ddempty">今天還沒有畫布。<br>聯絡人隨機決定要畫畫後，今天畫的畫布都會放在這裡；過了今天會收進「過往畫布」。</div><div class="dd-stat" id="ddstat">' + esc(statusText()) + '</div>';
        L.forEach(markSeen);
        DD._cs = L.map(cmSig).join('|');
        return L.map(rec => '<div class="card dd-cv"><div class="dd-cvh"><div><span>' + esc(cname(rec.cid)) + '</span> <small>創作時間 ' + hm(rec.t) + '</small></div>' + starBtn(rec) + '</div>' + svgOf(rec, true) + cmHtml(rec) + '</div>').join('') + '<div class="dd-stat" id="ddstat">' + esc(statusText()) + '</div>';
    }
    function pastList() {
        const cid = DD.pcid || '';
        return root().history.filter(h => !isToday(h) && (!cid || h.cid === cid)).sort((a, b) => b.t - a.t);
    }
    function favList() {
        const cid = DD.fcid || '';
        return root().history.filter(h => h.fav && (!cid || h.cid === cid)).sort((a, b) => b.t - a.t);
    }
    /* 目前畫面上展開、需要隨留言更新的畫布 */
    function shownList() {
        if (DD.edit)
            return [];
        if (DD.tab === 'fav')
            return favList().filter(r => DD.exp[r.id]);
        return pastList().filter(r => DD.dexp[dayOf(r.t)] && DD.exp[r.id]);
    }
    function itemHtml(rec, inDay) {
        const open = !DD.edit && DD.exp[rec.id];
        if (open)
            markSeen(rec);
        const nc = Array.isArray(rec.cmts) ? rec.cmts.length : 0;
        return '<div class="dd-item' + (open ? ' open' : '') + '"><div class="dd-ih" data-a="dd:tog" data-i="' + esc(rec.id) + '">'
            + (DD.edit ? '<span class="dd-ck' + (DD.sel[rec.id] ? ' on' : '') + '"></span>' : '')
            + '<div class="dd-it"><b>' + (inDay ? '創作時間 ' + hm(rec.t) : when(rec.t)) + '</b><small>' + esc(cname(rec.cid) || '（已刪除的聯絡人）') + ' · ' + rec.shapes.length + ' 個圖形' + (nc ? ' · ' + nc + ' 則留言' : '') + '</small></div>'
            + (DD.edit ? '' : starBtn(rec) + '<span class="dd-chev">›</span>') + '</div>'
            + (open ? '<div class="dd-body">' + svgOf(rec) + cmHtml(rec) + '</div>' : '') + '</div>';
    }
    function vPast() {
        const L = pastList();
        if (DD.edit)
            Object.keys(DD.sel).forEach(id => { if (!L.some(x => x.id === id))
                delete DD.sel[id]; });
        const n = Object.keys(DD.sel).length, all = L.length && n === L.length;
        let h = '';
        if (L.length) {
            h += '<div class="dd-bar">' + (DD.edit
                ? '<button type="button" class="dd-ck selall' + (all ? ' on' : '') + '" data-a="dd:all" aria-label="全選"></button><span class="dd-n0">已選 ' + n + '</span><span class="grow"></span><button type="button" class="btn d" data-a="dd:del"' + (n ? '' : ' disabled') + '>刪除</button><button type="button" class="btn" data-a="dd:done">完成</button>'
                : '<span class="dd-n0">共 ' + L.length + ' 張</span><span class="grow"></span><button type="button" class="btn" data-a="dd:edit">編輯</button>') + '</div>';
            /* 依天分類：一天的畫布放在一起，每張各自顯示創作時間 */
            const days = [];
            L.forEach(r => {
                const k = dayOf(r.t);
                let g = days.find(x => x[0] === k);
                if (!g)
                    days.push(g = [k, []]);
                g[1].push(r);
            });
            h += days.map(([k, list]) => {
                const open = DD.edit || DD.dexp[k], dn = list.filter(r => DD.sel[r.id]).length;
                return '<div class="dd-day' + (open ? ' open' : '') + '"><div class="dd-dh" data-a="' + (DD.edit ? 'dd:dsel' : 'dd:dayt') + '" data-i="' + k + '">'
                    + (DD.edit ? '<span class="dd-ck' + (dn === list.length ? ' on' : '') + '"></span>' : '')
                    + '<div class="dd-it"><b>' + dayLabel(k) + '</b><small>共 ' + list.length + ' 張畫布</small></div>'
                    + (DD.edit ? '' : '<span class="dd-chev">›</span>') + '</div>'
                    + (open ? '<div class="dd-dbody">' + list.map(r => itemHtml(r, true)).join('') + '</div>' : '') + '</div>';
            }).join('');
            DD._cs = shownList().map(cmSig).join('|');
        }
        else
            h += '<div class="empty">還沒有過往畫布。<br>過了今天，今天畫的畫布會依日期收進這裡。</div>';
        return h;
    }
    function vFav() {
        const L = favList();
        if (!L.length)
            return '<div class="empty">還沒有收藏的畫布。<br>點畫布右上角的星星，就會收藏在這裡。</div>';
        DD._cs = shownList().map(cmSig).join('|');
        return '<div class="dd-bar"><span class="dd-n0">共 ' + L.length + ' 張</span></div>' + L.map(r => itemHtml(r, false)).join('');
    }
    /* ---------- 設置：版面、字體跟「設置」頁的內容一樣（card set／h3／sr／機率條 prr） ---------- */
    const mm = s => Math.floor(s / 60), ss = s => s % 60;
    function numIn(key, val, extra) { return '<input class="dd-n" type="text" inputmode="numeric" maxlength="5" data-dd="' + key + '"' + (extra || '') + ' value="' + val + '" autocomplete="off">'; }
    const SR = (label, inner) => '<div class="sr" style="align-items:center"><span>' + label + '</span><span>' + inner + '</span></div>';
    const rowN = SR;
    function rowSw(label, key, on) { return '<div class="sr" style="align-items:center"><span>' + label + '</span><button type="button" class="sw' + (on ? ' on' : '') + '" data-a="dd:sw" data-i="' + key + '" aria-label="' + label + '"></button></div>'; }
    function cell(c) {
        return '<div class="dd-cc' + (c.on ? '' : ' off') + '"><button type="button" class="sw' + (c.on ? ' on' : '') + '" data-a="dd:csw" data-i="' + esc(c.id) + '" aria-label="' + esc(c.n) + '"></button>'
            + '<span class="dd-dot" style="background:' + esc(c.c) + '"></span><span class="dd-cn">' + esc(c.n) + '</span>' + numIn('cw', c.w, ' data-id="' + esc(c.id) + '"') + '</div>';
    }
    const PM_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>', PP_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg>';
    const PMIN = { pmin: 1, pmax: 1 }; // 圖形大小至少 1%，其餘機率可以到 0
    /* 機率條：跟設置頁的機率條同一個樣子（左右各一個 −／＋） */
    function pctRow(label, key, v) { const lo = PMIN[key] || 0; v = clamp(Math.round(+v || 0), lo, 100); return '<div class="sr"><span>' + label + '</span><b id="ddo-' + key + '">' + v + '%</b></div><div class="prr"><button type="button" class="pm" data-a="dd:pm" data-i="' + key + '" data-d="-1" aria-label="減少">' + PM_I + '</button><input type="range" min="' + lo + '" max="100" step="1" value="' + v + '" data-ddp="' + key + '"><button type="button" class="pm" data-a="dd:pm" data-i="' + key + '" data-d="1" aria-label="增加">' + PP_I + '</button></div>'; }
    function setPct(key, v) {
        const s = root().set;
        s[key] = clamp(Math.round(v), PMIN[key] || 0, 100);
        if (key === 'pmin' && s.pmin > s.pmax)
            s.pmax = s.pmin;
        if (key === 'pmax' && s.pmax < s.pmin)
            s.pmin = s.pmax;
        [key, 'pmin', 'pmax'].forEach(k => { if (s[k] == null)
            return; const o = document.getElementById('ddo-' + k); if (o)
            o.textContent = s[k] + '%'; document.querySelectorAll('input[data-ddp="' + k + '"]').forEach(x => { if (+x.value !== s[k])
            x.value = s[k]; }); });
        save();
    }
    const CARD = (t, b) => '<div class="card set">' + (t ? '<h3>' + t + '</h3>' : '') + b + '</div>';
    function vSet() {
        const d = root(), s = d.set, tmax = s.tmax;
        let h = CARD('一般', rowSw('塗鴉功能', 'on', s.on)
            + rowN('塗鴉時間最短', numIn('tmin', mm(s.tmin), ' data-u="m"') + ' 分 ' + numIn('tmin', ss(s.tmin), ' data-u="s"') + ' 秒')
            + rowN('塗鴉時間最長', numIn('tmax', Math.floor(tmax / 3600), ' data-u="h"') + ' 時 ' + numIn('tmax', mm(tmax % 3600), ' data-u="m"') + ' 分 ' + numIn('tmax', ss(tmax), ' data-u="s"') + ' 秒')
            + (() => { const iv = s.iv == null || s.iv === '' ? Math.min(s.tmin, s.tmax) : Math.max(0, +s.iv || 0); return rowN('判定成功後的間隔時間', numIn('iv', Math.floor(iv / 3600), ' data-u="h"') + ' 時 ' + numIn('iv', mm(iv % 3600), ' data-u="m"') + ' 分 ' + numIn('iv', ss(iv), ' data-u="s"') + ' 秒'); })()
            + pctRow('取消塗鴉機率', 'cancel', s.cancel)
            + rowN('每次放置圖形最少', numIn('nmin', s.nmin) + ' 個')
            + rowN('每次放置圖形最多', numIn('nmax', s.nmax) + ' 個')
            + '<p class="hint">取消塗鴉後，要等到最長時間過了才會進行下一次判定。判定成功（畫完）後，從這一輪開始算起，等「判定成功後的間隔時間」（沒設定就是最短時間）過了才開始下一輪。</p>');
        h += CARD('圖形', rowN('每個圖形選擇時間最短', numIn('smin', s.smin) + ' 秒')
            + rowN('每個圖形選擇時間最長', numIn('smax', s.smax) + ' 秒')
            + SHAPES.map(([k, n]) => rowN(n + '權重', numIn('w', s.w[k], ' data-id="' + k + '"'))).join('')
            + pctRow('圖形最小為畫布短邊的', 'pmin', s.pmin)
            + pctRow('圖形最大為畫布短邊的', 'pmax', s.pmax));
        h += CARD('圖形位置', rowSw('圖形重疊', 'overlap', s.overlap)
            + '<p class="hint">關閉重疊時，放不下的圖形會自動縮小再試；還是放不下就會略過。</p>');
        const base = d.colors.filter(c => !c.custom), cus = d.colors.filter(c => c.custom);
        h += CARD('圖形顏色權重', '<div class="dd-cg">' + base.map(cell).join('') + '</div>'
            + (cus.length ? '<div class="dd-cus">' + cus.map(c => '<div class="dd-cc dd-cu' + (c.on ? '' : ' off') + '"><button type="button" class="sw' + (c.on ? ' on' : '') + '" data-a="dd:csw" data-i="' + esc(c.id) + '" aria-label="' + esc(c.n) + '"></button><span class="dd-dot" style="background:' + esc(c.c) + '"></span><span class="dd-cn">' + esc(c.n) + '</span><span class="grow"></span>' + numIn('cw', c.w, ' data-id="' + esc(c.id) + '"') + '<button type="button" class="dd-x" data-a="dd:cdel" data-i="' + esc(c.id) + '" aria-label="刪除顏色">✕</button></div>').join('') + '</div>' : '')
            + '<button type="button" class="btn dd-wide" data-a="dd:cadd">＋ 添加自訂顏色</button>'
            + '<p class="hint">恢復默認設定不會刪除手動添加的自訂顏色。</p>');
        h += CARD('留言回覆', rowSw('聯絡人留言其他聯絡人的塗鴉', 'cm', s.cm)
            + pctRow('回覆留言機率', 'cmProb', s.cmProb)
            + rowN('留言最短時間', numIn('cmTmin', s.cmTmin) + ' 秒')
            + rowN('留言最長時間', numIn('cmTmax', s.cmTmax) + ' 秒')
            + rowN('留言條數最少', numIn('cmNmin', s.cmNmin) + ' 條')
            + rowN('留言條數最多', numIn('cmNmax', s.cmNmax) + ' 條')
            + rowN('一條留言裡最少字卡', numIn('cmFmin', s.cmFmin) + ' 條')
            + rowN('一條留言裡最多字卡', numIn('cmFmax', s.cmFmax) + ' 條')
            + pctRow('表情包機率', 'cmEp', s.cmEp)
            + pctRow('emoji機率', 'cmEmj', s.cmEmj)
            + rowN('emoji選擇時間', numIn('cmEmjT', s.cmEmjT) + ' 秒')
            + pctRow('顏文字機率', 'cmKao', s.cmKao)
            + rowN('顏文字選擇時間', numIn('cmKaoT', s.cmKaoT) + ' 秒')
            + '<p class="hint">開關打開後，聯絡人畫好一張畫，其他聯絡人各自判定是否留言；你在塗鴉底下留言或回覆，被回覆的聯絡人也依「回覆留言機率」判定是否回覆你（這個不受開關影響）。判定成功後，會在最短～最長時間內隨機一段時間才送出。留言條數、每條留言的字卡數、emoji／顏文字／表情包的選法與朋友圈留言相同。</p>');
        h += '<button type="button" class="btn d dd-wide" data-a="dd:reset">恢復默認設定</button>';
        return h;
    }
    /* 說明 */
    function vHelp() {
        const P = (t, b) => '<div class="card set dd-hc"><h3>' + t + '</h3>' + b + '</div>';
        return P('塗鴉是什麼', '<p>你的聯絡人偶爾會在空閒時隨手畫一張畫：先挑畫布，再一個一個選圖形、顏色和位置，最後依序放到畫布上。畫好的畫布會出現在「畫布」分頁，每位聯絡人各畫各的。</p>')
            + P('一次塗鴉怎麼進行', '<p>① 在「最短～最長時間」之間隨機等一段時間。<br>② 時間到了，先依「取消塗鴉機率」決定要不要畫。不畫的話，要等到最長時間過了才會進行下一次判定。<br>③ 要畫就依序決定：畫布 → 放幾個圖形 → 第一個圖形的形狀 → 顏色 → 位置，有第二個、第三個就照同樣順序繼續。<br>④ 每個步驟之間隔 0.5 秒；每個圖形開始前，還會等一段「圖形選擇時間」。<br>⑤ 全部選完才會一個一個放上畫布。畫完後，馬上開始下一次計時。</p>')
            + P('畫布與圖形', '<p>畫布隨機是橫長方形、豎長方形或正方形，長方形比例固定 3:5。<br>圖形有空心圓、實心圓、三角形、正方形、橫長方形、豎長方形（長方形同樣 3:5）。每次都是獨立隨機，不保底，所以可能連續出現同樣的圖形。<br>大小、位置、顏色也都是隨機，圖形一定完整落在畫布裡。</p>')
            + P('設置說明', '<p><b>權重</b>：數字越大越容易被選到，0 代表不會出現。顏色的開關關掉就不會使用。<br><b>圖形大小</b>：以畫布短邊為基準的百分比，是圖形最長那一邊的長度。<br><b>圖形重疊</b>：關掉後，圖形盡量不互相壓到；放不下時會先縮小再試，還是不行就略過這個圖形。<br><b>自訂顏色</b>：可以自己添加，也能單獨設定權重或刪除。<br><b>恢復默認設定</b>：所有數值回到預設，但不會刪除你添加的自訂顏色。</p>')
            + P('留言', '<p>每張畫布（包含過往畫布）底下都可以留言，版面和操作跟朋友圈留言一樣：點留言旁的「回覆」可以回覆那一條，點留言可以編輯或刪除，輸入框左邊的笑臉可以送表情包。<br>你留言或回覆後，被回覆的聯絡人會依「回覆留言機率」判定要不要回覆你。<br>「聯絡人留言其他聯絡人的塗鴉」打開後，聯絡人畫好畫，其他聯絡人也會各自判定要不要留言、要不要回覆彼此的留言（預設關閉）。<br>有新的回覆時，分頁上會出現小紅點；也會跟朋友圈一樣在上方通知、並在聊天室留下通知（跟「朋友圈通知」同一個開關）。</p>')
            + P('畫布與過往畫布', '<p>聯絡人一天裡畫的畫布都會放在「畫布」，每張標有各自的創作時間，新的在最上面。過了今天，這一天的畫布會一起收進「過往畫布」，依日期分成一天一組，點日期展開，每張畫布各自顯示創作時間。點畫布可以展開查看與留言；按「編輯」可以多選、全選（也能整天一起選）並刪除，刪除前會再確認一次，畫布上的留言會一起刪除。</p>')
            + P('收藏', '<p>每張畫布右上角都有星星，點一下就收藏，再點一下取消。收藏的畫布會集中在「收藏」分頁，不論是今天或過往的都在，也可以依聯絡人篩選；收藏的畫布不會被自動清掉。</p>')
            + P('小提醒', '<p>關掉頁面後，時間仍然照常計算；再打開時，到期的塗鴉與留言會依原本排定的時間接著完成，不會因為關掉頁面而重新計時。聯絡人開了免打擾時，時間照跑，但不會塗鴉也不會留言。</p>');
    }
    /* 浮窗 */
    function modalHtml() {
        const m = DD.modal;
        if (!m)
            return '';
        return '<div class="an-ov"><div class="an-pop box" data-keep="1"><h2 class="an-mt">添加自訂顏色</h2>'
            + '<div class="an-f dd-pick"><span class="an-pl">顏色</span><input id="ddcol" type="color" data-ddm="c" value="' + esc(m.c) + '"></div>'
            + '<label class="an-f"><span class="an-pl">名稱（選填）</span><input id="ddname" data-ddm="n" value="' + esc(m.n) + '" placeholder="例如：粉、奶茶" maxlength="6" autocomplete="off"></label>'
            + '<div class="an-acts"><span class="grow"></span><button type="button" class="btn" data-a="dd:mno">取消</button><button type="button" class="btn s" data-a="dd:myes">添加</button></div></div></div>';
    }
    function confirmHtml() {
        const c = DD.confirm;
        if (!c)
            return '';
        const T = {
            del: ['是否確認刪除？', '選取的 ' + Object.keys(DD.sel).length + ' 張畫布刪除後無法復原。', '確認刪除'],
            cdel: ['是否確認刪除？', '這個自訂顏色刪除後無法復原。', '確認刪除'],
            reset: ['是否恢復默認設定？', '所有設置回到預設值，不會刪除自訂顏色。', '確認恢復']
        }[c.k];
        return '<div class="an-ov an-cf"><div class="box an-cfbox" data-keep="1"><h2 style="margin-bottom:6px">' + T[0] + '</h2><p class="hint" style="margin:0 0 10px">' + T[1] + '</p><div class="an-cfa"><button type="button" class="btn" data-a="dd:cfno">取消</button><button type="button" class="btn d" data-a="dd:cfyes">' + T[2] + '</button></div></div></div>';
    }
    /* ---------- 點擊 ---------- */
    function act(a, i, el) {
        const d = root(), s = d.set;
        switch (a) {
            case 'dd':
                DD.open = true;
                DD.tab = 'canvas';
                DD.cid = S.cur || '';
                DD.pcid = '';
                DD.fcid = '';
                DD.dexp = {};
                DD.edit = false;
                DD.sel = {};
                DD.exp = {};
                DD.modal = null;
                DD.confirm = null;
                render();
                top0();
                return true;
            case 'dd:back':
                if (DD.confirm)
                    DD.confirm = null;
                else if (DD.modal)
                    DD.modal = null;
                else
                    DD.open = false;
                render();
                top0();
                return true;
            case 'dd:tab':
                DD.tab = i;
                DD.edit = false;
                DD.sel = {};
                R();
                top0();
                return true;
            case 'dd:fav': {
                const r = recOf(i);
                if (r) {
                    r.fav = r.fav ? 0 : 1;
                    save();
                    R(true);
                }
                return true;
            }
            case 'dd:dayt':
                if (DD.dexp[i])
                    delete DD.dexp[i];
                else
                    DD.dexp[i] = 1;
                R(true);
                return true;
            case 'dd:dsel': {
                const list = pastList().filter(r => dayOf(r.t) === i), allOn = list.every(r => DD.sel[r.id]);
                list.forEach(r => { if (allOn)
                    delete DD.sel[r.id];
                else
                    DD.sel[r.id] = 1; });
                R(true);
                return true;
            }
            case 'dd:cat':
                if (DD.tab === 'fav') {
                    DD.fcid = i;
                }
                else if (DD.tab === 'past') {
                    DD.pcid = i;
                    DD.sel = {};
                }
                else
                    DD.cid = i;
                R(true);
                return true;
            case 'dd:tog':
                if (DD.edit) {
                    if (DD.sel[i])
                        delete DD.sel[i];
                    else
                        DD.sel[i] = 1;
                }
                else {
                    if (DD.exp[i])
                        delete DD.exp[i];
                    else
                        DD.exp[i] = 1;
                }
                R(true);
                return true;
            case 'dd:edit':
                DD.edit = true;
                DD.sel = {};
                R(true);
                return true;
            case 'dd:done':
                DD.edit = false;
                DD.sel = {};
                R(true);
                return true;
            case 'dd:all': {
                const L = pastList();
                if (Object.keys(DD.sel).length === L.length)
                    DD.sel = {};
                else {
                    DD.sel = {};
                    L.forEach(x => DD.sel[x.id] = 1);
                }
                R(true);
                return true;
            }
            case 'dd:del':
                if (Object.keys(DD.sel).length) {
                    DD.confirm = { k: 'del' };
                    R(true);
                }
                return true;
            case 'dd:pm':
                setPct(i, (+root().set[i] || 0) + (+el.dataset.d || 0));
                return true;
            case 'dd:sw':
                s[i] = s[i] ? 0 : 1;
                el.classList.toggle('on', !!s[i]);
                save();
                return true;
            case 'dd:csw': {
                const c = d.colors.find(x => x.id === i);
                if (c) {
                    c.on = c.on ? 0 : 1;
                    el.classList.toggle('on', !!c.on);
                    const cc = el.closest('.dd-cc');
                    if (cc)
                        cc.classList.toggle('off', !c.on);
                    save();
                }
                return true;
            }
            case 'dd:cadd':
                DD.modal = { c: '#e8a6c8', n: '' };
                R(true);
                return true;
            case 'dd:mno':
                DD.modal = null;
                R(true);
                return true;
            case 'dd:myes': {
                const m = DD.modal, n = (m.n || '').trim() || ('自訂' + (d.colors.filter(x => x.custom).length + 1));
                d.colors.push({ id: 'u' + uid(), n, c: m.c, on: 1, w: 10, custom: 1 });
                DD.modal = null;
                save();
                R(true);
                return true;
            }
            case 'dd:cdel':
                DD.confirm = { k: 'cdel', id: i };
                R(true);
                return true;
            case 'dd:reset':
                DD.confirm = { k: 'reset' };
                R(true);
                return true;
            case 'dd:cfno':
                DD.confirm = null;
                R(true);
                return true;
            case 'dd:cfyes': {
                const c = DD.confirm;
                DD.confirm = null;
                if (c.k === 'del') {
                    const gone = DD.sel;
                    d.cq = d.cq.filter(j => !gone[j.rid]);
                    try {
                        Object.keys(gone).forEach(id => { delete momDr[id]; });
                    }
                    catch (e) { }
                    d.history = d.history.filter(x => !gone[x.id]);
                    DD.sel = {};
                    DD.edit = false;
                }
                else if (c.k === 'cdel') {
                    d.colors = d.colors.filter(x => x.id !== c.id);
                }
                else if (c.k === 'reset') {
                    const cus = d.colors.filter(x => x.custom).map(x => Object.assign(x, { on: 1, w: 10 }));
                    d.set = defSet();
                    d.colors = defColors().concat(cus);
                    d.run = {};
                }
                save();
                R(true);
                return true;
            }
        }
        return false;
    }
    document.addEventListener('click', e => {
        const t = e.target;
        if (!t || !t.closest)
            return;
        if (DD.open && t.closest('[data-t]') && !t.closest('[data-a]')) {
            DD.open = false;
            DD.modal = null;
            DD.confirm = null;
            return;
        } // 切換底部分頁時離開
        const A = t.closest('[data-a="dd"],[data-a^="dd:"]');
        if (!A) {
            if (DD.open && DD.confirm && t.classList && t.classList.contains('an-cf')) {
                DD.confirm = null;
                R(true);
            }
            return;
        }
        if (act(A.dataset.a, A.dataset.i, A)) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, true);
    /* ---------- 輸入 ---------- */
    document.addEventListener('input', e => {
        const t0 = e.target;
        if (t0 && t0.dataset && DD.open && t0.dataset.ddp) {
            setPct(t0.dataset.ddp, +t0.value);
            return;
        }
        const t = e.target;
        if (!t || !t.dataset || !DD.open || !DD.modal || !t.dataset.ddm)
            return;
        DD.modal[t.dataset.ddm] = t.value;
    });
    function num(el) { return Math.max(0, parseInt(String(el.value).replace(/\D/g, ''), 10) || 0); }
    function timeOf(key) {
        let sum = 0;
        document.querySelectorAll('[data-dd="' + key + '"]').forEach(x => { const u = x.dataset.u, v = num(x); sum += u === 'h' ? v * 3600 : u === 'm' ? v * 60 : v; });
        return sum;
    }
    document.addEventListener('change', e => {
        const t = e.target;
        if (!t || !t.dataset || !DD.open || DD.tab !== 'set' || !t.dataset.dd)
            return;
        const s = root().set, k = t.dataset.dd, v = num(t);
        switch (k) {
            case 'tmin':
                s.tmin = Math.max(1, timeOf('tmin'));
                if (s.tmin > s.tmax)
                    s.tmax = s.tmin;
                break;
            case 'tmax':
                s.tmax = Math.max(1, timeOf('tmax'));
                if (s.tmax < s.tmin)
                    s.tmin = s.tmax;
                break;
            case 'iv':
                s.iv = Math.max(0, timeOf('iv'));
                break;
            case 'cancel':
                s.cancel = clamp(v, 0, 100);
                break;
            case 'nmin':
                s.nmin = clamp(v, 1, 99);
                if (s.nmin > s.nmax)
                    s.nmax = s.nmin;
                break;
            case 'nmax':
                s.nmax = clamp(v, 1, 99);
                if (s.nmax < s.nmin)
                    s.nmin = s.nmax;
                break;
            case 'smin':
                s.smin = Math.max(1, v);
                if (s.smin > s.smax)
                    s.smax = s.smin;
                break;
            case 'smax':
                s.smax = Math.max(1, v);
                if (s.smax < s.smin)
                    s.smin = s.smax;
                break;
            case 'pmin':
                s.pmin = clamp(v, 1, 100);
                if (s.pmin > s.pmax)
                    s.pmax = s.pmin;
                break;
            case 'pmax':
                s.pmax = clamp(v, 1, 100);
                if (s.pmax < s.pmin)
                    s.pmin = s.pmax;
                break;
            case 'cmTmin':
                s.cmTmin = clamp(v, 0, 99999);
                if (s.cmTmin > s.cmTmax)
                    s.cmTmax = s.cmTmin;
                break;
            case 'cmTmax':
                s.cmTmax = clamp(v, 0, 99999);
                if (s.cmTmax < s.cmTmin)
                    s.cmTmin = s.cmTmax;
                break;
            case 'cmNmin':
                s.cmNmin = clamp(v, 1, 99);
                if (s.cmNmin > s.cmNmax)
                    s.cmNmax = s.cmNmin;
                break;
            case 'cmNmax':
                s.cmNmax = clamp(v, 1, 99);
                if (s.cmNmax < s.cmNmin)
                    s.cmNmin = s.cmNmax;
                break;
            case 'cmFmin':
                s.cmFmin = clamp(v, 1, 99);
                if (s.cmFmin > s.cmFmax)
                    s.cmFmax = s.cmFmin;
                break;
            case 'cmFmax':
                s.cmFmax = clamp(v, 1, 99);
                if (s.cmFmax < s.cmFmin)
                    s.cmFmin = s.cmFmax;
                break;
            case 'cmEmjT':
                s.cmEmjT = clamp(v, 0, 999);
                break;
            case 'cmKaoT':
                s.cmKaoT = clamp(v, 0, 999);
                break;
            case 'w':
                s.w[t.dataset.id] = clamp(v, 0, 999);
                break;
            case 'cw': {
                const c = root().colors.find(x => x.id === t.dataset.id);
                if (c)
                    c.w = clamp(v, 0, 999);
                break;
            }
            default: return;
        }
        save();
        R(true);
    });
})();
