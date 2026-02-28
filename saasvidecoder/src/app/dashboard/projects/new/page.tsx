'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { calculatePlatformFee, calculateNetAmount, formatCurrency } from '@/lib/utils'

interface Milestone {
  title: string
  description: string
  percentage: number
  deadline: string
}

const CATEGORIES = [
  { value: 'WEB_APP', label: 'Web Application' },
  { value: 'MOBILE_APP', label: 'Mobile App' },
  { value: 'API_BACKEND', label: 'API / Backend' },
  { value: 'UI_UX_DESIGN', label: 'UI/UX Design' },
  { value: 'AI_INTEGRATION', label: 'AI Integration' },
  { value: 'ECOMMERCE', label: 'E-Commerce' },
  { value: 'LANDING_PAGE', label: 'Landing Page' },
  { value: 'DASHBOARD', label: 'Dashboard' },
  { value: 'OTHER', label: 'Lainnya' },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'WEB_APP',
    totalAmount: '',
    deadline: '',
    revisionLimit: '3',
    techStack: '',
    requirements: '',
  })

  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: 'Milestone 1', description: '', percentage: 30, deadline: '' },
    { title: 'Milestone 2', description: '', percentage: 40, deadline: '' },
    { title: 'Milestone 3', description: '', percentage: 30, deadline: '' },
  ])

  const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0)
  const amount = parseFloat(formData.totalAmount) || 0
  const platformFee = calculatePlatformFee(amount)
  const netAmount = calculateNetAmount(amount)

  const addMilestone = () => {
    setMilestones([...milestones, { title: `Milestone ${milestones.length + 1}`, description: '', percentage: 0, deadline: '' }])
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: value }
    setMilestones(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (milestones.length > 0 && totalPercentage !== 100) {
      setError('Total persentase milestone harus 100%')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalAmount: parseFloat(formData.totalAmount),
          revisionLimit: parseInt(formData.revisionLimit),
          techStack: formData.techStack ? formData.techStack.split(',').map((s) => s.trim()) : [],
          milestones: milestones.length > 0 ? milestones : [],
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal membuat proyek')
      } else {
        router.push(`/dashboard/projects/${data.id}`)
      }
    } catch (err) {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Proyek Baru</h1>
          <p className="text-gray-600 mt-1">Isi detail proyek Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Informasi Dasar</h2>

          <div>
            <label className="label">Judul Proyek *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Contoh: Website E-Commerce untuk Toko Baju"
              required
            />
          </div>

          <div>
            <label className="label">Deskripsi Proyek *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[120px] resize-none"
              placeholder="Jelaskan detail proyek, fitur yang dibutuhkan, dan ekspektasi Anda..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Batas Revisi</label>
              <select
                value={formData.revisionLimit}
                onChange={(e) => setFormData({ ...formData, revisionLimit: e.target.value })}
                className="input"
              >
                {[1, 2, 3, 5, 10].map((n) => (
                  <option key={n} value={n}>{n}x revisi</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Budget Total (IDR) *</label>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="input"
                placeholder="5000000"
                min="100000"
                required
              />
              {amount > 0 && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Platform fee (8%):</span>
                    <span className="text-red-600">-{formatCurrency(platformFee)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Vibecoder terima:</span>
                    <span className="text-green-600">{formatCurrency(netAmount)}</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="label">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="label">Tech Stack (pisahkan dengan koma)</label>
            <input
              type="text"
              value={formData.techStack}
              onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
              className="input"
              placeholder="React, Node.js, PostgreSQL, Tailwind CSS"
            />
          </div>

          <div>
            <label className="label">Requirements Tambahan</label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="input min-h-[80px] resize-none"
              placeholder="Persyaratan khusus, referensi desain, dll..."
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Milestone</h2>
              <p className="text-sm text-gray-500">Bagi proyek menjadi tahapan yang terukur</p>
            </div>
            <div className={`text-sm font-medium ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
              Total: {totalPercentage}%
            </div>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Milestone {index + 1}</span>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Judul Milestone</label>
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                      className="input text-sm"
                      placeholder="Contoh: Design & Wireframe"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Persentase (%)</label>
                    <input
                      type="number"
                      value={milestone.percentage}
                      onChange={(e) => updateMilestone(index, 'percentage', parseInt(e.target.value) || 0)}
                      className="input text-sm"
                      min="1"
                      max="100"
                    />
                    {amount > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        = {formatCurrency((amount * milestone.percentage) / 100)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Deskripsi</label>
                    <input
                      type="text"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      className="input text-sm"
                      placeholder="Deliverable yang diharapkan"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Deadline</label>
                    <input
                      type="date"
                      value={milestone.deadline}
                      onChange={(e) => updateMilestone(index, 'deadline', e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addMilestone}
            className="btn-secondary w-full flex items-center gap-2 justify-center text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Milestone
          </button>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Link href="/dashboard/projects" className="btn-secondary flex-1 text-center">
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Membuat...' : 'Buat Proyek'}
          </button>
        </div>
      </form>
    </div>
  )
}
