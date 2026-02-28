import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatDate, getStatusColor } from '@/lib/utils'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'

export default async function DisputesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const role = session.user.role
  const userId = session.user.id

  let where: any = {}
  if (role === 'CLIENT') where.clientId = userId
  else if (role === 'VIBECODER') where.vibecoderId = userId

  const disputes = await prisma.dispute.findMany({
    where,
    include: {
      project: { select: { id: true, title: true, totalAmount: true } },
      client: { select: { name: true } },
      vibecoder: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const REASON_LABELS: Record<string, string> = {
    FAKE_DELIVERY: 'Deliverable Palsu',
    INCOMPLETE_WORK: 'Pekerjaan Tidak Lengkap',
    QUALITY_ISSUE: 'Masalah Kualitas',
    DEADLINE_MISSED: 'Deadline Terlewat',
    SCOPE_CREEP: 'Perubahan Scope',
    PAYMENT_ISSUE: 'Masalah Pembayaran',
    OTHER: 'Lainnya',
  }

  const STATUS_LABELS: Record<string, string> = {
    OPEN: 'Terbuka',
    UNDER_REVIEW: 'Sedang Ditinjau',
    RESOLVED_CLIENT: 'Selesai (Client)',
    RESOLVED_VIBECODER: 'Selesai (Vibecoder)',
    RESOLVED_SPLIT: 'Selesai (Split)',
    CLOSED: 'Ditutup',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sengketa</h1>
        <p className="text-gray-600 mt-1">{disputes.length} sengketa ditemukan</p>
      </div>

      {disputes.length === 0 ? (
        <div className="card text-center py-16">
          <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Sengketa</h3>
          <p className="text-gray-500">Semua proyek berjalan dengan baik!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    dispute.status === 'OPEN' ? 'bg-red-100' :
                    dispute.status === 'UNDER_REVIEW' ? 'bg-orange-100' :
                    'bg-green-100'
                  }`}>
                    {dispute.status === 'OPEN' ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : dispute.status === 'UNDER_REVIEW' ? (
                      <Clock className="w-5 h-5 text-orange-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{dispute.project.title}</div>
                    <div className="text-sm text-gray-500">
                      {REASON_LABELS[dispute.reason] || dispute.reason}
                    </div>
                  </div>
                </div>
                <span className={`badge ${getStatusColor(dispute.status)}`}>
                  {STATUS_LABELS[dispute.status] || dispute.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-3">{dispute.description}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span>Client: {dispute.client.name}</span>
                <span>Vibecoder: {dispute.vibecoder.name}</span>
                <span>Dibuka: {formatDate(dispute.createdAt)}</span>
              </div>

              {dispute.resolution && (
                <div className="mt-3 pt-3 border-t border-gray-100 bg-green-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-green-800 mb-1">Resolusi Admin:</div>
                  <p className="text-sm text-green-700">{dispute.resolution}</p>
                  {dispute.resolvedAt && (
                    <div className="text-xs text-green-600 mt-1">
                      Diselesaikan: {formatDate(dispute.resolvedAt)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
