import path from 'path';
import fetch from 'node-fetch';
import Express from 'express';
import {log} from './utils';
import {Database} from 'sqlite3';
import {load as loadYaml} from 'node-yaml-config';

const dbName = Express().get('dbName');
const config = loadYaml(path.join(__dirname, '..', '..', 'config.yaml'));

const pingClients = () => {
  if (config.notifications.gcm.enabled) {
    const db = new Database(dbName);
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
  } else {
    log('PUSH', 'SERVER_KEY env variable was not set. Will not push notifications');
  }
};

export const addEvent = (host, type, healthy, title, body) => {
  log('EVENT', `Adding event for host ${host}: "${title}: ${body}"`);
  const db = new Database(dbName);

  const fields = 'host, type, healthy, title, body, time';
  const values = `'${host}', '${type}', '${healthy}', '${title}', '${body}', (SELECT strftime('%s', 'now'))`;

  db.serialize(() => {
    db.run(`INSERT INTO events (${fields}) VALUES(${values})`, (err) => {
      if (err !== null) {
        log('EVENT', 'Error adding event: ' + err);
        return false;
      }
      pingClients();
      return true;
    });
  });
  db.close();
};
