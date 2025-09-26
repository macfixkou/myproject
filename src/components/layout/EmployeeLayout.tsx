'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { 
  PowerIcon,
  ClockIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline'

interface EmployeeLayoutProps {
  children: React.ReactNode
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダーバー（従業員用） */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ・タイトル（ホームリンク） */}
            <button
              onClick={() => window.location.href = '/home'}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded bg-green-600 flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-gray-900">勤怠システム</div>
              </div>
            </button>

            {/* ユーザー情報とログアウト */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                  <p className="text-xs text-gray-500">従業員</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PowerIcon className="h-4 w-4 mr-1" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}