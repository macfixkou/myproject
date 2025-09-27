'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { 
  BanknotesIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'

export default function SalaryPage() {
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
          <span className="ml-3 text-gray-600">読み込み中...</span>
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

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600">このページにアクセスする権限がありません</p>
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
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <BanknotesIcon className="h-8 w-8 mr-3" />
              給与計算
            </h1>
            <p className="text-green-100 mt-1">
              従業員の勤務時間と給与を計算・管理します
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">給与計算システム</h2>
          <p className="text-gray-600">
            ログインユーザー: {session?.user?.name} ({session?.user?.role})
          </p>
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">✅ 給与計算ページが正常に読み込まれました。</p>
            <p className="text-sm text-green-600 mt-2">
              現在は簡素版で表示されています。完全版の機能は実装中です。
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}