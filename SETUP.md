# Push Notification Setup Guide

## 1. Generate VAPID Keys

รันคำสั่งนี้เพื่อสร้าง VAPID keys:

```bash
npm run generate-vapid
```

## 2. Create Environment File

สร้างไฟล์ `.env.local` ในโฟลเดอร์หลักของโปรเจกต์และเพิ่มข้อมูลดังนี้:

```env
# VAPID Keys (ได้จากคำสั่ง generate-vapid)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your_public_key_here"
VAPID_PRIVATE_KEY="your_private_key_here"
VAPID_EMAIL="your-email@example.com"

# Database URL (สำหรับ Prisma)
DATABASE_URL="file:./dev.db"
```

## 3. Setup Database

```bash
# สร้าง database และ tables
npx prisma generate
npx prisma db push
```

## 4. Build and Run

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 5. Testing Push Notifications

1. เปิดเว็บไซต์ในเบราว์เซอร์
2. คลิก "Enable Notifications" และอนุญาต notifications
3. คลิก "Subscribe to Push Notifications"
4. กรอกข้อความและคลิก "Send Notification"

## Browser Support

- **Chrome/Edge**: รองรับเต็มรูปแบบ
- **Firefox**: รองรับเต็มรูปแบบ  
- **Safari (iOS 16.4+)**: รองรับ (ต้องเพิ่มเว็บไซต์ไปยัง Home Screen ก่อน)
- **Safari (macOS)**: รองรับ

## Troubleshooting

### Push notifications ไม่ทำงาน
1. ตรวจสอบ Console logs ในเบราว์เซอร์
2. ตรวจสอบว่า VAPID keys ถูกต้อง
3. ตรวจสอบว่า Service Worker ลงทะเบียนสำเร็จ
4. ตรวจสอบว่าอนุญาต notifications แล้ว

### iOS Safari
- ต้อง "Add to Home Screen" ก่อนถึงจะได้รับ push notifications
- ต้องใช้ iOS 16.4 ขึ้นไป

### Error: VAPID keys not set
- ตรวจสอบไฟล์ `.env.local`
- ตรวจสอบว่า key names ถูกต้อง
- รีสตาร์ท development server