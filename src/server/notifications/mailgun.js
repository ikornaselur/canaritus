import Mailgun from 'mailgun-js';
import path from 'path';
import {Database} from 'sqlite3';
import {log} from '../utils';
import {load as loadYaml} from 'node-yaml-config';

const _config = loadYaml(path.join(__dirname, '..', '..', '..', 'config.yaml'));
let _mailgun;
let _from;

const generateEmailData = (emails, from, subject, body, canUnsubscribe = true) => {
  const recipientVariables = {};
  for (const email of emails) {
    recipientVariables[email.email] = {
      unsubscribeUrl: email.unsubscribeUrl,
      forceSingularEmail: true,
    };
  }

  let html = body;

  const unsubscribeFooter = '<br/><br/><br/><a href=\'%recipient.unsubscribeUrl%\'>unsubscribe</a>';
  if (canUnsubscribe) {
    html += unsubscribeFooter;
  }

  const addresses = emails.map(x => x.email).join(', ');

  return {
    from: `Canaritus <${from}>`,
    to: addresses,
    'recipient-variables': JSON.stringify(recipientVariables),
    subject,
    html,
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

  db.all('SELECT email, hash FROM emails WHERE verified="true"', (err, rows) => {
    if (err !== null) {
      log('DB', 'Failed to get emails from db', err);
    } else {
      if (rows.length > 0) {
        const protocol = _config.https ? 'https' : 'http';

        const emails = rows.map(x => {
          return {
            email: x.email,
            unsubscribeUrl: `${protocol}://${_config.hostname}/api/email/unsubscribe/${encodeURIComponent(x.hash)}`,
          };
        });

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
  const encoded = encodeURIComponent(hash);

  const verifyUrl = `${protocol}://${_config.hostname}/api/email/verify/${encoded}`;

  const title = 'Canaritus status updates';
  const body = `
  You've just signed up for Canaritus status updates. <br/>
  Please verify the email subscription <a href='${verifyUrl}'>here</a>. <br/><br/><br/>`;

  const data = generateEmailData([{email}], _from, title, body, false);

  _mailgun.messages().send(data, (err) => {
    if (err) {
      log('MAILGUN', 'Error sending verification email', err);
    }
  });
};
