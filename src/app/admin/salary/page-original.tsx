'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { 
  BanknotesIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  HomeIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface Employee {
  id: string
  name: string
  email: string
  hourlyWage: number
  employmentType: string
  department: string
}

interface SalaryData {
  id: string
  employee: Employee
  period: {
    year: number
    month: number
    startDate: string
    endDate: string
  }
  attendance: {
    totalDays: number
    workDays: number
    absentDays: number
    lateDays: number
    overtimeDays: number
  }
  hours: {
    regularHours: number
    overtimeHours: number
    nightHours: number
    holidayHours: number
    totalHours: number
  }
  amounts: {
    baseSalary: number
    overtimePay: number
    nightPay: number
    holidayPay: number
    allowances: number
    deductions: number
    totalGross: number
    totalNet: number
  }
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID'
  calculatedAt: string
  approvedAt?: string
  paidAt?: string
}

export default function SalaryPage() {
  
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [salaryData, setSalaryData] = useState<SalaryData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  })
  const [selectedEmployee, setSelectedEmployee] = useState<SalaryData | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalGross: 0,
    totalNet: 0,
    totalHours: 0,
    approvedCount: 0
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      setError('認証が必要です')
      setLoading(false)
      return
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
      setError('このページにアクセスする権限がありません')
      setLoading(false)
      return
    }
    
    // 認証が完了したらデータを取得
    if (status === 'authenticated' && session?.user) {
      fetchSalaryData()
    }
  }, [status, session])

  // Fetch salary data from API
  const fetchSalaryData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // モックデータを使用して動作を確認
      const mockData: SalaryData[] = [
        {
          id: '1',
          employee: {
            id: 'emp1',
            name: '山田太郎',
            email: 'yamada@example.com',
            hourlyWage: 1500,
            employmentType: '正社員',
            department: '建設部'
          },
          period: {
            year: selectedPeriod.year,
            month: selectedPeriod.month,
            startDate: `${selectedPeriod.year}-${selectedPeriod.month.toString().padStart(2, '0')}-01`,
            endDate: `${selectedPeriod.year}-${selectedPeriod.month.toString().padStart(2, '0')}-30`
          },
          attendance: {
            totalDays: 30,
            workDays: 22,
            absentDays: 1,
            lateDays: 2,
            overtimeDays: 5
          },
          hours: {
            regularHours: 176,
            overtimeHours: 20,
            nightHours: 8,
            holidayHours: 0,
            totalHours: 196
          },
          amounts: {
            baseSalary: 264000,
            overtimePay: 37500,
            nightPay: 15000,
            holidayPay: 0,
            allowances: 20000,
            deductions: 52700,
            totalGross: 336500,
            totalNet: 283800
          },
          status: 'CALCULATED',
          calculatedAt: new Date().toISOString()
        }
      ]
      
      setSalaryData(mockData)
      setSummary({
        totalEmployees: mockData.length,
        totalGross: mockData.reduce((sum, d) => sum + d.amounts.totalGross, 0),
        totalNet: mockData.reduce((sum, d) => sum + d.amounts.totalNet, 0),
        totalHours: mockData.reduce((sum, d) => sum + d.hours.totalHours, 0),
        approvedCount: mockData.filter(d => d.status === 'APPROVED').length
      })
    } catch (error) {
      console.error('Salary data fetch error:', error)
      setError(error instanceof Error ? error.message : '給与データの取得中にエラーが発生しました')
      setSalaryData([])
    } finally {
      setLoading(false)
    }
  }

  // 期間変更時のデータ再取得
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !error) {
      fetchSalaryData()
    }
  }, [selectedPeriod])

  const filteredSalaryData = salaryData.filter(data => 
    data.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="badge badge-info">下書き</span>
      case 'CALCULATED':
        return <span className="badge badge-warning">計算済み</span>
      case 'APPROVED':
        return <span className="badge badge-success">承認済み</span>
      case 'PAID':
        return <span className="badge badge-success">支払済み</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  const handleViewDetails = (salary: SalaryData) => {
    setSelectedEmployee(salary)
    setShowDetailModal(true)
  }

  const handleExportIndividual = (salary: SalaryData) => {
    const workbook = XLSX.utils.book_new()
    
    const worksheetData = [
      ['給与明細書'],
      [],
      ['支給対象期間', `${salary.period.year}年${salary.period.month}月`],
      ['氏名', salary.employee.name],
      ['社員番号', salary.employee.id],
      ['雇用形態', salary.employee.employmentType],
      [],
      ['勤怠情報'],
      ['項目', '日数', '時間'],
      ['出勤日数', salary.attendance.workDays, ''],
      ['欠勤日数', salary.attendance.absentDays, ''],
      ['遅刻日数', salary.attendance.lateDays, ''],
      ['残業日数', salary.attendance.overtimeDays, ''],
      [],
      ['労働時間'],
      ['通常労働時間', '', salary.hours.regularHours],
      ['残業時間', '', salary.hours.overtimeHours],
      ['深夜労働時間', '', salary.hours.nightHours],
      ['休日労働時間', '', salary.hours.holidayHours],
      ['総労働時間', '', salary.hours.totalHours],
      [],
      ['給与計算'],
      ['項目', '金額'],
      ['基本給', salary.amounts.baseSalary],
      ['残業手当', salary.amounts.overtimePay],
      ['深夜手当', salary.amounts.nightPay],
      ['休日手当', salary.amounts.holidayPay],
      ['諸手当', salary.amounts.allowances],
      ['支給総額', salary.amounts.totalGross],
      ['控除額', salary.amounts.deductions],
      ['差引支給額', salary.amounts.totalNet]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    XLSX.utils.book_append_sheet(workbook, worksheet, '給与明細')
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    saveAs(data, `給与明細_${salary.employee.name}_${salary.period.year}年${salary.period.month}月.xlsx`)
  }

  const handleExportAll = () => {
    const workbook = XLSX.utils.book_new()
    
    const summaryData = [
      ['給与一覧', '', '', '', '', '', '', '', ''],
      ['期間', `${selectedPeriod.year}年${selectedPeriod.month}月`],
      [],
      ['氏名', '雇用形態', '出勤日数', '総労働時間', '残業時間', '基本給', '残業手当', '支給総額', '差引支給額']
    ]
    
    filteredSalaryData.forEach(salary => {
      summaryData.push([
        salary.employee.name,
        salary.employee.employmentType,
        salary.attendance.workDays,
        salary.hours.totalHours,
        salary.hours.overtimeHours,
        salary.amounts.baseSalary,
        salary.amounts.overtimePay,
        salary.amounts.totalGross,
        salary.amounts.totalNet
      ])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, worksheet, '給与一覧')
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    saveAs(data, `給与一覧_${selectedPeriod.year}年${selectedPeriod.month}月.xlsx`)
  }

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
          <span className="ml-3 text-gray-600">読み込み中...</span>
        </div>
      </Layout>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <BanknotesIcon className="h-8 w-8 mr-3" />
                給与計算
              </h1>
              <p className="text-green-100 mt-1">
                従業員の勤務時間と給与を計算・管理します
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchSalaryData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
              >
                <ClockIcon className="h-5 w-5 mr-2" />
                {loading ? '計算中...' : '再計算'}
              </button>
              <button
                onClick={handleExportAll}
                disabled={loading || filteredSalaryData.length === 0}
                className="bg-white hover:bg-gray-50 disabled:bg-gray-100 text-green-600 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                一括エクスポート
              </button>
            </div>
          </div>
        </div>

        {/* Period Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CalendarIcon className="h-6 w-6 text-gray-400" />
              <div>
                <label className="block text-sm font-medium text-gray-700">対象期間</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedPeriod.year}
                    onChange={(e) => setSelectedPeriod({...selectedPeriod, year: parseInt(e.target.value)})}
                    className="mt-1 block border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    disabled={loading}
                  >
                    <option value={2024}>2024年</option>
                    <option value={2023}>2023年</option>
                  </select>
                  <select
                    value={selectedPeriod.month}
                    onChange={(e) => setSelectedPeriod({...selectedPeriod, month: parseInt(e.target.value)})}
                    className="mt-1 block border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    disabled={loading}
                  >
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}月</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-md ml-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="従業員名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {!error && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-blue-50">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">総従業員数</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalEmployees}人</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-green-50">
                    <BanknotesIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">総支給額</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summary.totalGross.toLocaleString()}円
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-yellow-50">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">総労働時間</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summary.totalHours}時間
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-purple-50">
                    <CheckIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">承認済み</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summary.approvedCount}件
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Salary Table */}
        {!error && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            {filteredSalaryData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>従業員</th>
                      <th>出勤日数</th>
                      <th>労働時間</th>
                      <th>基本給</th>
                      <th>残業代</th>
                      <th>支給総額</th>
                      <th>ステータス</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSalaryData.map((salary) => (
                      <tr key={salary.id}>
                        <td>
                          <div>
                            <div className="font-medium text-gray-900">{salary.employee.name}</div>
                            <div className="text-sm text-gray-500">{salary.employee.employmentType}</div>
                          </div>
                        </td>
                        <td>{salary.attendance.workDays}日</td>
                        <td>
                          <div>
                            <div className="text-sm font-medium">{salary.hours.totalHours}h</div>
                            <div className="text-xs text-gray-500">残業: {salary.hours.overtimeHours}h</div>
                          </div>
                        </td>
                        <td>{salary.amounts.baseSalary.toLocaleString()}円</td>
                        <td>{salary.amounts.overtimePay.toLocaleString()}円</td>
                        <td>
                          <div>
                            <div className="font-medium">{salary.amounts.totalNet.toLocaleString()}円</div>
                            <div className="text-xs text-gray-500">総額: {salary.amounts.totalGross.toLocaleString()}円</div>
                          </div>
                        </td>
                        <td>{getStatusBadge(salary.status)}</td>
                        <td>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(salary)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="詳細表示"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleExportIndividual(salary)}
                              className="text-green-600 hover:text-green-800 text-sm"
                              title="Excel出力"
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
            ) : (
              <div className="text-center py-12">
                <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">給与データがありません</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedPeriod.year}年{selectedPeriod.month}月の給与データが見つかりません。
                </p>
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedEmployee && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedEmployee.employee.name} - 給与詳細
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">閉じる</span>
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">勤怠情報</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">出勤日数:</span>
                      <span>{selectedEmployee.attendance.workDays}日</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">欠勤日数:</span>
                      <span>{selectedEmployee.attendance.absentDays}日</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">遅刻日数:</span>
                      <span>{selectedEmployee.attendance.lateDays}日</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">残業日数:</span>
                      <span>{selectedEmployee.attendance.overtimeDays}日</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">労働時間</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">通常時間:</span>
                      <span>{selectedEmployee.hours.regularHours}時間</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">残業時間:</span>
                      <span>{selectedEmployee.hours.overtimeHours}時間</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">深夜時間:</span>
                      <span>{selectedEmployee.hours.nightHours}時間</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">休日時間:</span>
                      <span>{selectedEmployee.hours.holidayHours}時間</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-900">総時間:</span>
                      <span>{selectedEmployee.hours.totalHours}時間</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3">給与詳細</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">基本給:</span>
                      <span>{selectedEmployee.amounts.baseSalary.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">残業手当:</span>
                      <span>{selectedEmployee.amounts.overtimePay.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">深夜手当:</span>
                      <span>{selectedEmployee.amounts.nightPay.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">休日手当:</span>
                      <span>{selectedEmployee.amounts.holidayPay.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">諸手当:</span>
                      <span>{selectedEmployee.amounts.allowances.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">控除額:</span>
                      <span className="text-red-600">-{selectedEmployee.amounts.deductions.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between font-medium text-base border-t pt-2">
                      <span className="text-gray-900">支給総額:</span>
                      <span className="text-green-600">{selectedEmployee.amounts.totalGross.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t pt-2">
                      <span className="text-gray-900">差引支給額:</span>
                      <span className="text-green-700">{selectedEmployee.amounts.totalNet.toLocaleString()}円</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleExportIndividual(selectedEmployee)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Excel出力
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}