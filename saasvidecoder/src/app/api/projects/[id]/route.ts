import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single project
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, name: true, email: true, image: true, trustScore: true } },
        vibecoder: { select: { id: true, name: true, email: true, image: true, trustScore: true, skills: true, bio: true } },
        milestones: { orderBy: { order: 'asc' } },
        escrowTransactions: true,
        deliverables: { orderBy: { createdAt: 'desc' } },
        disputes: {
          include: {
            client: { select: { id: true, name: true } },
            vibecoder: { select: { id: true, name: true } },
          },
        },
        reviews: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Proyek tidak ditemukan' }, { status: 404 })
    }

    // Check access
    const role = session.user.role
    if (role !== 'ADMIN' && project.clientId !== session.user.id && project.vibecoderId !== session.user.id) {
      // Vibecoders can see open projects
      if (role === 'VIBECODER' && project.status === 'PROJECT_CREATED') {
        return NextResponse.json(project)
      }
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('GET project error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH - Update project
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({ where: { id: params.id } })
    if (!project) {
      return NextResponse.json({ error: 'Proyek tidak ditemukan' }, { status: 404 })
    }

    const body = await req.json()
    const { action, vibecoderId } = body

    // Handle different actions
    if (action === 'assign_vibecoder') {
      if (session.user.role !== 'VIBECODER') {
        return NextResponse.json({ error: 'Hanya vibecoder yang bisa mengambil proyek' }, { status: 403 })
      }
      if (project.status !== 'PROJECT_CREATED') {
        return NextResponse.json({ error: 'Proyek tidak tersedia' }, { status: 400 })
      }

      const updated = await prisma.project.update({
        where: { id: params.id },
        data: {
          vibecoderId: session.user.id,
          status: 'ESCROW_FUNDED',
        },
      })

      // Notify client
      await prisma.notification.create({
        data: {
          userId: project.clientId,
          type: 'PROJECT_STARTED',
          title: 'Vibecoder Mengambil Proyek',
          message: `Seorang vibecoder telah mengambil proyek "${project.title}".`,
          link: `/dashboard/projects/${project.id}`,
        },
      })

      return NextResponse.json(updated)
    }

    if (action === 'start_work') {
      if (project.vibecoderId !== session.user.id) {
        return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
      }

      const updated = await prisma.project.update({
        where: { id: params.id },
        data: { status: 'IN_PROGRESS' },
      })

      return NextResponse.json(updated)
    }

    if (action === 'approve') {
      if (project.clientId !== session.user.id) {
        return NextResponse.json({ error: 'Hanya client yang bisa menyetujui' }, { status: 403 })
      }

      // Release escrow
      const updated = await prisma.project.update({
        where: { id: params.id },
        data: {
          status: 'PAYMENT_RELEASED',
          completedAt: new Date(),
        },
      })

      // Update escrow transactions
      await prisma.escrowTransaction.updateMany({
        where: { projectId: params.id, status: 'LOCKED' },
        data: { status: 'RELEASED', releasedAt: new Date() },
      })

      // Credit vibecoder wallet
      if (project.vibecoderId) {
        const vibecoderWallet = await prisma.wallet.findUnique({
          where: { userId: project.vibecoderId },
        })

        if (vibecoderWallet) {
          await prisma.wallet.update({
            where: { userId: project.vibecoderId },
            data: {
              balance: { increment: project.netAmount },
              totalEarned: { increment: project.netAmount },
            },
          })

          await prisma.walletTransaction.create({
            data: {
              walletId: vibecoderWallet.id,
              type: 'ESCROW_RELEASE',
              amount: project.netAmount,
              status: 'COMPLETED',
              description: `Payment released for project: ${project.title}`,
              reference: project.id,
            },
          })
        }

        // Notify vibecoder
        await prisma.notification.create({
          data: {
            userId: project.vibecoderId,
            type: 'PAYMENT_RELEASED',
            title: 'Pembayaran Diterima!',
            message: `Dana proyek "${project.title}" telah dilepaskan ke wallet Anda.`,
            link: `/dashboard/wallet`,
          },
        })
      }

      return NextResponse.json(updated)
    }

    if (action === 'request_revision') {
      if (project.clientId !== session.user.id) {
        return NextResponse.json({ error: 'Hanya client yang bisa meminta revisi' }, { status: 403 })
      }

      if (project.revisionsUsed >= project.revisionLimit) {
        return NextResponse.json({ error: 'Batas revisi telah tercapai' }, { status: 400 })
      }

      const updated = await prisma.project.update({
        where: { id: params.id },
        data: {
          status: 'REVISION_REQUESTED',
          revisionsUsed: { increment: 1 },
        },
      })

      if (project.vibecoderId) {
        await prisma.notification.create({
          data: {
            userId: project.vibecoderId,
            type: 'REVISION_REQUESTED',
            title: 'Revisi Diminta',
            message: `Client meminta revisi untuk proyek "${project.title}".`,
            link: `/dashboard/projects/${project.id}`,
          },
        })
      }

      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
  } catch (error) {
    console.error('PATCH project error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
