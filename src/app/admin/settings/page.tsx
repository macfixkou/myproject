'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import {
  Cog6ToothIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ShieldCheckIcon,
  BellIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('company')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGoHome = () => {
    router.push('/home')
  }

  const settingsTabs = [
    { id: 'company', name: '会社設定', icon: BuildingOfficeIcon },
    { id: 'work', name: '勤務設定', icon: ClockIcon },
    { id: 'users', name: 'ユーザー管理', icon: UserGroupIcon },
    { id: 'security', name: 'セキュリティ', icon: ShieldCheckIcon },
    { id: 'notifications', name: '通知設定', icon: BellIcon },
    { id: 'system', name: 'システム', icon: GlobeAltIcon },
  ]

  if (!mounted || status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">設定を読み込み中...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoHome}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                ホームに戻る
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 rounded-lg mb-8">
            <div className="flex items-center">
              <Cog6ToothIcon className="h-10 w-10 text-white mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-white">システム設定</h1>
                <p className="text-gray-100 mt-2 text-lg">
                  会社情報・勤務設定・システム全般の設定を管理します
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 設定コンテンツ */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === 'company' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">会社設定</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名
                  </label>
                  <input
                    type="text"
                    defaultValue="サンプル建設会社"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    郵便番号
                  </label>
                  <input
                    type="text"
                    defaultValue="100-0001"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                    readOnly
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    住所
                  </label>
                  <input
                    type="text"
                    defaultValue="東京都千代田区1-1-1 サンプルビル"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3"
                    readOnly
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">💡 会社情報の編集機能は開発中です</p>
              </div>
            </div>
          )}

          {activeTab === 'work' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">勤務設定</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    標準労働時間（1日）
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3" disabled>
                    <option>8時間</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    残業割増率
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3" disabled>
                    <option>25%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    深夜割増率
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3" disabled>
                    <option>25%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    休日割増率
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3" disabled>
                    <option>35%</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">💡 勤務設定の変更機能は開発中です</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ユーザー管理</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">管理者アカウント</p>
                    <p className="text-sm text-gray-500">admin@example.com</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">
                    アクティブ
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">従業員1</p>
                    <p className="text-sm text-gray-500">employee1@example.com</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">
                    アクティブ
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">従業員2</p>
                    <p className="text-sm text-gray-500">employee2@example.com</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">
                    アクティブ
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">💡 ユーザー管理機能は開発中です</p>
              </div>
            </div>
          )}

          {['security', 'notifications', 'system'].includes(activeTab) && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {settingsTabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <Cog6ToothIcon className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">設定項目</h3>
                <p className="mt-1 text-sm text-gray-500">
                  この機能は現在開発中です。
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">💡 {settingsTabs.find(tab => tab.id === activeTab)?.name}機能は実装中です</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ユーザー情報 */}
        {session?.user && (
          <div className="mt-8 bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ ログインユーザー: <strong>{session.user.name}</strong> ({session.user.role})
            </p>
            <p className="text-xs text-green-600 mt-1">
              システム設定が正常に動作しています。
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}