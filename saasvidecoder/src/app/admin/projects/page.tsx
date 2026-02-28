import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDateShort, getStatusColor, getStatusLabel } from '@/lib/utils'
import { FolderOpen, ArrowRight } from 'lucide-react'

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/auth/login')

  const projects = await prisma.project.findMany({
    include: {
      client: { select: { name: true, email: true } },
      vibecoder: { select: { name: true, email: true } },
      milestones: true,
      _count: { select: { disputes: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Semua Proyek</h1>
        <p className="text-gray-600 mt-1">{projects.length} proyek total</p>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Proyek</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Client</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Vibecoder</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Budget</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Tanggal</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 text-sm">{project.title}</div>
                  <div className="text-xs text-gray-500">{project.category}</div>
                  {project._count.disputes > 0 && (
                    <span className="text-xs text-red-600 font-medium">{project._count.disputes} sengketa</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{project.client.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{project.vibecoder?.name || '-'}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(project.totalAmount)}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">{formatDateShort(project.createdAt)}</td>
                <td className="px-6 py-4">
                  <Link href={`/dashboard/projects/${project.id}`} className="text-primary-600 hover:text-primary-700">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
