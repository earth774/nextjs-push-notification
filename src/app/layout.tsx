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
                  console.log('Registering service worker...');
                  console.log('User agent:', navigator.userAgent);
                  console.log('Platform:', navigator.platform);
                  
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
                  function handleNavigationMessage(data) {
                    if (data && data.type === 'NAVIGATE_TO_NOTIFICATION') {
                      console.log('=== EXECUTING NAVIGATION ===');
                      console.log('Navigating to:', data.url);
                      
                      // Force navigation
                      setTimeout(() => {
                        window.location.href = data.url;
                      }, 100);
                    }
                  }
                  
                  // Listen for messages from service worker
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.addEventListener('message', function(event) {
                      console.log('=== SW MESSAGE RECEIVED ===');
                      console.log('Data:', event.data);
                      handleNavigationMessage(event.data);
                    });
                    
                    // Listen on service worker ready
                    navigator.serviceWorker.ready.then(function(registration) {
                      console.log('=== SW READY - SETTING UP LISTENERS ===');
                      
                      // Listen on the active service worker
                      if (registration.active) {
                        registration.active.addEventListener('message', function(event) {
                          console.log('=== ACTIVE SW MESSAGE ===');
                          console.log('Data:', event.data);
                          handleNavigationMessage(event.data);
                        });
                      }
                    });
                  }
                  
                  // Window message listener (fallback)
                  window.addEventListener('message', function(event) {
                    console.log('=== WINDOW MESSAGE ===');
                    console.log('Origin:', event.origin);
                    console.log('Data:', event.data);
                    handleNavigationMessage(event.data);
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