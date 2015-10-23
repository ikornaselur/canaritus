const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');

const app = express();
const db = new sqlite3.Database('canaritus.db');
db.run('CREATE TABLE IF NOT EXISTS ids (id TEXT, UNIQUE(id))');
db.run('CREATE TABLE IF NOT EXISTS events (title TEXT, body TEXT, time DATETIME)');

const PORT = 3000;
const SERVER_KEY = process.env.SERVER_KEY;
const GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';

if (!SERVER_KEY) {
  console.log('SERVER_KEY env variable not set, will not be able to send push notification');
}

const pingClients = () => {
  console.log('Pinging clients...');
  db.all('SELECT * FROM ids', (err, rows) => {
    if (err !== null) {
      console.log('Failed to select registration ids');
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
        console.log('Notification pings sent, status:', res.status);
      });
    }
  });
};

app.use(bodyParser.json());
app.use(express.static(__dirname + '/dist'));

app.post('/subscribe', (req, res) => {
  const id = req.body.id;
  if (!id) {
    res.status(400).send('id is missing from the post');
  } else {
    console.log(`Adding ${id} to ids table`);
    db.run(`INSERT OR IGNORE INTO ids (id) VALUES('${id}')`, (err) => {
      if (err !== null) {
        console.log('Error adding id', err);
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
    console.log(`Removing ${id} from ids table`);
    db.run(`DELETE FROM ids WHERE id='${id}'`, (err) => {
      if (err !== null) {
        console.log('Error removing id', err);
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
    console.log(`Adding event "${title}: ${body}"`);
    db.run(`INSERT INTO events (title, body, time) VALUES('${title}', '${body}', datetime('now'))`, (err) => {
      if (err !== null) {
        console.log('Error adding event', err);
        res.sendStatus(500);
      } else {
        pingClients();
        res.sendStatus(201);
      }
    });
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

app.listen(PORT);
console.log(`Listening on port ${PORT}`);
