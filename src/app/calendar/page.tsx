'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Layout from '@/components/layout/Layout'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ClockIcon,
  SunIcon,
  CloudIcon,
  MapPinIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface CalendarEvent {
  id: string
  date: string
  type: 'attendance' | 'report' | 'schedule'
  title: string
  description?: string
  startTime?: string
  endTime?: string
  siteId?: string
  siteName?: string
  status?: 'completed' | 'pending' | 'cancelled'
}

interface WeatherData {
  date: string
  condition: string
  temperature: string
  icon: 'sun' | 'cloud' | 'rain'
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [weather, setWeather] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)

  // Mock events data
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      date: '2024-09-24',
      type: 'attendance',
      title: '出勤記録',
      startTime: '08:00',
      endTime: '17:00',
      siteId: 'site-1',
      siteName: '新宿オフィスビル建設現場',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-09-24',
      type: 'report',
      title: '業務日報',
      description: '基礎工事、鉄筋配筋作業',
      siteId: 'site-1',
      siteName: '新宿オフィスビル建設現場',
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-09-25',
      type: 'schedule',
      title: '型枠設置作業',
      startTime: '08:30',
      endTime: '16:30',
      siteId: 'site-1',
      siteName: '新宿オフィスビル建設現場',
      status: 'pending'
    },
    {
      id: '4',
      date: '2024-09-23',
      type: 'attendance',
      title: '出勤記録',
      startTime: '08:30',
      endTime: '16:30',
      siteId: 'site-2',
      siteName: '渋谷マンション改修工事',
      status: 'completed'
    }
  ]

  // Mock weather data
  const mockWeather: WeatherData[] = [
    { date: '2024-09-24', condition: '晴れ', temperature: '22°C', icon: 'sun' },
    { date: '2024-09-25', condition: '曇り', temperature: '19°C', icon: 'cloud' },
    { date: '2024-09-26', condition: '晴れ', temperature: '25°C', icon: 'sun' },
    { date: '2024-09-27', condition: '雨', temperature: '18°C', icon: 'rain' },
  ]

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setEvents(mockEvents)
      setWeather(mockWeather)
      setLoading(false)
    }, 1000)
  }, [])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getEventsForDate = (date: Date) => {
    const dateKey = formatDateKey(date)
    return events.filter(event => event.date === dateKey)
  }

  const getWeatherForDate = (date: Date) => {
    const dateKey = formatDateKey(date)
    return weather.find(w => w.date === dateKey)
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDayOfMonth = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dateEvents = getEventsForDate(date)
      const weatherData = getWeatherForDate(date)
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`p-2 min-h-[100px] border border-gray-200 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'bg-primary-50 border-primary-300' : ''}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${
              isToday ? 'text-blue-600' : isSelected ? 'text-primary-600' : 'text-gray-900'
            }`}>
              {day}
            </span>
            {weatherData && (
              <div className="flex items-center">
                {weatherData.icon === 'sun' && <SunIcon className="h-4 w-4 text-yellow-500" />}
                {weatherData.icon === 'cloud' && <CloudIcon className="h-4 w-4 text-gray-500" />}
                {weatherData.icon === 'rain' && <CloudIcon className="h-4 w-4 text-blue-500" />}
                <span className="text-xs text-gray-600 ml-1">{weatherData.temperature}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            {dateEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded truncate ${
                  event.type === 'attendance' ? 'bg-green-100 text-green-800' :
                  event.type === 'report' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}
                title={event.title}
              >
                {event.type === 'attendance' && <ClockIcon className="h-3 w-3 inline mr-1" />}
                {event.type === 'report' && <DocumentTextIcon className="h-3 w-3 inline mr-1" />}
                {event.type === 'schedule' && <MapPinIcon className="h-3 w-3 inline mr-1" />}
                {event.title}
              </div>
            ))}
            {dateEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dateEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
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
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">カレンダー</h1>
            <p className="mt-2 text-sm text-gray-700">
              出勤記録、業務日報、作業予定を確認できます。
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={goToToday}
              className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
            >
              今日
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg">
              {/* Calendar Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('ja-JP', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </h2>
                
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                  <div key={day} className={`py-3 px-2 text-center text-sm font-medium ${
                    index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {renderCalendarDays()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Selected Date Events */}
            {selectedDate && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedDate.toLocaleDateString('ja-JP', { 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </h3>
                
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <p className="text-sm text-gray-500">イベントはありません</p>
                  ) : (
                    getEventsForDate(selectedDate).map((event) => (
                      <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                        <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium mb-2 ${
                          event.type === 'attendance' ? 'bg-green-100 text-green-800' :
                          event.type === 'report' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.type === 'attendance' && <ClockIcon className="h-3 w-3 mr-1" />}
                          {event.type === 'report' && <DocumentTextIcon className="h-3 w-3 mr-1" />}
                          {event.type === 'schedule' && <MapPinIcon className="h-3 w-3 mr-1" />}
                          {event.type === 'attendance' ? '出勤' : 
                           event.type === 'report' ? '日報' : '予定'}
                        </div>
                        
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        
                        {event.startTime && event.endTime && (
                          <p className="text-sm text-gray-500 mt-1">
                            {event.startTime} - {event.endTime}
                          </p>
                        )}
                        
                        {event.siteName && (
                          <p className="text-sm text-gray-500 mt-1">
                            <MapPinIcon className="h-3 w-3 inline mr-1" />
                            {event.siteName}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Weather Forecast */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">天気予報</h3>
              <div className="space-y-3">
                {weather.slice(0, 4).map((w) => (
                  <div key={w.date} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {w.icon === 'sun' && <SunIcon className="h-5 w-5 text-yellow-500 mr-2" />}
                      {w.icon === 'cloud' && <CloudIcon className="h-5 w-5 text-gray-500 mr-2" />}
                      {w.icon === 'rain' && <CloudIcon className="h-5 w-5 text-blue-500 mr-2" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(w.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-600">{w.condition}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{w.temperature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">凡例</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">出勤記録</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">業務日報</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">作業予定</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}