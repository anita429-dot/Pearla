(function () {
    function makeFog() {
        const q = s => document.querySelector(s);
        const splash = q('#splash'), cv = q('#sp-c'), ctx = cv.getContext('2d'), title = q('#sp-title'), stEl = q('#sp-status');
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        let W, H, S, cx, cy, t0, raf, done = false, MIN_MS = 1800;
        const ripples = [];
        function resize() { const d = Math.min(devicePixelRatio || 1, 2); W = splash.clientWidth; H = splash.clientHeight; 0; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); S = Math.min(W * .4, H * .5); cx = W / 2; cy = H * .48; title.style.fontSize = (S * .28) + 'px'; }
        addEventListener('resize', resize);
        resize();
        /* 小魚沿一條柔和的橢圓慢慢游，珍珠繞著小魚轉（傾斜軌道，會繞到魚的前後） */
        const TAU = Math.PI * 2;
        /* 莫比烏斯帶：中線是 ∞ 形（雙紐線），帶子沿一圈半扭轉 180°，交叉處一上一下 */
        function Q(u, v, t) {
            const su = Math.sin(u), cu = Math.cos(u), d = 1 + su * su;
            const x = cu / d, y = su * cu / d;
            const dx = (-su * d - cu * 2 * su * cu) / (d * d), dy = ((cu * cu - su * su) * d - su * cu * 2 * su * cu) / (d * d);
            const l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, ph = u / 2;
            const X = x + v * Math.cos(ph) * nx, Y = y + v * Math.cos(ph) * ny, Z = .24 * su + v * Math.sin(ph);
            const r = reduce ? .3 : .55 * Math.sin(t * .3), tl = .35 + (reduce ? 0 : .08 * Math.sin(t * .21));
            const x1 = X * Math.cos(r) + Z * Math.sin(r), z1 = -X * Math.sin(r) + Z * Math.cos(r);
            const y1 = Y * Math.cos(tl) - z1 * Math.sin(tl), z2 = Y * Math.sin(tl) + z1 * Math.cos(tl);
            const p = 1 / (1 - z2 * .25);
            return [cx + x1 * S * p, cy + y1 * S * p, z2, p];
        }
        const BW = .085, FV = .04;
        const SP = .7;
        function fpos(t) { return Q(t * (reduce ? .4 : SP), FV, t); }
        function orb(t, f, R) {
            const th = t * (reduce ? 2 : 3.4), tilt = -.4;
            const ox = Math.cos(th) * R, oy = Math.sin(th) * R * .38, z = Math.sin(th);
            return [f[0] + ox * Math.cos(tilt) - oy * Math.sin(tilt), f[1] + ox * Math.sin(tilt) + oy * Math.cos(tilt), z];
        }
        function fish(x, y, ang, t, k) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(ang);
            ctx.scale(k, Math.cos(ang) < 0 ? -k : k);
            const w = Math.sin(t * 9) * 3;
            ctx.shadowColor = '#ffffffcc';
            ctx.shadowBlur = 12;
            const g = ctx.createLinearGradient(-14, 0, 14, 0);
            g.addColorStop(0, '#bcd4f0');
            g.addColorStop(1, '#ffffff');
            ctx.fillStyle = g;
            ctx.strokeStyle = '#ffffffd9';
            ctx.lineWidth = .8;
            ctx.beginPath();
            ctx.moveTo(14, 0);
            ctx.quadraticCurveTo(7, -8, -6, -3);
            ctx.lineTo(-14, -8 + w);
            ctx.quadraticCurveTo(-10, w * .5, -14, 8 + w);
            ctx.lineTo(-6, 3);
            ctx.quadraticCurveTo(7, 8, 14, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.restore();
        }
        function pearl(p, k) {
            const sc = .8 + .3 * p[2], r = 5.5 * k * sc;
            ctx.save();
            ctx.globalAlpha = p[2] < 0 ? .65 : 1;
            ctx.shadowColor = '#ffffffee';
            ctx.shadowBlur = 14;
            const g = ctx.createRadialGradient(p[0] - r * .35, p[1] - r * .35, r * .1, p[0], p[1], r);
            g.addColorStop(0, '#fff');
            g.addColorStop(.55, '#e6eef8');
            g.addColorStop(1, '#9db9de');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p[0], p[1], r, 0, TAU);
            ctx.fill();
            ctx.restore();
        }
        function ripple(now) {
            for (let n = ripples.length - 1; n >= 0; n--) {
                const r = ripples[n], age = (now - r.t) / 1000;
                if (age > 2.8) {
                    ripples.splice(n, 1);
                    continue;
                }
                for (let i = 0; i < 3; i++) {
                    const a = age - i * .17;
                    if (a < 0 || a > 2.2)
                        continue;
                    const rad = a * 115 * r.s + 6, al = Math.pow(1 - a / 2.2, 2) * .65 * r.s;
                    if (i === 0) {
                        const g = ctx.createRadialGradient(r.x, r.y, rad * .6, r.x, r.y, rad);
                        g.addColorStop(0, 'rgba(255,255,255,0)');
                        g.addColorStop(1, `rgba(255,255,255,${al * .35})`);
                        ctx.fillStyle = g;
                        ctx.beginPath();
                        ctx.arc(r.x, r.y, rad, 0, TAU);
                        ctx.fill();
                    }
                    ctx.strokeStyle = `rgba(255,255,255,${al})`;
                    ctx.lineWidth = 2 - i * .5;
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, rad, 0, TAU);
                    ctx.stroke();
                    if (i === 1) {
                        ctx.strokeStyle = `rgba(127,161,204,${al * .7})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.arc(r.x, r.y, rad * 1.06, 0, TAU);
                        ctx.stroke();
                    }
                }
            }
        }
        function wake(t, k) {
            const N = 50, dt = .05;
            let prev = fpos(t);
            ctx.lineCap = 'round';
            for (let i = 1; i <= N; i++) {
                const q = fpos(t - i * dt), a = 1 - i / N;
                ctx.strokeStyle = `rgba(255,255,255,${a * a * (q[2] < 0 ? .28 : .5)})`;
                ctx.lineWidth = .4 + a * 2.4 * k;
                ctx.beginPath();
                ctx.moveTo(prev[0], prev[1]);
                ctx.lineTo(q[0], q[1]);
                ctx.stroke();
                prev = q;
            }
        }
        const bubs = [];
        let nextB = 0;
        function bubbles(now, f, ang, k) {
            if (now > nextB) {
                nextB = now + 450 + Math.random() * 900;
                const d = (14 + Math.random() * 6) * k, j = () => (Math.random() - .5) * 8 * k;
                bubs.push({ x: f[0] - Math.cos(ang) * d + j(), y: f[1] - Math.sin(ang) * d + j(), r: (1.6 + Math.random() * 2.4) * k, t: now, life: 1800 + Math.random() * 1400, dx: (Math.random() - .5) * 10, ph: Math.random() * 6 });
            }
            for (let i = bubs.length - 1; i >= 0; i--) {
                const b = bubs[i], a = (now - b.t) / b.life;
                if (a >= 1) {
                    bubs.splice(i, 1);
                    continue;
                }
                const al = Math.sin(a * Math.PI) * .5, x = b.x + b.dx * a + Math.sin(a * 6 + b.ph) * 1.5, y = b.y - a * 16 * k, r = b.r * (.8 + a * .4);
                ctx.strokeStyle = `rgba(255,255,255,${al})`;
                ctx.lineWidth = .9;
                ctx.fillStyle = `rgba(255,255,255,${al * .18})`;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, TAU);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = `rgba(255,255,255,${al * .9})`;
                ctx.beginPath();
                ctx.arc(x - r * .3, y - r * .3, r * .2, 0, TAU);
                ctx.fill();
            }
        }
        function loop(now) {
            const t = (now - t0) / 1000;
            ctx.clearRect(0, 0, W, H);
            const k = S / 150, R = 26 * k, f = fpos(t), f0 = fpos(t - .03), f1 = fpos(t + .03);
            const ang = Math.atan2(f1[1] - f0[1], f1[0] - f0[0]), p = orb(t, f, R), fk = k * (.85 + .25 * f[3]);
            const pz = f[2] + p[2] * .15;
            const fb = f[2] < 0, pb = pz < 0;
            /* 在帶子背面時先畫（被帶子蓋住一點），在正面時最後畫 */
            const drawFish = () => { ctx.globalAlpha = fb ? .6 : 1; fish(f[0], f[1], ang, t, fk); ctx.globalAlpha = 1; };
            const drawPearl = () => { ctx.globalAlpha = pb ? .65 : 1; pearl(p, k); ctx.globalAlpha = 1; };
            const trail = () => {
                for (let i = 22; i > 0; i--) {
                    const tt = t - i * .03, ff = fpos(tt), q = orb(tt, ff, R);
                    ctx.fillStyle = `rgba(255,255,255,${(1 - i / 22) * .4})`;
                    ctx.beginPath();
                    ctx.arc(q[0], q[1], (1 - i / 22) * 2.2 * k, 0, TAU);
                    ctx.fill();
                }
            };
            if (fb)
                drawFish();
            if (pb)
                drawPearl();
            wake(t, k);
            trail();
            bubbles(now, f, ang, k);
            if (!fb)
                drawFish();
            if (!pb)
                drawPearl();
            ripple(now);
            raf = requestAnimationFrame(loop);
        }
        /* 觸碰水波紋 */
        let down = false, last = 0;
        const pt = e => { const r = splash.getBoundingClientRect(), k = splash.offsetWidth / r.width; return [(e.clientX - r.left) * k, (e.clientY - r.top) * k]; };
        const rip = (x, y, s) => ripples.push({ x, y, s, t: performance.now() });
        splash.addEventListener('pointerdown', e => { down = true; rip(...pt(e), 1); });
        splash.addEventListener('pointermove', e => { const n = performance.now(); if (down && n - last > 90) {
            last = n;
            rip(...pt(e), .55);
        } });
        addEventListener('pointerup', () => down = false);
        addEventListener('pointercancel', () => down = false);
        /* 開關：程式載入完成時呼叫 PearlaSplash.finish()，動畫至少顯示 MIN_MS 才淡出 */
        const PearlaSplash = {
            start() { done = false; splash.classList.remove('out'); splash.style.display = ''; resize(); ripples.length = 0; bubs.length = 0; stEl.classList.remove('ok'); t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); },
            finish() {
                if (done)
                    return;
                done = true;
                const wait = Math.max(0, MIN_MS - (performance.now() - t0));
                setTimeout(() => { stEl.classList.add('ok'); setTimeout(() => { splash.classList.add('out'); setTimeout(() => { if (done) {
                    cancelAnimationFrame(raf);
                    splash.style.display = 'none';
                } }, 750); }, 500); }, wait);
            }
        };
        return PearlaSplash;
    }
    function makeClay() {
        const q = s => document.querySelector(s);
        const splash = q('#splash'), cv = q('#sp-c'), ctx = cv.getContext('2d'), stEl = q('#sp-status');
        const TAU = Math.PI * 2, MIN_MS = 3600;
        let W, H, R, cx, cy, t0, raf, done = false, last = 0, sp = 0, sv = 0, fsp = 0, fsv = 0;
        const crumbs = [];
        const sm = (a, b, x) => { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
        const ez = x => 1 - Math.pow(1 - x, 3);
        const el = x => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * TAU / 3) + 1;
        const TX = Array.from({ length: 44 }, () => { const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * .92; return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: .5 + Math.random() * 1.1, l: Math.random() < .5 }; });
        function resize() {
            const d = Math.min(devicePixelRatio || 1, 2);
            W = splash.clientWidth;
            H = splash.clientHeight;
            cv.width = W * d;
            cv.height = H * d;
            ctx.setTransform(d, 0, 0, d, 0, 0);
            R = Math.min(W * .17, H * .1);
            cx = W / 2;
            cy = H * .47;
            0;
        }
        addEventListener('resize', resize);
        resize();
        /* 黏土團：輪廓有凹凸（A 越大越不規則），被捏時沿捏的方向壓扁 */
        function blob(x, y, sx, sy, fa, fq, A, sheen, al) {
            ctx.save();
            ctx.globalAlpha = al;
            ctx.translate(x, y);
            ctx.scale(sx, sy);
            ctx.rotate(fa);
            ctx.scale(1 - fq * .14, 1 + fq * .09);
            ctx.rotate(-fa);
            ctx.beginPath();
            for (let i = 0; i <= 90; i++) {
                const th = i / 90 * TAU, r = R * (1 + A * (.5 * Math.sin(3 * th + 1) + .35 * Math.sin(5 * th + 2) + .25 * Math.sin(2 * th)));
                i ? ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r) : ctx.moveTo(r * Math.cos(th), r * Math.sin(th));
            }
            ctx.closePath();
            let g = ctx.createRadialGradient(-.3 * R, -.38 * R, .1 * R, 0, 0, 1.3 * R);
            g.addColorStop(0, '#fbe9f6');
            g.addColorStop(.5, '#e2cdf2');
            g.addColorStop(1, '#b7a3de');
            ctx.fillStyle = g;
            ctx.fill();
            ctx.save();
            ctx.clip();
            g = ctx.createLinearGradient(-R, -R, R, R);
            g.addColorStop(0, 'rgba(255,255,255,0)');
            g.addColorStop(.4, `rgba(255,214,235,${.5 * sheen})`);
            g.addColorStop(.7, `rgba(200,225,255,${.45 * sheen})`);
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g;
            ctx.fillRect(-2 * R, -2 * R, 4 * R, 4 * R);
            g = ctx.createRadialGradient(-.15 * R, -.2 * R, .6 * R, 0, 0, 1.15 * R);
            g.addColorStop(0, 'rgba(120,95,190,0)');
            g.addColorStop(1, 'rgba(120,95,190,.3)');
            ctx.fillStyle = g;
            ctx.fillRect(-2 * R, -2 * R, 4 * R, 4 * R);
            for (const d of TX) {
                ctx.fillStyle = d.l ? 'rgba(255,255,255,.14)' : 'rgba(120,95,190,.08)';
                ctx.beginPath();
                ctx.arc(d.x * R, d.y * R, d.s, 0, TAU);
                ctx.fill();
            }
            ctx.restore();
            ctx.save();
            ctx.translate(-.34 * R, -.42 * R);
            ctx.rotate(-.6);
            ctx.scale(1, .6);
            g = ctx.createRadialGradient(0, 0, 0, 0, 0, .3 * R);
            g.addColorStop(0, 'rgba(255,255,255,.8)');
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(0, 0, .3 * R, 0, TAU);
            ctx.fill();
            ctx.restore();
            ctx.restore();
        }
        function fish(x, y, F, t, spr, al) {
            ctx.save();
            ctx.globalAlpha = al;
            ctx.translate(x, y);
            ctx.rotate(Math.sin(t * 2.2) * .05);
            ctx.scale(1 + spr * .15, 1 - spr * .15);
            const tw = Math.sin(t * 6) * F * .2;
            ctx.fillStyle = '#b7aeea';
            ctx.beginPath();
            ctx.moveTo(-.25 * F, -.6 * F);
            ctx.bezierCurveTo(-.1 * F, -1.1 * F, .45 * F, -1 * F, .55 * F, -.5 * F);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-.7 * F, -.12 * F);
            ctx.quadraticCurveTo(-1.2 * F, -.7 * F + tw, -1.55 * F, -.8 * F + tw);
            ctx.quadraticCurveTo(-1.8 * F, -.4 * F + tw, -1.65 * F, tw * .5);
            ctx.quadraticCurveTo(-1.8 * F, .4 * F + tw, -1.55 * F, .8 * F + tw);
            ctx.quadraticCurveTo(-1.2 * F, .7 * F + tw, -.7 * F, .12 * F);
            ctx.closePath();
            ctx.fill();
            const g = ctx.createRadialGradient(-.3 * F, -.3 * F, .1 * F, 0, 0, 1.2 * F);
            g.addColorStop(0, '#fde4ec');
            g.addColorStop(.55, '#f4b6c8');
            g.addColorStop(1, '#df98b0');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(0, 0, .95 * F, .62 * F, 0, 0, TAU);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.35)';
            ctx.beginPath();
            ctx.ellipse(.1 * F, .3 * F, .6 * F, .22 * F, 0, 0, TAU);
            ctx.fill();
            ctx.save();
            ctx.translate(-.1 * F, .1 * F);
            ctx.rotate(.5 + Math.sin(t * 6) * .25);
            ctx.fillStyle = '#aca6e4';
            ctx.beginPath();
            ctx.ellipse(-.22 * F, 0, .4 * F, .2 * F, 0, 0, TAU);
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.translate(-.3 * F, -.22 * F);
            ctx.rotate(-.4);
            ctx.scale(1, .5);
            const h = ctx.createRadialGradient(0, 0, 0, 0, 0, .4 * F);
            h.addColorStop(0, 'rgba(255,255,255,.8)');
            h.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = h;
            ctx.beginPath();
            ctx.arc(0, 0, .4 * F, 0, TAU);
            ctx.fill();
            ctx.restore();
            ctx.restore();
        }
        function shadow(x, y, w, a) {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(1, .22);
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w);
            g.addColorStop(0, `rgba(120,95,190,${a})`);
            g.addColorStop(1, 'rgba(120,95,190,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(0, 0, w, 0, TAU);
            ctx.fill();
            ctx.restore();
        }
        const PN = [[1.0, 0], [1.9, 1.05], [2.8, 2.1]]; /* 三次捏：開始時間、手指方向 */
        function loop(now) {
            const t = (now - t0) / 1000, dt = Math.min(.033, Math.max(0, (now - last) / 1000));
            last = now;
            ctx.clearRect(0, 0, W, H);
            sv += (-180 * sp - 9 * sv) * dt;
            sp += sv * dt;
            fsv += (-200 * fsp - 8 * fsv) * dt;
            fsp += fsv * dt;
            let A = .3, fa = 0, fq = 0;
            const fin = [];
            PN.forEach(([s, ang]) => {
                const u = (t - s) / .8;
                A -= .1 * sm(.45, .7, u);
                const pa = sm(0, .3, u) * (1 - sm(.78, 1, u));
                if (pa > 0) {
                    const q = sm(.25, .5, u) * (1 - sm(.52, .78, u));
                    fin.push({ ang, pa, q });
                    fa = ang;
                    fq = q;
                }
            });
            const dp = Math.min(t / .55, 1), ls = t > .55 ? Math.exp(-(t - .55) * 7) * Math.sin((t - .55) * 20) * .2 : 0;
            let sx = 1 + ls * .8, sy = 1 - ls, hop = 0;
            if (dp < 1) {
                sy = 1 + .12 * (1 - dp);
                sx = 1 - .06 * (1 - dp);
            }
            if (t > 4) {
                const ph = (t - 4) % 3.2;
                if (ph < .9) {
                    hop = Math.sin(ph / .9 * Math.PI) * R * .3;
                    sy *= 1 + hop / R * .5;
                    sx *= 1 - hop / R * .25;
                }
                else if (ph < 1.2) {
                    const l = (1 - (ph - .9) / .3) * .12;
                    sy -= l;
                    sx += l;
                }
            }
            sx *= 1 + sp * .2;
            sy *= 1 - sp * .2;
            const yy = cy - (1 - ez(dp)) * H * .38, y = yy + R * (1 - sy) - hop, al = sm(0, .25, t), sheen = sm(3.4, 4.2, t);
            shadow(cx, yy + R * 1.08, R * (1.1 - hop / R * .8), .3 * al);
            const fs = el(Math.min(Math.max((t - 4.1) / .9, 0), 1)), F = R * .4, fx = cx - R * 1.5, fy = cy + R * .55 + Math.sin(t * 2) * 3;
            if (fs > .01) {
                shadow(fx, fy + F * .9, F * 1.3 * fs, .22);
                fish(fx, fy, F * fs, t, fsp, 1);
            }
            blob(cx, y, sx, sy, fa, fq, Math.max(0, A), sheen, al);
            for (let i = crumbs.length - 1; i >= 0; i--) {
                const c = crumbs[i], a = (now - c.t) / 1100;
                if (a >= 1) {
                    crumbs.splice(i, 1);
                    continue;
                }
                c.vy += 420 * dt;
                c.x += c.vx * dt;
                c.y += c.vy * dt;
                const g = ctx.createRadialGradient(c.x - c.r * .3, c.y - c.r * .3, 0, c.x, c.y, c.r);
                g.addColorStop(0, '#fff');
                g.addColorStop(1, c.c);
                ctx.globalAlpha = 1 - a * a;
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.r, 0, TAU);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            raf = requestAnimationFrame(loop);
        }
        /* 點螢幕：珍珠被戳一下彈一彈，噴出幾顆小黏土屑；點到小魚，牠會彈一下 */
        const pt = e => { const r = splash.getBoundingClientRect(), k = splash.offsetWidth / r.width; return [(e.clientX - r.left) * k, (e.clientY - r.top) * k]; };
        splash.addEventListener('pointerdown', e => {
            const [x, y] = pt(e);
            if ((performance.now() - t0) / 1000 > 1)
                sv += 7;
            if (Math.hypot(x - (cx - R * 1.5), y - (cy + R * .55)) < R * .9)
                fsv += 9;
            const cs = ['#f4b6c8', '#aca6e4', '#f8d7cc'];
            for (let i = 0; i < 7; i++) {
                const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, v = 60 + Math.random() * 110;
                crumbs.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 2 + Math.random() * 2.6, c: cs[i % 3], t: performance.now() });
            }
        });
        const PearlaSplash = {
            start() { done = false; splash.classList.remove('out'); splash.style.display = ''; resize(); crumbs.length = 0; sp = sv = fsp = fsv = 0; stEl.classList.remove('ok'); t0 = last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); },
            finish() {
                if (done)
                    return;
                done = true;
                const wait = Math.max(0, MIN_MS - (performance.now() - t0));
                setTimeout(() => { stEl.classList.add('ok'); setTimeout(() => { splash.classList.add('out'); setTimeout(() => { if (done) {
                    cancelAnimationFrame(raf);
                    splash.style.display = 'none';
                } }, 750); }, 500); }, wait);
            }
        };
        return PearlaSplash;
    }
    function makeMoon() {
        const $ = s => document.querySelector(s);
        const splash = $('#splash'), stEl = $('#sp-status');
        let layer = $('#sp-layer');
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'sp-layer';
            splash.insertBefore(layer, splash.firstChild);
        }
        const A = { "fish": { "s": "assets/moon/splash-fish.webp", "ar": 0.6992 }, "pearl": { "s": "assets/moon/splash-pearl.webp", "ar": 0.9766 }, "cloud1": { "s": "assets/moon/splash-cloud-1.webp", "ar": 0.6172, "prof": [0.516, 0.442, 0.363, 0.318, 0.298, 0.243, 0.13, 0.061, 0.024, 0.005, 0.003, 0.019, 0.056, 0.127, 0.184, 0.19, 0.221, 0.316, 0.432, 0.492, 0.548] }, "cloud2": { "s": "assets/moon/splash-cloud-2.webp", "ar": 0.5375, "prof": [0.477, 0.384, 0.315, 0.284, 0.209, 0.108, 0.051, 0.02, 0.007, 0.012, 0.036, 0.081, 0.159, 0.29, 0.347, 0.366, 0.414, 0.431, 0.413, 0.422, 0.474] }, "cloud3": { "s": "assets/moon/splash-cloud-3.webp", "ar": 0.7237, "prof": [0.608, 0.519, 0.443, 0.401, 0.369, 0.263, 0.146, 0.082, 0.041, 0.017, 0.007, 0.01, 0.028, 0.066, 0.139, 0.251, 0.332, 0.358, 0.361, 0.399, 0.445] }, "moon": { "s": "assets/moon/splash-moon.webp", "ar": 0.9733 }, "starY": { "s": "assets/moon/splash-star-yellow.webp", "ar": 0.9062 }, "starL": { "s": "assets/moon/splash-star-lavender.webp", "ar": 0.9167 }, "starP": { "s": "assets/moon/splash-star-pink.webp", "ar": 1.0625 } };
        const TAU = Math.PI * 2, MIN_MS = 3200;
        let W, H, k = 1, S = {}, t0, raf, done = false, last = 0, kp = 0, kv = 0, tapX = -999;
        const bursts = [], rnd = (a, b) => a + Math.random() * (b - a);
        const smp = (a, b, x) => { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
        /* ay：錨點（1＝底部中央，.5＝正中央），縮放與壓扁都以錨點為中心 */
        function mk(key, w, cls, ay) {
            const d = A[key], el = new Image(), h = w * d.ar;
            el.src = d.s;
            el.draggable = false;
            el.className = 'mnsp ' + (cls || '');
            el.style.cssText = `width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h * ay}px;transform-origin:50% ${ay * 100}%`;
            layer.appendChild(el);
            el.hh = h;
            return el;
        }
        const put = (el, x, y, sx, sy, r) => { el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${r || 0}deg) scale(${sx},${sy})`; };
        function prof(u) { const p = A.cloud1.prof, f = Math.max(0, Math.min(1, u)) * 20, i = Math.min(19, Math.floor(f)); return p[i] + (p[i + 1] - p[i]) * (f - i); }
        function build() {
            layer.innerHTML = '';
            S = {};
            k = W / 390;
            for (let i = 0; i < 34; i++) {
                const d = document.createElement('i');
                d.className = 'mndot';
                d.style.cssText = `left:${rnd(2, 98)}%;top:${rnd(1, 62)}%;animation-delay:${rnd(0, 3)}s;animation-duration:${rnd(2.2, 4.2)}s`;
                layer.appendChild(d);
            }
            S.moon = mk('moon', 100 * k, 'mnmoon', .5);
            S.stars = [];
            const keys = ['starY', 'starL', 'starP'];
            for (let r = 0; r < 5; r++)
                for (let c = 0; c < 4; c++) {
                    const x = (c + rnd(.2, .8)) / 4, y = .03 + (r + rnd(.2, .8)) / 5 * .52;
                    if (x < .36 && y < .22)
                        continue;
                    if (x > .22 && x < .78 && y > .15 && y < .29)
                        continue;
                    S.stars.push({ el: mk(keys[(r + c) % 3], rnd(12, 26) * k, '', .5), x, y, ph: rnd(0, TAU), sp: rnd(1.2, 2.4) });
                }
            S.c2 = mk('cloud2', 170 * k, 'mncloud', .5);
            S.c3 = mk('cloud3', 126 * k, 'mncloud', .5);
            /* 主雲用 canvas 畫：切成很多細條，在小魚、珍珠落下的位置讓雲「局部陷下去」 */
            const cw = 236 * k, ch = cw * A.cloud1.ar, pad = 10 * k, dp = Math.min(devicePixelRatio || 1, 2), c = document.createElement('canvas');
            c.className = 'mnsp mncloud';
            c.width = Math.round(cw * dp);
            c.height = Math.round((ch + pad) * dp);
            c.dpr = dp;
            c.style.cssText = `width:${cw}px;height:${ch + pad}px;margin-left:${-cw / 2}px;margin-top:${-(ch + pad)}px;transform-origin:50% 100%`;
            layer.appendChild(c);
            S.main = c;
            S.cw = cw;
            S.ch = ch;
            S.pad = pad;
            S.img = new Image();
            S.img.src = A.cloud1.s;
            S.pearl = mk('pearl', 46 * k, '', 1);
            S.fish = mk('fish', 88 * k, '', 1);
        }
        function resize() { W = splash.clientWidth; H = splash.clientHeight; if (!W)
            return; build(); }
        addEventListener('resize', resize);
        /* 跳一下的節奏：離地（拉長）→ 落下（壓扁、回彈）→ 微蹲蓄力 */
        function hop(t, off, T) {
            const ph = ((t / T + off) % 1 + 1) % 1;
            if (ph < .7) {
                const u = ph / .7, tau = ph * T, sy = 1 + .12 * Math.abs(1 - 2 * u); /* 離地：雲慢慢彈回來，還會微微鼓起 */
                return { u, up: 4 * u * (1 - u), sy, sx: 1 / sy, dent: .8 * Math.exp(-6 * tau) * Math.cos(10 * tau) };
            }
            const v = (ph - .7) / .3, tl = (ph - .7) * T, sp = Math.exp(-5 * v) * Math.cos(v * 13), sq = sp * .2 + (v > .75 ? smp(.75, 1, v) * .08 : 0);
            /* 落下：雲很快被壓深，再稍微回彈、穩穩托住；蹲下蓄力時又多壓一點 */
            return { u: 0, up: 0, sy: 1 - sq, sx: 1 + sq * .8, dent: (1 - Math.exp(-40 * tl)) * (.55 + .55 * Math.exp(-8 * tl)) + (v > .75 ? .25 * smp(.75, 1, v) : 0) };
        }
        function drawCloud(dentAt) {
            const c = S.main, g = c.getContext('2d'), N = 72, iw = S.img.naturalWidth, ih = S.img.naturalHeight, cw = S.cw, ch = S.ch, pad = S.pad;
            g.setTransform(c.dpr, 0, 0, c.dpr, 0, 0);
            g.clearRect(0, 0, cw, ch + pad);
            const sw = iw / N, dw = cw / N;
            for (let i = 0; i < N; i++) {
                const hh = ch - dentAt((i + .5) * dw);
                g.drawImage(S.img, i * sw, 0, sw, ih, i * dw, ch + pad - hh, dw + .6, hh);
            }
        }
        function loop(now) {
            const t = (now - t0) / 1000, dt = Math.min(.033, Math.max(0, (now - last) / 1000));
            last = now;
            put(S.moon, W * .19, H * .115 + 3 * k * Math.sin(t * .7), 1, 1, 3 * Math.sin(t * .45));
            for (const s of S.stars) {
                const w = Math.sin(t * s.sp + s.ph), sc = .85 + .2 * w;
                s.el.style.opacity = .65 + .35 * w;
                put(s.el, s.x * W, s.y * H + 2 * k * Math.sin(t * .6 + s.ph), sc, sc, 8 * Math.sin(t * .5 + s.ph));
            }
            /* 另外兩朵雲：上下慢慢浮動、微微呼吸 */
            const fl = (el, x, y, a, p, sp) => put(el, x + 6 * k * Math.sin(t * .5 * sp + p), y + a * k * Math.sin(t * .9 * sp + p * 1.7), 1 + .015 * Math.sin(t * .8 * sp + p), 1 + .02 * Math.sin(t * .8 * sp + p + 1), 1.5 * Math.sin(t * .4 * sp + p));
            fl(S.c2, W * .17, H * .70, 10, 0, 1);
            fl(S.c3, W * .84, H * .44, 9, 2.4, .8);
            /* 主雲：小魚、珍珠落下時，雲在那個位置陷下去，兩側微微隆起，再軟軟彈回來 */
            const hp = hop(t, 0, 1.7), hf = hop(t, .5, 1.7);
            kv += (-90 * kp - 7 * kv) * dt;
            kp += kv * dt;
            const cw = S.cw, ch = S.ch, left = W * .5 - cw / 2, b = H * .68 + 3 * k * Math.sin(t * .8), xp = .36 * cw, xf = .7 * cw, xt = tapX - left;
            const sh = r => 1.25 * Math.exp(-r * r) - .25 * Math.exp(-r * r / 4.84);
            const dentAt = x => hp.dent * 22 * k * sh((x - xp) / (28 * k)) + hf.dent * 34 * k * sh((x - xf) / (36 * k)) + kp * 18 * k * sh((x - xt) / (30 * k));
            if (S.img.complete && S.img.naturalWidth)
                drawCloud(dentAt);
            put(S.main, W * .5, b, 1, 1, 0);
            const gnd = (u, x) => b - (1 - prof(u)) * (ch - dentAt(x)) + 5 * k;
            put(S.pearl, left + xp, gnd(.36, xp) + 18 * k - hp.up * 34 * k, hp.sx, hp.sy, 0);
            put(S.fish, left + xf, gnd(.7, xf) - hf.up * 42 * k, hf.sx, hf.sy, hf.u ? -7 * Math.cos(hf.u * Math.PI) : 0);
            /* 點螢幕飄出的小星星 */
            for (let i = bursts.length - 1; i >= 0; i--) {
                const o = bursts[i], a = (now - o.t) / o.life;
                if (a >= 1) {
                    o.el.remove();
                    bursts.splice(i, 1);
                    continue;
                }
                o.vy += 140 * dt;
                o.x += o.vx * dt;
                o.y += o.vy * dt;
                o.r += o.vr * dt;
                o.el.style.opacity = 1 - a * a;
                const sc = 1 - .4 * a;
                put(o.el, o.x, o.y, sc, sc, o.r);
            }
            raf = requestAnimationFrame(loop);
        }
        splash.addEventListener('pointerdown', e => {
            const r = splash.getBoundingClientRect(), q = splash.offsetWidth / r.width, x = (e.clientX - r.left) * q, y = (e.clientY - r.top) * q;
            tapX = x;
            kv += 14;
            const keys = ['starY', 'starL', 'starP'];
            for (let i = 0; i < 7; i++)
                bursts.push({ el: mk(keys[i % 3], rnd(12, 22) * k, '', .5), x, y, vx: rnd(-90, 90), vy: rnd(-170, -60), r: rnd(-180, 180), vr: rnd(-200, 200), t: performance.now(), life: rnd(1100, 1700) });
        });
        const PearlaSplash = {
            start() { done = false; splash.classList.remove('out'); splash.style.display = ''; resize(); bursts.length = 0; kp = kv = 0; tapX = -999; stEl.classList.remove('ok'); t0 = last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); },
            finish() {
                if (done)
                    return;
                done = true;
                const wait = Math.max(0, MIN_MS - (performance.now() - t0));
                setTimeout(() => { stEl.classList.add('ok'); setTimeout(() => { splash.classList.add('out'); setTimeout(() => { if (done) {
                    cancelAnimationFrame(raf);
                    splash.style.display = 'none';
                } }, 1150); }, 1000); }, wait);
            }
        };
        return PearlaSplash;
    }
    function makePixel() {
        const $ = s => document.querySelector(s);
        const splash = $('#splash'), cv = $('#sp-c'), ctx = cv.getContext('2d'), stEl = $('#sp-status');
        const PX = 4, TAU = Math.PI * 2, MIN_MS = 3000, COL = ['#f00f2d', '#9b6bff', '#4aa3ff', '#1b2a6b'];
        let W, H, lw, lh, cx, cy, A, B, t0, raf, done = false, nextG = 0, stars = [];
        const bands = [], bursts = [];
        function resize() {
            W = splash.clientWidth;
            H = splash.clientHeight;
            lw = Math.ceil(W / PX);
            lh = Math.ceil(H / PX);
            cv.width = lw;
            cv.height = lh;
            ctx.imageSmoothingEnabled = false;
            cx = lw / 2;
            cy = lh * .5;
            A = lw * .34;
            B = lh * .1;
            stars = Array.from({ length: 30 }, () => ({ x: Math.random() * lw | 0, y: Math.random() * lh * .7 | 0, p: Math.random() * 6, c: ['#fff', '#ffc2c7', '#9fd0ff'][Math.random() * 3 | 0] }));
        }
        addEventListener('resize', resize);
        resize();
        /* 像素小魚（朝右，尾巴在左；b=尾巴會一格一格擺動） */
        const FISH = ["......vvv.......", "bb...pppppp.....", "bbb.pwppppppp...", ".bbbppppppppppp.", "..bbppppppppppp.", ".bbbpllllllllpp.", "bbb.ppppppppp...", "bb...pppppp.....", "......vv........"];
        const PAL = { p: '#f00f2d', l: '#ffc2c7', b: '#4aa3ff', v: '#9b6bff', w: '#ffffff' };
        function spr(rows, x, y, flip, tail) {
            const w = rows[0].length, h = rows.length;
            rows.forEach((r, j) => {
                for (let i = 0; i < w; i++) {
                    const c = r[i];
                    if (c === '.')
                        continue;
                    ctx.fillStyle = PAL[c];
                    ctx.fillRect(Math.round(x) - (w >> 1) + (flip ? w - 1 - i : i), Math.round(y) - (h >> 1) + j + (c === 'b' && tail ? (j < 4 ? 1 : j > 4 ? -1 : 0) : 0), 1, 1);
                }
            });
        }
        /* 小魚可以轉向（每 22.5° 一格），永遠用嘴巴（魚頭）朝著珍珠。FR 是尾巴張開／閉合兩格動畫 */
        const FR = [0, 1].map(tf => {
            const g = FISH.map(r => r.split('').map(() => '.'));
            FISH.forEach((r, j) => { for (let i = 0; i < r.length; i++) {
                const ch = r[i];
                if (ch === '.')
                    continue;
                const jj = j + (ch === 'b' && tf ? (j < 4 ? 1 : j > 4 ? -1 : 0) : 0);
                if (g[jj])
                    g[jj][i] = ch;
            } });
            return g;
        });
        function sprR(x, y, ang, tf) {
            const g = FR[tf], h = g.length, w = g[0].length, c = Math.cos(ang), s = Math.sin(ang), fl = c < -1e-6 ? -1 : 1;
            for (let dy = -11; dy <= 11; dy++)
                for (let dx = -11; dx <= 11; dx++) {
                    const rx = dx * c + dy * s, ry = (-dx * s + dy * c) * fl, col = Math.floor(rx + w / 2), row = Math.floor(ry + h / 2);
                    const ch = g[row] && g[row][col];
                    if (!ch || ch === '.')
                        continue;
                    ctx.fillStyle = PAL[ch];
                    ctx.fillRect(Math.round(x) + dx, Math.round(y) + dy, 1, 1);
                }
        }
        function pearl(x, y) {
            for (let dy = -4; dy <= 4; dy++)
                for (let dx = -4; dx <= 4; dx++) {
                    const d = dx * dx + dy * dy;
                    if (d > 17)
                        continue;
                    const s = dx + dy;
                    ctx.fillStyle = (d > 12 && s > 1) ? '#7d6ad0' : s <= -4 ? '#fff' : s < -1 ? '#f1e8ff' : s < 3 ? '#c9b8ff' : '#8f7ce0';
                    ctx.fillRect(Math.round(x) + dx, Math.round(y) + dy, 1, 1);
                }
        }
        const P = a => [cx + A * Math.sin(a), cy + B * Math.sin(2 * a)]; /* ∞ 形路徑 */
        function grid(t) {
            const y0 = lh * .74;
            for (let i = 0; i < 8; i++) {
                const u = (i + (t * .5) % 1) / 8, y = Math.round(y0 + (lh - y0) * u * u);
                ctx.fillStyle = `rgba(255,111,200,${.12 + .4 * u})`;
                ctx.fillRect(0, y, lw, 1);
            }
            ctx.fillStyle = 'rgba(155,107,255,.35)';
            for (let j = -8; j <= 8; j++)
                for (let y = Math.round(y0); y < lh; y += 1) {
                    const u = (y - y0) / (lh - y0);
                    ctx.fillRect(Math.round(cx + j * (6 + 16 * u)), y, 1, 1);
                }
        }
        function loop(now) {
            const t = (now - t0) / 1000;
            ctx.clearRect(0, 0, lw, lh);
            for (const s of stars)
                if (((t * 2 + s.p) | 0) % 3) {
                    ctx.fillStyle = s.c;
                    ctx.fillRect(s.x, s.y, 1, 1);
                }
            grid(t);
            /* 小魚頭朝上，輕輕往上頂珍珠：先微微下沉蓄力 → 往上一頂 → 珍珠飄上去再慢慢落回魚鼻子，如此循環 */
            const T = 3.2, n = Math.floor(t / T), u = t / T - n, REST = 11, RISE = 26;
            const smp = (a, b, x) => { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
            const fx = cx + 9 * Math.sin(t * .5), by = lh * .58;
            const dip = u < .3 ? 3 * smp(.12, .3, u) : u < .38 ? 3 - 5 * smp(.3, .38, u) : -2 * (1 - smp(.38, .7, u));
            const f = [fx, by + dip], kk = u < .38 ? 0 : (u - .38) / .62, ph = RISE * 4 * kk * (1 - kk);
            const lean = -Math.PI / 2 + .55 * Math.cos(Math.PI * (t / T - .38)), /* 每次頂的時候身體會往左、右交替斜一點，珍珠沿著魚頭的方向飄出去，不會正上正下 */ pe = [f[0] + Math.cos(lean) * (REST + ph) + Math.sin(kk * TAU) * 2.5, f[1] + Math.sin(lean) * (REST + ph)];
            /* 小小的環繞點：繞著小魚轉，繞到後面時在魚後面、繞到前面時蓋在魚上 */
            const orbit = front => {
                for (let i = 0; i < 4; i++) {
                    const th = t * 2.2 + i * TAU / 4, s = Math.sin(th);
                    if ((s > 0) !== front)
                        continue;
                    ctx.fillStyle = ['#f00f2d', '#9b6bff', '#4aa3ff', '#ffc2c7'][i];
                    const z = s > 0 ? 2 : 1;
                    ctx.fillRect(Math.round(f[0] + Math.cos(th) * 11) - (z >> 1), Math.round(f[1] + s * 7) - (z >> 1), z, z);
                }
            };
            orbit(false);
            const pp = pe;
            pearl(pp[0], pp[1]);
            {
                const ang = Math.round(lean / (Math.PI / 8)) * (Math.PI / 8);
                sprR(f[0], f[1], ang, (u > .28 && u < .5 ? (t * 8) | 0 : (t * 3) | 0) % 2);
            }
            orbit(true);
            if (u >= .38 && u < .75) {
                const m = [f[0] + 8, f[1] - 4], k = (u - .38) / .37; /* 輕輕碰到時飄起一顆小愛心 */
                ctx.globalAlpha = Math.ceil((1 - k) * 3) / 3;
                ctx.fillStyle = '#f00f2d';
                [".#.#.", "#####", ".###.", "..#.."].forEach((r, j) => { for (let i = 0; i < 5; i++)
                    if (r[i] === '#')
                        ctx.fillRect(Math.round(m[0]) - 2 + i, Math.round(m[1]) - 10 - Math.round(k * 8) + j, 1, 1); });
                ctx.globalAlpha = 1;
            }
            /* 點擊：像素圈擴散 */
            for (let n = bursts.length - 1; n >= 0; n--) {
                const b = bursts[n], age = (now - b.t) / 1000;
                if (age > 1.1) {
                    bursts.splice(n, 1);
                    continue;
                }
                for (let k = 0; k < 2; k++) {
                    const r = (age - k * .15) * 50;
                    if (r < 0)
                        continue;
                    const cnt = Math.min(40, Math.max(12, Math.round(r * .9)));
                    ctx.globalAlpha = Math.ceil((1 - age / 1.1) * 3) / 3;
                    ctx.fillStyle = k ? '#4aa3ff' : '#f00f2d';
                    for (let i = 0; i < cnt; i++) {
                        const an = i / cnt * TAU;
                        ctx.fillRect(Math.round(b.x + Math.cos(an) * r), Math.round(b.y + Math.sin(an) * r), 2, 2);
                    }
                }
                ctx.globalAlpha = 1;
            }
            /* 故障條紋：橫條位移＋粉／紫／藍／深藍色帶 */
            if (now > nextG) {
                nextG = now + 500 + Math.random() * 900;
                addBand(Math.random() * lh | 0, 2 + (Math.random() * 9 | 0), 120 + Math.random() * 200);
            }
            for (let n = bands.length - 1; n >= 0; n--) {
                const b = bands[n];
                if (now - b.t > b.dur) {
                    bands.splice(n, 1);
                    continue;
                }
                ctx.drawImage(cv, 0, b.y, lw, b.h, b.dx, b.y, lw, b.h);
                ctx.globalAlpha = .3;
                ctx.fillStyle = b.col;
                ctx.fillRect(0, b.y, lw, b.h);
                ctx.globalAlpha = 1;
            }
            raf = requestAnimationFrame(loop);
        }
        function addBand(y, h, dur) { bands.push({ y, h, dur, t: performance.now(), dx: (Math.random() < .5 ? -1 : 1) * (3 + (Math.random() * 8 | 0)), col: COL[Math.random() * 4 | 0] }); }
        splash.addEventListener('pointerdown', e => {
            const r = splash.getBoundingClientRect(), k = splash.offsetWidth / r.width;
            const x = (e.clientX - r.left) * k / PX, y = (e.clientY - r.top) * k / PX;
            bursts.push({ x, y, t: performance.now() });
            addBand(Math.round(y) - 1, 3, 260);
        });
        const PearlaSplash = {
            start() { done = false; splash.classList.remove('out'); splash.style.display = ''; resize(); bursts.length = 0; bands.length = 0; stEl.classList.remove('ok'); t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); },
            finish() {
                if (done)
                    return;
                done = true;
                const wait = Math.max(0, MIN_MS - (performance.now() - t0));
                setTimeout(() => { stEl.classList.add('ok'); setTimeout(() => { splash.classList.add('out'); setTimeout(() => { if (done) {
                    cancelAnimationFrame(raf);
                    splash.style.display = 'none';
                } }, 950); }, 1000); }, wait);
            }
        };
        return PearlaSplash;
    }
    function makeCat() {
        const $ = s => document.querySelector(s);
        const splash = $('#splash'), stEl = $('#sp-status'), MIN_MS = 3000;
        let layer = $('#sp-layer');
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'sp-layer';
            splash.insertBefore(layer, splash.firstChild);
        }
        let t0 = 0, done = false, tms = [];
        const T = (f, ms) => { tms.push(setTimeout(f, ms)); };
        const SVG = `<div class="ct-wrap"><svg class="ct-svg" viewBox="-150 -150 300 265" xmlns="http://www.w3.org/2000/svg">
<g fill="#26262b"><path class="ct-tw" d="M-122 -96 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3z"/><path class="ct-tw" style="animation-delay:.9s" d="M118 -70 l2.5 7 7 2.5 -7 2.5 -2.5 7 -2.5 -7 -7 -2.5 7 -2.5z"/><path class="ct-tw" style="animation-delay:1.7s" d="M-98 -20 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/></g>
<path d="M-132 106H132" stroke="#26262b" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9" fill="none"/>
<path class="ct-tail" d="M46 98C96 102 104 50 80 30" stroke="#26262b" stroke-width="15" stroke-linecap="round" fill="none"/>
<ellipse cx="0" cy="62" rx="52" ry="43" fill="#26262b"/>
<g class="ct-head">
<path d="M-54 -20L-50 -76 -12 -42Z" fill="#26262b" stroke="#26262b" stroke-width="9" stroke-linejoin="round"/>
<path d="M54 -20L50 -76 12 -42Z" fill="#26262b" stroke="#26262b" stroke-width="9" stroke-linejoin="round"/>
<path d="M-45 -42L-43 -62 -29 -49Z M45 -42L43 -62 29 -49Z" fill="#f08aa0"/>
<ellipse cx="0" cy="-12" rx="62" ry="45" fill="#26262b"/>
<g stroke="#f5f3f0" stroke-width="2.5" stroke-linecap="round"><path d="M-50 2L-64 -1M-50 9L-63 13M50 2L64 -1M50 9L63 13"/></g>
<ellipse cx="0" cy="3" rx="4.5" ry="3" fill="#f08aa0"/>
<g class="ct-fish"><g transform="translate(0 -66)" stroke="#26262b" stroke-width="3" stroke-linejoin="round"><path class="ct-ft" d="M-12 0L-27 -10V10Z" fill="#fffefc"/><ellipse cx="2" cy="0" rx="15" ry="9" fill="#fffefc"/><path d="M-2-8Q3-16 9-8" fill="#f08aa0"/><path d="M-3-4V4" stroke="#f08aa0" stroke-linecap="round"/><circle cx="10" cy="-2" r="2" fill="#26262b" stroke="none"/></g></g>
<g class="ct-look">
<g class="ct-bl"><g class="ct-op"><ellipse cx="-22" cy="-14" rx="5.5" ry="10" fill="#fff"/><ellipse cx="22" cy="-14" rx="5.5" ry="10" fill="#fff"/></g></g>
</g></g>
<g fill="#26262b" stroke="#f5f3f0" stroke-width="1.5"><g class="ct-pawL"><ellipse cx="-26" cy="96" rx="15" ry="10"/><path d="M-30 98v4M-22 98v4" stroke-linecap="round"/></g><g class="ct-pawR"><ellipse cx="26" cy="96" rx="15" ry="10"/><path d="M22 98v4M30 98v4" stroke-linecap="round"/></g></g>
<g class="ct-m1" stroke="#26262b" stroke-width="3.5" stroke-linecap="round" fill="none" transform="translate(-105 82)"><path d="M-30-26L-38-36M-36-10L-47-12M-22-34V-46"/></g>
<g class="ct-m2" stroke="#26262b" stroke-width="3.5" stroke-linecap="round" fill="none" transform="translate(105 82)"><path d="M30-26L38-36M36-10L47-12M22-34V-46"/></g>
<g transform="translate(0 82)"><g class="ct-px"><g class="ct-py"><g class="ct-pr">
<circle r="22" fill="#fffefc" stroke="#26262b" stroke-width="4.5"/>
<path d="M-12-5A13 13 0 0 1-4-13" stroke="#f08aa0" stroke-width="3.5" stroke-linecap="round" fill="none"/><circle cx="-14" cy="3" r="1.8" fill="#f08aa0"/>
</g></g></g></g>
</svg></div>`;
        function mount() { layer.innerHTML = SVG; }
        mount();
        splash.addEventListener('pointerdown', e => {
            const r = splash.getBoundingClientRect(), h = document.createElement('div');
            h.className = 'ct-heart';
            h.style.left = (e.clientX - r.left) + 'px';
            h.style.top = (e.clientY - r.top) + 'px';
            h.innerHTML = '<svg viewBox="0 0 26 24"><path d="M13 22C4 15 2 10 2 7a5.5 5.5 0 0 1 11-1 5.5 5.5 0 0 1 11 1c0 3-2 8-11 15z" fill="#f08aa0" stroke="#26262b" stroke-width="2.4" stroke-linejoin="round"/></svg>';
            layer.appendChild(h);
            setTimeout(() => h.remove(), 1000);
        });
        return {
            start() { done = false; splash.classList.remove('out'); splash.style.display = ''; stEl.classList.remove('ok'); mount(); tms.forEach(clearTimeout); tms = []; t0 = performance.now(); },
            finish() {
                if (done)
                    return;
                done = true;
                const wait = Math.max(0, MIN_MS - (performance.now() - t0));
                T(() => {
                    stEl.classList.add('ok');
                    T(() => { splash.classList.add('out'); T(() => { if (done)
                        splash.style.display = 'none'; }, 950); }, 1000);
                }, wait);
            }
        };
    }
    var SPM = { fog: makeFog, clay: makeClay, moon: makeMoon, pixel: makePixel, cat: makeCat };
    var sp = SPM[document.documentElement.dataset.sp] || makeClay;
    try {
        window.PearlaSplash = sp();
        window.PearlaSplash.start();
        setTimeout(function () { window.PearlaSplash.finish(); }, 8000);
    }
    catch (e) {
        var s = document.getElementById('splash');
        if (s)
            s.style.display = 'none';
    }
})();
