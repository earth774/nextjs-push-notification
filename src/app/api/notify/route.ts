// src/app/api/notify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { webpush } from '@/lib/webpush'

export async function POST(req: NextRequest) {
  try {
    const { title, body } = await req.json()
    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body required' }, { status: 400 })
    }

    const subs = await prisma.pushSubscription.findMany()
    const payload = JSON.stringify({ title, body })

    const results = await Promise.all(
      subs.map((s: any) =>
        webpush
          .sendNotification(
            {
              endpoint: s.endpoint,
              keys: {
                p256dh: s.keys_p256dh,
                auth: s.keys_auth
              }
            } as any,
            payload
          )
          .then(() => ({ endpoint: s.endpoint, success: true }))
          .catch((e) => {
            console.warn('Failed send to', s.endpoint, e)
            return { endpoint: s.endpoint, success: false }
          })
      )
    )

    return NextResponse.json({ results }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}