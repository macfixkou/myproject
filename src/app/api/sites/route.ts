import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth/utils'
import { z } from 'zod'

const siteQuerySchema = z.object({
  active: z.string().optional(),
  page: z.string().default('1'),
  limit: z.string().default('50')
})

const createSiteSchema = z.object({
  name: z.string().min(1, '現場名は必須です'),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  geofenceRadius: z.number().min(10).max(1000).optional(),
  client: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  active: z.boolean().default(true)
})

// 現場一覧取得
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const query = siteQuerySchema.parse({
      active: searchParams.get('active'),
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50'
    })

    const page = parseInt(query.page)
    const limit = Math.min(parseInt(query.limit), 100)

    const where: any = {
      companyId: user.companyId
    }

    if (query.active !== undefined) {
      where.active = query.active === 'true'
    }

    const total = await prisma.site.count({ where })

    const sites = await prisma.site.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: sites,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })

  } catch (error) {
    console.error('Get sites error:', error)
    return NextResponse.json(
      { error: '現場一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 現場作成
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()
    const data = createSiteSchema.parse(body)

    const site = await prisma.site.create({
      data: {
        ...data,
        companyId: user.companyId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null
      }
    })

    // 監査ログを記録
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        actorId: user.id,
        entity: 'site',
        entityId: site.id,
        action: 'CREATE',
        afterJson: {
          name: site.name,
          address: site.address,
          coordinates: site.latitude && site.longitude ? {
            lat: site.latitude,
            lng: site.longitude
          } : null,
          geofenceRadius: site.geofenceRadius
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: site
    })

  } catch (error) {
    console.error('Create site error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '入力データが不正です', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '現場の作成に失敗しました' },
      { status: 500 }
    )
  }
}