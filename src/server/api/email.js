import {log} from '../utils';
import fetch from 'node-fetch';
import path from 'path';
import {Database} from 'sqlite3';
import {verifyEmail} from '../notifications/mailgun';
import {AES, enc as encoding} from 'crypto-js';
import {load as loadYaml} from 'node-yaml-config';

const _config = loadYaml(path.join(__dirname, '..', '..', '..', 'config.yaml'));

const validateEmail = (email) => {
  const base = (string) => new Buffer(string).toString('base64');
  const auth = base(`api:${_config.notifications.mailgun.public_key}`);
  const basic = `Basic ${auth}`;

  return fetch(`https://api.mailgun.net/v3/address/validate?address=${email}`, {
    method: 'get',
    headers: {
      Authorization: basic,
    },
  });
};

export const verify = (req, res) => {
  const {hash} = req.params;
  const email = AES.decrypt(hash, _config.secret).toString(encoding.Utf8);
  if (email.length === 0) {
    res.sendStatus(422);
  } else {
    const db = new Database('canaritus.db');
    db.run(`UPDATE emails SET verified='true' WHERE email='${email}'`, (err) => {
      if (err !== null) {
        log('DB', `Error updating "verify" on ${email}`, err);
      } else {
        res.sendStatus(200);
      }
    });
    db.close();
  }
};

export const subscribe = (req, res) => {
  const {email} = req.body;
  if (!email) {
    res.status(422).send('email is missing from the post');
  } else {
    validateEmail(email).then((reply) => {return reply.json();}).then((data) => {
      if (data.is_valid) {
        const db = new Database('canaritus.db');
        const hash = AES.encrypt(email, _config.secret).toString();
        log('EMAIL', `Adding ${email} (unverified) to the email list`);
        db.run(
          `INSERT INTO emails (email, hash) VALUES($email, '${hash}')`,
          {$email: email}, // Sanitized user input
          (err) => {
            if (err !== null) {
              if (err.errno === 19) { // Email already in db
                res.status(409).send('email exists');
              } else {
                log('DB', 'Error adding email to db', err);
                res.sendStatus(500);
              }
            } else {
              verifyEmail(email, hash);
              res.sendStatus(201);
            }
          }
        );
        db.close();
      } else {
        res.status(422).send('Email is invalid');
      }
    });
  }
};

export const unsubscribe = (req, res) => {
  const {hash} = req.params;
  const email = AES.decrypt(hash, _config.secret).toString(encoding.Utf8);
  if (email.length === 0) {
    res.sendStatus(422);
  } else {
    const db = new Database('canaritus.db');
    db.run('DELETE FROM emails WHERE email=$email', {$email: email}, (err) => {
      if (err !== null) {
        log('DB', 'Error deleting email from db', err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    });
    db.close();
  }
};
