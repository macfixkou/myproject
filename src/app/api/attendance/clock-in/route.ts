import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/utils'
import { isWithinGeofence } from '@/lib/utils/gps'
import { z } from 'zod'

const clockInSchema = z.object({
  siteId: z.string().optional(),
  gps: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number().optional(),
    timestamp: z.number().optional()
  }).optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // 既に出勤中かチェック
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        status: 'OPEN'
      }
    })

    if (existingAttendance) {
      return NextResponse.json(
        { error: '既に出勤しています' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { siteId, gps, notes } = clockInSchema.parse(body)

    // 現場情報を取得
    let site: any = null
    if (siteId) {
      site = await prisma.site.findFirst({
        where: {
          id: siteId,
          companyId: user.companyId,
          active: true
        }
      })

      if (!site) {
        return NextResponse.json(
          { error: '指定された現場が見つかりません' },
          { status: 404 }
        )
      }
    }

    // 会社の設定を取得
    const company = await prisma.company.findUnique({
      where: { id: user.companyId }
    })

    if (!company) {
      return NextResponse.json(
        { error: '会社情報が見つかりません' },
        { status: 404 }
      )
    }

    // GPS必須チェック
    if (company.gpsRequired && !gps) {
      return NextResponse.json(
        { error: 'GPS情報が必要です' },
        { status: 400 }
      )
    }

    // ジオフェンス判定
    let inGeofence: any = null
    if (gps && site?.latitude && site?.longitude && site?.geofenceRadius) {
      inGeofence = isWithinGeofence(
        { lat: gps.lat, lng: gps.lng },
        { lat: site.latitude, lng: site.longitude },
        site.geofenceRadius
      )
    }

    const now = new Date()

    // 出勤記録を作成
    const attendance = await prisma.attendance.create({
      data: {
        userId: user.id,
        siteId: siteId || null,
        clockInAt: now,
        clockInGpsText: gps ? JSON.stringify(gps) : null,
        inGeofenceIn: inGeofence,
        status: 'OPEN',
        notes: notes || null
      },
      include: {
        user: true,
        site: true
      }
    })

    // 監査ログを記録
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        actorId: user.id,
        entity: 'attendance',
        entityId: attendance.id,
        action: 'CREATE',
        afterText: JSON.stringify({
          clockIn: now.toISOString(),
          site: site?.name,
          gps: gps,
          geofence: inGeofence
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
      }
    })

    // ジオフェンス外の場合はアラートを作成
    if (company.gpsRequired && gps && inGeofence === false) {
      await prisma.alert.create({
        data: {
          companyId: user.companyId,
          userId: user.id,
          kind: 'GEOFENCE_VIOLATION',
          level: 'WARNING',
          title: 'ジオフェンス外での出勤',
          message: `${user.name}さんが現場の指定範囲外で出勤しました`,
          payloadText: JSON.stringify({
            attendanceId: attendance.id,
            siteName: site?.name,
            distance: 'unknown'
          })
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: attendance.id,
        clockInAt: attendance.clockInAt,
        site: site ? {
          id: site.id,
          name: site.name
        } : null,
        inGeofence: inGeofence
      }
    })

  } catch (error) {
    console.error('Clock-in error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '入力データが不正です', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '出勤処理に失敗しました' },
      { status: 500 }
    )
  }
}