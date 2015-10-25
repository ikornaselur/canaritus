module.exports = (app, db, addEvent, log) => {
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
    res.status(404);
    /* TODO: Update this based on DB changes
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
    */
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

  require('./status')(app, db, addEvent, log);
};
