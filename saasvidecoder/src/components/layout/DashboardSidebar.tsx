'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  Plus,
  Wallet,
  AlertTriangle,
  Users,
  Settings,
  Code2,
  Search,
  BarChart3,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  role: string
}

const clientLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Proyek Saya', icon: FolderOpen },
  { href: '/dashboard/projects/new', label: 'Buat Proyek', icon: Plus },
  { href: '/dashboard/disputes', label: 'Sengketa', icon: AlertTriangle },
]

const vibecoderLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/browse', label: 'Cari Proyek', icon: Search },
  { href: '/dashboard/projects', label: 'Proyek Aktif', icon: FolderOpen },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/disputes', label: 'Sengketa', icon: AlertTriangle },
]

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/projects', label: 'Semua Proyek', icon: FolderOpen },
  { href: '/admin/disputes', label: 'Sengketa', icon: Shield },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const links = role === 'ADMIN' ? adminLinks : role === 'VIBECODER' ? vibecoderLinks : clientLinks

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            VibeBridge
          </span>
        </Link>
        <div className="mt-2">
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            role === 'CLIENT' ? 'bg-blue-100 text-blue-700' :
            role === 'VIBECODER' ? 'bg-purple-100 text-purple-700' :
            'bg-red-100 text-red-700'
          )}>
            {role === 'CLIENT' ? 'Client' : role === 'VIBECODER' ? 'Vibecoder' : 'Admin'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/dashboard' && link.href !== '/admin' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <link.icon className={cn('w-5 h-5', isActive ? 'text-primary-600' : 'text-gray-400')} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-100">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
          Pengaturan
        </Link>
      </div>
    </aside>
  )
}
