// scripts/gen-vapid.ts
import webpush from 'web-push'

const vapidKeys = webpush.generateVAPIDKeys()

console.log('Add the following to your .env.local:')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`)
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`)
console.log(`VAPID_EMAIL="mailto:you@example.com"`)