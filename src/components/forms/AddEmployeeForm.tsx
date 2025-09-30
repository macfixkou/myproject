'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyYenIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

// 従業員追加・編集用のスキーマを動的に作成
const createEmployeeFormSchema = (isEdit: boolean) => {
  const baseSchema = z.object({
    // 基本情報
    name: z.string().min(1, '氏名は必須です').max(50, '氏名は50文字以内で入力してください'),
    email: z.string().email('有効なメールアドレスを入力してください'),
    phone: z.string()
      .regex(/^[0-9-]+$/, '電話番号は数字とハイフンのみ使用できます')
      .min(10, '電話番号を正しく入力してください'),
    address: z.string().min(1, '住所は必須です').max(200, '住所は200文字以内で入力してください'),
    
    // 勤務情報
    role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'], {
      errorMap: () => ({ message: '役職を選択してください' })
    }),
    position: z.string().min(1, '職位は必須です').max(50, '職位は50文字以内で入力してください'),
    department: z.string().min(1, '部署は必須です').max(50, '部署は50文字以内で入力してください'),
    hireDate: z.string().min(1, '入社日は必須です'),
    hourlyWage: z.number()
      .min(800, '時給は800円以上で設定してください')
      .max(10000, '時給は10,000円以下で設定してください'),
    
    // 緊急連絡先
    emergencyContact: z.string().min(1, '緊急連絡先氏名は必須です').max(50, '緊急連絡先氏名は50文字以内で入力してください'),
    emergencyPhone: z.string()
      .regex(/^[0-9-]+$/, '緊急連絡先電話番号は数字とハイフンのみ使用できます')
      .min(10, '緊急連絡先電話番号を正しく入力してください'),
    
    // その他
    notes: z.string().max(500, '備考は500文字以内で入力してください').optional(),
  })

  // 編集モードの場合はパスワードをオプションに
  if (isEdit) {
    return baseSchema.extend({
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
    }).refine(
      (data) => !data.password || data.password === data.confirmPassword,
      {
        message: "パスワードが一致しません",
        path: ["confirmPassword"],
      }
    )
  }

  // 新規作成の場合はパスワード必須
  return baseSchema.extend({
    password: z.string()
      .min(6, 'パスワードは6文字以上で入力してください')
      .max(100, 'パスワードは100文字以内で入力してください'),
    confirmPassword: z.string(),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "パスワードが一致しません",
      path: ["confirmPassword"],
    }
  )
}

type EmployeeFormData = z.infer<ReturnType<typeof createEmployeeFormSchema>>

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  position: string
  department: string
  hireDate: string
  status: 'ACTIVE' | 'INACTIVE'
  hourlyWage: number
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
}

interface AddEmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  employee?: Employee
  isEdit?: boolean
}

