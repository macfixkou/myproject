'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  MapPinIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// 位置情報設定のスキーマ
const locationSettingsSchema = z.object({
  // GPS基本設定
  gpsRequired: z.boolean(),
  locationAccuracy: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: '位置精度を選択してください' })
  }),
  allowedRadius: z.number().min(10, '許可範囲は10m以上で設定してください').max(10000, '許可範囲は10km以内で設定してください'),
  
  // プライバシー設定
  locationDataRetention: z.number().min(1, '保存期間は1日以上で設定してください').max(365, '保存期間は1年以内で設定してください'),
  shareLocationWithManagers: z.boolean(),
  allowLocationHistory: z.boolean(),
  anonymizeLocationData: z.boolean(),
  
  // 通知設定
  notifyOnLocationViolation: z.boolean(),
  notifyOnGpsDisabled: z.boolean(),
  warnBeforeLocationCapture: z.boolean(),
  
  // オフライン設定
  allowOfflineMode: z.boolean(),
  offlineModeMaxHours: z.number().min(1, '1時間以上で設定してください').max(24, '24時間以内で設定してください'),
  requireLocationOnSync: z.boolean(),
  
  // セキュリティ設定
  encryptLocationData: z.boolean(),
  blockVpnUsers: z.boolean(),
  detectLocationSpoofing: z.boolean(),
  requireDeviceVerification: z.boolean(),
})

// 作業場所の型定義
interface WorkLocation {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
  isActive: boolean
  workHours: {
    start: string
    end: string
  }
  description?: string
  createdAt: string
}

// 作業場所作成・編集のスキーマ
const workLocationSchema = z.object({
  name: z.string().min(1, '場所名は必須です').max(100, '場所名は100文字以内で入力してください'),
  address: z.string().min(1, '住所は必須です').max(200, '住所は200文字以内で入力してください'),
  latitude: z.number().min(-90, '緯度は-90以上で入力してください').max(90, '緯度は90以下で入力してください'),
  longitude: z.number().min(-180, '経度は-180以上で入力してください').max(180, '経度は180以下で入力してください'),
  radius: z.number().min(10, '許可範囲は10m以上で設定してください').max(1000, '許可範囲は1000m以内で設定してください'),
  workHoursStart: z.string().min(1, '開始時刻は必須です'),
  workHoursEnd: z.string().min(1, '終了時刻は必須です'),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
})

type LocationSettingsFormData = z.infer<typeof locationSettingsSchema>
type WorkLocationFormData = z.infer<typeof workLocationSchema>

const accuracyOptions = [
  { value: 'high', label: '高精度', description: 'GPS+WiFi+基地局 (±5m)', battery: '大' },
  { value: 'medium', label: '中精度', description: 'GPS+基地局 (±50m)', battery: '中' },
  { value: 'low', label: '低精度', description: '基地局のみ (±500m)', battery: '小' },
]

