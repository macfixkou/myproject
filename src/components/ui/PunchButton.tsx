'use client'

import { useState, useEffect } from 'react'
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'
import { getCurrentPosition, isWithinGeofence } from '@/lib/utils/gps'
import { GPSCoordinates } from '@/types'
import toast from 'react-hot-toast'

interface PunchButtonProps {
  isWorking: boolean
  currentSite?: {
    id: string
    name: string
    latitude?: number
    longitude?: number
    geofenceRadius?: number
  }
  onClockIn: (data: { siteId?: string; gps?: GPSCoordinates }) => Promise<void>
  onClockOut: (data: { gps?: GPSCoordinates }) => Promise<void>
  loading?: boolean
}

export default function PunchButton({ 
  isWorking, 
  currentSite, 
  onClockIn, 
  onClockOut, 
  loading 
}: PunchButtonProps) {
  const [gpsLoading, setGpsLoading] = useState(false)
  const [currentGPS, setCurrentGPS] = useState<GPSCoordinates | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [isInGeofence, setIsInGeofence] = useState<boolean | null>(null)

  // GPS位置を取得
  const fetchGPS = async () => {
    setGpsLoading(true)
    setGpsError(null)
    
    try {
      const position = await getCurrentPosition()
      setCurrentGPS(position)
      
      // ジオフェンス判定
      if (currentSite?.latitude && currentSite?.longitude && currentSite?.geofenceRadius) {
        const inFence = isWithinGeofence(
          { lat: position.lat, lng: position.lng },
          { lat: currentSite.latitude, lng: currentSite.longitude },
          currentSite.geofenceRadius
        )
        setIsInGeofence(inFence)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'GPS取得に失敗しました'
      setGpsError(message)
      toast.error(message)
    } finally {
      setGpsLoading(false)
    }
  }

  // 出勤処理
  const handleClockIn = async () => {
    if (!currentGPS) {
      toast.error('GPS位置を取得してください')
      return
    }

    try {
      await onClockIn({
        siteId: currentSite?.id,
        gps: currentGPS
      })
      toast.success('出勤しました')
    } catch (error) {
      const message = error instanceof Error ? error.message : '出勤処理に失敗しました'
      toast.error(message)
    }
  }

  // 退勤処理
  const handleClockOut = async () => {
    if (!currentGPS) {
      toast.error('GPS位置を取得してください')
      return
    }

    try {
      await onClockOut({
        gps: currentGPS
      })
      toast.success('退勤しました')
    } catch (error) {
      const message = error instanceof Error ? error.message : '退勤処理に失敗しました'
      toast.error(message)
    }
  }

  // コンポーネント読み込み時にGPS取得
  useEffect(() => {
    fetchGPS()
  }, [currentSite])

  return (
    <div className="card">
      <div className="card-body text-center space-y-6">
        {/* 現在の現場情報 */}
        {currentSite && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-blue-900">
              <MapPinIcon className="h-5 w-5" />
              <span className="font-medium">{currentSite.name}</span>
            </div>
            {isInGeofence !== null && (
              <div className="mt-2">
                <span className={`badge ${isInGeofence ? 'badge-success' : 'badge-warning'}`}>
                  {isInGeofence ? 'ジオフェンス内' : 'ジオフェンス外'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* GPS状況 */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">GPS位置情報</span>
          </div>
          
          {gpsLoading ? (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <div className="loading-spinner"></div>
              <span className="text-sm">GPS取得中...</span>
            </div>
          ) : gpsError ? (
            <div className="space-y-2">
              <div className="text-sm text-red-600">{gpsError}</div>
              <button
                onClick={fetchGPS}
                className="btn btn-sm btn-secondary"
              >
                再取得
              </button>
            </div>
          ) : currentGPS ? (
            <div className="space-y-2">
              <div className="text-sm text-green-600 flex items-center justify-center space-x-1">
                <div className="status-indicator status-online"></div>
                <span>GPS取得完了</span>
              </div>
              <div className="text-xs text-gray-500">
                精度: {currentGPS.accuracy?.toFixed(1)}m
              </div>
            </div>
          ) : null}
        </div>

        {/* 打刻ボタン */}
        <div className="space-y-4">
          {!isWorking ? (
            <button
              onClick={handleClockIn}
              disabled={loading || gpsLoading || !currentGPS}
              className="punch-button btn btn-xl btn-success w-full py-6 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ClockIcon className="h-8 w-8 mr-3" />
              {loading ? '処理中...' : '出勤'}
            </button>
          ) : (
            <button
              onClick={handleClockOut}
              disabled={loading || gpsLoading || !currentGPS}
              className="punch-button btn btn-xl btn-warning w-full py-6 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ClockIcon className="h-8 w-8 mr-3" />
              {loading ? '処理中...' : '退勤'}
            </button>
          )}
        </div>

        {/* 注意事項 */}
        {!currentGPS && !gpsLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-2">GPS位置情報が必要です</p>
              <ul className="text-xs space-y-1 text-left">
                <li>• ブラウザの位置情報許可を確認してください</li>
                <li>• 屋外での使用を推奨します</li>
                <li>• GPS信号が弱い場合は移動してから再試行してください</li>
              </ul>
            </div>
          </div>
        )}

        {/* ジオフェンス外警告 */}
        {isInGeofence === false && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-800">
              <p className="font-medium">現場の指定範囲外です</p>
              <p className="text-xs mt-1">
                管理者に確認が必要な場合があります
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}