export default function AddEmployeeForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  employee,
  isEdit = false 
}: AddEmployeeFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const employeeFormSchema = createEmployeeFormSchema(isEdit)
  
  const getDefaultValues = () => {
    const baseDefaults = {
      role: 'EMPLOYEE' as const,
      hireDate: new Date().toISOString().split('T')[0],
      hourlyWage: 1000,
    }

    if (isEdit && employee) {
      return {
        ...baseDefaults,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        address: employee.address || '',
        role: employee.role,
        position: employee.position,
        department: employee.department,
        hireDate: employee.hireDate,
        hourlyWage: employee.hourlyWage,
        emergencyContact: employee.emergencyContact || '',
        emergencyPhone: employee.emergencyPhone || '',
        password: '',
        confirmPassword: '',
        notes: '',
      }
    }

    return baseDefaults
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    mode: 'onChange',
    defaultValues: getDefaultValues()
  })

  const watchRole = watch('role')

  const handleFormSubmit = async (data: EmployeeFormData) => {
    setSubmitError(null)
    try {
      // パスワード確認の最終チェック（新規作成時のみ）
      if (!isEdit && data.password !== data.confirmPassword) {
        setSubmitError('パスワードが一致しません')
        return
      }
      
      console.log('Submitting employee data:', data)
      
      // confirmPasswordを除いたデータを送信
      const { confirmPassword, ...submitData } = data
      
      // 編集モードの場合はIDを追加
      if (isEdit && employee) {
        (submitData as any).id = employee.id
      }
      
      // パスワードが空の場合は削除（編集モード時）
      if (isEdit && (!submitData.password || submitData.password.trim() === '')) {
        delete submitData.password
      }
      
      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
      const errorMessage = error instanceof Error ? error.message : 
        isEdit ? '従業員の更新に失敗しました' : '従業員の追加に失敗しました'
      setSubmitError(errorMessage)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof EmployeeFormData)[] = []
    
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'email', 'phone', 'address']
    } else if (currentStep === 2) {
      fieldsToValidate = ['role', 'position', 'department', 'hireDate', 'hourlyWage']
    }
    
    const result = await trigger(fieldsToValidate)
    if (result) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return '管理者'
      case 'MANAGER': return 'マネージャー'
      case 'EMPLOYEE': return '従業員'
      default: return role
    }
  }

  const steps = [
    { id: 1, name: '基本情報', icon: UserIcon },
    { id: 2, name: '勤務情報', icon: BriefcaseIcon },
    { id: 3, name: '緊急連絡先・パスワード', icon: UserGroupIcon },
  ]

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserIcon className="h-6 w-6 text-white mr-3" />
              <h3 className="text-xl font-semibold text-white">
                {isEdit ? '従業員情報編集' : '新規従業員追加'}
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="text-blue-100 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'border-blue-600 bg-blue-600 text-white' 
                    : 'border-gray-300 bg-white text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-px mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{submitError}</span>
              </div>
            </div>
          )}

          {/* ステップ1: 基本情報 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">基本情報</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                    placeholder="山田太郎"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      {...register('email')}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 pl-10"
                      placeholder="yamada@example.com"
                    />
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      {...register('phone')}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 pl-10"
                      placeholder="090-1234-5678"
                    />
                    <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    住所 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      {...register('address')}
                      rows={3}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 pl-10"
                      placeholder="東京都新宿区1-1-1 マンション名 101号室"
                    />
                    <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ステップ2: 勤務情報 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <BriefcaseIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">勤務情報</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    役職 <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('role')}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                  >
                    <option value="EMPLOYEE">従業員</option>
                    <option value="MANAGER">マネージャー</option>
                    <option value="ADMIN">管理者</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    職位 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('position')}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                    placeholder="作業員、現場監督、等"
                  />
                  {errors.position && (
                    <p className="text-red-600 text-sm mt-1">{errors.position.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    部署 <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('department')}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                  >
                    <option value="">部署を選択してください</option>
                    <option value="建設部">建設部</option>
                    <option value="管理部">管理部</option>
                    <option value="営業部">営業部</option>
                    <option value="経理部">経理部</option>
                    <option value="総務部">総務部</option>
                  </select>
                  {errors.department && (
                    <p className="text-red-600 text-sm mt-1">{errors.department.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    入社日 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register('hireDate')}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 pl-10"
                    />
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                  {errors.hireDate && (
                    <p className="text-red-600 text-sm mt-1">{errors.hireDate.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    時給 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register('hourlyWage', { valueAsNumber: true })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 pl-10 pr-12"
                      min="800"
                      max="10000"
                      step="50"
                    />
                    <CurrencyYenIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                    <span className="absolute right-3 top-3.5 text-gray-500">円</span>
                  </div>
                  {errors.hourlyWage && (
                    <p className="text-red-600 text-sm mt-1">{errors.hourlyWage.message}</p>
                  )}
                </div>
              </div>

              {/* 役職に応じた説明 */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h5 className="text-sm font-medium text-blue-900 mb-2">選択した役職: {getRoleLabel(watchRole)}</h5>
                <p className="text-sm text-blue-700">
                  {watchRole === 'ADMIN' && '管理者は全ての機能にアクセスでき、システム設定や従業員管理が可能です。'}
                  {watchRole === 'MANAGER' && 'マネージャーは現場管理、勤怠承認、レポート確認などの管理業務が可能です。'}
                  {watchRole === 'EMPLOYEE' && '従業員は勤怠打刻、個人の勤務状況確認などの基本機能が利用できます。'}
                </p>
              </div>
            </div>
          )}

          {/* ステップ3: 緊急連絡先・パスワード */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <UserGroupIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">緊急連絡先・アカウント設定</h4>
              </div>

              <div className="space-y-6">
                {/* 緊急連絡先 */}
                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-4">緊急連絡先</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        緊急連絡先氏名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('emergencyContact')}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                        placeholder="山田花子"
                      />
                      {errors.emergencyContact && (
                        <p className="text-red-600 text-sm mt-1">{errors.emergencyContact.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        緊急連絡先電話番号 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          {...register('emergencyPhone')}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 pl-10"
                          placeholder="090-9876-5432"
                        />
                        <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                      </div>
                      {errors.emergencyPhone && (
                        <p className="text-red-600 text-sm mt-1">{errors.emergencyPhone.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* パスワード設定 */}
                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-4">
                    ログインパスワード設定 {isEdit && <span className="text-sm font-normal text-gray-600">(変更する場合のみ入力)</span>}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        パスワード {!isEdit && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...register('password')}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 pr-10"
                          placeholder={isEdit ? "新しいパスワード（変更しない場合は空白）" : "6文字以上"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        パスワード確認 {!isEdit && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...register('confirmPassword')}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 pr-10"
                          placeholder={isEdit ? "上記と同じパスワード" : "上記と同じパスワード"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                  {isEdit && (
                    <p className="text-sm text-gray-600 mt-2">
                      パスワードを変更しない場合は、両方のフィールドを空白にしてください。
                    </p>
                  )}
                </div>

                {/* 備考 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    備考（任意）
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={4}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                    placeholder="その他の特記事項があれば入力してください（任意）"
                  />
                  {errors.notes && (
                    <p className="text-red-600 text-sm mt-1">{errors.notes.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* フッターボタン */}
          <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              ステップ {currentStep} / {totalSteps}
            </div>
            
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isLoading}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  戻る
                </button>
              )}
              
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                キャンセル
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {isEdit ? '従業員情報を更新' : '従業員を追加'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}