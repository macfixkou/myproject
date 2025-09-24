import { GPSCoordinates } from '@/types'

/**
 * GPS座標を取得する
 */
export function getCurrentPosition(): Promise<GPSCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GPS機能がサポートされていません'))
      return
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1分間キャッシュ
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      },
      (error) => {
        let message = 'GPS取得に失敗しました'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = '位置情報の取得が拒否されました。ブラウザの設定を確認してください。'
            break
          case error.POSITION_UNAVAILABLE:
            message = '位置情報を取得できません。GPS機能を有効にしてください。'
            break
          case error.TIMEOUT:
            message = '位置情報の取得がタイムアウトしました。再試行してください。'
            break
        }
        
        reject(new Error(message))
      },
      options
    )
  })
}

/**
 * 2つの座標間の距離を計算（メートル単位）
 * Haversine formula を使用
 */
export function calculateDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371e3 // 地球の半径（メートル）
  const φ1 = (coord1.lat * Math.PI) / 180
  const φ2 = (coord2.lat * Math.PI) / 180
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // 距離（メートル）
}

/**
 * ジオフェンス内判定
 */
export function isWithinGeofence(
  userCoords: { lat: number; lng: number },
  siteCoords: { lat: number; lng: number },
  radiusMeters: number
): boolean {
  const distance = calculateDistance(userCoords, siteCoords)
  return distance <= radiusMeters
}

/**
 * GPS精度の評価
 */
export function evaluateGPSAccuracy(accuracy?: number): 'high' | 'medium' | 'low' {
  if (!accuracy) return 'low'
  
  if (accuracy <= 10) return 'high'
  if (accuracy <= 50) return 'medium'
  return 'low'
}

/**
 * 座標を人間が読める形式に変換
 */
export function formatCoordinates(coords: { lat: number; lng: number }): string {
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
}

/**
 * Google Maps URLを生成
 */
export function generateMapsUrl(coords: { lat: number; lng: number }): string {
  return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
}

/**
 * GPS取得状況を監視
 */
export class GPSWatcher {
  private watchId: number | null = null
  private callbacks: ((coords: GPSCoordinates) => void)[] = []
  private errorCallbacks: ((error: Error) => void)[] = []

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GPS機能がサポートされていません'))
        return
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords: GPSCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          }
          
          this.callbacks.forEach(callback => callback(coords))
          
          if (this.watchId === null) {
            resolve()
          }
        },
        (error) => {
          const errorObj = new Error('GPS監視エラー: ' + error.message)
          this.errorCallbacks.forEach(callback => callback(errorObj))
          
          if (this.watchId === null) {
            reject(errorObj)
          }
        },
        options
      )

      resolve()
    })
  }

  stop(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  onUpdate(callback: (coords: GPSCoordinates) => void): void {
    this.callbacks.push(callback)
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback)
  }

  removeCallback(callback: (coords: GPSCoordinates) => void): void {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  removeErrorCallback(callback: (error: Error) => void): void {
    const index = this.errorCallbacks.indexOf(callback)
    if (index > -1) {
      this.errorCallbacks.splice(index, 1)
    }
  }
}