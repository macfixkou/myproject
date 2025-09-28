'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CurrencyYenIcon,
  MapPinIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline'

interface ReportData {
  period: {
    start: string
    end: string
    type: 'daily' | 'weekly' | 'monthly'
  }
  teamStats: {
    totalEmployees: number
    totalWorkDays: number
    totalWorkHours: number
    totalOvertimeHours: number
    averageWorkHours: number
    attendanceRate: number
  }
  siteStats: {
    activeSites: number
    totalSiteHours: number
    mostActiveSite: string
    efficiency: number
  }
  costStats: {
    totalLaborCost: number
    overtimeCost: number
    averageDailyCost: number
  }
}

export default function ManagerReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedSite, setSelectedSite] = useState<string>('ALL')
  const [sites, setSites] = useState<any[]>([])

  // 現在の週の開始日と終了日を計算
  const getCurrentWeekDates = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek)
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek))
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    }
  }

  // レポートデータを取得
  const fetchReportData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        manager: 'true',
        type: reportType,
        startDate: startDate || getCurrentWeekDates().start,
        endDate: endDate || getCurrentWeekDates().end,
      })
      
      if (selectedSite !== 'ALL') {
        params.append('siteId', selectedSite)
      }

      const response = await fetch(`/api/reports?${params}`)
      const data = await response.json()
      
      if (data.success && data.report) {
        setReportData(data.report)
      } else {
        console.error('Failed to fetch report data:', data.error)
        // モックデータを表示
        setReportData({
          period: {
            start: startDate || getCurrentWeekDates().start,
            end: endDate || getCurrentWeekDates().end,
            type: reportType
          },
          teamStats: {
            totalEmployees: 8,
            totalWorkDays: 40,
            totalWorkHours: 336,
            totalOvertimeHours: 24,
            averageWorkHours: 42,
            attendanceRate: 95.5
          },
          siteStats: {
            activeSites: 2,
            totalSiteHours: 336,
            mostActiveSite: '新宿オフィスビル建設現場',
            efficiency: 88.2
          },
          costStats: {
            totalLaborCost: 504000,
            overtimeCost: 45000,
            averageDailyCost: 72000
          }
        })
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 現場リストを取得
  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites?manager=true&active=true')
      const data = await response.json()
      
      if (data.success || data.data || data.sites) {
        const sitesData = data.data || data.sites || []
        setSites(sitesData)
      }
    } catch (error) {
      console.error('Error fetching sites:', error)
    }
  }

  // Excel エクスポート
  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams({
        manager: 'true',
        type: reportType,
        startDate: startDate || getCurrentWeekDates().start,
        endDate: endDate || getCurrentWeekDates().end,
        format: 'excel'
      })
      
      if (selectedSite !== 'ALL') {
        params.append('siteId', selectedSite)
      }

      const response = await fetch(`/api/reports/export?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `manager_report_${reportType}_${startDate || getCurrentWeekDates().start}.xlsx`
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

    const weekDates = getCurrentWeekDates()
    if (!startDate) setStartDate(weekDates.start)
    if (!endDate) setEndDate(weekDates.end)

    fetchSites()
    fetchReportData()
  }, [session, status, router, reportType, startDate, endDate, selectedSite])

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
          <span className="ml-3 text-gray-600">レポートを生成中...</span>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">チームレポート</h1>
              <p className="text-gray-600 mt-1">
                管理下チームの勤怠・労働状況レポート
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

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                レポート種別
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">日次</option>
                <option value="weekly">週次</option>
                <option value="monthly">月次</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開始日
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                終了日
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対象現場
              </label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">全現場</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReportData}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                レポート更新
              </button>
            </div>
          </div>
        </div>

        {reportData && (
          <>
            {/* レポート期間 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {reportData.period.type === 'daily' && '日次レポート'}
                    {reportData.period.type === 'weekly' && '週次レポート'}
                    {reportData.period.type === 'monthly' && '月次レポート'}
                  </h2>
                  <p className="text-blue-100 mt-1">
                    対象期間: {new Date(reportData.period.start).toLocaleDateString('ja-JP')} ～ {new Date(reportData.period.end).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <PresentationChartLineIcon className="h-12 w-12 text-blue-200" />
              </div>
            </div>

            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* チーム統計 */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-blue-50">
                    <UsersIcon className="h-7 w-7 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">チーム規模</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.teamStats.totalEmployees}名</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    出勤率: <span className="font-medium text-blue-600">{reportData.teamStats.attendanceRate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-green-50">
                    <ClockIcon className="h-7 w-7 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">総労働時間</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.teamStats.totalWorkHours}h</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">通常時間</span>
                    <span className="font-medium">{reportData.teamStats.totalWorkHours - reportData.teamStats.totalOvertimeHours}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">残業時間</span>
                    <span className="font-medium text-orange-600">{reportData.teamStats.totalOvertimeHours}h</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-purple-50">
                    <MapPinIcon className="h-7 w-7 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">現場稼働</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.siteStats.activeSites}現場</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    効率性: <span className="font-medium text-purple-600">{reportData.siteStats.efficiency}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-yellow-50">
                    <CurrencyYenIcon className="h-7 w-7 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">総労務費</p>
                    <p className="text-2xl font-bold text-gray-900">¥{reportData.costStats.totalLaborCost.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">通常労務費</span>
                    <span className="font-medium">¥{(reportData.costStats.totalLaborCost - reportData.costStats.overtimeCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">残業代</span>
                    <span className="font-medium text-orange-600">¥{reportData.costStats.overtimeCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 詳細レポート */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* チーム分析 */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                    チーム分析
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">労働時間分析</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">1人あたり平均労働時間</span>
                        <span className="font-medium">{reportData.teamStats.averageWorkHours}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">総出勤日数</span>
                        <span className="font-medium">{reportData.teamStats.totalWorkDays}日</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">残業発生率</span>
                        <span className="font-medium text-orange-600">
                          {((reportData.teamStats.totalOvertimeHours / reportData.teamStats.totalWorkHours) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">効率性指標</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">出勤率</span>
                        <span className="font-medium text-green-600">{reportData.teamStats.attendanceRate}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">1日あたり平均稼働時間</span>
                        <span className="font-medium">{(reportData.teamStats.totalWorkHours / reportData.teamStats.totalWorkDays).toFixed(1)}h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 現場・コスト分析 */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
                    現場・コスト分析
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">現場効率</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">最も活発な現場</span>
                        <span className="font-medium">{reportData.siteStats.mostActiveSite}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">現場別平均稼働</span>
                        <span className="font-medium">{(reportData.siteStats.totalSiteHours / reportData.siteStats.activeSites).toFixed(1)}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">現場効率性</span>
                        <span className="font-medium text-purple-600">{reportData.siteStats.efficiency}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">コスト分析</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">1日あたり平均コスト</span>
                        <span className="font-medium">¥{reportData.costStats.averageDailyCost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">残業代比率</span>
                        <span className="font-medium text-orange-600">
                          {((reportData.costStats.overtimeCost / reportData.costStats.totalLaborCost) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">時間あたり単価</span>
                        <span className="font-medium">
                          ¥{Math.round(reportData.costStats.totalLaborCost / reportData.teamStats.totalWorkHours).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}