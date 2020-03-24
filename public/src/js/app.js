let deferredPrompt

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function () {
        console.log('Service worker registered!');
      })
      .catch(function(err) {
        console.log(err);
      });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('Before install prompt fired.')
    event.preventDefault()
    deferredPrompt = event
    return false
  })