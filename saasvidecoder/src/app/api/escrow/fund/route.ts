import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculatePlatformFee, calculateNetAmount } from '@/lib/utils'

// POST - Fund escrow for a project
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Hanya client yang bisa mendanai escrow' }, { status: 403 })
    }

    const { projectId, paymentMethod } = await req.json()

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID diperlukan' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { milestones: true },
    })

    if (!project) {
      return NextResponse.json({ error: 'Proyek tidak ditemukan' }, { status: 404 })
    }

    if (project.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    if (project.status !== 'PROJECT_CREATED') {
      return NextResponse.json({ error: 'Proyek sudah didanai atau tidak valid' }, { status: 400 })
    }

    // Simulate payment processing (in production, integrate with payment gateway)
    // Create escrow transactions for each milestone or one for the whole project
    const platformFee = calculatePlatformFee(project.totalAmount)
    const netAmount = calculateNetAmount(project.totalAmount)

    if (project.milestones.length > 0) {
      // Create escrow per milestone
      for (const milestone of project.milestones) {
        const milestoneFee = calculatePlatformFee(milestone.amount)
        const milestoneNet = calculateNetAmount(milestone.amount)

        await prisma.escrowTransaction.create({
          data: {
            projectId: project.id,
            milestoneId: milestone.id,
            amount: milestone.amount,
            platformFee: milestoneFee,
            netAmount: milestoneNet,
            status: 'LOCKED',
            lockedAt: new Date(),
          },
        })

        await prisma.milestone.update({
          where: { id: milestone.id },
          data: { status: 'IN_PROGRESS' },
        })
      }
    } else {
      // Create single escrow for whole project
      await prisma.escrowTransaction.create({
        data: {
          projectId: project.id,
          amount: project.totalAmount,
          platformFee,
          netAmount,
          status: 'LOCKED',
          lockedAt: new Date(),
        },
      })
    }

    // Update project status
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'ESCROW_FUNDED',
        fundedAt: new Date(),
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'ESCROW_FUNDED',
        title: 'Escrow Berhasil Didanai',
        message: `Dana proyek "${project.title}" telah berhasil dikunci di escrow. Proyek siap dikerjakan.`,
        link: `/dashboard/projects/${project.id}`,
      },
    })

    return NextResponse.json({
      message: 'Escrow berhasil didanai',
      project: updatedProject,
    })
  } catch (error) {
    console.error('Fund escrow error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
