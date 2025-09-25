'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import PunchButton from '@/components/ui/PunchButton'
import { formatMinutesToTime } from '@/lib/utils/time-calculation'
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'

export default function AttendancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [attendanceStatus, setAttendanceStatus] = useState<any>({ isWorking: false })
  const [attendanceList, setAttendanceList] = useState([])
  const [sites, setSites] = useState([])
  const [selectedSite, setSelectedSite] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session) {
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    await Promise.all([
      fetchAttendanceStatus(),
      fetchAttendanceList(),
      fetchSites()
    ])
  }

  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch('/api/attendance/current')
      if (response.ok) {
        const data = await response.json()
        setAttendanceStatus(data.data || { isWorking: false })
      }
    } catch (error) {
      console.error('Failed to fetch attendance status:', error)
    }
  }

  const fetchAttendanceList = async () => {
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
      
      const params = new URLSearchParams({
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
        limit: '31'
      })

      const response = await fetch(`/api/attendance?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAttendanceList(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch attendance list:', error)
      setAttendanceList([])
    }
  }

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites?active=true')
      if (response.ok) {
        const data = await response.json()
        setSites(data.data || [])
        if (data.data && data.data.length > 0 && !selectedSite) {
          setSelectedSite(data.data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch sites:', error)
      setSites([])
    }
  }

  const handleClockIn = async (clockData: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/attendance/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clockData)
      })

      if (response.ok) {
        await fetchData()
      } else {
        const error = await response.json()
        throw new Error(error.error || '出勤処理に失敗しました')
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async (clockData: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/attendance/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clockData)
      })

      if (response.ok) {
        await fetchData()
      } else {
        const error = await response.json()
        throw new Error(error.error || '退勤処理に失敗しました')
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>
  }

  if (!session) return null

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">出退勤管理</h1>
          <p className="text-gray-600">GPS機能を使った正確な勤怠記録</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 出退勤打刻 */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  出退勤打刻
                </h2>
              </div>
              <div className="card-body">
                {/* 現場選択 */}
                {sites.length > 0 && !attendanceStatus.isWorking && (
                  <div className="mb-6">
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

                {/* 打刻ボタン */}
                <PunchButton
                  isWorking={attendanceStatus.isWorking}
                  currentSite={selectedSite}
                  onClockIn={handleClockIn}
                  onClockOut={handleClockOut}
                  loading={loading}
                />
              </div>
            </div>

            {/* 今日の勤務情報 */}
            {attendanceStatus.isWorking && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold">今日の勤務情報</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">出勤時刻</span>
                      <span className="font-medium">
                        {new Date(attendanceStatus.currentAttendance?.clockInAt).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {attendanceStatus.currentAttendance?.site && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">現場</span>
                        <span className="font-medium">{attendanceStatus.currentAttendance.site.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">現在の労働時間</span>
                      <span className="font-medium text-blue-600">
                        {formatMinutesToTime(
                          Math.floor((new Date().getTime() - new Date(attendanceStatus.currentAttendance?.clockInAt).getTime()) / 60000)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 今月の出勤記録 */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  今月の出勤記録
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth)
                      newMonth.setMonth(newMonth.getMonth() - 1)
                      setCurrentMonth(newMonth)
                    }}
                    className="btn btn-sm btn-secondary"
                  >
                    ←
                  </button>
                  <span className="text-sm font-medium">
                    {currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                  </span>
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth)
                      newMonth.setMonth(newMonth.getMonth() + 1)
                      setCurrentMonth(newMonth)
                    }}
                    className="btn btn-sm btn-secondary"
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>日付</th>
                        <th>出勤</th>
                        <th>退勤</th>
                        <th>労働時間</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.length > 0 ? (
                        attendanceList.map((attendance: any) => (
                          <tr key={attendance.id}>
                            <td>
                              {new Date(attendance.clockInAt).toLocaleDateString('ja-JP', {
                                month: 'numeric',
                                day: 'numeric'
                              })}
                            </td>
                            <td>
                              {new Date(attendance.clockInAt).toLocaleTimeString('ja-JP', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td>
                              {attendance.clockOutAt ? (
                                new Date(attendance.clockOutAt).toLocaleTimeString('ja-JP', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              ) : (
                                <span className="badge badge-info">勤務中</span>
                              )}
                            </td>
                            <td>
                              {attendance.workedMinutes > 0 ? (
                                <span className="font-medium">
                                  {formatMinutesToTime(attendance.workedMinutes)}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-gray-500">
                            出勤記録がありません
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 月間統計 */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">月間統計</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {attendanceList.filter((a: any) => a.clockOutAt).length}
                    </div>
                    <div className="text-sm text-gray-600">出勤日数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatMinutesToTime(
                        attendanceList.reduce((sum: number, a: any) => sum + (a.workedMinutes || 0), 0)
                      )}
                    </div>
                    <div className="text-sm text-gray-600">総労働時間</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}