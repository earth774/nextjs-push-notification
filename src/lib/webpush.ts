// src/lib/webpush.ts
import webpush from 'web-push'

const publicKey = process.env.VAPID_PUBLIC_KEY!
const privateKey = process.env.VAPID_PRIVATE_KEY!
const subject = process.env.VAPID_SUBJECT || 'mailto:you@example.com'

if (!publicKey || !privateKey) {
  throw new Error('VAPID keys are not set in environment')
}

webpush.setVapidDetails(subject, publicKey, privateKey)

export { webpush }