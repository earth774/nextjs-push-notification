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

    // Transform and group by deviceId to avoid duplicates
    const transformedDevices = devices.map(device => ({
      id: device.id,
      deviceId: device.device_id,
      deviceName: device.device_name,
      platform: device.platform,
      userAgent: device.user_agent,
      userId: device.user_id,
      lastUsed: device.last_used,
      createdAt: device.created_at
    }))

    const uniqueDevices = transformedDevices.reduce((acc: any[], device) => {
      const existing = acc.find(d => d.deviceId === device.deviceId)
      if (!existing) {
        acc.push(device)
      } else if (device.lastUsed > existing.lastUsed) {
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