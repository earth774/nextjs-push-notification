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

  // Check if any clients are currently visible (app is in foreground)
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then(clientList => {
      console.log('=== CHECKING APP VISIBILITY ===');
      console.log('Found clients:', clientList.length);
      
      let hasVisibleClient = false;
      for (const client of clientList) {
        console.log('Client:', client.url, 'Visibility:', client.visibilityState);
        if (client.visibilityState === 'visible') {
          hasVisibleClient = true;
          break;
        }
      }
      
      console.log('Has visible client (app in foreground):', hasVisibleClient);
      
      // Always show notification regardless of app state
      // This ensures notification appears even when app is in foreground
      console.log('=== SHOWING NOTIFICATION ===');
      console.log('Title:', notificationData.title);
      console.log('Body:', notificationData.body);
      console.log('Data:', notificationData.data);
      
      return self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: notificationData.tag,
        requireInteraction: notificationData.requireInteraction,
        actions: notificationData.actions,
        data: notificationData.data,
        // Force notification to show even when app is visible
        silent: false,
        renotify: true
      });
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
    
    event.waitUntil(
      clients.matchAll({ 
        type: 'window', 
        includeUncontrolled: true 
      }).then(clientList => {
        console.log('=== NOTIFICATION CLICK: Found clients ===');
        console.log('Clients count:', clientList.length);
        console.log('Target URL:', notificationUrl);
        
        // If we have existing clients (app is open)
        if (clientList.length > 0) {
          console.log('=== APP IS OPEN - CHECKING VISIBILITY ===');
          
          // Find visible clients first
          let visibleClient = null;
          let anyClient = null;
          
          for (const client of clientList) {
            console.log('Checking client:', client.url, 'Visibility:', client.visibilityState, 'Focused:', client.focused);
            
            // Store any client as fallback
            if (!anyClient) {
              anyClient = client;
            }
            
            // Look for visible clients (app in foreground)
            if (client.visibilityState === 'visible' || client.focused) {
              visibleClient = client;
              console.log('Found visible client:', client.url);
              break;
            }
            
            // Also check for main app clients
            if (client.url.includes('localhost:3000') || 
                client.url === self.registration.scope ||
                client.url.endsWith('/')) {
              if (!visibleClient) {
                visibleClient = client;
                console.log('Found main app client:', client.url);
              }
            }
          }
          
          const targetClient = visibleClient || anyClient;
          
          if (targetClient) {
            console.log('=== NAVIGATING CLIENT ===');
            console.log('Target client:', targetClient.url);
            console.log('Visibility state:', targetClient.visibilityState);
            
            // Try multiple methods to ensure navigation works
            console.log('=== TRYING MULTIPLE NAVIGATION METHODS ===');
            
            // Method 1: BroadcastChannel (most reliable for PWA)
            try {
              console.log('Method 1: Using BroadcastChannel');
              const channel = new BroadcastChannel('notification-navigation');
              channel.postMessage({
                type: 'NAVIGATE_TO_NOTIFICATION',
                url: notificationUrl
              });
              channel.close();
              console.log('BroadcastChannel message sent');
            } catch (bcError) {
              console.log('BroadcastChannel failed:', bcError);
            }
            
            // Method 2: localStorage + event (fallback)
            try {
              console.log('Method 2: Using localStorage trigger');
              const navigationData = {
                type: 'NAVIGATE_TO_NOTIFICATION',
                url: notificationUrl,
                timestamp: Date.now()
              };
              localStorage.setItem('sw-navigation', JSON.stringify(navigationData));
              // Clear after a short delay
              setTimeout(() => {
                localStorage.removeItem('sw-navigation');
              }, 1000);
              console.log('localStorage trigger set');
            } catch (lsError) {
              console.log('localStorage method failed:', lsError);
            }
            
            // Method 3: postMessage (traditional)
            console.log('Method 3: Using postMessage');
            targetClient.postMessage({
              type: 'NAVIGATE_TO_NOTIFICATION',
              url: notificationUrl
            });
            
            // Method 4: Try client.navigate if available
            if (targetClient.navigate) {
              console.log('Method 4: Using client.navigate()');
              return targetClient.navigate(notificationUrl)
                .then(() => {
                  console.log('=== SUCCESS: client.navigate() worked ===');
                  return targetClient.focus();
                })
                .catch(navError => {
                  console.log('client.navigate() failed, relying on other methods:', navError);
                  return targetClient.focus();
                });
            } else {
              console.log('client.navigate() not available, relying on messaging methods');
              return targetClient.focus();
            }
          }
        }
        
        // If no existing clients or navigation failed, open new window
        console.log('=== NO EXISTING CLIENTS - OPENING NEW WINDOW ===');
        if (clients.openWindow) {
          return clients.openWindow(notificationUrl)
            .then(windowClient => {
              if (windowClient) {
                console.log('=== SUCCESS: New window opened ===');
                return windowClient;
              } else {
                console.log('=== FAILED: Could not open new window ===');
              }
            });
        } else {
          console.log('=== ERROR: openWindow not available ===');
        }
      })
      .catch(error => {
        console.error('=== NOTIFICATION CLICK ERROR ===');
        console.error(error);
        
        // Last resort: try to open new window anyway
        if (clients.openWindow) {
          return clients.openWindow(notificationUrl);
        }
      })
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
