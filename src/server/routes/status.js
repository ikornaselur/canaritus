module.exports = (app, db, addEvent, log) => {
  app.get('/status', (req, res) => {
    db.all('SELECT DISTINCT host FROM events', (err, events) => {
      if (err) {
        log('DB', 'Error getting hosts: ' + err);
        res.status(500).send('Unable to get the list of hosts');
      } else {
        res.json(events);
      }
    });
  });

  app.get('/status/:host', (req, res) => {
    const host = req.params.host;
    db.all(`SELECT * FROM events WHERE host='${host}'`, (err, events) => {
      if (err) {
        res.status(500).send('Unable to get events');
      } else if (events.length === 0) {
        res.sendStatus(404);
      } else {
        res.status(200).json(events);
      }
    });
  });
};
