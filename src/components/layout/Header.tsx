'use client'

import { Fragment } from 'react'
import { signOut } from 'next-auth/react'
import { Menu, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

interface HeaderProps {
  onMenuClick: () => void
  user: {
    name: string
    email: string
    role: string
    company: string
  }
}

export default function Header({ onMenuClick, user }: HeaderProps) {
  const handleSignOut = async () => {
    console.log('Logout button clicked')
    try {
      await signOut({ 
        callbackUrl: '/auth/signin'
      })
    } catch (error) {
      console.error('Sign out error:', error)
      // フォールバック：直接リダイレクト
      window.location.href = '/auth/signin'
    }
  }

  return (
    <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
      <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={onMenuClick}
        >
          <span className="sr-only">メニューを開く</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex flex-1 items-center">
            <h1 className="text-lg font-semibold text-gray-900">
              建設業勤怠管理システム
            </h1>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Notifications */}
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">通知を確認</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div
              className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10"
              aria-hidden="true"
            />

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="-m-1.5 flex items-center p-1.5">
                <span className="sr-only">ユーザーメニューを開く</span>
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <span className="hidden lg:flex lg:items-center">
                  <span
                    className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                    aria-hidden="true"
                  >
                    {user.name}
                  </span>
                </span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs">{user.company}</div>
                        <div className="text-xs capitalize">{user.role}</div>
                      </div>
                    )}
                  </Menu.Item>
                  <hr className="my-1" />
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } block w-full text-left px-3 py-1 text-sm leading-6 text-gray-900`}
                        onClick={handleSignOut}
                      >
                        ログアウト
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  )
}