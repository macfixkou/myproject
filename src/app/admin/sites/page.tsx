'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Layout from '@/components/layout/Layout'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface Site {
  id: string
  name: string
  address: string
  description: string
  latitude: number
  longitude: number
  radius: number // geofence radius in meters
  manager: string
  managerPhone: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  startDate: string
  endDate: string
  companyId: string
  workHours: {
    start: string
    end: string
    breakStart: string
    breakEnd: string
  }
  activeEmployees: number
  totalWorkHours: number
  lastActivity: string
  createdAt: string
  updatedAt: string
}

export default function SitesPage() {
  const { data: session } = useSession()
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)

  // Mock sites data
  const mockSites: Site[] = [
    {
      id: '1',
      name: '新宿オフィスビル建設現場',
      address: '東京都新宿区新宿1-1-1',
      description: '地上20階建てオフィスビルの新築工事',
      latitude: 35.6896,
      longitude: 139.6993,
      radius: 50,
      manager: '田中太郎',
      managerPhone: '090-1234-5678',
      status: 'ACTIVE',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      companyId: 'company-1',
      workHours: {
        start: '08:00',
        end: '17:00',
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      activeEmployees: 15,
      totalWorkHours: 2840,
      lastActivity: '2024-09-24T08:00:00Z',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-09-24T08:00:00Z'
    },
    {
      id: '2',
      name: '渋谷マンション改修工事',
      address: '東京都渋谷区渋谷2-2-2',
      description: '築30年マンションの大規模修繕工事',
      latitude: 35.6580,
      longitude: 139.7016,
      radius: 30,
      manager: '佐藤花子',
      managerPhone: '080-9876-5432',
      status: 'ACTIVE',
      startDate: '2024-03-01',
      endDate: '2024-11-30',
      companyId: 'company-1',
      workHours: {
        start: '08:30',
        end: '16:30',
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      activeEmployees: 8,
      totalWorkHours: 1520,
      lastActivity: '2024-09-24T08:30:00Z',
      createdAt: '2024-02-20T00:00:00Z',
      updatedAt: '2024-09-24T08:30:00Z'
    },
    {
      id: '3',
      name: '品川駅前商業施設建設',
      address: '東京都港区港南1-1-1',
      description: '大型商業施設の新築工事',
      latitude: 35.6284,
      longitude: 139.7387,
      radius: 80,
      manager: '山田次郎',
      managerPhone: '070-1111-2222',
      status: 'COMPLETED',
      startDate: '2023-04-01',
      endDate: '2024-08-31',
      companyId: 'company-1',
      workHours: {
        start: '07:00',
        end: '16:00',
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      activeEmployees: 0,
      totalWorkHours: 12500,
      lastActivity: '2024-08-31T16:00:00Z',
      createdAt: '2023-03-15T00:00:00Z',
      updatedAt: '2024-08-31T16:00:00Z'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSites(mockSites)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.manager.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || site.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          稼働中
        </span>
      case 'INACTIVE':
        return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          停止中
        </span>
      case 'COMPLETED':
        return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          完了
        </span>
      default:
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">{status}</span>
    }
  }

  const getProgressPercentage = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()
    
    if (now < start) return 0
    if (now > end) return 100
    
    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.round((elapsed / total) * 100)
  }

  const handleCreateSite = () => {
    setSelectedSite(null)
    setShowCreateModal(true)
  }

  const handleEditSite = (site: Site) => {
    setSelectedSite(site)
    setShowCreateModal(true)
  }

  const handleDeleteSite = (site: Site) => {
    if (confirm(`現場「${site.name}」を削除してもよろしいですか？`)) {
      setSites(sites.filter(s => s.id !== site.id))
    }
  }

  const handleViewOnMap = (site: Site) => {
    // Open Google Maps with the site location
    const url = `https://www.google.com/maps?q=${site.latitude},${site.longitude}`
    window.open(url, '_blank')
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
            <h1 className="text-2xl font-semibold text-gray-900">現場管理</h1>
            <p className="mt-2 text-sm text-gray-700">
              建設現場の情報と進捗状況を管理します。GPS位置情報とジオフェンス設定も含まれます。
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={handleCreateSite}
              className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              <PlusIcon className="h-4 w-4 inline mr-2" />
              現場追加
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">総現場数</dt>
                    <dd className="text-lg font-medium text-gray-900">{sites.length}現場</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">稼働中現場</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {sites.filter(s => s.status === 'ACTIVE').length}現場
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
                  <UsersIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">総従業員数</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {sites.reduce((sum, s) => sum + s.activeEmployees, 0)}人
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
                  <ClockIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">総労働時間</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {sites.reduce((sum, s) => sum + s.totalWorkHours, 0).toLocaleString()}時間
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-2">
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
                placeholder="現場名、住所、責任者で検索..."
              />
            </div>
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
              <option value="ACTIVE">稼働中</option>
              <option value="INACTIVE">停止中</option>
              <option value="COMPLETED">完了</option>
            </select>
          </div>
        </div>

        {/* Sites Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredSites.map((site) => {
            const progress = getProgressPercentage(site.startDate, site.endDate)
            return (
              <div key={site.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{site.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{site.description}</p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(site.status)}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start mb-4">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{site.address}</p>
                      <p className="text-sm text-gray-500">
                        GPS: {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ジオフェンス半径: {site.radius}m
                      </p>
                    </div>
                  </div>

                  {/* Manager */}
                  <div className="flex items-center mb-4">
                    <UsersIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{site.manager}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <PhoneIcon className="h-3 w-3 mr-1" />
                        {site.managerPhone}
                      </p>
                    </div>
                  </div>

                  {/* Work Hours */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">勤務時間</p>
                      <p className="text-sm text-gray-600">
                        {site.workHours.start} - {site.workHours.end}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">休憩時間</p>
                      <p className="text-sm text-gray-600">
                        {site.workHours.breakStart} - {site.workHours.breakEnd}
                      </p>
                    </div>
                  </div>

                  {/* Project Timeline */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">工期進捗</p>
                      <p className="text-sm text-gray-600">{progress}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {new Date(site.startDate).toLocaleDateString('ja-JP')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(site.endDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{site.activeEmployees}</p>
                      <p className="text-xs text-gray-500">従業員数</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{site.totalWorkHours.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">総労働時間</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {site.lastActivity ? new Date(site.lastActivity).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) : '-'}
                      </p>
                      <p className="text-xs text-gray-500">最終活動</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleViewOnMap(site)}
                      className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                    >
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      地図で表示
                    </button>
                    
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => handleEditSite(site)}
                        className="text-sm text-primary-600 hover:text-primary-500"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSite(site)}
                        className="text-sm text-red-600 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredSites.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">現場がありません</h3>
            <p className="mt-1 text-sm text-gray-500">
              新しい建設現場を追加してください。
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreateSite}
                className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                現場追加
              </button>
            </div>
          </div>
        )}

        {/* Create/Edit Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedSite ? '現場編集' : '現場追加'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                詳細な現場管理フォームは今後実装予定です。GPS座標設定、ジオフェンス半径、勤務時間設定などが含まれます。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
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