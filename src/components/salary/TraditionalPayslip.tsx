'use client'

import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface TraditionalPayslipData {
  // 基本情報
  companyName: string
  employeeName: string
  employeeId: string
  department: string
  position: string
  period: string
  
  // 勤務統計
  workStats: {
    workDays: number
    holidayWork: number
    absenceDays: number
    lateArrival: number
    earlyLeave: number
    totalWorkHours: number
    overtimeHours: number
    nightShiftHours: number
    holidayWorkHours: number
  }
  
  // 支給項目
  allowances: {
    basicSalary: number
    positionAllowance: number
    familyAllowance: number
    transportationAllowance: number
    mealAllowance: number
    housingAllowance: number
    overtimeAllowance: number
    nightShiftAllowance: number
    holidayAllowance: number
    specialAllowance: number
    otherAllowances: { name: string; amount: number }[]
  }
  
  // 控除項目
  deductions: {
    healthInsurance: number
    pensionInsurance: number
    employmentInsurance: number
    incomeTax: number
    residentTax: number
    unionFee: number
    otherDeductions: { name: string; amount: number }[]
  }
}

interface TraditionalPayslipProps {
  employee: any
  salaryConfig?: any
  onClose: () => void
}

export default function TraditionalPayslip({ employee, salaryConfig, onClose }: TraditionalPayslipProps) {
  const [payslipData, setPayslipData] = useState<TraditionalPayslipData | null>(null)

  useEffect(() => {
    if (employee && salaryConfig) {
      generatePayslipData()
    }
  }, [employee, salaryConfig])

  const generatePayslipData = () => {
    // サンプルの勤務データ（実際はAPIから取得）
    const workStats = {
      workDays: 22,
      holidayWork: 2,
      absenceDays: 0,
      lateArrival: 0,
      earlyLeave: 0,
      totalWorkHours: 176,
      overtimeHours: 15,
      nightShiftHours: 8,
      holidayWorkHours: 16
    }

    // 給与計算
    const hourlyWage = salaryConfig.hourlyWage || 1500
    const overtimePay = Math.round(workStats.overtimeHours * hourlyWage * (1 + (salaryConfig.workSettings.overtimeRate / 100)))
    const nightShiftPay = Math.round(workStats.nightShiftHours * hourlyWage * (1 + (salaryConfig.workSettings.nightShiftRate / 100)))
    const holidayPay = Math.round(workStats.holidayWorkHours * hourlyWage * (1 + (salaryConfig.workSettings.holidayRate / 100)))

    const data: TraditionalPayslipData = {
      companyName: 'サンプル建設会社',
      employeeName: employee.name,
      employeeId: employee.id,
      department: employee.department,
      position: employee.position,
      period: `${new Date().getFullYear()}年${new Date().getMonth() + 1}月分`,
      
      workStats,
      
      allowances: {
        basicSalary: salaryConfig.basicSalary || 250000,
        positionAllowance: salaryConfig.allowances.positionAllowance || 0,
        familyAllowance: salaryConfig.allowances.familyAllowance || 0,
        transportationAllowance: salaryConfig.allowances.transportationAllowance || 0,
        mealAllowance: salaryConfig.allowances.mealAllowance || 0,
        housingAllowance: salaryConfig.allowances.housingAllowance || 0,
        overtimeAllowance: overtimePay,
        nightShiftAllowance: nightShiftPay,
        holidayAllowance: holidayPay,
        specialAllowance: salaryConfig.allowances.specialAllowance || 0,
        otherAllowances: salaryConfig.allowances.otherAllowances || []
      },
      
      deductions: {
        healthInsurance: salaryConfig.deductions.healthInsurance || 0,
        pensionInsurance: salaryConfig.deductions.pensionInsurance || 0,
        employmentInsurance: salaryConfig.deductions.employmentInsurance || 0,
        incomeTax: salaryConfig.deductions.incomeTax || 0,
        residentTax: salaryConfig.deductions.residentTax || 0,
        unionFee: salaryConfig.deductions.unionFee || 0,
        otherDeductions: salaryConfig.deductions.otherDeductions || []
      }
    }

    setPayslipData(data)
  }

  const generateTraditionalPDF = () => {
    if (!payslipData) return

    const doc = new jsPDF()
    
    // タイトル
    doc.setFontSize(16)
    doc.text('給与明細書', 105, 20, { align: 'center' })
    
    // 期間
    doc.setFontSize(12)
    doc.text(payslipData.period, 20, 35)
    
    // 会社名・従業員情報
    doc.text(`${payslipData.companyName}`, 140, 35)
    doc.text(`社員番号：${payslipData.employeeId}`, 140, 45)
    doc.text(`氏名：${payslipData.employeeName}`, 140, 55)
    
    // 勤務項目テーブル
    const workData = [
      ['出勤日数', `${payslipData.workStats.workDays}日`],
      ['休日出勤', `${payslipData.workStats.holidayWork}日`],
      ['欠勤日数', `${payslipData.workStats.absenceDays}日`],
      ['遅刻回数', `${payslipData.workStats.lateArrival}回`],
      ['早退回数', `${payslipData.workStats.earlyLeave}回`],
      ['普通残業', `${payslipData.workStats.overtimeHours}時間`],
      ['深夜残業', `${payslipData.workStats.nightShiftHours}時間`],
      ['休日深夜', `${payslipData.workStats.holidayWorkHours}時間`]
    ]

    autoTable(doc, {
      head: [['勤務', '']],
      body: workData,
      startY: 70,
      margin: { left: 20 },
      tableWidth: 50,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [200, 220, 255] }
    })

    // 支給項目テーブル
    const allowanceData = [
      ['基本給', `¥${payslipData.allowances.basicSalary.toLocaleString()}`],
      ['役職手当', `¥${payslipData.allowances.positionAllowance.toLocaleString()}`],
      ['家族手当', `¥${payslipData.allowances.familyAllowance.toLocaleString()}`],
      ['交通費', `¥${payslipData.allowances.transportationAllowance.toLocaleString()}`],
      ['食事手当', `¥${payslipData.allowances.mealAllowance.toLocaleString()}`],
      ['住宅手当', `¥${payslipData.allowances.housingAllowance.toLocaleString()}`],
      ['時間外手当', `¥${payslipData.allowances.overtimeAllowance.toLocaleString()}`],
      ['深夜手当', `¥${payslipData.allowances.nightShiftAllowance.toLocaleString()}`],
      ['休日手当', `¥${payslipData.allowances.holidayAllowance.toLocaleString()}`],
      ['特別手当', `¥${payslipData.allowances.specialAllowance.toLocaleString()}`]
    ]

    // カスタム手当を追加
    payslipData.allowances.otherAllowances.forEach(item => {
      if (item.amount > 0) {
        allowanceData.push([item.name, `¥${item.amount.toLocaleString()}`])
      }
    })

    const totalAllowances = Object.values(payslipData.allowances).reduce((sum, value) => {
      if (typeof value === 'number') return sum + value
      if (Array.isArray(value)) return sum + value.reduce((s, item) => s + (item.amount || 0), 0)
      return sum
    }, 0)

    allowanceData.push(['支給合計', `¥${totalAllowances.toLocaleString()}`])

    autoTable(doc, {
      head: [['支給', '']],
      body: allowanceData,
      startY: 70,
      margin: { left: 80 },
      tableWidth: 50,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [200, 255, 200] }
    })

    // 控除項目テーブル
    const deductionData = [
      ['健康保険', `¥${payslipData.deductions.healthInsurance.toLocaleString()}`],
      ['厚生年金保険', `¥${payslipData.deductions.pensionInsurance.toLocaleString()}`],
      ['雇用保険', `¥${payslipData.deductions.employmentInsurance.toLocaleString()}`],
      ['所得税', `¥${payslipData.deductions.incomeTax.toLocaleString()}`],
      ['住民税', `¥${payslipData.deductions.residentTax.toLocaleString()}`],
      ['組合費', `¥${payslipData.deductions.unionFee.toLocaleString()}`]
    ]

    // カスタム控除を追加
    payslipData.deductions.otherDeductions.forEach(item => {
      if (item.amount > 0) {
        deductionData.push([item.name, `¥${item.amount.toLocaleString()}`])
      }
    })

    const totalDeductions = Object.values(payslipData.deductions).reduce((sum, value) => {
      if (typeof value === 'number') return sum + value
      if (Array.isArray(value)) return sum + value.reduce((s, item) => s + (item.amount || 0), 0)
      return sum
    }, 0)

    deductionData.push(['控除合計', `¥${totalDeductions.toLocaleString()}`])

    autoTable(doc, {
      head: [['控除', '']],
      body: deductionData,
      startY: 70,
      margin: { left: 140 },
      tableWidth: 50,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [255, 200, 200] }
    })

    // 差引支給額
    const netSalary = totalAllowances - totalDeductions
    const finalY = Math.max(
      (doc as any).lastAutoTable?.finalY || 150,
      150
    )

    doc.setFontSize(14)
    doc.text('差引支給額', 20, finalY + 20)
    doc.setFontSize(18)
    doc.text(`¥${netSalary.toLocaleString()}`, 60, finalY + 20)

    doc.save(`給与明細_${payslipData.employeeName}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const calculateTotals = () => {
    if (!payslipData) return { totalAllowances: 0, totalDeductions: 0, netSalary: 0 }
    
    const totalAllowances = Object.values(payslipData.allowances).reduce((sum, value) => {
      if (typeof value === 'number') return sum + value
      if (Array.isArray(value)) return sum + value.reduce((s, item) => s + (item.amount || 0), 0)
      return sum
    }, 0)

    const totalDeductions = Object.values(payslipData.deductions).reduce((sum, value) => {
      if (typeof value === 'number') return sum + value
      if (Array.isArray(value)) return sum + value.reduce((s, item) => s + (item.amount || 0), 0)
      return sum
    }, 0)

    return {
      totalAllowances,
      totalDeductions,
      netSalary: totalAllowances - totalDeductions
    }
  }

  if (!payslipData) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div className="text-center py-8">
            <p className="text-gray-600">給料明細データを生成中...</p>
          </div>
        </div>
      </div>
    )
  }

  const totals = calculateTotals()

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-6 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white mb-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center flex-1">給与明細書</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 期間・会社情報 */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h3 className="text-lg font-semibold">{payslipData.period}</h3>
          </div>
          <div className="text-right">
            <p className="font-medium">{payslipData.companyName}</p>
            <p className="text-sm text-gray-600">社員番号: {payslipData.employeeId}</p>
            <p className="text-sm text-gray-600">氏名: {payslipData.employeeName}</p>
          </div>
        </div>

        {/* 明細テーブル */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* 勤務項目 */}
          <div className="border border-gray-300">
            <h4 className="bg-blue-100 text-blue-800 font-semibold p-2 text-center border-b">勤務</h4>
            <div className="divide-y">
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">出勤日数</div>
                <div className="p-2 text-sm text-center">{payslipData.workStats.workDays}日</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">休日出勤</div>
                <div className="p-2 text-sm text-center">{payslipData.workStats.holidayWork}日</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">欠勤日数</div>
                <div className="p-2 text-sm text-center">{payslipData.workStats.absenceDays}日</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">普通残業</div>
                <div className="p-2 text-sm text-center">{payslipData.workStats.overtimeHours}時間</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">深夜残業</div>
                <div className="p-2 text-sm text-center">{payslipData.workStats.nightShiftHours}時間</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">休日深夜</div>
                <div className="p-2 text-sm text-center">{payslipData.workStats.holidayWorkHours}時間</div>
              </div>
            </div>
          </div>

          {/* 支給項目 */}
          <div className="border border-gray-300">
            <h4 className="bg-green-100 text-green-800 font-semibold p-2 text-center border-b">支給</h4>
            <div className="divide-y">
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">基本給</div>
                <div className="p-2 text-sm text-right">¥{payslipData.allowances.basicSalary.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">役職手当</div>
                <div className="p-2 text-sm text-right">¥{payslipData.allowances.positionAllowance.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">家族手当</div>
                <div className="p-2 text-sm text-right">¥{payslipData.allowances.familyAllowance.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">交通費</div>
                <div className="p-2 text-sm text-right">¥{payslipData.allowances.transportationAllowance.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">時間外手当</div>
                <div className="p-2 text-sm text-right">¥{payslipData.allowances.overtimeAllowance.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">深夜手当</div>
                <div className="p-2 text-sm text-right">¥{payslipData.allowances.nightShiftAllowance.toLocaleString()}</div>
              </div>
              {payslipData.allowances.otherAllowances.map((item, index) => (
                item.amount > 0 && (
                  <div key={index} className="grid grid-cols-2">
                    <div className="p-2 bg-gray-50 border-r text-sm">{item.name}</div>
                    <div className="p-2 text-sm text-right">¥{item.amount.toLocaleString()}</div>
                  </div>
                )
              ))}
              <div className="grid grid-cols-2 bg-green-50">
                <div className="p-2 border-r text-sm font-semibold">支給合計</div>
                <div className="p-2 text-sm text-right font-semibold">¥{totals.totalAllowances.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* 控除項目 */}
          <div className="border border-gray-300">
            <h4 className="bg-red-100 text-red-800 font-semibold p-2 text-center border-b">控除</h4>
            <div className="divide-y">
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">健康保険</div>
                <div className="p-2 text-sm text-right">¥{payslipData.deductions.healthInsurance.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">厚生年金保険</div>
                <div className="p-2 text-sm text-right">¥{payslipData.deductions.pensionInsurance.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">雇用保険</div>
                <div className="p-2 text-sm text-right">¥{payslipData.deductions.employmentInsurance.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">所得税</div>
                <div className="p-2 text-sm text-right">¥{payslipData.deductions.incomeTax.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 bg-gray-50 border-r text-sm">住民税</div>
                <div className="p-2 text-sm text-right">¥{payslipData.deductions.residentTax.toLocaleString()}</div>
              </div>
              {payslipData.deductions.otherDeductions.map((item, index) => (
                item.amount > 0 && (
                  <div key={index} className="grid grid-cols-2">
                    <div className="p-2 bg-gray-50 border-r text-sm">{item.name}</div>
                    <div className="p-2 text-sm text-right">¥{item.amount.toLocaleString()}</div>
                  </div>
                )
              ))}
              <div className="grid grid-cols-2 bg-red-50">
                <div className="p-2 border-r text-sm font-semibold">控除合計</div>
                <div className="p-2 text-sm text-right font-semibold">¥{totals.totalDeductions.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 差引支給額 */}
        <div className="bg-blue-600 text-white p-6 rounded-lg text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">差引支給額</h3>
          <p className="text-3xl font-bold">¥{totals.netSalary.toLocaleString()}</p>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50"
          >
            閉じる
          </button>
          <button
            onClick={generateTraditionalPDF}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            PDF出力
          </button>
        </div>
      </div>
    </div>
  )
}