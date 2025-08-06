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
                  
                  navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                  })
                    .then(function(registration) {
                      console.log('SW registered successfully:', registration);
                      console.log('SW scope:', registration.scope);
                      
                      // Handle updates
                      registration.addEventListener('updatefound', () => {
                        console.log('SW update found');
                      });
                    })
                    .catch(function(registrationError) {
                      console.error('SW registration failed:', registrationError);
                      console.error('Error details:', registrationError.message);
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