import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDateShort, getStatusColor, getStatusLabel } from '@/lib/utils'
import {
  Users, FolderOpen, AlertTriangle, DollarSign, TrendingUp,
  Shield, CheckCircle, Clock, ArrowRight
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/auth/login')

  const [
    totalUsers,
    totalClients,
    totalVibecoders,
    totalProjects,
    activeProjects,
    completedProjects,
    openDisputes,
    totalEscrowLocked,
    totalRevenue,
    recentProjects,
    recentDisputes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.user.count({ where: { role: 'VIBECODER' } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: { in: ['ESCROW_FUNDED', 'IN_PROGRESS', 'SUBMITTED'] } } }),
    prisma.project.count({ where: { status: 'COMPLETED' } }),
    prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
    prisma.escrowTransaction.aggregate({
      where: { status: 'LOCKED' },
      _sum: { amount: true },
    }),
    prisma.escrowTransaction.aggregate({
      where: { status: 'RELEASED' },
      _sum: { platformFee: true },
    }),
    prisma.project.findMany({
      include: {
        client: { select: { name: true } },
        vibecoder: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.dispute.findMany({
      where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      include: {
        project: { select: { title: true } },
        client: { select: { name: true } },
        vibecoder: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform overview dan kontrol penuh</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
          <div className="text-sm text-gray-500">Total Pengguna</div>
          <div className="text-xs text-gray-400 mt-1">{totalClients} client · {totalVibecoders} vibecoder</div>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <FolderOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalProjects}</div>
          <div className="text-sm text-gray-500">Total Proyek</div>
          <div className="text-xs text-gray-400 mt-1">{activeProjects} aktif · {completedProjects} selesai</div>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
            <Shield className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{formatCurrency(totalEscrowLocked._sum.amount || 0)}</div>
          <div className="text-sm text-gray-500">Dana Terkunci</div>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue._sum.platformFee || 0)}</div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>
      </div>

      {/* Alert: Open Disputes */}
      {openDisputes > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-semibold text-red-900">{openDisputes} Sengketa Membutuhkan Perhatian</div>
              <div className="text-sm text-red-700">Segera tinjau dan selesaikan sengketa yang aktif</div>
            </div>
          </div>
          <Link href="/admin/disputes" className="btn-danger text-sm">
            Tinjau Sekarang
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Proyek Terbaru</h2>
            <Link href="/admin/projects" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Lihat semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{project.title}</div>
                  <div className="text-xs text-gray-500">
                    {project.client.name} → {project.vibecoder?.name || 'Belum ada'}
                  </div>
                </div>
                <div className="ml-3 text-right">
                  <div className="text-sm font-semibold">{formatCurrency(project.totalAmount)}</div>
                  <span className={`badge text-xs ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open Disputes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sengketa Aktif</h2>
            <Link href="/admin/disputes" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Lihat semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentDisputes.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Tidak ada sengketa aktif</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDisputes.map((dispute) => (
                <div key={dispute.id} className="p-3 rounded-lg border border-red-100 bg-red-50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-red-900 text-sm">{dispute.project.title}</div>
                    <span className="badge bg-red-100 text-red-800 text-xs">{dispute.status}</span>
                  </div>
                  <div className="text-xs text-red-700">
                    {dispute.reason.replace(/_/g, ' ')} · {dispute.client.name} vs {dispute.vibecoder.name}
                  </div>
                  <div className="text-xs text-red-600 mt-1">{formatDateShort(dispute.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">{Math.round((completedProjects / Math.max(totalProjects, 1)) * 100)}%</div>
          <div className="text-sm text-gray-500 mt-1">Success Rate</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">{openDisputes}</div>
          <div className="text-sm text-gray-500 mt-1">Sengketa Aktif</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600">{activeProjects}</div>
          <div className="text-sm text-gray-500 mt-1">Proyek Berjalan</div>
        </div>
      </div>
    </div>
  )
}
