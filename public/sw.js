self.addEventListener('install', (e) => {
    self.skipWaiting(); // Forces the waiting service worker to become the active service worker
});

self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim()); // Claim all clients immediately
});

self.addEventListener('fetch', (e) => {
    // Dummy fetch listener to satisfy Chrome's PWA requirement.
    // Without this, Chrome will NOT install the app in standalone mode.
});
