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
                    
                  // Setup comprehensive message listening
                  function handleNavigationMessage(data, source = 'unknown') {
                    if (data && data.type === 'NAVIGATE_TO_NOTIFICATION') {
                      console.log('📨 ==============================');
                      console.log('📨 ได้รับคำสั่ง Navigate!');
                      console.log('📨 ==============================');
                      console.log('📡 แหล่งที่มา:', source);
                      console.log('👁️  App visibility:', document.visibilityState);
                      console.log('📍 URL ปัจจุบัน:', window.location.href);
                      console.log('🎯 URL ปลายทาง:', data.url);
                      
                      console.log('🚀 กำลัง navigate...');
                      window.location.href = data.url;
                      console.log('✅ Navigate command executed!');
                    }
                  }
                  
                  // Method 1: BroadcastChannel listener (most reliable)
                  try {
                    const navChannel = new BroadcastChannel('notification-navigation');
                    navChannel.addEventListener('message', function(event) {
                      console.log('📡 BroadcastChannel: ได้รับข้อความ');
                      handleNavigationMessage(event.data, 'BroadcastChannel');
                    });
                    console.log('BroadcastChannel listener setup complete');
                  } catch (bcError) {
                    console.log('BroadcastChannel not supported:', bcError);
                  }
                  
                  // Method 2: localStorage listener (fallback)
                  window.addEventListener('storage', function(event) {
                    if (event.key === 'sw-navigation' && event.newValue) {
                      console.log('💾 localStorage: ได้รับ trigger');
                      try {
                        const data = JSON.parse(event.newValue);
                        handleNavigationMessage(data, 'localStorage');
                      } catch (parseError) {
                        console.log('❌ ไม่สามารถ parse localStorage data:', parseError);
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