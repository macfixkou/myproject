'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HomeIcon,
  ClockIcon,
  UsersIcon,
  CalendarIcon,
  BanknotesIcon,
  MapPinIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

interface SidebarProps {
  user: {
    name: string
    email: string
    role: string
    company: string
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navigation = [
    { name: 'ダッシュボード', href: '/home', icon: HomeIcon, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { name: '出退勤', href: '/attendance', icon: ClockIcon, roles: ['EMPLOYEE'] },
    { name: 'カレンダー', href: '/calendar', icon: CalendarIcon, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { name: '従業員管理', href: '/admin/employees', icon: UsersIcon, roles: ['ADMIN', 'MANAGER'] },
    { name: '現場管理', href: '/admin/sites', icon: MapPinIcon, roles: ['ADMIN', 'MANAGER'] },
    { name: '給与計算', href: '/admin/salary', icon: BanknotesIcon, roles: ['ADMIN', 'MANAGER'] },
    { name: '設定', href: '/admin/settings', icon: Cog6ToothIcon, roles: ['ADMIN'] },
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  )

  const handleNavigation = (href: string) => {
    console.log('Navigating to:', href)
    router.push(href)
  }

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded bg-construction-blue flex items-center justify-center">
            <ClockIcon className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">勤怠システム</div>
            <div className="text-xs text-gray-500">{user.company}</div>
          </div>
        </div>
      </div>
      
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`${
                        isActive
                          ? 'bg-gray-50 text-primary-600'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full text-left`}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                        } h-6 w-6 shrink-0`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </button>
                  </li>
                )
              })}
            </ul>
          </li>
          
          <li className="mt-auto">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )
}