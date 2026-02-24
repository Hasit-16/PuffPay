// An empty service worker satisfies Chrome's requirement for a PWA install prompt.
self.addEventListener("install", () => {
    // Skip over the "waiting" lifecycle state, to ensure that our
    // new service worker is activated immediately, even if there's
    // another tab open controlled by our older service worker code.
    self.skipWaiting();
});

self.addEventListener("activate", () => {
    // Optional: Get a list of all the current open windows/tabs under
    // our service worker's control, and force them to reload.
    // This can "unbreak" any open tabs that were waiting for an update.
});

self.addEventListener("fetch", (event) => {
    // Add custom fetch logic here if needed for offline support
});
