'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import CompanySettings from '@/components/settings/CompanySettings'
import WorkSettings from '@/components/settings/WorkSettings'
import UserManagementSettings from '@/components/settings/UserManagementSettings'
import NotificationSettings from '@/components/settings/NotificationSettings'
import LocationSettings from '@/components/settings/LocationSettings'
import DataBackupSettings from '@/components/settings/DataBackupSettings'
import {
  Cog6ToothIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ShieldCheckIcon,
  BellIcon,
  UserGroupIcon,
  MapPinIcon,
  ServerIcon
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
    { id: 'notifications', name: '通知設定', icon: BellIcon },
    { id: 'location', name: 'GPS・位置情報', icon: MapPinIcon },
    { id: 'backup', name: 'データバックアップ', icon: ServerIcon },
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
        <div>
          {activeTab === 'company' && <CompanySettings />}
          {activeTab === 'work' && <WorkSettings />}
          {activeTab === 'users' && <UserManagementSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'location' && <LocationSettings />}
          {activeTab === 'backup' && <DataBackupSettings />}
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