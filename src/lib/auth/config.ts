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
          company: user.company.name,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
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
      // ログイン監査ログを記録
      if (user.id && user.companyId) {
        await prisma.auditLog.create({
          data: {
            companyId: user.companyId,
            actorId: user.id,
            entity: 'auth',
            entityId: user.id,
            action: 'SIGN_IN',
            afterJson: {
              provider: account?.provider,
              timestamp: new Date().toISOString()
            }
          }
        })
      }
    },
    async signOut({ session, token }) {
      // ログアウト監査ログを記録
      if (token?.sub && token?.companyId) {
        await prisma.auditLog.create({
          data: {
            companyId: token.companyId as string,
            actorId: token.sub,
            entity: 'auth',
            entityId: token.sub,
            action: 'SIGN_OUT',
            afterJson: {
              timestamp: new Date().toISOString()
            }
          }
        })
      }
    }
  }
}