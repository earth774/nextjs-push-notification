// src/app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { endpoint, keys = {}, device_id, device_name, user_agent, platform, user_id } = body

    if (!endpoint || !keys.p256dh || !keys.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    // Upsert subscription (avoid duplicates)
    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth,
        device_id,
        device_name,
        user_agent,
        platform,
        user_id,
        is_active: true,
        last_used: new Date()
      },
      create: {
        endpoint,
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth,
        device_id,
        device_name,
        user_agent,
        platform,
        user_id,
        is_active: true
      }
    })

    return NextResponse.json({ 
      message: 'Subscribed',
      deviceId: subscription.device_id,
      deviceName: subscription.device_name
    }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}