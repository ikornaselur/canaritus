const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');
const PeriodicTask = require('periodic-task');

/*
 * Create the app, database and tables if required
 */
const app = express();
const db = new sqlite3.Database('canaritus.db');
db.run('CREATE TABLE IF NOT EXISTS ids (id TEXT, UNIQUE(id))');
db.run('CREATE TABLE IF NOT EXISTS events (title TEXT, body TEXT, time DATETIME)');

/*
 * Application constants
 */
const PORT = 3000;
const SERVER_KEY = process.env.SERVER_KEY;
const GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';
const HOST_URL = process.env.HOST_URL;
const HOST_CODE = process.env.HOST_CODE || 200;

// TODO: Remove this to config
var IS_HEALTHY = true; // eslint-disable-line no-var,vars-on-top

/*
 * Warn if missing env variables cause parts of application not to work
 */
if (!HOST_URL) {
  console.log('HOST_URL env variable not set, will not do health checks.');
}

/*
 * Configure express app
 */
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../../dist'));

/*
 * Set up the utils
 */
const utils = require('./utils')(db, GCM_ENDPOINT, SERVER_KEY, fetch);

/*
 * Set up the routes
 */
require('./routes/main')(app, db, utils.addEvent, utils.log);

/*
 * Periodic Tasks
 */

if (HOST_URL) {
  utils.log('UPTIME', `Creating periodic task for ${HOST_URL}`);
  const healthTask = new PeriodicTask(60000, () => {
    utils.healthCheck(HOST_URL, HOST_CODE).then((healthy) => {
      if (!healthy && IS_HEALTHY) {
        utils.addEvent('Health degraded', 'Health check just failed, the host didn\'t return expected status code.', db);
        IS_HEALTHY = false;
      } else if (healthy && !IS_HEALTHY) {
        utils.addEvent('Health recovered', 'Health check was just successful, crisis averted.', db);
        IS_HEALTHY = true;
      }
    }).catch((err) => {
      utils.log('UPTIME', 'Error doing a healthcheck:', err);
      if (IS_HEALTHY) {
        utils.addEvent('Health degraded', 'Health check just failed, failed to reach host.', db);
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
utils.log('SERVER', `Listening on port ${PORT}`);
