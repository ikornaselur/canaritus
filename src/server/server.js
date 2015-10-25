const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const yamlConfig = require('node-yaml-config');

/*
 * Create the app, database and tables if required
 */
const app = express();
const db = new sqlite3.Database('canaritus.db');
db.run('CREATE TABLE IF NOT EXISTS ids (id TEXT, UNIQUE(id))');
db.run('CREATE TABLE IF NOT EXISTS events (host TEXT, type TEXT, healthy BOOLEAN, title TEXT, body TEXT, time DATETIME)');

/*
 * Application constants
 */
const PORT = process.env.PORT || 3000;
const SERVER_KEY = process.env.SERVER_KEY;
const GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';
const HOST_YAML = process.env.HOST_YAML || 'hosts.yaml';

/*
 * Hosts config
 */
const config = yamlConfig.load(__dirname + '/../../' + HOST_YAML);

/*
 * Configure express app
 */
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../../dist'));

/*
 * Set up the utils
 */
const utils = require('./utils')(db, GCM_ENDPOINT, SERVER_KEY);

/*
 * Set up the routes
 */
require('./routes/main')(app, db, config, utils.addEvent, utils.log);

/*
 * Set up the periodic tasks
 */
require('./tasks')(config, utils, db);

/*
 * Start server
 */
app.listen(PORT);
utils.log('SERVER', `Listening on port ${PORT}`);
