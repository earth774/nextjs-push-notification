// public/sw.js
self.addEventListener('push', function (event) {
    let data = { title: 'Notification', body: '' }
    if (event.data) {
      try {
        data = event.data.json()
      } catch (e) {
        data.body = event.data.text()
      }
    }
  
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png'
    }
  
    event.waitUntil(self.registration.showNotification(data.title, options))
  })