/* Pearla 離線快取：第一次連線後，之後沒有網路也能打開
   - 核心檔案（網頁、樣式、程式）安裝時一次存好
   - 圖片、字體等其他檔案：用到時存起來，之後離線也看得到
   - 有網路時，網頁與程式優先拿最新版（拿到就更新快取）；沒網路才用快取
   更新網站後請把 VERSION 改一個數字，舊快取才會被清掉 */
const VERSION = 'pearla-v7';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'favicon.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'styles/base.css', 'styles/features.css', 'styles/glass.css', 'styles/journal.css', 'styles/moon.css',
  'styles/pixel.css', 'styles/cat.css', 'styles/doodle.css', 'styles/splash.css', 'styles/fixes.css', 'modules/profile.css',
  'modules/splash.js', 'modules/fixes.js', 'modules/anniversary.js', 'modules/doodle.js', 'modules/data-usage.js', 'modules/profile.js',
  'modules/app/01-core.js', 'modules/app/02-views.js', 'modules/app/02b-contact-guide.js', 'modules/app/03-cards.js',
  'modules/app/04-reply.js', 'modules/app/05-calendar.js', 'modules/app/06-inspiration.js', 'modules/app/07-meihua.js',
  'modules/app/08-tools.js', 'modules/app/09-moments.js', 'modules/app/10-answerbook.js', 'modules/app/11-events.js',
  'modules/app/12-chat-extras.js', 'modules/app/12b-chat-export.js', 'modules/app/13-mailbox.js', 'modules/app/14-ui-extras.js',
  'modules/app/15-boot.js', 'modules/app/17-pct.js',
  'assets/fonts/ChenYuluoyan-2_0-Thin.woff', 'assets/fonts/JasonHandwriting1.woff'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const isCode = u => /\.(html|css|js|webmanifest)$/.test(u.pathname) || u.pathname.endsWith('/');
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  const same = u.origin === location.origin;
  const font = u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (!same && !font) return;
  if (same && isCode(u)) {
    /* 網頁與程式：先連網拿最新，失敗（離線）才用快取 */
    e.respondWith(fetch(req).then(r => {
      if (r && r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
      return r;
    }).catch(() => caches.match(req).then(m => m || (req.mode === 'navigate' ? caches.match('index.html') : undefined))));
    return;
  }
  /* 圖片、字體：有快取就直接用，沒有再連網並存起來 */
  e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => {
    if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
    return r;
  })));
});
