import path from 'path';
import {load} from 'node-yaml-config';

const config = load(path.join(__dirname, '/../../config.yaml'));

export const handleRender = (req, res) => {
  res.send('Hello, world!');
};

export const manifest = (req, res) => {
  res.json({
    'name': 'Canaritus - Canary Status page',
    'short_name': 'Canaritus',
    'icon': [{
      'src': 'images/icon-256x256.png',
      'sizes': '256x256',
      'type': 'image/png',
    }],
    'start_url': '/index.html',
    'display': 'standalone',
    'gcm_sender_id': config.notifications.gcm.project_number,
  });
};
