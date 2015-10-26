module.exports = (app, db, config, addEvent, log) => {
  app.get('/status', (req, res) => {
    const hosts = Object.keys(config.hosts);
    res.json(hosts);
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
