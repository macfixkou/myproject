'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  UsersIcon,
  MapPinIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyYenIcon,
} from '@heroicons/react/24/outline'

interface User {
  id: string
  name: string
  email: string
  role: string
  companyId: string
}

interface ManagerDashboardProps {
  user: User
}

interface DashboardStats {
  todayAttendance: {
    total: number
    present: number
    absent: number
    late: number
  }
  weeklyStats: {
    totalHours: number
    overtimeHours: number
    managedSites: number
  }
  teamStats: {
    totalMembers: number
    activeMembers: number
    pendingApprovals: number
  }
  alerts: {
    critical: number
    warning: number
    info: number
  }
}

export default function ManagerDashboard({ user }: ManagerDashboardProps) {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    todayAttendance: { total: 0, present: 0, absent: 0, late: 0 },
    weeklyStats: { totalHours: 0, overtimeHours: 0, managedSites: 0 },
    teamStats: { totalMembers: 0, activeMembers: 0, pendingApprovals: 0 },
    alerts: { critical: 0, warning: 0, info: 0 }
  })
  const [recentAttendances, setRecentAttendances] = useState([])
  const [loading, setLoading] = useState(true)

  // ダッシュボード統計を取得
  const fetchDashboardStats = async () => {
    try {
      // TODO: 実際のAPIエンドポイントを実装 (マネージャー専用データ)
      // 現在はモックデータを使用
      setStats({
        todayAttendance: { total: 8, present: 7, absent: 1, late: 0 },
        weeklyStats: { totalHours: 336, overtimeHours: 24, managedSites: 2 },
        teamStats: { totalMembers: 8, activeMembers: 7, pendingApprovals: 3 },
        alerts: { critical: 0, warning: 1, info: 2 }
      })

      // チームの出勤記録を取得
      const response = await fetch('/api/attendance?manager=true&limit=10')
      const data = await response.json()
      if (data.success) {
        setRecentAttendances(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch manager dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-gray-600">データを読み込み中...</span>
      </div>
    )
  }

  const statCards = [
    {
      title: 'チームの出勤状況',
      value: `${stats.todayAttendance.present}/${stats.todayAttendance.total}`,
      subtitle: '出勤中/チームメンバー',
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      details: [
        { label: '出勤中', value: stats.todayAttendance.present, color: 'text-green-600' },
        { label: '欠勤', value: stats.todayAttendance.absent, color: 'text-red-600' },
        { label: '遅刻', value: stats.todayAttendance.late, color: 'text-yellow-600' },
      ]
    },
    {
      title: '今週の労働時間',
      value: `${stats.weeklyStats.totalHours}h`,
      subtitle: `残業: ${stats.weeklyStats.overtimeHours}h`,
      icon: ClockIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      details: [
        { label: '総労働時間', value: `${stats.weeklyStats.totalHours}h`, color: 'text-gray-600' },
        { label: '残業時間', value: `${stats.weeklyStats.overtimeHours}h`, color: 'text-orange-600' },
      ]
    },
    {
      title: '管理現場数',
      value: stats.weeklyStats.managedSites,
      subtitle: '担当している現場',
      icon: MapPinIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '承認待ち',
      value: stats.teamStats.pendingApprovals,
      subtitle: '勤怠・工数の承認',
      icon: DocumentTextIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: () => router.push('/manager/approvals')
    },
  ]

  const quickActions = [
    {
      title: 'チーム出勤確認',
      description: 'チームメンバーの出勤状況を確認',
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => router.push('/manager/team-attendance')
    },
    {
      title: '勤怠承認',
      description: '未承認の勤怠記録を確認・承認',
      icon: DocumentTextIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => router.push('/manager/approvals'),
      badge: stats.teamStats.pendingApprovals > 0 ? stats.teamStats.pendingApprovals : null
    },
    {
      title: '現場管理',
      description: '担当現場の状況を管理',
      icon: MapPinIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => router.push('/manager/sites')
    },
    {
      title: 'レポート作成',
      description: 'チームの勤怠レポートを作成',
      icon: ChartBarIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      action: () => router.push('/manager/reports')
    },
  ]

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              マネージャーホーム
            </h1>
            <p className="text-green-100">
              {user.name}さん | 現場管理者 | {new Date().toLocaleDateString('ja-JP')}
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-green-100">現在時刻</p>
              <p className="text-lg font-semibold text-white">
                {new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${card.action ? 'cursor-pointer' : ''}`}
            onClick={card.action}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${card.bgColor} shadow-sm`}>
                  <card.icon className={`h-7 w-7 ${card.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                  )}
                </div>
              </div>
              {card.details && (
                <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                  {card.details.map((detail, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{detail.label}</span>
                      <span className={`font-medium ${detail.color}`}>{detail.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">クイックアクション</h3>
          <p className="text-sm text-gray-600 mt-1">よく使用する機能に素早くアクセス</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <div 
                key={index}
                onClick={action.action}
                className="relative p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer group"
              >
                {action.badge && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {action.badge}
                  </div>
                )}
                <div className={`p-2 rounded-lg ${action.bgColor} w-fit mb-3`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* チームの出勤記録 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">チームの出勤記録</h3>
              <p className="text-sm text-gray-600 mt-1">管理下のメンバーの勤怠状況</p>
            </div>
            <button 
              onClick={() => router.push('/manager/team-attendance')}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              詳細表示
            </button>
          </div>
        </div>
        <div className="p-0">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>従業員</th>
                  <th>現場</th>
                  <th>出勤時刻</th>
                  <th>退勤時刻</th>
                  <th>状況</th>
                  <th>承認</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendances.length > 0 ? (
                  recentAttendances.slice(0, 8).map((attendance: any) => (
                    <tr key={attendance.id}>
                      <td className="font-medium">
                        {attendance.user?.name || 'N/A'}
                      </td>
                      <td>{attendance.site?.name || '未指定'}</td>
                      <td>
                        {new Date(attendance.clockInAt).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        {attendance.clockOutAt 
                          ? new Date(attendance.clockOutAt).toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '勤務中'
                        }
                      </td>
                      <td>
                        <span className={`badge ${
                          attendance.status === 'OPEN' ? 'badge-info' :
                          attendance.status === 'CLOSED' ? 'badge-success' :
                          'badge-warning'
                        }`}>
                          {attendance.status === 'OPEN' ? '出勤中' :
                           attendance.status === 'CLOSED' ? '完了' :
                           '要確認'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          attendance.approved ? 'badge-success' : 'badge-warning'
                        }`}>
                          {attendance.approved ? '承認済み' : '未承認'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      出勤記録がありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 重要なアラート */}
      {(stats.alerts.critical > 0 || stats.alerts.warning > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold flex items-center text-gray-900">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
              チーム アラート
            </h3>
            <p className="text-sm text-gray-600 mt-1">チームメンバーに関する重要な通知</p>
          </div>
          <div className="p-6 space-y-4">
            {stats.alerts.critical > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-800">
                  <div className="font-semibold flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    緊急: {stats.alerts.critical}件
                  </div>
                  <p className="text-xs mt-2 text-red-700">
                    チームメンバーの長時間労働が発生しています
                  </p>
                </div>
              </div>
            )}
            {stats.alerts.warning > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-sm text-yellow-800">
                  <div className="font-semibold flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    警告: {stats.alerts.warning}件
                  </div>
                  <p className="text-xs mt-2 text-yellow-700">
                    ジオフェンス外打刻や承認待ちがあります
                  </p>
                </div>
              </div>
            )}
            <button 
              onClick={() => router.push('/manager/alerts')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
            >
              すべてのアラートを確認
            </button>
          </div>
        </div>
      )}
    </div>
  )
}