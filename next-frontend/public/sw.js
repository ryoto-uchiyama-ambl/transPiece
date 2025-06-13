self.addEventListener('push', function (event) {
    const data = event.data.json();

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192x192.png'
    });
})