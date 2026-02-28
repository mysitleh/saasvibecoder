import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Approve milestone
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Hanya client yang bisa menyetujui milestone' }, { status: 403 })
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      include: {
        project: true,
        escrowTransaction: true,
      },
    })

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone tidak ditemukan' }, { status: 404 })
    }

    if (milestone.project.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    if (milestone.status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Milestone belum dikirim' }, { status: 400 })
    }

    // Approve milestone
    await prisma.milestone.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    })

    // Release escrow for this milestone
    if (milestone.escrowTransaction) {
      await prisma.escrowTransaction.update({
        where: { id: milestone.escrowTransaction.id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      })

      // Credit vibecoder wallet
      if (milestone.project.vibecoderId) {
        const vibecoderWallet = await prisma.wallet.findUnique({
          where: { userId: milestone.project.vibecoderId },
        })

        if (vibecoderWallet) {
          await prisma.wallet.update({
            where: { userId: milestone.project.vibecoderId },
            data: {
              balance: { increment: milestone.escrowTransaction.netAmount },
              totalEarned: { increment: milestone.escrowTransaction.netAmount },
            },
          })

          await prisma.walletTransaction.create({
            data: {
              walletId: vibecoderWallet.id,
              escrowTransactionId: milestone.escrowTransaction.id,
              type: 'ESCROW_RELEASE',
              amount: milestone.escrowTransaction.netAmount,
              status: 'COMPLETED',
              description: `Milestone "${milestone.title}" approved`,
              reference: milestone.id,
            },
          })
        }

        // Notify vibecoder
        await prisma.notification.create({
          data: {
            userId: milestone.project.vibecoderId,
            type: 'MILESTONE_APPROVED',
            title: 'Milestone Disetujui!',
            message: `Milestone "${milestone.title}" telah disetujui. Dana telah ditransfer ke wallet Anda.`,
            link: `/dashboard/wallet`,
          },
        })
      }
    }

    // Check if all milestones approved
    const allMilestones = await prisma.milestone.findMany({
      where: { projectId: milestone.projectId },
    })

    const allApproved = allMilestones.every(
      (m) => m.id === params.id || ['APPROVED', 'RELEASED'].includes(m.status)
    )

    if (allApproved) {
      await prisma.project.update({
        where: { id: milestone.projectId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ message: 'Milestone berhasil disetujui' })
  } catch (error) {
    console.error('Approve milestone error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
