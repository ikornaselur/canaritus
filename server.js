import path from 'path';
import bodyParser from 'body-parser';
import Express from 'express';
import http from 'http';
import {Database} from 'sqlite3';
import {load as loadYaml} from 'node-yaml-config';

import * as api from './src/server/api';
import * as uni from './src/server/app';
import {createHealthCheck} from './src/server/tasks';

import {initialize as initializeGcm} from './src/server/notifications/gcm.js';
import {initialize as initializeMailgun} from './src/server/notifications/mailgun.js';

const app = Express();
const httpServer = http.Server(app);
const port = 3000;
const config = loadYaml(path.join(__dirname, 'config.yaml'));

app.set('views', path.join(__dirname, 'src', 'server', 'views'));
app.set('view engine', 'jade');

/**
 * Initialize Database
 */
/* eslint-disable max-len */
const db = new Database('canaritus.db');
db.run('CREATE TABLE IF NOT EXISTS subscriptions (endpoint TEXT, p256dh TEXT, auth TEXT, UNIQUE(endpoint))');
db.run('CREATE TABLE IF NOT EXISTS events (host TEXT, type TEXT, healthy BOOLEAN, title TEXT, body TEXT, time DATETIME)');
db.run('CREATE TABLE IF NOT EXISTS emails (email TEXT, hash TEXT NOT NULL, verified BOOLEAN DEFAULT false, UNIQUE(email))');
db.close();
/* eslint-enable */

/**
 * Server middleware
 */
app.use(require('serve-static')(path.join(__dirname, 'dist')));
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());

/**
 * Universal Application endpoint
 */
app.get('/', uni.handleRender);
app.get('/manifest.json', uni.manifest);

/**
 * Start the uptime healthchecks
 */
if (config.uptime_checks.native.enabled) {
  for (const key of Object.keys(config.hosts)) {
    const host = config.hosts[key];
    createHealthCheck(key, host);
  }
}

/**
 * Api endpoints
 */
app.get('/api/status', api.http.getStatus);
app.post('/api/subscribe', api.http.subscribe);
app.post('/api/unsubscribe', api.http.unsubscribe);
app.get('/api/event', api.http.getEvent);
app.post('/api/event', api.http.postEvent);

// Email endpoints
app.get('/api/email/verify/:hash', api.email.verify);
app.post('/api/email/subscribe', api.email.subscribe);
app.post('/api/email/unsubscribe', api.email.unsubscribe);

console.log(`Listening on port ${port}`);
httpServer.listen(port);

/**
 * Initialize notification services
 */
initializeGcm(config.notifications.gcm);
initializeMailgun(config.notifications.mailgun);
