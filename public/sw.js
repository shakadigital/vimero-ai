self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});

self.addEventListener('fetch', (event) => {
  // Cukup me-pass request agar browser menganggap ini PWA valid
  // Untuk implementasi offline yang lebih kompleks, bisa ditambah strategi cache di sini
});
