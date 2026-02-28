import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDateShort, truncateText } from '@/lib/utils'
import { Search, Code2, Calendar, DollarSign, ArrowRight } from 'lucide-react'

export default async function BrowseProjectsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'VIBECODER') redirect('/dashboard')

  const projects = await prisma.project.findMany({
    where: {
      status: 'PROJECT_CREATED',
      vibecoderId: null,
    },
    include: {
      client: { select: { name: true, trustScore: true } },
      milestones: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const CATEGORY_LABELS: Record<string, string> = {
    WEB_APP: 'Web App',
    MOBILE_APP: 'Mobile App',
    API_BACKEND: 'API/Backend',
    UI_UX_DESIGN: 'UI/UX',
    AI_INTEGRATION: 'AI Integration',
    ECOMMERCE: 'E-Commerce',
    LANDING_PAGE: 'Landing Page',
    DASHBOARD: 'Dashboard',
    OTHER: 'Lainnya',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cari Proyek</h1>
        <p className="text-gray-600 mt-1">{projects.length} proyek tersedia untuk dikerjakan</p>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Proyek Tersedia</h3>
          <p className="text-gray-500">Cek kembali nanti untuk proyek baru</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                      {CATEGORY_LABELS[project.category] || project.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      Client: {project.client.name} (⭐ {project.client.trustScore?.toFixed(0)})
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(project.totalAmount)}</div>
                  <div className="text-xs text-gray-500">Budget</div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {truncateText(project.description, 150)}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                {project.deadline && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Deadline: {formatDateShort(project.deadline)}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Code2 className="w-3 h-3" />
                  {project.milestones.length} milestone
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Revisi: {project.revisionLimit}x
                </div>
              </div>

              {project.techStack && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {JSON.parse(project.techStack).slice(0, 4).map((tech: string) => (
                    <span key={tech} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Diposting {formatDateShort(project.createdAt)}
                </div>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="btn-primary text-sm flex items-center gap-1"
                >
                  Lihat Detail <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
