
'use client'
import { FormEvent, useState } from 'react'
import DeviceSelector from '@/components/DeviceSelector'
import NotificationHistory from '@/components/NotificationHistory'

export default function HomePage() {
  const [title, setTitle] = useState('Hello from Next PWA')
  const [body, setBody] = useState('This is a test push notification.')
  const [status, setStatus] = useState<string | null>(null)
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [sendToAll, setSendToAll] = useState(true)
  const [sending, setSending] = useState(false)



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
      
      <NotificationHistory />
      
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
            fontWeight: '500'
          }}
        >
          {sending ? 'Sending...' : 'Send Notification'}
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
        <strong>วิธีใช้งาน:</strong><br />
        1. กด "Send Notification" เพื่อส่งการแจ้งเตือน<br />
        2. <strong>หาก app เปิดอยู่:</strong> จะไม่แสดงการแจ้งเตือนใดๆ (silent mode) แต่จะ log ข้อความใน console<br />
        3. <strong>หาก app ปิดอยู่:</strong> จะแสดงการแจ้งเตือนของ browser ปกติ<br />
        4. <strong>เมื่อกดแจ้งเตือน:</strong> จะมี toast notification แสดงข้อมูลและ log ใน console<br />
        5. ดูประวัติการแจ้งเตือนใน "Notification History" ด้านบน<br />
        6. ข้อมูลทั้งหมดถูกเก็บใน console, localStorage และ window object<br />
      </div>
      
      <div style={{ 
        marginTop: '12px', 
        padding: '12px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <strong>💡 เคล็ดลับ:</strong><br />
        • เปิด Developer Tools → Console เพื่อดู logs แบบละเอียด<br />
        • <strong>App เปิดอยู่:</strong> ไม่มีการแจ้งเตือนใดๆ แต่ข้อมูลจะแสดงใน console และ toast notification<br />
        • <strong>App ปิดอยู่:</strong> จะเห็นการแจ้งเตือนของ browser ปกติ<br />
        • <strong>เมื่อกดแจ้งเตือน:</strong> จะมี toast แสดงข้อมูลและเก็บใน Notification History<br />
        • ใช้คำสั่ง <code>console.log(window.notificationClicks)</code> เพื่อดูประวัติการกด<br />
        • ใช้คำสั่ง <code>console.log(window.receivedNotifications)</code> เพื่อดูข้อมูลที่ได้รับ<br />
        • ข้อมูลทั้งหมดจะถูกเก็บใน localStorage ด้วย<br />
      </div>
    </div>
  )
}