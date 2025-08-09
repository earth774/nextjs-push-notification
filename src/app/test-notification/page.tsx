'use client'

import { useRouter } from 'next/navigation'

export default function TestNotificationPage() {
  const router = useRouter()

  const testNotificationRedirect = () => {
    // Simulate notification click redirect
    const testUrl = `/notification?title=${encodeURIComponent('Test Title')}&body=${encodeURIComponent('Test Body Message')}&timestamp=${encodeURIComponent(new Date().toISOString())}&id=${encodeURIComponent('test-123')}`
    
    console.log('=== TESTING NOTIFICATION REDIRECT ===')
    console.log('Test URL:', testUrl)
    
    router.push(testUrl)
  }

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        console.log('=== SERVICE WORKER STATUS ===')
        console.log('Registrations found:', registrations.length)
        
        registrations.forEach((registration, index) => {
          console.log(`Registration ${index + 1}:`)
          console.log('- Scope:', registration.scope)
          console.log('- Active:', registration.active?.scriptURL)
          console.log('- Installing:', registration.installing?.scriptURL)
          console.log('- Waiting:', registration.waiting?.scriptURL)
        })

        const registration = await navigator.serviceWorker.ready
        console.log('=== READY SERVICE WORKER ===')
        console.log('Ready registration:', registration)
        console.log('Active worker:', registration.active?.scriptURL)
      } catch (error) {
        console.error('Error checking service worker:', error)
      }
    } else {
      console.log('Service Worker not supported')
    }
  }

  const testPostMessage = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        console.log('=== TESTING POST MESSAGE ===')
        
        const testUrl = `/notification?title=${encodeURIComponent('Test Message')}&body=${encodeURIComponent('Test Body from PostMessage')}&timestamp=${encodeURIComponent(new Date().toISOString())}&id=${encodeURIComponent('test-postmessage-' + Date.now())}`
        
        // Simulate what service worker does
        window.postMessage({
          type: 'NAVIGATE_TO_NOTIFICATION',
          url: testUrl
        }, '*')
        
        console.log('PostMessage sent:', testUrl)
      } catch (error) {
        console.error('Error testing post message:', error)
      }
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>Test Notification Redirect</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testNotificationRedirect}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Notification Redirect
        </button>
        
        <button 
          onClick={checkServiceWorker}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Check Service Worker
        </button>
        
        <button 
          onClick={testPostMessage}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Test PostMessage
        </button>
      </div>
      
      <div style={{ 
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Click "Check Service Worker" to verify SW is loaded</li>
          <li>Click "Test Notification Redirect" to test navigation</li>
          <li>Check browser console for debug logs</li>
          <li>Try sending a real notification from the main page</li>
        </ol>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => router.push('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          ← กลับหน้าหลัก
        </button>
      </div>
    </div>
  )
}
