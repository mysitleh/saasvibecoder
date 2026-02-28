import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculatePlatformFee, calculateNetAmount } from '@/lib/utils'

// GET - List projects
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const role = session.user.role
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    let where: any = {}

    if (role === 'CLIENT') {
      where.clientId = session.user.id
    } else if (role === 'VIBECODER') {
      const assigned = searchParams.get('assigned')
      if (assigned === 'true') {
        where.vibecoderId = session.user.id
      } else {
        // Show open projects for vibecoders to browse
        where.status = 'PROJECT_CREATED'
        where.vibecoderId = null
      }
    }
    // ADMIN can see all

    if (status) where.status = status
    if (category) where.category = category

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true, image: true, trustScore: true } },
        vibecoder: { select: { id: true, name: true, email: true, image: true, trustScore: true, skills: true } },
        milestones: true,
        _count: { select: { disputes: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('GET projects error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create project
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Hanya client yang bisa membuat proyek' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, category, totalAmount, deadline, revisionLimit, techStack, requirements, milestones } = body

    if (!title || !description || !totalAmount) {
      return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 })
    }

    const platformFee = calculatePlatformFee(totalAmount)
    const netAmount = calculateNetAmount(totalAmount)

    const project = await prisma.project.create({
      data: {
        title,
        description,
        category: category || 'OTHER',
        totalAmount,
        platformFee,
        netAmount,
        deadline: deadline ? new Date(deadline) : null,
        revisionLimit: revisionLimit || 3,
        techStack: techStack ? JSON.stringify(techStack) : null,
        requirements,
        clientId: session.user.id,
        milestones: milestones && milestones.length > 0 ? {
          create: milestones.map((m: any, index: number) => ({
            title: m.title,
            description: m.description,
            percentage: m.percentage,
            amount: (totalAmount * m.percentage) / 100,
            order: index + 1,
            deadline: m.deadline ? new Date(m.deadline) : null,
          })),
        } : undefined,
      },
      include: {
        milestones: true,
        client: { select: { id: true, name: true, email: true } },
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'PROJECT_CREATED',
        title: 'Proyek Berhasil Dibuat',
        message: `Proyek "${title}" telah berhasil dibuat. Silakan lakukan pembayaran escrow untuk memulai.`,
        link: `/dashboard/projects/${project.id}`,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('POST project error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
