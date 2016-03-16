/* eslint-env serviceworker */
self.addEventListener('push', (event) => {
  if (event.data) {
    const {title} = event.data.json();
    return self.registration.showNotification(title, event.data.json());
  }
  const title = 'An error occurred';
  const body = 'We were unable to get the information for this push message';
  const tag = 'notification-error';

  return self.registration.showNotification(title, {
    body: body,
    icon: '/images/CanaryStatus_minus_256px.png',
    tag: tag,
  });
});

self.addEventListener('notificationclick', (event) => {
  console.log('On notification click: ', event.notification.tag);
  // Android doesn't close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window',
  }).then((clientList) => {
    for (var i = 0; i < clientList.length; i++) { // eslint-disable-line no-var, vars-on-top
      const client = clientList[i];
      if (client.url === '/' && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  }));
});
