import { BreakPolicy, BreakPeriod, WorkTimeCalculation } from '@/types'
import { addMinutes, differenceInMinutes, format, isAfter, isBefore, parseISO } from 'date-fns'

/**
 * 労働時間を計算する
 */
export function calculateWorkTime(
  clockIn: Date,
  clockOut: Date,
  breakPolicy?: any
): WorkTimeCalculation {
  const totalMinutes = differenceInMinutes(clockOut, clockIn)
  
  // 休憩時間を計算
  const breakDetails = calculateBreakTime(clockIn, clockOut, breakPolicy)
  const breakMinutes = breakDetails.reduce((sum, bp) => sum + (bp.actualMinutes || 0), 0)
  
  // 実働時間
  const workedMinutes = Math.max(0, totalMinutes - breakMinutes)
  
  // 残業時間（8時間 = 480分を超過した分）
  const standardMinutes = 480
  const overtimeMinutes = Math.max(0, workedMinutes - standardMinutes)
  
  // 深夜時間（22:00-05:00）
  const nightMinutes = calculateNightTime(clockIn, clockOut) - calculateNightBreakTime(clockIn, clockOut, breakPolicy)
  
  // 休日判定（簡易実装 - 土日のみ）
  const isHoliday = isWeekend(clockIn) || isWeekend(clockOut)
  const holidayMinutes = isHoliday ? workedMinutes : 0
  
  return {
    workedMinutes,
    overtimeMinutes,
    nightMinutes: Math.max(0, nightMinutes),
    holidayMinutes,
    breakMinutes,
    breakDetails
  }
}

/**
 * 休憩時間を計算する
 */
function calculateBreakTime(
  clockIn: Date,
  clockOut: Date,
  breakPolicy?: any
): BreakPeriod[] {
  if (!breakPolicy?.slots) return []
  
  return breakPolicy.slots.map(slot => {
    const breakStart = parseTimeToDate(clockIn, slot.start)
    const breakEnd = parseTimeToDate(clockIn, slot.end)
    
    // 勤務時間と重複する休憩時間を計算
    const overlapStart = isAfter(breakStart, clockIn) ? breakStart : clockIn
    const overlapEnd = isBefore(breakEnd, clockOut) ? breakEnd : clockOut
    
    const actualMinutes = isAfter(overlapEnd, overlapStart) 
      ? differenceInMinutes(overlapEnd, overlapStart) 
      : 0
    
    return {
      ...slot,
      actualMinutes
    }
  })
}

/**
 * 深夜時間を計算する（22:00-05:00）
 */
function calculateNightTime(clockIn: Date, clockOut: Date): number {
  let totalNightMinutes = 0
  let current = new Date(clockIn)
  
  while (isBefore(current, clockOut)) {
    const currentHour = current.getHours()
    const nextHour = addMinutes(current, 60)
    const endTime = isBefore(nextHour, clockOut) ? nextHour : clockOut
    
    if (currentHour >= 22 || currentHour < 5) {
      totalNightMinutes += differenceInMinutes(endTime, current)
    }
    
    current = nextHour
  }
  
  return totalNightMinutes
}

/**
 * 深夜時間帯の休憩時間を計算する
 */
function calculateNightBreakTime(
  clockIn: Date,
  clockOut: Date,
  breakPolicy?: any
): number {
  if (!breakPolicy?.slots) return 0
  
  let nightBreakMinutes = 0
  
  for (const slot of breakPolicy.slots) {
    const breakStart = parseTimeToDate(clockIn, slot.start)
    const breakEnd = parseTimeToDate(clockIn, slot.end)
    
    // 休憩時間が勤務時間内かつ深夜時間帯にある場合
    if (isAfter(breakStart, clockIn) && isBefore(breakEnd, clockOut)) {
      const breakStartHour = breakStart.getHours()
      const breakEndHour = breakEnd.getHours()
      
      if (breakStartHour >= 22 || breakStartHour < 5 || 
          breakEndHour >= 22 || breakEndHour < 5) {
        nightBreakMinutes += differenceInMinutes(breakEnd, breakStart)
      }
    }
  }
  
  return nightBreakMinutes
}

/**
 * 時刻文字列を日付オブジェクトに変換
 */
function parseTimeToDate(baseDate: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number)
  const result = new Date(baseDate)
  result.setHours(hours, minutes, 0, 0)
  
  // 翌日の場合（深夜勤務対応）
  if (result < baseDate) {
    result.setDate(result.getDate() + 1)
  }
  
  return result
}

/**
 * 週末判定
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // 日曜日 or 土曜日
}

/**
 * 36協定チェック
 */
export function checkLaborStandards(
  weeklyHours: number,
  monthlyHours: number,
  yearlyHours: number
) {
  return {
    daily: {
      current: 0, // 日次は個別計算が必要
      limit: 8,
      status: 'OK' as const
    },
    weekly: {
      current: weeklyHours,
      limit: 40,
      status: weeklyHours > 40 ? 'CRITICAL' : weeklyHours > 36 ? 'WARNING' : 'OK' as const
    },
    monthly: {
      current: monthlyHours,
      limit: 45,
      status: monthlyHours > 45 ? 'CRITICAL' : monthlyHours > 40 ? 'WARNING' : 'OK' as const
    },
    yearly: {
      current: yearlyHours,
      limit: 360,
      status: yearlyHours > 360 ? 'CRITICAL' : yearlyHours > 320 ? 'WARNING' : 'OK' as const
    }
  }
}

/**
 * 時間を分に変換
 */
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60)
}

/**
 * 分を時間に変換
 */
export function minutesToHours(minutes: number): number {
  return minutes / 60
}

/**
 * 時間を HH:MM 形式にフォーマット
 */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}