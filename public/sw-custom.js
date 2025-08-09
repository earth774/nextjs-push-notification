// Custom Service Worker for Push Notifications
console.log('Custom SW loaded');

// Handle push events
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Default Title',
    body: 'Default message',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'push-notification',
    requireInteraction: false,
    actions: []
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data:', data);
      
      notificationData.title = data.title || notificationData.title;
      notificationData.body = data.body || notificationData.body;
      notificationData.icon = data.icon || notificationData.icon;
      notificationData.badge = data.badge || notificationData.badge;
      notificationData.tag = data.tag || notificationData.tag;
      notificationData.data = data.data || {};
      
      if (data.actions && Array.isArray(data.actions)) {
        notificationData.actions = data.actions;
      }
    } catch (e) {
      console.error('Error parsing push data:', e);
      notificationData.body = event.data.text();
    }
  }

  console.log('Showing notification:', notificationData);

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data
    })
  );
});

// Handle notification click events
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  // Handle action clicks
  if (event.action) {
    console.log('Action clicked:', event.action);
    // You can handle different actions here
  } else {
    // Default click behavior - open the notification detail page
    const notification = event.notification;
    let notificationUrl;
    
    // Check if we have data with pre-built URL
    if (notification.data && notification.data.url) {
      notificationUrl = notification.data.url;
      console.log('Using pre-built URL from notification data:', notificationUrl);
    } else {
      // Fallback: build URL from notification properties
      const title = encodeURIComponent(notification.title || 'ไม่พบหัวข้อ');
      const body = encodeURIComponent(notification.body || 'ไม่พบเนื้อหา');
      const timestamp = encodeURIComponent(notification.data?.timestamp || new Date().toISOString());
      const notificationId = encodeURIComponent(notification.data?.id || notification.tag || Date.now().toString());
      
      notificationUrl = `/notification?title=${title}&body=${body}&timestamp=${timestamp}&id=${notificationId}`;
      console.log('Built URL from notification properties:', notificationUrl);
    }
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        // Check if notification page is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/notification') && 'focus' in client) {
            // Navigate to new notification if already on notification page
            return client.navigate(self.registration.scope + notificationUrl.substring(1)).then(() => client.focus());
          }
        }
        
        // Check if main app is open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === self.registration.scope && 'focus' in client) {
            // Navigate to notification page
            return client.navigate(self.registration.scope + notificationUrl.substring(1)).then(() => client.focus());
          }
        }
        
        // Otherwise, open a new window/tab with notification details
        if (clients.openWindow) {
          return clients.openWindow(notificationUrl);
        }
      })
    );
  }
});

// Handle notification close events
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
  // You can track analytics here if needed
});

// Import and initialize the generated service worker (if exists)
try {
  importScripts('/sw.js');
  console.log('Base service worker imported successfully');
} catch (e) {
  console.log('Base service worker not found, continuing with custom SW only');
}