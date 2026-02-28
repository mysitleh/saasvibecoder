import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Submit deliverable for milestone
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'VIBECODER') {
      return NextResponse.json({ error: 'Hanya vibecoder yang bisa submit deliverable' }, { status: 403 })
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      include: { project: true },
    })

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone tidak ditemukan' }, { status: 404 })
    }

    if (milestone.project.vibecoderId !== session.user.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { repoLink, demoUrl, deploymentLink, documentation, notes } = await req.json()

    // Create deliverable
    await prisma.deliverable.create({
      data: {
        projectId: milestone.projectId,
        milestoneId: milestone.id,
        repoLink,
        demoUrl,
        deploymentLink,
        documentation,
        notes,
      },
    })

    // Update milestone status
    await prisma.milestone.update({
      where: { id: params.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    })

    // Check if all milestones submitted
    const allMilestones = await prisma.milestone.findMany({
      where: { projectId: milestone.projectId },
    })

    const allSubmitted = allMilestones.every(
      (m) => m.id === params.id || ['SUBMITTED', 'APPROVED', 'RELEASED'].includes(m.status)
    )

    if (allSubmitted) {
      await prisma.project.update({
        where: { id: milestone.projectId },
        data: { status: 'SUBMITTED' },
      })
    }

    // Notify client
    await prisma.notification.create({
      data: {
        userId: milestone.project.clientId,
        type: 'MILESTONE_SUBMITTED',
        title: 'Milestone Dikirim',
        message: `Vibecoder telah mengirim deliverable untuk milestone "${milestone.title}". Silakan review.`,
        link: `/dashboard/projects/${milestone.projectId}`,
      },
    })

    return NextResponse.json({ message: 'Deliverable berhasil dikirim' })
  } catch (error) {
    console.error('Submit milestone error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
