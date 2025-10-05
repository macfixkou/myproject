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
  DocumentArrowDownIcon,
  DocumentIcon,
  TableCellsIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// PDF生成のための日本語対応設定
const createJapanesePDF = () => {
  const doc = new jsPDF()
  
  // Unicode文字をサポートするための設定
  doc.setLanguage('ja')
  doc.setCharSpace(0.1)
  
  return doc
}

export default function SalaryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGoHome = () => {
    router.push('/home')
  }

  // PDF生成機能（日本語対応）
  const generatePDF = (employee?: any) => {
    const doc = createJapanesePDF()
    
    // 日本語文字をローマ字/英数字に変換する関数
    const toRomaji = (text: string) => {
      const conversionMap: {[key: string]: string} = {
        '給与明細書': 'Salary Statement',
        '氏名': 'Name',
        '部署': 'Department', 
        '勤務項目': 'Work Items',
        '時間': 'Hours',
        '日数': 'Days',
        '出勤日数': 'Work Days',
        '総労働時間': 'Total Hours',
        '残業時間': 'Overtime Hours',
        '深夜労働': 'Night Work',
        '休日労働': 'Holiday Work',
        '支給項目': 'Allowances',
        '金額': 'Amount',
        '基本給': 'Base Salary',
        '残業手当': 'Overtime Pay',
        '深夜手当': 'Night Pay',
        '交通費': 'Transportation',
        '食事手当': 'Meal Allowance',
        '家族手当': 'Family Allowance',
        '支給合計': 'Total Allowance',
        '控除項目': 'Deductions',
        '健康保険': 'Health Insurance',
        '厚生年金保険': 'Pension Insurance', 
        '雇用保険': 'Employment Ins',
        '所得税': 'Income Tax',
        '住民税': 'Resident Tax',
        '控除合計': 'Total Deduction',
        '差引支給額': 'Net Salary',
        '管理部': 'Admin Dept',
        '建設部': 'Construction Dept',
        '営業部': 'Sales Dept',
        '技術部': 'Technical Dept',
        '管理者太郎': 'Admin Taro',
        '作業員花子': 'Worker Hanako',
        '作業員次郎': 'Worker Jiro',
        '現場監督山田': 'Site Manager Yamada',
        'サンプル建設会社': 'Sample Construction Co.',
        '給与計算一覧表': 'Salary Calculation List',
        '作成日': 'Created Date',
        '従業員名': 'Employee Name',
        'ステータス': 'Status',
        '支払済み': 'Paid',
        '未払い': 'Unpaid'
      }
      
      return conversionMap[text] || text
    }
    
    if (employee) {
      // 個別の給与明細PDF
      doc.setFontSize(16)
      doc.text(toRomaji('給与明細書'), 105, 20, { align: 'center' })
      
      doc.setFontSize(12)
      doc.text('2024/09 Salary Statement', 20, 35)
      doc.text(toRomaji('サンプル建設会社'), 140, 35)
      doc.text(`${toRomaji('氏名')}: ${toRomaji(employee.employeeName)}`, 140, 45)
      doc.text(`${toRomaji('部署')}: ${toRomaji(employee.department)}`, 140, 55)

      // 詳細なサンプル給与データ
      const detailData = getDetailedSalaryData(employee.id)
      
      // 勤務データテーブル
      const workData = [
        [toRomaji('出勤日数'), `${employee.workDays} days`],
        [toRomaji('総労働時間'), `${employee.totalHours} hrs`],
        [toRomaji('残業時間'), `${employee.overtimeHours} hrs`],
        [toRomaji('深夜労働'), `${detailData?.nightHours || 0} hrs`],
        [toRomaji('休日労働'), `${detailData?.holidayHours || 0} hrs`]
      ]

      autoTable(doc, {
        head: [[toRomaji('勤務項目'), 'Hours/Days']],
        body: workData,
        startY: 70,
        margin: { left: 20 },
        tableWidth: 50
      })

      // 支給項目テーブル
      const allowanceData = [
        [toRomaji('基本給'), `¥${employee.baseSalary.toLocaleString()}`],
        [toRomaji('残業手当'), `¥${employee.overtimePay.toLocaleString()}`],
        [toRomaji('深夜手当'), `¥${detailData?.nightPay || 0}`],
        [toRomaji('交通費'), `¥${detailData?.allowances?.transportation || 15000}`],
        [toRomaji('食事手当'), `¥${detailData?.allowances?.meal || 8000}`],
        [toRomaji('家族手当'), `¥${detailData?.allowances?.family || 20000}`]
      ]

      const totalGross = employee.baseSalary + employee.overtimePay + (detailData?.nightPay || 0) + 
                        (detailData?.allowances?.transportation || 15000) +
                        (detailData?.allowances?.meal || 8000) +
                        (detailData?.allowances?.family || 20000)
      
      allowanceData.push([toRomaji('支給合計'), `¥${totalGross.toLocaleString()}`])

      autoTable(doc, {
        head: [[toRomaji('支給項目'), toRomaji('金額')]],
        body: allowanceData,
        startY: 70,
        margin: { left: 80 },
        tableWidth: 50
      })

      // 控除項目テーブル
      const deductionData = [
        [toRomaji('健康保険'), `¥${detailData?.deductions?.healthInsurance || 12250}`],
        [toRomaji('厚生年金保険'), `¥${detailData?.deductions?.pensionInsurance || 22950}`],
        [toRomaji('雇用保険'), `¥${detailData?.deductions?.employmentInsurance || 1683}`],
        [toRomaji('所得税'), `¥${detailData?.deductions?.incomeTax || 8500}`],
        [toRomaji('住民税'), `¥${detailData?.deductions?.residentTax || 12000}`]
      ]

      const totalDeductions = (detailData?.deductions?.healthInsurance || 12250) +
                             (detailData?.deductions?.pensionInsurance || 22950) +
                             (detailData?.deductions?.employmentInsurance || 1683) +
                             (detailData?.deductions?.incomeTax || 8500) +
                             (detailData?.deductions?.residentTax || 12000)

      deductionData.push([toRomaji('控除合計'), `¥${totalDeductions.toLocaleString()}`])

      autoTable(doc, {
        head: [[toRomaji('控除項目'), toRomaji('金額')]],
        body: deductionData,
        startY: 70,
        margin: { left: 140 },
        tableWidth: 50
      })

      // 差引支給額
      const netSalary = totalGross - totalDeductions
      const finalY = Math.max((doc as any).lastAutoTable?.finalY || 150, 150)

      doc.setFontSize(14)
      doc.text(toRomaji('差引支給額'), 20, finalY + 20)
      doc.setFontSize(18)
      doc.text(`¥${netSalary.toLocaleString()}`, 60, finalY + 20)

      const filename = `SalaryStatement_${toRomaji(employee.employeeName)}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
    } else {
      // 給与一覧PDF
      doc.setFontSize(16)
      doc.text(toRomaji('給与計算一覧表'), 105, 20, { align: 'center' })
      
      doc.setFontSize(12)
      doc.text('2024/09 Salary List', 20, 35)
      doc.text(`${toRomaji('作成日')}: ${new Date().toLocaleDateString('en-US')}`, 140, 35)

      const tableData = sampleSalaryData.map(emp => [
        toRomaji(emp.employeeName),
        toRomaji(emp.department),
        `${emp.workDays} days`,
        `${emp.totalHours} hrs`,
        `${emp.overtimeHours} hrs`,
        `¥${emp.baseSalary.toLocaleString()}`,
        `¥${emp.overtimePay.toLocaleString()}`,
        `¥${emp.totalSalary.toLocaleString()}`,
        toRomaji(emp.status)
      ])

      autoTable(doc, {
        head: [[toRomaji('従業員名'), toRomaji('部署'), 'Work Days', 'Total Hours', 'OT Hours', 'Base Salary', 'OT Pay', 'Total Salary', toRomaji('ステータス')]],
        body: tableData,
        startY: 50,
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [200, 220, 255] }
      })

      const filename = `SalaryList_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
    }
  }

  // Excel生成機能
  const generateExcel = (employee?: any) => {
    const wb = XLSX.utils.book_new()

    if (employee) {
      // 個別の給与明細Excel
      const detailData = getDetailedSalaryData(employee.id)
      
      const worksheetData = [
        ['給与明細書', '', '', ''],
        ['対象期間', '2024年9月分', '', ''],
        ['従業員名', employee.employeeName, '部署', employee.department],
        ['', '', '', ''],
        ['勤務項目', '', '', ''],
        ['出勤日数', `${employee.workDays}日`, '', ''],
        ['総労働時間', `${employee.totalHours}時間`, '', ''],
        ['残業時間', `${employee.overtimeHours}時間`, '', ''],
        ['深夜労働', `${detailData?.nightHours || 0}時間`, '', ''],
        ['休日労働', `${detailData?.holidayHours || 0}時間`, '', ''],
        ['', '', '', ''],
        ['支給項目', '金額', '', ''],
        ['基本給', employee.baseSalary, '', ''],
        ['残業手当', employee.overtimePay, '', ''],
        ['深夜手当', detailData?.nightPay || 0, '', ''],
        ['交通費', detailData?.allowances?.transportation || 15000, '', ''],
        ['食事手当', detailData?.allowances?.meal || 8000, '', ''],
        ['家族手当', detailData?.allowances?.family || 20000, '', ''],
        ['', '', '', ''],
        ['控除項目', '金額', '', ''],
        ['健康保険', detailData?.deductions?.healthInsurance || 12250, '', ''],
        ['厚生年金保険', detailData?.deductions?.pensionInsurance || 22950, '', ''],
        ['雇用保険', detailData?.deductions?.employmentInsurance || 1683, '', ''],
        ['所得税', detailData?.deductions?.incomeTax || 8500, '', ''],
        ['住民税', detailData?.deductions?.residentTax || 12000, '', '']
      ]

      const ws = XLSX.utils.aoa_to_sheet(worksheetData)
      XLSX.utils.book_append_sheet(wb, ws, '給与明細')
      XLSX.writeFile(wb, `給与明細_${employee.employeeName}_${new Date().toISOString().split('T')[0]}.xlsx`)
    } else {
      // 給与一覧Excel
      const worksheetData = [
        ['給与計算一覧表', '', '', '', '', '', '', '', ''],
        ['対象期間', '2024年9月分', '', '', '', '', '', '', ''],
        ['作成日', new Date().toLocaleDateString('ja-JP'), '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', ''],
        ['従業員名', '部署', '出勤日数', '総労働時間', '残業時間', '基本給', '残業代', '総支給額', 'ステータス'],
        ...sampleSalaryData.map(emp => [
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
      ]

      const ws = XLSX.utils.aoa_to_sheet(worksheetData)
      XLSX.utils.book_append_sheet(wb, ws, '給与計算一覧')
      XLSX.writeFile(wb, `給与計算一覧_${new Date().toISOString().split('T')[0]}.xlsx`)
    }
  }

  // 詳細給与データ取得（サンプル）
  const getDetailedSalaryData = (employeeId: string) => {
    const detailData: any = {
      '1': {
        nightHours: 8,
        holidayHours: 0,
        nightPay: 12000,
        allowances: {
          transportation: 15000,
          meal: 8000,
          family: 20000
        },
        deductions: {
          healthInsurance: 12250,
          pensionInsurance: 22950,
          employmentInsurance: 1683,
          incomeTax: 8500,
          residentTax: 12000
        }
      },
      '2': {
        nightHours: 4,
        holidayHours: 0,
        nightPay: 6000,
        allowances: {
          transportation: 12000,
          meal: 6000,
          family: 15000
        },
        deductions: {
          healthInsurance: 11500,
          pensionInsurance: 20700,
          employmentInsurance: 1359,
          incomeTax: 6800,
          residentTax: 9500
        }
      },
      '3': {
        nightHours: 12,
        holidayHours: 8,
        nightPay: 18000,
        allowances: {
          transportation: 18000,
          meal: 10000,
          family: 30000
        },
        deductions: {
          healthInsurance: 17625,
          pensionInsurance: 31005,
          employmentInsurance: 2007,
          incomeTax: 15200,
          residentTax: 18000
        }
      }
    }
    return detailData[employeeId] || detailData['1']
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
              <div className="flex space-x-3">
                <button
                  onClick={() => generatePDF()}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <DocumentIcon className="h-4 w-4 mr-2" />
                  PDF出力
                </button>
                <button
                  onClick={() => generateExcel()}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <TableCellsIcon className="h-4 w-4 mr-2" />
                  Excel出力
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.employeeName}</div>
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
                          onClick={() => generatePDF(employee)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                          title="個別PDF出力"
                        >
                          <DocumentIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => generateExcel(employee)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                          title="個別Excel出力"
                        >
                          <TableCellsIcon className="h-4 w-4" />
                        </button>
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
      </div>
    </Layout>
  )
}