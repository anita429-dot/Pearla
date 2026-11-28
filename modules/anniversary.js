(function () {
    'use strict';
    const AN = window.AN = { open: false, cid: '', modal: null, confirm: null, view: vAn, list: calcAll };
    const ICONS = {
        heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
        cake: '<path d="M4 20h16M5 20v-6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6M5 16.5c2 1.6 3.5-1.6 7 0s5 1.6 7 0M12 13V9.5"/><path d="M12 7.8c-.9-.9-.9-1.8 0-2.8.9 1 .9 1.9 0 2.8z"/>',
        flower: '<circle cx="12" cy="12" r="2.2"/><path d="M12 9.8C10.2 7.6 10.6 5.2 12 3.8c1.4 1.4 1.8 3.8 0 6zM12 14.2c1.8 2.2 1.4 4.6 0 6-1.4-1.4-1.8-3.8 0-6zM9.8 12c-2.2 1.8-4.6 1.4-6 0 1.4-1.4 3.8-1.8 6 0zM14.2 12c2.2-1.8 4.6-1.4 6 0-1.4 1.4-3.8 1.8-6 0z"/>',
        sparkle: '<path d="M11 5l1.8 5.2L18 12l-5.2 1.8L11 19l-1.8-5.2L4 12l5.2-1.8z"/><path d="M18.5 3v3.5M16.75 4.75h3.5"/>',
        gift: '<rect x="4" y="9" width="16" height="4" rx="1"/><path d="M5.5 13v7h13v-7M12 9v11"/><path d="M12 9C9.6 9 8 8 8 6.6S9.4 4.6 10.6 5.4C11.6 6 12 7.6 12 9zM12 9c2.4 0 4-1 4-2.4s-1.4-2-2.6-1.2C12.4 6 12 7.6 12 9z"/>',
        moon: '<path d="M19 14.6A7.6 7.6 0 0 1 9.4 5a7.6 7.6 0 1 0 9.6 9.6z"/>',
        sun: '<circle cx="12" cy="12" r="3.6"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.5 1.5M16.5 16.5L18 18M6 18l1.5-1.5M16.5 7.5L18 6"/>',
        home: '<path d="M4 11l8-6.5 8 6.5M6 9.8V20h12V9.8M10 20v-5h4v5"/>',
        plane: '<path d="M20.5 3.5L3.5 11l6.2 2.3L12 20z"/><path d="M9.7 13.3l10.8-9.8"/>',
        calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'
    };
    const KEYS = Object.keys(ICONS);
    const LEGACY = { '💖': 'heart', '🎂': 'cake', '🌸': 'flower', '✨': 'sparkle', '🎁': 'gift', '🌙': 'moon', '☀️': 'sun', '🏠': 'home', '✈️': 'plane', '📅': 'calendar' };
    const ik = v => ICONS[v] ? v : (LEGACY[v] || 'heart');
    const svg = k => '<svg class="an-ic" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[ik(k)] + '</svg>';
    const PLUS = '<svg class="an-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
    /* ---------- 資料 ---------- */
    function root() { if (!S.ann || typeof S.ann !== 'object')
        S.ann = {}; if (!Array.isArray(S.ann.list))
        S.ann.list = []; return S.ann; }
    const contacts = () => Array.isArray(S.contacts) ? S.contacts : [];
    const cname = id => { const c = contacts().find(x => x.id === id); return c ? c.name : ''; };
    function R(keep) { const v = document.querySelector('#v'), y = v ? v.scrollTop : 0; render(); if (keep && v)
        v.scrollTop = y; }
    const top0 = () => { const v = document.querySelector('#v'); if (v)
        v.scrollTop = 0; };
    /* ---------- 日期計算（一律用本地日期，避免時區與夏令時間誤差） ---------- */
    const pad = n => String(n).padStart(2, '0');
    const U = (y, m, d) => Date.UTC(y, m - 1, d), DAY = 86400000;
    const leap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const occIn = (y, m, d) => [y, m, (m === 2 && d === 29 && !leap(y)) ? 28 : d]; // 2/29 在平年算 2/28
    function parse(s) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? [+m[1], +m[2], +m[3]] : null; }
    const todayYMD = () => { const d = new Date(); return [d.getFullYear(), d.getMonth() + 1, d.getDate()]; };
    const todayStr = () => { const t = todayYMD(); return t[0] + '-' + pad(t[1]) + '-' + pad(t[2]); };
    function calc(a) {
        const p = parse(a.date);
        if (!p)
            return null;
        const t = todayYMD(), T = U(...t), S0 = U(...p);
        let next = p, n = 0;
        if (a.repeat !== false) {
            let o = occIn(t[0], p[1], p[2]);
            if (U(...o) < T)
                o = occIn(t[0] + 1, p[1], p[2]);
            if (U(...o) < S0)
                o = p; // 起始日在未來：第一次就是起始日
            next = o;
            n = o[0] - p[0];
        }
        const days = Math.round((U(...next) - T) / DAY), since = Math.round((T - S0) / DAY);
        return { a, next, days, since, n, started: since >= 0, past: a.repeat === false && days < 0 };
    }
    function calcAll(cid) {
        return root().list.filter(a => !cid || a.cid === cid).map(calc).filter(Boolean);
    }
    const fmtFull = p => p[0] + '年' + p[1] + '月' + p[2] + '日';
    const badge = c => c.days === 0 ? '今天' : c.days > 0 ? c.days + ' 天後' : '已過 ' + (-c.days) + ' 天';
    function sub(c) {
        if (!c.started)
            return '尚未開始';
        if (c.a.repeat === false)
            return '已經 ' + c.since + ' 天';
        return '已經 ' + c.since + ' 天' + (c.n > 0 ? ' · ' + (c.days === 0 ? '今天是' : '') + '第 ' + c.n + ' 週年' : '');
    }
    /* ---------- 畫面 ---------- */
    function vAn() {
        const head = '<div class="ph2"><button class="ib" data-a="an:back">‹</button><h1>紀念日</h1></div>';
        const all = root().list;
        const used = contacts().filter(c => all.some(a => a.cid === c.id));
        if (AN.cid && !used.some(c => c.id === AN.cid))
            AN.cid = '';
        const cats = used.length ? '<div class="an-cats">' + [['', '全部']].concat(used.map(c => [c.id, c.name])).map(([id, n]) => '<button type="button" class="chip an-chip' + (AN.cid === id ? ' on' : '') + '" data-a="an:cat" data-i="' + esc(id) + '">' + esc(n) + '</button>').join('') + '</div>' : '';
        const cs = calcAll(AN.cid);
        const up = cs.filter(c => !c.past).sort((a, b) => a.days - b.days), past = cs.filter(c => c.past).sort((a, b) => b.days - a.days);
        let body = '<button type="button" class="btn s an-add" data-a="an:add">' + PLUS + ' 添加紀念日</button>';
        if (!cs.length)
            body += '<div class="empty">還沒有紀念日。<br>按上方「添加紀念日」，選擇日期並取個名字吧。</div>';
        else {
            if (up.length)
                body += hero(up[0]) + (up.length > 1 ? '<div class="an-sec">接下來</div>' + up.slice(1).map(item).join('') : '');
            if (past.length)
                body += '<div class="an-sec">已過去</div>' + past.map(item).join('');
        }
        return head + cats + body + modalHtml() + confirmHtml();
    }
    function hero(c) {
        const a = c.a, who = cname(a.cid);
        return '<div class="card an-hero" data-a="an:edit" data-i="' + esc(a.id) + '"><div class="an-hl">最近的紀念日</div>'
            + '<div class="an-hn"><span class="an-emo">' + svg(a.emoji) + '</span>' + esc(a.name) + '</div>'
            + (c.days === 0 ? '<div class="an-big hot">就是今天！</div>' : '<div class="an-big">還有 <b>' + c.days + '</b> 天</div>')
            + '<div class="an-hs">' + esc(fmtFull(c.next)) + (a.repeat === false ? '' : ' · 每年') + (who ? ' · ' + esc(who) : '') + '</div>'
            + '<div class="an-hs">' + esc(sub(c)) + '</div></div>';
    }
    function item(c) {
        const a = c.a, who = cname(a.cid), p = parse(a.date);
        return '<div class="an-item" data-a="an:edit" data-i="' + esc(a.id) + '"><span class="an-emo">' + svg(a.emoji) + '</span>'
            + '<div class="an-mid"><div class="an-name">' + esc(a.name) + '</div><div class="an-meta">' + esc(a.repeat === false ? fmtFull(p) : '每年 ' + p[1] + '月' + p[2] + '日') + (who ? ' · ' + esc(who) : '') + '</div><div class="an-meta">' + esc(sub(c)) + '</div></div>'
            + '<span class="an-badge' + (c.days === 0 ? ' hot' : c.past ? ' past' : '') + '">' + badge(c) + '</span></div>';
    }
    /* 新增／編輯浮窗 */
    function modalHtml() {
        const m = AN.modal;
        if (!m)
            return '';
        return '<div class="an-ov"><div class="an-pop box" data-keep="1">'
            + '<h2 class="an-mt">' + (m.id ? '編輯紀念日' : '添加紀念日') + '</h2>'
            + '<label class="an-f"><span class="an-pl">紀念日名稱</span><input id="anname" data-ani="name" value="' + esc(m.name) + '" placeholder="例如：在一起、第一次見面、生日" maxlength="30" autocomplete="off"></label>'
            + '<label class="an-f"><span class="an-pl">日期</span><input id="andate" type="date" data-ani="date" value="' + esc(m.date) + '"></label>'
            + '<div class="an-f an-sw"><span>每年重複</span><button type="button" class="sw' + (m.repeat ? ' on' : '') + '" data-a="an:rep" aria-label="每年重複"></button></div>'
            + '<div class="an-f"><span class="an-pl">圖示</span><div class="an-emojis" id="anemojis">' + KEYS.map(k => '<button type="button" class="an-e' + (ik(m.emoji) === k ? ' on' : '') + '" data-a="an:emo" data-i="' + k + '" aria-label="' + k + '">' + svg(k) + '</button>').join('') + '</div></div>'
            + (contacts().length ? '<div class="an-f"><span class="an-pl">聯絡人（選填）</span><div class="an-pick" id="anpick">' + [['', '不指定']].concat(contacts().map(c => [c.id, c.name])).map(([id, n]) => '<button type="button" class="chip an-chip' + (m.cid === id ? ' on' : '') + '" data-a="an:who" data-i="' + esc(id) + '">' + esc(n) + '</button>').join('') + '</div></div>' : '')
            + '<label class="an-f"><span class="an-pl">備註（選填）</span><textarea id="annote" data-ani="note" rows="2" maxlength="200" placeholder="想記下的小事">' + esc(m.note) + '</textarea></label>'
            + '<div class="an-acts">' + (m.id ? '<button type="button" class="btn d" data-a="an:mdel">刪除</button>' : '') + '<span class="grow"></span><button type="button" class="btn" data-a="an:mcancel">取消</button><button type="button" class="btn s" data-a="an:msave">' + (m.id ? '儲存' : '添加') + '</button></div>'
            + '</div></div>';
    }
    function confirmHtml() {
        if (!AN.confirm)
            return '';
        return '<div class="an-ov an-cf"><div class="box an-cfbox" data-keep="1"><h2 style="margin-bottom:6px">是否確認刪除？</h2><p class="hint" style="margin:0 0 10px">這個紀念日刪除後無法復原。</p><div class="an-cfa"><button type="button" class="btn" data-a="an:cfno">取消</button><button type="button" class="btn d" data-a="an:cfyes">確認刪除</button></div></div></div>';
    }
    /* ---------- 點擊 ---------- */
    function act(a, i, el) {
        const L = root().list;
        switch (a) {
            case 'an':
                AN.open = true;
                AN.cid = '';
                AN.modal = null;
                AN.confirm = null;
                render();
                top0();
                return true;
            case 'an:back':
                if (AN.confirm)
                    AN.confirm = null;
                else if (AN.modal)
                    AN.modal = null;
                else
                    AN.open = false;
                render();
                top0();
                return true;
            case 'an:cat':
                AN.cid = i;
                R(true);
                return true;
            case 'an:add':
                AN.modal = { id: null, name: '', date: todayStr(), repeat: true, emoji: 'heart', cid: AN.cid || '', note: '' };
                R(true);
                setTimeout(() => { const n = document.querySelector('#anname'); if (n)
                    n.focus(); }, 0);
                return true;
            case 'an:edit': {
                const x = L.find(v => v.id === i);
                if (!x)
                    return true;
                AN.modal = { id: x.id, name: x.name, date: x.date, repeat: x.repeat !== false, emoji: ik(x.emoji), cid: x.cid || '', note: x.note || '' };
                R(true);
                return true;
            }
            case 'an:rep':
                AN.modal.repeat = !AN.modal.repeat;
                el.classList.toggle('on', AN.modal.repeat);
                return true;
            case 'an:emo':
                AN.modal.emoji = i;
                document.querySelectorAll('#anemojis .an-e').forEach(b => b.classList.toggle('on', b.dataset.i === i));
                return true;
            case 'an:who':
                AN.modal.cid = i;
                document.querySelectorAll('#anpick .an-chip').forEach(b => b.classList.toggle('on', b.dataset.i === i));
                return true;
            case 'an:mcancel':
                AN.modal = null;
                R(true);
                return true;
            case 'an:msave': {
                const m = AN.modal, name = (m.name || '').trim();
                if (!name) {
                    toast('請輸入紀念日名稱');
                    const n = document.querySelector('#anname');
                    if (n)
                        n.focus();
                    return true;
                }
                if (!parse(m.date)) {
                    toast('請選擇日期');
                    return true;
                }
                const rec = { name, date: m.date, repeat: !!m.repeat, emoji: m.emoji, cid: m.cid || '', note: (m.note || '').trim() };
                if (m.id) {
                    const x = L.find(v => v.id === m.id);
                    if (x)
                        Object.assign(x, rec);
                }
                else
                    L.push(Object.assign({ id: uid(), t: Date.now() }, rec));
                AN.modal = null;
                save();
                R(true);
                return true;
            }
            case 'an:mdel':
                AN.confirm = true;
                R(true);
                return true;
            case 'an:cfno':
                AN.confirm = null;
                R(true);
                return true;
            case 'an:cfyes': {
                const id = AN.modal && AN.modal.id;
                AN.confirm = null;
                AN.modal = null;
                const k = L.findIndex(v => v.id === id);
                if (k >= 0)
                    L.splice(k, 1);
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
        if (AN.open && t.closest('[data-t]') && !t.closest('[data-a]')) {
            AN.open = false;
            AN.modal = null;
            AN.confirm = null;
            return;
        } // 切換底部分頁時離開
        const A = t.closest('[data-a="an"],[data-a^="an:"]');
        if (!A) {
            if (AN.open && AN.confirm && t.classList && t.classList.contains('an-cf')) {
                AN.confirm = null;
                R(true);
                return;
            }
            return;
        }
        if (act(A.dataset.a, A.dataset.i, A)) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, true);
    /* ---------- 輸入（只更新狀態，不重畫，避免輸入框失焦） ---------- */
    document.addEventListener('input', e => {
        const t = e.target;
        if (!t || !t.dataset || !AN.open || !AN.modal || !t.dataset.ani)
            return;
        AN.modal[t.dataset.ani] = t.value;
    });
    document.addEventListener('change', e => {
        const t = e.target;
        if (!t || !t.dataset || !AN.open || !AN.modal || !t.dataset.ani)
            return;
        AN.modal[t.dataset.ani] = t.value;
    });
    document.addEventListener('keydown', e => {
        if (AN.open && AN.modal && !AN.confirm && e.key === 'Enter' && e.target.id === 'anname') {
            e.preventDefault();
            const d = document.querySelector('#andate');
            if (d)
                d.focus();
        }
    });
})();
document.addEventListener('contextmenu', e => { if (e.target && e.target.closest && e.target.closest('img,svg,.av,.ti,.cal-big,.daily-message-trigger,[style*="url("]:not(#app):not(#v):not(html):not(body)'))
    e.preventDefault(); });
document.addEventListener('dragstart', e => { if (e.target && e.target.tagName === 'IMG')
    e.preventDefault(); });
/* 開關：點一下先看到圓點滑過去，約 0.2 秒後才真正套用（畫面重繪不會吃掉動畫）。不再支援拖曳。 */
(function () {
    const DELAY = 220;
    document.addEventListener('click', e => {
        const sw = e.target && e.target.closest && e.target.closest('.sw');
        if (!sw)
            return;
        if (sw.__swGo) {
            sw.__swGo = false;
            return;
        } // 延遲後重新送出的點擊：放行給原本的處理
        e.stopImmediatePropagation();
        e.preventDefault();
        if (sw.__swBusy)
            return; // 動畫中再點不重複觸發
        sw.__swBusy = true;
        sw.classList.toggle('on'); // 觸發 CSS 滑動
        setTimeout(() => {
            sw.__swBusy = false;
            if (!sw.isConnected)
                return;
            sw.__swGo = true;
            sw.click();
            sw.__swGo = false;
        }, DELAY);
    }, true);
})();
