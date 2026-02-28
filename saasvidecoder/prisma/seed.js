const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 12)

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Admin VibeBridge',
      email: 'admin@demo.com',
      password: hashedPassword,
      role: 'ADMIN',
      trustScore: 100,
    },
  })

  // Client
  const client = await prisma.user.upsert({
    where: { email: 'client@demo.com' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'client@demo.com',
      password: hashedPassword,
      role: 'CLIENT',
      trustScore: 95,
      wallet: {
        create: {
          balance: 5000000,
          totalEarned: 0,
        },
      },
    },
  })

  // Vibecoder
  const vibecoder = await prisma.user.upsert({
    where: { email: 'vibecoder@demo.com' },
    update: {},
    create: {
      name: 'Rina Dewi',
      email: 'vibecoder@demo.com',
      password: hashedPassword,
      role: 'VIBECODER',
      bio: 'Full-stack developer dengan 5 tahun pengalaman. Spesialisasi React, Node.js, dan AI integration.',
      skills: JSON.stringify(['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'AI/ML']),
      hourlyRate: 150000,
      trustScore: 98,
      successRatio: 100,
      wallet: {
        create: {
          balance: 2500000,
          totalEarned: 15000000,
          totalWithdrawn: 12500000,
        },
      },
    },
  })

  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { id: 'demo-project-1' },
    update: {},
    create: {
      id: 'demo-project-1',
      title: 'Website E-Commerce Toko Baju Online',
      description: 'Membutuhkan website e-commerce lengkap dengan fitur: katalog produk, keranjang belanja, checkout, payment gateway, dan admin panel. Desain modern dan mobile-responsive.',
      category: 'ECOMMERCE',
      status: 'IN_PROGRESS',
      totalAmount: 8000000,
      platformFee: 640000,
      netAmount: 7360000,
      revisionLimit: 3,
      revisionsUsed: 0,
      techStack: JSON.stringify(['Next.js', 'Tailwind CSS', 'PostgreSQL', 'Stripe']),
      requirements: 'Harus support mobile, SEO-friendly, loading cepat',
      clientId: client.id,
      vibecoderId: vibecoder.id,
      fundedAt: new Date(),
      milestones: {
        create: [
          {
            title: 'Design & Wireframe',
            description: 'UI/UX design, wireframe, dan prototype',
            percentage: 30,
            amount: 2400000,
            status: 'APPROVED',
            order: 1,
            approvedAt: new Date(),
          },
          {
            title: 'Frontend Development',
            description: 'Implementasi UI, halaman produk, keranjang',
            percentage: 40,
            amount: 3200000,
            status: 'IN_PROGRESS',
            order: 2,
          },
          {
            title: 'Backend & Deployment',
            description: 'API, payment gateway, deployment',
            percentage: 30,
            amount: 2400000,
            status: 'PENDING',
            order: 3,
          },
        ],
      },
    },
  })

  const project2 = await prisma.project.upsert({
    where: { id: 'demo-project-2' },
    update: {},
    create: {
      id: 'demo-project-2',
      title: 'Dashboard Analytics untuk SaaS',
      description: 'Membutuhkan dashboard analytics yang menampilkan data real-time, grafik interaktif, dan laporan yang bisa diexport.',
      category: 'DASHBOARD',
      status: 'PROJECT_CREATED',
      totalAmount: 5000000,
      platformFee: 400000,
      netAmount: 4600000,
      revisionLimit: 3,
      techStack: JSON.stringify(['React', 'Chart.js', 'Node.js', 'MongoDB']),
      clientId: client.id,
      milestones: {
        create: [
          {
            title: 'Design Dashboard',
            description: 'Wireframe dan design sistem',
            percentage: 25,
            amount: 1250000,
            status: 'PENDING',
            order: 1,
          },
          {
            title: 'Implementasi Charts',
            description: 'Grafik dan visualisasi data',
            percentage: 50,
            amount: 2500000,
            status: 'PENDING',
            order: 2,
          },
          {
            title: 'API & Export',
            description: 'Backend API dan fitur export',
            percentage: 25,
            amount: 1250000,
            status: 'PENDING',
            order: 3,
          },
        ],
      },
    },
  })

  const project3 = await prisma.project.upsert({
    where: { id: 'demo-project-3' },
    update: {},
    create: {
      id: 'demo-project-3',
      title: 'Landing Page Startup AI',
      description: 'Landing page modern untuk startup AI dengan animasi, testimonial, pricing section, dan CTA yang kuat.',
      category: 'LANDING_PAGE',
      status: 'COMPLETED',
      totalAmount: 2500000,
      platformFee: 200000,
      netAmount: 2300000,
      revisionLimit: 2,
      revisionsUsed: 1,
      techStack: JSON.stringify(['Next.js', 'Framer Motion', 'Tailwind CSS']),
      clientId: client.id,
      vibecoderId: vibecoder.id,
      fundedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  })

  // Create wallet transactions for vibecoder
  const vibecoderWallet = await prisma.wallet.findUnique({ where: { userId: vibecoder.id } })
  if (vibecoderWallet) {
    await prisma.walletTransaction.create({
      data: {
        walletId: vibecoderWallet.id,
        type: 'ESCROW_RELEASE',
        amount: 2300000,
        status: 'COMPLETED',
        description: 'Payment for Landing Page Startup AI',
        reference: 'demo-project-3',
      },
    })
    await prisma.walletTransaction.create({
      data: {
        walletId: vibecoderWallet.id,
        type: 'WITHDRAWAL',
        amount: 2000000,
        status: 'COMPLETED',
        description: 'Withdrawal to BCA - 1234567890',
        reference: 'WD-1234567890',
      },
    })
  }

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: client.id,
      type: 'PROJECT_CREATED',
      title: 'Selamat Datang di VibeBridge!',
      message: 'Akun Anda berhasil dibuat. Mulai buat proyek pertama Anda.',
      read: false,
    },
  })
  await prisma.notification.create({
    data: {
      userId: vibecoder.id,
      type: 'MILESTONE_APPROVED',
      title: 'Milestone Disetujui!',
      message: 'Milestone "Design & Wireframe" untuk proyek E-Commerce telah disetujui.',
      read: false,
    },
  })

  console.log('✅ Seed completed!')
  console.log('Demo accounts:')
  console.log('  Admin: admin@demo.com / demo123')
  console.log('  Client: client@demo.com / demo123')
  console.log('  Vibecoder: vibecoder@demo.com / demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
