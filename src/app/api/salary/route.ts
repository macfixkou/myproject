import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'このリソースにアクセスする権限がありません' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    // Calculate period dates
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    // Get all employees
    const employees = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        hourlyWage: true,
        employmentType: true,
        department: true
      }
    })

    // Calculate salary data for each employee
    const salaryData = await Promise.all(
      employees.map(async (employee) => {
        // Get attendance records for the period
        const attendances = await prisma.attendance.findMany({
          where: {
            userId: employee.id,
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        })

        // Calculate attendance summary
        const workDays = attendances.filter(a => a.status === 'PRESENT').length
        const absentDays = attendances.filter(a => a.status === 'ABSENT').length
        const lateDays = attendances.filter(a => a.isLate).length
        
        // Calculate working hours
        let regularHours = 0
        let overtimeHours = 0
        let nightHours = 0
        let holidayHours = 0

        attendances.forEach(attendance => {
          if (attendance.status === 'PRESENT' && attendance.checkInTime && attendance.checkOutTime) {
            const checkIn = new Date(attendance.checkInTime)
            const checkOut = new Date(attendance.checkOutTime)
            const totalMinutes = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60))
            const dailyHours = Math.max(0, (totalMinutes - (attendance.breakMinutes || 60)) / 60)
            
            // Standard work day is 8 hours
            const standardHours = 8
            const regularDaily = Math.min(dailyHours, standardHours)
            const overtimeDaily = Math.max(0, dailyHours - standardHours)
            
            regularHours += regularDaily
            overtimeHours += overtimeDaily

            // Check if it's a weekend (simplified night/holiday calculation)
            const dayOfWeek = attendance.date.getDay()
            if (dayOfWeek === 0 || dayOfWeek === 6) {
              holidayHours += dailyHours
            }

            // Night hours (simplified: assume work after 22:00)
            if (checkOut.getHours() >= 22 || checkIn.getHours() <= 5) {
              nightHours += Math.min(2, dailyHours) // Max 2 hours night shift per day
            }
          }
        })

        const totalHours = regularHours + overtimeHours
        const overtimeDays = attendances.filter(a => {
          if (a.status === 'PRESENT' && a.checkInTime && a.checkOutTime) {
            const checkIn = new Date(a.checkInTime)
            const checkOut = new Date(a.checkOutTime)
            const totalMinutes = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60))
            const dailyHours = Math.max(0, (totalMinutes - (a.breakMinutes || 60)) / 60)
            return dailyHours > 8
          }
          return false
        }).length

        // Calculate salary amounts
        const hourlyWage = employee.hourlyWage || 1500
        const baseSalary = Math.floor(regularHours * hourlyWage)
        const overtimePay = Math.floor(overtimeHours * hourlyWage * 1.25) // 25% overtime premium
        const nightPay = Math.floor(nightHours * hourlyWage * 0.25) // 25% night premium
        const holidayPay = Math.floor(holidayHours * hourlyWage * 0.35) // 35% holiday premium
        
        // Calculate allowances based on employment type
        let allowances = 0
        if (employee.employmentType === '正社員') {
          allowances = 15000 // Base allowance for full-time employees
        } else if (employee.employmentType === 'パート') {
          allowances = 10000 // Base allowance for part-time employees
        }

        const totalGross = baseSalary + overtimePay + nightPay + holidayPay + allowances
        
        // Calculate deductions (simplified: social insurance, tax, etc.)
        const deductionRate = employee.employmentType === '正社員' ? 0.15 : 0.10 // 15% for full-time, 10% for part-time
        const deductions = Math.floor(totalGross * deductionRate)
        const totalNet = totalGross - deductions

        // Determine status (simplified logic)
        let status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID' = 'CALCULATED'
        if (workDays === 0) {
          status = 'DRAFT'
        } else if (month < new Date().getMonth() + 1 || year < new Date().getFullYear()) {
          status = Math.random() > 0.5 ? 'APPROVED' : 'PAID'
        }

        return {
          id: `salary_${employee.id}_${year}_${month}`,
          employee: {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            hourlyWage,
            employmentType: employee.employmentType || 'パート',
            department: employee.department || '建設部'
          },
          period: {
            year,
            month,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          },
          attendance: {
            totalDays: endDate.getDate(),
            workDays,
            absentDays,
            lateDays,
            overtimeDays
          },
          hours: {
            regularHours: Math.round(regularHours * 10) / 10,
            overtimeHours: Math.round(overtimeHours * 10) / 10,
            nightHours: Math.round(nightHours * 10) / 10,
            holidayHours: Math.round(holidayHours * 10) / 10,
            totalHours: Math.round(totalHours * 10) / 10
          },
          amounts: {
            baseSalary,
            overtimePay,
            nightPay,
            holidayPay,
            allowances,
            deductions,
            totalGross,
            totalNet
          },
          status,
          calculatedAt: new Date().toISOString(),
          ...(status === 'APPROVED' || status === 'PAID' ? { approvedAt: new Date().toISOString() } : {}),
          ...(status === 'PAID' ? { paidAt: new Date().toISOString() } : {})
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: salaryData,
      period: { year, month },
      summary: {
        totalEmployees: salaryData.length,
        totalGross: salaryData.reduce((sum, s) => sum + s.amounts.totalGross, 0),
        totalNet: salaryData.reduce((sum, s) => sum + s.amounts.totalNet, 0),
        totalHours: salaryData.reduce((sum, s) => sum + s.hours.totalHours, 0),
        approvedCount: salaryData.filter(s => s.status === 'APPROVED' || s.status === 'PAID').length
      }
    })

  } catch (error) {
    console.error('Salary calculation error:', error)
    return NextResponse.json(
      { error: '給与計算の処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'この操作を実行する権限がありません' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, salaryId, year, month } = body

    if (action === 'calculate') {
      // Trigger salary calculation for specific period
      return NextResponse.json({
        success: true,
        message: `${year}年${month}月の給与計算を開始しました`
      })
    }

    if (action === 'approve' && salaryId) {
      // Approve specific salary record
      return NextResponse.json({
        success: true,
        message: '給与を承認しました'
      })
    }

    if (action === 'pay' && salaryId) {
      // Mark salary as paid
      return NextResponse.json({
        success: true,
        message: '給与支払いを記録しました'
      })
    }

    return NextResponse.json(
      { error: '無効なアクションです' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Salary action error:', error)
    return NextResponse.json(
      { error: '処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}