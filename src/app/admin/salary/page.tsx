'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { 
  BanknotesIcon,
  HomeIcon,
  UserIcon,
  ClockIcon,
  CurrencyYenIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  XMarkIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CheckIcon,
  PlusIcon,
  InformationCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

// Export functions
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface SalaryDetail {
  id: string
  employeeName: string
  department: string
  position: string
  employeeId: string
  period: string
  workDays: number
  totalHours: number
  overtimeHours: number
  nightHours: number
  holidayHours: number
  baseSalary: number
  overtimePay: number
  nightPay: number
  holidayPay: number
  allowances: {
    transportation: number
    meal: number
    housing: number
    family: number
    other: number
  }
  deductions: {
    healthInsurance: number
    pensionInsurance: number
    employmentInsurance: number
    incomeTax: number
    residentTax: number
    other: number
  }
  totalGross: number
  totalDeductions: number
  netSalary: number
  status: string
  calculatedAt: string
  approvedAt?: string
  approvedBy?: string
}

export default function SalaryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<SalaryDetail | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGoHome = () => {
    router.push('/home')
  }

  // サンプル給与データ
  const sampleSalaryData = [
    {
      id: '1',
      employeeName: '山田太郎',
      department: '建設部',
      workDays: 22,
      totalHours: 176,
      overtimeHours: 15,
      baseSalary: 250000,
      overtimePay: 28125,
      totalSalary: 278125,
      status: '計算済み'
    },
    {
      id: '2', 
      employeeName: '佐藤花子',
      department: '建設部',
      workDays: 20,
      totalHours: 160,
      overtimeHours: 8,
      baseSalary: 230000,
      overtimePay: 15000,
      totalSalary: 245000,
      status: '計算済み'
    },
    {
      id: '3',
      employeeName: '田中次郎', 
      department: '管理部',
      workDays: 23,
      totalHours: 184,
      overtimeHours: 20,
      baseSalary: 280000,
      overtimePay: 37500,
      totalSalary: 317500,
      status: '承認済み'
    }
  ]

  // 詳細データの取得
  const getSalaryDetail = (id: string): SalaryDetail | null => {
    const salaryDetails: { [key: string]: SalaryDetail } = {
      '1': {
        id: '1',
        employeeName: '山田太郎',
        department: '建設部',
        position: '作業員',
        employeeId: 'EMP-001',
        period: '2024年9月',
        workDays: 22,
        totalHours: 176,
        overtimeHours: 15,
        nightHours: 8,
        holidayHours: 0,
        baseSalary: 250000,
        overtimePay: 28125,
        nightPay: 12000,
        holidayPay: 0,
        allowances: {
          transportation: 15000,
          meal: 8000,
          housing: 0,
          family: 20000,
          other: 5000
        },
        deductions: {
          healthInsurance: 12250,
          pensionInsurance: 22950,
          employmentInsurance: 1683,
          incomeTax: 8500,
          residentTax: 12000,
          other: 0
        },
        totalGross: 338125,
        totalDeductions: 57383,
        netSalary: 280742,
        status: '計算済み',
        calculatedAt: '2024-09-30 15:30:00'
      },
      '2': {
        id: '2',
        employeeName: '佐藤花子',
        department: '建設部',
        position: '作業員',
        employeeId: 'EMP-002',
        period: '2024年9月',
        workDays: 20,
        totalHours: 160,
        overtimeHours: 8,
        nightHours: 4,
        holidayHours: 0,
        baseSalary: 230000,
        overtimePay: 15000,
        nightPay: 6000,
        holidayPay: 0,
        allowances: {
          transportation: 12000,
          meal: 6000,
          housing: 0,
          family: 15000,
          other: 3000
        },
        deductions: {
          healthInsurance: 11500,
          pensionInsurance: 20700,
          employmentInsurance: 1359,
          incomeTax: 6800,
          residentTax: 9500,
          other: 0
        },
        totalGross: 287000,
        totalDeductions: 49859,
        netSalary: 237141,
        status: '計算済み',
        calculatedAt: '2024-09-30 15:30:00'
      },
      '3': {
        id: '3',
        employeeName: '田中次郎',
        department: '管理部',
        position: '現場監督',
        employeeId: 'EMP-003',
        period: '2024年9月',
        workDays: 23,
        totalHours: 184,
        overtimeHours: 20,
        nightHours: 12,
        holidayHours: 8,
        baseSalary: 280000,
        overtimePay: 37500,
        nightPay: 18000,
        holidayPay: 15000,
        allowances: {
          transportation: 18000,
          meal: 10000,
          housing: 25000,
          family: 30000,
          other: 8000
        },
        deductions: {
          healthInsurance: 17625,
          pensionInsurance: 31005,
          employmentInsurance: 2007,
          incomeTax: 15200,
          residentTax: 18000,
          other: 2000
        },
        totalGross: 441500,
        totalDeductions: 85837,
        netSalary: 355663,
        status: '承認済み',
        calculatedAt: '2024-09-30 15:30:00',
        approvedAt: '2024-09-30 17:15:00',
        approvedBy: '管理者太郎'
      }
    }
    
    return salaryDetails[id] || null
  }

  // ダウンロード機能
  const exportToPDF = (employees: typeof sampleSalaryData, type: 'all' | 'selected' | 'individual' = 'all') => {
    const doc = new jsPDF()
    
    if (type === 'individual' && employees.length === 1) {
      // 個別詳細PDFの生成
      const employee = employees[0]
      const detail = getSalaryDetail(employee.id)
      
      if (detail) {
        // ヘッダー情報
        doc.setFontSize(20)
        doc.text('給与明細書', 20, 25)
        doc.setFontSize(12)
        doc.text(`生成日時: ${new Date().toLocaleString('ja-JP')}`, 20, 35)
        
        // 従業員基本情報
        doc.setFontSize(14)
        doc.text('【従業員情報】', 20, 50)
        doc.setFontSize(10)
        doc.text(`氏名: ${detail.employeeName}`, 20, 60)
        doc.text(`従業員ID: ${detail.employeeId}`, 20, 67)
        doc.text(`所属: ${detail.department} - ${detail.position}`, 20, 74)
        doc.text(`対象期間: ${detail.period}`, 20, 81)
        doc.text(`ステータス: ${detail.status}`, 20, 88)
        
        // 勤務統計
        doc.setFontSize(14)
        doc.text('【勤務統計】', 20, 105)
        autoTable(doc, {
          head: [['項目', '時間・日数']],
          body: [
            ['出勤日数', `${detail.workDays}日`],
            ['総労働時間', `${detail.totalHours}時間`],
            ['残業時間', `${detail.overtimeHours}時間`],
            ['深夜労働時間', `${detail.nightHours}時間`],
            ['休日労働時間', `${detail.holidayHours}時間`]
          ],
          startY: 110,
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [100, 150, 200] },
          columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 40 } }
        })
        
        // 支給項目
        const finalY1 = (doc as any).lastAutoTable.finalY || 150
        doc.setFontSize(14)
        doc.text('【支給項目】', 20, finalY1 + 15)
        autoTable(doc, {
          head: [['項目', '金額']],
          body: [
            ['基本給', `¥${detail.baseSalary.toLocaleString()}`],
            ['残業代', `¥${detail.overtimePay.toLocaleString()}`],
            ['深夜手当', `¥${detail.nightPay.toLocaleString()}`],
            ['休日手当', `¥${detail.holidayPay.toLocaleString()}`],
            ['交通費', `¥${detail.allowances.transportation.toLocaleString()}`],
            ['食事手当', `¥${detail.allowances.meal.toLocaleString()}`],
            ['住宅手当', `¥${detail.allowances.housing.toLocaleString()}`],
            ['家族手当', `¥${detail.allowances.family.toLocaleString()}`],
            ['その他手当', `¥${detail.allowances.other.toLocaleString()}`],
          ],
          startY: finalY1 + 20,
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [100, 200, 100] },
          columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 50 } }
        })
        
        // 控除項目
        const finalY2 = (doc as any).lastAutoTable.finalY || 220
        doc.setFontSize(14)
        doc.text('【控除項目】', 110, finalY1 + 15)
        autoTable(doc, {
          head: [['項目', '金額']],
          body: [
            ['健康保険', `¥${detail.deductions.healthInsurance.toLocaleString()}`],
            ['厚生年金', `¥${detail.deductions.pensionInsurance.toLocaleString()}`],
            ['雇用保険', `¥${detail.deductions.employmentInsurance.toLocaleString()}`],
            ['所得税', `¥${detail.deductions.incomeTax.toLocaleString()}`],
            ['住民税', `¥${detail.deductions.residentTax.toLocaleString()}`],
            ['その他控除', `¥${detail.deductions.other.toLocaleString()}`],
          ],
          startY: finalY1 + 20,
          margin: { left: 110 },
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [200, 100, 100] },
          columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 50 } }
        })
        
        // 合計
        const finalY3 = Math.max(finalY2, (doc as any).lastAutoTable.finalY) || 250
        doc.setFontSize(14)
        doc.text('【給与計算結果】', 20, finalY3 + 15)
        autoTable(doc, {
          head: [['項目', '金額']],
          body: [
            ['総支給額', `¥${detail.totalGross.toLocaleString()}`],
            ['総控除額', `¥${detail.totalDeductions.toLocaleString()}`],
            ['差引支給額（手取り）', `¥${detail.netSalary.toLocaleString()}`]
          ],
          startY: finalY3 + 20,
          styles: { fontSize: 10, cellPadding: 4, fontStyle: 'bold' },
          headStyles: { fillColor: [50, 100, 150] },
          bodyStyles: { fillColor: [240, 248, 255] },
          columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 60 } }
        })
        
        doc.save(`給与明細_${detail.employeeName}_${new Date().toISOString().split('T')[0]}.pdf`)
        return
      }
    }
    
    // 一覧表形式のPDF生成（全員・選択）
    doc.setFontSize(16)
    doc.text('給与計算一覧', 20, 20)
    doc.setFontSize(12)
    doc.text(`生成日時: ${new Date().toLocaleString('ja-JP')}`, 20, 30)
    doc.text(`対象件数: ${employees.length}件`, 20, 37)
    
    // テーブルデータの準備
    const tableData = employees.map(emp => [
      emp.employeeName,
      emp.department,
      `${emp.workDays}日`,
      `${emp.totalHours}h`,
      `${emp.overtimeHours}h`,
      `¥${emp.baseSalary.toLocaleString()}`,
      `¥${emp.overtimePay.toLocaleString()}`,
      `¥${emp.totalSalary.toLocaleString()}`,
      emp.status
    ])
    
    // テーブル生成
    autoTable(doc, {
      head: [['従業員名', '部署', '出勤日数', '総労働時間', '残業時間', '基本給', '残業代', '総支給額', 'ステータス']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    })
    
    // 集計情報を追加
    const totalSalary = employees.reduce((sum, emp) => sum + emp.totalSalary, 0)
    const totalHours = employees.reduce((sum, emp) => sum + emp.totalHours, 0)
    const avgSalary = Math.round(totalSalary / employees.length)
    
    const finalY = (doc as any).lastAutoTable.finalY || 200
    doc.setFontSize(12)
    doc.text('【集計情報】', 20, finalY + 15)
    doc.setFontSize(10)
    doc.text(`総支給額合計: ¥${totalSalary.toLocaleString()}`, 20, finalY + 25)
    doc.text(`総労働時間: ${totalHours}時間`, 20, finalY + 32)
    doc.text(`平均支給額: ¥${avgSalary.toLocaleString()}`, 20, finalY + 39)
    
    const fileName = type === 'selected' 
      ? `給与計算一覧_選択${employees.length}件_${new Date().toISOString().split('T')[0]}.pdf`
      : `給与計算一覧_全件_${new Date().toISOString().split('T')[0]}.pdf`
    
    doc.save(fileName)
  }

  const exportToExcel = (employees: typeof sampleSalaryData) => {
    const worksheet = XLSX.utils.json_to_sheet(
      employees.map(emp => ({
        '従業員名': emp.employeeName,
        '部署': emp.department,
        '出勤日数': emp.workDays,
        '総労働時間': emp.totalHours,
        '残業時間': emp.overtimeHours,
        '基本給': emp.baseSalary,
        '残業代': emp.overtimePay,
        '総支給額': emp.totalSalary,
        'ステータス': emp.status
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '給与計算一覧')
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(data, `給与計算一覧_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToCSV = (employees: typeof sampleSalaryData) => {
    const csvContent = [
      ['従業員名', '部署', '出勤日数', '総労働時間', '残業時間', '基本給', '残業代', '総支給額', 'ステータス'],
      ...employees.map(emp => [
        emp.employeeName,
        emp.department,
        emp.workDays,
        emp.totalHours,
        emp.overtimeHours,
        emp.baseSalary,
        emp.overtimePay,
        emp.totalSalary,
        emp.status
      ])
    ].map(row => row.join(',')).join('\n')
    
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `給与計算一覧_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleEmployeeSelect = (id: string) => {
    setSelectedEmployees(prev => 
      prev.includes(id) 
        ? prev.filter(empId => empId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedEmployees.length === sampleSalaryData.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(sampleSalaryData.map(emp => emp.id))
    }
  }

  const handleEmployeeClick = (id: string) => {
    const detail = getSalaryDetail(id)
    if (detail) {
      setSelectedEmployee(detail)
      setShowDetailModal(true)
    }
  }

  // 集計レポート機能
  const generateSummaryReport = () => {
    const totalEmployees = sampleSalaryData.length
    const totalSalary = sampleSalaryData.reduce((sum, emp) => sum + emp.totalSalary, 0)
    const totalHours = sampleSalaryData.reduce((sum, emp) => sum + emp.totalHours, 0)
    const totalOvertimeHours = sampleSalaryData.reduce((sum, emp) => sum + emp.overtimeHours, 0)
    const approvedCount = sampleSalaryData.filter(emp => emp.status === '承認済み').length
    const avgSalary = Math.round(totalSalary / totalEmployees)
    
    // 部署別集計
    const departmentStats = sampleSalaryData.reduce((acc, emp) => {
      if (!acc[emp.department]) {
        acc[emp.department] = {
          count: 0,
          totalSalary: 0,
          totalHours: 0
        }
      }
      acc[emp.department].count += 1
      acc[emp.department].totalSalary += emp.totalSalary
      acc[emp.department].totalHours += emp.totalHours
      return acc
    }, {} as Record<string, { count: number; totalSalary: number; totalHours: number }>)

    const doc = new jsPDF()
    
    // レポートヘッダー
    doc.setFontSize(18)
    doc.text('給与計算 集計レポート', 20, 25)
    doc.setFontSize(12)
    doc.text(`作成日時: ${new Date().toLocaleString('ja-JP')}`, 20, 35)
    doc.text(`対象期間: 2024年9月`, 20, 42)
    
    // 全体統計
    doc.setFontSize(14)
    doc.text('【全体統計】', 20, 60)
    
    autoTable(doc, {
      head: [['項目', '値']],
      body: [
        ['対象従業員数', `${totalEmployees}名`],
        ['総支給額', `¥${totalSalary.toLocaleString()}`],
        ['平均支給額', `¥${avgSalary.toLocaleString()}`],
        ['総労働時間', `${totalHours}時間`],
        ['総残業時間', `${totalOvertimeHours}時間`],
        ['承認完了率', `${Math.round((approvedCount / totalEmployees) * 100)}% (${approvedCount}/${totalEmployees})`],
      ],
      startY: 65,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [70, 130, 180] },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 60 } }
    })
    
    // 部署別統計
    const finalY1 = (doc as any).lastAutoTable.finalY || 120
    doc.setFontSize(14)
    doc.text('【部署別統計】', 20, finalY1 + 15)
    
    const deptData = Object.entries(departmentStats).map(([dept, stats]) => [
      dept,
      `${stats.count}名`,
      `¥${stats.totalSalary.toLocaleString()}`,
      `¥${Math.round(stats.totalSalary / stats.count).toLocaleString()}`,
      `${stats.totalHours}時間`
    ])
    
    autoTable(doc, {
      head: [['部署', '人数', '支給額合計', '平均支給額', '労働時間']],
      body: deptData,
      startY: finalY1 + 20,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [100, 150, 100] }
    })
    
    // 給与分布
    const finalY2 = (doc as any).lastAutoTable.finalY || 180
    doc.setFontSize(14)
    doc.text('【給与分布】', 20, finalY2 + 15)
    
    const salaryRanges = [
      { range: '20万円未満', count: 0 },
      { range: '20-25万円', count: 0 },
      { range: '25-30万円', count: 0 },
      { range: '30万円以上', count: 0 }
    ]
    
    sampleSalaryData.forEach(emp => {
      if (emp.totalSalary < 200000) salaryRanges[0].count++
      else if (emp.totalSalary < 250000) salaryRanges[1].count++
      else if (emp.totalSalary < 300000) salaryRanges[2].count++
      else salaryRanges[3].count++
    })
    
    autoTable(doc, {
      head: [['給与範囲', '人数', '割合']],
      body: salaryRanges.map(range => [
        range.range,
        `${range.count}名`,
        `${Math.round((range.count / totalEmployees) * 100)}%`
      ]),
      startY: finalY2 + 20,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [150, 100, 150] },
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 } }
    })
    
    doc.save(`給与計算集計レポート_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (!mounted || status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">給与データを読み込み中...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoHome}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                ホームに戻る
              </button>
            </div>
            
            {/* ダウンロードメニュー */}
            <div className="flex items-center space-x-4">
              <button
                onClick={generateSummaryReport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                集計レポート
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  ダウンロード
                </button>
                
                {showDownloadMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">
                        ダウンロード形式
                      </div>
                      
                      {/* PDF */}
                      <div className="px-4 py-2 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 text-red-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">PDF</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              exportToPDF(sampleSalaryData, 'all')
                              setShowDownloadMenu(false)
                            }}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            全員
                          </button>
                          <button
                            onClick={() => {
                              const selected = sampleSalaryData.filter(emp => selectedEmployees.includes(emp.id))
                              if (selected.length > 0) {
                                exportToPDF(selected, 'selected')
                                setShowDownloadMenu(false)
                              } else {
                                alert('従業員を選択してください')
                              }
                            }}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            選択({selectedEmployees.length}件)
                          </button>
                        </div>
                      </div>
                      
                      {/* Excel */}
                      <div className="px-4 py-2 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <TableCellsIcon className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">Excel</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              exportToExcel(sampleSalaryData)
                              setShowDownloadMenu(false)
                            }}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            全員
                          </button>
                          <button
                            onClick={() => {
                              const selected = sampleSalaryData.filter(emp => selectedEmployees.includes(emp.id))
                              if (selected.length > 0) {
                                exportToExcel(selected)
                                setShowDownloadMenu(false)
                              } else {
                                alert('従業員を選択してください')
                              }
                            }}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            選択({selectedEmployees.length}件)
                          </button>
                        </div>
                      </div>
                      
                      {/* CSV */}
                      <div className="px-4 py-2 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">CSV</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              exportToCSV(sampleSalaryData)
                              setShowDownloadMenu(false)
                            }}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            全員
                          </button>
                          <button
                            onClick={() => {
                              const selected = sampleSalaryData.filter(emp => selectedEmployees.includes(emp.id))
                              if (selected.length > 0) {
                                exportToCSV(selected)
                                setShowDownloadMenu(false)
                              } else {
                                alert('従業員を選択してください')
                              }
                            }}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            選択({selectedEmployees.length}件)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 rounded-lg mb-8">
            <div className="flex items-center">
              <BanknotesIcon className="h-10 w-10 text-white mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-white">給与計算システム</h1>
                <p className="text-green-100 mt-2 text-lg">
                  従業員の勤務時間と給与を管理・計算します
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{sampleSalaryData.length}</p>
                <p className="text-gray-600">従業員数</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {sampleSalaryData.reduce((sum, emp) => sum + emp.totalHours, 0)}
                </p>
                <p className="text-gray-600">総労働時間</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <CurrencyYenIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  ¥{sampleSalaryData.reduce((sum, emp) => sum + emp.totalSalary, 0).toLocaleString()}
                </p>
                <p className="text-gray-600">総支給額</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {sampleSalaryData.filter(emp => emp.status === '承認済み').length}
                </p>
                <p className="text-gray-600">承認済み</p>
              </div>
            </div>
          </div>
        </div>

        {/* 給与リスト */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">給与計算一覧</h2>
                <p className="text-sm text-gray-600 mt-1">2024年9月分の給与計算結果</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {selectedEmployees.length > 0 && `${selectedEmployees.length}件選択中`}
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedEmployees.length === sampleSalaryData.length ? '全て解除' : '全て選択'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.length === sampleSalaryData.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">従業員</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出勤日数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">総労働時間</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">残業時間</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">基本給</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">残業代</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">総支給額</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sampleSalaryData.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleEmployeeSelect(employee.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <button
                          onClick={() => handleEmployeeClick(employee.id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900 cursor-pointer underline"
                        >
                          {employee.employeeName}
                        </button>
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.workDays}日
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.totalHours}時間
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.overtimeHours}時間
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{employee.baseSalary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{employee.overtimePay.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ¥{employee.totalSalary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.status === '承認済み' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEmployeeClick(employee.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="詳細を表示"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <div className="relative group">
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="個別ダウンロード"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 hidden group-hover:block">
                            <div className="py-1">
                              <button
                                onClick={() => exportToPDF([employee], 'individual')}
                                className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                PDF
                              </button>
                              <button
                                onClick={() => exportToExcel([employee])}
                                className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                Excel
                              </button>
                              <button
                                onClick={() => exportToCSV([employee])}
                                className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                CSV
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ユーザー情報 */}
        {session?.user && (
          <div className="mt-8 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              ✅ ログインユーザー: <strong>{session.user.name}</strong> ({session.user.role})
            </p>
            <p className="text-xs text-blue-600 mt-1">
              給与計算システムが正常に動作しています。
            </p>
          </div>
        )}

        {/* 給与詳細モーダル */}
        {showDetailModal && selectedEmployee && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <UserIcon className="h-6 w-6 mr-2 text-blue-600" />
                  {selectedEmployee.employeeName}の給与詳細
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 基本情報 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                    基本情報
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">従業員ID:</span>
                      <span className="text-sm text-gray-900">{selectedEmployee.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">所属部署:</span>
                      <span className="text-sm text-gray-900">{selectedEmployee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">役職:</span>
                      <span className="text-sm text-gray-900">{selectedEmployee.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">対象期間:</span>
                      <span className="text-sm text-gray-900">{selectedEmployee.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">ステータス:</span>
                      <span className={`text-sm font-semibold ${
                        selectedEmployee.status === '承認済み' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {selectedEmployee.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 勤務統計 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                    勤務統計
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">出勤日数:</span>
                      <span className="text-sm text-gray-900 font-semibold">{selectedEmployee.workDays}日</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">総労働時間:</span>
                      <span className="text-sm text-gray-900 font-semibold">{selectedEmployee.totalHours}時間</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">残業時間:</span>
                      <span className="text-sm text-orange-600 font-semibold">{selectedEmployee.overtimeHours}時間</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">深夜労働時間:</span>
                      <span className="text-sm text-purple-600 font-semibold">{selectedEmployee.nightHours}時間</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">休日労働時間:</span>
                      <span className="text-sm text-red-600 font-semibold">{selectedEmployee.holidayHours}時間</span>
                    </div>
                  </div>
                </div>

                {/* 支給項目 */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2 text-green-600" />
                    支給項目
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">基本給:</span>
                      <span className="text-sm text-gray-900 font-semibold">¥{selectedEmployee.baseSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">残業代:</span>
                      <span className="text-sm text-orange-600 font-semibold">¥{selectedEmployee.overtimePay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">深夜手当:</span>
                      <span className="text-sm text-purple-600 font-semibold">¥{selectedEmployee.nightPay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">休日手当:</span>
                      <span className="text-sm text-red-600 font-semibold">¥{selectedEmployee.holidayPay.toLocaleString()}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="text-xs text-gray-500 font-semibold">諸手当:</div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">交通費:</span>
                      <span className="text-xs text-gray-900">¥{selectedEmployee.allowances.transportation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">食事手当:</span>
                      <span className="text-xs text-gray-900">¥{selectedEmployee.allowances.meal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">住宅手当:</span>
                      <span className="text-xs text-gray-900">¥{selectedEmployee.allowances.housing.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">家族手当:</span>
                      <span className="text-xs text-gray-900">¥{selectedEmployee.allowances.family.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">その他手当:</span>
                      <span className="text-xs text-gray-900">¥{selectedEmployee.allowances.other.toLocaleString()}</span>
                    </div>
                    <hr className="border-green-300" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-sm text-green-700">総支給額:</span>
                      <span className="text-sm text-green-700">¥{selectedEmployee.totalGross.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 控除項目 */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <XMarkIcon className="h-5 w-5 mr-2 text-red-600" />
                    控除項目
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">健康保険:</span>
                      <span className="text-sm text-red-600">¥{selectedEmployee.deductions.healthInsurance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">厚生年金:</span>
                      <span className="text-sm text-red-600">¥{selectedEmployee.deductions.pensionInsurance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">雇用保険:</span>
                      <span className="text-sm text-red-600">¥{selectedEmployee.deductions.employmentInsurance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">所得税:</span>
                      <span className="text-sm text-red-600">¥{selectedEmployee.deductions.incomeTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">住民税:</span>
                      <span className="text-sm text-red-600">¥{selectedEmployee.deductions.residentTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">その他控除:</span>
                      <span className="text-sm text-red-600">¥{selectedEmployee.deductions.other.toLocaleString()}</span>
                    </div>
                    <hr className="border-red-300" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-sm text-red-700">総控除額:</span>
                      <span className="text-sm text-red-700">¥{selectedEmployee.totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 差引支給額 */}
              <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg text-white">
                <div className="text-center">
                  <h4 className="text-2xl font-bold mb-2">差引支給額（手取り）</h4>
                  <p className="text-4xl font-bold">¥{selectedEmployee.netSalary.toLocaleString()}</p>
                  <p className="text-sm text-blue-100 mt-2">
                    総支給額 ¥{selectedEmployee.totalGross.toLocaleString()} - 総控除額 ¥{selectedEmployee.totalDeductions.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 承認情報・計算履歴 */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-600" />
                  処理履歴
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">計算日時:</span>
                    <span className="text-gray-900">{selectedEmployee.calculatedAt}</span>
                  </div>
                  {selectedEmployee.approvedAt && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">承認日時:</span>
                        <span className="text-gray-900">{selectedEmployee.approvedAt}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">承認者:</span>
                        <span className="text-gray-900">{selectedEmployee.approvedBy}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  閉じる
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const employeeData = sampleSalaryData.find(emp => emp.id === selectedEmployee.id)
                      if (employeeData) {
                        exportToPDF([employeeData], 'individual')
                      }
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    PDF出力
                  </button>
                  <button
                    onClick={() => {
                      const employeeData = sampleSalaryData.find(emp => emp.id === selectedEmployee.id)
                      if (employeeData) {
                        exportToExcel([employeeData])
                      }
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    Excel出力
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}