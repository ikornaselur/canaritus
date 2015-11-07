window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
//       .then(initialState);
  } else {
    console.warn('Service workers aren\'t supported in this browser.');
  }
});
