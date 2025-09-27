'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  position: string
  department: string
  hireDate: string
  status: 'ACTIVE' | 'INACTIVE'
  currentSite?: string
  workHoursThisMonth: number
  overtimeHours: number
  lastPunchIn?: string
  hourlyWage: number
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export default function EmployeesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedRole, setSelectedRole] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGoHome = () => {
    router.push('/home')
  }

  // サンプル従業員データ
  const sampleEmployees: Employee[] = [
    {
      id: '1',
      name: '管理者太郎',
      email: 'admin@example.com',
      phone: '090-1234-5678',
      role: 'ADMIN',
      position: '管理者',
      department: '管理部',
      hireDate: '2020-04-01',
      status: 'ACTIVE',
      currentSite: 'オフィス',
      workHoursThisMonth: 160,
      overtimeHours: 20,
      lastPunchIn: '2024-09-27 09:00',
      hourlyWage: 3000,
      address: '東京都千代田区1-1-1',
      emergencyContact: '管理者花子',
      emergencyPhone: '090-9876-5432'
    },
    {
      id: '2',
      name: '作業員花子',
      email: 'employee1@example.com',
      phone: '090-2345-6789',
      role: 'EMPLOYEE',
      position: '作業員',
      department: '建設部',
      hireDate: '2022-06-15',
      status: 'ACTIVE',
      currentSite: '新宿オフィスビル建設現場',
      workHoursThisMonth: 180,
      overtimeHours: 25,
      lastPunchIn: '2024-09-27 08:30',
      hourlyWage: 1800,
      address: '東京都新宿区2-2-2',
      emergencyContact: '作業員太郎',
      emergencyPhone: '090-8765-4321'
    },
    {
      id: '3',
      name: '作業員次郎',
      email: 'employee2@example.com',
      phone: '090-3456-7890',
      role: 'EMPLOYEE',
      position: '作業員',
      department: '建設部',
      hireDate: '2023-01-10',
      status: 'ACTIVE',
      currentSite: '渋谷マンション改修工事',
      workHoursThisMonth: 175,
      overtimeHours: 15,
      lastPunchIn: '2024-09-27 08:45',
      hourlyWage: 1600,
      address: '東京都渋谷区3-3-3',
      emergencyContact: '作業員三郎',
      emergencyPhone: '090-7654-3210'
    },
    {
      id: '4',
      name: '現場監督山田',
      email: 'manager@example.com',
      phone: '090-4567-8901',
      role: 'MANAGER',
      position: '現場監督',
      department: '建設部',
      hireDate: '2019-08-20',
      status: 'ACTIVE',
      currentSite: '新宿オフィスビル建設現場',
      workHoursThisMonth: 170,
      overtimeHours: 30,
      lastPunchIn: '2024-09-27 07:30',
      hourlyWage: 2500,
      address: '東京都港区4-4-4',
      emergencyContact: '現場監督佐藤',
      emergencyPhone: '090-6543-2109'
    }
  ]

  // フィルタリング
  const filteredEmployees = sampleEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment
    const matchesRole = selectedRole === 'all' || employee.role === selectedRole
    
    return matchesSearch && matchesDepartment && matchesRole
  })

  const departments = ['all', ...Array.from(new Set(sampleEmployees.map(emp => emp.department)))]
  const roles = ['all', 'ADMIN', 'MANAGER', 'EMPLOYEE']

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return '管理者'
      case 'MANAGER': return 'マネージャー'
      case 'EMPLOYEE': return '従業員'
      default: return role
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800'
      case 'MANAGER': return 'bg-blue-100 text-blue-800'
      case 'EMPLOYEE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!mounted || status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">従業員データを読み込み中...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600">認証が必要です</p>
        </div>
      </Layout>
    )
  }

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600">このページにアクセスする権限がありません</p>
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
            
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              新規従業員追加
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 rounded-lg mb-8">
            <div className="flex items-center">
              <UsersIcon className="h-10 w-10 text-white mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-white">従業員管理</h1>
                <p className="text-blue-100 mt-2 text-lg">
                  従業員の情報・勤務状況を管理します
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{sampleEmployees.length}</p>
                <p className="text-gray-600">総従業員数</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <CheckIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {sampleEmployees.filter(emp => emp.status === 'ACTIVE').length}
                </p>
                <p className="text-gray-600">アクティブ</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(sampleEmployees.reduce((sum, emp) => sum + emp.workHoursThisMonth, 0) / sampleEmployees.length)}
                </p>
                <p className="text-gray-600">平均労働時間</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{departments.length - 1}</p>
                <p className="text-gray-600">部署数</p>
              </div>
            </div>
          </div>
        </div>

        {/* フィルターとツールバー */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="名前またはメールで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                部署
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? '全ての部署' : dept}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                役職
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === 'all' ? '全ての役職' : getRoleLabel(role)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedDepartment('all')
                  setSelectedRole('all')
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                リセット
              </button>
            </div>
          </div>
        </div>

        {/* 従業員リスト */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              従業員一覧 ({filteredEmployees.length}名)
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">従業員</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">役職・部署</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">現在の現場</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">今月の労働時間</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                          <div className="text-sm text-gray-500">{employee.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(employee.role)}`}>
                          {getRoleLabel(employee.role)}
                        </span>
                        <div className="text-sm text-gray-900 mt-1">{employee.position}</div>
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.currentSite || '未配属'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.workHoursThisMonth}時間</div>
                      <div className="text-sm text-gray-500">残業: {employee.overtimeHours}時間</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                        {employee.status === 'ACTIVE' ? 'アクティブ' : '非アクティブ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setShowDetailModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
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
                検索条件を変更するか、新しい従業員を追加してください。
              </p>
            </div>
          )}
        </div>

        {/* 従業員詳細モーダル */}
        {showDetailModal && selectedEmployee && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">従業員詳細</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">基本情報</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">氏名</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">メールアドレス</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">電話番号</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">住所</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.address}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">勤務情報</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">役職</label>
                      <p className="text-sm text-gray-900">{getRoleLabel(selectedEmployee.role)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">部署</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">入社日</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.hireDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">時給</label>
                      <p className="text-sm text-gray-900">¥{selectedEmployee.hourlyWage.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">緊急連絡先</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">緊急連絡先氏名</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.emergencyContact}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">緊急連絡先電話番号</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.emergencyPhone}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">勤務状況</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">今月の労働時間</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.workHoursThisMonth}時間</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">今月の残業時間</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.overtimeHours}時間</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">現在の現場</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.currentSite}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  閉じる
                </button>
                <button className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  編集
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新規追加モーダル */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">新規従業員追加</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="text-center py-8">
                <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">新規追加機能</h3>
                <p className="mt-1 text-sm text-gray-500">
                  この機能は現在開発中です。
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">💡 従業員追加機能は実装中です</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ユーザー情報 */}
        {session?.user && (
          <div className="mt-8 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              ✅ ログインユーザー: <strong>{session.user.name}</strong> ({session.user.role})
            </p>
            <p className="text-xs text-blue-600 mt-1">
              従業員管理システムが正常に動作しています。
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}