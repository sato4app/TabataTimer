// Service Workerのバージョン
const cacheName = 'tabata-timer-v1';

// キャッシュするファイルのリスト
const cacheFiles = [
  '/index.html',
  '/app.js',
  '/styles.css'
];

// インストール時の処理
self.addEventListener('install', function(e) {
  console.log('Service Worker Installed');
  
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('Caching Files');
      return cache.addAll(cacheFiles);
    })
  );
});

// アクティベート時の処理
self.addEventListener('activate', function(e) {
  console.log('Service Worker Activated');
  
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(thisCacheName) {
        // 古いキャッシュを削除
        if (thisCacheName !== cacheName) {
          console.log('Removing old cache');
          return caches.delete(thisCacheName);
        }
      }));
    })
  );
});

// リクエストのフェッチ時の処理
self.addEventListener('fetch', function(e) {
  console.log('Fetching', e.request.url);
  
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
