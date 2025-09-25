'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Layout from '@/components/layout/Layout'
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline'

interface Alert {
  id: string
  type: 'OVERTIME_WARNING' | 'OVERTIME_VIOLATION' | 'CONTINUOUS_WORK' | 'MISSING_BREAK' | 'LATE_ARRIVAL' | 'EARLY_DEPARTURE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  message: string
  employeeId: string
  employeeName: string
  siteId: string
  siteName: string
  date: string
  overtimeHours?: number
  workHours?: number
  continuousDays?: number
  isRead: boolean
  isResolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  createdAt: string
  updatedAt: string
}

interface AlertSummary {
  total: number
  unread: number
  critical: number
  violations: number
  resolved: number
}

export default function AlertsPage() {
  const { data: session } = useSession()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('unresolved')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  // Mock alerts data
  const mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'OVERTIME_VIOLATION',
      severity: 'CRITICAL',
      title: '36時間協定違反の可能性',
      message: '山田次郎さんが今月の残業時間45時間に達しました。36時間協定の上限を超過している可能性があります。',
      employeeId: '3',
      employeeName: '山田次郎',
      siteId: '1',
      siteName: '新宿オフィスビル建設現場',
      date: '2024-09-24',
      overtimeHours: 45,
      workHours: 205,
      isRead: false,
      isResolved: false,
      createdAt: '2024-09-24T17:00:00Z',
      updatedAt: '2024-09-24T17:00:00Z'
    },
    {
      id: '2',
      type: 'OVERTIME_WARNING',
      severity: 'HIGH',
      title: '残業時間警告',
      message: '田中太郎さんの今月の残業時間が35時間に達しています。36時間協定の上限に近づいています。',
      employeeId: '1',
      employeeName: '田中太郎',
      siteId: '1',
      siteName: '新宿オフィスビル建設現場',
      date: '2024-09-24',
      overtimeHours: 35,
      workHours: 195,
      isRead: true,
      isResolved: false,
      createdAt: '2024-09-24T16:30:00Z',
      updatedAt: '2024-09-24T16:45:00Z'
    },
    {
      id: '3',
      type: 'CONTINUOUS_WORK',
      severity: 'MEDIUM',
      title: '連続勤務警告',
      message: '佐藤花子さんが7日間連続で勤務しています。労働基準法に基づき休日の確保を検討してください。',
      employeeId: '2',
      employeeName: '佐藤花子',
      siteId: '2',
      siteName: '渋谷マンション改修工事',
      date: '2024-09-24',
      continuousDays: 7,
      isRead: true,
      isResolved: true,
      resolvedAt: '2024-09-24T15:00:00Z',
      resolvedBy: '管理者',
      createdAt: '2024-09-18T08:30:00Z',
      updatedAt: '2024-09-24T15:00:00Z'
    },
    {
      id: '4',
      type: 'MISSING_BREAK',
      severity: 'MEDIUM',
      title: '休憩時間不足',
      message: '鈴木一郎さんが昨日、規定の休憩時間（1時間）を取得していません。',
      employeeId: '4',
      employeeName: '鈴木一郎',
      siteId: '1',
      siteName: '新宿オフィスビル建設現場',
      date: '2024-09-23',
      isRead: true,
      isResolved: false,
      createdAt: '2024-09-23T18:00:00Z',
      updatedAt: '2024-09-23T18:00:00Z'
    },
    {
      id: '5',
      type: 'LATE_ARRIVAL',
      severity: 'LOW',
      title: '遅刻記録',
      message: '田中太郎さんが本日30分遅刻しました。',
      employeeId: '1',
      employeeName: '田中太郎',
      siteId: '1',
      siteName: '新宿オフィスビル建設現場',
      date: '2024-09-24',
      isRead: true,
      isResolved: true,
      resolvedAt: '2024-09-24T09:00:00Z',
      resolvedBy: '現場監督',
      createdAt: '2024-09-24T08:30:00Z',
      updatedAt: '2024-09-24T09:00:00Z'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAlerts(mockAlerts)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || alert.type === filterType
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'resolved' && alert.isResolved) ||
                         (filterStatus === 'unresolved' && !alert.isResolved) ||
                         (filterStatus === 'unread' && !alert.isRead)
    return matchesSearch && matchesType && matchesSeverity && matchesStatus
  })

  const alertSummary: AlertSummary = {
    total: alerts.length,
    unread: alerts.filter(a => !a.isRead).length,
    critical: alerts.filter(a => a.severity === 'CRITICAL').length,
    violations: alerts.filter(a => a.type === 'OVERTIME_VIOLATION').length,
    resolved: alerts.filter(a => a.isResolved).length
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          緊急
        </span>
      case 'HIGH':
        return <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          高
        </span>
      case 'MEDIUM':
        return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          中
        </span>
      case 'LOW':
        return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          低
        </span>
      default:
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">{severity}</span>
    }
  }

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'OVERTIME_VIOLATION': return '残業協定違反'
      case 'OVERTIME_WARNING': return '残業警告'
      case 'CONTINUOUS_WORK': return '連続勤務'
      case 'MISSING_BREAK': return '休憩不足'
      case 'LATE_ARRIVAL': return '遅刻'
      case 'EARLY_DEPARTURE': return '早退'
      default: return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'OVERTIME_VIOLATION':
      case 'OVERTIME_WARNING':
        return <ClockIcon className="h-4 w-4" />
      case 'CONTINUOUS_WORK':
        return <CalendarIcon className="h-4 w-4" />
      case 'MISSING_BREAK':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      default:
        return <BellIcon className="h-4 w-4" />
    }
  }

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ))
  }

  const handleResolveAlert = (alertId: string) => {
    if (confirm('このアラートを解決済みにしますか？')) {
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { 
          ...alert, 
          isResolved: true, 
          resolvedAt: new Date().toISOString(),
          resolvedBy: session?.user?.name || '管理者'
        } : alert
      ))
    }
  }

  const handleViewDetails = (alert: Alert) => {
    setSelectedAlert(alert)
    if (!alert.isRead) {
      handleMarkAsRead(alert.id)
    }
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
            <h1 className="text-2xl font-semibold text-gray-900">アラート管理</h1>
            <p className="mt-2 text-sm text-gray-700">
              36時間協定違反や労働基準法に関するアラートを管理します。
            </p>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BellIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">総アラート数</dt>
                    <dd className="text-lg font-medium text-gray-900">{alertSummary.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <EnvelopeIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">未読</dt>
                    <dd className="text-lg font-medium text-gray-900">{alertSummary.unread}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">緊急</dt>
                    <dd className="text-lg font-medium text-gray-900">{alertSummary.critical}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">協定違反</dt>
                    <dd className="text-lg font-medium text-gray-900">{alertSummary.violations}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">解決済み</dt>
                    <dd className="text-lg font-medium text-gray-900">{alertSummary.resolved}</dd>
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
                placeholder="従業員名、現場名で検索..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">
              種類
            </label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">すべて</option>
              <option value="OVERTIME_VIOLATION">残業協定違反</option>
              <option value="OVERTIME_WARNING">残業警告</option>
              <option value="CONTINUOUS_WORK">連続勤務</option>
              <option value="MISSING_BREAK">休憩不足</option>
              <option value="LATE_ARRIVAL">遅刻</option>
              <option value="EARLY_DEPARTURE">早退</option>
            </select>
          </div>

          <div>
            <label htmlFor="severity-filter" className="block text-sm font-medium text-gray-700">
              重要度
            </label>
            <select
              id="severity-filter"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">すべて</option>
              <option value="CRITICAL">緊急</option>
              <option value="HIGH">高</option>
              <option value="MEDIUM">中</option>
              <option value="LOW">低</option>
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
              <option value="unresolved">未解決</option>
              <option value="resolved">解決済み</option>
              <option value="unread">未読</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="mt-8">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">アラートがありません</h3>
              <p className="mt-1 text-sm text-gray-500">
                現在表示するアラートはありません。
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredAlerts.map((alert) => (
                  <li key={alert.id} className={`${!alert.isRead ? 'bg-blue-50' : ''}`}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`flex-shrink-0 ${
                            alert.severity === 'CRITICAL' ? 'text-red-500' :
                            alert.severity === 'HIGH' ? 'text-orange-500' :
                            alert.severity === 'MEDIUM' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`}>
                            {getTypeIcon(alert.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {alert.title}
                              </p>
                              {getSeverityBadge(alert.severity)}
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                {getTypeDisplayName(alert.type)}
                              </span>
                              {!alert.isRead && (
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                  未読
                                </span>
                              )}
                              {alert.isResolved && (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                                  解決済み
                                </span>
                              )}
                            </div>
                            
                            <p className="mt-1 text-sm text-gray-600">
                              {alert.message}
                            </p>
                            
                            <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                              <div className="flex items-center">
                                <UsersIcon className="h-4 w-4 mr-1" />
                                {alert.employeeName}
                              </div>
                              <div className="flex items-center">
                                <BellIcon className="h-4 w-4 mr-1" />
                                {alert.siteName}
                              </div>
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(alert.createdAt).toLocaleDateString('ja-JP')}
                              </div>
                              {alert.overtimeHours && (
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  残業: {alert.overtimeHours}時間
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(alert)}
                            className="text-primary-600 hover:text-primary-500"
                            title="詳細表示"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          
                          {!alert.isResolved && (
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="text-green-600 hover:text-green-500"
                              title="解決済みにする"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Alert Detail Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedAlert.title}</h3>
                  <div className="mt-2 flex items-center space-x-3">
                    {getSeverityBadge(selectedAlert.severity)}
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {getTypeDisplayName(selectedAlert.type)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">詳細</h4>
                  <p className="text-sm text-gray-600">{selectedAlert.message}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">従業員</h4>
                    <p className="text-sm text-gray-600">{selectedAlert.employeeName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">現場</h4>
                    <p className="text-sm text-gray-600">{selectedAlert.siteName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">発生日時</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedAlert.createdAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">ステータス</h4>
                    <p className="text-sm text-gray-600">
                      {selectedAlert.isResolved ? '解決済み' : '未解決'}
                    </p>
                  </div>
                </div>
                
                {selectedAlert.overtimeHours && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">残業時間</h4>
                    <p className="text-sm text-gray-600">{selectedAlert.overtimeHours}時間</p>
                  </div>
                )}
                
                {selectedAlert.continuousDays && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">連続勤務日数</h4>
                    <p className="text-sm text-gray-600">{selectedAlert.continuousDays}日</p>
                  </div>
                )}
                
                {selectedAlert.isResolved && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">解決情報</h4>
                    <p className="text-sm text-gray-600">
                      解決者: {selectedAlert.resolvedBy}<br />
                      解決日時: {selectedAlert.resolvedAt && new Date(selectedAlert.resolvedAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                {!selectedAlert.isResolved && (
                  <button
                    onClick={() => {
                      handleResolveAlert(selectedAlert.id)
                      setSelectedAlert(null)
                    }}
                    className="inline-flex justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-500"
                  >
                    解決済みにする
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlert(null)}
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