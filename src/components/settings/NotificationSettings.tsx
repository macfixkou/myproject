'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  BellIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  SpeakerWaveIcon,
  InformationCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const notificationSettingsSchema = z.object({
  // メール通知設定
  emailNotificationsEnabled: z.boolean(),
  emailOnLateArrival: z.boolean(),
  emailOnEarlyLeave: z.boolean(),
  emailOnAbsence: z.boolean(),
  emailOnOvertimeLimit: z.boolean(),
  emailDailyReport: z.boolean(),
  emailWeeklyReport: z.boolean(),
  emailMonthlyReport: z.boolean(),
  emailAddress: z.string().email('正しいメールアドレスを入力してください').optional().or(z.literal('')),
  
  // プッシュ通知設定
  pushNotificationsEnabled: z.boolean(),
  pushOnClockReminder: z.boolean(),
  pushOnScheduleChange: z.boolean(),
  pushOnImportantAnnouncement: z.boolean(),
  
  // アラート設定
  systemAlertsEnabled: z.boolean(),
  alertOnDataBackup: z.boolean(),
  alertOnSystemMaintenance: z.boolean(),
  alertOnSecurityEvent: z.boolean(),
  
  // 通知タイミング設定
  clockInReminderMinutes: z.number().min(0, '0分以上で設定してください').max(60, '60分以内で設定してください'),
  clockOutReminderMinutes: z.number().min(0, '0分以上で設定してください').max(60, '60分以内で設定してください'),
  overtimeAlertHours: z.number().min(1, '1時間以上で設定してください').max(24, '24時間以内で設定してください'),
  
  // レポート送信時刻
  dailyReportTime: z.string().min(1, '送信時刻は必須です'),
  weeklyReportDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], {
    errorMap: () => ({ message: '送信曜日を選択してください' })
  }),
  monthlyReportDay: z.number().min(1, '1日以上で設定してください').max(31, '31日以下で設定してください'),
  
  // 通知音設定
  soundEnabled: z.boolean(),
  soundVolume: z.number().min(0, '0以上で設定してください').max(100, '100以下で設定してください'),
  soundType: z.enum(['default', 'chime', 'alert', 'notification'], {
    errorMap: () => ({ message: '通知音を選択してください' })
  }),
  
  // 休日・勤務時間外通知
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string().min(1, '開始時刻は必須です'),
  quietHoursEnd: z.string().min(1, '終了時刻は必須です'),
  holidayNotificationsEnabled: z.boolean(),
  
  // 通知の優先度設定
  highPriorityEvents: z.array(z.string()),
  mediumPriorityEvents: z.array(z.string()),
  lowPriorityEvents: z.array(z.string()),
})

type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>

const daysOfWeek = [
  { value: 'monday', label: '月曜日' },
  { value: 'tuesday', label: '火曜日' },
  { value: 'wednesday', label: '水曜日' },
  { value: 'thursday', label: '木曜日' },
  { value: 'friday', label: '金曜日' },
  { value: 'saturday', label: '土曜日' },
  { value: 'sunday', label: '日曜日' },
]

const soundTypes = [
  { value: 'default', label: 'デフォルト' },
  { value: 'chime', label: 'チャイム' },
  { value: 'alert', label: 'アラート' },
  { value: 'notification', label: '通知音' },
]

const eventTypes = [
  { id: 'late_arrival', label: '遅刻', description: '出勤予定時刻を過ぎた場合' },
  { id: 'early_leave', label: '早退', description: '退勤予定時刻より早い場合' },
  { id: 'absence', label: '欠勤', description: '無断欠勤が発生した場合' },
  { id: 'overtime', label: '残業', description: '残業時間が上限に近づいた場合' },
  { id: 'clock_reminder', label: '打刻リマインダー', description: '打刻忘れの可能性がある場合' },
  { id: 'schedule_change', label: 'スケジュール変更', description: 'シフト変更等があった場合' },
  { id: 'system_alert', label: 'システムアラート', description: 'システム関連の重要な通知' },
  { id: 'maintenance', label: 'メンテナンス', description: 'システムメンテナンス予告' },
]

