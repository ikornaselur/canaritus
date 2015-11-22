import path from 'path';
import {log} from './utils';
import {Database} from 'sqlite3';
import {load as loadYaml} from 'node-yaml-config';
import {gcmNotification, developmentNotification} from './notifications';

const config = loadYaml(path.join(__dirname, '..', '..', 'config.yaml'));

const pingClients = (title, body) => {
  const {gcm, development} = config.notifications;
  if (gcm.enabled) {
    gcmNotification(config);
  }
  if (development.enabled) {
    developmentNotification(title, body);
  }
};

export const addEvent = (host, type, healthy, title, body) => {
  log('EVENT', `Adding event for host ${host}: "${title}: ${body}"`);
  const db = new Database('canaritus.db');

  const fields = 'host, type, healthy, title, body, time';
  const values = `'${host}', '${type}', '${healthy}', '${title}', '${body}', (SELECT strftime('%s', 'now'))`;

  db.serialize(() => {
    db.run(`INSERT INTO events (${fields}) VALUES(${values})`, (err) => {
      if (err !== null) {
        log('EVENT', 'Error adding event: ' + err);
        return false;
      }
      pingClients(title, body);
      return true;
    });
  });
  db.close();
};
