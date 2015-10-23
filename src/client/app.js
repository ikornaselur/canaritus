let isPushEnabled = false;

const sendSubscriptionChange = (subscription, type) => {
  const {endpoint} = subscription;
  const id = endpoint.split('/')[endpoint.split('/').length - 1];
  fetch('/' + type, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: id,
    }),
  });
};

const subscribe = () => {
  // Disable the button so it can't be changed while
  // we process the permission request
  const pushButton = document.querySelector('.js-push-button');
  pushButton.disabled = true;

  navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
    serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
      .then((subscription) => {
        // Subscription was successful
        isPushEnabled = true;
        pushButton.textContent = 'Disable Push Messages';
        pushButton.disabled = false;

        return sendSubscriptionChange(subscription, 'subscribe');
      })
      .catch((e) => {
        if (Notification.permission === 'denied') {
          // The user denied
          console.warn('Permission for Notifications was denied');
          pushButton.disabled = true;
        } else {
          // A problem occured with the subscription
          console.error('Unable to subscribe to push.', e);
          pushButton.disabled = false;
          pushButton.textContent = 'Enable Push Messages';
        }
      });
  });
};

const unsubscribe = () => {
  const pushButton = document.querySelector('.js-push-button');
  pushButton.disabled = true;

  navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
    serviceWorkerRegistration.pushManager.getSubscription().then((pushSubscription) => {
      // Check we have a subcription to unsubscribe
      if (!pushSubscription) {
        // No subscription object, set state to allow to push
        isPushEnabled = false;
        pushButton.disabled = false;
        pushButton.textContent = 'Enable Push Messages';
        return;
      }

      sendSubscriptionChange(pushSubscription, 'unsubscribe');

      // We have a subscription, so call unsubscribe on it
      pushSubscription.unsubscribe().then(() => {
        pushButton.disabled = false;
        pushButton.textContent = 'Enable Push Messages';
        isPushEnabled = false;
      })
      .catch((e) => {
        // Failed to unsubscribe.. remove user data from our data store
        // and let the user know we did so
        console.log('Unsubscription error: ', e);
        pushButton.disabled = false;
        pushButton.textContent = 'Enable Push Messages';
      });
    })
    .catch((e) => {
      console.error('Error thrown while unsubscribing from push messaging.', e);
    });
  });
};

const initialState = () => {
  // Are Notifications supported in the service worker?
  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
    console.warn('Notifications aren\'t supported.');
    return;
  }

  // Check current Notification permission.
  if (Notification.permission === 'denied') {
    console.warn('The user has blocked notifications.');
    return;
  }

  // Check is push messaging is supported
  if (!('PushManager' in window)) {
    console.warn('Push messaging isn\'t supported.');
    return;
  }

  // We need the service worker registration to check for a subscription
  navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
    // Do we already have a push message subscription?
    serviceWorkerRegistration.pushManager.getSubscription()
      .then((subscription) => {
        // Enable any UI which (un)subscribes from push messages
        const pushButton = document.querySelector('.js-push-button');
        pushButton.disabled = false;

        if (!subscription) {
          // We aren't subscribed to push, so set UI
          // to allow the user to enable push
          return;
        }

        // Keep your server in sync with the latest subscriptionID
        sendSubscriptionChange(subscription, 'subscribe');

        // Set your UI to show they have subscribed for push messages
        pushButton.textContent = 'Disable Push Messages';
        isPushEnabled = true;
      })
      .catch((err) => {
        console.warn('Error during getSubscription()', err);
      });
  });
};

window.addEventListener('load', () => {
  const pushButton = document.querySelector('.js-push-button');
  pushButton.addEventListener('click', () => {
    if (isPushEnabled) {
      unsubscribe();
    } else {
      subscribe();
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(initialState);
  } else {
    console.warn('Service workers aren\'t supported in this browser.');
  }
});
