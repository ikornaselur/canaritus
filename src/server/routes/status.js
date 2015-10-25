module.exports = (app, db, addEvent, log) => {
  app.get('/status/:host', (req, res) => {
    const host = req.params.host;
    db.all(`SELECT * FROM events WHERE host='${host}'`, (err, events) => {
      if (err) {
        res.status(500).send('Unable to get events');
      } else if (events.length === 0) {
        res.status(404);
      } else {
        res.status(200).json(events);
      }
    });
  });
};
