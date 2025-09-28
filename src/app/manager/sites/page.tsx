'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import {
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

interface Site {
  id: string
  name: string
  address: string
  description: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  startDate: string
  endDate?: string
  manager: string
  employeeCount: number
  workingHoursToday: number
  latitude: number
  longitude: number
  geofenceRadius: number
  createdAt: string
  updatedAt: string
}

interface SiteStats {
  totalEmployees: number
  activeEmployees: number
  todayHours: number
  weeklyHours: number
  completionRate: number
}

export default function ManagerSitesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // 管理現場を取得
  const fetchManagerSites = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        manager: 'true'
      })
      
      if (selectedStatus !== 'ALL') {
        params.append('status', selectedStatus)
      }
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/sites?${params}`)
      const data = await response.json()
      
      if (data.success || data.data || data.sites) {
        // APIレスポンスの形式に対応
        const sitesData = data.data || data.sites || []
        setSites(sitesData)
      } else {
        console.error('Failed to fetch manager sites:', data.error)
        setSites([])
      }
    } catch (error) {
      console.error('Error fetching manager sites:', error)
      setSites([])
    } finally {
      setLoading(false)
    }
  }

  // 現場詳細を取得
  const fetchSiteDetails = async (siteId: string) => {
    try {
      const response = await fetch(`/api/sites/${siteId}`)
      const data = await response.json()
      
      if (data.success && data.site) {
        setSelectedSite(data.site)
        setShowDetails(true)
      } else {
        console.error('Failed to fetch site details:', data.error)
      }
    } catch (error) {
      console.error('Error fetching site details:', error)
    }
  }

  // 現場ステータス更新
  const updateSiteStatus = async (siteId: string, status: string) => {
    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      const data = await response.json()
      if (data.success) {
        // サイトリストを更新
        setSites(prev => 
          prev.map(site => 
            site.id === siteId 
              ? { ...site, status: status as any }
              : site
          )
        )
      } else {
        alert('ステータス更新に失敗しました: ' + data.error)
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('ステータス更新中にエラーが発生しました')
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session?.user?.role !== 'MANAGER' && session?.user?.role !== 'ADMIN') {
      router.push('/home')
      return
    }

    fetchManagerSites()
  }, [session, status, router, selectedStatus, searchQuery])

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
          <span className="ml-3 text-gray-600">データを読み込み中...</span>
        </div>
      </Layout>
    )
  }

  const filteredSites = sites.filter(site => {
    if (selectedStatus !== 'ALL' && site.status !== selectedStatus) return false
    if (searchQuery && !site.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // 統計情報の計算
  const stats = {
    total: filteredSites.length,
    active: filteredSites.filter(s => s.status === 'ACTIVE').length,
    paused: filteredSites.filter(s => s.status === 'PAUSED').length,
    completed: filteredSites.filter(s => s.status === 'COMPLETED').length,
    totalEmployees: filteredSites.reduce((sum, s) => sum + s.employeeCount, 0),
    todayHours: filteredSites.reduce((sum, s) => sum + s.workingHoursToday, 0),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '稼働中'
      case 'PAUSED': return '休工'
      case 'COMPLETED': return '完了'
      default: return status
    }
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">現場管理</h1>
              <p className="text-gray-600 mt-1">
                担当している建設現場の状況を管理
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/manager/sites/new')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                現場登録
              </button>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">総現場数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <MapPinIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">稼働中</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">休工</p>
                <p className="text-2xl font-bold text-gray-900">{stats.paused}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">完了</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">総作業員</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">今日の稼働</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayHours}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">すべて</option>
                <option value="ACTIVE">稼働中</option>
                <option value="PAUSED">休工</option>
                <option value="COMPLETED">完了</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <input
                type="text"
                placeholder="現場名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchManagerSites}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                検索
              </button>
            </div>
          </div>
        </div>

        {/* 現場一覧 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <div key={site.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {site.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {site.address}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {site.description}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(site.status)}`}>
                    {getStatusText(site.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      作業員: {site.employeeCount}名
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      今日: {site.workingHoursToday}h
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      開始: {new Date(site.startDate).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  {site.endDate && (
                    <div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        終了: {new Date(site.endDate).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {site.status === 'ACTIVE' && (
                        <button
                          onClick={() => updateSiteStatus(site.id, 'PAUSED')}
                          className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        >
                          休工
                        </button>
                      )}
                      {site.status === 'PAUSED' && (
                        <button
                          onClick={() => updateSiteStatus(site.id, 'ACTIVE')}
                          className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          再開
                        </button>
                      )}
                      {site.status !== 'COMPLETED' && (
                        <button
                          onClick={() => updateSiteStatus(site.id, 'COMPLETED')}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                        >
                          完了
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fetchSiteDetails(site.id)}
                        className="text-blue-600 hover:text-blue-700"
                        title="詳細表示"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/manager/sites/${site.id}/edit`)}
                        className="text-green-600 hover:text-green-700"
                        title="編集"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/manager/sites/${site.id}/attendance`)}
                        className="text-purple-600 hover:text-purple-700"
                        title="勤怠確認"
                      >
                        <ChartBarIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredSites.length === 0 && (
            <div className="col-span-full">
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">該当する現場がありません</p>
                <button
                  onClick={() => router.push('/manager/sites/new')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  新しい現場を登録
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 現場詳細モーダル */}
        {showDetails && selectedSite && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">現場詳細</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">現場名</label>
                        <p className="text-gray-900">{selectedSite.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">住所</label>
                        <p className="text-gray-900">{selectedSite.address}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">説明</label>
                        <p className="text-gray-900">{selectedSite.description}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">担当者</label>
                        <p className="text-gray-900">{selectedSite.manager}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">ステータス</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSite.status)}`}>
                          {getStatusText(selectedSite.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">工期・稼働状況</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">開始日</label>
                        <p className="text-gray-900">{new Date(selectedSite.startDate).toLocaleDateString('ja-JP')}</p>
                      </div>
                      {selectedSite.endDate && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">終了日</label>
                          <p className="text-gray-900">{new Date(selectedSite.endDate).toLocaleDateString('ja-JP')}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-700">作業員数</label>
                        <p className="text-gray-900">{selectedSite.employeeCount}名</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">今日の稼働時間</label>
                        <p className="text-gray-900">{selectedSite.workingHoursToday}時間</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">ジオフェンス半径</label>
                        <p className="text-gray-900">{selectedSite.geofenceRadius}m</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}