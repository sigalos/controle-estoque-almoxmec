// O Antídoto: Este Service Worker substitui o antigo, apaga todo o cache e se desinstala.

self.addEventListener('install', (e) => {
  // Força o celular a instalar essa versão imediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    // Procura todos os caches antigos guardados no celular
    caches.keys().then((keys) => {
      // Deleta todos eles
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      // Após deletar a memória, o Service Worker comete "suicídio" e se desregistra
      self.registration.unregister();
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Não fazemos nada com as requisições, apenas deixamos a internet fluir normalmente
});