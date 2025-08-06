// src/components/PushSubscription.tsx
'use client'

import { useEffect, useState } from 'react'

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushSubscription() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    console.log('=== Debug Info ===')
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('ServiceWorker supported:', 'serviceWorker' in navigator)
  console.log('PushManager supported:', 'PushManager' in window)
  console.log('Current permission:', Notification.permission)
  

    setPermission(Notification.permission)
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    // เช็คว่ามี subscription อยู่แล้วหรือไม่
    const checkExistingSubscription = async () => {
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready
        const existing = await registration.pushManager.getSubscription()
        if (existing) {
          setSubscribed(true)
        }
      }
    }

    checkExistingSubscription()
  }, [permission])

  const requestNotificationPermission = async () => {
      try {
      console.log('perm')
      const perm = await Notification.requestPermission()
      console.log('perm', perm)
      setPermission(perm)
      
      if (perm === 'granted') {
        await subscribeToNotifications()
      }
    } catch (e) {
      console.error('Permission request failed', e)
    }
  }

  const subscribeToNotifications = async () => {
    try {
      console.log('Checking service worker support...')
      
      // เช็คว่า browser support service worker หรือไม่
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported')
      }

      console.log('Waiting for service worker registration...')
      
      // รอให้ service worker register เสร็จก่อน หรือ register เอง
      let registration: ServiceWorkerRegistration
      
      try {
        // ลองรอ service worker ที่มีอยู่แล้ว
        registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<ServiceWorkerRegistration>((_, reject) => 
            setTimeout(() => reject(new Error('Service Worker timeout')), 5000)
          )
        ])
        console.log('Existing service worker found:', registration)
      } catch (timeoutError) {
        console.log('No existing service worker, registering new one...')
        // ถ้าไม่มี service worker ให้ register เอง
        registration = await navigator.serviceWorker.register('/sw.js')
        console.log('New service worker registered:', registration)
        
        // รอให้ service worker พร้อมใช้งาน
        await new Promise<void>((resolve) => {
          if (registration.active) {
            resolve()
          } else {
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'activated') {
                    resolve()
                  }
                })
              }
            })
          }
        })
      }

      console.log('Service worker ready:', registration)
    
    const existing = await registration.pushManager.getSubscription()
    if (existing) {
      setSubscribed(true)
      return
    }

    console.log('Subscribing to push notifications...')
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    })

    // ... rest of the code
  } catch (e) {
    console.error('Subscription failed:', e)
    // setError(`Subscription failed: ${e.message}`)
  }
}

  return (
    <div style={{ padding: 8 }}>
      <p>Push permission: {permission}</p>
      <p>Subscribed: {subscribed ? '✅' : '❌'}</p>
      
      {permission === 'default' && (
        <button onClick={requestNotificationPermission}>
          Enable Notifications
        </button>
      )}
      
      {permission === 'granted' && !subscribed && (
        <button onClick={subscribeToNotifications}>
          Subscribe to Push Notifications
        </button>
      )}
    </div>
  )
}