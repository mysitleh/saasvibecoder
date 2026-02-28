'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Shield, CheckCircle, XCircle, AlertTriangle, Clock,
  ExternalLink, Github, Globe, FileText, Loader2, Send, Star
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [showSubmitForm, setShowSubmitForm] = useState<string | null>(null)
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [submitData, setSubmitData] = useState({ repoLink: '', demoUrl: '', deploymentLink: '', documentation: '', notes: '' })
  const [disputeData, setDisputeData] = useState({ reason: 'QUALITY_ISSUE', description: '' })

  useEffect(() => {
    fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setProject(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, extra?: any) => {
    setActionLoading(action)
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      if (res.ok) {
        await fetchProject()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading('')
    }
  }

  const handleFundEscrow = async () => {
    setActionLoading('fund')
    try {
      const res = await fetch('/api/escrow/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: params.id, paymentMethod: 'QRIS' }),
      })
      if (res.ok) {
        await fetchProject()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading('')
    }
  }

  const handleSubmitMilestone = async (milestoneId: string) => {
    setActionLoading(`submit-${milestoneId}`)
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })
      if (res.ok) {
        setShowSubmitForm(null)
        setSubmitData({ repoLink: '', demoUrl: '', deploymentLink: '', documentation: '', notes: '' })
        await fetchProject()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading('')
    }
  }

  const handleApproveMilestone = async (milestoneId: string) => {
    setActionLoading(`approve-${milestoneId}`)
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/approve`, {
        method: 'POST',
      })
      if (res.ok) {
        await fetchProject()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading('')
    }
  }

  const handleOpenDispute = async () => {
    setActionLoading('dispute')
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: params.id, ...disputeData }),
      })
      if (res.ok) {
        setShowDisputeForm(false)
        await fetchProject()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading('')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Proyek tidak ditemukan</p>
        <Link href="/dashboard/projects" className="btn-primary mt-4 inline-block">Kembali</Link>
      </div>
    )
  }

  const role = session?.user?.role
  const isClient = role === 'CLIENT' && project.clientId === session?.user?.id
  const isVibecoder = role === 'VIBECODER' && project.vibecoderId === session?.user?.id
  const isAdmin = role === 'ADMIN'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/projects" className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <span className={`badge ${getStatusColor(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
          </div>
          <p className="text-gray-600 mt-1">{project.category} · Dibuat {formatDate(project.createdAt)}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(project.totalAmount)}</div>
          <div className="text-sm text-gray-500">Vibecoder: {formatCurrency(project.netAmount)}</div>
        </div>
      </div>

      {/* Escrow Status Banner */}
      <div className={`rounded-xl p-4 flex items-center gap-3 ${
        project.status === 'ESCROW_FUNDED' || project.status === 'IN_PROGRESS' ? 'bg-blue-50 border border-blue-200' :
        project.status === 'COMPLETED' || project.status === 'PAYMENT_RELEASED' ? 'bg-green-50 border border-green-200' :
        project.status === 'DISPUTED' ? 'bg-red-50 border border-red-200' :
        'bg-gray-50 border border-gray-200'
      }`}>
        <Shield className={`w-5 h-5 flex-shrink-0 ${
          project.status === 'ESCROW_FUNDED' || project.status === 'IN_PROGRESS' ? 'text-blue-600' :
          project.status === 'COMPLETED' || project.status === 'PAYMENT_RELEASED' ? 'text-green-600' :
          project.status === 'DISPUTED' ? 'text-red-600' :
          'text-gray-600'
        }`} />
        <div>
          <div className="font-medium text-sm">
            {project.status === 'PROJECT_CREATED' && 'Dana belum dikunci di escrow'}
            {project.status === 'ESCROW_FUNDED' && `Dana ${formatCurrency(project.totalAmount)} terkunci aman di escrow`}
            {project.status === 'IN_PROGRESS' && `Dana ${formatCurrency(project.totalAmount)} terkunci - Proyek sedang dikerjakan`}
            {project.status === 'SUBMITTED' && 'Deliverable telah dikirim - Menunggu review client'}
            {project.status === 'PAYMENT_RELEASED' && `Pembayaran ${formatCurrency(project.netAmount)} telah dikirim ke vibecoder`}
            {project.status === 'COMPLETED' && 'Proyek selesai dengan sukses!'}
            {project.status === 'DISPUTED' && 'Proyek dalam proses arbitrasi'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Client Actions */}
        {isClient && project.status === 'PROJECT_CREATED' && (
          <button
            onClick={handleFundEscrow}
            disabled={actionLoading === 'fund'}
            className="btn-primary flex items-center gap-2"
          >
            {actionLoading === 'fund' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Danai Escrow
          </button>
        )}

        {isClient && project.status === 'SUBMITTED' && (
          <>
            <button
              onClick={() => handleAction('approve')}
              disabled={!!actionLoading}
              className="btn-success flex items-center gap-2"
            >
              {actionLoading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Setujui & Bayar
            </button>
            <button
              onClick={() => handleAction('request_revision')}
              disabled={!!actionLoading || project.revisionsUsed >= project.revisionLimit}
              className="btn-secondary flex items-center gap-2"
            >
              Minta Revisi ({project.revisionsUsed}/{project.revisionLimit})
            </button>
            <button
              onClick={() => setShowDisputeForm(true)}
              className="btn-danger flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Buka Sengketa
            </button>
          </>
        )}

        {/* Vibecoder Actions */}
        {isVibecoder && project.status === 'ESCROW_FUNDED' && (
          <button
            onClick={() => handleAction('start_work')}
            disabled={!!actionLoading}
            className="btn-primary flex items-center gap-2"
          >
            Mulai Mengerjakan
          </button>
        )}
      </div>

      {/* Dispute Form */}
      {showDisputeForm && (
        <div className="card border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Buka Sengketa</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Alasan Sengketa</label>
              <select
                value={disputeData.reason}
                onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                className="input"
              >
                <option value="FAKE_DELIVERY">Deliverable Palsu</option>
                <option value="INCOMPLETE_WORK">Pekerjaan Tidak Lengkap</option>
                <option value="QUALITY_ISSUE">Masalah Kualitas</option>
                <option value="DEADLINE_MISSED">Deadline Terlewat</option>
                <option value="SCOPE_CREEP">Perubahan Scope</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="label">Deskripsi</label>
              <textarea
                value={disputeData.description}
                onChange={(e) => setDisputeData({ ...disputeData, description: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Jelaskan masalah yang Anda hadapi..."
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDisputeForm(false)} className="btn-secondary flex-1">Batal</button>
              <button
                onClick={handleOpenDispute}
                disabled={actionLoading === 'dispute'}
                className="btn-danger flex-1 flex items-center justify-center gap-2"
              >
                {actionLoading === 'dispute' && <Loader2 className="w-4 h-4 animate-spin" />}
                Buka Sengketa
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi Proyek</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
            {project.requirements && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Requirements</h3>
                <p className="text-gray-600 text-sm">{project.requirements}</p>
              </div>
            )}
            {project.techStack && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(project.techStack).map((tech: string) => (
                    <span key={tech} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{tech}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Milestones */}
          {project.milestones.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Milestone</h2>
              <div className="space-y-4">
                {project.milestones.map((milestone: any) => (
                  <div key={milestone.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{milestone.title}</div>
                        {milestone.description && (
                          <div className="text-sm text-gray-500 mt-0.5">{milestone.description}</div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-semibold text-gray-900">{formatCurrency(milestone.amount)}</div>
                        <div className="text-xs text-gray-500">{milestone.percentage}%</div>
                        <span className={`badge mt-1 ${getStatusColor(milestone.status)}`}>
                          {getStatusLabel(milestone.status)}
                        </span>
                      </div>
                    </div>

                    {/* Deliverables for this milestone */}
                    {project.deliverables
                      .filter((d: any) => d.milestoneId === milestone.id)
                      .map((deliverable: any) => (
                        <div key={deliverable.id} className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          <div className="text-xs font-medium text-gray-700">Deliverable:</div>
                          {deliverable.repoLink && (
                            <a href={deliverable.repoLink} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-primary-600 hover:underline">
                              <Github className="w-3 h-3" /> {deliverable.repoLink}
                            </a>
                          )}
                          {deliverable.demoUrl && (
                            <a href={deliverable.demoUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-primary-600 hover:underline">
                              <Globe className="w-3 h-3" /> Demo: {deliverable.demoUrl}
                            </a>
                          )}
                          {deliverable.deploymentLink && (
                            <a href={deliverable.deploymentLink} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-primary-600 hover:underline">
                              <ExternalLink className="w-3 h-3" /> Live: {deliverable.deploymentLink}
                            </a>
                          )}
                          {deliverable.notes && (
                            <p className="text-xs text-gray-600">{deliverable.notes}</p>
                          )}
                        </div>
                      ))}

                    {/* Vibecoder Submit Button */}
                    {isVibecoder && milestone.status === 'IN_PROGRESS' && (
                      <div className="mt-3">
                        {showSubmitForm === milestone.id ? (
                          <div className="space-y-3 pt-3 border-t border-gray-100">
                            <input type="url" value={submitData.repoLink} onChange={(e) => setSubmitData({...submitData, repoLink: e.target.value})}
                              className="input text-sm" placeholder="Repository Link (GitHub/GitLab)" />
                            <input type="url" value={submitData.demoUrl} onChange={(e) => setSubmitData({...submitData, demoUrl: e.target.value})}
                              className="input text-sm" placeholder="Demo URL" />
                            <input type="url" value={submitData.deploymentLink} onChange={(e) => setSubmitData({...submitData, deploymentLink: e.target.value})}
                              className="input text-sm" placeholder="Deployment/Live URL" />
                            <textarea value={submitData.notes} onChange={(e) => setSubmitData({...submitData, notes: e.target.value})}
                              className="input text-sm min-h-[80px]" placeholder="Catatan untuk client..." />
                            <div className="flex gap-2">
                              <button onClick={() => setShowSubmitForm(null)} className="btn-secondary flex-1 text-sm">Batal</button>
                              <button
                                onClick={() => handleSubmitMilestone(milestone.id)}
                                disabled={actionLoading === `submit-${milestone.id}`}
                                className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
                              >
                                {actionLoading === `submit-${milestone.id}` && <Loader2 className="w-3 h-3 animate-spin" />}
                                Submit
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowSubmitForm(milestone.id)}
                            className="btn-primary text-sm flex items-center gap-2 mt-2"
                          >
                            <Send className="w-4 h-4" />
                            Submit Deliverable
                          </button>
                        )}
                      </div>
                    )}

                    {/* Client Approve Button */}
                    {isClient && milestone.status === 'SUBMITTED' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleApproveMilestone(milestone.id)}
                          disabled={actionLoading === `approve-${milestone.id}`}
                          className="btn-success text-sm flex items-center gap-2"
                        >
                          {actionLoading === `approve-${milestone.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Setujui Milestone
                        </button>
                        <button
                          onClick={() => handleAction('request_revision')}
                          className="btn-secondary text-sm"
                        >
                          Minta Revisi
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disputes */}
          {project.disputes.length > 0 && (
            <div className="card border-red-200">
              <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Sengketa
              </h2>
              {project.disputes.map((dispute: any) => (
                <div key={dispute.id} className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-red-900">{dispute.reason.replace(/_/g, ' ')}</span>
                    <span className={`badge ${getStatusColor(dispute.status)}`}>{dispute.status}</span>
                  </div>
                  <p className="text-sm text-red-700">{dispute.description}</p>
                  {dispute.resolution && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <div className="text-xs font-medium text-red-800">Resolusi Admin:</div>
                      <p className="text-sm text-red-700 mt-1">{dispute.resolution}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Project Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Info Proyek</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`badge ${getStatusColor(project.status)}`}>{getStatusLabel(project.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Budget</span>
                <span className="font-medium">{formatCurrency(project.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Platform Fee</span>
                <span className="text-red-600">-{formatCurrency(project.platformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Net Vibecoder</span>
                <span className="text-green-600 font-medium">{formatCurrency(project.netAmount)}</span>
              </div>
              {project.deadline && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Deadline</span>
                  <span>{formatDate(project.deadline)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Revisi</span>
                <span>{project.revisionsUsed}/{project.revisionLimit}</span>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Client</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                {project.client?.name?.[0] || 'C'}
              </div>
              <div>
                <div className="font-medium text-gray-900">{project.client?.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  Trust Score: {project.client?.trustScore?.toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Vibecoder Info */}
          {project.vibecoder && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Vibecoder</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center text-accent-700 font-bold">
                  {project.vibecoder?.name?.[0] || 'V'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{project.vibecoder?.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    Trust Score: {project.vibecoder?.trustScore?.toFixed(0)}
                  </div>
                </div>
              </div>
              {project.vibecoder?.bio && (
                <p className="text-xs text-gray-600 mt-2">{project.vibecoder.bio}</p>
              )}
            </div>
          )}

          {/* Vibecoder Take Project */}
          {!project.vibecoder && session?.user?.role === 'VIBECODER' && project.status === 'PROJECT_CREATED' && (
            <div className="card border-accent-200 bg-accent-50">
              <h3 className="font-semibold text-accent-900 mb-2">Ambil Proyek Ini</h3>
              <p className="text-sm text-accent-700 mb-3">Proyek ini tersedia untuk dikerjakan</p>
              <button
                onClick={() => handleAction('assign_vibecoder')}
                disabled={!!actionLoading}
                className="btn-primary w-full text-sm"
              >
                Ambil Proyek
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