export default function LocationSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [locations, setLocations] = useState<WorkLocation[]>([])
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<WorkLocation | null>(null)
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsSupported, setGpsSupported] = useState(true)

  const {
    register: registerSettings,
    handleSubmit: handleSubmitSettings,
    formState: { errors: settingsErrors },
    reset: resetSettings,
    watch
  } = useForm<LocationSettingsFormData>({
    resolver: zodResolver(locationSettingsSchema),
    defaultValues: {
      gpsRequired: true,
      locationAccuracy: 'high',
      allowedRadius: 100,
      locationDataRetention: 90,
      shareLocationWithManagers: true,
      allowLocationHistory: true,
      anonymizeLocationData: false,
      notifyOnLocationViolation: true,
      notifyOnGpsDisabled: true,
      warnBeforeLocationCapture: true,
      allowOfflineMode: true,
      offlineModeMaxHours: 8,
      requireLocationOnSync: true,
      encryptLocationData: true,
      blockVpnUsers: false,
      detectLocationSpoofing: true,
      requireDeviceVerification: false,
    }
  })

  const {
    register: registerLocation,
    handleSubmit: handleSubmitLocation,
    formState: { errors: locationErrors },
    reset: resetLocation,
    setValue: setLocationValue
  } = useForm<WorkLocationFormData>({
    resolver: zodResolver(workLocationSchema),
  })

  const gpsRequired = watch('gpsRequired')
  const allowOfflineMode = watch('allowOfflineMode')

  // 初期データ設定
  const defaultLocations: WorkLocation[] = [
    {
      id: 'location-1',
      name: '本社事務所',
      address: '東京都千代田区1-1-1 サンプルビル 5F',
      latitude: 35.6762,
      longitude: 139.6503,
      radius: 50,
      isActive: true,
      workHours: { start: '09:00', end: '18:00' },
      description: 'メインオフィス',
      createdAt: '2024-01-01 09:00:00'
    },
    {
      id: 'location-2',
      name: 'A現場',
      address: '東京都新宿区2-2-2 建設現場A',
      latitude: 35.6896,
      longitude: 139.6917,
      radius: 100,
      isActive: true,
      workHours: { start: '08:00', end: '17:00' },
      description: '新築工事現場',
      createdAt: '2024-02-01 09:00:00'
    },
    {
      id: 'location-3',
      name: 'B現場',
      address: '東京都渋谷区3-3-3 建設現場B',
      latitude: 35.6584,
      longitude: 139.7016,
      radius: 150,
      isActive: false,
      workHours: { start: '08:00', end: '17:00' },
      description: '改修工事現場（休止中）',
      createdAt: '2024-03-01 09:00:00'
    }
  ]

  useEffect(() => {
    // GPS対応状況をチェック
    if (!navigator.geolocation) {
      setGpsSupported(false)
      toast.error('このブラウザはGPS機能をサポートしていません')
    }

    // LocalStorageから設定を読み込み
    const savedSettings = localStorage.getItem('locationSettings')
    if (savedSettings) {
      try {
        const data = JSON.parse(savedSettings)
        resetSettings(data)
      } catch (error) {
        console.error('Failed to load location settings:', error)
      }
    }

    const savedLocations = localStorage.getItem('workLocations')
    if (savedLocations) {
      try {
        const data = JSON.parse(savedLocations)
        setLocations(data)
      } catch (error) {
        console.error('Failed to load work locations:', error)
        setLocations(defaultLocations)
        localStorage.setItem('workLocations', JSON.stringify(defaultLocations))
      }
    } else {
      setLocations(defaultLocations)
      localStorage.setItem('workLocations', JSON.stringify(defaultLocations))
    }
  }, [resetSettings])

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('GPS機能が利用できません')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentPosition({ lat: latitude, lng: longitude })
        setLocationValue('latitude', latitude)
        setLocationValue('longitude', longitude)
        toast.success('現在地を取得しました')
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast.error('位置情報の取得に失敗しました')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }, [setLocationValue])

  const onSubmitSettings = async (data: LocationSettingsFormData) => {
    setIsLoading(true)
    try {
      localStorage.setItem('locationSettings', JSON.stringify(data))
      toast.success('位置情報設定を保存しました')
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save location settings:', error)
      toast.error('保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitLocation = async (data: WorkLocationFormData) => {
    setIsLoading(true)
    try {
      if (editingLocation) {
        // 編集
        const updatedLocations = locations.map(location =>
          location.id === editingLocation.id
            ? {
                ...location,
                name: data.name,
                address: data.address,
                latitude: data.latitude,
                longitude: data.longitude,
                radius: data.radius,
                workHours: { start: data.workHoursStart, end: data.workHoursEnd },
                description: data.description
              }
            : location
        )
        setLocations(updatedLocations)
        localStorage.setItem('workLocations', JSON.stringify(updatedLocations))
        toast.success('作業場所を更新しました')
      } else {
        // 新規作成
        const newLocation: WorkLocation = {
          id: `location-${Date.now()}`,
          name: data.name,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          radius: data.radius,
          isActive: true,
          workHours: { start: data.workHoursStart, end: data.workHoursEnd },
          description: data.description,
          createdAt: new Date().toLocaleString('ja-JP')
        }
        const updatedLocations = [...locations, newLocation]
        setLocations(updatedLocations)
        localStorage.setItem('workLocations', JSON.stringify(updatedLocations))
        toast.success('作業場所を追加しました')
      }

      setIsLocationModalOpen(false)
      setEditingLocation(null)
      resetLocation()
    } catch (error) {
      console.error('Failed to save work location:', error)
      toast.error('保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLocation = () => {
    resetLocation({
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      radius: 100,
      workHoursStart: '09:00',
      workHoursEnd: '18:00',
      description: ''
    })
    setEditingLocation(null)
    setIsLocationModalOpen(true)
  }

  const handleEditLocation = (location: WorkLocation) => {
    resetLocation({
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      radius: location.radius,
      workHoursStart: location.workHours.start,
      workHoursEnd: location.workHours.end,
      description: location.description || ''
    })
    setEditingLocation(location)
    setIsLocationModalOpen(true)
  }

  const handleToggleLocationActive = (locationId: string) => {
    const updatedLocations = locations.map(location =>
      location.id === locationId
        ? { ...location, isActive: !location.isActive }
        : location
    )
    setLocations(updatedLocations)
    localStorage.setItem('workLocations', JSON.stringify(updatedLocations))
    
    const location = locations.find(l => l.id === locationId)
    toast.success(`${location?.name}を${location?.isActive ? '無効' : '有効'}にしました`)
  }

  const handleDeleteLocation = (locationId: string) => {
    if (!confirm('本当にこの作業場所を削除しますか？')) return
    
    const updatedLocations = locations.filter(location => location.id !== locationId)
    setLocations(updatedLocations)
    localStorage.setItem('workLocations', JSON.stringify(updatedLocations))
    toast.success('作業場所を削除しました')
  }

  const handleCancel = () => {
    const savedData = localStorage.getItem('locationSettings')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        resetSettings(data)
      } catch (error) {
        console.error('Failed to reset form:', error)
      }
    }
    setIsEditing(false)
  }

  const testLocationAccess = async () => {
    if (!navigator.geolocation) {
      toast.error('GPS機能が利用できません')
      return
    }

    toast.loading('位置情報をテスト中...', { duration: 2000 })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        toast.success(
          `位置情報取得成功\n緯度: ${latitude.toFixed(6)}\n経度: ${longitude.toFixed(6)}\n精度: ${accuracy.toFixed(0)}m`,
          { duration: 5000 }
        )
      },
      (error) => {
        let errorMessage = '位置情報の取得に失敗しました'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の許可が拒否されました'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません'
            break
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました'
            break
        }
        toast.error(errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MapPinIcon className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">GPS・位置情報設定</h2>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={testLocationAccess}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                disabled={!gpsSupported}
              >
                GPS テスト
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
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
                onClick={handleSubmitSettings(onSubmitSettings)}
                disabled={isLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center"
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

      {/* GPS対応状況警告 */}
      {!gpsSupported && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium">GPS機能が利用できません</p>
              <p>このブラウザまたはデバイスはGPS機能をサポートしていません。</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitSettings(onSubmitSettings)} className="space-y-6">
        {/* GPS基本設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <GlobeAltIcon className="h-5 w-5 mr-2 text-gray-600" />
            GPS基本設定
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...registerSettings('gpsRequired')}
                type="checkbox"
                disabled={!isEditing}
                className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${
                  !isEditing ? 'opacity-50' : ''
                }`}
              />
              <label className="ml-2 block text-sm font-medium text-gray-900">
                GPS位置情報を必須とする
              </label>
            </div>

            {gpsRequired && (
              <div className="pl-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    位置精度設定
                  </label>
                  <div className="space-y-3">
                    {accuracyOptions.map((option) => (
                      <label key={option.value} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          {...registerSettings('locationAccuracy')}
                          type="radio"
                          value={option.value}
                          disabled={!isEditing}
                          className={`mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 ${
                            !isEditing ? 'opacity-50' : ''
                          }`}
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                          <div className="text-xs text-gray-400">バッテリー消費: {option.battery}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {settingsErrors.locationAccuracy && (
                    <p className="mt-1 text-sm text-red-600">{settingsErrors.locationAccuracy.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    デフォルト許可範囲
                  </label>
                  <div className="flex space-x-2">
                    <input
                      {...registerSettings('allowedRadius', { valueAsNumber: true })}
                      type="number"
                      disabled={!isEditing}
                      min="10"
                      max="10000"
                      className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500' 
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      } ${settingsErrors.allowedRadius ? 'border-red-300' : ''}`}
                    />
                    <span className="text-sm text-gray-500 self-center">メートル</span>
                  </div>
                  {settingsErrors.allowedRadius && (
                    <p className="mt-1 text-sm text-red-600">{settingsErrors.allowedRadius.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* プライバシー・セキュリティ設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-600" />
            プライバシー・セキュリティ設定
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">データ管理</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  位置データ保存期間
                </label>
                <div className="flex space-x-2">
                  <input
                    {...registerSettings('locationDataRetention', { valueAsNumber: true })}
                    type="number"
                    disabled={!isEditing}
                    min="1"
                    max="365"
                    className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    } ${settingsErrors.locationDataRetention ? 'border-red-300' : ''}`}
                  />
                  <span className="text-sm text-gray-500 self-center">日</span>
                </div>
                {settingsErrors.locationDataRetention && (
                  <p className="mt-1 text-sm text-red-600">{settingsErrors.locationDataRetention.message}</p>
                )}
              </div>

              {[
                { key: 'shareLocationWithManagers', label: 'マネージャーと位置情報を共有' },
                { key: 'allowLocationHistory', label: '位置履歴を保存' },
                { key: 'anonymizeLocationData', label: '位置データを匿名化' }
              ].map(item => (
                <div key={item.key} className="flex items-center">
                  <input
                    {...registerSettings(item.key as keyof LocationSettingsFormData)}
                    type="checkbox"
                    disabled={!isEditing}
                    className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${
                      !isEditing ? 'opacity-50' : ''
                    }`}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">セキュリティ</h4>
              
              {[
                { key: 'encryptLocationData', label: '位置データを暗号化' },
                { key: 'blockVpnUsers', label: 'VPN使用時のアクセスをブロック' },
                { key: 'detectLocationSpoofing', label: '位置偽装を検出' },
                { key: 'requireDeviceVerification', label: 'デバイス認証を必須化' }
              ].map(item => (
                <div key={item.key} className="flex items-center">
                  <input
                    {...registerSettings(item.key as keyof LocationSettingsFormData)}
                    type="checkbox"
                    disabled={!isEditing}
                    className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${
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

        {/* 通知・アラート設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            通知・アラート設定
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'notifyOnLocationViolation', label: '範囲外での打刻時に通知' },
              { key: 'notifyOnGpsDisabled', label: 'GPS無効時に通知' },
              { key: 'warnBeforeLocationCapture', label: '位置情報取得前に警告' }
            ].map(item => (
              <div key={item.key} className="flex items-center">
                <input
                  {...registerSettings(item.key as keyof LocationSettingsFormData)}
                  type="checkbox"
                  disabled={!isEditing}
                  className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${
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

        {/* オフラインモード設定 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            オフラインモード設定
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...registerSettings('allowOfflineMode')}
                type="checkbox"
                disabled={!isEditing}
                className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${
                  !isEditing ? 'opacity-50' : ''
                }`}
              />
              <label className="ml-2 block text-sm font-medium text-gray-900">
                オフラインモードを許可
              </label>
            </div>

            {allowOfflineMode && (
              <div className="pl-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最大オフライン時間
                  </label>
                  <div className="flex space-x-2">
                    <input
                      {...registerSettings('offlineModeMaxHours', { valueAsNumber: true })}
                      type="number"
                      disabled={!isEditing}
                      min="1"
                      max="24"
                      className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500' 
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      } ${settingsErrors.offlineModeMaxHours ? 'border-red-300' : ''}`}
                    />
                    <span className="text-sm text-gray-500 self-center">時間</span>
                  </div>
                  {settingsErrors.offlineModeMaxHours && (
                    <p className="mt-1 text-sm text-red-600">{settingsErrors.offlineModeMaxHours.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    {...registerSettings('requireLocationOnSync')}
                    type="checkbox"
                    disabled={!isEditing}
                    className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${
                      !isEditing ? 'opacity-50' : ''
                    }`}
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    同期時に位置情報を必須とする
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* 作業場所管理 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-6 w-6 text-indigo-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">作業場所管理</h3>
          </div>
          <button
            onClick={handleAddLocation}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            作業場所を追加
          </button>
        </div>

        {/* 作業場所一覧 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    場所情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    位置情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    勤務時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{location.name}</div>
                        <div className="text-sm text-gray-500">{location.address}</div>
                        {location.description && (
                          <div className="text-xs text-gray-400 mt-1">{location.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>緯度: {location.latitude.toFixed(6)}</div>
                      <div>経度: {location.longitude.toFixed(6)}</div>
                      <div className="text-xs text-gray-500">範囲: {location.radius}m</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {location.workHours.start} - {location.workHours.end}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        location.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {location.isActive ? '有効' : '無効'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditLocation(location)}
                          className="text-blue-600 hover:text-blue-900"
                          title="編集"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleLocationActive(location.id)}
                          className={`${location.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={location.isActive ? '無効化' : '有効化'}
                        >
                          {location.isActive ? <XMarkIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(location.id)}
                          className="text-red-600 hover:text-red-900"
                          title="削除"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 作業場所作成・編集モーダル */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingLocation ? '作業場所編集' : '新規作業場所'}
              </h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitLocation(onSubmitLocation)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    場所名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...registerLocation('name')}
                    type="text"
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 ${
                      locationErrors.name ? 'border-red-300' : ''
                    }`}
                  />
                  {locationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{locationErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    許可範囲 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      {...registerLocation('radius', { valueAsNumber: true })}
                      type="number"
                      min="10"
                      max="1000"
                      className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 ${
                        locationErrors.radius ? 'border-red-300' : ''
                      }`}
                    />
                    <span className="text-sm text-gray-500 self-center">m</span>
                  </div>
                  {locationErrors.radius && (
                    <p className="mt-1 text-sm text-red-600">{locationErrors.radius.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住所 <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerLocation('address')}
                  type="text"
                  className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 ${
                    locationErrors.address ? 'border-red-300' : ''
                  }`}
                />
                {locationErrors.address && (
                  <p className="mt-1 text-sm text-red-600">{locationErrors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    緯度 <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...registerLocation('latitude', { valueAsNumber: true })}
                    type="number"
                    step="0.000001"
                    min="-90"
                    max="90"
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 ${
                      locationErrors.latitude ? 'border-red-300' : ''
                    }`}
                  />
                  {locationErrors.latitude && (
                    <p className="mt-1 text-sm text-red-600">{locationErrors.latitude.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    経度 <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...registerLocation('longitude', { valueAsNumber: true })}
                    type="number"
                    step="0.000001"
                    min="-180"
                    max="180"
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 ${
                      locationErrors.longitude ? 'border-red-300' : ''
                    }`}
                  />
                  {locationErrors.longitude && (
                    <p className="mt-1 text-sm text-red-600">{locationErrors.longitude.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={!gpsSupported}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  現在地を取得
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    勤務開始時刻 <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...registerLocation('workHoursStart')}
                    type="time"
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 ${
                      locationErrors.workHoursStart ? 'border-red-300' : ''
                    }`}
                  />
                  {locationErrors.workHoursStart && (
                    <p className="mt-1 text-sm text-red-600">{locationErrors.workHoursStart.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    勤務終了時刻 <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...registerLocation('workHoursEnd')}
                    type="time"
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 ${
                      locationErrors.workHoursEnd ? 'border-red-300' : ''
                    }`}
                  />
                  {locationErrors.workHoursEnd && (
                    <p className="mt-1 text-sm text-red-600">{locationErrors.workHoursEnd.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  {...registerLocation('description')}
                  rows={3}
                  className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 ${
                    locationErrors.description ? 'border-red-300' : ''
                  }`}
                  placeholder="作業場所の詳細説明"
                />
                {locationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{locationErrors.description.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      保存中...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      {editingLocation ? '更新' : '作成'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 操作ガイド */}
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-indigo-800">
              GPS・位置情報設定について
            </h3>
            <div className="mt-2 text-sm text-indigo-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>GPS機能を使用するには位置情報の許可が必要です</li>
                <li>高精度設定はバッテリーを多く消費します</li>
                <li>作業場所は複数登録でき、それぞれ個別に設定可能です</li>
                <li>位置データは設定した期間後に自動削除されます</li>
                <li>オフラインモードでは同期時に位置情報が送信されます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}