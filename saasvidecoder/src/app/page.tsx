import Link from 'next/link'
import { Shield, Zap, Users, TrendingUp, CheckCircle, Star, ArrowRight, Code2, Wallet, MessageSquare } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                VibeBridge
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Fitur</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Cara Kerja</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Harga</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Masuk
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm">
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Platform Escrow Terpercaya untuk Vibecoder
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Hubungkan Client dengan{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Vibecoder Terbaik
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Platform marketplace dengan sistem escrow aman. Dana terlindungi, milestone transparan, 
              dan pembayaran otomatis saat proyek selesai.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register?role=CLIENT" className="btn-primary text-base px-8 py-3 flex items-center gap-2 justify-center">
                Mulai sebagai Client
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/register?role=VIBECODER" className="btn-secondary text-base px-8 py-3 flex items-center gap-2 justify-center">
                Daftar sebagai Vibecoder
                <Code2 className="w-5 h-5" />
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Escrow Aman</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Milestone Transparan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Dispute Protection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Vibecoder Aktif' },
              { value: '1,200+', label: 'Proyek Selesai' },
              { value: '98%', label: 'Tingkat Kepuasan' },
              { value: 'Rp 2M+', label: 'Dana Diproses' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Unggulan Platform</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dirancang khusus untuk ekosistem vibecoder Indonesia dengan sistem keamanan fintech-grade
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Escrow Berlapis',
                description: 'Dana proyek dikunci aman di escrow platform. Tidak bisa ditarik tanpa persetujuan kedua pihak.',
                color: 'text-blue-600 bg-blue-100',
              },
              {
                icon: TrendingUp,
                title: 'Milestone System',
                description: 'Bagi proyek menjadi milestone. Bayar bertahap sesuai progres. Risiko minimal untuk semua pihak.',
                color: 'text-green-600 bg-green-100',
              },
              {
                icon: Users,
                title: 'Trust Score',
                description: 'Sistem penilaian transparan berdasarkan kecepatan delivery, dispute rate, dan success ratio.',
                color: 'text-purple-600 bg-purple-100',
              },
              {
                icon: MessageSquare,
                title: 'Dispute Resolution',
                description: 'Tim mediator profesional siap menyelesaikan sengketa dengan keputusan yang adil dan transparan.',
                color: 'text-orange-600 bg-orange-100',
              },
              {
                icon: Wallet,
                title: 'Instant Wallet',
                description: 'Vibecoder mendapat wallet terintegrasi. Withdraw kapan saja dengan proses T+1 yang cepat.',
                color: 'text-pink-600 bg-pink-100',
              },
              {
                icon: Zap,
                title: 'Auto Protection',
                description: 'Auto-approve setelah 72 jam jika client tidak merespon. Melindungi vibecoder dari keterlambatan.',
                color: 'text-yellow-600 bg-yellow-100',
              },
            ].map((feature) => (
              <div key={feature.title} className="card hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cara Kerja VibeBridge</h2>
            <p className="text-gray-600">Proses sederhana, aman, dan transparan</p>
          </div>
          <div className="grid md:grid-cols-2 gap-16">
            {/* For Clients */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">C</span>
                Untuk Client
              </h3>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Buat Proyek', desc: 'Deskripsikan kebutuhan, tentukan budget dan milestone' },
                  { step: '2', title: 'Danai Escrow', desc: 'Transfer dana ke escrow platform yang aman' },
                  { step: '3', title: 'Vibecoder Bekerja', desc: 'Pantau progres melalui dashboard real-time' },
                  { step: '4', title: 'Review & Approve', desc: 'Setujui hasil kerja, dana otomatis dikirim ke vibecoder' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* For Vibecoders */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <span className="w-8 h-8 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center text-sm font-bold">V</span>
                Untuk Vibecoder
              </h3>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Daftar & Verifikasi', desc: 'Buat profil, tampilkan skill dan portofolio' },
                  { step: '2', title: 'Ambil Proyek', desc: 'Browse proyek yang sesuai skill dan ambil yang menarik' },
                  { step: '3', title: 'Kerjakan & Submit', desc: 'Kerjakan sesuai milestone, submit deliverable' },
                  { step: '4', title: 'Terima Pembayaran', desc: 'Dana langsung masuk wallet setelah disetujui' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 bg-accent-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Harga Transparan</h2>
            <p className="text-gray-600">Tidak ada biaya tersembunyi</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Client',
                price: 'Gratis',
                desc: 'Untuk pemilik proyek',
                features: ['Buat proyek unlimited', 'Sistem escrow aman', 'Milestone management', 'Dispute protection', 'Dashboard real-time'],
                cta: 'Mulai Gratis',
                href: '/auth/register?role=CLIENT',
                highlight: false,
              },
              {
                name: 'Vibecoder Pro',
                price: 'Rp 99K/bln',
                desc: 'Untuk developer profesional',
                features: ['Akses semua proyek', 'Priority listing', 'Komisi 5% (vs 8%)', 'Badge verified', 'Analytics dashboard'],
                cta: 'Mulai Trial',
                href: '/auth/register?role=VIBECODER',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                desc: 'Untuk tim & perusahaan',
                features: ['Dedicated account manager', 'SLA guarantee', 'Custom contract', 'Priority support', 'API access'],
                cta: 'Hubungi Kami',
                href: '/contact',
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`card ${plan.highlight ? 'border-primary-500 border-2 relative' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULER
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{plan.price}</div>
                  <div className="text-sm text-gray-500">{plan.desc}</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={plan.highlight ? 'btn-primary w-full text-center block' : 'btn-secondary w-full text-center block'}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Apa Kata Mereka</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Budi Santoso',
                role: 'Founder Startup',
                text: 'VibeBridge mengubah cara saya hire developer. Escrow system-nya bikin saya tenang, dana aman sampai proyek selesai.',
                rating: 5,
              },
              {
                name: 'Rina Dewi',
                role: 'Vibecoder Full-Stack',
                text: 'Akhirnya ada platform yang melindungi vibecoder juga! Auto-approve setelah 72 jam sangat membantu cashflow saya.',
                rating: 5,
              },
              {
                name: 'Ahmad Fauzi',
                role: 'Product Manager',
                text: 'Milestone system-nya luar biasa. Bisa pantau progres real-time dan bayar sesuai hasil. Sangat transparan!',
                rating: 5,
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="card">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                  <div className="text-xs text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Memulai Proyek Pertama Anda?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Bergabung dengan ribuan client dan vibecoder yang sudah mempercayai VibeBridge
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors">
              Daftar Sekarang — Gratis
            </Link>
            <Link href="/auth/login" className="border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition-colors">
              Sudah Punya Akun? Masuk
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">VibeBridge</span>
              </div>
              <p className="text-sm">Platform marketplace escrow untuk vibecoder dan client Indonesia.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Cara Kerja</a></li>
                <li><a href="#" className="hover:text-white">Fitur</a></li>
                <li><a href="#" className="hover:text-white">Harga</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Refund Policy</a></li>
                <li><a href="#" className="hover:text-white">Arbitration Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Status Page</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2024 VibeBridge. All rights reserved. Platform Escrow Digital Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
