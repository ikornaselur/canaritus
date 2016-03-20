import Mailgun from 'mailgun-js';
import path from 'path';
import {Database} from 'sqlite3';
import {log, randHash} from '../utils';
import {load as loadYaml} from 'node-yaml-config';

const _config = loadYaml(path.join(__dirname, '..', '..', '..', 'config.yaml'));
let _mailgun;
let _from;

const generateEmailData = (emails, from, title, body) => {
  // Random hash to force mailgun to send each recipient an individual email, instead of
  // grouping them all together (and exposing emails) in the `to` header.
  // This random hash will be replaced with a `unsubscribe` hash/url in the future

  const recipientVariables = {};
  for (const email of emails) {
    recipientVariables[email] = {hash: randHash(10)};
  }

  return {
    from: `Canaritus <${from}>`,
    to: emails.join(', '),
    'recipient-variables': JSON.stringify(recipientVariables),
    subject: title,
    html: body,
  };
};

export const initialize = (config) => {
  if (config.enabled) {
    _mailgun = new Mailgun({
      apiKey: config.api_key,
      domain: config.domain,
    });
    _from = config.from;
  }
};

export const notify = (title, body) => {
  const db = new Database('canaritus.db');
  db.all('SELECT email FROM emails WHERE verified="true"', (err, rows) => {
    if (err !== null) {
      log('DB', 'Failed to get emails from db', err);
    } else {
      if (rows.length > 0) {
        const emails = rows.map(x => x.email);

        const data = generateEmailData(emails, _from, title, body);

        _mailgun.messages().send(data, (mailErr) => {
          if (mailErr) {
            log('MAILGUN', 'Error sending email', mailErr);
          }
        });
      }
    }
  });
  db.close();
};

export const verifyEmail = (email, hash) => {
  const protocol = _config.https ? 'https' : 'http';
  const verifyUrl = `${protocol}://${_config.hostname}/api/email/verify/${encodeURIComponent(hash)}`;
  const title = 'Canaritus status updates';
  const body = `You've just signed up for Canaritus status updates. Please verify the email subscription <a href='${verifyUrl}'>here</a>.`; // eslint-disable-line max-len

  const data = generateEmailData([email], _from, title, body);

  _mailgun.messages().send(data, (err) => {
    if (err) {
      log('MAILGUN', 'Error sending verification email', err);
    }
  });
};
