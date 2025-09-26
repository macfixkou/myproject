'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
  CheckIcon
} from '@heroicons/react/24/outline'

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  position: string
  department: string
  companyId: string
  hireDate: string
  status: 'ACTIVE' | 'INACTIVE'
  currentSite?: string
  workHoursThisMonth: number
  overtimeHours: number
  lastPunchIn?: string
  hourlyWage?: number
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  createdAt: string
  updatedAt: string
}

interface EmployeeFormData {
  name: string
  email: string
  phone: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  position: string
  department: string
  hireDate: string
  status: 'ACTIVE' | 'INACTIVE'
  currentSite: string
  hourlyWage: number
  address: string
  emergencyContact: string
  emergencyPhone: string
}

export default function EmployeesPage() {
  const { data: session } = useSession()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
    position: '',
    department: '施工部',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    currentSite: '',
    hourlyWage: 1500,
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  })

  // Mock employees data
  const mockEmployees: Employee[] = [
    {
      id: '1',
      name: '田中太郎',
      email: 'tanaka@construction.com',
      phone: '090-1234-5678',
      role: 'MANAGER',
      position: '現場監督',
      department: '施工部',
      companyId: 'company-1',
      hireDate: '2022-04-01',
      status: 'ACTIVE',
      currentSite: '新宿オフィスビル建設現場',
      workHoursThisMonth: 168,
      overtimeHours: 12,
      lastPunchIn: '2024-09-24T08:00:00Z',
      createdAt: '2022-04-01T00:00:00Z',
      updatedAt: '2024-09-24T08:00:00Z'
    },
    {
      id: '2',
      name: '佐藤花子',
      email: 'sato@construction.com',
      phone: '080-9876-5432',
      role: 'EMPLOYEE',
      position: '作業員',
      department: '施工部',
      companyId: 'company-1',
      hireDate: '2023-01-15',
      status: 'ACTIVE',
      currentSite: '渋谷マンション改修工事',
      workHoursThisMonth: 162,
      overtimeHours: 8,
      lastPunchIn: '2024-09-24T08:30:00Z',
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2024-09-24T08:30:00Z'
    },
    {
      id: '3',
      name: '山田次郎',
      email: 'yamada@construction.com',
      phone: '070-1111-2222',
      role: 'EMPLOYEE',
      position: '技能工',
      department: '施工部',
      companyId: 'company-1',
      hireDate: '2021-08-10',
      status: 'ACTIVE',
      currentSite: '新宿オフィスビル建設現場',
      workHoursThisMonth: 175,
      overtimeHours: 15,
      lastPunchIn: '2024-09-24T07:45:00Z',
      createdAt: '2021-08-10T00:00:00Z',
      updatedAt: '2024-09-24T07:45:00Z'
    },
    {
      id: '4',
      name: '鈴木一郎',
      email: 'suzuki@construction.com',
      phone: '090-3333-4444',
      role: 'EMPLOYEE',
      position: '作業員',
      department: '施工部',
      companyId: 'company-1',
      hireDate: '2023-06-01',
      status: 'INACTIVE',
      workHoursThisMonth: 0,
      overtimeHours: 0,
      createdAt: '2023-06-01T00:00:00Z',
      updatedAt: '2024-08-15T00:00:00Z'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEmployees(mockEmployees)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || employee.role === filterRole
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return '管理者'
      case 'MANAGER': return 'マネージャー'
      case 'EMPLOYEE': return '従業員'
      default: return role
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">有効</span>
      case 'INACTIVE':
        return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">無効</span>
      default:
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">{status}</span>
    }
  }

  const getOvertimeWarning = (overtimeHours: number) => {
    if (overtimeHours > 36) {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" title="36時間協定違反の可能性" />
    } else if (overtimeHours > 30) {
      return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" title="残業時間が多いです" />
    }
    return null
  }

  const handleCreateEmployee = () => {
    setSelectedEmployee(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'EMPLOYEE',
      position: '',
      department: '施工部',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      currentSite: '',
      hourlyWage: 1500,
      address: '',
      emergencyContact: '',
      emergencyPhone: ''
    })
    setShowCreateModal(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      position: employee.position,
      department: employee.department,
      hireDate: employee.hireDate,
      status: employee.status,
      currentSite: employee.currentSite || '',
      hourlyWage: employee.hourlyWage || 1500,
      address: employee.address || '',
      emergencyContact: employee.emergencyContact || '',
      emergencyPhone: employee.emergencyPhone || ''
    })
    setShowCreateModal(true)
  }

  const handleDeleteEmployee = (employee: Employee) => {
    if (confirm(`${employee.name}さんを削除してもよろしいですか？`)) {
      setEmployees(employees.filter(e => e.id !== employee.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // バリデーション
      if (!formData.name || !formData.email || !formData.phone) {
        alert('必須項目を入力してください。')
        return
      }

      // メールアドレスの重複チェック（編集時は自分自身を除外）
      const duplicateEmail = employees.find(emp => 
        emp.email === formData.email && emp.id !== selectedEmployee?.id
      )
      if (duplicateEmail) {
        alert('このメールアドレスは既に登録されています。')
        return
      }

      if (selectedEmployee) {
        // 編集の場合
        const updatedEmployee: Employee = {
          ...selectedEmployee,
          ...formData,
          updatedAt: new Date().toISOString()
        }
        setEmployees(employees.map(emp => 
          emp.id === selectedEmployee.id ? updatedEmployee : emp
        ))
      } else {
        // 新規作成の場合
        const newEmployee: Employee = {
          id: Date.now().toString(),
          ...formData,
          companyId: 'company-1',
          workHoursThisMonth: 0,
          overtimeHours: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setEmployees([...employees, newEmployee])
      }

      setShowCreateModal(false)
      // TODO: API call to save to database
    } catch (error) {
      console.error('Employee save error:', error)
      alert('保存中にエラーが発生しました。')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="loading-spinner w-8 h-8"></div>
          <span className="ml-3 text-gray-600">読み込み中...</span>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">従業員管理</h1>
            <p className="mt-2 text-sm text-gray-700">
              会社の従業員情報と勤怠状況を管理します。
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={handleCreateEmployee}
              className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              <PlusIcon className="h-4 w-4 inline mr-2" />
              従業員追加
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">総従業員数</dt>
                    <dd className="text-lg font-medium text-gray-900">{employees.length}人</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">有効従業員</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {employees.filter(e => e.status === 'ACTIVE').length}人
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">今月総労働時間</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {employees.reduce((sum, e) => sum + e.workHoursThisMonth, 0)}時間
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">残業警告</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {employees.filter(e => e.overtimeHours > 30).length}人
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              検索
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="名前、メール、役職で検索..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700">
              役職
            </label>
            <select
              id="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">すべて</option>
              <option value="ADMIN">管理者</option>
              <option value="MANAGER">マネージャー</option>
              <option value="EMPLOYEE">従業員</option>
            </select>
          </div>

          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
              ステータス
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">すべて</option>
              <option value="ACTIVE">有効</option>
              <option value="INACTIVE">無効</option>
            </select>
          </div>
        </div>

        {/* Employees Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        従業員
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        役職・部署
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        現在の現場
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        今月労働時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {employee.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <EnvelopeIcon className="h-4 w-4 mr-1" />
                                {employee.email}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                {employee.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.position}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                            {employee.department}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getRoleDisplayName(employee.role)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {employee.currentSite || '未配置'}
                          </div>
                          {employee.lastPunchIn && (
                            <div className="text-sm text-gray-500">
                              最終出勤: {new Date(employee.lastPunchIn).toLocaleDateString('ja-JP')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {employee.workHoursThisMonth}時間
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            残業: {employee.overtimeHours}時間
                            {getOvertimeWarning(employee.overtimeHours)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(employee.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="text-primary-600 hover:text-primary-500"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee)}
                              className="text-red-600 hover:text-red-500"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* ヘッダー */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  {selectedEmployee ? '従業員編集' : '従業員追加'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* フォーム */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 基本情報 */}
                  <div className="md:col-span-2">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <UserCircleIcon className="h-5 w-5 mr-2" />
                      基本情報
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      氏名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: 田中太郎"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: tanaka@construction.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      電話番号 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: 090-1234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      住所
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: 東京都新宿区西新宿1-1-1"
                    />
                  </div>

                  {/* 勤務情報 */}
                  <div className="md:col-span-2 mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                      勤務情報
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      役職 <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value as 'ADMIN' | 'MANAGER' | 'EMPLOYEE')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="EMPLOYEE">従業員</option>
                      <option value="MANAGER">マネージャー</option>
                      <option value="ADMIN">管理者</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      職種
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: 現場監督、作業員、技能工"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      部署
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="施工部">施工部</option>
                      <option value="管理部">管理部</option>
                      <option value="営業部">営業部</option>
                      <option value="設計部">設計部</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      入社日 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.hireDate}
                      onChange={(e) => handleInputChange('hireDate', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      配置現場
                    </label>
                    <select
                      value={formData.currentSite}
                      onChange={(e) => handleInputChange('currentSite', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">未配置</option>
                      <option value="新宿オフィスビル建設現場">新宿オフィスビル建設現場</option>
                      <option value="渋谷マンション改修工事">渋谷マンション改修工事</option>
                      <option value="品川駅前商業施設建設">品川駅前商業施設建設</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      時給（円）
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formData.hourlyWage}
                      onChange={(e) => handleInputChange('hourlyWage', Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ステータス
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ACTIVE">有効</option>
                      <option value="INACTIVE">無効</option>
                    </select>
                  </div>

                  {/* 緊急連絡先 */}
                  <div className="md:col-span-2 mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <PhoneIcon className="h-5 w-5 mr-2" />
                      緊急連絡先
                    </h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      緊急連絡先氏名
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: 田中花子（配偶者）"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      緊急連絡先電話番号
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: 090-9876-5432"
                    />
                  </div>
                </div>

                {/* ボタン */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        保存中...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        {selectedEmployee ? '更新' : '作成'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}