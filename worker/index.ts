// @ts-nocheck
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// To disable all workbox logging during development
self.__WB_DISABLE_DEV_LOGS = true;

// Listen for push events
self.addEventListener("push", (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "New Notification";
    const options = {
        body: data.body || "You have a new notification.",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        data: data.data || {},
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Optionally handle notification clicks
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    // Handle URL redirect if provided in push payload data
    const urlToOpen = event.notification.data?.url || "/dashboard";

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // If so, just focus it.
                if (client.url === urlToOpen && "focus" in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
