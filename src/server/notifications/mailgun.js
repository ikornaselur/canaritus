import {default as Mailgun} from 'mailgun-js';
import {log} from '../utils';

let mailgun;
let from;


export const initialize = (config) => {
  if (config.enabled) {
    mailgun = new Mailgun({
      apiKey: config.api_key,
      domain: config.domain,
    });
    from = config.from;
  }
};

export const notify = (title, body) => {
  const data = {
    from: `Canaritus <${from}>`,
    to: '',  // TODO: Emails?
    subject: title,
    html: body,
  };

  log('MAILGUN', 'Sending emails');
  mailgun.messages().send(data, (err) => {
    if (err) {
      log('MAILGUN', 'Error sending email', err);
    }
  });
};
