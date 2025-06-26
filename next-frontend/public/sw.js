// public/sw.js

self.addEventListener('push', function (event) {
    const data = event.data?.json() || {};

    const title = data.title || '通知';
    const options = {
        body: data.body || '',
        icon: '/icon-192x192.png', // 通知アイコン（public配下に置く）
        badge: '/badge-icon.png',  // バッジ（任意）
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 通知をクリックしたときの動作（任意）
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            for (const client of clientList) {
                if (client.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/'); // 通知から遷移するページ
            }
        })
    );
});
