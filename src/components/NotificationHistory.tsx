'use client'

import { useEffect, useState } from 'react'

interface NotificationClick {
  title: string
  body: string
  tag: string
  data: any
  clickedAt: string
  action: string
}

interface ReceivedNotification {
  title: string
  body: string
  url: string
  id: string
  timestamp: string
  receivedAt: string
}

export default function NotificationHistory() {
  const [clickHistory, setClickHistory] = useState<NotificationClick[]>([])
  const [receivedHistory, setReceivedHistory] = useState<ReceivedNotification[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check for existing data in window object
    const updateHistory = () => {
      if (typeof window !== 'undefined') {
        if (window.notificationClicks) {
          setClickHistory([...window.notificationClicks])
        }
        if (window.receivedNotifications) {
          setReceivedHistory([...window.receivedNotifications])
        }
      }
    }

    // Initial load
    updateHistory()

    // Update every 2 seconds to catch new notifications
    const interval = setInterval(updateHistory, 2000)

    // Listen for storage changes for click history
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notification-clicks' && e.newValue) {
        try {
          const clicks = JSON.parse(e.newValue)
          setClickHistory(clicks)
        } catch (error) {
          console.error('Failed to parse notification clicks:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return timestamp
    }
  }

  const clearHistory = () => {
    setClickHistory([])
    setReceivedHistory([])
    if (typeof window !== 'undefined') {
      window.notificationClicks = []
      window.receivedNotifications = []
      localStorage.removeItem('notification-clicks')
    }
  }

  const totalNotifications = clickHistory.length + receivedHistory.length

  if (!isVisible && totalNotifications === 0) {
    return (
      <div style={{
        padding: '12px',
        margin: '8px 0',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px'
      }}>
        <button
          onClick={() => setIsVisible(!isVisible)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '14px',
            color: '#6c757d',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📊 Notification History (No notifications yet)
        </button>
      </div>
    )
  }

  return (
    <div style={{
      padding: '12px',
      margin: '8px 0',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isVisible ? '12px' : '0'
      }}>
        <button
          onClick={() => setIsVisible(!isVisible)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isVisible ? '📊' : '📊'} Notification History ({totalNotifications})
          <span style={{ fontSize: '12px' }}>{isVisible ? '▼' : '▶'}</span>
        </button>
        
        {totalNotifications > 0 && (
          <button
            onClick={clearHistory}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>

      {isVisible && (
        <div>
          {/* Clicked Notifications */}
          {clickHistory.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '14px', 
                color: '#495057',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔔 Clicked Notifications ({clickHistory.length})
              </h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {clickHistory.map((click, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      marginBottom: '8px',
                      backgroundColor: '#e3f2fd',
                      border: '1px solid #bbdefb',
                      borderRadius: '6px',
                      borderLeft: '4px solid #2196f3'
                    }}
                  >
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '13px',
                      marginBottom: '4px',
                      color: '#1976d2'
                    }}>
                      {click.title || 'No Title'}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      marginBottom: '4px',
                      color: '#424242'
                    }}>
                      {click.body || 'No Message'}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#666',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>Action: {click.action}</span>
                      <span>{formatTime(click.clickedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Received Notifications (Silent) */}
          {receivedHistory.length > 0 && (
            <div>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '14px', 
                color: '#495057',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔇 Silent Notifications ({receivedHistory.length})
              </h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {receivedHistory.map((notification, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      marginBottom: '8px',
                      backgroundColor: '#f3e5f5',
                      border: '1px solid #ce93d8',
                      borderRadius: '6px',
                      borderLeft: '4px solid #9c27b0'
                    }}
                  >
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '13px',
                      marginBottom: '4px',
                      color: '#7b1fa2'
                    }}>
                      {notification.title || 'No Title'}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      marginBottom: '4px',
                      color: '#424242'
                    }}>
                      {notification.body || 'No Message'}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#666',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>ID: {notification.id}</span>
                      <span>{formatTime(notification.receivedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalNotifications === 0 && (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              color: '#6c757d',
              fontSize: '14px'
            }}>
              No notification history yet.<br />
              <small>Send a notification to see it logged here.</small>
            </div>
          )}

          {/* Developer Tools */}
          <div style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#495057'
          }}>
            <strong>Developer Tools:</strong><br />
            • <code>console.log(window.notificationClicks)</code> - View click history<br />
            • <code>console.log(window.receivedNotifications)</code> - View received notifications<br />
            • <code>localStorage.getItem('notification-clicks')</code> - View stored clicks
          </div>
        </div>
      )}
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    notificationClicks: NotificationClick[]
    receivedNotifications: ReceivedNotification[]
  }
}
