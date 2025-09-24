import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('データベースのシードを開始します...')

  // サンプル会社を作成
  const company = await prisma.company.create({
    data: {
      name: 'サンプル建設会社',
      timezone: 'Asia/Tokyo',
      payrollRounding: 'ROUND',
      standardWorkHours: 480, // 8時間 = 480分
      breakPolicyText: JSON.stringify({
        slots: [
          { start: '10:00', end: '10:15', name: '午前休憩' },
          { start: '12:00', end: '13:00', name: '昼休憩' },
          { start: '15:00', end: '15:15', name: '午後休憩' }
        ]
      }),
      overtimeSettings: JSON.stringify({
        dailyThreshold: 480, // 8時間
        weeklyThreshold: 2400, // 40時間
        monthlyThreshold: 2700, // 45時間
        yearlyThreshold: 21600 // 360時間
      }),
      gpsRequired: true
    }
  })

  // 管理者ユーザーを作成
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const adminUser = await prisma.user.create({
    data: {
      companyId: company.id,
      role: 'ADMIN',
      name: '管理者太郎',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '090-1234-5678',
      active: true
    }
  })

  // サンプル従業員を作成
  const employee1 = await prisma.user.create({
    data: {
      companyId: company.id,
      role: 'EMPLOYEE',
      name: '作業員花子',
      email: 'employee1@example.com',
      password: hashedPassword,
      phone: '090-2345-6789',
      hourlyWage: 1500,
      employmentType: '正社員',
      active: true
    }
  })

  const employee2 = await prisma.user.create({
    data: {
      companyId: company.id,
      role: 'EMPLOYEE',
      name: '作業員次郎',
      email: 'employee2@example.com',
      password: hashedPassword,
      phone: '090-3456-7890',
      hourlyWage: 1400,
      employmentType: 'パート',
      active: true
    }
  })

  // サンプル現場を作成
  const site1 = await prisma.site.create({
    data: {
      companyId: company.id,
      name: '東京駅前ビル建設現場',
      address: '東京都千代田区丸の内1-1-1',
      latitude: 35.681236,
      longitude: 139.767125,
      geofenceRadius: 100, // 100メートル
      client: '株式会社サンプル不動産',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      active: true
    }
  })

  const site2 = await prisma.site.create({
    data: {
      companyId: company.id,
      name: '渋谷商業施設改修現場',
      address: '東京都渋谷区渋谷2-2-2',
      latitude: 35.658034,
      longitude: 139.701636,
      geofenceRadius: 80,
      client: '渋谷開発株式会社',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-08-31'),
      active: true
    }
  })

  console.log('シードデータの作成が完了しました')
  console.log('管理者アカウント: admin@example.com / password123')
  console.log('従業員アカウント1: employee1@example.com / password123')
  console.log('従業員アカウント2: employee2@example.com / password123')
  console.log(`会社ID: ${company.id}`)
  console.log(`現場1ID: ${site1.id}`)
  console.log(`現場2ID: ${site2.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })