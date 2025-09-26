'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon, ClockIcon, UsersIcon, UserIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showManualLogin, setShowManualLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('メールアドレスとパスワードを入力してください')
      return
    }

    await performLogin(email, password)
  }

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
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

  const handleQuickLogin = async (userType: 'admin' | 'employee') => {
    const credentials = {
      admin: { email: 'admin@example.com', password: 'password123' },
      employee: { email: 'employee1@example.com', password: 'password123' }
    }
    
    const { email, password } = credentials[userType]
    setEmail(email)
    setPassword(password)
    await performLogin(email, password)
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
            クイックログインボタンでデモアカウントにログイン
          </p>
        </div>

        {/* クイックログイン */}
        <div className="card bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">クイックログイン</h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              デモアカウントでワンクリックログイン
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <UsersIcon className="h-6 w-6" />
                <span>管理者ログイン</span>
              </button>
              
              <button
                onClick={() => handleQuickLogin('employee')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <UserIcon className="h-6 w-6" />
                <span>従業員ログイン</span>
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-white rounded-lg shadow-inner">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">デモアカウント情報:</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div><strong>管理者:</strong> admin@example.com / password123</div>
                <div><strong>従業員:</strong> employee1@example.com / password123</div>
              </div>
            </div>
          </div>
        </div>

        {/* 手動ログイン（折りたたみ式） */}
        <div className="card">
          <div className="card-body">
            <button 
              type="button"
              onClick={() => setShowManualLogin(!showManualLogin)}
              className="w-full flex items-center justify-center py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span>手動でログインする場合はこちら</span>
              <svg 
                className={`ml-2 h-4 w-4 transition-transform ${showManualLogin ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showManualLogin && (
              <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
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
            )}
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