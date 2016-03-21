import path from 'path';
import {load as loadYaml} from 'node-yaml-config';
import {Database} from 'sqlite3';

import {log} from '../utils';
import {addEvent} from '../events';

const config = loadYaml(path.join(__dirname, '..', '..', '..', 'config.yaml'));

export const getStatus = (req, res) => {
  const hosts = Object.keys(config.hosts);
  res.json(hosts);
};

export const subscribe = (req, res) => {
  const {endpoint, keys} = req.body;
  if (!endpoint) {
    res.status(422).send('id is missing from the post');
  } else if (!keys || !keys.p256dh || !keys.auth) {
    res.status(422).send('keys are missing fromt he post');
  } else {
    log('DB', `Adding ${endpoint} to subscriptions table`);
    const statementKeys = ['endpoint', 'p256dh', 'auth'].join(', ');
    const statementValues = [endpoint, keys.p256dh, keys.auth].map((x) => `'${x}'`).join(', ');

    const statement =
      `INSERT OR IGNORE INTO subscriptions (${statementKeys}) VALUES(${statementValues})`;

    const db = new Database('canaritus.db');
    db.run(statement, (err) => {
      if (err !== null) {
        log('DB', 'Error adding subscription', err);
        res.sendStatus(500);
      } else {
        res.sendStatus(201);
      }
    });
    db.close();
  }
};

export const unsubscribe = (req, res) => {
  const {endpoint} = req.body;
  if (!endpoint) {
    res.status(422).send('endpoint is missing from the post');
  } else {
    log('DB', `Removing ${endpoint} from subscriptions table`);
    const db = new Database('canaritus.db');
    db.run(`DELETE FROM subscriptions WHERE endpoint='${endpoint}'`, (err) => {
      if (err !== null) {
        log('DB', 'Error removing id', err);
        res.sendStatus(500);
      } else {
        res.sendStatus(204);
      }
    });
    db.close();
  }
};

export const getEvent = (req, res) => {
  const db = new Database('canaritus.db');
  db.get('SELECT * FROM events ORDER BY time DESC LIMIT 1', (err, event) => {
    if (err !== null) {
      res.status(500).send('Failed to get latest event');
    } else {
      res.status(200).json({
        title: event.title,
        body: event.body,
        healthy: event.healthy,
      });
    }
  });
  db.close();
};

export const postEvent = (req, res) => {
  const {host, type, healthy, title, body} = req.body;
  const requiredMissing = [host, type, healthy, title, body]
    .map((x) => typeof x === 'undefined')
    .find((x) => x);
  if (requiredMissing) {
    res.status(400).send('The following fields are required: title, body, host, type and healthy');
  } else {
    addEvent(host, type, healthy, title, body);
    res.sendStatus(201);
  }
};
