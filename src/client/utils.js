export const sendSubscriptionChange = (subscription, type) => {
  // TODO: Dispatch this as an action

  fetch('/api/' + type, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  });
};
