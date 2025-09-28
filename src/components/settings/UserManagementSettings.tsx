'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// ユーザーデータの型定義
interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  active: boolean
  lastLoginAt?: string
  createdAt: string
  department?: string
  position?: string
}

// ユーザー作成・編集のスキーマ
const userSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  name: z.string().min(1, '名前は必須です').max(50, '名前は50文字以内で入力してください'),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'], {
    errorMap: () => ({ message: '権限を選択してください' })
  }),
  department: z.string().max(50, '部署名は50文字以内で入力してください').optional(),
  position: z.string().max(50, '役職名は50文字以内で入力してください').optional(),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
})

type UserFormData = z.infer<typeof userSchema>

const roles = [
  { value: 'ADMIN', label: '管理者', description: 'システム全体の管理権限' },
  { value: 'MANAGER', label: 'マネージャー', description: '部署・チーム管理権限' },
  { value: 'EMPLOYEE', label: '従業員', description: '基本的な勤怠機能のみ' },
] as const

const departments = [
  '建設部', '管理部', '営業部', '技術部', '総務部', '人事部', '経理部', '企画部'
]

const positions = [
  '部長', '課長', '係長', '主任', '一般職', '現場監督', '作業員', '事務員'
]

export default function UserManagementSettings() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  // 初期ユーザーデータ
  const defaultUsers: User[] = [
    {
      id: 'admin-demo',
      email: 'admin@example.com',
      name: '管理者太郎',
      role: 'ADMIN',
      active: true,
      lastLoginAt: '2024-09-28 10:30:00',
      createdAt: '2024-01-01 09:00:00',
      department: '管理部',
      position: '部長'
    },
    {
      id: 'employee1-demo',
      email: 'employee1@example.com',
      name: '作業員花子',
      role: 'EMPLOYEE',
      active: true,
      lastLoginAt: '2024-09-28 08:45:00',
      createdAt: '2024-02-15 09:00:00',
      department: '建設部',
      position: '作業員'
    },
    {
      id: 'employee2-demo',
      email: 'employee2@example.com',
      name: '作業員次郎',
      role: 'EMPLOYEE',
      active: true,
      lastLoginAt: '2024-09-27 17:30:00',
      createdAt: '2024-03-01 09:00:00',
      department: '建設部',
      position: '現場監督'
    }
  ]

  useEffect(() => {
    // LocalStorageからユーザーデータを読み込み
    const savedUsers = localStorage.getItem('users')
    if (savedUsers) {
      try {
        const data = JSON.parse(savedUsers)
        setUsers(data)
      } catch (error) {
        console.error('Failed to load users:', error)
        setUsers(defaultUsers)
        localStorage.setItem('users', JSON.stringify(defaultUsers))
      }
    } else {
      setUsers(defaultUsers)
      localStorage.setItem('users', JSON.stringify(defaultUsers))
    }
  }, [])

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers)
    localStorage.setItem('users', JSON.stringify(updatedUsers))
  }

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true)
    try {
      if (editingUser) {
        // ユーザー編集
        const updatedUsers = users.map(user => 
          user.id === editingUser.id 
            ? { 
                ...user, 
                email: data.email, 
                name: data.name, 
                role: data.role,
                department: data.department,
                position: data.position
              }
            : user
        )
        saveUsers(updatedUsers)
        toast.success('ユーザー情報を更新しました')
      } else {
        // 新規ユーザー作成
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: data.email,
          name: data.name,
          role: data.role,
          active: true,
          createdAt: new Date().toLocaleString('ja-JP'),
          department: data.department,
          position: data.position
        }
        const updatedUsers = [...users, newUser]
        saveUsers(updatedUsers)
        toast.success('新しいユーザーを作成しました')
      }
      
      setIsModalOpen(false)
      setEditingUser(null)
      reset()
    } catch (error) {
      console.error('Failed to save user:', error)
      toast.error('保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = () => {
    reset({
      email: '',
      name: '',
      role: 'EMPLOYEE',
      department: '',
      position: '',
      password: '',
      confirmPassword: ''
    })
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    reset({
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department || '',
      position: user.position || '',
      password: '',
      confirmPassword: ''
    })
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleToggleActive = async (userId: string) => {
    try {
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, active: !user.active } : user
      )
      saveUsers(updatedUsers)
      
      const user = users.find(u => u.id === userId)
      toast.success(`${user?.name}のアカウントを${user?.active ? '無効' : '有効'}にしました`)
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      toast.error('ステータス変更に失敗しました')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('本当にこのユーザーを削除しますか？')) return
    
    try {
      const updatedUsers = users.filter(user => user.id !== userId)
      saveUsers(updatedUsers)
      toast.success('ユーザーを削除しました')
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('削除に失敗しました')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800'
      case 'EMPLOYEE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    return roles.find(r => r.value === role)?.label || role
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <UserGroupIcon className="h-6 w-6 text-purple-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">ユーザー管理</h2>
        </div>
        <button
          onClick={handleAddUser}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          新規ユーザー追加
        </button>
      </div>

      {/* ユーザー統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-600">総ユーザー数</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'ADMIN').length}
              </p>
              <p className="text-sm text-gray-600">管理者</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'MANAGER').length}
              </p>
              <p className="text-sm text-gray-600">マネージャー</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.active).length}
              </p>
              <p className="text-sm text-gray-600">有効ユーザー</p>
            </div>
          </div>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー情報
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  権限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  部署・役職
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終ログイン
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{user.department || '-'}</div>
                    <div className="text-xs text-gray-500">{user.position || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLoginAt || 'ログイン履歴なし'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="編集"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(user.id)}
                        className={`${user.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.active ? '無効化' : '有効化'}
                      >
                        {user.active ? <XMarkIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                      </button>
                      {user.id !== 'admin-demo' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="削除"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ユーザー作成・編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingUser ? 'ユーザー編集' : '新規ユーザー作成'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-3 ${
                      errors.email ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-3 ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
              </div>

              {/* 権限選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  権限 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <label key={role.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        {...register('role')}
                        type="radio"
                        value={role.value}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{role.label}</div>
                        <div className="text-xs text-gray-500">{role.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* 部署・役職情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    部署
                  </label>
                  <select
                    {...register('department')}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-3"
                  >
                    <option value="">選択してください</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    役職
                  </label>
                  <select
                    {...register('position')}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-3"
                  >
                    <option value="">選択してください</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* パスワード設定 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingUser ? 'パスワード（変更する場合のみ）' : 'パスワード'} 
                    {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-3 pr-10 ${
                        errors.password ? 'border-red-300' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    パスワード確認
                    {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-3 pr-10 ${
                        errors.confirmPassword ? 'border-red-300' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* 注意事項 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">権限について</p>
                    <ul className="mt-1 list-disc pl-5 space-y-1">
                      <li>管理者: システム全体の設定・管理が可能</li>
                      <li>マネージャー: 部署・チームの管理が可能</li>
                      <li>従業員: 勤怠記録・確認のみ可能</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ボタン */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      保存中...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      {editingUser ? '更新' : '作成'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 操作ガイド */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <UserGroupIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800">
              ユーザー管理について
            </h3>
            <div className="mt-2 text-sm text-purple-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>管理者アカウントは最低1つ必要です</li>
                <li>無効化されたユーザーはログインできません</li>
                <li>削除されたユーザーの勤怠データは保持されます</li>
                <li>パスワードは8文字以上で設定してください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}