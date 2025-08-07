// src/app/api/devices/[deviceId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    const { deviceId } = params

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 })
    }

    // Delete all subscriptions for this device
    const deletedCount = await prisma.pushSubscription.deleteMany({
      where: {
        device_id: deviceId
      }
    })

    if (deletedCount.count === 0) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Device deleted successfully',
      deletedCount: deletedCount.count
    })
  } catch (err) {
    console.error('Delete device error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
