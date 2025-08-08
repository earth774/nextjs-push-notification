# Next.js Push Notification PWA

ระบบ Push Notification แบบ Progressive Web App (PWA) ที่สร้างด้วย Next.js 15, TypeScript, และ Prisma

## 📋 สารบัญ

- [คุณสมบัติหลัก](#คุณสมบัติหลัก)
- [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
- [การติดตั้ง](#การติดตั้ง)
- [การตั้งค่า](#การตั้งค่า)
- [การใช้งาน](#การใช้งาน)
- [API Endpoints](#api-endpoints)
- [Components](#components)
- [Database Schema](#database-schema)
- [Service Worker](#service-worker)
- [การพัฒนา](#การพัฒนา)

## 🚀 คุณสมบัติหลัก

- ✅ **Push Notifications** - ส่งการแจ้งเตือนแบบ Real-time
- ✅ **Device Management** - จัดการอุปกรณ์ที่ลงทะเบียน
- ✅ **Targeted Notifications** - ส่งการแจ้งเตือนไปยังอุปกรณ์เฉพาะ
- ✅ **PWA Support** - รองรับ Progressive Web App
- ✅ **Cross-platform** - ทำงานได้บน Web, Mobile, Desktop
- ✅ **TypeScript** - Type-safe development
- ✅ **Prisma ORM** - Database management
- ✅ **Service Worker** - Offline support และ Push handling

## 📁 โครงสร้างโปรเจค

```
nextjs-push-notification/
├── 📁 prisma/                    # Database schema และ migrations
│   ├── schema.prisma            # Database schema definition
│   └── migrations/              # Database migrations
├── 📁 public/                   # Static files
│   ├── manifest.json           # PWA manifest
│   ├── sw-custom.js           # Custom service worker
│   └── icons/                 # PWA icons
├── 📁 scripts/                 # Utility scripts
│   └── gen-vapid.ts          # VAPID key generator
├── 📁 src/
│   ├── 📁 app/                # Next.js 13+ App Router
│   │   ├── 📁 api/           # API routes
│   │   │   ├── devices/      # Device management APIs
│   │   │   ├── notify/       # Notification APIs
│   │   │   ├── subscribe/    # Subscription API
│   │   │   └── notify-targeted/ # Targeted notification API
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── offline/          # Offline page
│   ├── 📁 components/        # React components
│   │   ├── DeviceSelector.tsx    # Device selection component
│   │   ├── ErrorBoundary.tsx     # Error handling component
│   │   └── PushSubscription.tsx  # Push subscription component
│   ├── 📁 lib/               # Library configurations
│   │   ├── prisma.ts         # Prisma client
│   │   └── webpush.ts        # Web-push configuration
│   └── 📁 utils/             # Utility functions
│       ├── bufferToBase64Url.ts  # Buffer utilities
│       └── deviceUtils.ts        # Device utilities
├── package.json              # Dependencies และ scripts
├── next.config.ts           # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## 🛠️ การติดตั้ง

### 1. Clone โปรเจค
```bash
git clone <repository-url>
cd nextjs-push-notification
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` และเพิ่มค่าต่อไปนี้:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/push_notifications"

# VAPID Keys (สร้างด้วย npm run generate-vapid)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your_public_key_here"
VAPID_PRIVATE_KEY="your_private_key_here"
VAPID_EMAIL="mailto:your-email@example.com"
```

### 4. สร้าง VAPID Keys
```bash
npm run generate-vapid
```

### 5. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 6. รันโปรเจค
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## ⚙️ การตั้งค่า

### Database Setup
โปรเจคใช้ PostgreSQL กับ Prisma ORM:

1. **ติดตั้ง PostgreSQL** และสร้าง database
2. **อัปเดต DATABASE_URL** ใน `.env.local`
3. **รัน migrations**: `npx prisma migrate dev`

### VAPID Keys
VAPID keys ใช้สำหรับ Push Notifications:

1. **สร้าง keys**: `npm run generate-vapid`
2. **คัดลอก keys** ไปยัง `.env.local`
3. **ตรวจสอบ** ว่า keys ถูกต้อง

### PWA Configuration
PWA ตั้งค่าใน `next.config.ts` และ `public/manifest.json`:

- **Icons**: วางใน `public/icons/`
- **Service Worker**: ตั้งค่าใน `public/sw-custom.js`
- **Manifest**: กำหนดใน `public/manifest.json`

## 🎯 การใช้งาน

### 1. การลงทะเบียน Push Notifications

เมื่อผู้ใช้เข้าเว็บไซต์:

1. **ตรวจสอบการรองรับ** - ระบบจะตรวจสอบว่า browser รองรับ Push Notifications หรือไม่
2. **ขออนุญาต** - แสดงปุ่ม "Enable Notifications" เพื่อขออนุญาต
3. **ลงทะเบียน** - เมื่อได้รับอนุญาต ระบบจะลงทะเบียนกับ Push Service
4. **บันทึกข้อมูล** - ข้อมูลอุปกรณ์จะถูกบันทึกลงฐานข้อมูล

### 2. การส่งการแจ้งเตือน

#### ส่งไปยังทุกอุปกรณ์
```javascript
// ใช้ API endpoint
POST /api/notify-targeted
{
  "title": "ข้อความแจ้งเตือน",
  "body": "รายละเอียดการแจ้งเตือน",
  "sendToAll": true
}
```

#### ส่งไปยังอุปกรณ์เฉพาะ
```javascript
// เลือกอุปกรณ์เฉพาะ
POST /api/notify-targeted
{
  "title": "ข้อความแจ้งเตือน",
  "body": "รายละเอียดการแจ้งเตือน",
  "sendToAll": false,
  "deviceIds": ["device1", "device2"]
}
```

### 3. การจัดการอุปกรณ์

- **ดูรายการอุปกรณ์**: หน้าเว็บจะแสดงรายการอุปกรณ์ที่ลงทะเบียน
- **ลบอุปกรณ์**: สามารถลบอุปกรณ์ที่ไม่ต้องการได้
- **เลือกอุปกรณ์**: เลือกอุปกรณ์เฉพาะสำหรับส่งการแจ้งเตือน

## 🔌 API Endpoints

### 1. Subscription API

#### `POST /api/subscribe`
ลงทะเบียน Push Subscription

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "base64_encoded_p256dh_key",
    "auth": "base64_encoded_auth_key"
  },
  "device_id": "unique_device_id",
  "device_name": "Device Name",
  "user_agent": "Mozilla/5.0...",
  "platform": "Android",
  "user_id": "user123"
}
```

**Response:**
```json
{
  "message": "Subscribed",
  "deviceId": "device123",
  "deviceName": "Chrome on Android"
}
```

### 2. Notification APIs

#### `POST /api/notify-targeted`
ส่งการแจ้งเตือนไปยังอุปกรณ์ที่กำหนด

**Request Body:**
```json
{
  "title": "ข้อความแจ้งเตือน",
  "body": "รายละเอียดการแจ้งเตือน",
  "sendToAll": false,
  "deviceIds": ["device1", "device2"],
  "userIds": ["user1", "user2"]
}
```

**Response:**
```json
{
  "message": "Sent to 5 devices, 1 failed",
  "results": [
    {
      "deviceId": "device1",
      "deviceName": "Chrome on Android",
      "success": true
    }
  ],
  "summary": {
    "total": 6,
    "success": 5,
    "failed": 1
  }
}
```

### 3. Device Management APIs

#### `GET /api/devices`
ดึงรายการอุปกรณ์ทั้งหมด

**Response:**
```json
{
  "devices": [
    {
      "id": 1,
      "deviceId": "device123",
      "deviceName": "Chrome on Android",
      "platform": "Android",
      "userAgent": "Mozilla/5.0...",
      "userId": "user123",
      "lastUsed": "2024-01-01T12:00:00Z",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### `DELETE /api/devices/[deviceId]`
ลบอุปกรณ์และ subscriptions ที่เกี่ยวข้อง

**Response:**
```json
{
  "message": "Device deleted successfully",
  "deletedCount": 1
}
```

## 🧩 Components

### 1. PushSubscription.tsx
Component หลักสำหรับจัดการ Push Notifications

**คุณสมบัติ:**
- ตรวจสอบการรองรับ Push Notifications
- ขออนุญาตการแจ้งเตือน
- ลงทะเบียน Push Subscription
- แสดงสถานะการลงทะเบียน

**การใช้งาน:**
```tsx
import PushSubscription from '@/components/PushSubscription'

// ใน layout หรือ page
<PushSubscription />
```

### 2. DeviceSelector.tsx
Component สำหรับเลือกอุปกรณ์เป้าหมาย

**Props:**
```tsx
interface DeviceSelectorProps {
  selectedDevices: string[]
  onDeviceSelectionChange: (deviceIds: string[]) => void
  onSendToAllChange: (sendToAll: boolean) => void
  sendToAll: boolean
}
```

**การใช้งาน:**
```tsx
import DeviceSelector from '@/components/DeviceSelector'

<DeviceSelector
  selectedDevices={selectedDevices}
  onDeviceSelectionChange={setSelectedDevices}
  sendToAll={sendToAll}
  onSendToAllChange={setSendToAll}
/>
```

### 3. ErrorBoundary.tsx
Component สำหรับจัดการ errors

**การใช้งาน:**
```tsx
import ErrorBoundary from '@/components/ErrorBoundary'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## 🗄️ Database Schema

### PushSubscription Model
```prisma
model PushSubscription {
  id          Int      @id @default(autoincrement())
  endpoint    String   @unique
  keys_p256dh String?
  keys_auth   String?
  device_id   String?  // Unique device identifier
  device_name String?  // User-friendly device name
  user_agent  String?  // Browser/device info
  platform    String?  // OS platform
  user_id     String?  // User identifier
  is_active   Boolean  @default(true)
  last_used   DateTime @default(now())
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  @@index([device_id])
  @@index([user_id])
  @@index([is_active])
}
```

**Fields:**
- `id`: Primary key
- `endpoint`: Push service endpoint (unique)
- `keys_p256dh`: P256DH key สำหรับ encryption
- `keys_auth`: Auth key สำหรับ authentication
- `device_id`: รหัสอุปกรณ์ที่ไม่ซ้ำกัน
- `device_name`: ชื่ออุปกรณ์ที่อ่านได้
- `user_agent`: ข้อมูล browser/device
- `platform`: ระบบปฏิบัติการ
- `user_id`: รหัสผู้ใช้ (ถ้ามีระบบ user)
- `is_active`: สถานะการใช้งาน
- `last_used`: เวลาที่ใช้งานล่าสุด
- `created_at`: เวลาที่สร้าง
- `updated_at`: เวลาที่อัปเดตล่าสุด

## 🔄 Service Worker

### sw-custom.js
Service Worker หลักสำหรับจัดการ Push Notifications

**คุณสมบัติ:**
- **Push Event Handling**: รับและแสดง Push Notifications
- **Notification Click**: จัดการการคลิกการแจ้งเตือน
- **Notification Close**: ติดตามการปิดการแจ้งเตือน
- **Offline Support**: รองรับการทำงานแบบ offline

**การทำงาน:**
1. **รับ Push Event**: เมื่อได้รับ push notification
2. **Parse Data**: แยกข้อมูล title, body, icon, etc.
3. **แสดง Notification**: แสดงการแจ้งเตือนให้ผู้ใช้
4. **จัดการ Click**: เมื่อผู้ใช้คลิกการแจ้งเตือน

## 🛠️ การพัฒนา

### Scripts ที่มีให้

```bash
# Development
npm run dev              # รัน development server
npm run build           # Build สำหรับ production
npm run start           # รัน production server

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma studio       # Open Prisma Studio

# Utilities
npm run generate-vapid  # สร้าง VAPID keys
npm run lint           # Run ESLint
```

### การเพิ่มฟีเจอร์ใหม่

1. **สร้าง API Route**: เพิ่มใน `src/app/api/`
2. **สร้าง Component**: เพิ่มใน `src/components/`
3. **อัปเดต Schema**: แก้ไข `prisma/schema.prisma`
4. **เพิ่ม Migration**: `npx prisma migrate dev`

### การ Debug

1. **Browser DevTools**: ตรวจสอบ Console และ Network
2. **Service Worker**: ตรวจสอบใน Application tab
3. **Database**: ใช้ Prisma Studio หรือ database client
4. **Environment Variables**: ตรวจสอบ `.env.local`

## 🚨 ข้อควรระวัง

1. **HTTPS Required**: Push Notifications ต้องการ HTTPS
2. **Browser Support**: ตรวจสอบการรองรับของ browser
3. **VAPID Keys**: ต้องตั้งค่า VAPID keys ให้ถูกต้อง
4. **Database**: ต้องมี PostgreSQL database
5. **Permissions**: ผู้ใช้ต้องอนุญาตการแจ้งเตือน

## 📚 ทรัพยากรเพิ่มเติม

- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Web Push Library](https://github.com/web-push-libs/web-push)

## 🤝 การสนับสนุน

หากมีปัญหาหรือคำถาม สามารถ:
1. ตรวจสอบ [Issues](../../issues) ใน GitHub
2. สร้าง Issue ใหม่สำหรับ bug reports
3. สร้าง Pull Request สำหรับ improvements

---

**สร้างด้วย ❤️ โดยใช้ Next.js, TypeScript, และ Prisma**
