'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import {
  UsersIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface AttendanceRecord {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  site: {
    id: string
    name: string
  } | null
  clockInAt: string
  clockOutAt: string | null
  status: 'OPEN' | 'CLOSED'
  workedMinutes: number
  overtimeMinutes: number
  approved: boolean
  notes: string | null
}

export default function TeamAttendancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'CLOSED' | 'PENDING_APPROVAL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // チームの勤怠記録を取得
  const fetchTeamAttendance = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        date: selectedDate,
        manager: 'true'
      })
      
      if (filterStatus !== 'ALL') {
        params.append('status', filterStatus)
      }
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/attendance?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setAttendances(data.data)
      } else {
        console.error('Failed to fetch team attendance:', data.error)
      }
    } catch (error) {
      console.error('Error fetching team attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  // 勤怠承認処理
  const handleApproval = async (attendanceId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/attendance/${attendanceId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved })
      })

      const data = await response.json()
      if (data.success) {
        // 記録を更新
        setAttendances(prev => 
          prev.map(att => 
            att.id === attendanceId 
              ? { ...att, approved }
              : att
          )
        )
      } else {
        alert('承認処理に失敗しました: ' + data.error)
      }
    } catch (error) {
      console.error('Approval error:', error)
      alert('承認処理中にエラーが発生しました')
    }
  }

  // Excel エクスポート
  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        manager: 'true',
        format: 'excel'
      })
      
      if (filterStatus !== 'ALL') {
        params.append('status', filterStatus)
      }
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/attendance/export?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `team_attendance_${selectedDate}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        alert('エクスポートに失敗しました')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('エクスポート中にエラーが発生しました')
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

    fetchTeamAttendance()
  }, [session, status, router, selectedDate, filterStatus, searchQuery])

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

  const filteredAttendances = attendances.filter(att => {
    if (filterStatus === 'PENDING_APPROVAL') {
      return !att.approved && att.status === 'CLOSED'
    }
    return true
  })

  // 統計情報の計算
  const stats = {
    total: filteredAttendances.length,
    present: filteredAttendances.filter(att => att.status === 'OPEN').length,
    completed: filteredAttendances.filter(att => att.status === 'CLOSED').length,
    pendingApproval: filteredAttendances.filter(att => !att.approved && att.status === 'CLOSED').length,
    totalHours: filteredAttendances.reduce((sum, att) => sum + (att.workedMinutes || 0), 0) / 60,
    overtimeHours: filteredAttendances.reduce((sum, att) => sum + (att.overtimeMinutes || 0), 0) / 60
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">チーム出勤管理</h1>
              <p className="text-gray-600 mt-1">
                管理下のチームメンバーの出勤状況を確認・管理
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Excel出力
              </button>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">総メンバー</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">出勤中</p>
                <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">完了</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">承認待ち</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApproval}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">総労働時間</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">残業時間</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overtimeHours.toFixed(1)}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                対象日
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FunnelIcon className="h-4 w-4 inline mr-1" />
                ステータス
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">すべて</option>
                <option value="OPEN">出勤中</option>
                <option value="CLOSED">退勤済み</option>
                <option value="PENDING_APPROVAL">承認待ち</option>
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
                onClick={fetchTeamAttendance}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                検索
              </button>
            </div>
          </div>
        </div>

        {/* 勤怠記録テーブル */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">チーム勤怠記録</h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedDate} の勤怠記録 ({filteredAttendances.length}件)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    従業員
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    現場
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    出勤時刻
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    退勤時刻
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    労働時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    残業時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状況
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    承認
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {attendance.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {attendance.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.site?.name || '未指定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(attendance.clockInAt).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.clockOutAt
                        ? new Date(attendance.clockOutAt).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '勤務中'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.workedMinutes ? `${(attendance.workedMinutes / 60).toFixed(1)}h` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.overtimeMinutes ? `${(attendance.overtimeMinutes / 60).toFixed(1)}h` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        attendance.status === 'OPEN' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {attendance.status === 'OPEN' ? '出勤中' : '退勤済み'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        attendance.approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {attendance.approved ? '承認済み' : '未承認'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {!attendance.approved && attendance.status === 'CLOSED' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproval(attendance.id, true)}
                            className="text-green-600 hover:text-green-700"
                            title="承認"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleApproval(attendance.id, false)}
                            className="text-red-600 hover:text-red-700"
                            title="却下"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredAttendances.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      該当する勤怠記録がありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}