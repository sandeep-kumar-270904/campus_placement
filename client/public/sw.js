// Service Worker for PLACEearly Web Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'PLACEearly Alert', body: event.data.text() };
    }
  }

  const title = data.title || 'PLACEearly Placement Alert';
  const options = {
    body: data.body || 'You have an important campus placement update.',
    icon: data.icon || '/favicon.svg',
    badge: data.badge || '/favicon.svg',
    data: {
      deepLink: data.deepLink || '/student/dashboard',
      notificationId: data.notificationId || null,
    },
    vibrate: [200, 100, 200],
    requireInteraction: Boolean(data.isMandatory),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const deepLink = event.notification.data?.deepLink || '/student/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(deepLink);
          return client.focus();
        }
      }
      // Otherwise open new tab
      if (clients.openWindow) {
        return clients.openWindow(deepLink);
      }
    })
  );
});
