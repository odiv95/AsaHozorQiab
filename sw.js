// sw.js - نسخه اصلاح شده
const CACHE_NAME = 'attendance-app-v1.2';
const urlsToCache = [
  '/',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        // استفاده از add به جای addAll برای مدیریت خطاها بهتر است
        return Promise.all(
          urlsToCache.map(function(url) {
            return cache.add(url).catch(function(error) {
              console.log('Failed to cache:', url, error);
            });
          })
        );
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // اگر فایل در cache پیدا شد برگردان
        if (response) {
          return response;
        }
        
        // در غیر این صورت از شبکه fetch کن
        return fetch(event.request).then(function(response) {
          // بررسی کن که response معتبر است
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // response را clone کن چون فقط یک بار می‌توان خواند
          var responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(function() {
        // اگر هر دو روش شکست خوردند، صفحه fallback نشان بده
        return new Response('اپلیکیشن حضور و غیاب', {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
  );
});

// هنگام نصب، فوراً SW فعال شود
self.addEventListener('install', event => {
  self.skipWaiting(); // نصب و فعال شدن سریع
});

// هنگام فعال شدن، کنترل تمام clients را بگیرد
self.addEventListener('activate', function(event) {
  event.waitUntil(
    (async () => {
      // حذف کش‌های قدیمی
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );

      // فعال‌سازی فوری
      await self.clients.claim();

      // اطلاع به تمام صفحات باز برای ری‌لود
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach(client => {
        client.postMessage({ type: 'SW_UPDATED' });
      });
    })()
  );
});
