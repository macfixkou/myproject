'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Layout from '@/components/layout/Layout'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ClockIcon,
  MapPinIcon,
  PhotoIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface DailyReport {
  id: string
  date: string
  siteId: string
  siteName: string
  workContent: string
  startTime: string
  endTime: string
  workHours: number
  materials: string
  equipment: string
  weather: string
  temperature: string
  notes: string
  photos: string[]
  createdAt: string
  updatedAt: string
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const [reports, setReports] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Mock data for demonstration
  const mockReports: DailyReport[] = [
    {
      id: '1',
      date: '2024-09-24',
      siteId: 'site-1',
      siteName: '新宿オフィスビル建設現場',
      workContent: '基礎工事、鉄筋配筋作業',
      startTime: '08:00',
      endTime: '17:00',
      workHours: 8,
      materials: 'コンクリート20m³、鉄筋200kg',
      equipment: 'クレーン、ミキサー車',
      weather: '晴れ',
      temperature: '22°C',
      notes: '順調に進行中。明日は型枠設置予定。',
      photos: [],
      createdAt: '2024-09-24T17:30:00Z',
      updatedAt: '2024-09-24T17:30:00Z'
    },
    {
      id: '2',
      date: '2024-09-23',
      siteId: 'site-2',
      siteName: '渋谷マンション改修工事',
      workContent: '外壁塗装、防水工事',
      startTime: '08:30',
      endTime: '16:30',
      workHours: 7.5,
      materials: '塗料50缶、防水シート200m²',
      equipment: '高所作業車、コンプレッサー',
      weather: '曇り',
      temperature: '19°C',
      notes: '3階部分の作業完了。',
      photos: ['photo1.jpg', 'photo2.jpg'],
      createdAt: '2024-09-23T16:45:00Z',
      updatedAt: '2024-09-23T16:45:00Z'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReports(mockReports)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.workContent.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMonth = report.date.startsWith(selectedMonth)
    return matchesSearch && matchesMonth
  })

  const handleCreateReport = () => {
    setShowCreateForm(true)
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
            <h1 className="text-2xl font-semibold text-gray-900">業務日報</h1>
            <p className="mt-2 text-sm text-gray-700">
              現場での作業内容や使用材料、機械等の記録を管理します。
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={handleCreateReport}
              className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              <PlusIcon className="h-4 w-4 inline mr-2" />
              日報作成
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                placeholder="現場名や作業内容で検索..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700">
              対象月
            </label>
            <div className="mt-1">
              <input
                type="month"
                name="month"
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="mt-8">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">業務日報がありません</h3>
              <p className="mt-1 text-sm text-gray-500">
                新しい業務日報を作成してください。
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleCreateReport}
                  className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  日報作成
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-lg font-medium text-gray-900">
                          {new Date(report.date).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        完了
                      </span>
                    </div>

                    {/* Site Info */}
                    <div className="flex items-center mb-3">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{report.siteName}</span>
                    </div>

                    {/* Work Hours */}
                    <div className="flex items-center mb-3">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {report.startTime} - {report.endTime} ({report.workHours}時間)
                      </span>
                    </div>

                    {/* Work Content */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">作業内容</h4>
                      <p className="text-sm text-gray-600">{report.workContent}</p>
                    </div>

                    {/* Weather */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">天気</h4>
                        <p className="text-sm text-gray-600">{report.weather}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">気温</h4>
                        <p className="text-sm text-gray-600">{report.temperature}</p>
                      </div>
                    </div>

                    {/* Materials & Equipment */}
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">使用材料</h4>
                        <p className="text-sm text-gray-600">{report.materials}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">使用機械</h4>
                        <p className="text-sm text-gray-600">{report.equipment}</p>
                      </div>
                    </div>

                    {/* Photos */}
                    {report.photos.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <PhotoIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <h4 className="text-sm font-medium text-gray-900">写真 ({report.photos.length}枚)</h4>
                        </div>
                        <div className="flex space-x-2">
                          {report.photos.map((photo, index) => (
                            <div key={index} className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                              <PhotoIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {report.notes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">備考</h4>
                        <p className="text-sm text-gray-600">{report.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        className="text-sm text-primary-600 hover:text-primary-500"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        className="text-sm text-gray-600 hover:text-gray-500"
                      >
                        詳細
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Report Modal Placeholder */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">業務日報作成</h3>
              <p className="text-sm text-gray-600 mb-4">
                詳細な日報作成フォームは今後実装予定です。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
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