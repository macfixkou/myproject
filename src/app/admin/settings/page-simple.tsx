'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import {
  Cog6ToothIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGoHome = () => {
    router.push('/home')
  }

  if (!mounted || status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">設定を読み込み中...</span>
        </div>
      </Layout>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600">認証が必要です</p>
        </div>
      </Layout>
    )
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600">管理者権限が必要です</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={handleGoHome}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              ホームに戻る
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Cog6ToothIcon className="h-8 w-8 mr-3" />
              システム設定
            </h1>
            <p className="text-gray-100 mt-1">
              会社情報や勤務設定、システム全般の設定を管理します
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">管理者設定</h2>
          <p className="text-gray-600">
            ログインユーザー: {session?.user?.name} ({session?.user?.role})
          </p>
          
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">会社設定</h3>
              <p className="text-sm text-gray-600 mt-1">
                会社情報や基本設定を管理
              </p>
              <div className="mt-3 p-2 bg-blue-50 rounded">
                <p className="text-xs text-blue-600">設定機能は実装中です</p>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">勤務設定</h3>
              <p className="text-sm text-gray-600 mt-1">
                勤務時間や残業設定を管理
              </p>
              <div className="mt-3 p-2 bg-blue-50 rounded">
                <p className="text-xs text-blue-600">設定機能は実装中です</p>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">システム設定</h3>
              <p className="text-sm text-gray-600 mt-1">
                システム全般の設定
              </p>
              <div className="mt-3 p-2 bg-blue-50 rounded">
                <p className="text-xs text-blue-600">設定機能は実装中です</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">✅ 設定ページが正常に読み込まれました。</p>
            <p className="text-sm text-green-600 mt-2">
              現在は簡素版で表示されています。完全版の機能は実装中です。
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}