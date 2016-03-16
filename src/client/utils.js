export const sendSubscriptionChange = (subscription, type) => {
  // TODO: Dispatch this as an action
  const {endpoint} = subscription;
  const id = endpoint.split('/')[endpoint.split('/').length - 1];
  fetch('/api/' + type, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  });
};
