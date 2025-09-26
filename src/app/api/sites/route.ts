import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement actual database queries
    const mockSites = [
      {
        id: '1',
        name: '新宿オフィスビル建設現場',
        address: '東京都新宿区西新宿1-1-1',
        description: '地上20階建てオフィスビルの新築工事',
        status: 'ACTIVE',
        startDate: '2024-03-01',
        endDate: '2025-12-31',
        manager: '田中太郎',
        employeeCount: 15,
        workingHoursToday: 120,
        latitude: 35.6896,
        longitude: 139.6917,
        geofenceRadius: 100,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-09-26T00:00:00Z'
      },
      {
        id: '2',
        name: '渋谷マンション改修工事',
        address: '東京都渋谷区渋谷2-2-2',
        description: '既存マンションの大規模改修工事',
        status: 'ACTIVE',
        startDate: '2024-06-01',
        endDate: '2024-11-30',
        manager: '佐藤花子',
        employeeCount: 8,
        workingHoursToday: 64,
        latitude: 35.6598,
        longitude: 139.7006,
        geofenceRadius: 150,
        createdAt: '2024-06-01T00:00:00Z',
        updatedAt: '2024-09-26T00:00:00Z'
      }
    ]

    // Filter for active sites if requested
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    
    const filteredSites = activeOnly 
      ? mockSites.filter(site => site.status === 'ACTIVE')
      : mockSites

    return NextResponse.json({ data: filteredSites, sites: filteredSites })
  } catch (error) {
    console.error('Sites API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // TODO: Implement site creation logic
    const newSite = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ site: newSite }, { status: 201 })
  } catch (error) {
    console.error('Site creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}