'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  HomeIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  UsersIcon,
  Cog6ToothIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
  user: {
    name: string
    email: string
    role: string
    company: string
  }
}

export default function MobileSidebar({ open, onClose, user }: MobileSidebarProps) {
  const pathname = usePathname()

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

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                    <span className="sr-only">サイドバーを閉じる</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
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
                              <Link
                                href={item.href}
                                onClick={onClose}
                                className={`${
                                  isActive
                                    ? 'bg-gray-50 text-primary-600'
                                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold`}
                              >
                                <item.icon
                                  className={`${
                                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                                  } h-6 w-6 shrink-0`}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}