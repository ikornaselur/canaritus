window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  } else {
    console.warn('Service workers aren\'t supported in this browser.');
  }
});
