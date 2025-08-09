// Dedicated Service Worker for Push Notifications
console.log('Notification SW loaded');

// Handle push events
self.addEventListener('push', function(event) {
  console.log('=== PUSH EVENT RECEIVED ===');
  console.log('Event:', event);
  
  let notificationData = {
    title: 'Default Title',
    body: 'Default message',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'push-notification',
    requireInteraction: false,
    actions: [],
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('=== PUSH DATA RECEIVED ===');
      console.log('Data:', data);
      
      notificationData.title = data.title || notificationData.title;
      notificationData.body = data.body || notificationData.body;
      notificationData.icon = data.icon || notificationData.icon;
      notificationData.badge = data.badge || notificationData.badge;
      notificationData.tag = data.tag || notificationData.tag;
      
      // Preserve all data including timestamp and URL
      notificationData.data = {
        ...notificationData.data,
        ...data.data,
        timestamp: data.timestamp,
        id: data.data?.id
      };
      
      if (data.actions && Array.isArray(data.actions)) {
        notificationData.actions = data.actions;
      }
      
      console.log('=== PROCESSED NOTIFICATION DATA ===');
      console.log('Final notification data:', notificationData);
    } catch (e) {
      console.error('Error parsing push data:', e);
      notificationData.body = event.data.text();
    }
  }

  console.log('=== SHOWING NOTIFICATION ===');
  console.log('Title:', notificationData.title);
  console.log('Body:', notificationData.body);
  console.log('Data:', notificationData.data);

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
  console.log('=== NOTIFICATION CLICKED ===');
  console.log('Event:', event);
  console.log('Notification:', event.notification);
  console.log('Notification data:', event.notification.data);
  
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
      console.log('=== USING PRE-BUILT URL ===');
      console.log('URL:', notificationUrl);
    } else {
      // Fallback: build URL from notification properties
      const title = encodeURIComponent(notification.title || 'ไม่พบหัวข้อ');
      const body = encodeURIComponent(notification.body || 'ไม่พบเนื้อหา');
      const timestamp = encodeURIComponent(notification.data?.timestamp || new Date().toISOString());
      const notificationId = encodeURIComponent(notification.data?.id || notification.tag || Date.now().toString());
      
      notificationUrl = `/notification?title=${title}&body=${body}&timestamp=${timestamp}&id=${notificationId}`;
      console.log('=== BUILDING URL FROM PROPERTIES ===');
      console.log('Title:', notification.title);
      console.log('Body:', notification.body);
      console.log('Timestamp:', notification.data?.timestamp);
      console.log('ID:', notification.data?.id);
      console.log('Built URL:', notificationUrl);
    }
    
    console.log('=== OPENING NOTIFICATION PAGE ===');
    console.log('Final URL:', notificationUrl);
    
    // Simple approach: always try to open new window first
    event.waitUntil(
      (async () => {
        try {
          console.log('=== ATTEMPTING TO OPEN NOTIFICATION PAGE ===');
          console.log('URL:', notificationUrl);
          
          if (clients.openWindow) {
            const windowClient = await clients.openWindow(notificationUrl);
            if (windowClient) {
              console.log('=== SUCCESSFULLY OPENED NEW WINDOW ===');
              return windowClient;
            }
          }
          
          // Fallback: try to navigate existing clients
          console.log('=== FALLBACK: CHECKING EXISTING CLIENTS ===');
          const clientList = await clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
          });
          
          console.log('Found clients:', clientList.length);
          
          for (const client of clientList) {
            console.log('Client URL:', client.url);
            try {
              // Send message to navigate
              client.postMessage({
                type: 'NAVIGATE_TO_NOTIFICATION',
                url: notificationUrl
              });
              
              await client.focus();
              console.log('=== SUCCESSFULLY NAVIGATED EXISTING CLIENT ===');
              return client;
            } catch (err) {
              console.log('Failed to navigate client:', err);
              continue;
            }
          }
          
          console.log('=== ALL METHODS FAILED ===');
        } catch (error) {
          console.error('=== ERROR IN NOTIFICATION CLICK HANDLER ===');
          console.error('Error:', error);
        }
      })()
    );
  }
});

// Handle notification close events
self.addEventListener('notificationclose', function(event) {
  console.log('=== NOTIFICATION CLOSED ===');
  console.log('Event:', event);
});

// Handle service worker installation
self.addEventListener('install', function(event) {
  console.log('=== SERVICE WORKER INSTALLING ===');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
  console.log('=== SERVICE WORKER ACTIVATED ===');
  event.waitUntil(clients.claim());
});
