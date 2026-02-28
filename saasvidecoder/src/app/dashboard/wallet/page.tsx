'use client'

import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, Loader2, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)
  const [withdrawData, setWithdrawData] = useState({ amount: '', bankAccount: '', bankName: 'BCA' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet')
      if (res.ok) {
        const data = await res.json()
        setWallet(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setWithdrawLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawData.amount),
          bankAccount: withdrawData.bankAccount,
          bankName: withdrawData.bankName,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('Withdrawal berhasil diproses!')
        setShowWithdrawForm(false)
        setWithdrawData({ amount: '', bankAccount: '', bankName: 'BCA' })
        await fetchWallet()
      } else {
        setMessage(data.error || 'Withdrawal gagal')
      }
    } catch (err) {
      setMessage('Terjadi kesalahan')
    } finally {
      setWithdrawLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const getTransactionIcon = (type: string) => {
    if (['ESCROW_RELEASE', 'DEPOSIT'].includes(type)) return <ArrowDownLeft className="w-4 h-4 text-green-600" />
    return <ArrowUpRight className="w-4 h-4 text-red-600" />
  }

  const getTransactionColor = (type: string) => {
    if (['ESCROW_RELEASE', 'DEPOSIT'].includes(type)) return 'text-green-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600 mt-1">Kelola pendapatan dan penarikan dana Anda</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('berhasil') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(wallet?.balance || 0)}</div>
          <div className="text-primary-100 text-sm mt-1">Saldo Tersedia</div>
          <button
            onClick={() => setShowWithdrawForm(true)}
            className="mt-4 bg-white text-primary-700 hover:bg-primary-50 font-medium py-2 px-4 rounded-lg text-sm transition-colors w-full"
          >
            Tarik Dana
          </button>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(wallet?.totalEarned || 0)}</div>
          <div className="text-gray-500 text-sm mt-1">Total Pendapatan</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(wallet?.totalWithdrawn || 0)}</div>
          <div className="text-gray-500 text-sm mt-1">Total Ditarik</div>
        </div>
      </div>

      {/* Withdraw Form */}
      {showWithdrawForm && (
        <div className="card border-primary-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tarik Dana</h2>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Jumlah (IDR)</label>
                <input
                  type="number"
                  value={withdrawData.amount}
                  onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                  className="input"
                  placeholder="Minimal 50.000"
                  min="50000"
                  max={wallet?.balance || 0}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  Saldo: {formatCurrency(wallet?.balance || 0)}
                </div>
              </div>
              <div>
                <label className="label">Bank</label>
                <select
                  value={withdrawData.bankName}
                  onChange={(e) => setWithdrawData({ ...withdrawData, bankName: e.target.value })}
                  className="input"
                >
                  {['BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB', 'Permata', 'GoPay', 'OVO', 'Dana'].map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Nomor Rekening / Akun</label>
              <input
                type="text"
                value={withdrawData.bankAccount}
                onChange={(e) => setWithdrawData({ ...withdrawData, bankAccount: e.target.value })}
                className="input"
                placeholder="1234567890"
                required
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              ⚠️ Proses withdrawal T+1 (1 hari kerja). Pastikan data rekening benar.
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowWithdrawForm(false)} className="btn-secondary flex-1">Batal</button>
              <button type="submit" disabled={withdrawLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {withdrawLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Proses Withdrawal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Transaksi</h2>
        {!wallet?.transactions || wallet.transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>Belum ada transaksi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wallet.transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['ESCROW_RELEASE', 'DEPOSIT'].includes(tx.type) ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {tx.type === 'ESCROW_RELEASE' ? 'Pembayaran Diterima' :
                       tx.type === 'WITHDRAWAL' ? 'Penarikan Dana' :
                       tx.type === 'DEPOSIT' ? 'Deposit' :
                       tx.type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-500">{tx.description || tx.reference}</div>
                    <div className="text-xs text-gray-400">{formatDate(tx.createdAt)}</div>
                  </div>
                </div>
                <div className={`font-semibold ${getTransactionColor(tx.type)}`}>
                  {['ESCROW_RELEASE', 'DEPOSIT'].includes(tx.type) ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
