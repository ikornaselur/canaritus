import fetch from 'node-fetch';
import {log} from '../utils';
import {Database} from 'sqlite3';

const gcmNotification = (config) => {
  const db = new Database('canaritus.db');
  log('PUSH', 'Pinging all clients');
  db.serialize(() => {
    db.all('SELECT * FROM ids', (err, rows) => {
      if (err !== null) {
        log('PUSH', 'Failed to select registration ids');
      } else {
        const ids = rows.map(x => x.id);
        log('PUSH', 'Pushing to following ids: ' + ids.map(x => x.substring(0, 10) + '...'));
        fetch(config.notifications.gcm.endpoint, {
          method: 'post',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `key=${config.notifications.gcm.server_key}`,
          },
          body: JSON.stringify({
            'registration_ids': ids,
          }),
        }).then((res) => {
          log('PUSH', 'Notification pings sent, status: ' + res.status);
        });
      }
    });
  });
  db.close();
};

export default gcmNotification;
