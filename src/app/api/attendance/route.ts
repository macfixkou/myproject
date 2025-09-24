import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth, checkUserAccess } from '@/lib/auth/utils'
import { z } from 'zod'

const attendanceQuerySchema = z.object({
  userId: z.string().optional().nullable(),
  siteId: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  page: z.string().default('1'),
  limit: z.string().default('50')
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const query = attendanceQuerySchema.parse({
      userId: searchParams.get('userId'),
      siteId: searchParams.get('siteId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      status: searchParams.get('status'),
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50'
    })

    const page = parseInt(query.page)
    const limit = Math.min(parseInt(query.limit), 100) // 最大100件

    // 権限チェック
    const targetUserId = query.userId || user.id
    if (!await checkUserAccess(targetUserId, user)) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    // フィルター条件を構築
    const where: any = {
      userId: targetUserId,
      user: {
        companyId: user.companyId
      }
    }

    if (query.siteId) {
      where.siteId = query.siteId
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.startDate || query.endDate) {
      where.clockInAt = {}
      if (query.startDate) {
        where.clockInAt.gte = new Date(query.startDate)
      }
      if (query.endDate) {
        const endDate = new Date(query.endDate)
        endDate.setHours(23, 59, 59, 999)
        where.clockInAt.lte = endDate
      }
    }

    // 総件数を取得
    const total = await prisma.attendance.count({ where })

    // 出勤記録を取得
    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        site: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        clockInAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: attendances,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })

  } catch (error) {
    console.error('Get attendance error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '検索条件が不正です', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '出勤記録の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 現在の出勤状況を取得
export async function HEAD(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const currentAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        status: 'OPEN'
      },
      include: {
        site: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: currentAttendance ? {
        id: currentAttendance.id,
        clockInAt: currentAttendance.clockInAt,
        site: currentAttendance.site,
        isWorking: true
      } : {
        isWorking: false
      }
    })

  } catch (error) {
    console.error('Get current attendance error:', error)
    return NextResponse.json(
      { error: '出勤状況の取得に失敗しました' },
      { status: 500 }
    )
  }
}