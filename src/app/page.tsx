'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RootPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // まだ読み込み中

    if (session) {
      // ログイン済みの場合はホームページにリダイレクト
      router.push('/home')
    } else {
      // 未ログインの場合はログインページにリダイレクト
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // ローディング画面を表示
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-white text-xl font-semibold mb-2">勤怠管理システム</h2>
        <p className="text-blue-100">読み込み中...</p>
      </div>
    </div>
  )
}