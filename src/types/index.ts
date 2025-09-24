import { User, Company, Site, Attendance, Report, Alert } from '@prisma/client'

// GPS座標の型
export interface GPSCoordinates {
  lat: number
  lng: number
  accuracy?: number
  timestamp?: number
}

// 拡張ユーザー型
export interface UserWithCompany extends User {
  company: Company
}

// 拡張出勤記録型
export interface AttendanceWithDetails extends Attendance {
  user: User
  site: Site | null
}

// 拡張日報型
export interface ReportWithDetails extends Report {
  user: User
  site: Site | null
}

// 出勤打刻リクエスト型
export interface ClockRequest {
  siteId?: string
  gps?: GPSCoordinates
  notes?: string
}

// 労働時間計算結果型
export interface WorkTimeCalculation {
  workedMinutes: number
  overtimeMinutes: number
  nightMinutes: number
  holidayMinutes: number
  breakMinutes: number
  breakDetails: BreakPeriod[]
}

// 休憩時間型
export interface BreakPeriod {
  start: string
  end: string
  name?: string
  auto?: boolean
  actualMinutes?: number
}

// 休憩ポリシー型
export interface BreakPolicy {
  slots: BreakPeriod[]
}

// ダッシュボード統計型
export interface DashboardStats {
  todayAttendance: {
    total: number
    present: number
    absent: number
    late: number
  }
  weeklyStats: {
    totalHours: number
    overtimeHours: number
    sites: { [siteId: string]: number }
  }
  alerts: {
    critical: number
    warning: number
    info: number
  }
  pendingReports: number
}

// アラート詳細型
export interface AlertWithDetails extends Alert {
  user?: User
}

// 36協定チェック結果型
export interface LaborStandardCheck {
  daily: {
    current: number
    limit: number
    status: 'OK' | 'WARNING' | 'CRITICAL'
  }
  weekly: {
    current: number
    limit: number
    status: 'OK' | 'WARNING' | 'CRITICAL'
  }
  monthly: {
    current: number
    limit: number
    status: 'OK' | 'WARNING' | 'CRITICAL'
  }
  yearly: {
    current: number
    limit: number
    status: 'OK' | 'WARNING' | 'CRITICAL'
  }
}

// API応答型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ページネーション型
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// フィルター型
export interface AttendanceFilter {
  userId?: string
  siteId?: string
  startDate?: Date
  endDate?: Date
  status?: string
}

// 集計データ型
export interface AttendanceSummary {
  userId: string
  userName: string
  totalHours: number
  overtimeHours: number
  nightHours: number
  holidayHours: number
  workDays: number
  sites: { [siteId: string]: number }
}

// エクスポート設定型
export interface ExportSettings {
  format: 'CSV' | 'XLSX' | 'PDF'
  period: {
    start: Date
    end: Date
  }
  filters: {
    userIds?: string[]
    siteIds?: string[]
  }
  columns: string[]
  template?: string
}

// 天気情報型
export interface WeatherInfo {
  date: string
  condition: string
  temperature: {
    max: number
    min: number
  }
  humidity: number
  precipitation: number
}

// 通知設定型
export interface NotificationSettings {
  email: boolean
  webPush: boolean
  slack?: {
    enabled: boolean
    webhook: string
  }
  line?: {
    enabled: boolean
    accessToken: string
  }
}