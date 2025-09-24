import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/utils'
import { isWithinGeofence } from '@/lib/utils/gps'
import { calculateWorkTime } from '@/lib/utils/time-calculation'
import { z } from 'zod'

const clockOutSchema = z.object({
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
    
    // 出勤中の記録を取得
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        status: 'OPEN'
      },
      include: {
        site: true
      }
    })

    if (!attendance) {
      return NextResponse.json(
        { error: '出勤記録が見つかりません' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { gps, notes } = clockOutSchema.parse(body)

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
    let outGeofence = null
    if (gps && attendance.site?.latitude && attendance.site?.longitude && attendance.site?.geofenceRadius) {
      outGeofence = isWithinGeofence(
        { lat: gps.lat, lng: gps.lng },
        { lat: Number(attendance.site.latitude), lng: Number(attendance.site.longitude) },
        attendance.site.geofenceRadius
      )
    }

    const now = new Date()

    // 労働時間を計算
    const breakPolicy = company.breakPolicyJson as any
    const workTimeCalc = calculateWorkTime(attendance.clockInAt, now, breakPolicy)

    // 退勤記録を更新
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOutAt: now,
        clockOutGps: gps || null,
        outGeofenceIn: outGeofence,
        status: 'CLOSED',
        workedMinutes: workTimeCalc.workedMinutes,
        overtimeMinutes: workTimeCalc.overtimeMinutes,
        nightMinutes: workTimeCalc.nightMinutes,
        holidayMinutes: workTimeCalc.holidayMinutes,
        breakAutoJson: workTimeCalc.breakDetails,
        notes: notes ? (attendance.notes ? `${attendance.notes}\n${notes}` : notes) : attendance.notes
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
        action: 'UPDATE',
        beforeJson: {
          status: 'OPEN',
          clockOutAt: null
        },
        afterJson: {
          status: 'CLOSED',
          clockOut: now.toISOString(),
          worked: workTimeCalc.workedMinutes,
          overtime: workTimeCalc.overtimeMinutes,
          gps: gps,
          geofence: outGeofence
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
      }
    })

    // アラートチェック
    const alerts = []

    // ジオフェンス外退勤
    if (company.gpsRequired && gps && outGeofence === false) {
      alerts.push({
        companyId: user.companyId,
        userId: user.id,
        kind: 'GEOFENCE_VIOLATION',
        level: 'WARNING',
        title: 'ジオフェンス外での退勤',
        message: `${user.name}さんが現場の指定範囲外で退勤しました`,
        payloadJson: {
          attendanceId: attendance.id,
          siteName: attendance.site?.name
        }
      })
    }

    // 8時間超過アラート
    if (workTimeCalc.workedMinutes >= 480) {
      alerts.push({
        companyId: user.companyId,
        userId: user.id,
        kind: 'OVERTIME_WARNING',
        level: 'INFO',
        title: '8時間労働到達',
        message: `${user.name}さんが8時間の労働時間に到達しました`,
        payloadJson: {
          attendanceId: attendance.id,
          workedMinutes: workTimeCalc.workedMinutes,
          overtimeMinutes: workTimeCalc.overtimeMinutes
        }
      })
    }

    // 残業時間アラート（2時間超過）
    if (workTimeCalc.overtimeMinutes >= 120) {
      alerts.push({
        companyId: user.companyId,
        userId: user.id,
        kind: 'OVERTIME_WARNING',
        level: 'WARNING',
        title: '長時間労働警告',
        message: `${user.name}さんが2時間以上の残業をしています`,
        payloadJson: {
          attendanceId: attendance.id,
          overtimeMinutes: workTimeCalc.overtimeMinutes
        }
      })
    }

    // アラートを一括作成
    if (alerts.length > 0) {
      await prisma.alert.createMany({
        data: alerts
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedAttendance.id,
        clockInAt: updatedAttendance.clockInAt,
        clockOutAt: updatedAttendance.clockOutAt,
        workedMinutes: updatedAttendance.workedMinutes,
        overtimeMinutes: updatedAttendance.overtimeMinutes,
        nightMinutes: updatedAttendance.nightMinutes,
        holidayMinutes: updatedAttendance.holidayMinutes,
        site: attendance.site ? {
          id: attendance.site.id,
          name: attendance.site.name
        } : null,
        outGeofence: outGeofence,
        breakDetails: workTimeCalc.breakDetails
      }
    })

  } catch (error) {
    console.error('Clock-out error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '入力データが不正です', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '退勤処理に失敗しました' },
      { status: 500 }
    )
  }
}