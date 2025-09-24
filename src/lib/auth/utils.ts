import { getServerSession } from 'next-auth/next'
import { authOptions } from './config'
import { prisma } from '@/lib/db/prisma'
import { UserRole } from '@prisma/client'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('認証が必要です')
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role as UserRole)) {
    throw new Error('権限がありません')
  }
  return user
}

export async function requireAdmin() {
  return await requireRole(['ADMIN', 'MANAGER'])
}

export async function getUserWithDetails(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: true
    }
  })
}

export async function checkUserAccess(targetUserId: string, currentUser: any) {
  // 管理者は全ユーザーにアクセス可能
  if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') {
    return true
  }
  
  // 従業員は自分のデータのみアクセス可能
  return currentUser.id === targetUserId
}

export async function validateCompanyAccess(companyId: string, currentUser: any) {
  return currentUser.companyId === companyId
}