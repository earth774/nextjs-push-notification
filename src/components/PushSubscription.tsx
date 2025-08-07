// src/components/PushSubscription.tsx
'use client'

import { useEffect, useState } from 'react'
import { getDeviceId, getDeviceName, getDeviceInfo } from '@/utils/deviceUtils'

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

if (!publicVapidKey) {
  console.error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set')
}

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
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    console.log('=== Debug Info ===')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('ServiceWorker supported:', 'serviceWorker' in navigator)
    console.log('PushManager supported:', 'PushManager' in window)
    console.log('Notification supported:', 'Notification' in window)
    console.log('Current permission:', 'Notification' in window ? Notification.permission : 'not supported')
    console.log('VAPID key available:', !!publicVapidKey)
    console.log('User agent:', navigator.userAgent)
    
    // Check for mobile browser support
    if (!('serviceWorker' in navigator)) {
      setError('Service Worker not supported in this browser')
      setIsSupported(false)
      return
    }
    
    if (!('PushManager' in window)) {
      setError('Push messaging not supported in this browser')
      setIsSupported(false)
      return
    }
    
    if (!('Notification' in window)) {
      setError('Notifications not supported in this browser')
      setIsSupported(false)
      return
    }

    if (!publicVapidKey) {
      setError('VAPID key not configured')
      setIsSupported(false)
      return
    }

    setPermission(Notification.permission)

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
      console.log('Requesting notification permission...')
      setError(null) // Clear any previous errors
      
      const perm = await Notification.requestPermission()
      console.log('Permission result:', perm)
      setPermission(perm)
      
      if (perm === 'granted') {
        await subscribeToNotifications()
      } else if (perm === 'denied') {
        setError('Notification permission denied. Please enable notifications in your browser settings.')
      }
    } catch (e) {
      console.error('Permission request failed', e)
      setError(`Permission request failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
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
        registration = await navigator.serviceWorker.register('/sw-custom.js')
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
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey!)
    })

    console.log('Push subscription created:', subscription)

    // Get device information
    const deviceId = getDeviceId()
    const deviceName = getDeviceName()
    const deviceInfo = getDeviceInfo()

    // Send subscription to server with device info
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null,
        auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null
      },
      device_id: deviceId,
      device_name: deviceName,
      user_agent: deviceInfo.userAgent,
      platform: deviceInfo.platform,
      user_id: null // You can set this if you have user authentication
    }

    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData)
    })

    if (response.ok) {
      setSubscribed(true)
      window.location.reload()
      console.log('Subscription sent to server successfully')
    } else {
      const errorData = await response.text()
      console.error('Failed to send subscription to server:', errorData)
      setError('Failed to send subscription to server')
    }
  } catch (e) {
    console.error('Subscription failed:', e)
    setError(`Subscription failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
  }
}

  if (!isSupported) {
    return (
      <div style={{ padding: 8, backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: 4 }}>
        <p><strong>❌ Push notifications not supported</strong></p>
        <p style={{ fontSize: '14px', color: '#666' }}>{error}</p>
        <p style={{ fontSize: '12px', color: '#888' }}>
          This may be due to your browser or device limitations. Try using Chrome, Firefox, or Safari on a supported device.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: 8 }}>
      <p>Push permission: {permission}</p>
      <p>Subscribed: {subscribed ? '✅' : '❌'}</p>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          border: '1px solid #fcc', 
          borderRadius: 4, 
          padding: 8, 
          marginBottom: 8,
          fontSize: '14px',
          color: '#c33'
        }}>
          {error}
        </div>
      )}
      
      {permission === 'default' && (
        <button 
          onClick={requestNotificationPermission}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Enable Notifications
        </button>
      )}
      
      {permission === 'granted' && !subscribed && (
        <button 
          onClick={subscribeToNotifications}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Subscribe to Push Notifications
        </button>
      )}
      
      {permission === 'denied' && (
        <div style={{ fontSize: '14px', color: '#666' }}>
          <p>❌ Notifications blocked</p>
          <p>Please enable notifications in your browser settings and refresh the page.</p>
        </div>
      )}
    </div>
  )
}