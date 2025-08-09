
'use client'
import { FormEvent, useState } from 'react'
import DeviceSelector from '@/components/DeviceSelector'

export default function HomePage() {
  const [title, setTitle] = useState('Hello from Next PWA')
  const [body, setBody] = useState('This is a test push notification.')
  const [status, setStatus] = useState<string | null>(null)
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [sendToAll, setSendToAll] = useState(true)
  const [sending, setSending] = useState(false)

  const testNotificationClick = () => {
    // Simulate notification click redirect
    const testUrl = `/notification?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&timestamp=${encodeURIComponent(new Date().toISOString())}&id=${encodeURIComponent('test-' + Date.now())}`
    
    console.log('=== TESTING NOTIFICATION REDIRECT ===')
    console.log('Test URL:', testUrl)
    
    window.location.href = testUrl
  }

  const simulateNotificationClick = async () => {
    console.log('=== SIMULATING SERVICE WORKER NOTIFICATION CLICK ===')
    
    // Send a message to simulate what the service worker would do
    const testUrl = `/notification?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&timestamp=${encodeURIComponent(new Date().toISOString())}&id=${encodeURIComponent('sw-test-' + Date.now())}`
    
    // Post message to window (simulating service worker postMessage)
    window.postMessage({
      type: 'NAVIGATE_TO_NOTIFICATION',
      url: testUrl
    }, '*')
    
    console.log('Posted message with URL:', testUrl)
  }

  const checkAppState = () => {
    console.log('=== CHECKING APP STATE ===')
    console.log('Document visibility:', document.visibilityState)
    console.log('Document hidden:', document.hidden)
    console.log('Window focused:', document.hasFocus())
    console.log('Current URL:', window.location.href)
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('SW registrations:', registrations.length)
        registrations.forEach((reg, index) => {
          console.log(`SW ${index + 1}:`, reg.active?.scriptURL)
        })
      })
    }
  }

  const sendNotification = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)

    try {
      const payload = {
        title,
        body,
        sendToAll,
        deviceIds: sendToAll ? [] : selectedDevices
      }

      const resp = await fetch('/api/notify-targeted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await resp.json()
      
      if (resp.ok) {
        if (data.summary) {
          setStatus(`✅ Sent successfully to ${data.summary.success} devices${data.summary.failed > 0 ? `, ${data.summary.failed} failed` : ''}`)
        } else {
          setStatus('✅ Notification sent successfully')
        }
      } else {
        setStatus('❌ Failed: ' + data.error)
      }
    } catch (error) {
      setStatus('❌ Network error occurred')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ 
      padding: '16px', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Next.js PWA Push Notifications</h1>
      <p style={{ marginBottom: '20px', lineHeight: '1.5' }}>
        Make sure you've granted permission and subscribed. Then select devices and send a notification:
      </p>
      
      <DeviceSelector
        selectedDevices={selectedDevices}
        onDeviceSelectionChange={setSelectedDevices}
        sendToAll={sendToAll}
        onSendToAllChange={setSendToAll}
      />
      
      <form onSubmit={sendNotification}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Title:
          </label>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px', // Prevents zoom on iOS
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Body:
          </label>
          <input 
            value={body} 
            onChange={(e) => setBody(e.target.value)} 
            required 
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px', // Prevents zoom on iOS
              boxSizing: 'border-box'
            }}
          />
        </div>
        <button 
          type="submit" 
          disabled={sending || (!sendToAll && selectedDevices.length === 0)}
          style={{ 
            width: '100%',
            padding: '12px 16px',
            backgroundColor: sending || (!sendToAll && selectedDevices.length === 0) ? '#ccc' : '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: sending || (!sendToAll && selectedDevices.length === 0) ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            marginBottom: '8px'
          }}
        >
          {sending ? 'Sending...' : 'Send Notification'}
        </button>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <button 
            type="button" 
            onClick={testNotificationClick}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🧪 ทดสอบหน้าการแจ้งเตือน
          </button>
          
          <button 
            type="button" 
            onClick={simulateNotificationClick}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔄 จำลอง SW Click
          </button>
        </div>
        
        <button 
          type="button" 
          onClick={checkAppState}
          style={{ 
            width: '100%',
            padding: '6px 12px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          🔍 ตรวจสอบสถานะ App
        </button>
      </form>
      {status && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px',
          backgroundColor: status.includes('Failed') ? '#fee' : '#efe',
          border: `1px solid ${status.includes('Failed') ? '#fcc' : '#cfc'}`,
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {status}
        </div>
      )}
      
      <div style={{ 
        marginTop: '20px', 
        padding: '12px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <strong>วิธีทดสอบ:</strong><br />
        1. <strong>ทดสอบการ redirect:</strong> กด "🧪 ทดสอบหน้าการแจ้งเตือน"<br />
        2. <strong>ทดสอบ PostMessage:</strong> กด "🔄 จำลอง SW Click"<br />
        3. <strong>ทดสอบจริง:</strong> กด "Send Notification" แล้วคลิกที่การแจ้งเตือน<br />
        4. <strong>Debug:</strong> ดู Browser Console สำหรับ logs<br />
        <br />
        <a href="/test-notification" style={{ color: '#007cba' }}>
          → ไปหน้าทดสอบเพิ่มเติม
        </a>
      </div>
    </div>
  )
}