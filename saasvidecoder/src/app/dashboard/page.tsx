import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDateShort, getStatusColor, getStatusLabel } from '@/lib/utils'
import {
  FolderOpen,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const userId = session.user.id
  const role = session.user.role

  // Redirect admin to admin dashboard
  if (role === 'ADMIN') redirect('/admin')

  // Fetch data based on role
  let stats: any = {}
  let recentProjects: any[] = []

  if (role === 'CLIENT') {
    const [totalProjects, activeProjects, completedProjects, totalSpent, disputes] = await Promise.all([
      prisma.project.count({ where: { clientId: userId } }),
      prisma.project.count({ where: { clientId: userId, status: { in: ['ESCROW_FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW'] } } }),
      prisma.project.count({ where: { clientId: userId, status: 'COMPLETED' } }),
      prisma.project.aggregate({ where: { clientId: userId, status: 'COMPLETED' }, _sum: { totalAmount: true } }),
      prisma.dispute.count({ where: { clientId: userId, status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
    ])

    stats = {
      totalProjects,
      activeProjects,
      completedProjects,
      totalSpent: totalSpent._sum.totalAmount || 0,
      disputes,
    }

    recentProjects = await prisma.project.findMany({
      where: { clientId: userId },
      include: {
        vibecoder: { select: { name: true } },
        milestones: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
  } else if (role === 'VIBECODER') {
    const wallet = await prisma.wallet.findUnique({ where: { userId } })
    const [activeProjects, completedProjects, disputes] = await Promise.all([
      prisma.project.count({ where: { vibecoderId: userId, status: { in: ['ESCROW_FUNDED', 'IN_PROGRESS', 'SUBMITTED'] } } }),
      prisma.project.count({ where: { vibecoderId: userId, status: 'COMPLETED' } }),
      prisma.dispute.count({ where: { vibecoderId: userId, status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
    ])

    stats = {
      balance: wallet?.balance || 0,
      totalEarned: wallet?.totalEarned || 0,
      activeProjects,
      completedProjects,
      disputes,
    }

    recentProjects = await prisma.project.findMany({
      where: { vibecoderId: userId },
      include: {
        client: { select: { name: true } },
        milestones: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    })
  }

  const notifications = await prisma.notification.findMany({
    where: { userId, read: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {role === 'CLIENT' ? 'Kelola proyek dan pantau progres Anda' : 'Pantau proyek dan kelola pendapatan Anda'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {role === 'CLIENT' ? (
          <>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div>
              <div className="text-sm text-gray-500">Total Proyek</div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeProjects}</div>
              <div className="text-sm text-gray-500">Proyek Aktif</div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.completedProjects}</div>
              <div className="text-sm text-gray-500">Selesai</div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</div>
              <div className="text-sm text-gray-500">Total Dibelanjakan</div>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.balance)}</div>
              <div className="text-sm text-gray-500">Saldo Wallet</div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalEarned)}</div>
              <div className="text-sm text-gray-500">Total Pendapatan</div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeProjects}</div>
              <div className="text-sm text-gray-500">Proyek Aktif</div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.completedProjects}</div>
              <div className="text-sm text-gray-500">Proyek Selesai</div>
            </div>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Proyek Terbaru</h2>
              <Link href="/dashboard/projects" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                Lihat semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Belum ada proyek</p>
                {role === 'CLIENT' && (
                  <Link href="/dashboard/projects/new" className="btn-primary mt-3 inline-flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" />
                    Buat Proyek Pertama
                  </Link>
                )}
                {role === 'VIBECODER' && (
                  <Link href="/dashboard/browse" className="btn-primary mt-3 inline-flex items-center gap-2 text-sm">
                    Cari Proyek
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{project.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {role === 'CLIENT' ? project.vibecoder?.name || 'Belum ada vibecoder' : project.client?.name}
                        {' · '}
                        {formatDateShort(project.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(project.totalAmount)}</div>
                      <span className={`badge ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications & Quick Actions */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="space-y-2">
              {role === 'CLIENT' ? (
                <>
                  <Link href="/dashboard/projects/new" className="btn-primary w-full flex items-center gap-2 justify-center text-sm">
                    <Plus className="w-4 h-4" />
                    Buat Proyek Baru
                  </Link>
                  <Link href="/dashboard/projects" className="btn-secondary w-full flex items-center gap-2 justify-center text-sm">
                    <FolderOpen className="w-4 h-4" />
                    Lihat Proyek
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard/browse" className="btn-primary w-full flex items-center gap-2 justify-center text-sm">
                    Cari Proyek Baru
                  </Link>
                  <Link href="/dashboard/wallet" className="btn-secondary w-full flex items-center gap-2 justify-center text-sm">
                    <Wallet className="w-4 h-4" />
                    Kelola Wallet
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifikasi</h2>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tidak ada notifikasi baru</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex gap-3 p-2 rounded-lg bg-blue-50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{notif.title}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{notif.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
