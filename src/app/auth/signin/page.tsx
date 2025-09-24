'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon, ClockIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('メールアドレスとパスワードを入力してください')
      return
    }

    setLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('ログインに失敗しました。認証情報を確認してください。')
      } else {
        // セッションを再取得してリダイレクト
        const session = await getSession()
        toast.success('ログインしました')
        
        if (session?.user?.role === 'EMPLOYEE') {
          router.push('/')
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('ログイン処理でエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-construction-blue flex items-center justify-center">
              <ClockIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            建設業勤怠管理システム
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            アカウントにログインしてください
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field"
                  placeholder="mail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-field pr-10"
                    placeholder="パスワードを入力"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner mr-2"></div>
                      ログイン中...
                    </div>
                  ) : (
                    'ログイン'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* デモアカウント情報 */}
        <div className="card bg-blue-50 border-blue-200">
          <div className="card-body">
            <h3 className="text-sm font-medium text-blue-900 mb-3">デモアカウント</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div>
                <strong>管理者:</strong> admin@example.com / password123
              </div>
              <div>
                <strong>従業員1:</strong> employee1@example.com / password123
              </div>
              <div>
                <strong>従業員2:</strong> employee2@example.com / password123
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>
            GPS機能を使用するため、ブラウザでの位置情報許可が必要です
          </p>
        </div>
      </div>
    </div>
  )
}