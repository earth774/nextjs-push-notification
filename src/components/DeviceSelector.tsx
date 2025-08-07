// src/components/DeviceSelector.tsx
'use client'

import { useEffect, useState } from 'react'

interface Device {
  id: number
  deviceId: string
  deviceName: string
  platform: string
  userAgent: string
  userId?: string
  lastUsed: string
  createdAt: string
}

interface DeviceSelectorProps {
  selectedDevices: string[]
  onDeviceSelectionChange: (deviceIds: string[]) => void
  onSendToAllChange: (sendToAll: boolean) => void
  sendToAll: boolean
}

export default function DeviceSelector({ 
  selectedDevices, 
  onDeviceSelectionChange, 
  onSendToAllChange,
  sendToAll 
}: DeviceSelectorProps) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingDevice, setDeletingDevice] = useState<string | null>(null)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/devices')
      if (response.ok) {
        const data = await response.json()
        setDevices(data.devices)
      } else {
        setError('Failed to load devices')
      }
    } catch (err) {
      setError('Error loading devices')
    } finally {
      setLoading(false)
    }
  }

  const handleDeviceToggle = (deviceId: string) => {
    const newSelection = selectedDevices.includes(deviceId)
      ? selectedDevices.filter(id => id !== deviceId)
      : [...selectedDevices, deviceId]
    
    onDeviceSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedDevices.length === devices.length) {
      onDeviceSelectionChange([])
    } else {
      onDeviceSelectionChange(devices.map(d => d.deviceId))
    }
  }

  const handleDeleteDevice = async (deviceId: string, deviceName: string) => {
    if (!confirm(`Are you sure you want to delete "${deviceName}"? This will remove all push subscriptions for this device.`)) {
      return
    }

    setDeletingDevice(deviceId)
    
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove device from local state
        setDevices(prev => prev.filter(d => d.deviceId !== deviceId))
        
        // Remove from selected devices if it was selected
        if (selectedDevices.includes(deviceId)) {
          onDeviceSelectionChange(selectedDevices.filter(id => id !== deviceId))
        }
        
        // Device deleted successfully
      } else {
        const data = await response.json()
        alert(`Failed to delete device: ${data.error}`)
      }
    } catch (err) {
      console.error('Delete device error:', err)
      alert('Error deleting device')
    } finally {
      setDeletingDevice(null)
    }
  }

  const formatLastUsed = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'android': return '🤖'
      case 'ios': return '📱'
      case 'windows': return '💻'
      case 'macos': return '🖥️'
      case 'linux': return '🐧'
      default: return '📱'
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p>Loading devices...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#fee', 
        border: '1px solid #fcc', 
        borderRadius: '4px',
        color: '#c33'
      }}>
        <p>❌ {error}</p>
        <button 
          onClick={fetchDevices}
          style={{
            padding: '4px 8px',
            backgroundColor: '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '4px', 
      padding: '12px',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
        Select Target Devices ({devices.length} devices)
      </h3>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={sendToAll}
            onChange={(e) => onSendToAllChange(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          <strong>Send to All Devices</strong>
        </label>
      </div>

      {!sendToAll && (
        <>
          <div style={{ marginBottom: '12px' }}>
            <button
              onClick={handleSelectAll}
              style={{
                padding: '4px 8px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginRight: '8px'
              }}
            >
              {selectedDevices.length === devices.length ? 'Deselect All' : 'Select All'}
            </button>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {selectedDevices.length} of {devices.length} selected
            </span>
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {devices.map((device) => (
              <div
                key={device.deviceId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  backgroundColor: selectedDevices.includes(device.deviceId) ? '#f0f8ff' : 'white'
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedDevices.includes(device.deviceId)}
                    onChange={() => handleDeviceToggle(device.deviceId)}
                    style={{ marginRight: '8px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ marginRight: '8px' }}>
                        {getPlatformIcon(device.platform)}
                      </span>
                      <strong style={{ fontSize: '14px' }}>
                        {device.deviceName}
                      </strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {device.platform} • Last used: {formatLastUsed(device.lastUsed)}
                    </div>
                  </div>
                </label>
                <button
                  onClick={() => handleDeleteDevice(device.deviceId, device.deviceName)}
                  disabled={deletingDevice === device.deviceId}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: deletingDevice === device.deviceId ? '#ccc' : '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: deletingDevice === device.deviceId ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    marginLeft: '8px',
                    minWidth: '60px'
                  }}
                  title="Delete this device"
                >
                  {deletingDevice === device.deviceId ? '...' : '🗑️ Delete'}
                </button>
              </div>
            ))}
          </div>

          {devices.length === 0 && (
            <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
              No devices found. Make sure at least one device is subscribed to notifications.
            </p>
          )}
        </>
      )}
    </div>
  )
}