// src/app/api/devices/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    const where: any = { is_active: true }
    if (userId) {
      where.user_id = userId
    }

    const devices = await prisma.pushSubscription.findMany({
      where,
      select: {
        id: true,
        device_id: true,
        device_name: true,
        platform: true,
        user_agent: true,
        user_id: true,
        last_used: true,
        created_at: true
      },
      orderBy: { last_used: 'desc' }
    })

    // Group by deviceId to avoid duplicates
    const uniqueDevices = devices.reduce((acc: any[], device) => {
      const existing = acc.find(d => d.deviceId === device.device_id)
      if (!existing) {
        acc.push(device)
      } else if (device.last_used > existing.lastUsed) {
        // Replace with more recent entry
        const index = acc.indexOf(existing)
        acc[index] = device
      }
      return acc
    }, [])

    return NextResponse.json({ devices: uniqueDevices })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}