
'use client'
import { FormEvent, useState } from 'react'

export default function HomePage() {
  const [title, setTitle] = useState('Hello from Next PWA')
  const [body, setBody] = useState('This is a test push notification.')
  const [status, setStatus] = useState<string | null>(null)

  const sendNotification = async (e: FormEvent) => {
    e.preventDefault()
    const resp = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    })
    const data = await resp.json()
    if (resp.ok) setStatus('Notification sent')
    else setStatus('Failed: ' + data.error)
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
        Make sure you've granted permission and subscribed. Then send a test notification:
      </p>
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
          style={{ 
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Send Notification
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
    </div>
  )
}