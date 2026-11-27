/* ── 機率條：旁邊的 − ＋ 按鍵，以及所有「%」設定都用機率條 ──
   機率條（input[type=range][data-pk]）與 −／＋（button.pm[data-pk]）共用同一個設定鍵：
   一般鍵寫進 S.set[k]，朋友圈鍵（cm.xxx）寫進目前聯絡人的朋友圈設定，都走 sput/sget */
(function () {
    'use strict';
    const clamp = v => Math.min(100, Math.max(0, Math.round(v)));
    /* 設定鎖定時（設置 → 一般 的各頁），機率條與 −／＋ 也不能動 */
    const locked = () => { try {
        return tab === 'set' && sTab === 0 && sPage && !NOLOCK.includes(sPage) && !!S.locked;
    }
    catch (e) {
        return false;
    } };
    function apply(k, v, fromSlider) {
        v = clamp(v);
        sput(k, v);
        const lab = document.getElementById('o-' + k);
        if (lab)
            lab.textContent = v + '%';
        document.querySelectorAll('input[data-pk]').forEach(el => { if (el.dataset.pk === k && String(el.value) !== String(v))
            el.value = v; });
        if (typeof activeSetting === 'function' && activeSetting(k)) {
            if (!fromSlider && typeof resetA === 'function')
                resetA();
            else {
                clearTimeout(apply._t);
                apply._t = setTimeout(() => { if (typeof resetA === 'function')
                    resetA(); }, 400);
            }
        }
        else
            saveSoon();
    }
    document.addEventListener('input', e => { const t = e.target; if (t && t.dataset && t.dataset.pk && t.type === 'range') {
        if (locked()) {
            render();
            return;
        }
        apply(t.dataset.pk, +t.value, true);
    } });
    document.addEventListener('click', e => {
        const b = e.target.closest && e.target.closest('button.pm[data-pk]');
        if (!b)
            return;
        e.preventDefault();
        e.stopPropagation();
        if (locked()) {
            try {
                toast('設定已鎖定，請先解除鎖定');
            }
            catch (x) { }
            return;
        }
        const k = b.dataset.pk, cur0 = +sget(k) || 0;
        apply(k, cur0 + (+b.dataset.d || 0), false);
    }, true);
})();
