/* 修正與新增：輸入框視覺換行、鍵盤避讓、引用訊息連點跳轉 */
(function () {
    'use strict';
    /* ── 1. 單行輸入框 → 自動增高、不插入換行的文字框 ── */
    var SKIP_ID = { cphex: 1, mh1: 1, mh2: 1, abn: 1, 'cal-me': 1, 'mn-emoji': 1, punt: 1 };
    var TEXTY = { text: 1, search: 1, tel: 1, url: 1, email: 1, '': 1 };
    var COPY = ['id', 'class', 'placeholder', 'maxlength', 'style', 'disabled', 'readonly', 'autocomplete', 'enterkeyhint', 'spellcheck', 'autocapitalize', 'aria-label', 'title', 'name'];
    function wanted(i) {
        var ty = (i.getAttribute('type') || '').toLowerCase();
        if (!TEXTY[ty])
            return false;
        if (i.id && SKIP_ID[i.id])
            return false;
        var im = (i.getAttribute('inputmode') || '').toLowerCase();
        if (im === 'numeric' || im === 'decimal' || im === 'tel')
            return false;
        if (i.hasAttribute('data-nosl') || i.hasAttribute('list'))
            return false;
        return true;
    }
    function fit(t, full) {
        if (!t || !t.isConnected)
            return;
        var len = t.value.length, w = t.clientWidth;
        /* 只是多打幾個字、而且還沒滿：不用重量（避免每個字都讓整個聊天室重排兩次） */
        if (!full && t._h && t._w === w && len >= (t._ll || 0) && t.scrollHeight <= t.clientHeight + 1) {
            t._ll = len;
            return;
        }
        if (!full && t._h && t._w === w && len >= (t._ll || 0) && t.scrollHeight > t.clientHeight + 1 && t._bw != null) {
            var g = t.scrollHeight + t._bw;
            t.style.height = g + 'px';
            t._h = g;
            t._ll = len;
            return;
        }
        t.style.height = 'auto';
        var h = t.scrollHeight;
        if (!h)
            return;
        var cs = getComputedStyle(t), bw = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
        t._bw = cs.boxSizing === 'border-box' ? bw : 0;
        h += t._bw;
        t.style.height = h + 'px';
        t._h = h;
        t._w = t.clientWidth;
        t._ll = len;
    }
    var fq = null, fqs = [];
    function fitSoon(t) { if (fqs.indexOf(t) < 0)
        fqs.push(t); if (fq)
        return; fq = requestAnimationFrame(function () { fq = null; var l = fqs; fqs = []; l.forEach(function (x) { fit(x); }); }); }
    /* 程式把 value 清空／改掉時（例如送出後 i.value=''）也要重新量高度 */
    try {
        var vd = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
        Object.defineProperty(HTMLTextAreaElement.prototype, 'value', { configurable: true, enumerable: vd.enumerable, get: vd.get, set: function (v) { vd.set.call(this, v); if (this.classList && this.classList.contains('sl')) {
                var s = this;
                fit(s, 1);
                requestAnimationFrame(function () { fit(s, 1); });
            } } });
    }
    catch (e) { }
    var ro = window.ResizeObserver ? new ResizeObserver(function (es) { es.forEach(function (e) { var t = e.target; if (t._w !== t.clientWidth)
        fitSoon(t); }); }) : null;
    function conv(i) {
        var t = document.createElement('textarea');
        COPY.forEach(function (a) { if (i.hasAttribute(a))
            t.setAttribute(a, i.getAttribute(a)); });
        Object.keys(i.dataset).forEach(function (k) { t.dataset[k] = i.dataset[k]; });
        t.rows = 1;
        t.classList.add('sl');
        t.value = (i.getAttribute('value') != null ? i.getAttribute('value') : i.value) || '';
        i.replaceWith(t);
        if (ro)
            ro.observe(t);
        requestAnimationFrame(function () { fit(t, 1); });
    }
    function sweep(root) {
        if (!root || !root.querySelectorAll)
            return;
        var l = root.querySelectorAll('input');
        for (var k = 0; k < l.length; k++)
            if (wanted(l[k]))
                conv(l[k]);
    }
    try {
        var d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
        Object.defineProperty(Element.prototype, 'innerHTML', { configurable: true, enumerable: d.enumerable, get: d.get, set: function (v) { d.set.call(this, v); if (typeof v === 'string' && v.indexOf('<input') > -1)
                sweep(this); } });
        var ia = Element.prototype.insertAdjacentHTML;
        Element.prototype.insertAdjacentHTML = function (p, h) { ia.call(this, p, h); if (typeof h === 'string' && h.indexOf('<input') > -1)
            sweep((p === 'beforebegin' || p === 'afterend') ? this.parentNode : this); };
        var od = Object.getOwnPropertyDescriptor(Element.prototype, 'outerHTML');
        Object.defineProperty(Element.prototype, 'outerHTML', { configurable: true, enumerable: od.enumerable, get: od.get, set: function (v) { var p = this.parentNode; od.set.call(this, v); if (p && typeof v === 'string' && v.indexOf('<input') > -1)
                sweep(p); } });
    }
    catch (e) { }
    document.addEventListener('DOMContentLoaded', function () { sweep(document.body); });
    document.addEventListener('input', function (e) {
        var t = e.target;
        if (!t || !t.classList || !t.classList.contains('sl'))
            return;
        if (t.id !== 'in' && /[\r\n]/.test(t.value)) {
            var p = t.selectionStart, v = t.value, n = v.replace(/[\r\n]+/g, '');
            t.value = n;
            try {
                t.setSelectionRange(Math.max(0, p - (v.length - n.length)), Math.max(0, p - (v.length - n.length)));
            }
            catch (x) { }
        }
        fitSoon(t);
    }, true);
    document.addEventListener('keydown', function (e) {
        var t = e.target;
        if (e.key === 'Enter' && !e.isComposing && t && t.classList && t.classList.contains('sl') && t.id !== 'in')
            e.preventDefault();
    });
    document.addEventListener('focusin', function (e) { var t = e.target; if (t && t.classList && t.classList.contains('sl'))
        setTimeout(function () { fit(t, 1); }, 0); });
    addEventListener('resize', function () { document.querySelectorAll('textarea.sl').forEach(function (t) { fit(t, 1); }); });
    /* ── 2. 鍵盤避讓：輸入框在鍵盤下面時自動移到鍵盤上面 ── */
    var vv = window.visualViewport, root = document.documentElement, chatFocus = false;
    function kbVars() {
        if (!vv)
            return;
        var full = Math.max(0, innerHeight - vv.height), kb = Math.max(0, full - vv.offsetTop);
        var open = full > 100 && (vv.scale || 1) < 1.05;
        var ae = document.activeElement, inF = !!(ae && ae.closest && ae.closest('#f')), kc = inF && (open || chatFocus);
        if (kc && !open) {
            root.style.setProperty('--vvt', (vv.offsetTop || 0) + 'px');
            root.style.setProperty('--vvh', vv.height + 'px');
        }
        if (root.classList.contains('kb-open') !== open)
            root.classList.toggle('kb-open', open);
        if (root.classList.contains('kb-chat') !== kc)
            root.classList.toggle('kb-chat', kc);
        var key = open ? Math.round(vv.offsetTop) + '|' + Math.round(vv.height) + '|' + Math.round(kb) : (kc ? 'c' : '0');
        if (key === kbVars._k)
            return;
        kbVars._k = key;
        if (open) {
            root.style.setProperty('--vvt', vv.offsetTop + 'px');
            root.style.setProperty('--vvh', vv.height + 'px');
            root.style.setProperty('--kb', kb + 'px');
        }
        else {
            if (!kc) {
                root.style.removeProperty('--vvt');
                root.style.removeProperty('--vvh');
            }
            root.style.setProperty('--kb', '0px');
        }
    }
    function isField(el) { return !!(el && el.matches && el.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]):not([type=button]),textarea,[contenteditable=""],[contenteditable="true"]')); }
    function reveal() {
        var el = document.activeElement;
        if (!isField(el) || !vv)
            return;
        var r = el.getBoundingClientRect(), bottom = vv.offsetTop + vv.height - 12, top = vv.offsetTop + 8;
        var d = 0;
        if (r.bottom > bottom)
            d = r.bottom - bottom;
        else if (r.top < top && r.height < vv.height)
            d = r.top - top;
        if (!d)
            return;
        var p = el.parentElement;
        while (p && p !== document.body && p !== root) {
            var cs = getComputedStyle(p);
            if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 1) {
                var before = p.scrollTop;
                p.scrollTop = before + d;
                d -= (p.scrollTop - before);
                if (Math.abs(d) < 2)
                    return;
            }
            p = p.parentElement;
        }
        /* 沒有可捲動的容器（例如固定在底部的輸入列）：交給瀏覽器 */
        try {
            el.scrollIntoView({ block: 'nearest' });
        }
        catch (x) { }
    }
    var kt = null;
    function kbSoon() { clearTimeout(kt); kt = setTimeout(function () { kbVars(); reveal(); }, 60); }
    if (vv) {
        vv.addEventListener('resize', function () { kbVars(); kbSoon(); });
        vv.addEventListener('scroll', function () { kbVars(); });
    }
    document.addEventListener('focusin', function (e) {
        if (!isField(e.target))
            return;
        /* 點到聊天室輸入框：不等鍵盤量測，立刻收起導覽列，讓輸入框直接貼在鍵盤上方 */
        chatFocus = !!(e.target.closest && e.target.closest('#f')) && !!(window.matchMedia && matchMedia('(pointer:coarse)').matches);
        kbVars._k = null;
        kbVars();
        [120, 350, 700, 1000].forEach(function (ms) { setTimeout(function () { kbVars(); reveal(); }, ms); });
    });
    document.addEventListener('focusout', function () { setTimeout(function () { var a = document.activeElement; if (!(a && a.closest && a.closest('#f')))
        chatFocus = false; if (!isField(a)) {
        kbVars._k = null;
        kbVars();
    } }, 200); });
    /* 表情浮窗：點分類前先記住分類列捲到哪裡，重繪後還原 */
    document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-a=ecsw],[data-a=mecsw],[data-a=lccsw]'); if (!b)
        return; var ec = b.closest('.emo-cats'); window.__catsLeft = ec ? ec.scrollLeft : 0; }, true);
    /* ── 3. 聊天室引用訊息：點一下跳到被引用的訊息 ── */
    function findTarget(msgEl) {
        var id = msgEl.id.slice(2);
        try {
            var list = ms(S.cur), i = list.findIndex(function (x) { return x.id === id; }), m = list[i];
            if (!m)
                return null;
            if (m.qid && list.some(function (x) { return x.id === m.qid; }))
                return m.qid;
            for (var k = i - 1; k >= 0; k--) {
                var x = list[k];
                if (m.qi ? x.img === m.qi : (m.q && ((x.x === m.q) || (m.q === '[語音]' && x.audio) || (m.q === '[表情包]' && x.img && !x.x))))
                    return x.id;
            }
        }
        catch (e) { }
        return null;
    }
    document.addEventListener('click', function (e) {
        var q = e.target.closest && e.target.closest('#cl .qt');
        if (!q)
            return;
        var msg = q.closest('.m');
        if (!msg || !msg.id)
            return;
        e.stopPropagation();
        e.preventDefault();
        var old = document.querySelector('#cl .mact');
        if (old)
            old.remove();
        var tid = findTarget(msg), tg = tid && document.getElementById('m-' + tid);
        if (!tg && tid && window.chReveal) {
            try {
                chReveal(tid);
            }
            catch (x) { }
            tg = document.getElementById('m-' + tid);
        }
        if (!tg) {
            try {
                toast('找不到原本的訊息，可能已被刪除');
            }
            catch (x) { }
            return;
        }
        tg.scrollIntoView({ block: 'center', behavior: 'smooth' });
        tg.classList.add('qt-flash');
        setTimeout(function () { tg.classList.remove('qt-flash'); }, 1600);
    }, true);
    /* ── 4. 朋友圈吸頂：量標題高度，讓分頁籤接在標題下面 ── */
    function mhh() {
        var v = document.getElementById('v'), h = v && v.querySelector('.mom-stkh');
        if (h)
            v.style.setProperty('--mhh', Math.round(h.getBoundingClientRect().height - 16) + 'px');
    }
    var vEl = null;
    function watchV() {
        var v = document.getElementById('v');
        if (!v || v === vEl)
            return;
        vEl = v;
        new MutationObserver(mhh).observe(v, { childList: true });
        mhh();
    }
    document.addEventListener('DOMContentLoaded', function () { watchV(); setInterval(watchV, 1500); });
    /* ── 5. 請瀏覽器把資料標成「持久儲存」，降低被系統自動清掉的機率 ── */
    try {
        if (navigator.storage && navigator.storage.persist)
            navigator.storage.persist();
    }
    catch (e) { }
})();

