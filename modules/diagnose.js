/* Pearla 問題診斷
   ‧ 前半：從網頁一開啟就開始記錄 JS 錯誤（最多 40 筆，只存在記憶體，關掉就清空）
   ‧ 後半：設置→工具→問題診斷 頁面。所有檢查都是「唯讀」：
       - 不會修改、不會刪除你的資料（儲存測試只寫一個叫 diag-test 的暫存鍵，測完立刻刪掉）
       - 讀 S.set 一律用 __raw，避免觸發設置代理（Proxy）自動建立聯絡人專屬副本
   ‧ 診斷報告只含數量與狀態，不含任何訊息內容、聯絡人名稱或圖片 */
(function () {
    'use strict';
    /* ── 〇、記錄每次開啟是怎麼結束的 ──
       每 5 秒在 localStorage 留一筆「心跳」（目前畫面、畫面元素數、訊息數、最後的錯誤）。
       下次開啟時比對：如果上次最後是「前景使用中」又沒有正常離開，就是被系統強制結束或崩潰。
       只存數量與狀態，不存任何內容；最多保留最近 12 筆 */
    const SK = 'pearla-session', LK = 'pearla-session-log';
    const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const sess = { id: Math.random().toString(36).slice(2, 8), start: Date.now(), beat: Date.now(), vis: document.visibilityState === 'hidden' ? 'hidden' : 'visible', end: '', tab: '', nodes: 0, msgs: 0, mem: 0, err: '', errT: 0 };
    function beat() {
        try {
            sess.beat = Date.now();
            sess.vis = document.visibilityState === 'hidden' ? 'hidden' : 'visible';
            sess.tab = (typeof tab === 'string') ? tab : sess.tab;
            sess.nodes = document.getElementsByTagName('*').length;
            if (typeof S !== 'undefined' && S && S.msgs) { let n = 0; for (const k in S.msgs) n += ((S.msgs[k] || []).length || 0); sess.msgs = n; }
            if (performance.memory) sess.mem = Math.round(performance.memory.usedJSHeapSize / 1048576);
            lsSet(SK, sess);
        } catch (e) { }
    }
    (function judgePrevious() {
        try {
            const prev = lsGet(SK, null);
            if (!prev || !prev.start) return;
            /* 前景異常結束：最後一次紀錄時畫面還在前景，而且沒有觸發正常離開（pagehide） */
            const kind = (prev.vis === 'visible' && !prev.end) ? 'fg' : 'ok';
            const log = lsGet(LK, []);
            log.push({ at: prev.beat, k: kind, up: Math.max(0, prev.beat - prev.start), tab: prev.tab || '', nodes: prev.nodes || 0, msgs: prev.msgs || 0, mem: prev.mem || 0, err: prev.err || '' });
            while (log.length > 12) log.shift();
            lsSet(LK, log);
        } catch (e) { }
    })();
    setInterval(() => { if (document.visibilityState !== 'hidden') beat(); }, 5000);
    document.addEventListener('visibilitychange', beat);
    addEventListener('pagehide', () => { sess.end = 'pagehide'; beat(); });
    addEventListener('pageshow', e => { if (e && e.persisted) { sess.end = ''; beat(); } });
    beat();

    /* ── 一、錯誤記錄 ── */
    const ERRS = [];
    const pushErr = (kind, msg, src) => {
        try {
            ERRS.push({ t: Date.now(), k: kind, m: String(msg || '').slice(0, 300), s: String(src || '').slice(0, 160) });
            if (ERRS.length > 40) ERRS.shift();
            sess.err = (kind + '：' + String(msg || '')).slice(0, 120);
            if (Date.now() - sess.errT > 1000) { sess.errT = Date.now(); beat(); }
        } catch (e) { }
    };
    addEventListener('error', e => {
        if (e && e.target && e.target !== window && e.target.tagName) {
            pushErr('資源載入失敗', e.target.tagName.toLowerCase(), e.target.src || e.target.href || '');
            return;
        }
        pushErr('JS 錯誤', e && e.message, e && e.filename ? e.filename.split('/').slice(-2).join('/') + ':' + e.lineno : '');
    }, true);
    addEventListener('unhandledrejection', e => {
        const r = e && e.reason;
        pushErr('未處理的 Promise 錯誤', r && (r.message || r.name || r), r && r.stack ? String(r.stack).split('\n')[1] : '');
    });

    /* ── 二、工具函式 ── */
    const Dg = window.PDiag = { page: page, errors: ERRS };
    const st = { running: false, done: 0, total: 0, res: null, at: 0, step: '' };
    const TH = { dataWarn: 10, dataBad: 40, cloneWarn: 50, cloneBad: 200, quotaWarn: 0.7, quotaBad: 0.9, domWarn: 6000 };
    const fmtB = n => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
    const pad = n => String(n).padStart(2, '0');
    const fmtT = t => { const d = new Date(t); return pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const tmo = (p, ms, label) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error((label || '操作') + '逾時（' + ms / 1000 + ' 秒）')), ms))]);
    const ES = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const isObj = v => v && typeof v === 'object';
    /* 取得「原始物件」：S.set 是代理，讀 __raw 不會有副作用 */
    const raw = o => (isObj(o) && o.__raw) ? o.__raw : o;
    const getS = () => { try { return typeof S !== 'undefined' ? S : null; } catch (e) { return null; } };

    /* 一次走訪整份資料：循環參照、NaN/Infinity、圖片資料、各頂層欄位大小 */
    function walk(root) {
        const out = { nodes: 0, cycle: false, bad: [], imgs: 0, imgBytes: 0, strBytes: 0, capped: false };
        const anc = [];
        const rec = (o, path, depth) => {
            if (out.capped) return;
            if (++out.nodes > 3000000) { out.capped = true; return; }
            if (typeof o === 'number') { if (!isFinite(o) && out.bad.length < 8) out.bad.push(path); return; }
            if (o === undefined) { if (out.bad.length < 8) out.bad.push(path + '（undefined）'); return; }
            if (typeof o === 'string') {
                out.strBytes += o.length;
                if (o.length > 200 && o.charCodeAt(0) === 100 && o.slice(0, 5) === 'data:') { out.imgs++; out.imgBytes += o.length; }
                return;
            }
            if (!isObj(o) || depth > 40) return;
            const r = raw(o);
            if (anc.indexOf(r) >= 0) { out.cycle = true; return; }
            anc.push(r);
            if (Array.isArray(r)) { for (let i = 0; i < r.length; i++) rec(r[i], path + '[' + i + ']', depth + 1); }
            else { for (const k in r) { if (Object.prototype.hasOwnProperty.call(r, k)) rec(r[k], path + '.' + k, depth + 1); } }
            anc.pop();
        };
        rec(root, 'S', 0);
        return out;
    }
    function topSizes(s) {
        const rows = [];
        try {
            const r = raw(s);
            for (const k in r) {
                if (!Object.prototype.hasOwnProperty.call(r, k)) continue;
                let n = 0;
                try { n = JSON.stringify(raw(r[k])).length; } catch (e) { n = -1; }
                rows.push([k, n]);
            }
        } catch (e) { }
        return rows.filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }

    /* ── 三、各項檢查 ── */
    /* 每個檢查：add(狀態, 名稱, 說明, 建議)；狀態：ok / warn / bad / info */
    const SECTIONS = [];
    const section = (id, title, fn) => SECTIONS.push({ id, title, fn });

    section('boot', '一、最近幾次開啟是怎麼結束的（重啟原因）', async add => {
        const log = lsGet(LK, []);
        const TABN = { home: '主頁', contacts: '聯絡人', chat: '聊天室', cards: '字卡', set: '設置' };
        const dur = ms => ms < 60000 ? Math.round(ms / 1000) + ' 秒' : ms < 3600000 ? Math.round(ms / 60000) + ' 分鐘' : (ms / 3600000).toFixed(1) + ' 小時';
        add('info', '這次開啟', '開始於 ' + fmtT(sess.start) + '，已經 ' + dur(Date.now() - sess.start));
        if (!log.length) {
            add('info', '結束紀錄', '還沒有紀錄', '這個功能從這個版本才開始記錄。之後再發生「聊到一半重啟」，重開後到這裡就能看到。');
            return;
        }
        const fg = log.filter(x => x.k === 'fg');
        const line = x => fmtT(x.at) + '｜' + (x.k === 'fg' ? '前景使用中突然結束' : '背景或正常關閉') + '｜' + (TABN[x.tab] || x.tab || '?') + '｜用了 ' + dur(x.up) + '｜畫面元素 ' + x.nodes + '｜訊息 ' + x.msgs + (x.mem ? '｜JS 記憶體 ' + x.mem + ' MB' : '') + (x.err ? '｜最後錯誤：' + x.err : '');
        if (!fg.length) add('ok', '前景異常結束', '最近 ' + log.length + ' 次開啟都沒有在使用中突然結束', '在背景被系統回收，或你自己關掉，都歸在「背景或正常關閉」，這是 iPhone 的正常行為，不算問題。');
        else {
            const last = fg[fg.length - 1];
            add(fg.length >= 3 ? 'bad' : 'warn', '前景使用中突然結束', '最近 ' + log.length + ' 次裡有 ' + fg.length + ' 次；最近一次：' + line(last),
                '這代表程式在你使用時被系統強制結束或崩潰（不是程式自己重啟）。多半是記憶體吃太多。請把這份報告貼給我，並留意結束前停在哪個分頁、做了什麼。');
            const tabs = {}; fg.forEach(x => { const n = TABN[x.tab] || x.tab || '?'; tabs[n] = (tabs[n] || 0) + 1; });
            add('info', '突然結束時停在哪裡', Object.keys(tabs).map(k => k + ' ' + tabs[k] + ' 次').join('、'));
            const withErr = fg.filter(x => x.err); if (withErr.length) add('warn', '結束前出現過的錯誤', withErr.slice(-3).map(x => x.err).join('；'), '這可能就是原因，請回報。');
        }
        log.slice(-8).reverse().forEach(x => add('info', x.k === 'fg' ? '紀錄（突然結束）' : '紀錄（正常）', line(x)));
    });

    section('env', '二、裝置與瀏覽器環境', async add => {
        const ua = navigator.userAgent || '';
        const ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const m = ua.match(/OS (\d+)[_.](\d+)/);
        add('info', '裝置／系統', (ios ? 'iOS' + (m ? ' ' + m[1] + '.' + m[2] : '') : (navigator.platform || '未知')) + '；' + ua.slice(0, 110));
        const standalone = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
        if (standalone) add('ok', '執行模式', '已加到主畫面，以 App 模式執行');
        else if (ios) add('warn', '執行模式', '目前是在瀏覽器分頁裡開啟', 'iOS 的瀏覽器分頁，網站資料在長時間沒用後比較容易被系統清掉。建議用 Safari「分享 → 加入主畫面」再從主畫面圖示開啟。');
        else add('info', '執行模式', '在瀏覽器分頁中執行');
        if (window.isSecureContext) add('ok', '安全環境（https）', '是');
        else add('bad', '安全環境（https）', '否', '不是 https（或 localhost）時，瀏覽器會停用 Service Worker、麥克風等功能。請改用 https 網址開啟。');
        add('info', '網路', navigator.onLine === false ? '目前離線' : '目前有網路');
        add('info', '畫面', innerWidth + '×' + innerHeight + '，像素比 ' + (devicePixelRatio || 1));
        let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { }
        add('info', '時區／本機時間', (tz || '未知') + '；' + fmtT(Date.now()) + '（每日留言、學習進度等排程都以這個時間為準）');
        const need = [
            ['IndexedDB（存資料）', !!window.indexedDB, 'bad', '沒有它就無法儲存任何資料。'],
            ['隨機數 crypto.getRandomValues', !!(window.crypto && crypto.getRandomValues), 'bad', '抽卡的隨機系統需要它。'],
            ['Cache Storage（離線快取）', !!window.caches, 'warn', '沒有它就無法離線使用，字體也無法存起來。'],
            ['Service Worker', 'serviceWorker' in navigator, 'warn', '沒有它就無法離線使用。'],
            ['儲存空間 API（estimate／persist）', !!(navigator.storage && navigator.storage.estimate), 'warn', '無法查看剩餘空間。'],
            ['音訊 AudioContext', !!(window.AudioContext || window.webkitAudioContext), 'warn', '提示音、錄音相關功能會失效。'],
            ['錄音 MediaRecorder', typeof MediaRecorder !== 'undefined', 'warn', '聊天室錄音會無法使用。'],
            ['麥克風 getUserMedia', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia), 'warn', '聊天室錄音會無法使用。'],
            ['剪貼簿 clipboard', !!(navigator.clipboard && navigator.clipboard.writeText), 'warn', '「複製備份」可能要改用手動選取。'],
            ['字體 API document.fonts', !!document.fonts, 'warn', '字體載入狀態無法判斷。']
        ];
        const miss = need.filter(x => !x[1]);
        if (!miss.length) add('ok', '必要功能支援', '全部支援（' + need.length + ' 項）');
        miss.forEach(x => add(x[2], '不支援：' + x[0], '', x[3]));
        add('info', '震動 vibrate', navigator.vibrate ? '支援' : '不支援（iOS 本來就不支援，不影響使用）');
        await new Promise(res => {
            const im = new Image(); let done = false;
            const fin = ok => { if (done) return; done = true; if (ok) add('ok', '圖片格式 WebP', '可正常顯示'); else add('bad', '圖片格式 WebP', '這個瀏覽器無法顯示 WebP', '主題圖片會全部顯示不出來，請更新系統或瀏覽器。'); res(); };
            im.onload = () => fin(im.width > 0); im.onerror = () => fin(false);
            im.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
            setTimeout(() => fin(false), 3000);
        });
    });

    section('store', '三、儲存與資料保護', async add => {
        const s = getS();
        /* 資料庫狀態 */
        if (typeof db !== 'undefined' && db) add('ok', '資料庫連線（IndexedDB）', '已連線');
        else add('bad', '資料庫連線（IndexedDB）', '沒有連上', '目前的修改不會被儲存！請完全關閉 App 再重開；若是無痕／隱私模式，請改用一般模式。');
        if (typeof noSave !== 'undefined' && noSave) add('bad', '存檔保護', '已停止存檔', '程式偵測到「內容變空」而停止存檔保護舊資料。請完全關閉 App 重開，重開後若仍是空的，會詢問是否從自動備份還原。');
        else add('ok', '存檔保護', '正常');
        if (typeof loadFail !== 'undefined' && loadFail) add('bad', '讀取狀態', '上次讀取資料失敗', '請完全關閉 App 重開。如果一直這樣，請先到「設置→數據→備份與還原」確認能否複製備份。');
        else add('ok', '讀取狀態', '正常');
        if (typeof lastSaveErr !== 'undefined' && lastSaveErr) add('warn', '最近一次存檔失敗', fmtT(lastSaveErr.t) + '：' + lastSaveErr.name + (lastSaveErr.msg ? '（' + lastSaveErr.msg + '）' : ''), '偶發一次不用擔心；如果常常出現，請備份資料並完全關閉 App 重開。');
        else add('ok', '最近的存檔', '本次開啟後沒有失敗紀錄');
        /* 真實讀寫測試（只動 diag-test 這個暫存鍵） */
        if (typeof db !== 'undefined' && db) {
            try {
                const t0 = performance.now();
                const val = { t: Date.now(), r: Math.random() };
                await tmo(new Promise((res, rej) => {
                    const tx = db.transaction('kv', 'readwrite'), os = tx.objectStore('kv');
                    os.put(val, 'diag-test');
                    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error || new Error('寫入失敗')); tx.onabort = () => rej(tx.error || new Error('寫入被中止'));
                }), 6000, '寫入測試');
                const back = await tmo(new Promise((res, rej) => { const q = db.transaction('kv').objectStore('kv').get('diag-test'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }), 6000, '讀取測試');
                await new Promise(res => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').delete('diag-test'); tx.oncomplete = tx.onerror = tx.onabort = () => res(); });
                const ms = Math.round(performance.now() - t0);
                if (!back || back.r !== val.r) add('bad', '資料庫讀寫測試', '寫入後讀回的內容不一致', '資料庫可能已損壞或被系統限制，請立刻備份資料。');
                else if (ms > 800) add('warn', '資料庫讀寫測試', '成功，但花了 ' + ms + ' 毫秒', '偏慢，可能是手機儲存空間快滿或系統忙碌。');
                else add('ok', '資料庫讀寫測試', '寫入、讀回、刪除都成功（' + ms + ' 毫秒）');
            } catch (e) { add('bad', '資料庫讀寫測試', '失敗：' + (e && (e.name || e.message) || e), '目前可能無法儲存資料。請先備份，再完全關閉 App 重開。'); }
            /* 多視窗同步 */
            try {
                const dbRev = await new Promise(res => { const q = db.transaction('kv').objectStore('kv').get('rev'); q.onsuccess = () => res(+q.result || 0); q.onerror = () => res(0); });
                if (typeof myRev !== 'undefined' && dbRev > myRev) add('warn', '資料同步', '資料庫裡有比目前畫面更新的資料', '可能同時開了多個視窗或分頁。回到前景時會自動同步；建議只留一個視窗。');
                else add('ok', '資料同步', '目前畫面的資料是最新的');
            } catch (e) { }
            /* 資料庫裡實際存的內容：新版是整串 JSON 文字，舊版是物件（程式兩種都讀得懂） */
            try {
                const rawS = await new Promise(res => { const q = db.transaction('kv').objectStore('kv').get('s'); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); });
                if (rawS === undefined || rawS === null) add('info', '資料庫裡的存檔', '還沒有存檔內容');
                else if (typeof rawS === 'string') {
                    let okJ = true; try { JSON.parse(rawS); } catch (e) { okJ = false; }
                    if (okJ) add('ok', '資料庫裡的存檔', '格式正常（JSON 文字，' + fmtB(rawS.length) + '）');
                    else add('bad', '資料庫裡的存檔', '內容損壞，無法解讀（' + fmtB(rawS.length) + '）', '如果現在關閉程式，下次開啟可能讀不到資料。請先用「備份與還原」複製目前畫面的資料，並回報；下次存檔會用目前畫面的資料覆蓋掉損壞的內容。');
                } else add('info', '資料庫裡的存檔', '舊格式（物件）', '下次存檔時會自動轉成新格式，不用處理。');
            } catch (e) { }
            /* 自動備份 */
            try {
                const bakRaw = await new Promise(res => { const q = db.transaction('kv').objectStore('kv').get('bak'); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); });
                const bak = (typeof dbObj === 'function') ? dbObj(bakRaw) : bakRaw;
                const wBak = (typeof wt === 'function') ? wt(bak) : 0, wNow = (typeof wt === 'function' && s) ? wt(s) : 0;
                if (!bakRaw) add('info', '自動備份', '還沒有自動備份（資料庫有內容後，約每 5 分鐘會自動留一份）');
                else if (!bak) add('warn', '自動備份', '有備份，但內容讀不出來', '備份可能損壞，建議多做幾次手動備份。');
                else if (wNow === 0 && wBak > 0) add('bad', '自動備份', '目前資料是空的，但自動備份裡有 ' + wBak + ' 筆內容', '資料可能被清空了。請不要做任何儲存動作，完全關閉 App 重開，並選擇從自動備份還原。');
                else add('ok', '自動備份', '有，內容量 ' + wBak + ' 筆（訊息＋字卡）；目前 ' + wNow + ' 筆');
            } catch (e) { }
        }

        /* 容量 */
        try {
            if (navigator.storage && navigator.storage.estimate) {
                const e = await tmo(navigator.storage.estimate(), 5000, '查詢空間');
                if (e && e.quota) {
                    const p = (e.usage || 0) / e.quota, txt = '已用 ' + fmtB(e.usage || 0) + ' ／ 瀏覽器配給 ' + fmtB(e.quota) + '（' + (p * 100).toFixed(1) + '%）';
                    if (p >= TH.quotaBad) add('bad', '瀏覽器儲存空間', txt, '快滿了，之後可能存不進去。請先備份，再到「設置→數據」清理。');
                    else if (p >= TH.quotaWarn) add('warn', '瀏覽器儲存空間', txt, '用量偏高，建議備份並清理不需要的圖片。');
                    else add('ok', '瀏覽器儲存空間', txt);
                } else add('info', '瀏覽器儲存空間', '瀏覽器沒有提供用量資訊');
            }
        } catch (e) { add('info', '瀏覽器儲存空間', '無法查詢：' + (e && e.message || e)); }
        try {
            if (navigator.storage && navigator.storage.persisted) {
                const p = await navigator.storage.persisted();
                if (p) add('ok', '持久儲存', '已獲得（系統不會在空間不足時自動清掉資料）');
                else add('info', '持久儲存', '未獲得', '不代表資料一定會消失，但空間不足或長期不用時，系統有可能清掉。固定做備份最保險。');
            }
        } catch (e) { }
        try {
            const k = '__diag_ls__' + Date.now(); localStorage.setItem(k, '1'); const ok = localStorage.getItem(k) === '1'; localStorage.removeItem(k);
            add(ok ? 'ok' : 'warn', 'localStorage（主題記憶）', ok ? '可正常讀寫' : '讀回的內容不一致', ok ? '' : '主題設定可能無法在下次開啟時記住。');
        } catch (e) { add('warn', 'localStorage（主題記憶）', '無法使用：' + (e && e.name || e), '主題設定可能無法在下次開啟時記住（無痕模式常見）。'); }
        /* 資料大小與可序列化 */
        if (s) {
            let json = null, tStr = 0;
            try { const ts = performance.now(); json = JSON.stringify(s); tStr = Math.round(performance.now() - ts); } catch (e) { add('bad', '資料可否存檔', '資料無法轉成存檔格式：' + String((e && e.message) || e).split('\n')[0].slice(0, 120), '通常是出現了循環參照。每次存檔都會失敗，請立刻用「備份與還原」留存可複製的部分並回報。'); }
            if (json != null) {
                const mb = json.length / 1048576;
                const top = topSizes(s).map(x => x[0] + ' ' + fmtB(x[1])).join('、');
                if (mb >= TH.dataBad) add('bad', '資料大小', fmtB(json.length) + '；最大的欄位：' + top, '非常大，每次存檔都要把整份資料轉成文字，手機會明顯卡頓甚至存檔失敗。請清理圖片或舊資料。');
                else if (mb >= TH.dataWarn) add('warn', '資料大小', fmtB(json.length) + '；最大的欄位：' + top, '偏大。每次存檔都要把整份資料轉成文字，建議清理不需要的圖片。');
                else add('ok', '資料大小', fmtB(json.length) + '；最大的欄位：' + top);
                /* 實測「把整份資料轉成存檔文字」要多久（每次存檔都會做這一步） */
                if (tStr >= TH.cloneBad) add('bad', '存檔耗時（實測）', '轉成存檔格式約 ' + tStr + ' 毫秒', '每次存檔都會讓畫面停頓這麼久。請清理圖片或舊資料。');
                else if (tStr >= TH.cloneWarn) add('warn', '存檔耗時（實測）', '轉成存檔格式約 ' + tStr + ' 毫秒', '偏慢，傳訊息時可能感覺到輕微停頓。');
                else add('ok', '存檔耗時（實測）', '轉成存檔格式約 ' + tStr + ' 毫秒');
                json = null;
            }
            const w = walk(s);
            if (w.cycle) add('bad', '循環參照', '資料裡有物件互相包含', '會造成存檔失敗，請回報。');
            else add('ok', '循環參照', '沒有');
            if (w.bad.length) add('bad', '異常數值', '發現 NaN／Infinity／undefined：' + w.bad.slice(0, 6).join('、') + (w.bad.length > 6 ? ' 等' : ''), '存檔時這些值會變成 null 或消失，可能讓對應功能出錯。請回報這些欄位名稱。');
            else add('ok', '異常數值', '沒有 NaN／Infinity／undefined');
            if (w.imgs > 60 || w.imgBytes > 8 * 1048576) add('warn', '內嵌圖片', w.imgs + ' 張，約 ' + fmtB(w.imgBytes), '圖片都存在資料裡，太多會拖慢每次存檔。可以刪掉不需要的字卡圖片或貼圖。');
            else add('info', '內嵌圖片', w.imgs + ' 張，約 ' + fmtB(w.imgBytes));
            if (w.capped) add('info', '走訪範圍', '資料過大，只檢查了前面的部分');
        } else add('bad', '資料狀態', '程式還沒載入資料（S 不存在）', '請完全關閉 App 重開。');
        /* Cache Storage 與 Service Worker */
        await cacheChecks(add);
    });

    async function fetchSwText() {
        const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
        try { const r = await fetch('sw.js', { cache: 'no-store', signal: ctl.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.text(); } finally { clearTimeout(t); }
    }
    async function cacheChecks(add) {
        if (!window.caches) return;
        let swText = null, version = null, core = [];
        try {
            swText = await fetchSwText();
            const v = swText.match(/const VERSION\s*=\s*['"]([^'"]+)['"]/); version = v && v[1];
            const c = swText.match(/const CORE\s*=\s*\[([\s\S]*?)\];/);
            if (c) core = [...c[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
        } catch (e) { add('info', '取得 sw.js', '無法讀取（' + (e && e.message || e) + '）；離線時這很正常'); }
        let names = [];
        try { names = await caches.keys(); } catch (e) { add('warn', '快取列表', '無法讀取：' + (e && e.message || e)); return; }
        const rows = [];
        for (const n of names) { try { const c = await caches.open(n); rows.push(n + ' ' + (await c.keys()).length + ' 個檔'); } catch (e) { rows.push(n + ' 讀取失敗'); } }
        add('info', '快取清單', rows.length ? rows.join('；') : '目前沒有任何快取');
        if (version) {
            add('info', '網站目前的快取版本', version);
            const old = names.filter(n => n.indexOf('pearla-') === 0 && n !== version && n !== 'pearla-fonts');
            if (names.indexOf(version) < 0) add('warn', '程式快取', '還沒建立目前版本（' + version + '）的快取', '第一次開啟或剛更新時正常；若一直如此，離線將無法開啟。連線狀態下重開 App 一次即可。');
            else add('ok', '程式快取', '目前版本 ' + version + ' 已建立');
            if (old.length) add('warn', '舊版快取', '還留著：' + old.join('、'), '正常情況下重開 App 後會被自動清掉。若一直存在，代表 Service Worker 沒有更新。');
        }
        if (core.length && names.length) {
            const miss = [];
            for (const p of core) {
                try {
                    const u = new URL(p, document.baseURI).href;
                    if (!(await caches.match(u))) miss.push(p);
                } catch (e) { miss.push(p); }
            }
            if (!miss.length) add('ok', '離線所需檔案', '核心 ' + core.length + ' 個檔案都已快取，離線可開啟');
            else if (miss.indexOf('index.html') >= 0 || miss.indexOf('./') >= 0) add('bad', '離線所需檔案', '缺少首頁檔案；另有 ' + miss.length + ' 個未快取', '現在離線會打不開。請在有網路時重開 App 一次。');
            else add('warn', '離線所需檔案', '有 ' + miss.length + ' 個未快取：' + miss.slice(0, 5).join('、') + (miss.length > 5 ? ' 等' : ''), '離線時這些功能可能缺檔。連線狀態下重開 App 幾次通常就會補齊。');
        }
    }

    section('code', '四、程式與資源載入', async add => {
        /* 模組是否都載入 */
        const M = [
            ['splash.js', () => typeof window.PearlaSplash], ['01-core', () => typeof esc], ['02-views', () => typeof KITCHEN_RECIPES],
            ['02b-contact-guide', () => typeof CX_LIST], ['03-cards', () => typeof parseCardLines], ['04-reply', () => typeof patMsg],
            ['05-calendar', () => typeof calInit], ['06-inspiration', () => typeof inspOpen], ['07-meihua', () => typeof MH],
            ['08-tools', () => typeof acUnl], ['09-moments', () => typeof momOpen], ['10-answerbook', () => typeof abOpen],
            ['11-events', () => typeof pokeSend], ['12-chat-extras', () => typeof avLoad], ['12b-chat-export', () => typeof xOn],
            ['13-mailbox', () => typeof ltime], ['14-ui-extras', () => typeof reminderTick], ['15-boot', () => typeof window.preloadArt],
            ['anniversary.js', () => typeof window.AN], ['doodle.js', () => typeof window.DD], ['data-usage.js', () => typeof window.LP],
            ['profile.js', () => typeof window.PF]
        ];
        const lost = [];
        M.forEach(x => { let t = 'undefined'; try { t = x[1](); } catch (e) { } if (t === 'undefined') lost.push(x[0]); });
        if (!lost.length) add('ok', '程式模組', '全部 ' + M.length + ' 個都已載入');
        else add('bad', '程式模組', '沒有載入：' + lost.join('、'), '通常是更新途中新舊檔案混在一起，或某個檔案下載失敗。連線狀態下完全關閉 App 重開；仍不行就清除網站資料前先備份。');
        /* 樣式表 */
        const links = [...document.querySelectorAll('link[rel="stylesheet"]')];
        const failed = links.filter(l => !l.sheet).map(l => (l.getAttribute('href') || '').replace(/\?.*$/, ''));
        const failCore = failed.filter(h => !/fonts\.googleapis/.test(h)), failGF = failed.filter(h => /fonts\.googleapis/.test(h));
        if (!failCore.length) add('ok', '樣式表', '本站 ' + (links.length - failGF.length) + ' 個樣式表都已載入');
        else add('bad', '樣式表', '沒有載入：' + failCore.join('、'), '畫面樣式會缺一塊。連線狀態下重開 App。');
        if (failGF.length) add('info', 'Google 字體樣式表', '沒有載入（離線或網路擋住了）', '只影響少數字體，其他功能不受影響。');
        /* 字體 */
        try {
            if (document.fonts) {
                const all = [...document.fonts]; const err = all.filter(f => f.status === 'error').map(f => f.family.replace(/"/g, ''));
                const ok = all.filter(f => f.status === 'loaded').length;
                if (err.length) add('warn', '字體載入', '載入失敗：' + [...new Set(err)].join('、'), '到「設置→美化」換回預設字體，或在有網路時重新選用。');
                else add('ok', '字體載入', (document.fonts.status === 'loading' ? '載入中' : '已完成') + '；已載入 ' + ok + ' 個字體檔');
            }
            if (window.caches) {
                const has = await caches.has('pearla-fonts');
                if (has) { const c = await caches.open('pearla-fonts'); const ks = await c.keys(); add('info', '已下載的內建字體', ks.length ? ks.map(k => decodeURIComponent(new URL(k.url).pathname.split('/').pop())).join('、') : '沒有'); }
            }
        } catch (e) { }
        /* 圖片資源 */
        try {
            const names = ['anniversary', 'answer-book', 'daily', 'data', 'doodle', 'files', 'friends', 'gift-cabinet', 'group-chat', 'inspiration', 'kitchen', 'mailbox', 'mall', 'memo-card', 'period', 'plum-divination', 'records', 'study-progress', 'tomato-timer', 'tracking'];
            const urls = [];
            if (typeof AS === 'function') names.forEach(n => { try { urls.push(AS(n)); } catch (e) { } });
            document.querySelectorAll('.tabs .tab img').forEach(i => urls.push(i.getAttribute('src')));
            const uniq = [...new Set(urls.filter(Boolean))];
            const bad = [];
            await Promise.all(uniq.map(u => new Promise(res => {
                const im = new Image(); let done = false; const fin = ok => { if (done) return; done = true; if (!ok) bad.push(u.split('/').slice(-2).join('/')); res(); };
                im.onload = () => fin(im.naturalWidth > 0); im.onerror = () => fin(false); setTimeout(() => fin(false), 8000); im.src = u;
            })));
            if (!uniq.length) add('info', '主題圖片', '沒有可檢查的圖片');
            else if (!bad.length) add('ok', '主題圖片', '目前主題的 ' + uniq.length + ' 張圖片都能正常載入');
            else add(bad.length === uniq.length ? 'bad' : 'warn', '主題圖片', bad.length + ' 張載入失敗：' + bad.slice(0, 6).join('、') + (bad.length > 6 ? ' 等' : ''), '離線且從未快取過，或檔案不存在。連線狀態下開啟一次該主題即可補齊。');
        } catch (e) { add('warn', '主題圖片', '檢查失敗：' + (e && e.message || e)); }
        /* 提示音檔 */
        try {
            const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
            const r = await fetch('assets/shared/pearla-writing-sound-from-video.wav', { method: 'HEAD', signal: ctl.signal }); clearTimeout(t);
            add(r.ok ? 'ok' : 'warn', '提示音檔', r.ok ? '可取得' : 'HTTP ' + r.status, r.ok ? '' : '信件書寫音效會沒有聲音。');
        } catch (e) { add('info', '提示音檔', '無法確認（' + (e && (e.name === 'AbortError' ? '逾時' : e.message) || e) + '）；離線時這很正常'); }
        /* Service Worker */
        try {
            if ('serviceWorker' in navigator) {
                const reg = await tmo(navigator.serviceWorker.getRegistration(), 5000, '查詢 Service Worker');
                if (!reg) {
                    if (window.isSecureContext) add('warn', 'Service Worker', '尚未註冊', '離線將無法使用。連線狀態下重開 App 一次，通常就會註冊。');
                    else add('info', 'Service Worker', '非 https，不會註冊');
                } else {
                    const act = reg.active ? reg.active.state : '無';
                    add(reg.active ? 'ok' : 'warn', 'Service Worker', '已註冊；狀態：' + act + '；' + (navigator.serviceWorker.controller ? '已接管本頁' : '尚未接管本頁（第一次安裝後，重開 App 才會接管）'));
                    if (reg.waiting) add('warn', 'Service Worker 更新', '有新版本正在等待啟用', '完全關閉 App 再開啟即可套用。');
                    if (reg.installing) add('info', 'Service Worker 更新', '新版本正在安裝中');
                }
            }
        } catch (e) { add('info', 'Service Worker', '無法查詢：' + (e && e.message || e)); }
        /* 效能 */
        try {
            const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
            if (nav && nav.loadEventEnd > 0) { const ms = Math.round(nav.loadEventEnd); add(ms > 8000 ? 'warn' : 'info', '頁面載入耗時', '約 ' + (ms / 1000).toFixed(1) + ' 秒', ms > 8000 ? '偏慢，可能是網路慢或首次下載大量檔案（字體很大）。' : ''); }
        } catch (e) { }
        const dom = document.getElementsByTagName('*').length;
        add(dom > TH.domWarn ? 'warn' : 'ok', '畫面元素數量', dom + ' 個', dom > TH.domWarn ? '偏多，可能是聊天室訊息很多；捲動或切換會變卡時，可考慮匯出並清理舊訊息。' : '');
        if (performance.memory) add('info', 'JS 記憶體', fmtB(performance.memory.usedJSHeapSize) + ' ／ 上限 ' + fmtB(performance.memory.jsHeapSizeLimit));
        /* 錯誤紀錄 */
        if (!ERRS.length) add('ok', '本次開啟後的錯誤', '沒有任何 JS 錯誤或資源載入失敗');
        else {
            add('warn', '本次開啟後的錯誤', '共 ' + ERRS.length + ' 筆（最近的在最下面）', '把「複製報告」貼給我，我可以直接看是哪一行出的問題。');
            ERRS.slice(-8).forEach(e => add('info', fmtT(e.t) + ' ' + e.k, e.m + (e.s ? '（' + e.s + '）' : '')));
        }
    });

    section('data', '五、資料內容完整性', async add => {
        const s = getS();
        if (!s) { add('bad', '資料', '程式還沒載入資料'); return; }
        const R = raw(s);
        const cons = Array.isArray(R.contacts) ? R.contacts : null;
        if (!cons || !cons.length) { add('bad', '聯絡人', cons ? '一位聯絡人都沒有' : '資料格式不對（contacts 不是陣列）', '請回報，並先用「備份與還原」留存。'); return; }
        const ids = cons.map(c => c && c.id), idSet = new Set(ids);
        const badC = cons.filter(c => !c || !c.id || typeof c.name !== 'string').length;
        const dupC = ids.length - idSet.size;
        if (!badC && !dupC) add('ok', '聯絡人', cons.length + ' 位，編號與名稱都正常');
        else add('bad', '聯絡人', (badC ? badC + ' 位缺少編號或名稱；' : '') + (dupC ? dupC + ' 個編號重複' : ''), '編號重複會讓訊息與設置混在一起，請回報。');
        if (idSet.has(R.cur)) add('ok', '目前聯絡人', '指向有效的聯絡人');
        else add('warn', '目前聯絡人', '指向的聯絡人不存在', '程式會自動改用第一位，通常不用處理。');
        /* 訊息 */
        const msgs = isObj(R.msgs) ? R.msgs : {};
        let total = 0, orphanKeys = 0, orphanMsgs = 0, badM = 0, dupM = 0, future = 0, nonArr = 0, maxT = 0;
        const now = Date.now();
        for (const cid in msgs) {
            const a = msgs[cid];
            if (!Array.isArray(a)) { nonArr++; continue; }
            total += a.length;
            if (!idSet.has(cid)) { orphanKeys++; orphanMsgs += a.length; }
            const seen = new Set();
            for (let i = 0; i < a.length; i++) {
                const m = a[i];
                if (!m || typeof m !== 'object' || !m.id || !isFinite(m.t) || typeof m.f !== 'string' || !m.f) { badM++; continue; }
                if (seen.has(m.id)) dupM++; else seen.add(m.id);
                if (m.t > maxT) maxT = m.t;
                if (m.t > now + 600000) future++;
            }
        }
        add('info', '訊息總數', total + ' 則');
        if (nonArr) add('bad', '訊息格式', nonArr + ' 個聊天室的訊息不是陣列', '請回報。');
        if (badM) add('warn', '訊息內容', badM + ' 則缺少編號、時間或發送者', '這些訊息可能顯示不出來或排序怪異。');
        else add('ok', '訊息內容', '每則訊息的編號、時間、發送者都正常');
        if (dupM) add('warn', '訊息編號', dupM + ' 則編號重複', '可能造成引用、刪除時操作到別則訊息。');
        else add('ok', '訊息編號', '沒有重複');
        if (orphanKeys) add('warn', '孤立的聊天紀錄', orphanKeys + ' 個已不存在的聯絡人還留著 ' + orphanMsgs + ' 則訊息', '不影響使用，只是佔空間。');
        else add('ok', '孤立的聊天紀錄', '沒有');
        if (future) add('warn', '訊息時間', future + ' 則的時間在「未來」（最晚 ' + fmtT(maxT) + '）', '手機時鐘可能曾被調快，會影響每日留言、學習進度等排程。請確認系統時間是「自動設定」。');
        else add('ok', '訊息時間', '沒有未來時間的訊息');
        /* 字卡與分類 */
        const cats = Array.isArray(R.cats) ? R.cats : [], cards = Array.isArray(R.cards) ? R.cards : [];
        const catIds = new Set(cats.map(c => c && c.id));
        const orphanCards = cards.filter(k => !k || !catIds.has(k.cat)).length;
        const emptyCards = cards.filter(k => k && !k.text && !k.img).length;
        const dupCards = cards.length - new Set(cards.map(k => k && k.id)).size;
        const dupCats = cats.length - catIds.size;
        add('info', '字卡／分類', cards.length + ' 張字卡，' + cats.length + ' 個分類');
        if (orphanCards) add('warn', '孤立的字卡', orphanCards + ' 張找不到所屬分類', '這些字卡不會被抽到。');
        else add('ok', '字卡所屬分類', '都正常');
        if (emptyCards) add('warn', '空字卡', emptyCards + ' 張既沒有文字也沒有圖片', '可以刪除。');
        if (dupCards || dupCats) add('warn', '重複編號', (dupCards ? dupCards + ' 張字卡；' : '') + (dupCats ? dupCats + ' 個分類' : ''), '可能造成編輯或刪除時操作到別筆。');
        const ownBad = cats.filter(c => c && c.sc === 'e' && c.own && !idSet.has(c.own)).length;
        if (ownBad) add('info', '專屬分類', ownBad + ' 個分類屬於已不存在的聯絡人', '不影響使用。');
        /* 設置值（一律讀原始物件，不經代理） */
        try {
            const set = raw(R.set), prob = [];
            if (isObj(set)) {
                for (const k in set) {
                    if (!/min$/i.test(k)) continue;
                    const k2 = k.replace(/min$/, 'max').replace(/Min$/, 'Max');
                    if (k2 === k || !(k2 in set)) continue;
                    const a = +set[k], b = +set[k2];
                    if (isFinite(a) && isFinite(b) && a > b) prob.push(k + '（' + a + '）> ' + k2 + '（' + b + '）');
                }
                if (prob.length) add('warn', '設置範圍', '「最小值」大於「最大值」：' + prob.slice(0, 5).join('、'), '到對應的設置頁把最小／最大值調回合理範圍，否則抽取時間可能異常。');
                else add('ok', '設置範圍', '所有「最小～最大」設置都合理');
            } else add('bad', '設置', '設置資料遺失或格式不對');
            const cset = R.cset; if (isObj(cset)) { const miss = Object.keys(cset).filter(id => !idSet.has(id)).length; if (miss) add('info', '孤立的專屬設置', miss + ' 組屬於已不存在的聯絡人', '不影響使用。'); }
        } catch (e) { add('warn', '設置檢查', '檢查失敗：' + (e && e.message || e)); }
        /* 排程佇列 */
        try {
            const qs = ['ipend', 'lpend', 'rems', 'mcm', 'mrep'], rows = [], oddFar = [], oddBad = [];
            let overdue = 0;
            qs.forEach(k => {
                const a = R[k]; if (!Array.isArray(a)) return;
                let n = 0;
                a.forEach(x => {
                    if (!x || typeof x !== 'object' || !('due' in x)) return; n++;
                    if (!isFinite(x.due)) oddBad.push(k);
                    else if (x.due > now + 400 * 86400000) oddFar.push(k);
                    else if (x.due < now - 86400000) overdue++;
                });
                if (n) rows.push(k + ' ' + n);
            });
            if (oddBad.length) add('bad', '排程時間', oddBad.length + ' 筆的到期時間不是有效數字', '這些排程永遠不會觸發。請回報。');
            if (oddFar.length) add('warn', '排程時間', oddFar.length + ' 筆排在一年以後', '很可能是手機時鐘曾被調錯。請確認系統時間是「自動設定」。');
            if (overdue) add('info', '逾期的排程', overdue + ' 筆已過期超過一天', '關閉 App 期間到期的項目，開啟後通常會自動補跑；若一直不動，請回報。');
            if (!oddBad.length && !oddFar.length && !overdue) add('ok', '排程佇列', rows.length ? '正常（' + rows.join('、') + '）' : '目前沒有待處理的排程');
        } catch (e) { add('warn', '排程檢查', '檢查失敗：' + (e && e.message || e)); }
        /* 每日留言／學習進度的時間紀錄 */
        try {
            const d = R.dailies; if (isObj(d)) {
                const dk = typeof localDayKey === 'function' ? localDayKey(new Date()) : '';
                const bad = Object.keys(d).filter(id => d[id] && typeof d[id] === 'object' && d[id].day && dk && String(d[id].day) > dk).length;
                if (bad) add('warn', '每日留言日期', bad + ' 位聯絡人的留言日期比今天還晚', '手機日期可能曾被調快；今天的每日留言可能不會再抽取。');
                else add('ok', '每日留言日期', '正常');
            }
        } catch (e) { }
    });

    /* ── 四、執行與畫面 ── */
    async function run() {
        if (st.running) return;
        st.running = true; st.done = 0; st.total = SECTIONS.length; st.res = null; st.step = '';
        paint();
        const res = [];
        for (const sec of SECTIONS) {
            st.step = sec.title; paint();
            const items = [];
            const add = (s, n, d, h) => items.push({ s: s, n: n, d: d || '', h: h || '' });
            try { await tmo(sec.fn(add), 45000, sec.title); }
            catch (e) { add('warn', '這一區的檢查沒有跑完', (e && e.message) || String(e), '其餘區塊不受影響。可以再按一次診斷。'); }
            res.push({ id: sec.id, title: sec.title, items: items });
            st.done++;
            await sleep(30);
        }
        st.res = res; st.at = Date.now(); st.running = false; st.step = '';
        paint();
    }
    const count = res => { const c = { bad: 0, warn: 0, ok: 0, info: 0 }; (res || []).forEach(s => s.items.forEach(i => c[i.s]++)); return c; };
    const ICON = { ok: '✓', warn: '!', bad: '✕', info: 'i' };
    function resultHtml() {
        if (st.running) return '<div class="card set dg-prog"><b>診斷中⋯</b><div class="hint" style="margin:6px 0 0">' + ES(st.step) + '（' + st.done + '／' + st.total + '）</div><div class="dg-bar"><i style="width:' + Math.round(st.done / Math.max(1, st.total) * 100) + '%"></i></div></div>';
        if (!st.res) return '<p class="hint dg-empty">按下「開始診斷」，會依序檢查環境、儲存、檔案載入與資料內容。檢查過程只讀取，不會改動你的資料。</p>';
        const c = count(st.res), probs = [];
        st.res.forEach(s => s.items.forEach(i => { if (i.s === 'bad' || i.s === 'warn') probs.push(i); }));
        const head = c.bad ? '發現 ' + c.bad + ' 個需要處理的問題' + (c.warn ? '、' + c.warn + ' 個提醒' : '') : c.warn ? '沒有嚴重問題，有 ' + c.warn + ' 個提醒' : '一切正常';
        const cls = c.bad ? 'bad' : c.warn ? 'warn' : 'ok';
        let h = '<div class="card set dg-sum ' + cls + '"><div class="dg-sum-t"><span class="dg-ic ' + cls + '">' + ICON[cls] + '</span>' + head + '</div><div class="hint" style="margin:6px 0 0">完成於 ' + fmtT(st.at) + '；✓ ' + c.ok + '　! ' + c.warn + '　✕ ' + c.bad + '　i ' + c.info + '</div>';
        if (probs.length) h += '<ul class="dg-probs">' + probs.map(p => '<li class="' + p.s + '"><span class="dg-ic ' + p.s + '">' + ICON[p.s] + '</span>' + ES(p.n) + '</li>').join('') + '</ul>';
        h += '</div>';
        st.res.forEach(s => {
            h += '<div class="card set dg-sec"><h3>' + ES(s.title) + '</h3>' + s.items.map(i =>
                '<div class="dg-it ' + i.s + '"><span class="dg-ic ' + i.s + '">' + ICON[i.s] + '</span><div class="dg-tx"><b>' + ES(i.n) + '</b>' + (i.d ? '<div class="dg-d">' + ES(i.d) + '</div>' : '') + (i.h ? '<div class="dg-h">' + ES(i.h) + '</div>' : '') + '</div></div>').join('') + '</div>';
        });
        return h;
    }
    function paint() {
        const o = document.getElementById('dg-out'); if (o) o.innerHTML = resultHtml();
        const b = document.getElementById('dg-run'); if (b) { b.disabled = st.running; b.textContent = st.running ? '診斷中⋯' : (st.res ? '重新診斷' : '開始診斷'); }
        const c = document.getElementById('dg-copy'); if (c) c.style.display = st.res ? '' : 'none';
    }
    function page() {
        return '<div class="card set dg-top"><p class="hint" style="margin:0 0 10px;line-height:1.7">檢查這個 App 的執行環境、資料儲存、檔案載入與資料內容是否正常。全程只讀取，不會改動或刪除你的資料。遇到問題時，按「複製報告」貼給我，我就能知道是哪裡出了問題。報告只含數量與狀態，不含訊息內容。</p>'
            + '<div class="dg-btns"><button class="btn s" id="dg-run" data-a="dg:run"' + (st.running ? ' disabled' : '') + '>' + (st.running ? '診斷中⋯' : (st.res ? '重新診斷' : '開始診斷')) + '</button>'
            + '<button class="btn" id="dg-copy" data-a="dg:copy" style="' + (st.res ? '' : 'display:none') + '">複製報告</button>'
            + '<button class="btn" data-a="dg:mic">測試麥克風</button></div></div><div id="dg-out">' + resultHtml() + '</div>';
    }
    function report() {
        const L = [];
        L.push('Pearla 診斷報告　' + fmtT(st.at));
        L.push('網址：' + location.origin + location.pathname.replace(/[^/]*$/, ''));
        L.push('瀏覽器：' + (navigator.userAgent || ''));
        const c = count(st.res); L.push('結果：✕ ' + c.bad + '　! ' + c.warn + '　✓ ' + c.ok);
        st.res.forEach(s => {
            L.push(''); L.push('■ ' + s.title);
            s.items.forEach(i => { L.push('[' + ICON[i.s] + '] ' + i.n + (i.d ? '：' + i.d : '') + (i.h && (i.s === 'bad' || i.s === 'warn') ? '　→ ' + i.h : '')); });
        });
        return L.join('\n');
    }
    function copyText(t) {
        const ok = () => { try { toast('已複製診斷報告', 2200); } catch (e) { } };
        const fb = () => {
            try {
                const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:16px';
                document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, t.length);
                const r = document.execCommand && document.execCommand('copy'); document.body.removeChild(ta);
                if (r) ok(); else showManual(t);
            } catch (e) { showManual(t); }
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fb); else fb();
    }
    function showManual(t) {
        try { sheet('診斷報告', '<p class="hint" style="margin:0 0 8px">自動複製失敗，請長按下面的文字全選後複製。</p><textarea readonly style="width:100%;height:46vh;font-size:16px">' + ES(t) + '</textarea><button class="btn" data-a="close">關閉</button>'); } catch (e) { }
    }
    /* 只處理自己的按鈕；比照「學習進度」用捕獲階段，避免被其他點擊處理攔截 */
    document.addEventListener('click', e => {
        const t = e.target; if (!t || !t.closest) return;
        const A = t.closest('[data-a="dg:run"],[data-a="dg:copy"],[data-a="dg:mic"]'); if (!A) return;
        e.stopPropagation(); e.preventDefault();
        const a = A.dataset.a;
        if (a === 'dg:run') run();
        else if (a === 'dg:copy') { if (st.res) copyText(report()); }
        else if (a === 'dg:mic') { try { if (typeof micTest === 'function') micTest(); else toast('這個版本沒有麥克風測試', 2500); } catch (err) { toast('無法開啟麥克風測試', 2500); } }
    }, true);
})();
