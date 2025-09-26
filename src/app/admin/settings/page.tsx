'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import {
  Cog6ToothIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClockIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  HomeIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

interface CompanySettings {
  companyName: string
  address: string
  phone: string
  email: string
  taxId: string
}

interface WorkSettings {
  standardWorkHours: number
  overtimeRate: number
  breakTime: number
  startTime: string
  endTime: string
  workingDays: string[]
}

interface SystemSettings {
  language: string
  timezone: string
  dateFormat: string
  currency: string
  backupFrequency: string
}

interface SecuritySettings {
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSymbols: boolean
    expirationDays: number
  }
  sessionTimeout: number
  twoFactorAuth: boolean
  ipWhitelist: string[]
  loginAttempts: number
  accountLockoutDuration: number
  auditLogging: boolean
  dataEncryption: boolean
}

interface NotificationSettings {
  email: {
    enabled: boolean
    newEmployee: boolean
    attendanceAlerts: boolean
    overtimeAlerts: boolean
    salaryCalculation: boolean
    systemUpdates: boolean
    securityAlerts: boolean
  }
  sms: {
    enabled: boolean
    emergencyAlerts: boolean
    lateArrival: boolean
    absenceAlerts: boolean
  }
  push: {
    enabled: boolean
    realTimeAlerts: boolean
    dailySummary: boolean
    weeklyReports: boolean
  }
  alertThresholds: {
    overtimeHours: number
    consecutiveAbsences: number
    lateArrivalMinutes: number
  }
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('company')
  const [savedMessage, setSavedMessage] = useState('')

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: '株式会社サンプル建設',
    address: '東京都新宿区西新宿1-1-1',
    phone: '03-1234-5678',
    email: 'info@sample-construction.co.jp',
    taxId: '1234567890'
  })

  const [workSettings, setWorkSettings] = useState<WorkSettings>({
    standardWorkHours: 8,
    overtimeRate: 1.25,
    breakTime: 60,
    startTime: '08:00',
    endTime: '17:00',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  })

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    language: 'ja-JP',
    timezone: 'Asia/Tokyo',
    dateFormat: 'YYYY-MM-DD',
    currency: 'JPY',
    backupFrequency: 'daily'
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: false,
      expirationDays: 90
    },
    sessionTimeout: 30,
    twoFactorAuth: false,
    ipWhitelist: [],
    loginAttempts: 5,
    accountLockoutDuration: 15,
    auditLogging: true,
    dataEncryption: true
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      newEmployee: true,
      attendanceAlerts: true,
      overtimeAlerts: true,
      salaryCalculation: false,
      systemUpdates: true,
      securityAlerts: true
    },
    sms: {
      enabled: false,
      emergencyAlerts: true,
      lateArrival: true,
      absenceAlerts: true
    },
    push: {
      enabled: true,
      realTimeAlerts: true,
      dailySummary: false,
      weeklyReports: true
    },
    alertThresholds: {
      overtimeHours: 40,
      consecutiveAbsences: 3,
      lateArrivalMinutes: 15
    }
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      redirect('/home')
    }
  }, [status, session])

  const handleSave = async (settingsType: string) => {
    setLoading(true)
    try {
      // TODO: API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSavedMessage(`${settingsType}設定を保存しました`)
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (error) {
      console.error('Settings save error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoHome = () => {
    router.push('/home')
  }

  const tabs = [
    { id: 'company', name: '会社情報', icon: BuildingOfficeIcon },
    { id: 'work', name: '勤務設定', icon: ClockIcon },
    { id: 'system', name: 'システム設定', icon: Cog6ToothIcon },
    { id: 'security', name: 'セキュリティ', icon: ShieldCheckIcon },
    { id: 'notifications', name: '通知設定', icon: BellIcon },
  ]

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-gray-600">設定を読み込み中...</span>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* ホームボタン */}
      <div className="mb-4">
        <button
          onClick={handleGoHome}
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <HomeIcon className="h-4 w-4 mr-2" />
          ホームに戻る
        </button>
      </div>

      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Cog6ToothIcon className="h-8 w-8 mr-3" />
              システム設定
            </h1>
            <p className="text-gray-100 mt-1">
              会社情報や勤務設定、システム全般の設定を管理します
            </p>
          </div>
        </div>
      </div>

      {/* 保存メッセージ */}
      {savedMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{savedMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* タブナビゲーション */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* 会社情報タブ */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">会社基本情報</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">会社名</label>
                    <input
                      type="text"
                      value={companySettings.companyName}
                      onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">法人番号</label>
                    <input
                      type="text"
                      value={companySettings.taxId}
                      onChange={(e) => setCompanySettings({...companySettings, taxId: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">住所</label>
                    <input
                      type="text"
                      value={companySettings.address}
                      onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">電話番号</label>
                    <input
                      type="tel"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                    <input
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => handleSave('会社情報')}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    {loading ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 勤務設定タブ */}
          {activeTab === 'work' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">勤務時間設定</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">標準勤務時間（時間）</label>
                    <input
                      type="number"
                      value={workSettings.standardWorkHours}
                      onChange={(e) => setWorkSettings({...workSettings, standardWorkHours: Number(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">残業割増率</label>
                    <input
                      type="number"
                      step="0.01"
                      value={workSettings.overtimeRate}
                      onChange={(e) => setWorkSettings({...workSettings, overtimeRate: Number(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">開始時刻</label>
                    <input
                      type="time"
                      value={workSettings.startTime}
                      onChange={(e) => setWorkSettings({...workSettings, startTime: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">終了時刻</label>
                    <input
                      type="time"
                      value={workSettings.endTime}
                      onChange={(e) => setWorkSettings({...workSettings, endTime: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">休憩時間（分）</label>
                    <input
                      type="number"
                      value={workSettings.breakTime}
                      onChange={(e) => setWorkSettings({...workSettings, breakTime: Number(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">勤務日</label>
                  <div className="grid grid-cols-7 gap-2">
                    {[
                      { id: 'monday', label: '月' },
                      { id: 'tuesday', label: '火' },
                      { id: 'wednesday', label: '水' },
                      { id: 'thursday', label: '木' },
                      { id: 'friday', label: '金' },
                      { id: 'saturday', label: '土' },
                      { id: 'sunday', label: '日' }
                    ].map((day) => (
                      <label key={day.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={workSettings.workingDays.includes(day.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWorkSettings({
                                ...workSettings,
                                workingDays: [...workSettings.workingDays, day.id]
                              })
                            } else {
                              setWorkSettings({
                                ...workSettings,
                                workingDays: workSettings.workingDays.filter(d => d !== day.id)
                              })
                            }
                          }}
                          className="rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleSave('勤務')}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    {loading ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* システム設定タブ */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">システム基本設定</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">言語</label>
                    <select
                      value={systemSettings.language}
                      onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ja-JP">日本語</option>
                      <option value="en-US">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">タイムゾーン</label>
                    <select
                      value={systemSettings.timezone}
                      onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">日付形式</label>
                    <select
                      value={systemSettings.dateFormat}
                      onChange={(e) => setSystemSettings({...systemSettings, dateFormat: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">通貨</label>
                    <select
                      value={systemSettings.currency}
                      onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="JPY">日本円 (JPY)</option>
                      <option value="USD">米ドル (USD)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">バックアップ頻度</label>
                    <select
                      value={systemSettings.backupFrequency}
                      onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">毎日</option>
                      <option value="weekly">毎週</option>
                      <option value="monthly">毎月</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => handleSave('システム')}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    {loading ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* セキュリティ設定タブ */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* パスワードポリシー */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">パスワードポリシー</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">最小文字数</label>
                    <input
                      type="number"
                      min="6"
                      max="32"
                      value={securitySettings.passwordPolicy.minLength}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {
                          ...securitySettings.passwordPolicy,
                          minLength: Number(e.target.value)
                        }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">パスワード有効期限（日）</label>
                    <input
                      type="number"
                      min="30"
                      max="365"
                      value={securitySettings.passwordPolicy.expirationDays}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {
                          ...securitySettings.passwordPolicy,
                          expirationDays: Number(e.target.value)
                        }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">必須文字種</label>
                  <div className="space-y-3">
                    {[
                      { key: 'requireUppercase', label: '大文字 (A-Z)' },
                      { key: 'requireLowercase', label: '小文字 (a-z)' },
                      { key: 'requireNumbers', label: '数字 (0-9)' },
                      { key: 'requireSymbols', label: '記号 (!@#$...)' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={securitySettings.passwordPolicy[item.key as keyof typeof securitySettings.passwordPolicy] as boolean}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            passwordPolicy: {
                              ...securitySettings.passwordPolicy,
                              [item.key]: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* セッション・ログイン設定 */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">セッション・ログイン設定</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">セッションタイムアウト（分）</label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: Number(e.target.value)
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ログイン試行回数制限</label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={securitySettings.loginAttempts}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        loginAttempts: Number(e.target.value)
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">アカウントロック時間（分）</label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={securitySettings.accountLockoutDuration}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        accountLockoutDuration: Number(e.target.value)
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        twoFactorAuth: e.target.checked
                      })}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">二要素認証を有効化</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={securitySettings.auditLogging}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        auditLogging: e.target.checked
                      })}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">監査ログを記録</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={securitySettings.dataEncryption}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        dataEncryption: e.target.checked
                      })}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">データ暗号化</span>
                  </label>
                </div>
              </div>

              {/* IPホワイトリスト */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">IPアドレス制限</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">許可IPアドレス（1行に1つ）</label>
                  <textarea
                    rows={4}
                    value={securitySettings.ipWhitelist.join('\n')}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim())
                    })}
                    placeholder="192.168.1.0/24&#10;10.0.0.1&#10;203.0.113.0/24"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    空白の場合、すべてのIPアドレスからのアクセスが許可されます
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => handleSave('セキュリティ')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          )}

          {/* 通知設定タブ */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* メール通知 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">メール通知</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.email.enabled}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        email: { ...notificationSettings.email, enabled: e.target.checked }
                      })}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">メール通知を有効化</span>
                  </label>
                </div>

                {notificationSettings.email.enabled && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {[
                      { key: 'newEmployee', label: '新入従業員登録' },
                      { key: 'attendanceAlerts', label: '出退勤アラート' },
                      { key: 'overtimeAlerts', label: '残業時間アラート' },
                      { key: 'salaryCalculation', label: '給与計算完了' },
                      { key: 'systemUpdates', label: 'システム更新' },
                      { key: 'securityAlerts', label: 'セキュリティアラート' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.email[item.key as keyof typeof notificationSettings.email] as boolean}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            email: {
                              ...notificationSettings.email,
                              [item.key]: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* SMS通知 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">SMS通知</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.sms.enabled}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        sms: { ...notificationSettings.sms, enabled: e.target.checked }
                      })}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">SMS通知を有効化</span>
                  </label>
                </div>

                {notificationSettings.sms.enabled && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {[
                      { key: 'emergencyAlerts', label: '緊急アラート' },
                      { key: 'lateArrival', label: '遅刻通知' },
                      { key: 'absenceAlerts', label: '欠勤アラート' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.sms[item.key as keyof typeof notificationSettings.sms] as boolean}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            sms: {
                              ...notificationSettings.sms,
                              [item.key]: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* プッシュ通知 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">プッシュ通知</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.push.enabled}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        push: { ...notificationSettings.push, enabled: e.target.checked }
                      })}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">プッシュ通知を有効化</span>
                  </label>
                </div>

                {notificationSettings.push.enabled && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {[
                      { key: 'realTimeAlerts', label: 'リアルタイムアラート' },
                      { key: 'dailySummary', label: '日次サマリー' },
                      { key: 'weeklyReports', label: '週次レポート' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.push[item.key as keyof typeof notificationSettings.push] as boolean}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            push: {
                              ...notificationSettings.push,
                              [item.key]: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* アラート閾値 */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">アラート閾値設定</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">残業時間アラート（時間/月）</label>
                    <input
                      type="number"
                      min="20"
                      max="80"
                      value={notificationSettings.alertThresholds.overtimeHours}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        alertThresholds: {
                          ...notificationSettings.alertThresholds,
                          overtimeHours: Number(e.target.value)
                        }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">連続欠勤アラート（日）</label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={notificationSettings.alertThresholds.consecutiveAbsences}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        alertThresholds: {
                          ...notificationSettings.alertThresholds,
                          consecutiveAbsences: Number(e.target.value)
                        }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">遅刻アラート（分）</label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={notificationSettings.alertThresholds.lateArrivalMinutes}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        alertThresholds: {
                          ...notificationSettings.alertThresholds,
                          lateArrivalMinutes: Number(e.target.value)
                        }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => handleSave('通知')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}