'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Code2, Eye, EyeOff, Loader2, Briefcase } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'CLIENT'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registrasi gagal')
      } else {
        router.push('/auth/login?registered=true')
      }
    } catch (err) {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      {/* Role Selection */}
      <div className="mb-6">
        <label className="label">Saya adalah</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              formData.role === 'CLIENT'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold text-sm">Client</div>
              <div className="text-xs opacity-70">Punya proyek</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'VIBECODER' })}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              formData.role === 'VIBECODER'
                ? 'border-accent-500 bg-accent-50 text-accent-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Code2 className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold text-sm">Vibecoder</div>
              <div className="text-xs opacity-70">Punya skill</div>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="label">Nama Lengkap</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input"
            placeholder="nama@email.com"
            required
          />
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input pr-10"
              placeholder="Min. 6 karakter"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Konfirmasi Password</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="input"
            placeholder="Ulangi password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Masuk di sini
          </Link>
        </p>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        Dengan mendaftar, Anda menyetujui{' '}
        <a href="#" className="underline">Terms of Service</a> dan{' '}
        <a href="#" className="underline">Privacy Policy</a> kami.
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              VibeBridge
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Buat Akun Baru</h1>
          <p className="text-gray-600 mt-2">Bergabung dengan komunitas VibeBridge</p>
        </div>

        <Suspense fallback={<div className="card animate-pulse h-96" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
