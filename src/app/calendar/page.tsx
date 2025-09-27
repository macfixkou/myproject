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
  MapPinIcon,
  SunIcon,
  CloudIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { 
  CloudRainIcon,
} from '@heroicons/react/24/solid'

interface AttendanceRecord {
  id: string
  date: string
  startTime: string
  endTime: string
  workHours: number
  siteName: string
  status: 'present' | 'absent' | 'late' | 'holiday'
}

interface WeatherData {
  date: string
  temperature: {
    high: number
    low: number
  }
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy'
  humidity: number
  windSpeed: number
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Weather icon component
  const WeatherIcon = ({ condition, size = 'sm' }: { condition: string, size?: 'sm' | 'md' }) => {
    const iconClass = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'
    
    switch (condition) {
      case 'sunny':
        return <SunIcon className={`${iconClass} text-yellow-500`} />
      case 'cloudy':
        return <CloudIcon className={`${iconClass} text-gray-500`} />
      case 'rainy':
        return <CloudRainIcon className={`${iconClass} text-blue-500`} />
      case 'snowy':
        return <CloudIcon className={`${iconClass} text-blue-200`} />
      default:
        return <SunIcon className={`${iconClass} text-yellow-500`} />
    }
  }

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

  // Generate mock weather data for the month
  const generateWeatherData = (year: number, month: number): WeatherData[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const weather: WeatherData[] = []
    const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'snowy']
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      weather.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          high: Math.floor(Math.random() * 15) + 15, // 15-30°C
          low: Math.floor(Math.random() * 10) + 5,   // 5-15°C
        },
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 10) + 1  // 1-10 m/s
      })
    }
    return weather
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAttendanceRecords(mockAttendanceRecords)
      const weather = generateWeatherData(currentDate.getFullYear(), currentDate.getMonth())
      setWeatherData(weather)
      setLoading(false)
    }, 1000)
  }, [currentDate])

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowDetailModal(true)
  }

  // Get weather for specific date
  const getWeatherForDate = (date: Date): WeatherData | undefined => {
    const dateStr = date.toISOString().split('T')[0]
    return weatherData.find(w => w.date === dateStr)
  }

  // Get attendance for specific date
  const getAttendanceForDate = (date: Date): AttendanceRecord | undefined => {
    const dateStr = date.toISOString().split('T')[0]
    return attendanceRecords.find(a => a.date === dateStr)
  }

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
                const weather = getWeatherForDate(day)
                
                return (
                  <div
                    key={index}
                    onClick={() => isCurrentMonth && handleDateClick(day)}
                    className={`
                      min-h-24 p-2 border border-gray-200 rounded cursor-pointer transition-all hover:shadow-md
                      ${isCurrentMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50'}
                      ${isToday ? 'ring-2 ring-primary-500' : ''}
                    `}
                  >
                    {/* Date and Weather */}
                    <div className="flex items-center justify-between mb-1">
                      <div className={`text-sm font-medium ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {day.getDate()}
                      </div>
                      {weather && isCurrentMonth && (
                        <div className="flex items-center space-x-1">
                          <WeatherIcon condition={weather.condition} size="sm" />
                          <span className="text-xs text-gray-500">
                            {weather.temperature.high}°
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {attendance && isCurrentMonth && (
                      <div className="space-y-1">
                        <div className={`
                          inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium
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

        {/* Detail Modal */}
        {showDetailModal && selectedDate && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedDate.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Weather Information */}
                {(() => {
                  const weather = getWeatherForDate(selectedDate)
                  return weather ? (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                        <WeatherIcon condition={weather.condition} size="md" />
                        <span className="ml-2">天気情報</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">気温:</span>
                          <span className="ml-1 font-medium">
                            {weather.temperature.high}° / {weather.temperature.low}°
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700">湿度:</span>
                          <span className="ml-1 font-medium">{weather.humidity}%</span>
                        </div>
                        <div>
                          <span className="text-blue-700">風速:</span>
                          <span className="ml-1 font-medium">{weather.windSpeed} m/s</span>
                        </div>
                        <div>
                          <span className="text-blue-700">天候:</span>
                          <span className="ml-1 font-medium">
                            {weather.condition === 'sunny' && '晴れ'}
                            {weather.condition === 'cloudy' && '曇り'}
                            {weather.condition === 'rainy' && '雨'}
                            {weather.condition === 'snowy' && '雪'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null
                })()}

                {/* Attendance Information */}
                {(() => {
                  const attendance = getAttendanceForDate(selectedDate)
                  return attendance ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        勤怠情報
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">出勤時刻:</span>
                          <span className="font-medium">{attendance.startTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">退勤時刻:</span>
                          <span className="font-medium">{attendance.endTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">労働時間:</span>
                          <span className="font-medium">{attendance.workHours}時間</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">現場:</span>
                          <span className="font-medium">{attendance.siteName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ステータス:</span>
                          <span className={`font-medium ${
                            attendance.status === 'present' ? 'text-green-600' :
                            attendance.status === 'late' ? 'text-yellow-600' :
                            attendance.status === 'absent' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {getStatusText(attendance.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        勤怠情報
                      </h4>
                      <p className="text-sm text-gray-500">
                        この日の勤怠データはありません
                      </p>
                    </div>
                  )
                })()}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutComponent>
  )
}