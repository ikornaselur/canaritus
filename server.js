import path from 'path';
import bodyParser from 'body-parser';
import Express from 'express';
import http from 'http';
import {Database} from 'sqlite3';

import * as api from './src/server/api/http';
import * as uni from './src/server/app.js';

const app = Express();
const httpServer = http.Server(app);
const port = 3000;

app.set('views', path.join(__dirname, 'src', 'server', 'views'));
app.set('view engine', 'jade');

/**
 * Initialize Database
 */
const db = new Database('canaritus.db');
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS ids (id TEXT, UNIQUE(id))');
  db.run('CREATE TABLE IF NOT EXISTS events (host TEXT, type TEXT, healthy BOOLEAN, title TEXT, body TEXT, time DATETIME)');
});
db.close();

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
 * Api endpoints
 */
app.get('/api/status', api.getStatus);
app.get('/api/status/:host', api.getHostStatus);
app.get('/api/subsrcibe', api.subscribe);
app.get('/api/unsubscribe', api.unsubscribe);
app.get('/api/event', api.getEvent);

console.log(`Listening on port ${port}`);
httpServer.listen(port);
