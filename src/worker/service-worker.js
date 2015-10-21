self.addEventListener('push', (event) => {
  console.log('Received a push message', event);

  const title = 'Yay a message.';
  const body = 'We have received a push message.';
  const icon = '/images/icon-256x256.png';
  const tag = 'canaritus-notification-tag';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      tag: tag,
    })
  );
});
