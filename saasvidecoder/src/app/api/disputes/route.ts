import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List disputes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let where: any = {}

    if (session.user.role === 'CLIENT') {
      where.clientId = session.user.id
    } else if (session.user.role === 'VIBECODER') {
      where.vibecoderId = session.user.id
    }
    // ADMIN sees all

    const disputes = await prisma.dispute.findMany({
      where,
      include: {
        project: { select: { id: true, title: true, totalAmount: true } },
        client: { select: { id: true, name: true, email: true } },
        vibecoder: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(disputes)
  } catch (error) {
    console.error('GET disputes error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create dispute
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Hanya client yang bisa membuka sengketa' }, { status: 403 })
    }

    const { projectId, reason, description } = await req.json()

    if (!projectId || !reason || !description) {
      return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Proyek tidak ditemukan' }, { status: 404 })
    }

    if (project.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    if (!project.vibecoderId) {
      return NextResponse.json({ error: 'Proyek belum memiliki vibecoder' }, { status: 400 })
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        projectId,
        clientId: session.user.id,
        vibecoderId: project.vibecoderId,
        reason,
        description,
        status: 'OPEN',
      },
    })

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'DISPUTED' },
    })

    // Notify vibecoder
    await prisma.notification.create({
      data: {
        userId: project.vibecoderId,
        type: 'DISPUTE_OPENED',
        title: 'Sengketa Dibuka',
        message: `Client membuka sengketa untuk proyek "${project.title}". Tim kami akan meninjau.`,
        link: `/dashboard/disputes/${dispute.id}`,
      },
    })

    // Notify admin (create notification for all admins)
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'DISPUTE_OPENED',
          title: 'Sengketa Baru',
          message: `Sengketa baru untuk proyek "${project.title}" perlu ditinjau.`,
          link: `/admin/disputes/${dispute.id}`,
        },
      })
    }

    return NextResponse.json(dispute, { status: 201 })
  } catch (error) {
    console.error('POST dispute error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