export default function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [testNotificationSent, setTestNotificationSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      // メール通知
      emailNotificationsEnabled: true,
      emailOnLateArrival: true,
      emailOnEarlyLeave: true,
      emailOnAbsence: true,
      emailOnOvertimeLimit: true,
      emailDailyReport: false,
      emailWeeklyReport: true,
      emailMonthlyReport: true,
      emailAddress: 'admin@example.com',
      
      // プッシュ通知
      pushNotificationsEnabled: true,
      pushOnClockReminder: true,
      pushOnScheduleChange: true,
      pushOnImportantAnnouncement: true,
      
      // システムアラート
      systemAlertsEnabled: true,
      alertOnDataBackup: true,
      alertOnSystemMaintenance: true,
      alertOnSecurityEvent: true,
      
      // 通知タイミング
      clockInReminderMinutes: 10,
      clockOutReminderMinutes: 15,
      overtimeAlertHours: 8,
      
      // レポート設定
      dailyReportTime: '18:00',
      weeklyReportDay: 'friday',
      monthlyReportDay: 1,
      
      // 通知音
      soundEnabled: true,
      soundVolume: 70,
      soundType: 'default',
      
      // 休止時間
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      holidayNotificationsEnabled: false,
      
      // 優先度
      highPriorityEvents: ['absence', 'system_alert', 'maintenance'],
      mediumPriorityEvents: ['late_arrival', 'overtime', 'schedule_change'],
      lowPriorityEvents: ['early_leave', 'clock_reminder'],
    }
  })

  const emailEnabled = watch('emailNotificationsEnabled')
  const pushEnabled = watch('pushNotificationsEnabled')
  const systemAlertsEnabled = watch('systemAlertsEnabled')
  const quietHoursEnabled = watch('quietHoursEnabled')
  const soundEnabled = watch('soundEnabled')

  useEffect(() => {
    // LocalStorageから通知設定を読み込み
    const savedData = localStorage.getItem('notificationSettings')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        reset(data)
      } catch (error) {
        console.error('Failed to load notification settings:', error)
      }
    }
  }, [reset])

  const onSubmit = async (data: NotificationSettingsFormData) => {
    setIsLoading(true)
    try {
      // LocalStorageに保存（実際のプロジェクトではAPIに送信）
      localStorage.setItem('notificationSettings', JSON.stringify(data))
      
      // 成功のトーストを表示
      toast.success('通知設定を保存しました')
      setIsEditing(false)
      
      console.log('Notification settings saved:', data)
    } catch (error) {
      console.error('Failed to save notification settings:', error)
      toast.error('保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // フォームをリセット
    const savedData = localStorage.getItem('notificationSettings')
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

  const handleTestNotification = async () => {
    try {
      // テスト通知を送信（実際の実装ではAPI呼び出し）
      toast.success('テスト通知を送信しました')
      setTestNotificationSent(true)
      setTimeout(() => setTestNotificationSent(false), 3000)
    } catch (error) {
      toast.error('テスト通知の送信に失敗しました')
    }
  }

  const handlePriorityChange = (eventId: string, newPriority: string) => {
    if (!isEditing) return
    
    // 他の優先度から削除
    const highPriority = watch('highPriorityEvents').filter(id => id !== eventId)
    const mediumPriority = watch('mediumPriorityEvents').filter(id => id !== eventId)
    const lowPriority = watch('lowPriorityEvents').filter(id => id !== eventId)
    
    // 新しい優先度に追加
    switch (newPriority) {
      case 'high':
        setValue('highPriorityEvents', [...highPriority, eventId])
        break
      case 'medium':
        setValue('mediumPriorityEvents', [...mediumPriority, eventId])
        break
      case 'low':
        setValue('lowPriorityEvents', [...lowPriority, eventId])
        break
    }
    
    setValue('mediumPriorityEvents', mediumPriority)
    setValue('lowPriorityEvents', lowPriority)
  }

  const getEventPriority = (eventId: string) => {
    if (watch('highPriorityEvents').includes(eventId)) return 'high'
    if (watch('mediumPriorityEvents').includes(eventId)) return 'medium'
    if (watch('lowPriorityEvents').includes(eventId)) return 'low'
    return 'medium' // デフォルト
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高'
      case 'medium':
        return '中'
      case 'low':
        return '低'
      default:
        return '-'
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BellIcon className="h-6 w-6 text-orange-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">通知設定</h2>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleTestNotification}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                テスト通知
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                編集する
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center"
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
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* メール通知設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-600" />
            メール通知設定
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register('emailNotificationsEnabled')}
                type="checkbox"
                disabled={!isEditing}
                className={`h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${
                  !isEditing ? 'opacity-50' : ''
                }`}
              />
              <label className="ml-2 block text-sm font-medium text-gray-900">
                メール通知を有効にする
              </label>
            </div>

            {emailEnabled && (
              <div className="pl-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    通知先メールアドレス
                  </label>
                  <input
                    {...register('emailAddress')}
                    type="email"
                    disabled={!isEditing}
                    className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-orange-500 focus:border-orange-500' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    } ${errors.emailAddress ? 'border-red-300' : ''}`}
                  />
                  {errors.emailAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.emailAddress.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">勤怠関連通知</h4>
                    {[
                      { key: 'emailOnLateArrival', label: '遅刻発生時' },
                      { key: 'emailOnEarlyLeave', label: '早退発生時' },
                      { key: 'emailOnAbsence', label: '欠勤発生時' },
                      { key: 'emailOnOvertimeLimit', label: '残業上限接近時' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center">
                        <input
                          {...register(item.key as keyof NotificationSettingsFormData)}
                          type="checkbox"
                          disabled={!isEditing}
                          className={`h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${
                            !isEditing ? 'opacity-50' : ''
                          }`}
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">レポート通知</h4>
                    {[
                      { key: 'emailDailyReport', label: '日次レポート' },
                      { key: 'emailWeeklyReport', label: '週次レポート' },
                      { key: 'emailMonthlyReport', label: '月次レポート' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center">
                        <input
                          {...register(item.key as keyof NotificationSettingsFormData)}
                          type="checkbox"
                          disabled={!isEditing}
                          className={`h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${
                            !isEditing ? 'opacity-50' : ''
                          }`}
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* プッシュ通知設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <DevicePhoneMobileIcon className="h-5 w-5 mr-2 text-gray-600" />
            プッシュ通知設定
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register('pushNotificationsEnabled')}
                type="checkbox"
                disabled={!isEditing}
                className={`h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${
                  !isEditing ? 'opacity-50' : ''
                }`}
              />
              <label className="ml-2 block text-sm font-medium text-gray-900">
                プッシュ通知を有効にする
              </label>
            </div>

            {pushEnabled && (
              <div className="pl-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'pushOnClockReminder', label: '打刻リマインダー' },
                  { key: 'pushOnScheduleChange', label: 'スケジュール変更' },
                  { key: 'pushOnImportantAnnouncement', label: '重要なお知らせ' }
                ].map(item => (
                  <div key={item.key} className="flex items-center">
                    <input
                      {...register(item.key as keyof NotificationSettingsFormData)}
                      type="checkbox"
                      disabled={!isEditing}
                      className={`h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${
                        !isEditing ? 'opacity-50' : ''
                      }`}
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* システムアラート設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-gray-600" />
            システムアラート設定
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register('systemAlertsEnabled')}
                type="checkbox"
                disabled={!isEditing}
                className={`h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${
                  !isEditing ? 'opacity-50' : ''
                }`}
              />
              <label className="ml-2 block text-sm font-medium text-gray-900">
                システムアラートを有効にする
              </label>
            </div>

            {systemAlertsEnabled && (
              <div className="pl-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'alertOnDataBackup', label: 'データバックアップ' },
                  { key: 'alertOnSystemMaintenance', label: 'システムメンテナンス' },
                  { key: 'alertOnSecurityEvent', label: 'セキュリティイベント' }
                ].map(item => (
                  <div key={item.key} className="flex items-center">
                    <input
                      {...register(item.key as keyof NotificationSettingsFormData)}
                      type="checkbox"
                      disabled={!isEditing}
                      className={`h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${
                        !isEditing ? 'opacity-50' : ''
                      }`}
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 通知タイミング設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-gray-600" />
            通知タイミング設定
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                出勤リマインダー
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('clockInReminderMinutes', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  max="60"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-orange-500 focus:border-orange-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.clockInReminderMinutes ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">分前</span>
              </div>
              {errors.clockInReminderMinutes && (
                <p className="mt-1 text-sm text-red-600">{errors.clockInReminderMinutes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                退勤リマインダー
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('clockOutReminderMinutes', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="0"
                  max="60"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-orange-500 focus:border-orange-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.clockOutReminderMinutes ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">分後</span>
              </div>
              {errors.clockOutReminderMinutes && (
                <p className="mt-1 text-sm text-red-600">{errors.clockOutReminderMinutes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                残業アラート
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('overtimeAlertHours', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="1"
                  max="24"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-orange-500 focus:border-orange-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.overtimeAlertHours ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">時間後</span>
              </div>
              {errors.overtimeAlertHours && (
                <p className="mt-1 text-sm text-red-600">{errors.overtimeAlertHours.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* レポート送信設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-600" />
            レポート送信設定
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日次レポート送信時刻
              </label>
              <input
                {...register('dailyReportTime')}
                type="time"
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-orange-500 focus:border-orange-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.dailyReportTime ? 'border-red-300' : ''}`}
              />
              {errors.dailyReportTime && (
                <p className="mt-1 text-sm text-red-600">{errors.dailyReportTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                週次レポート送信曜日
              </label>
              <select
                {...register('weeklyReportDay')}
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-orange-500 focus:border-orange-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.weeklyReportDay ? 'border-red-300' : ''}`}
              >
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
              {errors.weeklyReportDay && (
                <p className="mt-1 text-sm text-red-600">{errors.weeklyReportDay.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                月次レポート送信日
              </label>
              <div className="flex space-x-2">
                <input
                  {...register('monthlyReportDay', { valueAsNumber: true })}
                  type="number"
                  disabled={!isEditing}
                  min="1"
                  max="31"
                  className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                    isEditing 
                      ? 'border-gray-300 focus:ring-orange-500 focus:border-orange-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  } ${errors.monthlyReportDay ? 'border-red-300' : ''}`}
                />
                <span className="text-sm text-gray-500 self-center">日</span>
              </div>
              {errors.monthlyReportDay && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyReportDay.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 通知音設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <SpeakerWaveIcon className="h-5 w-5 mr-2 text-gray-600" />
            通知音設定
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register('soundEnabled')}
                type="checkbox"
                disabled={!isEditing}
                className={`h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${
                  !isEditing ? 'opacity-50' : ''
                }`}
              />
              <label className="ml-2 block text-sm font-medium text-gray-900">
                通知音を有効にする
              </label>
            </div>

            {soundEnabled && (
              <div className="pl-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    音量
                  </label>
                  <div className="flex space-x-2">
                    <input
                      {...register('soundVolume', { valueAsNumber: true })}
                      type="range"
                      disabled={!isEditing}
                      min="0"
                      max="100"
                      className={`block w-full ${
                        !isEditing ? 'opacity-50' : ''
                      }`}
                    />
                    <span className="text-sm text-gray-500 self-center min-w-[3rem]">
                      {watch('soundVolume')}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    通知音の種類
                  </label>
                  <select
                    {...register('soundType')}
                    disabled={!isEditing}
                    className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-orange-500 focus:border-orange-500' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    } ${errors.soundType ? 'border-red-300' : ''}`}
                  >
                    {soundTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.soundType && (
                    <p className="mt-1 text-sm text-red-600">{errors.soundType.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 休止時間設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-2 text-gray-600" />
            休止時間・休日設定
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register('quietHoursEnabled')}
                type="checkbox"
                disabled={!isEditing}
                className={`h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${
                  !isEditing ? 'opacity-50' : ''
                }`}
              />
              <label className="ml-2 block text-sm font-medium text-gray-900">
                休止時間を設定する
              </label>
            </div>

            {quietHoursEnabled && (
              <div className="pl-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    休止時間開始
                  </label>
                  <input
                    {...register('quietHoursStart')}
                    type="time"
                    disabled={!isEditing}
                    className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-orange-500 focus:border-orange-500' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    } ${errors.quietHoursStart ? 'border-red-300' : ''}`}
                  />
                  {errors.quietHoursStart && (
                    <p className="mt-1 text-sm text-red-600">{errors.quietHoursStart.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    休止時間終了
                  </label>
                  <input
                    {...register('quietHoursEnd')}
                    type="time"
                    disabled={!isEditing}
                    className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-orange-500 focus:border-orange-500' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    } ${errors.quietHoursEnd ? 'border-red-300' : ''}`}
                  />
                  {errors.quietHoursEnd && (
                    <p className="mt-1 text-sm text-red-600">{errors.quietHoursEnd.message}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                {...register('holidayNotificationsEnabled')}
                type="checkbox"
                disabled={!isEditing}
                className={`h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${
                  !isEditing ? 'opacity-50' : ''
                }`}
              />
              <label className="ml-2 block text-sm font-medium text-gray-900">
                休日でも通知を有効にする
              </label>
            </div>
          </div>
        </div>

        {/* 通知優先度設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            通知優先度設定
          </h3>
          
          <div className="space-y-3">
            {eventTypes.map((event) => {
              const currentPriority = getEventPriority(event.id)
              return (
                <div key={event.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{event.label}</div>
                    <div className="text-xs text-gray-500">{event.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(currentPriority)}`}>
                      {getPriorityLabel(currentPriority)}
                    </span>
                    {isEditing && (
                      <select
                        value={currentPriority}
                        onChange={(e) => handlePriorityChange(event.id, e.target.value)}
                        className="block text-sm border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 p-1"
                      >
                        <option value="high">高</option>
                        <option value="medium">中</option>
                        <option value="low">低</option>
                      </select>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </form>

      {/* テスト通知結果 */}
      {testNotificationSent && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
            <div className="text-sm text-green-800">
              テスト通知が正常に送信されました
            </div>
          </div>
        </div>
      )}

      {/* 操作ガイド */}
      <div className="mt-6 p-4 bg-orange-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-orange-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">
              通知設定について
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>通知設定はリアルタイムで反映されます</li>
                <li>休止時間中は緊急度の高い通知のみ送信されます</li>
                <li>メール通知にはインターネット接続が必要です</li>
                <li>プッシュ通知はブラウザの許可が必要です</li>
                <li>テスト通知で動作確認を行ってください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}