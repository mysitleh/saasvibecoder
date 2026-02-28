import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDateShort, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Plus, FolderOpen, ArrowRight } from 'lucide-react'

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const role = session.user.role
  const userId = session.user.id

  let projects: any[] = []

  if (role === 'CLIENT') {
    projects = await prisma.project.findMany({
      where: { clientId: userId },
      include: {
        vibecoder: { select: { name: true, image: true } },
        milestones: true,
        _count: { select: { disputes: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  } else if (role === 'VIBECODER') {
    projects = await prisma.project.findMany({
      where: { vibecoderId: userId },
      include: {
        client: { select: { name: true, image: true } },
        milestones: true,
        _count: { select: { disputes: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  } else {
    projects = await prisma.project.findMany({
      include: {
        client: { select: { name: true } },
        vibecoder: { select: { name: true } },
        milestones: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {role === 'CLIENT' ? 'Proyek Saya' : 'Proyek Aktif'}
          </h1>
          <p className="text-gray-600 mt-1">{projects.length} proyek ditemukan</p>
        </div>
        {role === 'CLIENT' && (
          <Link href="/dashboard/projects/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Buat Proyek
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-16">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Proyek</h3>
          <p className="text-gray-500 mb-6">
            {role === 'CLIENT'
              ? 'Mulai dengan membuat proyek pertama Anda'
              : 'Cari proyek yang sesuai dengan skill Anda'}
          </p>
          {role === 'CLIENT' ? (
            <Link href="/dashboard/projects/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Buat Proyek Pertama
            </Link>
          ) : (
            <Link href="/dashboard/browse" className="btn-primary inline-flex items-center gap-2">
              Cari Proyek
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const completedMilestones = project.milestones.filter((m: any) =>
              ['APPROVED', 'RELEASED'].includes(m.status)
            ).length
            const totalMilestones = project.milestones.length
            const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

            return (
              <div key={project.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{project.title}</h3>
                      <span className={`badge ${getStatusColor(project.status)} flex-shrink-0`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{project.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>
                        {role === 'CLIENT'
                          ? `Vibecoder: ${project.vibecoder?.name || 'Belum ada'}`
                          : `Client: ${project.client?.name}`}
                      </span>
                      <span>Dibuat: {formatDateShort(project.createdAt)}</span>
                      {project._count?.disputes > 0 && (
                        <span className="text-red-600 font-medium">
                          {project._count.disputes} sengketa
                        </span>
                      )}
                    </div>

                    {totalMilestones > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress Milestone</span>
                          <span>{completedMilestones}/{totalMilestones}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 text-right flex-shrink-0">
                    <div className="text-xl font-bold text-gray-900">{formatCurrency(project.totalAmount)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Komisi: {formatCurrency(project.platformFee)}
                    </div>
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Detail <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
