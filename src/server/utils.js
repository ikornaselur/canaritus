const fetch = require('node-fetch');

module.exports = (db, config, gcmEndpoint) => {
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
    if (config.notifications.gcm.enabled) {
      log('PUSH', 'Pinging all clients');
      db.all('SELECT * FROM ids', (err, rows) => {
        if (err !== null) {
          log('PUSH', 'Failed to select registration ids');
        } else {
          const ids = rows.map(x => x.id);
          log('PUSH', 'Pushing to following ids: ' + ids);
          fetch(gcmEndpoint, {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `key=${config.notifications.gcm.server_key}`,
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

  const addEvent = (host, type, healthy, title, body) => {
    log('EVENT', `Adding event for host ${host}: "${title}: ${body}"`);

    const fields = 'host, type, healthy, title, body, time';
    const values = `'${host}', '${type}', '${healthy}', '${title}', '${body}', datetime('now')`;

    db.run(`INSERT INTO events (${fields}) VALUES(${values})`, (err) => {
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
