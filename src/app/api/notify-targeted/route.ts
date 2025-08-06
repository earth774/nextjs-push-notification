// src/app/api/notify-targeted/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { webpush } from '@/lib/webpush'

export async function POST(req: NextRequest) {
  try {
    const { title, body, deviceIds, userIds, sendToAll = false } = await req.json()
    
    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body required' }, { status: 400 })
    }

    let whereClause: any = { is_active: true }

    if (sendToAll) {
      // Send to all active devices
      whereClause = { is_active: true }
    } else if (deviceIds && deviceIds.length > 0) {
      // Send to specific devices
      whereClause.device_id = { in: deviceIds }
    } else if (userIds && userIds.length > 0) {
      // Send to specific users (all their devices)
      whereClause.user_id = { in: userIds }
    } else {
      return NextResponse.json({ error: 'Must specify deviceIds, userIds, or sendToAll' }, { status: 400 })
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: whereClause
    })

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: 'No active subscriptions found' }, { status: 200 })
    }

    const payload = JSON.stringify({ title, body })

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys_p256dh,
                auth: sub.keys_auth
              }
            } as any,
            payload
          )
          
          // Update last used timestamp
          await prisma.pushSubscription.update({
            where: { id: sub.id },
            data: { last_used: new Date() }
          })

          return { 
            deviceId: sub.device_id,
            deviceName: sub.device_name,
            success: true 
          }
        } catch (error: any) {
          console.warn('Failed to send to device:', sub.device_name, error.message)
          
          // If subscription is invalid, mark as inactive
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { is_active: false }
            })
          }

          return { 
            deviceId: sub.device_id,
            deviceName: sub.device_name,
            success: false,
            error: error.message
          }
        }
      })
    )

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return NextResponse.json({ 
      message: `Sent to ${successCount} devices, ${failCount} failed`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failCount
      }
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}