// نسخه برنامه
const APP_VERSION = '1.7.3'; // ← هر بار تغییر دادید، فقط این عدد را عوض کنید

// Cache Name بر اساس نسخه برنامه
const CACHE_NAME = `attendance-app-cache-v${APP_VERSION}`;
const ASSETS = [
  '/',               // صفحه اصلی
  '/index.html',
  '/manifest.json',
  'Images/LogoHozor192.png',
  'Images/LogoHozor512.png',
];

self.addEventListener('install', event => {
    console.log('📦 Service Worker نصب شد');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('🚀 Service Worker فعال شد');
    // حذف کش‌های قدیمی
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(
                keys.map(key => key !== CACHE_NAME && caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(res => 
            res || fetch(event.request).then(net => {
                if (net && net.status === 200) {
                    const copy = net.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
                }
                return net;
            }).catch(() => caches.match('/index.html'))
        )
    );
});

// پیام‌ها از main.js
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
