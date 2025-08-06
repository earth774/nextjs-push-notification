// src/utils/deviceUtils.ts

/**
 * Generate a unique device ID based on browser fingerprint
 */
export function generateDeviceId(): string {
  // Use a combination of browser properties to create a semi-unique ID
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36) + Date.now().toString(36);
}

/**
 * Get device information
 */
export function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  let deviceName = 'Unknown Device';
  let platform = 'Unknown';

  // Detect platform
  if (/Android/i.test(userAgent)) {
    platform = 'Android';
    deviceName = 'Android Device';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    platform = 'iOS';
    if (/iPhone/i.test(userAgent)) deviceName = 'iPhone';
    else if (/iPad/i.test(userAgent)) deviceName = 'iPad';
    else deviceName = 'iPod';
  } else if (/Windows/i.test(userAgent)) {
    platform = 'Windows';
    deviceName = 'Windows PC';
  } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
    platform = 'macOS';
    deviceName = 'Mac';
  } else if (/Linux/i.test(userAgent)) {
    platform = 'Linux';
    deviceName = 'Linux PC';
  }

  // Detect browser
  let browser = 'Unknown Browser';
  if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/Edge/i.test(userAgent)) {
    browser = 'Edge';
  }

  deviceName = `${browser} on ${deviceName}`;

  return {
    deviceName,
    platform,
    userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}

/**
 * Get or create device ID from localStorage
 */
export function getDeviceId(): string {
  const storageKey = 'push_notification_device_id';
  let deviceId = localStorage.getItem(storageKey);
  
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(storageKey, deviceId);
  }
  
  return deviceId;
}

/**
 * Get or set device name from localStorage
 */
export function getDeviceName(): string {
  const storageKey = 'push_notification_device_name';
  let deviceName = localStorage.getItem(storageKey);
  
  if (!deviceName) {
    deviceName = getDeviceInfo().deviceName;
    localStorage.setItem(storageKey, deviceName);
  }
  
  return deviceName;
}

/**
 * Set custom device name
 */
export function setDeviceName(name: string): void {
  const storageKey = 'push_notification_device_name';
  localStorage.setItem(storageKey, name);
}