'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import {
  MapPinIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ClockIcon,
  HomeIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface Site {
  id: string
  name: string
  address: string
  description: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  startDate: string
  endDate?: string
  manager: string
  employeeCount: number
  workingHoursToday: number
  latitude?: number
  longitude?: number
  geofenceRadius?: number
  contactPerson?: string
  contactPhone?: string
  safetyNotes?: string
  createdAt: string
  updatedAt: string
}

interface SiteFormData {
  name: string
  address: string
  description: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  startDate: string
  endDate: string
  manager: string
  latitude: number
  longitude: number
  geofenceRadius: number
  contactPerson: string
  contactPhone: string
  safetyNotes: string
}

export default function AdminSitesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<SiteFormData>({
    name: '',
    address: '',
    description: '',
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    manager: '',
    latitude: 35.6896,
    longitude: 139.6917,
    geofenceRadius: 100,
    contactPerson: '',
    contactPhone: '',
    safetyNotes: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
    if (status === 'authenticated' && session?.user?.role === 'EMPLOYEE') {
      redirect('/home')
    }
  }, [status, session])

  // Mock sites data
  const mockSites: Site[] = [
    {
      id: '1',
      name: '新宿オフィスビル建設現場',
      address: '東京都新宿区西新宿1-1-1',
      description: '地上20階建てオフィスビルの新築工事',
      status: 'ACTIVE',
      startDate: '2024-03-01',
      endDate: '2025-12-31',
      manager: '田中太郎',
      employeeCount: 15,
      workingHoursToday: 120,
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-09-26T00:00:00Z'
    },
    {
      id: '2',
      name: '渋谷マンション改修工事',
      address: '東京都渋谷区渋谷2-2-2',
      description: '既存マンションの大規模改修工事',
      status: 'ACTIVE',
      startDate: '2024-06-01',
      endDate: '2024-11-30',
      manager: '佐藤花子',
      employeeCount: 8,
      workingHoursToday: 64,
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2024-09-26T00:00:00Z'
    },
    {
      id: '3',
      name: '品川駅前商業施設建設',
      address: '東京都港区港南3-3-3',
      description: '大型商業施設の建設工事',
      status: 'COMPLETED',
      startDate: '2023-04-01',
      endDate: '2024-08-31',
      manager: '山田次郎',
      employeeCount: 0,
      workingHoursToday: 0,
      createdAt: '2023-04-01T00:00:00Z',
      updatedAt: '2024-08-31T00:00:00Z'
    },
    {
      id: '4',
      name: '池袋住宅団地建設',
      address: '東京都豊島区池袋4-4-4',
      description: '集合住宅の新築工事',
      status: 'INACTIVE',
      startDate: '2024-10-01',
      manager: '鈴木一郎',
      employeeCount: 0,
      workingHoursToday: 0,
      createdAt: '2024-09-15T00:00:00Z',
      updatedAt: '2024-09-26T00:00:00Z'
    }
  ]

  useEffect(() => {
    // Simulate API call
    if (session?.user) {
      setTimeout(() => {
        setSites(mockSites)
        setLoading(false)
      }, 1000)
    }
  }, [session])

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
        return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">稼働中</span>
      case 'INACTIVE':
        return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">待機中</span>
      case 'COMPLETED':
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">完了</span>
      default:
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">{status}</span>
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '稼働中'
      case 'INACTIVE': return '待機中'
      case 'COMPLETED': return '完了'
      default: return status
    }
  }

  const handleCreateSite = () => {
    setSelectedSite(null)
    setFormData({
      name: '',
      address: '',
      description: '',
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      manager: '',
      latitude: 35.6896,
      longitude: 139.6917,
      geofenceRadius: 100,
      contactPerson: '',
      contactPhone: '',
      safetyNotes: ''
    })
    setShowCreateModal(true)
  }

  const handleEditSite = (site: Site) => {
    setSelectedSite(site)
    setFormData({
      name: site.name,
      address: site.address,
      description: site.description,
      status: site.status,
      startDate: site.startDate,
      endDate: site.endDate || '',
      manager: site.manager,
      latitude: site.latitude || 35.6896,
      longitude: site.longitude || 139.6917,
      geofenceRadius: site.geofenceRadius || 100,
      contactPerson: site.contactPerson || '',
      contactPhone: site.contactPhone || '',
      safetyNotes: site.safetyNotes || ''
    })
    setShowCreateModal(true)
  }

  const handleDeleteSite = (site: Site) => {
    if (confirm(`現場「${site.name}」を削除してもよろしいですか？`)) {
      setSites(sites.filter(s => s.id !== site.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // バリデーション
      if (!formData.name || !formData.address || !formData.manager) {
        alert('必須項目を入力してください。')
        return
      }

      // 現場名の重複チェック（編集時は自分自身を除外）
      const duplicateName = sites.find(site => 
        site.name === formData.name && site.id !== selectedSite?.id
      )
      if (duplicateName) {
        alert('この現場名は既に登録されています。')
        return
      }

      if (selectedSite) {
        // 編集の場合
        const updatedSite: Site = {
          ...selectedSite,
          ...formData,
          employeeCount: selectedSite.employeeCount,
          workingHoursToday: selectedSite.workingHoursToday,
          updatedAt: new Date().toISOString()
        }
        setSites(sites.map(site => 
          site.id === selectedSite.id ? updatedSite : site
        ))
      } else {
        // 新規作成の場合
        const newSite: Site = {
          id: Date.now().toString(),
          ...formData,
          employeeCount: 0,
          workingHoursToday: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setSites([...sites, newSite])
      }

      setShowCreateModal(false)
      // TODO: API call to save to database
    } catch (error) {
      console.error('Site save error:', error)
      alert('保存中にエラーが発生しました。')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof SiteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGoHome = () => {
    router.push('/home')
  }

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
          <span className="ml-3 text-gray-600">現場データを読み込み中...</span>
        </div>
      </Layout>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <Layout>
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
              <MapPinIcon className="h-8 w-8 mr-3" />
              現場管理
            </h1>
            <p className="text-blue-100 mt-1">
              建設現場の情報と作業員配置を管理します
            </p>
          </div>
          <div className="hidden sm:block">
            <button
              onClick={handleCreateSite}
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              現場追加
            </button>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-50 shadow-sm">
                <BuildingOfficeIcon className="h-7 w-7 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">総現場数</p>
                <p className="text-3xl font-bold text-gray-900">{sites.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-50 shadow-sm">
                <MapPinIcon className="h-7 w-7 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">稼働中現場</p>
                <p className="text-3xl font-bold text-gray-900">
                  {sites.filter(s => s.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-50 shadow-sm">
                <UsersIcon className="h-7 w-7 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">配置作業員</p>
                <p className="text-3xl font-bold text-gray-900">
                  {sites.reduce((sum, site) => sum + site.employeeCount, 0)}人
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-orange-50 shadow-sm">
                <ClockIcon className="h-7 w-7 text-orange-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">本日労働時間</p>
                <p className="text-3xl font-bold text-gray-900">
                  {sites.reduce((sum, site) => sum + site.workingHoursToday, 0)}h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 検索とフィルター */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="現場名、住所、管理者で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべてのステータス</option>
              <option value="ACTIVE">稼働中</option>
              <option value="INACTIVE">待機中</option>
              <option value="COMPLETED">完了</option>
            </select>
          </div>
          <div className="sm:hidden w-full">
            <button
              onClick={handleCreateSite}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              現場追加
            </button>
          </div>
        </div>

        {/* 現場一覧 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  現場情報
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  住所
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  管理者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作業員数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  期間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSites.map((site) => (
                <tr key={site.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{site.name}</div>
                      <div className="text-sm text-gray-500">{site.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{site.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{site.manager}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{site.employeeCount}人</div>
                    <div className="text-sm text-gray-500">本日: {site.workingHoursToday}h</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(site.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      開始: {new Date(site.startDate).toLocaleDateString('ja-JP')}
                    </div>
                    {site.endDate && (
                      <div className="text-sm text-gray-500">
                        終了: {new Date(site.endDate).toLocaleDateString('ja-JP')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSite(site)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSite(site)}
                        className="text-red-600 hover:text-red-900"
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

        {filteredSites.length === 0 && (
          <div className="text-center py-12">
            <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">現場が見つかりません</h3>
            <p className="mt-1 text-sm text-gray-500">
              検索条件を変更して再度お試しください。
            </p>
          </div>
        )}
      </div>

      {/* 作成/編集モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* ヘッダー */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                {selectedSite ? '現場編集' : '現場追加'}
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
                    <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                    基本情報
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    現場名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 新宿オフィスビル建設現場"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    管理者 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manager}
                    onChange={(e) => handleInputChange('manager', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 田中太郎"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    住所 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 東京都新宿区西新宿1-1-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    現場概要
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 地上20階建てオフィスビルの新築工事"
                  />
                </div>

                {/* 工期・ステータス */}
                <div className="md:col-span-2 mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    工期・ステータス
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    開始日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    終了予定日
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ステータス
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'ACTIVE' | 'INACTIVE' | 'COMPLETED')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">稼働中</option>
                    <option value="INACTIVE">待機中</option>
                    <option value="COMPLETED">完了</option>
                  </select>
                </div>

                {/* GPS・ジオフェンス */}
                <div className="md:col-span-2 mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    GPS・ジオフェンス設定
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    緯度
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="35.6896"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    経度
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="139.6917"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ジオフェンス半径（メートル）
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={formData.geofenceRadius}
                    onChange={(e) => handleInputChange('geofenceRadius', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>

                {/* 連絡先・安全情報 */}
                <div className="md:col-span-2 mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2" />
                    連絡先・安全情報
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    現場連絡責任者
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 鈴木一郎"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    現場連絡先
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 080-1234-5678"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    安全注意事項
                  </label>
                  <textarea
                    rows={3}
                    value={formData.safetyNotes}
                    onChange={(e) => handleInputChange('safetyNotes', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: ヘルメット着用必須、高所作業時はハーネス装着"
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
                      {selectedSite ? '更新' : '作成'}
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