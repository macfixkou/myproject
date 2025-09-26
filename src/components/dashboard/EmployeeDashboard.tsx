'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
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
      <div className="bg-gradient-to-r from-green-600 to-green-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {new Date().getHours() < 12 ? 'おはようございます' : 
               new Date().getHours() < 18 ? 'お疲れ様です' : 'お疲れ様でした'}、{user.name}さん
            </h1>
            <p className="text-green-100">
              {new Date().toLocaleDateString('ja-JP')} | 現在時刻: {currentTime}
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-green-100">勤務状況</p>
              <p className={`text-lg font-semibold ${attendanceStatus.isWorking ? 'text-white' : 'text-green-100'}`}>
                {attendanceStatus.isWorking ? '勤務中' : '未出勤'}
              </p>
            </div>
          </div>
        </div>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">今日の労働時間</h3>
              <p className="text-sm text-gray-600 mt-1">{new Date().toLocaleDateString('ja-JP')} の勤務状況</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatMinutesToTime(todayStats.workedMinutes)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">実働時間</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {formatMinutesToTime(todayStats.overtimeMinutes)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">残業時間</div>
                </div>
              </div>
              
              {attendanceStatus.isWorking && attendanceStatus.currentAttendance && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-800 font-medium">
                    <ClockIcon className="h-4 w-4 inline mr-2" />
                    出勤中: {new Date(attendanceStatus.currentAttendance.clockInAt).toLocaleTimeString('ja-JP')}から
                  </div>
                  {attendanceStatus.currentAttendance.site && (
                    <div className="text-sm text-green-700 mt-2">
                      📍 現場: {attendanceStatus.currentAttendance.site.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* クイックアクション */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">クイックアクション</h3>
              <p className="text-sm text-gray-600 mt-1">よく使う機能への素早いアクセス</p>
            </div>
            <div className="p-6 space-y-4">
              <button 
                onClick={() => router.push('/reports')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-sm"
              >
                <DocumentTextIcon className="h-6 w-6 mr-3" />
                業務日報を作成
              </button>
              <button 
                onClick={() => router.push('/calendar')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-sm"
              >
                <CalendarIcon className="h-6 w-6 mr-3" />
                勤怠カレンダーを確認
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}