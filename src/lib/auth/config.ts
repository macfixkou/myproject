import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // デモアカウント用のハードコード認証
        const demoAccounts: { [key: string]: any } = {
          'admin@example.com': {
            id: 'admin-demo',
            email: 'admin@example.com',
            name: '管理者太郎',
            role: 'ADMIN',
            companyId: 'demo-company',
            company: 'サンプル建設会社'
          },
          'employee1@example.com': {
            id: 'employee1-demo',
            email: 'employee1@example.com',
            name: '作業員花子',
            role: 'EMPLOYEE',
            companyId: 'demo-company',
            company: 'サンプル建設会社'
          },
          'employee2@example.com': {
            id: 'employee2-demo',
            email: 'employee2@example.com',
            name: '作業員次郎',
            role: 'EMPLOYEE',
            companyId: 'demo-company',
            company: 'サンプル建設会社'
          }
        }

        // デモアカウントのチェック
        const demoAccount = demoAccounts[credentials.email]
        if (demoAccount && credentials.password === 'password123') {
          // デモ会社が存在するか確認し、なければ作成
          let demoCompany = await prisma.company.findUnique({
            where: { id: 'demo-company' }
          })
          
          if (!demoCompany) {
            demoCompany = await prisma.company.create({
              data: {
                id: 'demo-company',
                name: 'サンプル建設会社',
                timezone: 'Asia/Tokyo',
                payrollRounding: 'ROUND',
                standardWorkHours: 480,
                gpsRequired: true,
              }
            })
          }
          
          return demoAccount
        }

        // データベース認証（デモアカウントでない場合）
        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              company: true
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          if (!user.active) {
            throw new Error('アカウントが無効です')
          }

          // 最終ログイン時刻を更新
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
            company: user.company?.name || 'Unknown',
          }
        } catch (error) {
          console.error('Database authentication failed:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
        token.company = user.company
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.company = token.company as string
      }
      return session
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // ログイン監査ログを記録（一時的に無効化）
      try {
        if (user.id && user.companyId) {
          // CompanyIdが存在するかチェック
          const company = await prisma.company.findUnique({
            where: { id: user.companyId }
          })
          
          if (company) {
            await prisma.auditLog.create({
              data: {
                companyId: user.companyId,
                actorId: user.id,
                entity: 'auth',
                entityId: user.id,
                action: 'SIGN_IN',
                afterText: JSON.stringify({
                  provider: account?.provider,
                  timestamp: new Date().toISOString()
                })
              }
            })
          }
        }
      } catch (error) {
        console.error('Audit log creation failed:', error)
        // ログイン自体は継続
      }
    },
    async signOut({ session, token }) {
      // ログアウト監査ログを記録（一時的に無効化）
      try {
        if (token?.sub && token?.companyId) {
          const company = await prisma.company.findUnique({
            where: { id: token.companyId as string }
          })
          
          if (company) {
            await prisma.auditLog.create({
              data: {
                companyId: token.companyId as string,
                actorId: token.sub,
                entity: 'auth',
                entityId: token.sub,
                action: 'SIGN_OUT',
                afterText: JSON.stringify({
                  timestamp: new Date().toISOString()
                })
              }
            })
          }
        }
      } catch (error) {
        console.error('Audit log creation failed:', error)
        // ログアウト自体は継続
      }
    }
  }
}