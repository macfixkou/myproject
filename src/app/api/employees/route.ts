import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - 従業員一覧の取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 管理者またはマネージャーのみアクセス可能
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // フィルター条件を構築
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (department) {
      where.department = department
    }
    
    if (role && role !== 'all') {
      where.role = role
    }
    
    if (status && status !== 'all') {
      where.status = status
    }

    // 従業員データを取得（パスワードは除外）
    const [employees, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          position: true,
          department: true,
          hireDate: true,
          hourlyWage: true,
          address: true,
          emergencyContact: true,
          emergencyPhone: true,
          status: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - 新規従業員の追加
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 管理者のみ従業員追加可能
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden - Admin access required' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    // 必須フィールドのバリデーション
    const requiredFields = [
      'name', 'email', 'phone', 'address', 'role', 'position', 
      'department', 'hireDate', 'hourlyWage', 'emergencyContact', 
      'emergencyPhone', 'password'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 })
      }
    }

    const {
      name,
      email,
      phone,
      address,
      role,
      position,
      department,
      hireDate,
      hourlyWage,
      emergencyContact,
      emergencyPhone,
      password,
      notes
    } = body

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'このメールアドレスは既に使用されています' 
      }, { status: 400 })
    }

    // 電話番号の重複チェック
    const existingPhone = await prisma.user.findFirst({
      where: { phone }
    })

    if (existingPhone) {
      return NextResponse.json({ 
        error: 'この電話番号は既に使用されています' 
      }, { status: 400 })
    }

    // パスワードをハッシュ化
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 従業員を作成
    const newEmployee = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        address,
        role,
        position,
        department,
        hireDate: new Date(hireDate),
        hourlyWage: parseFloat(hourlyWage),
        emergencyContact,
        emergencyPhone,
        password: hashedPassword,
        notes: notes || null,
        status: 'ACTIVE',
        companyId: null // 現在はnullable
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        position: true,
        department: true,
        hireDate: true,
        hourlyWage: true,
        address: true,
        emergencyContact: true,
        emergencyPhone: true,
        status: true,
        notes: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: '従業員が正常に追加されました',
      employee: newEmployee
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating employee:', error)
    
    // Prisma エラーの詳細処理
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: '入力されたデータが既に存在します' 
        }, { status: 400 })
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - 従業員情報の更新
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 管理者のみ更新可能
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden - Admin access required' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ 
        error: 'Employee ID is required' 
      }, { status: 400 })
    }

    // パスワードが含まれている場合はハッシュ化
    if (updateData.password) {
      const saltRounds = 12
      updateData.password = await bcrypt.hash(updateData.password, saltRounds)
    }

    // 日付フィールドの変換
    if (updateData.hireDate) {
      updateData.hireDate = new Date(updateData.hireDate)
    }

    // 数値フィールドの変換
    if (updateData.hourlyWage) {
      updateData.hourlyWage = parseFloat(updateData.hourlyWage)
    }

    const updatedEmployee = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        position: true,
        department: true,
        hireDate: true,
        hourlyWage: true,
        address: true,
        emergencyContact: true,
        emergencyPhone: true,
        status: true,
        notes: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: '従業員情報が正常に更新されました',
      employee: updatedEmployee
    })

  } catch (error) {
    console.error('Error updating employee:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ 
        error: '指定された従業員が見つかりません' 
      }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - 従業員の削除（論理削除）
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 管理者のみ削除可能
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden - Admin access required' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ 
        error: 'Employee ID is required' 
      }, { status: 400 })
    }

    // 自分自身は削除できない
    if (id === session.user.id) {
      return NextResponse.json({ 
        error: '自分自身のアカウントは削除できません' 
      }, { status: 400 })
    }

    // 論理削除（ステータスを無効に変更）
    const deletedEmployee = await prisma.user.update({
      where: { id },
      data: { 
        status: 'INACTIVE',
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    })

    return NextResponse.json({
      message: '従業員が正常に削除されました',
      employee: deletedEmployee
    })

  } catch (error) {
    console.error('Error deleting employee:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ 
        error: '指定された従業員が見つかりません' 
      }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}