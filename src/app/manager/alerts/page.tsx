'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface Alert {
  id: string
  kind: string
  level: 'CRITICAL' | 'WARNING' | 'INFO'
  title: string
  message: string
  user: {
    id: string
    name: string
    email: string
  }
  site: {
    id: string
    name: string
  } | null
  payload: any
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  createdAt: string
}

export default function ManagerAlertsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNRESOLVED' | 'RESOLVED'>('UNRESOLVED')
  const [searchQuery, setSearchQuery] = useState('')

  // アラートを取得
  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        manager: 'true'
      })
      
      if (filterLevel !== 'ALL') {
        params.append('level', filterLevel)
      }
      
      if (filterStatus !== 'ALL') {
        params.append('resolved', filterStatus === 'RESOLVED' ? 'true' : 'false')
      }
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/alerts?${params}`)
      const data = await response.json()
      
      if (data.success && data.alerts) {
        setAlerts(data.alerts)
      } else {
        console.error('Failed to fetch alerts:', data.error)
        // モックデータを表示
        setAlerts([
          {
            id: '1',
            kind: 'GEOFENCE_VIOLATION',
            level: 'WARNING',
            title: 'ジオフェンス外での打刻',
            message: '田中太郎さんが現場の指定範囲外で出勤打刻しました',
            user: { id: 'u1', name: '田中太郎', email: 'tanaka@company.com' },
            site: { id: 's1', name: '新宿オフィスビル建設現場' },
            payload: { distance: 150, accuracy: 20 },
            resolved: false,
            createdAt: '2024-09-28T08:35:00Z'
          },
          {
            id: '2',
            kind: 'OVERTIME_WARNING',
            level: 'CRITICAL',
            title: '長時間労働警告',
            message: '佐藤花子さんが10時間以上の連続労働をしています',
            user: { id: 'u2', name: '佐藤花子', email: 'sato@company.com' },
            site: { id: 's2', name: '渋谷マンション改修工事' },
            payload: { workedMinutes: 630, overtimeMinutes: 270 },
            resolved: false,
            createdAt: '2024-09-28T19:30:00Z'
          },
          {
            id: '3',
            kind: 'LATE_ARRIVAL',
            level: 'INFO',
            title: '遅刻通知',
            message: '鈴木次郎さんが30分遅刻しました',
            user: { id: 'u3', name: '鈴木次郎', email: 'suzuki@company.com' },
            site: { id: 's1', name: '新宿オフィスビル建設現場' },
            payload: { lateMins: 30 },
            resolved: true,
            resolvedAt: '2024-09-28T09:30:00Z',
            resolvedBy: 'manager',
            createdAt: '2024-09-28T09:00:00Z'
          },
          {
            id: '4',
            kind: 'MISSING_CLOCK_OUT',
            level: 'WARNING',
            title: '退勤打刻忘れ',
            message: '山田一郎さんの昨日の退勤打刻が記録されていません',
            user: { id: 'u4', name: '山田一郎', email: 'yamada@company.com' },
            site: { id: 's1', name: '新宿オフィスビル建設現場' },
            payload: { date: '2024-09-27' },
            resolved: false,
            createdAt: '2024-09-28T09:00:00Z'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  // アラート解決
  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          managerId: session?.user?.id
        })
      })

      const data = await response.json()
      if (data.success) {
        // アラートを解決済みに更新
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId 
              ? { 
                  ...alert, 
                  resolved: true, 
                  resolvedAt: new Date().toISOString(),
                  resolvedBy: session?.user?.name || 'manager'
                }
              : alert
          )
        )
      } else {
        alert('アラート解決に失敗しました: ' + data.error)
      }
    } catch (error) {
      console.error('Alert resolution error:', error)
      alert('アラート解決中にエラーが発生しました')
    }
  }

  // 一括解決
  const resolveAllAlerts = async () => {
    const unresolvedAlerts = filteredAlerts.filter(alert => !alert.resolved)
    
    if (unresolvedAlerts.length === 0) {
      alert('解決可能なアラートがありません')
      return
    }

    if (!confirm(`${unresolvedAlerts.length}件のアラートをすべて解決しますか？`)) {
      return
    }

    try {
      const alertIds = unresolvedAlerts.map(alert => alert.id)
      const response = await fetch('/api/alerts/bulk-resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alertIds,
          managerId: session?.user?.id
        })
      })

      const data = await response.json()
      if (data.success) {
        // すべてのアラートを解決済みに更新
        setAlerts(prev => 
          prev.map(alert => 
            alertIds.includes(alert.id)
              ? { 
                  ...alert, 
                  resolved: true, 
                  resolvedAt: new Date().toISOString(),
                  resolvedBy: session?.user?.name || 'manager'
                }
              : alert
          )
        )
      } else {
        alert('一括解決に失敗しました: ' + data.error)
      }
    } catch (error) {
      console.error('Bulk resolution error:', error)
      alert('一括解決中にエラーが発生しました')
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

    fetchAlerts()
  }, [session, status, router, filterLevel, filterStatus, searchQuery])

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
          <span className="ml-3 text-gray-600">アラートを読み込み中...</span>
        </div>
      </Layout>
    )
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filterLevel !== 'ALL' && alert.level !== filterLevel) return false
    if (filterStatus === 'RESOLVED' && !alert.resolved) return false
    if (filterStatus === 'UNRESOLVED' && alert.resolved) return false
    if (searchQuery && !alert.user.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // 統計情報の計算
  const stats = {
    total: filteredAlerts.length,
    critical: filteredAlerts.filter(a => a.level === 'CRITICAL').length,
    warning: filteredAlerts.filter(a => a.level === 'WARNING').length,
    info: filteredAlerts.filter(a => a.level === 'INFO').length,
    unresolved: filteredAlerts.filter(a => !a.resolved).length,
    resolved: filteredAlerts.filter(a => a.resolved).length,
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200'
      case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'INFO': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL': return ExclamationTriangleIcon
      case 'WARNING': return ExclamationTriangleIcon
      case 'INFO': return InformationCircleIcon
      default: return InformationCircleIcon
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '緊急'
      case 'WARNING': return '警告'
      case 'INFO': return '情報'
      default: return level
    }
  }

  const getKindText = (kind: string) => {
    switch (kind) {
      case 'GEOFENCE_VIOLATION': return 'ジオフェンス外打刻'
      case 'OVERTIME_WARNING': return '長時間労働'
      case 'LATE_ARRIVAL': return '遅刻'
      case 'MISSING_CLOCK_OUT': return '退勤打刻忘れ'
      case 'EARLY_DEPARTURE': return '早退'
      default: return kind
    }
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">アラート管理</h1>
              <p className="text-gray-600 mt-1">
                チームメンバーに関する重要なアラートを管理
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {stats.unresolved > 0 && (
                <button
                  onClick={resolveAllAlerts}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  すべて解決 ({stats.unresolved})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">総アラート</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">緊急</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">警告</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">情報</p>
              <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">未解決</p>
              <p className="text-2xl font-bold text-orange-600">{stats.unresolved}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">解決済み</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FunnelIcon className="h-4 w-4 inline mr-1" />
                重要度
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">すべて</option>
                <option value="CRITICAL">緊急</option>
                <option value="WARNING">警告</option>
                <option value="INFO">情報</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">すべて</option>
                <option value="UNRESOLVED">未解決</option>
                <option value="RESOLVED">解決済み</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <input
                type="text"
                placeholder="従業員名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAlerts}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                検索
              </button>
            </div>
          </div>
        </div>

        {/* アラート一覧 */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const LevelIcon = getLevelIcon(alert.level)
            return (
              <div 
                key={alert.id} 
                className={`bg-white rounded-lg shadow-sm border-l-4 ${getLevelColor(alert.level)} ${alert.resolved ? 'opacity-75' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${getLevelColor(alert.level)}`}>
                        <LevelIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {alert.title}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(alert.level)}`}>
                            {getLevelText(alert.level)}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {getKindText(alert.kind)}
                          </span>
                          {alert.resolved && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                              解決済み
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3">{alert.message}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <strong>対象者:</strong> {alert.user.name} ({alert.user.email})
                          </div>
                          {alert.site && (
                            <div>
                              <strong>現場:</strong> {alert.site.name}
                            </div>
                          )}
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <strong>発生時刻:</strong> {new Date(alert.createdAt).toLocaleString('ja-JP')}
                          </div>
                          {alert.resolved && alert.resolvedAt && (
                            <div className="flex items-center">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              <strong>解決時刻:</strong> {new Date(alert.resolvedAt).toLocaleString('ja-JP')}
                            </div>
                          )}
                        </div>
                        {alert.payload && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <strong className="text-sm text-gray-700">詳細情報:</strong>
                            <pre className="text-xs text-gray-600 mt-1 font-mono">
                              {JSON.stringify(alert.payload, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!alert.resolved && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors duration-200"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          解決
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {filteredAlerts.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <InformationCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">該当するアラートがありません</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}