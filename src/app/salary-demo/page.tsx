'use client'

import { useState, useEffect } from 'react'
import { 
  BanknotesIcon,
  UserIcon,
  ClockIcon,
  CurrencyYenIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline'

// 従業員の給与データ型
interface Employee {
  id: string
  employeeName: string
  department: string
  workDays: number
  totalHours: number
  overtimeHours: number
  baseSalary: number
  overtimePay: number
  totalSalary: number
  status: string
}

// 給与詳細データ型
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
}

export default function SalaryDemoPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<SalaryDetail | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // サンプル給与データ
  const sampleSalaryData: Employee[] = [
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

  // 給与詳細データ
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
        calculatedAt: '2024-09-30 15:30:00'
      }
    }
    
    return salaryDetails[id] || null
  }

  const handleEmployeeClick = (id: string) => {
    const detail = getSalaryDetail(id)
    if (detail) {
      setSelectedEmployee(detail)
      setShowDetailModal(true)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">給与データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 rounded-lg mb-8">
            <div className="flex items-center">
              <BanknotesIcon className="h-10 w-10 text-white mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-white">給与計算システム - デモ</h1>
                <p className="text-green-100 mt-2 text-lg">
                  従業員の勤務時間と給与を管理・計算します（完全独立版）
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
                        <button
                          className="text-purple-600 hover:text-purple-900"
                          title="給料明細書"
                          onClick={() => alert('給料明細書機能はデモ版では無効です')}
                        >
                          <ReceiptPercentIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="ダウンロード"
                          onClick={() => alert('ダウンロード機能はデモ版では無効です')}
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ステータス情報 */}
        <div className="mt-8 bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ <strong>給与計算システム（デモ版）が正常に動作中</strong>
          </p>
          <p className="text-xs text-green-600 mt-1">
            認証なしで給与計算機能をテストできます。
          </p>
          <p className="text-xs text-gray-600 mt-2">
            このページは独立したデモページです。完全なシステムは認証が必要です。
          </p>
        </div>

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
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h4>
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">勤務統計</h4>
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">支給項目</h4>
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">控除項目</h4>
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

              {/* アクションボタン */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}