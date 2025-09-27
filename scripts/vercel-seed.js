// Vercel用の軽量シードスクリプト
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Vercel環境用シードデータ作成中...')

  try {
    // デモ会社を作成
    const company = await prisma.company.upsert({
      where: { id: 'demo-company' },
      update: {},
      create: {
        id: 'demo-company',
        name: 'サンプル建設会社',
        timezone: 'Asia/Tokyo',
        payrollRounding: 'ROUND',
        standardWorkHours: 480,
        gpsRequired: true,
      },
    })

    // 管理者作成
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: await bcrypt.hash('password123', 12),
        name: '管理者太郎',
        role: 'ADMIN',
        companyId: company.id,
        employmentType: '正社員',
        hourlyWage: 2000,
        phone: '03-1234-5678',
      },
    })

    // 従業員作成
    await prisma.user.upsert({
      where: { email: 'employee1@example.com' },
      update: {},
      create: {
        email: 'employee1@example.com',
        password: await bcrypt.hash('password123', 12),
        name: '作業員花子',
        role: 'EMPLOYEE',
        companyId: company.id,
        employmentType: '正社員',
        hourlyWage: 1500,
        phone: '03-1234-5680',
      },
    })

    console.log('✅ Vercelシードデータ作成完了')
  } catch (error) {
    console.error('❌ シードエラー:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })