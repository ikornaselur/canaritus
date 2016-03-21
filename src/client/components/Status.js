import React, {Component} from 'react';
import {Button} from '.';
import {sendSubscriptionChange} from '../utils';

export default class Status extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      errors: [],
      subscribed: false,
      subDisabled: true,
    };
  }

  componentDidMount() {
    this.initialSubscriptionState();
  }

  initialSubscriptionState = () => {
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
          this.setState({
            subDisabled: false,
          });
          if (!subscription) {
            // We aren't subscribed to push
            return;
          }

          // Keep your server in sync with the latest subscriptionID
          sendSubscriptionChange(subscription, 'subscribe');

          // Set your UI to show they have subscribed for push messages
          this.setState({
            subscribed: true,
          });
        })
        .catch((err) => {
          console.warn('Error during getSubscription()', err);
        });
    });
  }

  subscribe = () => {
    navigator.serviceWorker.ready.then((swRegistration) => {
      swRegistration.pushManager.subscribe({userVisibleOnly: true})
        .then((subscription) => {
          this.setState({
            subscribed: true,
            subDisabled: false,
          });
          return sendSubscriptionChange(subscription, 'subscribe');
        })
        .catch((e) => {
          if (Notification.permission === 'denied') {
            // The user denied
            console.warn('Permission for Notification was denied');
            this.setState({
              subDisabled: true,
            });
          } else {
            // A problem occured with the subscription
            console.error('Unable to subscribe to push.', e);
            this.setState({
              subDisabled: false,
              subscribed: false,
            });
          }
        });
    });
  }

  unsubscribe = () => {
    navigator.serviceWorker.ready.then((swRegistration) => {
      swRegistration.pushManager.getSubscription().then((pushSub) => {
        // Check if we have a subcription to unsubscribe
        if (!pushSub) {
          // No subscription
          this.setState({
            subscribed: false,
            subDisabled: false,
          });
          return;
        }

        sendSubscriptionChange(pushSub, 'unsubscribe');

        // We have a subscription, so call unsubscribe on it
        pushSub.unsubscribe().then(() => {
          this.setState({
            subscribed: false,
            subDisabled: false,
          });
        })
        .catch((e) => {
          // Failed to unsubscribe.. remove user data
          console.log('Unsubscription error:', e);
          this.setState({
            subDisabled: false,
            subscribed: false,
          });
        });
      })
      .catch((e) => {
        console.error('Error thrown while unsubscribing from push messaging:', e);
      });
    });
  }

  subscribeClick = () => {
    this.setState({subDisabled: true});
    if (this.state.subscribed) {
      this.unsubscribe();
    } else {
      this.subscribe();
    }
  }

  render() {
    const subscribeText = this.state.subscribed ? 'Unsubscribe' : 'Subscribe';
    return (
      <div>
        <h1>Canary Status</h1>
        <Button
          handleClick={::this.subscribeClick}
          disabled={this.state.subDisabled}
        >
          {subscribeText}
        </Button>
      </div>
    );
  }
}