/* ── 聊天室：輸入框上方是哪一條訊息，點輸入框（鍵盤升起）或收起鍵盤時，都停在同一條訊息的位置 ──
   原理：隨時記住「貼著輸入框上緣的那條訊息」和它離上緣的距離；版面一變（鍵盤、導覽列收放），
   就在動畫期間每一幀把捲動位置補回去，讓那條訊息維持在輸入框上方原本的位置。 */
(function () {
  var anc = null, until = 0, looping = false;
  function box() { return document.getElementById('cl'); }
  function capture() {
    var c = box(); if (!c || !c.children.length) { anc = null; return; }
    var cr = c.getBoundingClientRect(), k = c.children, i, r;
    for (i = k.length - 1; i >= 0; i--) {
      r = k[i].getBoundingClientRect();
      if (r.height > 0 && r.top < cr.bottom - 1) { anc = { el: k[i], id: k[i].id, off: cr.bottom - r.bottom }; return; }
    }
    anc = null;
  }
  function restore() {
    var c = box(); if (!c || !anc) return;
    if (!anc.el.isConnected || !c.contains(anc.el)) {
      /* 畫面被重畫過：用 id 找回同一條訊息 */
      var again = anc.id ? document.getElementById(anc.id) : null;
      if (!again || !c.contains(again)) return;
      anc.el = again;
    }
    var cr = c.getBoundingClientRect(), r = anc.el.getBoundingClientRect(), d = r.bottom - (cr.bottom - anc.off);
    if (Math.abs(d) > 0.5) c.scrollTop += d;
  }
  function loop() {
    restore();
    if (Date.now() < until) requestAnimationFrame(loop);
    else { looping = false; capture(); }
  }
  function run(ms) {
    if (!box()) return;
    if (!looping) { if (Date.now() >= until) capture(); looping = true; until = Date.now() + ms; requestAnimationFrame(loop); }
    else until = Math.max(until, Date.now() + ms);
  }
  document.addEventListener('scroll', function (e) {
    if (e.target && e.target.id === 'cl' && !looping) capture();
  }, true);
  /* 手指碰訊息列：馬上停止補償，不跟使用者搶捲動 */
  document.addEventListener('touchstart', function (e) {
    if (e.target.closest && e.target.closest('#cl')) { until = 0; }
  }, { capture: true, passive: true });
  /* 碰輸入框那一刻（鍵盤還沒出來）先記下位置 */
  ['pointerdown', 'touchstart', 'mousedown'].forEach(function (t) {
    document.addEventListener(t, function (e) {
      if (e.target.closest && e.target.closest('#f') && !looping) { capture(); }
    }, { capture: true, passive: true });
  });
  document.addEventListener('focusin', function (e) { if (e.target.closest && e.target.closest('#f')) run(1100); });
  document.addEventListener('focusout', function (e) { if (e.target.closest && e.target.closest('#f')) { if (!looping) capture(); run(1100); } });
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', function () { if (box()) run(700); });
  }
  new MutationObserver(function () { if (box()) run(700); }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', function () { if (box()) run(700); });
  /* 平常也定期更新，確保記的是最新位置 */
  setInterval(function () { if (!looping && box()) capture(); }, 1500);
})();
