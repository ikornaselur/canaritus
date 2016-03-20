import path from 'path';
import {log} from './utils';
import {Database} from 'sqlite3';
import {load as loadYaml} from 'node-yaml-config';
import {
  gcmNotify,
  mailgunNotify,
  devNotify
} from './notifications';

const config = loadYaml(path.join(__dirname, '..', '..', 'config.yaml'));

const pingClients = (title, body, healthy) => {
  const {
    gcm,
    mailgun,
    development
  } = config.notifications;

  if (gcm.enabled) {
    gcmNotify(title, body, healthy);
  }
  if (development.enabled) {
    devNotify(title, body);
  }
  if (mailgun.enabled) {
    mailgunNotify(title, body, healthy);
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
      pingClients(title, body, healthy);
      return true;
    });
  });
  db.close();
};
