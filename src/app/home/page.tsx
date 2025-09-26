'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import EmployeeLayout from '@/components/layout/EmployeeLayout'
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard'
import AdminDashboard from '@/components/dashboard/AdminDashboard'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-gray-600">読み込み中...</span>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (session.user.role === 'EMPLOYEE') {
    return (
      <EmployeeLayout>
        <EmployeeDashboard user={session.user} />
      </EmployeeLayout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard user={session.user} />
      </div>
    </Layout>
  )
}