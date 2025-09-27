import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Construction Timesheet Management System is running'
  })
}