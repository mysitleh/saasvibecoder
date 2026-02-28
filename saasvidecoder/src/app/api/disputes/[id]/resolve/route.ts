import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Resolve dispute (Admin only)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya admin yang bisa menyelesaikan sengketa' }, { status: 403 })
    }

    const { resolution, decision, adminNotes, refundPercent } = await req.json()
    // decision: RESOLVED_CLIENT | RESOLVED_VIBECODER | RESOLVED_SPLIT

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: { escrowTransactions: true },
        },
      },
    })

    if (!dispute) {
      return NextResponse.json({ error: 'Sengketa tidak ditemukan' }, { status: 404 })
    }

    // Update dispute
    await prisma.dispute.update({
      where: { id: params.id },
      data: {
        status: decision,
        resolution,
        adminNotes,
        resolvedAt: new Date(),
      },
    })

    const project = dispute.project
    const escrowTxs = project.escrowTransactions.filter((tx) => tx.status === 'LOCKED')
    const totalLocked = escrowTxs.reduce((sum, tx) => sum + tx.amount, 0)

    if (decision === 'RESOLVED_CLIENT') {
      // Full refund to client
      for (const tx of escrowTxs) {
        await prisma.escrowTransaction.update({
          where: { id: tx.id },
          data: { status: 'REFUNDED', refundedAt: new Date() },
        })
      }

      await prisma.project.update({
        where: { id: project.id },
        data: { status: 'REFUNDED' },
      })

      await prisma.notification.create({
        data: {
          userId: dispute.clientId,
          type: 'DISPUTE_RESOLVED',
          title: 'Sengketa Diselesaikan',
          message: `Sengketa proyek "${project.title}" diselesaikan. Dana dikembalikan ke Anda.`,
          link: `/dashboard/projects/${project.id}`,
        },
      })
    } else if (decision === 'RESOLVED_VIBECODER') {
      // Full payment to vibecoder
      for (const tx of escrowTxs) {
        await prisma.escrowTransaction.update({
          where: { id: tx.id },
          data: { status: 'RELEASED', releasedAt: new Date() },
        })
      }

      if (project.vibecoderId) {
        const vibecoderWallet = await prisma.wallet.findUnique({
          where: { userId: project.vibecoderId },
        })

        if (vibecoderWallet) {
          const netTotal = escrowTxs.reduce((sum, tx) => sum + tx.netAmount, 0)
          await prisma.wallet.update({
            where: { userId: project.vibecoderId },
            data: {
              balance: { increment: netTotal },
              totalEarned: { increment: netTotal },
            },
          })
        }
      }

      await prisma.project.update({
        where: { id: project.id },
        data: { status: 'PAYMENT_RELEASED' },
      })

      await prisma.notification.create({
        data: {
          userId: dispute.vibecoderId,
          type: 'DISPUTE_RESOLVED',
          title: 'Sengketa Diselesaikan',
          message: `Sengketa proyek "${project.title}" diselesaikan. Dana ditransfer ke wallet Anda.`,
          link: `/dashboard/wallet`,
        },
      })
    } else if (decision === 'RESOLVED_SPLIT') {
      // Split payment
      const clientPercent = refundPercent || 50
      const vibecoderPercent = 100 - clientPercent

      for (const tx of escrowTxs) {
        await prisma.escrowTransaction.update({
          where: { id: tx.id },
          data: { status: 'RELEASED', releasedAt: new Date() },
        })
      }

      if (project.vibecoderId) {
        const vibecoderWallet = await prisma.wallet.findUnique({
          where: { userId: project.vibecoderId },
        })

        if (vibecoderWallet) {
          const netTotal = escrowTxs.reduce((sum, tx) => sum + tx.netAmount, 0)
          const vibecoderAmount = (netTotal * vibecoderPercent) / 100
          await prisma.wallet.update({
            where: { userId: project.vibecoderId },
            data: {
              balance: { increment: vibecoderAmount },
              totalEarned: { increment: vibecoderAmount },
            },
          })
        }
      }

      await prisma.project.update({
        where: { id: project.id },
        data: { status: 'COMPLETED' },
      })
    }

    // Notify both parties
    await prisma.notification.create({
      data: {
        userId: dispute.clientId,
        type: 'DISPUTE_RESOLVED',
        title: 'Sengketa Diselesaikan',
        message: `Sengketa untuk proyek "${project.title}" telah diselesaikan oleh admin.`,
        link: `/dashboard/projects/${project.id}`,
      },
    })

    await prisma.notification.create({
      data: {
        userId: dispute.vibecoderId,
        type: 'DISPUTE_RESOLVED',
        title: 'Sengketa Diselesaikan',
        message: `Sengketa untuk proyek "${project.title}" telah diselesaikan oleh admin.`,
        link: `/dashboard/projects/${project.id}`,
      },
    })

    return NextResponse.json({ message: 'Sengketa berhasil diselesaikan' })
  } catch (error) {
    console.error('Resolve dispute error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
