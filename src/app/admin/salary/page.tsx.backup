'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import {
  BanknotesIcon,
  UsersIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  HomeIcon,
  XMarkIcon,
  ClockIcon,
  CurrencyYenIcon,
} from '@heroicons/react/24/outline'

interface Employee {
  id: string
  name: string
  email: string
  hourlyWage: number
  workingDays: number
  totalHours: number
  overtimeHours: number
  grossPay: number
  deductions: number
  netPay: number
  position?: string
  department?: string
  attendanceDetails?: AttendanceDetail[]
}

interface AttendanceDetail {
  date: string
  clockIn: string
  clockOut?: string
  workHours: number
  overtimeHours: number
  siteName: string
  status: 'present' | 'absent' | 'late' | 'holiday'
}

interface SalaryBreakdown {
  basicPay: number
  overtimePay: number
  allowances: number
  healthInsurance: number
  pensionInsurance: number
  employmentInsurance: number
  incomeTax: number
  residentTax: number
}

export default function AdminSalaryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
    if (status === 'authenticated' && session?.user?.role === 'EMPLOYEE') {
      redirect('/home')
    }
  }, [status, session])

  useEffect(() => {
    if (session?.user) {
      fetchSalaryData()
    }
  }, [session, selectedMonth])

  const fetchSalaryData = async () => {
    try {
      setLoading(true)
      
      // TODO: Replace with actual API call
      // Mock data for demonstration
      setTimeout(() => {
        const mockEmployees: Employee[] = [
          {
            id: '1',
            name: '作業員花子',
            email: 'employee1@example.com',
            position: '作業員',
            department: '施工部',
            hourlyWage: 1500,
            workingDays: 20,
            totalHours: 160,
            overtimeHours: 20,
            grossPay: 277500, // (160 * 1500) + (20 * 1500 * 1.25)
            deductions: 41625, // 15% of gross pay
            netPay: 235875,
            attendanceDetails: [
              { date: '2025-09-01', clockIn: '08:00', clockOut: '17:00', workHours: 8, overtimeHours: 0, siteName: '新宿オフィスビル建設現場', status: 'present' },
              { date: '2025-09-02', clockIn: '08:15', clockOut: '18:00', workHours: 8.75, overtimeHours: 0.75, siteName: '新宿オフィスビル建設現場', status: 'late' },
              { date: '2025-09-03', clockIn: '08:00', clockOut: '19:00', workHours: 10, overtimeHours: 2, siteName: '新宿オフィスビル建設現場', status: 'present' }
            ]
          },
          {
            id: '2',
            name: '作業員次郎',
            email: 'employee2@example.com',
            position: '技能工',
            department: '施工部',
            hourlyWage: 1400,
            workingDays: 22,
            totalHours: 176,
            overtimeHours: 15,
            grossPay: 272650, // (176 * 1400) + (15 * 1400 * 1.25)
            deductions: 40898,
            netPay: 231752,
            attendanceDetails: [
              { date: '2025-09-01', clockIn: '08:00', clockOut: '17:30', workHours: 8.5, overtimeHours: 0.5, siteName: '渋谷マンション改修工事', status: 'present' },
              { date: '2025-09-02', clockIn: '08:00', clockOut: '17:00', workHours: 8, overtimeHours: 0, siteName: '渋谷マンション改修工事', status: 'present' }
            ]
          },
          {
            id: '3',
            name: '作業員太郎',
            email: 'employee3@example.com',
            position: '現場監督',
            department: '施工部',
            hourlyWage: 1600,
            workingDays: 19,
            totalHours: 152,
            overtimeHours: 10,
            grossPay: 263200, // (152 * 1600) + (10 * 1600 * 1.25)
            deductions: 39480,
            netPay: 223720,
            attendanceDetails: [
              { date: '2025-09-01', clockIn: '07:45', clockOut: '17:15', workHours: 8.5, overtimeHours: 0.5, siteName: '新宿オフィスビル建設現場', status: 'present' },
              { date: '2025-09-02', clockIn: '08:00', clockOut: '18:30', workHours: 9.5, overtimeHours: 1.5, siteName: '新宿オフィスビル建設現場', status: 'present' }
            ]
          }
        ]
        setEmployees(mockEmployees)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to fetch salary data:', error)
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalGrossPay = filteredEmployees.reduce((sum, emp) => sum + emp.grossPay, 0)
  const totalDeductions = filteredEmployees.reduce((sum, emp) => sum + emp.deductions, 0)
  const totalNetPay = filteredEmployees.reduce((sum, emp) => sum + emp.netPay, 0)

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-gray-600">給与データを読み込み中...</span>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const handleGoHome = () => {
    router.push('/home')
  }

  const handleExcelExport = () => {
    // エクセル用のデータを準備
    const excelData = filteredEmployees.map(emp => ({
      '従業員名': emp.name,
      'メールアドレス': emp.email,
      '時給': emp.hourlyWage,
      '出勤日数': emp.workingDays,
      '労働時間': emp.totalHours,
      '残業時間': emp.overtimeHours,
      '総支給額': emp.grossPay,
      '控除額': emp.deductions,
      '手取り額': emp.netPay
    }))

    // サマリー行を追加
    const summaryData = {
      '従業員名': '合計',
      'メールアドレス': '',
      '時給': '',
      '出勤日数': '',
      '労働時間': '',
      '残業時間': '',
      '総支給額': totalGrossPay,
      '控除額': totalDeductions,
      '手取り額': totalNetPay
    }

    const allData = [...excelData, summaryData]

    // ワークブックを作成
    const worksheet = XLSX.utils.json_to_sheet(allData)
    const workbook = XLSX.utils.book_new()
    
    // 列幅を調整
    const colWidths = [
      { wch: 15 }, // 従業員名
      { wch: 25 }, // メールアドレス
      { wch: 10 }, // 時給
      { wch: 10 }, // 出勤日数
      { wch: 10 }, // 労働時間
      { wch: 10 }, // 残業時間
      { wch: 12 }, // 総支給額
      { wch: 12 }, // 控除額
      { wch: 12 }  // 手取り額
    ]
    worksheet['!cols'] = colWidths

    // 合計行のスタイルを設定（最後の行）
    const lastRowNum = allData.length + 1
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    
    XLSX.utils.book_append_sheet(workbook, worksheet, '給与明細')

    // ファイル名を生成（年月を含む）
    const date = new Date(selectedMonth)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const fileName = `給与明細_${year}年${month.toString().padStart(2, '0')}月.xlsx`

    // エクセルファイルとしてダウンロード
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(data, fileName)
  }

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDetailModal(true)
  }

  const getSalaryBreakdown = (employee: Employee): SalaryBreakdown => {
    const basicPay = employee.totalHours * employee.hourlyWage
    const overtimePay = employee.overtimeHours * employee.hourlyWage * 1.25
    const allowances = 0 // 各種手当
    
    const grossPay = basicPay + overtimePay + allowances
    
    // 控除項目（概算）
    const healthInsurance = Math.floor(grossPay * 0.05) // 健康保険 5%
    const pensionInsurance = Math.floor(grossPay * 0.09) // 厚生年金 9%
    const employmentInsurance = Math.floor(grossPay * 0.003) // 雇用保険 0.3%
    const incomeTax = Math.floor(grossPay * 0.05) // 所得税 5%（概算）
    const residentTax = Math.floor(grossPay * 0.01) // 住民税 1%（概算）
    
    return {
      basicPay,
      overtimePay,
      allowances,
      healthInsurance,
      pensionInsurance,
      employmentInsurance,
      incomeTax,
      residentTax
    }
  }

  return (
    <div className="space-y-8">
      {/* ホームボタン */}
      <div className="mb-4">
        <button
          onClick={handleGoHome}
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <HomeIcon className="h-4 w-4 mr-2" />
          ホームに戻る
        </button>
      </div>

      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <BanknotesIcon className="h-8 w-8 mr-3" />
              給与計算管理
            </h1>
            <p className="text-blue-100 mt-1">
              全従業員の給与計算と管理を行います
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-blue-100">対象月</p>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white text-gray-900 px-3 py-1 rounded-md text-sm font-medium"
                max={new Date().toISOString().slice(0, 7)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="sm:hidden mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">対象月を選択</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          max={new Date().toISOString().slice(0, 7)}
        />
      </div>

      {/* 給与サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-50 shadow-sm">
                <BanknotesIcon className="h-7 w-7 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">総支給額</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalGrossPay)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-red-50 shadow-sm">
                <CalendarIcon className="h-7 w-7 text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">控除合計</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalDeductions)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-50 shadow-sm">
                <UsersIcon className="h-7 w-7 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">手取り合計</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalNetPay)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 検索とアクション */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="従業員名またはメールで検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={handleExcelExport}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            給与明細一括出力 (Excel)
          </button>
        </div>

        {/* 従業員給与テーブル */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  従業員
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  時給
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  出勤日数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  労働時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  残業時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  総支給額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  控除額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  手取り額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(employee.hourlyWage)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.workingDays}日
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.totalHours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.overtimeHours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(employee.grossPay)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {formatCurrency(employee.deductions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    {formatCurrency(employee.netPay)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleViewDetails(employee)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">従業員が見つかりません</h3>
            <p className="mt-1 text-sm text-gray-500">
              検索条件を変更して再度お試しください。
            </p>
          </div>
        )}
      </div>

      {/* 給与詳細モーダル */}
      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* ヘッダー */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BanknotesIcon className="h-5 w-5 mr-2" />
                {selectedEmployee.name} の給与詳細 ({new Date(selectedMonth).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })})
              </h3>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 基本情報 */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <UsersIcon className="h-5 w-5 mr-2" />
                      従業員情報
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">氏名</span>
                        <span className="font-medium">{selectedEmployee.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">メール</span>
                        <span className="font-medium">{selectedEmployee.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">職種</span>
                        <span className="font-medium">{selectedEmployee.position || '未設定'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">部署</span>
                        <span className="font-medium">{selectedEmployee.department || '未設定'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">時給</span>
                        <span className="font-medium">{formatCurrency(selectedEmployee.hourlyWage)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 勤怠サマリー */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      勤怠サマリー
                    </h4>
                    <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">出勤日数</span>
                        <span className="font-medium text-blue-900">{selectedEmployee.workingDays}日</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">労働時間</span>
                        <span className="font-medium text-blue-900">{selectedEmployee.totalHours}時間</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">残業時間</span>
                        <span className="font-medium text-blue-900">{selectedEmployee.overtimeHours}時間</span>
                      </div>
                    </div>
                  </div>

                  {/* 出勤記録（抜粋） */}
                  {selectedEmployee.attendanceDetails && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">出勤記録（抜粋）</h4>
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">日付</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">現場</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedEmployee.attendanceDetails.slice(0, 5).map((record, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {new Date(record.date).toLocaleDateString('ja-JP')}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {record.clockIn}-{record.clockOut || '勤務中'}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {record.siteName}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* 給与計算詳細 */}
                <div className="space-y-6">
                  {(() => {
                    const breakdown = getSalaryBreakdown(selectedEmployee)
                    return (
                      <>
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                            <CurrencyYenIcon className="h-5 w-5 mr-2" />
                            支給項目
                          </h4>
                          <div className="bg-green-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-green-700">基本給</span>
                              <span className="font-medium text-green-900">
                                {formatCurrency(breakdown.basicPay)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">残業代</span>
                              <span className="font-medium text-green-900">
                                {formatCurrency(breakdown.overtimePay)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">各種手当</span>
                              <span className="font-medium text-green-900">
                                {formatCurrency(breakdown.allowances)}
                              </span>
                            </div>
                            <div className="border-t border-green-200 pt-2 mt-2">
                              <div className="flex justify-between text-lg">
                                <span className="font-medium text-green-700">総支給額</span>
                                <span className="font-bold text-green-900">
                                  {formatCurrency(selectedEmployee.grossPay)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-4">控除項目</h4>
                          <div className="bg-red-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-red-700">健康保険</span>
                              <span className="font-medium text-red-900">
                                {formatCurrency(breakdown.healthInsurance)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-700">厚生年金</span>
                              <span className="font-medium text-red-900">
                                {formatCurrency(breakdown.pensionInsurance)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-700">雇用保険</span>
                              <span className="font-medium text-red-900">
                                {formatCurrency(breakdown.employmentInsurance)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-700">所得税</span>
                              <span className="font-medium text-red-900">
                                {formatCurrency(breakdown.incomeTax)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-700">住民税</span>
                              <span className="font-medium text-red-900">
                                {formatCurrency(breakdown.residentTax)}
                              </span>
                            </div>
                            <div className="border-t border-red-200 pt-2 mt-2">
                              <div className="flex justify-between text-lg">
                                <span className="font-medium text-red-700">控除合計</span>
                                <span className="font-bold text-red-900">
                                  {formatCurrency(selectedEmployee.deductions)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-4">支給額</h4>
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                            <div className="text-center">
                              <div className="text-sm opacity-90 mb-1">手取り額</div>
                              <div className="text-3xl font-bold">
                                {formatCurrency(selectedEmployee.netPay)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 計算式 */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">計算式</h5>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>基本給 = {selectedEmployee.totalHours}時間 × {formatCurrency(selectedEmployee.hourlyWage)}</div>
                            <div>残業代 = {selectedEmployee.overtimeHours}時間 × {formatCurrency(selectedEmployee.hourlyWage)} × 1.25</div>
                            <div>手取り額 = 総支給額 - 控除合計</div>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* フッター */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  閉じる
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // 個別給与明細のエクセル出力
                    const employeeData = [{
                      '従業員名': selectedEmployee.name,
                      'メールアドレス': selectedEmployee.email,
                      '職種': selectedEmployee.position || '',
                      '部署': selectedEmployee.department || '',
                      '時給': selectedEmployee.hourlyWage,
                      '出勤日数': selectedEmployee.workingDays,
                      '労働時間': selectedEmployee.totalHours,
                      '残業時間': selectedEmployee.overtimeHours,
                      '基本給': getSalaryBreakdown(selectedEmployee).basicPay,
                      '残業代': getSalaryBreakdown(selectedEmployee).overtimePay,
                      '総支給額': selectedEmployee.grossPay,
                      '健康保険': getSalaryBreakdown(selectedEmployee).healthInsurance,
                      '厚生年金': getSalaryBreakdown(selectedEmployee).pensionInsurance,
                      '雇用保険': getSalaryBreakdown(selectedEmployee).employmentInsurance,
                      '所得税': getSalaryBreakdown(selectedEmployee).incomeTax,
                      '住民税': getSalaryBreakdown(selectedEmployee).residentTax,
                      '控除合計': selectedEmployee.deductions,
                      '手取り額': selectedEmployee.netPay
                    }]
                    
                    const worksheet = XLSX.utils.json_to_sheet(employeeData)
                    const workbook = XLSX.utils.book_new()
                    XLSX.utils.book_append_sheet(workbook, worksheet, '給与明細')
                    
                    const date = new Date(selectedMonth)
                    const year = date.getFullYear()
                    const month = date.getMonth() + 1
                    const fileName = `${selectedEmployee.name}_給与明細_${year}年${month.toString().padStart(2, '0')}月.xlsx`
                    
                    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
                    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                    saveAs(data, fileName)
                  }}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  個別エクセル出力
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}