import {default as Mailgun} from 'mailgun-js';
import {log} from '../utils';

let _mailgun;
let _from;

const generateEmailData = (emails, from, title, body) => {
  // Random hash to force mailgun to send each recipient an individual email, instead of
  // grouping them all together (and exposing emails) in the `to` header.
  // This random hash will be replaced with a `unsubscribe` hash/url in the future
  const randHash = (len) => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, len);

  const recipientVariables = {};
  emails.map((e) => {
    recipientVariables[e] = {hash: randHash(10)};
  });


  return {
    'from': `Canaritus <${from}>`,
    'to': emails.join(', '),
    'recipient-variables': JSON.stringify(recipientVariables),
    'subject': title,
    'html': body,
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
  const emails = [];
  const data = generateEmailData(emails, _from, title, body);

  log('MAILGUN', 'Sending emails');
  _mailgun.messages().send(data, (err) => {
    if (err) {
      log('MAILGUN', 'Error sending email', err);
    }
  });
};
