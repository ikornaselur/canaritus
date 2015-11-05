import path from 'path';
import {load as loadYaml} from 'node-yaml-config';
import {Database} from 'sqlite3';

import {log} from '../utils.js';

const config = loadYaml(path.join(__dirname, '/../../../config.yaml'));

export const getStatus = (req, res) => {
  const hosts = Object.keys(config.hosts);
  res.json(hosts);
};

export const getHostStatus = (req, res) => {
  const db = new Database('canaritus.db');
  const host = req.params.host;

  db.serialize(() => {
    db.all(`SELECT * FROM events WHERE host='${host}'`, (err, events) => {
      if (err) {
        res.status(500).send('Unable to get events');
      } else if (events.length === 0) {
        res.sendStatus(404);
      } else {
        res.status(200).json(events);
      }
    });
  });
  db.close();
};

export const subscribe = (req, res) => {
  const db = new Database('canaritus.db');
  const id = req.body.id;
  if (!id) {
    res.status(400).send('id is missing from the post');
  } else {
    log('DB', `Adding ${id} to ids table`);
    db.serialize(() => {
      db.run(`INSERT OR IGNORE INTO ids (id) VALUES('${id}')`, (err) => {
        if (err !== null) {
          log('DB', 'Error adding id', err);
          res.sendStatus(500);
        } else {
          res.sendStatus(201);
        }
      });
    });
    db.close();
  }
};

export const unsubscribe = (req, res) => {
  const db = new Database('canaritus.db');
  const id = req.body.id;
  if (!id) {
    res.status(400).send('id is missing from the post');
  } else {
    log('DB', `Removing ${id} from ids table`);
    db.serialize(() => {
      db.run(`DELETE FROM ids WHERE id='${id}'`, (err) => {
        if (err !== null) {
          log('DB', 'Error removing id', err);
          res.sendStatus(500);
        } else {
          res.sendStatus(204);
        }
      });
    });
    db.close();
  }
};

export const getEvent = (req, res) => {
  const db = new Database('canaritus.db');
  db.serialize(() => {
    db.get('SELECT * FROM events ORDER BY time DESC LIMIT 1', (err, event) => {
      if (err !== null) {
        res.status(500).send('Failed to get latest event');
      } else {
        res.status(200).json({
          title: event.title,
          body: event.body,
        });
      }
    });
  });
  db.close();
};
