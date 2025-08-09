// Dedicated Service Worker for Push Notifications
console.log('Notification SW loaded');

// Handle push events
self.addEventListener('push', function(event) {
  console.log('🔔 Push event received');
  
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
      console.log('📊 Push data:', data);
      
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
      console.log('🔍 Clients found:', clientList.length);
      
      let hasVisibleClient = false;
      let visibleClients = [];
      
      for (const client of clientList) {
        if (client.visibilityState === 'visible') {
          hasVisibleClient = true;
          visibleClients.push(client);
        }
      }
      
      console.log('📱 App in foreground:', hasVisibleClient);
      
      // If app is in foreground, send data to app but DON'T show any notification
      if (hasVisibleClient && visibleClients.length > 0) {
        console.log('🔇 Silent mode: ส่งข้อมูลแบบเงียบ');
        
        const title = encodeURIComponent(notificationData.title || 'ไม่พบหัวข้อ');
        const body = encodeURIComponent(notificationData.body || 'ไม่พบเนื้อหา');
        const timestamp = encodeURIComponent(notificationData.data?.timestamp || new Date().toISOString());
        const notificationId = encodeURIComponent(notificationData.data?.id || Date.now().toString());
        const notificationUrl = `/notification?title=${title}&body=${body}&timestamp=${timestamp}&id=${notificationId}`;
        
        // Send message to all visible clients (but don't show notification)
        visibleClients.forEach(client => {
          
          // Method 1: BroadcastChannel
          try {
            const channel = new BroadcastChannel('notification-navigation');
            channel.postMessage({
              type: 'NOTIFICATION_DATA_RECEIVED',
              url: notificationUrl,
              title: notificationData.title,
              body: notificationData.body,
              timestamp: notificationData.data?.timestamp || new Date().toISOString(),
              id: notificationData.data?.id || Date.now().toString(),
              source: 'push-foreground-silent'
            });
            channel.close();
            console.log('✅ BroadcastChannel sent');
          } catch (e) {
            console.log('❌ BroadcastChannel failed:', e);
          }
          
          // Method 2: postMessage
          client.postMessage({
            type: 'NOTIFICATION_DATA_RECEIVED',
            url: notificationUrl,
            title: notificationData.title,
            body: notificationData.body,
            timestamp: notificationData.data?.timestamp || new Date().toISOString(),
            id: notificationData.data?.id || Date.now().toString(),
            source: 'push-foreground-silent'
          });
          console.log('✅ postMessage sent');
          
          // Method 3: localStorage
          try {
            localStorage.setItem('sw-notification-data', JSON.stringify({
              type: 'NOTIFICATION_DATA_RECEIVED',
              url: notificationUrl,
              title: notificationData.title,
              body: notificationData.body,
              timestamp: notificationData.data?.timestamp || new Date().toISOString(),
              id: notificationData.data?.id || Date.now().toString(),
              receivedAt: Date.now(),
              source: 'push-foreground-silent'
            }));
            console.log('✅ localStorage saved');
          } catch (e) {
            console.log('❌ localStorage failed:', e);
          }
        });
        
        console.log('🔇 Silent notification completed');
        return Promise.resolve(); // Don't show any notification
      }
      
      // Show browser notification (app not in foreground)
      console.log('📢 แสดงการแจ้งเตือน browser:', notificationData.title);
      
      return self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: notificationData.tag + '-' + Date.now(), // Unique tag to force show
        requireInteraction: true, // Force user interaction
        actions: notificationData.actions,
        data: notificationData.data,
        silent: false,
        renotify: true,
        vibrate: [200, 100, 200] // Add vibration
      }).then(() => {
        console.log('✅ การแจ้งเตือน browser แสดงสำเร็จ!');
      }).catch(error => {
        console.error('❌ ไม่สามารถแสดงการแจ้งเตือน browser ได้:', error);
      });
    }).catch(error => {
      console.error('❌ Error in push event:', error);
      
      // Fallback: show notification anyway
      return self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: 'fallback-' + Date.now(),
        requireInteraction: true,
        data: notificationData.data
      });
    })
  );
});

