'use client'

import { signOut } from 'next-auth/react'
import { Bell, LogOut, User } from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface HeaderProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role: string
    image?: string | null
  }
}

export default function DashboardHeader({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-sm text-gray-500">
          Selamat datang kembali,{' '}
          <span className="font-semibold text-gray-900">{user.name || user.email}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user.image ? (
              <img src={user.image} alt={user.name || ''} className="w-8 h-8 rounded-full" />
            ) : (
              getInitials(user.name || user.email || 'U')
            )}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Keluar"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
