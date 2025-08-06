
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
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Next.js PWA Push Notifications</h1>
      <p>Make sure you’ve granted permission and subscribed. Then send a test notification:</p>
      <form onSubmit={sendNotification}>
        <div>
          <label>
            Title:{' '}
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            Body:{' '}
            <input value={body} onChange={(e) => setBody(e.target.value)} required />
          </label>
        </div>
        <button type="submit" style={{ marginTop: 12 }}>
          Send Notification
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  )
}