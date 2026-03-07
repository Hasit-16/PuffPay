/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2'
            }
        };

        event.waitUntil(
            sw.registration.showNotification(data.title, options)
        );
    }
});

sw.addEventListener('notificationclick', function (event) {
    event.notification.close();

    // Focus or open the app when a notification is clicked
    event.waitUntil(
        sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return sw.clients.openWindow('/');
        })
    );
});
