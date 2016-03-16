import path from 'path';
import {load} from 'node-yaml-config';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {createStore} from 'redux';
import {Provider} from 'react-redux';

import rootReducer from '../client/reducers';
import CanaritusAppContainer from '../client/containers/CanaritusAppContainer';

import {addAuthToken} from 'web-push-encryption';

const config = load(path.join(__dirname, '..', '..', 'config.yaml'));

export const handleRender = (req, res) => {
  const store = createStore(rootReducer);
  const html = ReactDOMServer.renderToString(
    <Provider store={store}>
      <CanaritusAppContainer />
    </Provider>
  );

  res.render('index', {html: html, initialState: JSON.stringify(store.getState())});
};

export const manifest = (req, res) => {
  res.json({
    'name': 'Canaritus - Canary Status page',
    'short_name': 'Canaritus',
    'icon': [{
      'src': 'images/CanaryStatus_plus_256px.png',
      'sizes': '256x256',
      'type': 'image/png',
    }],
    'start_url': '/index.html',
    'display': 'standalone',
    'gcm_sender_id': config.notifications.gcm.project_number,
  });
};

// Register the gcm authentication key if gcm is enabled
if (config.notifications.gcm.enabled) {
  addAuthToken('https://android.googleapis.com/gcm', config.notifications.gcm.auth_token);
}
