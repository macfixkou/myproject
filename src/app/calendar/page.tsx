'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import EmployeeLayout from '@/components/layout/EmployeeLayout'
import { 
  CalendarIcon,
  HomeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

interface AttendanceRecord {
  id: string
  date: string
  startTime: string
  endTime: string
  workHours: number
  siteName: string
  status: 'present' | 'absent' | 'late' | 'holiday'
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  const mockAttendanceRecords: AttendanceRecord[] = [
    {
      id: '1',
      date: '2025-09-23',
      startTime: '08:00',
      endTime: '17:00',
      workHours: 8,
      siteName: '新宿オフィスビル建設現場',
      status: 'present'
    },
    {
      id: '2',
      date: '2025-09-24',
      startTime: '08:30',
      endTime: '17:30',
      workHours: 8,
      siteName: '渋谷マンション改修工事',
      status: 'present'
    },
    {
      id: '3',
      date: '2025-09-25',
      startTime: '09:15',
      endTime: '17:00',
      workHours: 7.75,
      siteName: '新宿オフィスビル建設現場',
      status: 'late'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAttendanceRecords(mockAttendanceRecords)
      setLoading(false)
    }, 1000)
  }, [])

  const handleGoHome = () => {
    router.push('/home')
  }

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday

    const days = []
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getAttendanceForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return attendanceRecords.find(record => record.date === dateStr)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'holiday':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return '出勤'
      case 'late':
        return '遅刻'
      case 'absent':
        return '欠勤'
      case 'holiday':
        return '休日'
      default:
        return ''
    }
  }

  // Choose layout based on user role
  const LayoutComponent = session?.user.role === 'EMPLOYEE' ? EmployeeLayout : Layout

  const days = getDaysInMonth(currentDate)
  const currentMonth = currentDate.getMonth()

  if (loading) {
    return (
      <LayoutComponent>
        <div className="flex items-center justify-center min-h-64">
          <div className="loading-spinner w-8 h-8"></div>
          <span className="ml-3 text-gray-600">読み込み中...</span>
        </div>
      </LayoutComponent>
    )
  }

  return (
    <LayoutComponent>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Home Button */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={handleGoHome}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              ホームに戻る
            </button>
          </div>
          
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">勤怠カレンダー</h1>
              <p className="mt-2 text-sm text-gray-700">
                月別の出勤状況を確認できます。
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePreviousMonth}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              <h2 className="text-lg font-semibold text-gray-900">
                {currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
              </h2>
              
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentMonth
                const isToday = day.toDateString() === new Date().toDateString()
                const attendance = getAttendanceForDate(day)
                
                return (
                  <div
                    key={index}
                    className={`
                      min-h-20 p-2 border border-gray-200 rounded
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                      ${isToday ? 'ring-2 ring-primary-500' : ''}
                    `}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {attendance && isCurrentMonth && (
                      <div className="space-y-1">
                        <div className={`
                          inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${getStatusColor(attendance.status)}
                        `}>
                          {getStatusText(attendance.status)}
                        </div>
                        
                        <div className="text-xs text-gray-600">
                          <div className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {attendance.startTime}-{attendance.endTime}
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            <span className="truncate">{attendance.siteName}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">凡例</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
              <span className="text-sm text-gray-700">出勤</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 rounded mr-2"></div>
              <span className="text-sm text-gray-700">遅刻</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
              <span className="text-sm text-gray-700">欠勤</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
              <span className="text-sm text-gray-700">休日</span>
            </div>
          </div>
        </div>
      </div>
    </LayoutComponent>
  )
}