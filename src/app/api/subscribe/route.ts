// src/app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const endpoint = body.endpoint
    const keys = body.keys || {}

    if (!endpoint || !keys.p256dh || !keys.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    // Upsert subscription (avoid duplicates)
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth
      },
      create: {
        endpoint,
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth
      }
    })

    return NextResponse.json({ message: 'Subscribed' }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}