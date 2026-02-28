'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Loader2, Shield } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resolveForm, setResolveForm] = useState<string | null>(null)
  const [resolveData, setResolveData] = useState({
    decision: 'RESOLVED_CLIENT',
    resolution: '',
    adminNotes: '',
    refundPercent: 50,
  })
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    try {
      const res = await fetch('/api/disputes')
      if (res.ok) {
        const data = await res.json()
        setDisputes(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (disputeId: string) => {
    setActionLoading(disputeId)
    try {
      const res = await fetch(`/api/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolveData),
      })
      if (res.ok) {
        setResolveForm(null)
        await fetchDisputes()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading('')
    }
  }

  const REASON_LABELS: Record<string, string> = {
    FAKE_DELIVERY: 'Deliverable Palsu',
    INCOMPLETE_WORK: 'Pekerjaan Tidak Lengkap',
    QUALITY_ISSUE: 'Masalah Kualitas',
    DEADLINE_MISSED: 'Deadline Terlewat',
    SCOPE_CREEP: 'Perubahan Scope',
    PAYMENT_ISSUE: 'Masalah Pembayaran',
    OTHER: 'Lainnya',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const openDisputes = disputes.filter((d) => ['OPEN', 'UNDER_REVIEW'].includes(d.status))
  const resolvedDisputes = disputes.filter((d) => !['OPEN', 'UNDER_REVIEW'].includes(d.status))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Sengketa</h1>
        <p className="text-gray-600 mt-1">
          {openDisputes.length} sengketa aktif · {resolvedDisputes.length} diselesaikan
        </p>
      </div>

      {/* Open Disputes */}
      {openDisputes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Sengketa Aktif ({openDisputes.length})
          </h2>
          {openDisputes.map((dispute) => (
            <div key={dispute.id} className="card border-red-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{dispute.project?.title}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    {REASON_LABELS[dispute.reason] || dispute.reason}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Dibuka: {formatDate(dispute.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {dispute.client?.name} vs {dispute.vibecoder?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(dispute.project?.totalAmount || 0)}
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 bg-gray-50 rounded-lg p-3">
                {dispute.description}
              </p>

              {resolveForm === dispute.id ? (
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900">Selesaikan Sengketa</h4>
                  <div>
                    <label className="label">Keputusan</label>
                    <select
                      value={resolveData.decision}
                      onChange={(e) => setResolveData({ ...resolveData, decision: e.target.value })}
                      className="input"
                    >
                      <option value="RESOLVED_CLIENT">Menangkan Client (Refund penuh)</option>
                      <option value="RESOLVED_VIBECODER">Menangkan Vibecoder (Bayar penuh)</option>
                      <option value="RESOLVED_SPLIT">Split (Bagi dana)</option>
                    </select>
                  </div>

                  {resolveData.decision === 'RESOLVED_SPLIT' && (
                    <div>
                      <label className="label">Persentase Refund ke Client (%)</label>
                      <input
                        type="number"
                        value={resolveData.refundPercent}
                        onChange={(e) => setResolveData({ ...resolveData, refundPercent: parseInt(e.target.value) })}
                        className="input"
                        min="0"
                        max="100"
                      />
                    </div>
                  )}

                  <div>
                    <label className="label">Resolusi (untuk kedua pihak)</label>
                    <textarea
                      value={resolveData.resolution}
                      onChange={(e) => setResolveData({ ...resolveData, resolution: e.target.value })}
                      className="input min-h-[80px]"
                      placeholder="Jelaskan keputusan dan alasannya..."
                    />
                  </div>

                  <div>
                    <label className="label">Catatan Admin (internal)</label>
                    <textarea
                      value={resolveData.adminNotes}
                      onChange={(e) => setResolveData({ ...resolveData, adminNotes: e.target.value })}
                      className="input min-h-[60px]"
                      placeholder="Catatan internal..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setResolveForm(null)}
                      className="btn-secondary flex-1"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleResolve(dispute.id)}
                      disabled={actionLoading === dispute.id}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {actionLoading === dispute.id && <Loader2 className="w-4 h-4 animate-spin" />}
                      Selesaikan Sengketa
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setResolveForm(dispute.id)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Selesaikan Sengketa
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolved Disputes */}
      {resolvedDisputes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-green-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Sengketa Diselesaikan ({resolvedDisputes.length})
          </h2>
          {resolvedDisputes.map((dispute) => (
            <div key={dispute.id} className="card opacity-75">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{dispute.project?.title}</h3>
                  <div className="text-sm text-gray-500">
                    {REASON_LABELS[dispute.reason] || dispute.reason} · {dispute.status}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {dispute.resolvedAt ? formatDate(dispute.resolvedAt) : ''}
                </div>
              </div>
              {dispute.resolution && (
                <div className="mt-3 bg-green-50 rounded-lg p-3 text-sm text-green-700">
                  {dispute.resolution}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {disputes.length === 0 && (
        <div className="card text-center py-16">
          <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Sengketa</h3>
          <p className="text-gray-500">Platform berjalan dengan baik!</p>
        </div>
      )}
    </div>
  )
}
