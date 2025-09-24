'use client'

import { useState, useEffect } from 'react'
import { ClockIcon, DocumentTextIcon, CalendarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import PunchButton from '@/components/ui/PunchButton'
import { formatMinutesToTime } from '@/lib/utils/time-calculation'

interface User {
  id: string
  name: string
  email: string
  role: string
  companyId: string
}

interface EmployeeDashboardProps {
  user: User
}

interface AttendanceStatus {
  isWorking: boolean
  currentAttendance?: {
    id: string
    clockInAt: string
    site?: {
      id: string
      name: string
    }
  }
}

interface TodayStats {
  workedMinutes: number
  overtimeMinutes: number
  breakMinutes: number
  reportSubmitted: boolean
}

export default function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({ isWorking: false })
  const [todayStats, setTodayStats] = useState<TodayStats>({
    workedMinutes: 0,
    overtimeMinutes: 0,
    breakMinutes: 0,
    reportSubmitted: false
  })
  const [loading, setLoading] = useState(false)
  const [sites, setSites] = useState([])
  const [selectedSite, setSelectedSite] = useState<any>(null)

  // 出勤状況を取得
  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'HEAD'
      })
      const data = await response.json()
      if (data.success) {
        setAttendanceStatus(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch attendance status:', error)
    }
  }

  // 今日の統計を取得
  const fetchTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/attendance?startDate=${today}&endDate=${today}`)
      const data = await response.json()
      
      if (data.success && data.data.length > 0) {
        const attendance = data.data[0]
        setTodayStats({
          workedMinutes: attendance.workedMinutes || 0,
          overtimeMinutes: attendance.overtimeMinutes || 0,
          breakMinutes: 0, // TODO: 休憩時間計算
          reportSubmitted: false // TODO: 日報提出状況
        })
      }
    } catch (error) {
      console.error('Failed to fetch today stats:', error)
    }
  }

  // 現場一覧を取得
  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites?active=true')
      const data = await response.json()
      if (data.success) {
        setSites(data.data)
        if (data.data.length > 0 && !selectedSite) {
          setSelectedSite(data.data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch sites:', error)
    }
  }

  // 出勤処理
  const handleClockIn = async (clockData: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/attendance/clock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clockData),
      })

      const data = await response.json()
      if (data.success) {
        await fetchAttendanceStatus()
        await fetchTodayStats()
      } else {
        throw new Error(data.error || '出勤処理に失敗しました')
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 退勤処理
  const handleClockOut = async (clockData: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/attendance/clock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clockData),
      })

      const data = await response.json()
      if (data.success) {
        await fetchAttendanceStatus()
        await fetchTodayStats()
      } else {
        throw new Error(data.error || '退勤処理に失敗しました')
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceStatus()
    fetchTodayStats()
    fetchSites()
  }, [])

  const currentTime = new Date().toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          おはようございます、{user.name}さん
        </h1>
        <p className="text-gray-600">
          現在時刻: {currentTime}
        </p>
      </div>

      {/* 出勤状況カード */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* 出退勤打刻 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">出退勤打刻</h2>
            
            {/* 現場選択 */}
            {sites.length > 0 && !attendanceStatus.isWorking && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  現場を選択
                </label>
                <select
                  value={selectedSite?.id || ''}
                  onChange={(e) => {
                    const site = sites.find((s: any) => s.id === e.target.value)
                    setSelectedSite(site)
                  }}
                  className="input-field"
                >
                  <option value="">現場を選択してください</option>
                  {sites.map((site: any) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <PunchButton
              isWorking={attendanceStatus.isWorking}
              currentSite={selectedSite}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              loading={loading}
            />
          </div>

          {/* 今日の労働時間 */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">今日の労働時間</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatMinutesToTime(todayStats.workedMinutes)}
                  </div>
                  <div className="text-sm text-gray-600">実働時間</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatMinutesToTime(todayStats.overtimeMinutes)}
                  </div>
                  <div className="text-sm text-gray-600">残業時間</div>
                </div>
              </div>
              
              {attendanceStatus.isWorking && attendanceStatus.currentAttendance && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-800">
                    <ClockIcon className="h-4 w-4 inline mr-1" />
                    出勤中: {new Date(attendanceStatus.currentAttendance.clockInAt).toLocaleTimeString('ja-JP')}から
                  </div>
                  {attendanceStatus.currentAttendance.site && (
                    <div className="text-xs text-green-600 mt-1">
                      現場: {attendanceStatus.currentAttendance.site.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* クイックアクション */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">クイックアクション</h3>
            </div>
            <div className="card-body space-y-3">
              <button className="btn btn-primary w-full flex items-center justify-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                業務日報を作成
              </button>
              <button className="btn btn-secondary w-full flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                勤怠カレンダーを確認
              </button>
              <button className="btn btn-secondary w-full flex items-center justify-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                過去の勤怠記録
              </button>
            </div>
          </div>

          {/* 今日のアラート */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-500" />
                通知・アラート
              </h3>
            </div>
            <div className="card-body">
              {!todayStats.reportSubmitted && attendanceStatus.isWorking && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <div className="text-sm text-yellow-800">
                    <strong>日報未提出</strong>
                    <p className="text-xs mt-1">
                      退勤前に業務日報の提出をお忘れなく
                    </p>
                  </div>
                </div>
              )}
              
              {todayStats.overtimeMinutes > 120 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="text-sm text-orange-800">
                    <strong>長時間労働警告</strong>
                    <p className="text-xs mt-1">
                      2時間以上の残業が発生しています
                    </p>
                  </div>
                </div>
              )}
              
              {!attendanceStatus.isWorking && 
               !todayStats.reportSubmitted && 
               todayStats.workedMinutes === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">現在、通知はありません</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}