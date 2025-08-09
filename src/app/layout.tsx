// src/app/layout.tsx
import './globals.css'
import type { ReactNode } from 'react'
import PushSubscription from '@/components/PushSubscription'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata = {
  title: 'Next.js PWA Push',
  description: 'Example PWA with push notifications'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ErrorBoundary>
          <PushSubscription />
          <main>{children}</main>
        </ErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  console.log('=== APP LOADING ===');
                  console.log('User agent:', navigator.userAgent);
                  console.log('Platform:', navigator.platform);
                  console.log('Document visibility:', document.visibilityState);
                  console.log('Document hidden:', document.hidden);
                  
                  // Check if our service worker is already registered
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    console.log('Found existing registrations:', registrations.length);
                    
                    // Check if sw-notification.js is already registered
                    const notificationSW = registrations.find(reg => 
                      reg.active && reg.active.scriptURL.includes('sw-notification.js')
                    );
                    
                    if (notificationSW) {
                      console.log('Notification SW already registered:', notificationSW.scope);
                      return notificationSW;
                    }
                    
                    // Unregister other service workers but keep sw-notification.js
                    const unregisterPromises = registrations
                      .filter(reg => !reg.active || !reg.active.scriptURL.includes('sw-notification.js'))
                      .map(reg => {
                        console.log('Unregistering:', reg.scope);
                        return reg.unregister();
                      });
                    
                    return Promise.all(unregisterPromises).then(() => {
                      // Register our notification service worker
                      return navigator.serviceWorker.register('/sw-notification.js', {
                        scope: '/'
                      });
                    });
                  })
                    .then(function(registration) {
                      console.log('Custom SW registered successfully:', registration);
                      console.log('SW scope:', registration.scope);
                      console.log('SW active:', registration.active);
                      console.log('SW installing:', registration.installing);
                      console.log('SW waiting:', registration.waiting);
                      
                      // Handle updates
                      registration.addEventListener('updatefound', () => {
                        console.log('SW update found');
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', () => {
                            console.log('SW state changed:', newWorker.state);
                            if (newWorker.state === 'activated') {
                              console.log('New SW activated');
                              // Don't auto-reload to prevent reload loops
                            }
                          });
                        }
                      });
                    })
                    .catch(function(registrationError) {
                      console.error('SW registration failed:', registrationError);
                      console.error('Error details:', registrationError.message);
                    });
                    
                  // Function to show visual feedback for notification clicks
                  function showNotificationClickFeedback(clickData) {
                    // Create a temporary toast notification
                    const toast = document.createElement('div');
                    toast.style.cssText = \`
                      position: fixed;
                      top: 20px;
                      right: 20px;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 16px 24px;
                      border-radius: 8px;
                      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                      z-index: 10000;
                      max-width: 350px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      font-size: 14px;
                      line-height: 1.4;
                      opacity: 0;
                      transform: translateX(100%);
                      transition: all 0.3s ease-out;
                      border-left: 4px solid #4CAF50;
                    \`;
                    
                    const time = new Date(clickData.clickedAt).toLocaleTimeString('th-TH');
                    toast.innerHTML = \`
                      <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 16px; margin-right: 8px;">🔔</span>
                        <strong>Notification Clicked!</strong>
                      </div>
                      <div style="margin-bottom: 4px;"><strong>Title:</strong> \${clickData.title || 'N/A'}</div>
                      <div style="margin-bottom: 4px;"><strong>Message:</strong> \${clickData.body || 'N/A'}</div>
                      <div style="font-size: 12px; opacity: 0.8;">Clicked at: \${time}</div>
                    \`;
                    
                    document.body.appendChild(toast);
                    
                    // Animate in
                    setTimeout(() => {
                      toast.style.opacity = '1';
                      toast.style.transform = 'translateX(0)';
                    }, 100);
                    
                    // Animate out and remove
                    setTimeout(() => {
                      toast.style.opacity = '0';
                      toast.style.transform = 'translateX(100%)';
                      setTimeout(() => {
                        if (toast.parentNode) {
                          toast.parentNode.removeChild(toast);
                        }
                      }, 300);
                    }, 4000);
                  }
                  
                  // Setup comprehensive message listening
                  function handleNavigationMessage(data, source = 'unknown') {
                    // Handle notification click data
                    if (data && data.type === 'NOTIFICATION_CLICKED') {
                      console.log('🔔 ==============================');
                      console.log('🔔 NOTIFICATION CLICKED IN APP!');
                      console.log('🔔 ==============================');
                      console.log('📡 แหล่งที่มา:', source);
                      console.log('👁️  App visibility:', document.visibilityState);
                      console.log('📱 Title:', data.data.title);
                      console.log('📝 Body:', data.data.body);
                      console.log('🆔 Tag:', data.data.tag);
                      console.log('🎯 Data:', data.data.data);
                      console.log('⏰ Clicked at:', data.data.clickedAt);
                      console.log('🎬 Action:', data.data.action);
                      console.log('🔔 ==============================');
                      
                      // Store in window object for easy access
                      if (!window.notificationClicks) {
                        window.notificationClicks = [];
                      }
                      window.notificationClicks.unshift(data.data); // Add to beginning
                      
                      // Keep only last 20 clicks in memory
                      if (window.notificationClicks.length > 20) {
                        window.notificationClicks.splice(20);
                      }
                      
                      console.log('📋 Notification click data stored in window.notificationClicks');
                      console.log('🔍 Use: console.log(window.notificationClicks) to view all clicks');
                      
                      // Show visual feedback
                      showNotificationClickFeedback(data.data);
                      return;
                    }
                    
                    // Handle silent notification data (no UI display)
                    if (data && data.type === 'NOTIFICATION_DATA_RECEIVED') {
                      console.log('📨 ==============================');
                      console.log('📨 ได้รับข้อมูลการแจ้งเตือน (ไม่แสดง UI)');
                      console.log('📨 ==============================');
                      console.log('📡 แหล่งที่มา:', source);
                      console.log('👁️  App visibility:', document.visibilityState);
                      console.log('📱 Title:', data.title);
                      console.log('📝 Body:', data.body);
                      console.log('🎯 URL:', data.url);
                      console.log('🆔 ID:', data.id);
                      console.log('⏰ Timestamp:', data.timestamp);
                      
                      console.log('🔇 การแจ้งเตือนถูกส่งมาแต่ไม่แสดง UI เพราะ app เปิดอยู่');
                      console.log('💡 ข้อมูลสามารถเข้าถึงได้จาก console logs หรือ localStorage');
                      
                      // Store in window object for easy access
                      if (!window.receivedNotifications) {
                        window.receivedNotifications = [];
                      }
                      window.receivedNotifications.push({
                        title: data.title,
                        body: data.body,
                        url: data.url,
                        id: data.id,
                        timestamp: data.timestamp,
                        receivedAt: new Date().toISOString()
                      });
                      
                      console.log('📋 ข้อมูลถูกเก็บใน window.receivedNotifications');
                      console.log('🔍 ใช้คำสั่ง: console.log(window.receivedNotifications) เพื่อดูข้อมูลทั้งหมด');
                      return;
                    }
                    
                    // Handle direct navigation
                    if (data && data.type === 'NAVIGATE_TO_NOTIFICATION') {
                      console.log('📨 ==============================');
                      console.log('📨 ได้รับคำสั่ง Navigate!');
                      console.log('📨 ==============================');
                      console.log('📡 แหล่งที่มา:', source);
                      console.log('👁️  App visibility:', document.visibilityState);
                      console.log('📍 URL ปัจจุบัน:', window.location.href);
                      console.log('🎯 URL ปลายทาง:', data.url);
                      
                      console.log('🚀 กำลัง navigate ทันที...');
                      window.location.href = data.url;
                      console.log('✅ Navigate command executed!');
                    }
                  }
                  
                  // Method 1: BroadcastChannel listener (most reliable)
                  try {
                    const navChannel = new BroadcastChannel('notification-navigation');
                    navChannel.addEventListener('message', function(event) {
                      console.log('📡 BroadcastChannel (navigation): ได้รับข้อความ');
                      handleNavigationMessage(event.data, 'BroadcastChannel-Navigation');
                    });
                    console.log('Navigation BroadcastChannel listener setup complete');
                  } catch (bcError) {
                    console.log('Navigation BroadcastChannel not supported:', bcError);
                  }
                  
                  // Notification logs BroadcastChannel listener
                  try {
                    const logsChannel = new BroadcastChannel('notification-logs');
                    logsChannel.addEventListener('message', function(event) {
                      console.log('📡 BroadcastChannel (logs): ได้รับข้อความ');
                      handleNavigationMessage(event.data, 'BroadcastChannel-Logs');
                    });
                    console.log('Logs BroadcastChannel listener setup complete');
                  } catch (bcError) {
                    console.log('Logs BroadcastChannel not supported:', bcError);
                  }
                  
                  // Method 2: localStorage listener (fallback)
                  window.addEventListener('storage', function(event) {
                    if (event.key === 'sw-navigation' && event.newValue) {
                      console.log('💾 localStorage: ได้รับ navigation trigger');
                      try {
                        const data = JSON.parse(event.newValue);
                        handleNavigationMessage(data, 'localStorage');
                      } catch (parseError) {
                        console.log('❌ ไม่สามารถ parse localStorage data:', parseError);
                      }
                    }
                    
                    if (event.key === 'sw-notification-data' && event.newValue) {
                      console.log('💾 localStorage: ได้รับข้อมูลการแจ้งเตือน');
                      try {
                        const data = JSON.parse(event.newValue);
                        handleNavigationMessage(data, 'localStorage');
                      } catch (parseError) {
                        console.log('❌ ไม่สามารถ parse notification data:', parseError);
                      }
                    }
                  });
                  
                  // Also check localStorage on load (in case we missed the event)
                  try {
                    const existingNav = localStorage.getItem('sw-navigation');
                    if (existingNav) {
                      const data = JSON.parse(existingNav);
                      // Only process if recent (within 5 seconds)
                      if (Date.now() - data.timestamp < 5000) {
                        console.log('=== FOUND EXISTING NAVIGATION REQUEST ===');
                        handleNavigationMessage(data, 'localStorage-existing');
                        localStorage.removeItem('sw-navigation');
                      }
                    }
                  } catch (lsError) {
                    console.log('localStorage check failed:', lsError);
                  }
                  
                  // Listen for messages from service worker
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.addEventListener('message', function(event) {
                      console.log('🔧 ServiceWorker: ได้รับข้อความ');
                      handleNavigationMessage(event.data, 'ServiceWorker');
                    });
                    
                    // Listen on service worker ready
                    navigator.serviceWorker.ready.then(function(registration) {
                      console.log('=== SW READY - SETTING UP LISTENERS ===');
                      
                      // Listen on the active service worker
                      if (registration.active) {
                        registration.active.addEventListener('message', function(event) {
                          console.log('=== ACTIVE SW MESSAGE ===');
                          console.log('Data:', event.data);
                          handleNavigationMessage(event.data, 'ActiveServiceWorker');
                        });
                      }
                    });
                  }
                  
                  // Window message listener (fallback)
                  window.addEventListener('message', function(event) {
                    console.log('=== WINDOW MESSAGE ===');
                    console.log('Origin:', event.origin);
                    console.log('Data:', event.data);
                    handleNavigationMessage(event.data, 'Window');
                  });
                  
                  // Listen for visibility changes
                  document.addEventListener('visibilitychange', function() {
                    console.log('=== VISIBILITY CHANGED ===');
                    console.log('Document visibility:', document.visibilityState);
                    console.log('Document hidden:', document.hidden);
                  });
                });
              } else {
                console.log('Service Worker not supported in this browser');
                console.log('User agent:', navigator.userAgent);
              }
            `,
          }}
        />
      </body>
    </html>
  )
}