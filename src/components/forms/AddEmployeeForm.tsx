'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  UserCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// バリデーションスキーマ
const createEmployeeSchema = (isEditMode: boolean = false) => z.object({
  name: z.string().min(1, '氏名は必須です').max(50, '氏名は50文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(10, '電話番号は10桁以上で入力してください').max(15, '電話番号は15桁以内で入力してください'),
  password: isEditMode 
    ? z.string().optional().or(z.string().min(8, 'パスワードは8文字以上で入力してください'))
    : z.string().min(8, 'パスワードは8文字以上で入力してください'),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'], { 
    errorMap: () => ({ message: '役職を選択してください' })
  }),
  position: z.string().min(1, '職位は必須です').max(30, '職位は30文字以内で入力してください'),
  department: z.string().min(1, '部署は必須です').max(30, '部署は30文字以内で入力してください'),
  hireDate: z.string().min(1, '入社日は必須です'),
  hourlyWage: z.number().min(800, '時給は800円以上で入力してください').max(10000, '時給は10000円以下で入力してください'),
  address: z.string().min(1, '住所は必須です').max(100, '住所は100文字以内で入力してください'),
  emergencyContact: z.string().min(1, '緊急連絡先氏名は必須です').max(50, '緊急連絡先氏名は50文字以内で入力してください'),
  emergencyPhone: z.string().min(10, '緊急連絡先電話番号は10桁以上で入力してください').max(15, '緊急連絡先電話番号は15桁以内で入力してください'),
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    errorMap: () => ({ message: 'ステータスを選択してください' })
  }),
  currentSite: z.string().optional()
})

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  position: string
  department: string
  hireDate: string
  status: 'ACTIVE' | 'INACTIVE'
  currentSite?: string
  workHoursThisMonth: number
  overtimeHours: number
  lastPunchIn?: string
  hourlyWage: number
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
}

interface AddEmployeeFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  employee?: Employee | null // 編集時に渡される従業員データ
  isEditMode?: boolean
}

export default function AddEmployeeForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  employee = null,
  isEditMode = false 
}: AddEmployeeFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(createEmployeeSchema(isEditMode)),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'EMPLOYEE' as const,
      position: '',
      department: '',
      hireDate: '',
      hourlyWage: 1000,
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      status: 'ACTIVE' as const,
      currentSite: ''
    }
  })

  // 編集モードの場合、フォームにデータを事前設定
  useEffect(() => {
    if (isEditMode && employee) {
      setValue('name', employee.name)
      setValue('email', employee.email)
      setValue('phone', employee.phone)
      setValue('role', employee.role)
      setValue('position', employee.position)
      setValue('department', employee.department)
      setValue('hireDate', employee.hireDate)
      setValue('hourlyWage', employee.hourlyWage)
      setValue('address', employee.address || '')
      setValue('emergencyContact', employee.emergencyContact || '')
      setValue('emergencyPhone', employee.emergencyPhone || '')
      setValue('status', employee.status)
      setValue('currentSite', employee.currentSite || '')
    } else {
      // 新規作成時はフォームをリセット
      reset()
    }
  }, [isEditMode, employee, setValue, reset])

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    
    try {
      // 編集モードの場合、パスワードが空なら削除
      if (isEditMode && !data.password) {
        delete data.password
      }
      
      // 従業員IDを追加（編集時）
      if (isEditMode && employee) {
        data.id = employee.id
      }
      
      await onSubmit(data)
      
      toast.success(isEditMode ? '従業員情報を更新しました' : '従業員を追加しました')
      reset()
      onClose()
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error(isEditMode ? '従業員情報の更新に失敗しました' : '従業員の追加に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <UserCircleIcon className="h-6 w-6 mr-2" />
            {isEditMode ? '従業員情報編集' : '新規従業員追加'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">基本情報</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="山田太郎"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="yamada@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="090-1234-5678"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード {!isEditMode && <span className="text-red-500">*</span>}
                  {isEditMode && <span className="text-sm text-gray-500">(変更する場合のみ入力)</span>}
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder={isEditMode ? '変更する場合のみ入力' : 'パスワードを入力'}
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
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住所 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('address')}
                  type="text"
                  className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                  placeholder="東京都千代田区1-1-1"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 勤務情報 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">勤務情報</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  役職 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('role')}
                  className={`input-field ${errors.role ? 'border-red-500' : ''}`}
                >
                  <option value="EMPLOYEE">従業員</option>
                  <option value="MANAGER">マネージャー</option>
                  <option value="ADMIN">管理者</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  職位 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('position')}
                  type="text"
                  className={`input-field ${errors.position ? 'border-red-500' : ''}`}
                  placeholder="作業員"
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.position.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  部署 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('department')}
                  className={`input-field ${errors.department ? 'border-red-500' : ''}`}
                >
                  <option value="">部署を選択</option>
                  <option value="管理部">管理部</option>
                  <option value="建設部">建設部</option>
                  <option value="営業部">営業部</option>
                  <option value="技術部">技術部</option>
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.department.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  入社日 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('hireDate')}
                  type="date"
                  className={`input-field ${errors.hireDate ? 'border-red-500' : ''}`}
                />
                {errors.hireDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.hireDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  時給 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('hourlyWage', { valueAsNumber: true })}
                  type="number"
                  className={`input-field ${errors.hourlyWage ? 'border-red-500' : ''}`}
                  placeholder="1000"
                  step="10"
                />
                {errors.hourlyWage && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.hourlyWage.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('status')}
                  className={`input-field ${errors.status ? 'border-red-500' : ''}`}
                >
                  <option value="ACTIVE">アクティブ</option>
                  <option value="INACTIVE">非アクティブ</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.status.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  現在の現場
                </label>
                <input
                  {...register('currentSite')}
                  type="text"
                  className="input-field"
                  placeholder="新宿オフィスビル建設現場"
                />
              </div>
            </div>
          </div>

          {/* 緊急連絡先 */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">緊急連絡先</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  緊急連絡先氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('emergencyContact')}
                  type="text"
                  className={`input-field ${errors.emergencyContact ? 'border-red-500' : ''}`}
                  placeholder="山田花子"
                />
                {errors.emergencyContact && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.emergencyContact.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  緊急連絡先電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('emergencyPhone')}
                  type="tel"
                  className={`input-field ${errors.emergencyPhone ? 'border-red-500' : ''}`}
                  placeholder="090-9876-5432"
                />
                {errors.emergencyPhone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.emergencyPhone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditMode ? '更新中...' : '追加中...'}
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  {isEditMode ? '更新' : '追加'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}