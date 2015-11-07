import React, {Component} from 'react';
import {Button} from '.';
import {sendSubscriptionChange} from '../utils';

export default class Status extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      errors: [],
      subscribed: false,
      subDisabled: false,
    };
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
            console.warn('Permission fro Notification was denied');
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

  unsubscribe =() => {
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
        <Button handleClick={::this.subscribeClick} disabled={this.state.subDisabled}>{subscribeText}</Button>
      </div>
    );
  }
}
