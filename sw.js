const CACHE_NAME = 'almoxcell-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Instalação e Cache dos arquivos estruturais
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Resposta às requisições (Network First)
self.addEventListener('fetch', (e) => {
  // Ignora requisições do Firebase/Firestore
  if (e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('firebasejs')) {
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .then((respostaRede) => {
        // Se a internet estiver funcionando, atualiza o cache com o arquivo mais novo
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, respostaRede.clone());
          return respostaRede;
        });
      })
      .catch(() => {
        // Se estiver offline ou a rede falhar, puxa do cache
        return caches.match(e.request);
      })
  );
});