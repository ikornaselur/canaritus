import {log} from '../utils';
import {Database} from 'sqlite3';
import {addAuthToken, sendWebPush} from 'web-push-encryption';

const plusIcon = '/images/CanaryStatus_plus_256px.png';
const minusIcon = '/images/CanaryStatus_minus_256px.png';

export const initialize = (config) => {
  if (config.enabled) {
    addAuthToken('https://android.googleapis.com/gcm', config.auth_token);
  }
};

const generateSubscription = (row) => {
  return {
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth,
    },
  };
};

export const notify = (title, body, healthy) => {
  const message = JSON.stringify({
    title,
    body,
    tag: `canaritus-notification-tag-${healthy ? 'healthy' : 'unhealthy'}`,
    icon: healthy ? plusIcon : minusIcon,
  });
  const db = new Database('canaritus.db');

  log('PUSH', 'Pinging all clients');
  db.all('SELECT * FROM subscriptions', (err, rows) => {
    if (err !== null) {
      log('DB', 'Failed get all push registrations from db', err);
    } else {
      const subscriptions = rows.map(x => generateSubscription(x));
      log('PUSH', `Pushing to ${subscriptions.length} subscriptions`);

      const handlePushResult = (res) => {
        log('PUSH', `Notification ping sent, status: ${res.status}`);
      };

      for (const sub of subscriptions) {
        sendWebPush(message, sub).then(handlePushResult);
      }
    }
  });
  db.close();
};
