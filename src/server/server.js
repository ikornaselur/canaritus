const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');
const PeriodicTask = require('periodic-task');

const app = express();
const db = new sqlite3.Database('canaritus.db');
db.run('CREATE TABLE IF NOT EXISTS ids (id TEXT, UNIQUE(id))');
db.run('CREATE TABLE IF NOT EXISTS events (title TEXT, body TEXT, time DATETIME)');

const PORT = 3000;
const SERVER_KEY = process.env.SERVER_KEY;
const GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';
const HOST_URL = process.env.HOST_URL;
const HOST_CODE = process.env.HOST_CODE || 200;

var IS_HEALTHY = true; // eslint-disable-line no-var,vars-on-top

if (!SERVER_KEY) {
  console.log('SERVER_KEY env variable not set, will not be able to send push notification.');
}
if (!HOST_URL) {
  console.log('HOST_URL env variable not set, will not do health checks.');
}

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
  log('PUSH', 'Pinging all clients');
  db.all('SELECT * FROM ids', (err, rows) => {
    if (err !== null) {
      log('PUSH', 'Failed to select registration ids');
    } else {
      const ids = rows.map(x => x.id);
      fetch(GCM_ENDPOINT, {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `key=${SERVER_KEY}`,
        },
        body: JSON.stringify({
          'registration_ids': ids,
        }),
      }).then((res) => {
        log('PUSH', 'Notification pings sent, status:', res.status);
      });
    }
  });
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

app.use(bodyParser.json());
app.use(express.static(__dirname + '/../../dist'));

app.post('/subscribe', (req, res) => {
  const id = req.body.id;
  if (!id) {
    res.status(400).send('id is missing from the post');
  } else {
    log('DB', `Adding ${id} to ids table`);
    db.run(`INSERT OR IGNORE INTO ids (id) VALUES('${id}')`, (err) => {
      if (err !== null) {
        log('DB', 'Error adding id', err);
        res.sendStatus(500);
      } else {
        res.sendStatus(201);
      }
    });
  }
});

app.post('/unsubscribe', (req, res) => {
  const id = req.body.id;
  if (!id) {
    res.status(400).send('id is missing from the post');
  } else {
    log('DB', `Removing ${id} from ids table`);
    db.run(`DELETE FROM ids WHERE id='${id}'`, (err) => {
      if (err !== null) {
        log('DB', 'Error removing id', err);
        res.sendStatus(500);
      } else {
        res.sendStatus(204);
      }
    });
  }
});

app.post('/event', (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  if (!title || !body) {
    res.status(400).send('title and/or body missing from the post');
  } else {
    const success = addEvent(title, body);
    if (success) {
      res.sendStatus(201);
    } else {
      res.sendStatus(500);
    }
  }
});

app.get('/event', (req, res) => {
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

/*
 * Periodic Tasks
 */

if (HOST_URL) {
  log('UPTIME', `Creating periodic task for ${HOST_URL}`);
  const healthTask = new PeriodicTask(60000, () => {
    healthCheck(HOST_URL, HOST_CODE).then((healthy) => {
      if (!healthy && IS_HEALTHY) {
        addEvent('Health degraded', 'Health check just failed, the host didn\'t return expected status code.');
        IS_HEALTHY = false;
      } else if (healthy && !IS_HEALTHY) {
        addEvent('Health recovered', 'Health check was just successful, crisis averted.');
        IS_HEALTHY = true;
      }
    }).catch((err) => {
      log('UPTIME', 'Error doing a healthcheck:', err);
      if (IS_HEALTHY) {
        addEvent('Health degraded', 'Health check just failed, failed to reach host.');
        IS_HEALTHY = false;
      }
    });
  });
  healthTask.run();
}

/*
 * Start server
 */
app.listen(PORT);
log('SERVER', `Listening on port ${PORT}`);