// Handle notification click events
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 ========================================');
  console.log('🔔 NOTIFICATION CLICKED - DETAILED LOG');
  console.log('🔔 ========================================');
  console.log('📱 Title:', event.notification.title);
  console.log('📝 Body:', event.notification.body);
  console.log('🆔 Tag:', event.notification.tag);
  console.log('🎯 Data:', event.notification.data);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🔔 ========================================');
  
  // Store notification click data for app access
  const clickData = {
    title: event.notification.title,
    body: event.notification.body,
    tag: event.notification.tag,
    data: event.notification.data,
    clickedAt: new Date().toISOString(),
    action: event.action || 'default'
  };
  
  // Store in localStorage for app access
  try {
    const existingClicks = JSON.parse(localStorage.getItem('notification-clicks') || '[]');
    existingClicks.unshift(clickData); // Add to beginning
    // Keep only last 50 clicks
    if (existingClicks.length > 50) {
      existingClicks.splice(50);
    }
    localStorage.setItem('notification-clicks', JSON.stringify(existingClicks));
    console.log('✅ Notification click data stored in localStorage');
  } catch (e) {
    console.error('❌ Failed to store notification click data:', e);
  }
  
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
      console.log('📎 Using pre-built URL');
    } else {
      // Fallback: build URL from notification properties
      const title = encodeURIComponent(notification.title || 'ไม่พบหัวข้อ');
      const body = encodeURIComponent(notification.body || 'ไม่พบเนื้อหา');
      const timestamp = encodeURIComponent(notification.data?.timestamp || new Date().toISOString());
      const notificationId = encodeURIComponent(notification.data?.id || notification.tag || Date.now().toString());
      
      notificationUrl = `/notification?title=${title}&body=${body}&timestamp=${timestamp}&id=${notificationId}`;
      console.log('🔧 Building URL from properties');
    }
    
    console.log('🚀 Opening notification page:', notificationUrl);
    
    event.waitUntil(
      clients.matchAll({ 
        type: 'window', 
        includeUncontrolled: true 
      }).then(clientList => {
        console.log('🔍 Checking clients:', clientList.length);
        
        // If we have existing clients (app is open)
        if (clientList.length > 0) {
          console.log('✅ พบ app เปิดอยู่! กำลังตรวจสอบ visibility...');
          
          // Find visible clients first
          let visibleClient = null;
          let anyClient = null;
          
          for (const client of clientList) {
            console.log(`🔍 Client: ${client.url}`);
            console.log(`   👁️  Visibility: ${client.visibilityState}`);
            console.log(`   🎯 Focused: ${client.focused}`);
            
            // Store any client as fallback
            if (!anyClient) {
              anyClient = client;
            }
            
            // Look for visible clients (app in foreground)
            if (client.visibilityState === 'visible' || client.focused) {
              visibleClient = client;
              console.log('✅ พบ client ที่มองเห็นได้:', client.url);
              break;
            }
            
            // Also check for main app clients
            if (client.url.includes('localhost:3000') || 
                client.url === self.registration.scope ||
                client.url.endsWith('/')) {
              if (!visibleClient) {
                visibleClient = client;
                console.log('✅ พบ main app client:', client.url);
              }
            }
          }
          
          const targetClient = visibleClient || anyClient;
          
          if (targetClient) {
            console.log('🚀 =========================');
            console.log('🚀 เริ่มการ navigate!');
            console.log('🚀 =========================');
            console.log('🎯 Target client:', targetClient.url);
            console.log('👁️  Visibility state:', targetClient.visibilityState);
            
            console.log('📡 ลองส่งข้อความหลายวิธี...');
            
            // Method 1: BroadcastChannel (most reliable for PWA)
            try {
              console.log('🔄 วิธีที่ 1: BroadcastChannel');
              const channel = new BroadcastChannel('notification-navigation');
              channel.postMessage({
                type: 'NAVIGATE_TO_NOTIFICATION',
                url: notificationUrl,
                clickData: clickData // Include click data
              });
              channel.close();
              console.log('✅ ส่ง BroadcastChannel สำเร็จ');
              
              // Also send click log data
              const logChannel = new BroadcastChannel('notification-logs');
              logChannel.postMessage({
                type: 'NOTIFICATION_CLICKED',
                data: clickData
              });
              logChannel.close();
              console.log('✅ ส่ง notification click log สำเร็จ');
            } catch (bcError) {
              console.log('❌ BroadcastChannel ล้มเหลว:', bcError);
            }
            
            // Method 2: localStorage + event (fallback)
            try {
              console.log('🔄 วิธีที่ 2: localStorage trigger');
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
              console.log('✅ ตั้ง localStorage trigger สำเร็จ');
            } catch (lsError) {
              console.log('❌ localStorage ล้มเหลว:', lsError);
            }
            
            // Method 3: postMessage (traditional)
            console.log('🔄 วิธีที่ 3: postMessage');
            targetClient.postMessage({
              type: 'NAVIGATE_TO_NOTIFICATION',
              url: notificationUrl,
              clickData: clickData
            });
            console.log('✅ ส่ง postMessage สำเร็จ');
            
            // Send click log data via postMessage too
            targetClient.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: clickData
            });
            console.log('✅ ส่ง notification click log via postMessage สำเร็จ');
            
            // Method 4: Try client.navigate if available
            if (targetClient.navigate) {
              console.log('🔄 วิธีที่ 4: client.navigate()');
              return targetClient.navigate(notificationUrl)
                .then(() => {
                  console.log('✅ client.navigate() สำเร็จ!');
                  return targetClient.focus();
                })
                .catch(navError => {
                  console.log('❌ client.navigate() ล้มเหลว, พึ่งพาวิธีอื่น:', navError);
                  return targetClient.focus();
                });
            } else {
              console.log('⚠️  client.navigate() ไม่พร้อมใช้งาน, พึ่งพาการส่งข้อความ');
              return targetClient.focus();
            }
          }
        }
        
        // If no existing clients or navigation failed, open new window
        console.log('🆕 ไม่พบ app ที่เปิดอยู่ - เปิดหน้าต่างใหม่');
        if (clients.openWindow) {
          return clients.openWindow(notificationUrl)
            .then(windowClient => {
              if (windowClient) {
                console.log('✅ เปิดหน้าต่างใหม่สำเร็จ!');
                return windowClient;
              } else {
                console.log('❌ ไม่สามารถเปิดหน้าต่างใหม่ได้');
              }
            });
        } else {
          console.log('❌ openWindow ไม่พร้อมใช้งาน');
        }
      })
      .catch(error => {
        console.error('💥 เกิดข้อผิดพลาดในการจัดการ notification click:');
        console.error(error);
        
        // Last resort: try to open new window anyway
        if (clients.openWindow) {
          console.log('🔄 ลองเปิดหน้าต่างใหม่อีกครั้ง...');
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
