import {log} from '../utils';
import path from 'path';
import {Database} from 'sqlite3';
import {verifyEmail} from '../notifications/mailgun';
import {AES, enc as encoding} from 'crypto-js';
import {load as loadYaml} from 'node-yaml-config';

const config = loadYaml(path.join(__dirname, '..', '..', '..', 'config.yaml'));

export const verify = (req, res) => {
  const {hash} = req.params;
  const email = AES.decrypt(hash, config.secret).toString(encoding.Utf8);
  if (email.length === 0) {
    res.sendStatus(421);
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
  const db = new Database('canaritus.db');
  const {email} = req.body;
  if (!email) {
    res.status(421).send('email is missing from the post');
  } else {
    const hash = AES.encrypt(email, config.secret).toString();
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
  }
};

export const unsubscribe = (req, res) => {
  const {hash} = req.params;
  const email = AES.decrypt(hash, config.secret).toString(encoding.Utf8);
  if (email.length === 0) {
    res.sendStatus(421);
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
