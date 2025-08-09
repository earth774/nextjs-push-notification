'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function NotificationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const title = searchParams.get('title') || 'ไม่พบหัวข้อ'
  const body = searchParams.get('body') || 'ไม่พบเนื้อหา'
  const timestamp = searchParams.get('timestamp') || new Date().toISOString()
  const notificationId = searchParams.get('id') || 'unknown'

  // แปลงเวลาให้เป็นภาษาไทย
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Bangkok'
      }).format(date)
    } catch {
      return 'ไม่สามารถแสดงเวลาได้'
    }
  }

  const goBack = () => {
    router.back()
  }

  const goHome = () => {
    router.push('/')
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            margin: '0',
            color: '#2c3e50'
          }}>
            📱 รายละเอียดการแจ้งเตือน
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={goBack}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← กลับ
            </button>
            <button 
              onClick={goHome}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007cba',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🏠 หน้าหลัก
            </button>
          </div>
        </div>
        
        <div style={{
          fontSize: '14px',
          color: '#6c757d',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>🆔 ID: {notificationId}</span>
          <span>•</span>
          <span>⏰ {formatTimestamp(timestamp)}</span>
        </div>
      </div>

      {/* Notification Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px',
            fontWeight: '600',
            color: '#495057',
            marginBottom: '8px'
          }}>
            📋 หัวข้อ (Title)
          </label>
          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '500',
            color: '#2c3e50',
            wordBreak: 'break-word'
          }}>
            {title}
          </div>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px',
            fontWeight: '600',
            color: '#495057',
            marginBottom: '8px'
          }}>
            📝 เนื้อหา (Body)
          </label>
          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#495057',
            minHeight: '100px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}>
            {body}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          margin: '0 0 16px 0',
          color: '#2c3e50'
        }}>
          ℹ️ ข้อมูลเพิ่มเติม
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '12px 20px',
          fontSize: '14px'
        }}>
          <span style={{ fontWeight: '500', color: '#495057' }}>สถานะ:</span>
          <span style={{ color: '#28a745' }}>✅ อ่านแล้ว</span>
          
          <span style={{ fontWeight: '500', color: '#495057' }}>ประเภท:</span>
          <span style={{ color: '#6c757d' }}>Push Notification</span>
          
          <span style={{ fontWeight: '500', color: '#495057' }}>แหล่งที่มา:</span>
          <span style={{ color: '#6c757d' }}>Next.js PWA</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <button 
          onClick={goHome}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ส่งการแจ้งเตือนใหม่
        </button>
      </div>
    </div>
  )
}

export default function NotificationPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div>กำลังโหลด...</div>
      </div>
    }>
      <NotificationContent />
    </Suspense>
  )
}
