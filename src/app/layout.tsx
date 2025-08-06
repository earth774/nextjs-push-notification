// src/app/layout.tsx
import './globals.css'
import type { ReactNode } from 'react'
import PushSubscription from '@/components/PushSubscription'

export const metadata = {
  title: 'Next.js PWA Push',
  description: 'Example PWA with push notifications'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <PushSubscription />
        <main>{children}</main>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  console.log('Registering service worker...');
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered successfully:', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed:', registrationError);
                    });
                });
              } else {
                console.log('Service Worker not supported');
              }
            `,
          }}
        />
      </body>
    </html>
  )
}