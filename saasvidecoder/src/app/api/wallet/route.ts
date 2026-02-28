import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get wallet info
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!wallet) {
      // Create wallet if not exists
      const newWallet = await prisma.wallet.create({
        data: { userId: session.user.id },
        include: { transactions: true },
      })
      return NextResponse.json(newWallet)
    }

    return NextResponse.json(wallet)
  } catch (error) {
    console.error('GET wallet error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Withdraw from wallet
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'VIBECODER') {
      return NextResponse.json({ error: 'Hanya vibecoder yang bisa withdraw' }, { status: 403 })
    }

    const { amount, bankAccount, bankName } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Jumlah tidak valid' }, { status: 400 })
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet tidak ditemukan' }, { status: 404 })
    }

    if (wallet.balance < amount) {
      return NextResponse.json({ error: 'Saldo tidak mencukupi' }, { status: 400 })
    }

    // Check for pending disputes
    const pendingDisputes = await prisma.dispute.count({
      where: {
        vibecoderId: session.user.id,
        status: { in: ['OPEN', 'UNDER_REVIEW'] },
      },
    })

    if (pendingDisputes > 0) {
      return NextResponse.json(
        { error: 'Tidak bisa withdraw saat ada sengketa aktif' },
        { status: 400 }
      )
    }

    // Process withdrawal (T+1 delay simulation)
    await prisma.wallet.update({
      where: { userId: session.user.id },
      data: {
        balance: { decrement: amount },
        totalWithdrawn: { increment: amount },
      },
    })

    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'WITHDRAWAL',
        amount,
        status: 'COMPLETED',
        description: `Withdrawal to ${bankName} - ${bankAccount}`,
        reference: `WD-${Date.now()}`,
      },
    })

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'WITHDRAWAL_PROCESSED',
        title: 'Withdrawal Berhasil',
        message: `Withdrawal sebesar ${amount.toLocaleString('id-ID')} berhasil diproses.`,
        link: `/dashboard/wallet`,
      },
    })

    return NextResponse.json({ message: 'Withdrawal berhasil diproses' })
  } catch (error) {
    console.error('POST wallet error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
