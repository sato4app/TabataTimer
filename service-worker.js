// Service Workerのバージョン
const CACHE_NAME = 'tabata-timer-v0.1';

// キャッシュするファイルのリスト
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/TimerIcon-192.png',
  '/TimerIcon-512.png'
];

// インストール時の処理
self.addEventListener('install', event => {
  console.log('Service Worker Installed');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching Files');
        return cache.addAll(urlsToCache);
      })
  );
});

// アクティベート時の処理
self.addEventListener('activate', event => {
  console.log('Service Worker Activated');
  
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Removing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// リクエストのフェッチ時の処理
self.addEventListener('fetch', event => {
  console.log('Fetching', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
