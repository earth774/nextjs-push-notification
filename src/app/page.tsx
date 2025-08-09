
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
        
        <button 
          type="button" 
          onClick={testNotificationClick}
          style={{ 
            width: '100%',
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
        1. กด "Send Notification" เพื่อส่งการแจ้งเตือน<br />
        2. เมื่อได้รับการแจ้งเตือน ให้คลิกที่มัน<br />
        3. ระบบจะเปิดหน้าใหม่แสดงรายละเอียดการแจ้งเตือน<br />
        4. ดู Browser Console สำหรับ debug logs<br />
        <br />
        <a href="/test-notification" style={{ color: '#007cba' }}>
          → ไปหน้าทดสอบ
        </a>
      </div>
    </div>
  )
}