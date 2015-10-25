const fetch = require('node-fetch');

module.exports = (db, gcmEndpoint, serverKey) => {
  const timeStamp = () => {
    const now = new Date();
    const twoNum = (num) => {
      return num < 10 ? '0' + num : num.toString();
    };
    const date = `${now.getFullYear()}-${twoNum(now.getMonth())}-${twoNum(now.getDate())}`;
    const time = `${twoNum(now.getHours())}:${twoNum(now.getMinutes())}:${twoNum(now.getSeconds())}`;
    return `${date} ${time}`;
  };

  const log = (type, string) => {
    console.log(`${timeStamp()} - ${type} - ${string}`);
  };

  const pingClients = () => {
    if (serverKey) {
      log('PUSH', 'Pinging all clients');
      db.all('SELECT * FROM ids', (err, rows) => {
        if (err !== null) {
          log('PUSH', 'Failed to select registration ids');
        } else {
          const ids = rows.map(x => x.id);
          fetch(gcmEndpoint, {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `key=${serverKey}`,
            },
            body: JSON.stringify({
              'registration_ids': ids,
            }),
          }).then((res) => {
            log('PUSH', 'Notification pings sent, status:', res.status);
          });
        }
      });
    } else {
      log('PUSH', 'SERVER_KEY env variable was not set. Will not push notifications');
    }
  };

  const addEvent = (title, body) => {
    log('EVENT', `Adding event "${title}: ${body}"`);
    db.run(`INSERT INTO events (title, body, time) VALUES('${title}', '${body}', datetime('now'))`, (err) => {
      if (err !== null) {
        log('EVENT', 'Error adding event', err);
        return false;
      }
      pingClients();
      return true;
    });
  };

  const healthCheck = (url, status) => {
    log('UPTIME', 'Health check: ' + url);
    return fetch(url).then((res) => {
      return res.status === status;
    });
  };

  return {
    log: log,
    addEvent: addEvent,
    healthCheck: healthCheck,
  };
};
