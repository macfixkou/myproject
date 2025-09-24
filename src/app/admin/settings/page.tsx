'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Layout from '@/components/layout/Layout'
import { 
  Cog6ToothIcon,
  BuildingOfficeIcon,
  ClockIcon,
  BellIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

interface CompanySettings {
  companyName: string
  address: string
  phone: string
  email: string
  website: string
  businessHours: {
    start: string
    end: string
    breakStart: string
    breakEnd: string
    workingDays: string[]
  }
}

interface WorkRules {
  overtimeLimit: number // 36時間協定の上限
  continuousWorkDaysLimit: number
  minimumBreakTime: number // 分
  lateThreshold: number // 分
  earlyDepartureThreshold: number // 分
  autoBreakDeduction: boolean
}

interface NotificationSettings {
  overtimeWarningEnabled: boolean
  overtimeWarningThreshold: number
  continuousWorkWarningEnabled: boolean
  lateArrivalNotificationEnabled: boolean
  emailNotificationsEnabled: boolean
  smsNotificationsEnabled: boolean
  pushNotificationsEnabled: boolean
  notificationRecipients: string[]
}

interface GeofenceSettings {
  defaultRadius: number // meters
  strictModeEnabled: boolean
  allowedAccuracy: number // meters
  requireLocationServices: boolean
}

interface SecuritySettings {
  sessionTimeout: number // minutes
  passwordMinLength: number
  requireTwoFactor: boolean
  ipWhitelistEnabled: boolean
  ipWhitelist: string[]
  auditLogRetentionDays: number
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('company')

  // Settings state
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: '建設株式会社',
    address: '東京都新宿区新宿1-1-1',
    phone: '03-1234-5678',
    email: 'info@construction.com',
    website: 'https://construction.com',
    businessHours: {
      start: '08:00',
      end: '17:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      workingDays: ['月', '火', '水', '木', '金']
    }
  })

  const [workRules, setWorkRules] = useState<WorkRules>({
    overtimeLimit: 36,
    continuousWorkDaysLimit: 6,
    minimumBreakTime: 60,
    lateThreshold: 30,
    earlyDepartureThreshold: 30,
    autoBreakDeduction: true
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    overtimeWarningEnabled: true,
    overtimeWarningThreshold: 30,
    continuousWorkWarningEnabled: true,
    lateArrivalNotificationEnabled: true,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    pushNotificationsEnabled: true,
    notificationRecipients: ['admin@construction.com']
  })

  const [geofenceSettings, setGeofenceSettings] = useState<GeofenceSettings>({
    defaultRadius: 50,
    strictModeEnabled: false,
    allowedAccuracy: 20,
    requireLocationServices: true
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    sessionTimeout: 480, // 8 hours
    passwordMinLength: 8,
    requireTwoFactor: false,
    ipWhitelistEnabled: false,
    ipWhitelist: [],
    auditLogRetentionDays: 90
  })

  useEffect(() => {
    // Simulate loading settings
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('設定を保存しました')
    } catch (error) {
      alert('設定の保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'company', name: '会社情報', icon: BuildingOfficeIcon },
    { id: 'work-rules', name: '就業規則', icon: ClockIcon },
    { id: 'notifications', name: '通知設定', icon: BellIcon },
    { id: 'geofence', name: 'GPS設定', icon: MapPinIcon },
    { id: 'security', name: 'セキュリティ', icon: ShieldCheckIcon }
  ]

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
            <h1 className="text-2xl font-semibold text-gray-900">システム設定</h1>
            <p className="mt-2 text-sm text-gray-700">
              勤怠管理システムの各種設定を管理します。
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="inline-block w-4 h-4 mr-2 loading-spinner"></div>
                  保存中...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                  設定を保存
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="sm:hidden">
            <label htmlFor="tabs" className="sr-only">
              Select a tab
            </label>
            <select
              id="tabs"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium flex items-center`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'company' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">会社基本情報</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">会社名</label>
                    <input
                      type="text"
                      value={companySettings.companyName}
                      onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">電話番号</label>
                    <input
                      type="tel"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">住所</label>
                    <input
                      type="text"
                      value={companySettings.address}
                      onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                    <input
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ウェブサイト</label>
                    <input
                      type="url"
                      value={companySettings.website}
                      onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <h4 className="text-md font-medium text-gray-900 mt-8 mb-4">標準勤務時間</h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">開始時間</label>
                    <input
                      type="time"
                      value={companySettings.businessHours.start}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        businessHours: {...companySettings.businessHours, start: e.target.value}
                      })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">終了時間</label>
                    <input
                      type="time"
                      value={companySettings.businessHours.end}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        businessHours: {...companySettings.businessHours, end: e.target.value}
                      })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">休憩開始</label>
                    <input
                      type="time"
                      value={companySettings.businessHours.breakStart}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        businessHours: {...companySettings.businessHours, breakStart: e.target.value}
                      })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">休憩終了</label>
                    <input
                      type="time"
                      value={companySettings.businessHours.breakEnd}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        businessHours: {...companySettings.businessHours, breakEnd: e.target.value}
                      })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'work-rules' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">就業規則設定</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">36時間協定上限（時間/月）</label>
                      <input
                        type="number"
                        value={workRules.overtimeLimit}
                        onChange={(e) => setWorkRules({...workRules, overtimeLimit: parseInt(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        月の残業時間がこの値を超えるとアラートが発生します
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">連続勤務日数上限（日）</label>
                      <input
                        type="number"
                        value={workRules.continuousWorkDaysLimit}
                        onChange={(e) => setWorkRules({...workRules, continuousWorkDaysLimit: parseInt(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">最低休憩時間（分）</label>
                      <input
                        type="number"
                        value={workRules.minimumBreakTime}
                        onChange={(e) => setWorkRules({...workRules, minimumBreakTime: parseInt(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">遅刻判定時間（分）</label>
                      <input
                        type="number"
                        value={workRules.lateThreshold}
                        onChange={(e) => setWorkRules({...workRules, lateThreshold: parseInt(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="auto-break"
                      checked={workRules.autoBreakDeduction}
                      onChange={(e) => setWorkRules({...workRules, autoBreakDeduction: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="auto-break" className="ml-2 block text-sm text-gray-900">
                      休憩時間を自動で労働時間から控除する
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">通知設定</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">アラート通知</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900">残業時間警告</label>
                          <p className="text-sm text-gray-500">残業時間が上限に近づいた時の警告</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.overtimeWarningEnabled}
                          onChange={(e) => setNotificationSettings({...notificationSettings, overtimeWarningEnabled: e.target.checked})}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                      
                      {notificationSettings.overtimeWarningEnabled && (
                        <div className="ml-6">
                          <label className="block text-sm font-medium text-gray-700">警告閾値（時間）</label>
                          <input
                            type="number"
                            value={notificationSettings.overtimeWarningThreshold}
                            onChange={(e) => setNotificationSettings({...notificationSettings, overtimeWarningThreshold: parseInt(e.target.value)})}
                            className="mt-1 block w-32 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">通知方法</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="email-notifications"
                          checked={notificationSettings.emailNotificationsEnabled}
                          onChange={(e) => setNotificationSettings({...notificationSettings, emailNotificationsEnabled: e.target.checked})}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="email-notifications" className="ml-2 text-sm text-gray-900">
                          メール通知
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sms-notifications"
                          checked={notificationSettings.smsNotificationsEnabled}
                          onChange={(e) => setNotificationSettings({...notificationSettings, smsNotificationsEnabled: e.target.checked})}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sms-notifications" className="ml-2 text-sm text-gray-900">
                          SMS通知
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="push-notifications"
                          checked={notificationSettings.pushNotificationsEnabled}
                          onChange={(e) => setNotificationSettings({...notificationSettings, pushNotificationsEnabled: e.target.checked})}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="push-notifications" className="ml-2 text-sm text-gray-900">
                          プッシュ通知
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'geofence' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">GPS・ジオフェンス設定</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">デフォルト半径（メートル）</label>
                      <input
                        type="number"
                        value={geofenceSettings.defaultRadius}
                        onChange={(e) => setGeofenceSettings({...geofenceSettings, defaultRadius: parseInt(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        新しい現場のデフォルトジオフェンス半径
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">許可GPS精度（メートル）</label>
                      <input
                        type="number"
                        value={geofenceSettings.allowedAccuracy}
                        onChange={(e) => setGeofenceSettings({...geofenceSettings, allowedAccuracy: parseInt(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        この精度以下のGPS情報のみ受け入れる
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="strict-mode"
                        checked={geofenceSettings.strictModeEnabled}
                        onChange={(e) => setGeofenceSettings({...geofenceSettings, strictModeEnabled: e.target.checked})}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="strict-mode" className="ml-2 block text-sm text-gray-900">
                        厳密モード（ジオフェンス外での打刻を禁止）
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="require-location"
                        checked={geofenceSettings.requireLocationServices}
                        onChange={(e) => setGeofenceSettings({...geofenceSettings, requireLocationServices: e.target.checked})}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="require-location" className="ml-2 block text-sm text-gray-900">
                        位置情報サービスを必須とする
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">セキュリティ設定</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">セッションタイムアウト（分）</label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">パスワード最小長</label>
                      <input
                        type="number"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">監査ログ保持期間（日）</label>
                      <input
                        type="number"
                        value={securitySettings.auditLogRetentionDays}
                        onChange={(e) => setSecuritySettings({...securitySettings, auditLogRetentionDays: parseInt(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="two-factor"
                        checked={securitySettings.requireTwoFactor}
                        onChange={(e) => setSecuritySettings({...securitySettings, requireTwoFactor: e.target.checked})}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="two-factor" className="ml-2 block text-sm text-gray-900">
                        二要素認証を必須とする
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="ip-whitelist"
                        checked={securitySettings.ipWhitelistEnabled}
                        onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelistEnabled: e.target.checked})}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="ip-whitelist" className="ml-2 block text-sm text-gray-900">
                        IPアドレス制限を有効にする
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button (Fixed at bottom on mobile) */}
        <div className="mt-8 sm:hidden">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full flex justify-center items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="inline-block w-4 h-4 mr-2 loading-spinner"></div>
                保存中...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                設定を保存
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  )
}