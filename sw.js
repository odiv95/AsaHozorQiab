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

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});