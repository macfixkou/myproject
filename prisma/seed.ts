import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('データベースのシードを開始します...')

  // サンプル会社を作成
  const company = await prisma.company.create({
    data: {
      name: '建設株式会社',
      timezone: 'Asia/Tokyo',
      payrollRounding: 'ROUND',
      standardWorkHours: 480, // 8時間 = 480分
      gpsRequired: true,
    },
  })

  // 管理者ユーザーを作成
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@construction.co.jp',
      password: await bcrypt.hash('admin123', 12),
      name: '管理者',
      role: 'ADMIN',
      companyId: company.id,
      employmentType: '正社員',
      hourlyWage: 2000,
      phone: '03-1234-5678',
    },
  })

  // マネージャーユーザーを作成
  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@construction.co.jp',
      password: await bcrypt.hash('manager123', 12),
      name: '現場監督太郎',
      role: 'MANAGER',
      companyId: company.id,
      employmentType: '正社員',
      hourlyWage: 1800,
      phone: '03-1234-5679',
    },
  })

  // 従業員ユーザーを作成
  const employees = await Promise.all([
    prisma.user.create({
      data: {
        email: 'employee1@construction.co.jp',
        password: await bcrypt.hash('employee123', 12),
        name: '作業員花子',
        role: 'EMPLOYEE',
        companyId: company.id,
        employmentType: '正社員',
        hourlyWage: 1500,
        phone: '03-1234-5680',
      },
    }),
    prisma.user.create({
      data: {
        email: 'employee2@construction.co.jp',
        password: await bcrypt.hash('employee123', 12),
        name: '作業員次郎',
        role: 'EMPLOYEE',
        companyId: company.id,
        employmentType: 'パート',
        hourlyWage: 1400,
        phone: '03-1234-5681',
      },
    }),
    prisma.user.create({
      data: {
        email: 'employee3@construction.co.jp',
        password: await bcrypt.hash('employee123', 12),
        name: '職人三郎',
        role: 'EMPLOYEE',
        companyId: company.id,
        employmentType: '正社員',
        hourlyWage: 1800,
        phone: '03-1234-5682',
      },
    }),
  ])

  // サンプル現場を作成
  const sites = await Promise.all([
    prisma.site.create({
      data: {
        name: '新宿オフィスビル建設',
        address: '東京都新宿区2-2-2',
        client: '新宿開発株式会社',
        companyId: company.id,
        active: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      },
    }),
    prisma.site.create({
      data: {
        name: '渋谷マンション建設',
        address: '東京都渋谷区3-3-3',
        client: '渋谷住宅株式会社',
        companyId: company.id,
        active: true,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2025-01-31'),
      },
    }),
    prisma.site.create({
      data: {
        name: '池袋商業施設建設',
        address: '東京都豊島区4-4-4',
        client: '池袋商業開発株式会社',
        companyId: company.id,
        active: false,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-05-31'),
      },
    }),
  ])

  // サンプル勤怠データを作成（過去30日分）
  const today = new Date()
  const attendancePromises = []

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // 土日は休み
    if (date.getDay() === 0 || date.getDay() === 6) continue

    for (const employee of employees) {
      // 90%の確率で出勤
      if (Math.random() < 0.9) {
        const checkInHour = 8 + Math.floor(Math.random() * 2) // 8-9時に出勤
        const checkInMinute = Math.floor(Math.random() * 60)
        const workMinutes = 480 + Math.floor(Math.random() * 180) // 8-11時間労働（分）
        
        const clockInAt = new Date(date)
        clockInAt.setHours(checkInHour, checkInMinute, 0, 0)
        
        const clockOutAt = new Date(clockInAt)
        clockOutAt.setMinutes(clockOutAt.getMinutes() + workMinutes)
        
        const overtimeMinutes = Math.max(0, workMinutes - 480) // 8時間超過分
        const nightMinutes = clockOutAt.getHours() >= 22 ? Math.min(120, overtimeMinutes) : 0 // 深夜労働
        const holidayMinutes = 0 // 平日なので休日労働なし
        
        attendancePromises.push(
          prisma.attendance.create({
            data: {
              userId: employee.id,
              siteId: sites[Math.floor(Math.random() * 2)].id, // アクティブな現場のみ
              clockInAt: clockInAt,
              clockOutAt: clockOutAt,
              workedMinutes: workMinutes,
              overtimeMinutes: overtimeMinutes,
              nightMinutes: nightMinutes,
              holidayMinutes: holidayMinutes,
              status: 'CLOSED',
              inGeofenceIn: true,
              outGeofenceIn: true,
              notes: `${date.toLocaleDateString()}の勤務`,
            },
          })
        )
      }
    }
  }

  await Promise.all(attendancePromises)

  console.log('シードデータの作成が完了しました！')
  console.log('管理者ログイン: admin@construction.co.jp / admin123')
  console.log('マネージャーログイン: manager@construction.co.jp / manager123')
  console.log('従業員ログイン: employee1@construction.co.jp / employee123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })