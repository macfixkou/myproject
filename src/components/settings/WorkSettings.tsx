'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ClockIcon,
  CheckIcon,
  CalendarDaysIcon,
  SunIcon,
  MoonIcon,
  InformationCircleIcon,
  CurrencyYenIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const workSettingsSchema = z.object({
  // 基本勤務時間
  standardWorkHours: z.number().min(1, '標準労働時間は1時間以上で設定してください').max(24, '標準労働時間は24時間以内で設定してください'),
  standardWorkMinutes: z.number().min(0, '分は0以上で設定してください').max(59, '分は59以下で設定してください'),
  lunchBreakMinutes: z.number().min(0, '休憩時間は0分以上で設定してください').max(480, '休憩時間は8時間以内で設定してください'),
  
  // 勤務開始・終了時間
  standardStartTime: z.string().min(1, '標準開始時間は必須です'),
  standardEndTime: z.string().min(1, '標準終了時間は必須です'),
  
  // 残業設定
  overtimeThresholdHours: z.number().min(1, '残業開始時間は1時間以上で設定してください').max(24, '残業開始時間は24時間以内で設定してください'),
  overtimeRate: z.number().min(100, '残業割増率は100%以上で設定してください').max(500, '残業割増率は500%以内で設定してください'),
  
  // 深夜勤務設定
  nightWorkStartTime: z.string().min(1, '深夜勤務開始時間は必須です'),
  nightWorkEndTime: z.string().min(1, '深夜勤務終了時間は必須です'),
  nightWorkRate: z.number().min(100, '深夜割増率は100%以上で設定してください').max(500, '深夜割増率は500%以内で設定してください'),
  
  // 休日勤務設定
  holidayWorkRate: z.number().min(100, '休日割増率は100%以上で設定してください').max(500, '休日割増率は500%以内で設定してください'),
  
  // 遅刻・早退設定
  lateArrivalGraceMinutes: z.number().min(0, '遅刻猶予時間は0分以上で設定してください').max(60, '遅刻猶予時間は60分以内で設定してください'),
  earlyLeaveGraceMinutes: z.number().min(0, '早退猶予時間は0分以上で設定してください').max(60, '早退猶予時間は60分以内で設定してください'),
  
  // 打刻設定
  clockInWindowMinutes: z.number().min(0, '出勤打刻可能時間は0分以上で設定してください').max(240, '出勤打刻可能時間は4時間以内で設定してください'),
  clockOutWindowMinutes: z.number().min(0, '退勤打刻可能時間は0分以上で設定してください').max(240, '退勤打刻可能時間は4時間以内で設定してください'),
  
  // 週労働時間
  weeklyWorkHours: z.number().min(1, '週労働時間は1時間以上で設定してください').max(168, '週労働時間は168時間以内で設定してください'),
  
  // 月労働時間上限
  monthlyOvertimeLimit: z.number().min(0, '月間残業上限は0時間以上で設定してください').max(200, '月間残業上限は200時間以内で設定してください'),
  
  // 自動休憩設定
  autoBreakEnabled: z.boolean(),
  autoBreakThresholdHours: z.number().min(0, '自動休憩開始時間は0時間以上で設定してください').max(12, '自動休憩開始時間は12時間以内で設定してください'),
  autoBreakMinutes: z.number().min(0, '自動休憩時間は0分以上で設定してください').max(120, '自動休憩時間は2時間以内で設定してください'),
  
  // 丸め設定
  roundingUnit: z.enum(['none', '15min', '30min', '1hour'], {
    errorMap: () => ({ message: '丸め単位を選択してください' })
  }),
  roundingMethod: z.enum(['up', 'down', 'round'], {
    errorMap: () => ({ message: '丸め方法を選択してください' })
  }),
})

type WorkSettingsFormData = z.infer<typeof workSettingsSchema>

const roundingUnits = [
  { value: 'none', label: '丸めなし' },
  { value: '15min', label: '15分単位' },
  { value: '30min', label: '30分単位' },
  { value: '1hour', label: '1時間単位' }
]

const roundingMethods = [
  { value: 'up', label: '切り上げ' },
  { value: 'down', label: '切り捨て' },
  { value: 'round', label: '四捨五入' }
]

export default function WorkSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<WorkSettingsFormData>({
    resolver: zodResolver(workSettingsSchema),
    defaultValues: {
      standardWorkHours: 8,
      standardWorkMinutes: 0,
      lunchBreakMinutes: 60,
      standardStartTime: '09:00',
      standardEndTime: '18:00',
      overtimeThresholdHours: 8,
      overtimeRate: 125,
      nightWorkStartTime: '22:00',
      nightWorkEndTime: '05:00',
      nightWorkRate: 125,
      holidayWorkRate: 135,
      lateArrivalGraceMinutes: 5,
      earlyLeaveGraceMinutes: 5,
      clockInWindowMinutes: 30,
      clockOutWindowMinutes: 60,
      weeklyWorkHours: 40,
      monthlyOvertimeLimit: 45,
      autoBreakEnabled: true,
      autoBreakThresholdHours: 6,
      autoBreakMinutes: 45,
      roundingUnit: '15min',
      roundingMethod: 'round',
    }
  })

  const autoBreakEnabled = watch('autoBreakEnabled')

  useEffect(() => {
    // LocalStorageから勤務設定を読み込み
    const savedData = localStorage.getItem('workSettings')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        reset(data)
      } catch (error) {
        console.error('Failed to load work settings:', error)
      }
    }
  }, [reset])

  const onSubmit = async (data: WorkSettingsFormData) => {
    setIsLoading(true)
    try {
      // LocalStorageに保存（実際のプロジェクトではAPIに送信）
      localStorage.setItem('workSettings', JSON.stringify(data))
      
      // 成功のトーストを表示
      toast.success('勤務設定を保存しました')
      setIsEditing(false)
      
      console.log('Work settings saved:', data)
    } catch (error) {
      console.error('Failed to save work settings:', error)
      toast.error('保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // フォームをリセット
    const savedData = localStorage.getItem('workSettings')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        reset(data)
      } catch (error) {
        console.error('Failed to reset form:', error)
      }
    }
    setIsEditing(false)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ClockIcon className="h-6 w-6 text-green-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">勤務時間設定</h2>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            編集する
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  保存
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 基本勤務時間設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <SunIcon className="h-5 w-5 mr-2 text-gray-600" />
            基本勤務時間
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                標準労働時間 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('standardWorkHours', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="1"
                  max="24"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.standardWorkHours ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">時間</span>
                <input
                  {...register('standardWorkMinutes', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  max="59"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.standardWorkMinutes ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">分</span>
              </div>
              {(errors.standardWorkHours || errors.standardWorkMinutes) && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.standardWorkHours?.message || errors.standardWorkMinutes?.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                標準開始時間 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('standardStartTime')}
                type="time"
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.standardStartTime ? 'border-red-300' : ''}`}
              />
              {errors.standardStartTime && (
                <p className="mt-1 text-sm text-red-600">{errors.standardStartTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                標準終了時間 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('standardEndTime')}
                type="time"
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.standardEndTime ? 'border-red-300' : ''}`}
              />
              {errors.standardEndTime && (
                <p className="mt-1 text-sm text-red-600">{errors.standardEndTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                昼休憩時間 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('lunchBreakMinutes', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  max="480"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.lunchBreakMinutes ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">分</span>
              </div>
              {errors.lunchBreakMinutes && (
                <p className="mt-1 text-sm text-red-600">{errors.lunchBreakMinutes.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 残業・割増設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CurrencyYenIcon className="h-5 w-5 mr-2 text-gray-600" />
            残業・割増設定
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                残業開始時間 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('overtimeThresholdHours', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="1"
                  max="24"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.overtimeThresholdHours ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">時間後</span>
              </div>
              {errors.overtimeThresholdHours && (
                <p className="mt-1 text-sm text-red-600">{errors.overtimeThresholdHours.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                残業割増率 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('overtimeRate', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="100"
                  max="500"
                  step="5"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.overtimeRate ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">%</span>
              </div>
              {errors.overtimeRate && (
                <p className="mt-1 text-sm text-red-600">{errors.overtimeRate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                深夜割増率 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('nightWorkRate', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="100"
                  max="500"
                  step="5"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.nightWorkRate ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">%</span>
              </div>
              {errors.nightWorkRate && (
                <p className="mt-1 text-sm text-red-600">{errors.nightWorkRate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                休日割増率 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('holidayWorkRate', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="100"
                  max="500"
                  step="5"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.holidayWorkRate ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">%</span>
              </div>
              {errors.holidayWorkRate && (
                <p className="mt-1 text-sm text-red-600">{errors.holidayWorkRate.message}</p>
              )}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                深夜勤務開始時間 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('nightWorkStartTime')}
                type="time"
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.nightWorkStartTime ? 'border-red-300' : ''}`}
              />
              {errors.nightWorkStartTime && (
                <p className="mt-1 text-sm text-red-600">{errors.nightWorkStartTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                深夜勤務終了時間 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('nightWorkEndTime')}
                type="time"
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.nightWorkEndTime ? 'border-red-300' : ''}`}
              />
              {errors.nightWorkEndTime && (
                <p className="mt-1 text-sm text-red-600">{errors.nightWorkEndTime.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 打刻・猶予時間設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-600" />
            打刻・猶予時間設定
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                遅刻猶予時間
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('lateArrivalGraceMinutes', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  max="60"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.lateArrivalGraceMinutes ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">分</span>
              </div>
              {errors.lateArrivalGraceMinutes && (
                <p className="mt-1 text-sm text-red-600">{errors.lateArrivalGraceMinutes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                早退猶予時間
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('earlyLeaveGraceMinutes', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  max="60"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.earlyLeaveGraceMinutes ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">分</span>
              </div>
              {errors.earlyLeaveGraceMinutes && (
                <p className="mt-1 text-sm text-red-600">{errors.earlyLeaveGraceMinutes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                出勤打刻可能時間
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('clockInWindowMinutes', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  max="240"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.clockInWindowMinutes ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">分前</span>
              </div>
              {errors.clockInWindowMinutes && (
                <p className="mt-1 text-sm text-red-600">{errors.clockInWindowMinutes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                退勤打刻可能時間
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('clockOutWindowMinutes', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  max="240"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.clockOutWindowMinutes ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">分後</span>
              </div>
              {errors.clockOutWindowMinutes && (
                <p className="mt-1 text-sm text-red-600">{errors.clockOutWindowMinutes.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 労働時間上限設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MoonIcon className="h-5 w-5 mr-2 text-gray-600" />
            労働時間上限設定
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                週労働時間上限 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('weeklyWorkHours', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="1"
                  max="168"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.weeklyWorkHours ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">時間/週</span>
              </div>
              {errors.weeklyWorkHours && (
                <p className="mt-1 text-sm text-red-600">{errors.weeklyWorkHours.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                月間残業上限 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('monthlyOvertimeLimit', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  max="200"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.monthlyOvertimeLimit ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">時間/月</span>
              </div>
              {errors.monthlyOvertimeLimit && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyOvertimeLimit.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 自動休憩設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-gray-600" />
            自動休憩設定
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register('autoBreakEnabled')}
                type="checkbox"
                disabled={!isEditing}
                className={`h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded ${
                  !isEditing ? 'opacity-50' : ''
                }`}
              />
              <label className="ml-2 block text-sm text-gray-900">
                自動休憩を有効にする
              </label>
            </div>
            
            {autoBreakEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自動休憩開始時間
                  </label>
                  <div className="flex space-x-2">
                    <input
                      {...register('autoBreakThresholdHours', { valueAsNumber: true })}
                      type="number"
                      disabled={!isEditing}
                      min="0"
                      max="12"
                      className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      } ${errors.autoBreakThresholdHours ? 'border-red-300' : ''}`}
                    />
                    <span className="text-sm text-gray-500 self-center">時間後</span>
                  </div>
                  {errors.autoBreakThresholdHours && (
                    <p className="mt-1 text-sm text-red-600">{errors.autoBreakThresholdHours.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自動休憩時間
                  </label>
                  <div className="flex space-x-2">
                    <input
                      {...register('autoBreakMinutes', { valueAsNumber: true })}
                      type="number"
                      disabled={!isEditing}
                      min="0"
                      max="120"
                      className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      } ${errors.autoBreakMinutes ? 'border-red-300' : ''}`}
                    />
                    <span className="text-sm text-gray-500 self-center">分</span>
                  </div>
                  {errors.autoBreakMinutes && (
                    <p className="mt-1 text-sm text-red-600">{errors.autoBreakMinutes.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 丸め設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-2 text-gray-600" />
            勤務時間丸め設定
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                丸め単位 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('roundingUnit')}
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.roundingUnit ? 'border-red-300' : ''}`}
              >
                {roundingUnits.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
              {errors.roundingUnit && (
                <p className="mt-1 text-sm text-red-600">{errors.roundingUnit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                丸め方法 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('roundingMethod')}
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-green-500 focus:border-green-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.roundingMethod ? 'border-red-300' : ''}`}
              >
                {roundingMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              {errors.roundingMethod && (
                <p className="mt-1 text-sm text-red-600">{errors.roundingMethod.message}</p>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* 操作ガイド */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              勤務時間設定について
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>設定変更は全従業員に適用されます</li>
                <li>労働基準法に準拠した設定を行ってください</li>
                <li>深夜勤務時間は22:00〜5:00が法定時間です</li>
                <li>残業割増率は25%以上、休日割増率は35%以上で設定してください</li>
                <li>月間残業上限は36協定に基づいて設定してください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}