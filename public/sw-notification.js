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
      console.log('🔍 ===== PUSH EVENT PROCESSING =====');
      console.log('📅 เวลา:', new Date().toLocaleString('th-TH'));
      console.log('📊 จำนวน clients:', clientList.length);
      
      let hasVisibleClient = false;
      let visibleClients = [];
      
      for (const client of clientList) {
        console.log(`📱 Client: ${client.url}`);
        console.log(`   👁️  Visibility: ${client.visibilityState}`);
        console.log(`   🎯 Focused: ${client.focused}`);
        
        if (client.visibilityState === 'visible') {
          hasVisibleClient = true;
          visibleClients.push(client);
        }
      }
      
      console.log('🔍 App อยู่ foreground:', hasVisibleClient);
      console.log('📊 Visible clients:', visibleClients.length);
      
      // If app is in foreground, send direct navigation message
      if (hasVisibleClient && visibleClients.length > 0) {
        console.log('⚠️  App อยู่ foreground - ส่งข้อความตรงไปยัง app!');
        
        const title = encodeURIComponent(notificationData.title || 'ไม่พบหัวข้อ');
        const body = encodeURIComponent(notificationData.body || 'ไม่พบเนื้อหา');
        const timestamp = encodeURIComponent(notificationData.data?.timestamp || new Date().toISOString());
        const notificationId = encodeURIComponent(notificationData.data?.id || Date.now().toString());
        const notificationUrl = `/notification?title=${title}&body=${body}&timestamp=${timestamp}&id=${notificationId}`;
        
        console.log('🎯 Navigation URL:', notificationUrl);
        
        // Send message to all visible clients
        visibleClients.forEach(client => {
          console.log('📤 ส่งข้อความไปยัง:', client.url);
          
          // Method 1: BroadcastChannel
          try {
            const channel = new BroadcastChannel('notification-navigation');
            channel.postMessage({
              type: 'NAVIGATE_TO_NOTIFICATION',
              url: notificationUrl,
              source: 'push-foreground'
            });
            channel.close();
            console.log('✅ BroadcastChannel sent');
          } catch (e) {
            console.log('❌ BroadcastChannel failed:', e);
          }
          
          // Method 2: postMessage
          client.postMessage({
            type: 'NAVIGATE_TO_NOTIFICATION',
            url: notificationUrl,
            source: 'push-foreground'
          });
          console.log('✅ postMessage sent');
          
          // Method 3: localStorage
          try {
            localStorage.setItem('sw-navigation', JSON.stringify({
              type: 'NAVIGATE_TO_NOTIFICATION',
              url: notificationUrl,
              timestamp: Date.now(),
              source: 'push-foreground'
            }));
            console.log('✅ localStorage set');
          } catch (e) {
            console.log('❌ localStorage failed:', e);
          }
        });
      }
      
      // ALWAYS show notification regardless of app state
      console.log('📢 ===== แสดงการแจ้งเตือน =====');
      console.log('📱 Title:', notificationData.title);
      console.log('📝 Body:', notificationData.body);
      console.log('📊 Data:', notificationData.data);
      
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
        console.log('✅ การแจ้งเตือนแสดงสำเร็จ!');
      }).catch(error => {
        console.error('❌ ไม่สามารถแสดงการแจ้งเตือนได้:', error);
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
  console.log('🔔 =========================');
  console.log('🔔 การแจ้งเตือนถูกคลิก!');
  console.log('🔔 =========================');
  console.log('📱 หัวข้อ:', event.notification.title);
  console.log('📝 เนื้อหา:', event.notification.body);
  console.log('🆔 Tag:', event.notification.tag);
  console.log('📊 Data:', event.notification.data);
  
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
        console.log('🔍 ตรวจสอบ clients ที่เปิดอยู่...');
        console.log('📊 จำนวน clients:', clientList.length);
        console.log('🎯 URL ปลายทาง:', notificationUrl);
        
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
                url: notificationUrl
              });
              channel.close();
              console.log('✅ ส่ง BroadcastChannel สำเร็จ');
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
              url: notificationUrl
            });
            console.log('✅ ส่ง postMessage สำเร็จ');
            
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
