export function cn(...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]): string {
  return inputs
    .filter(Boolean)
    .map((input) => {
      if (typeof input === 'string') return input
      if (typeof input === 'object' && input !== null) {
        return Object.entries(input)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(' ')
      }
      return ''
    })
    .join(' ')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PROJECT_CREATED: 'bg-gray-100 text-gray-800',
    ESCROW_FUNDED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    SUBMITTED: 'bg-purple-100 text-purple-800',
    UNDER_REVIEW: 'bg-orange-100 text-orange-800',
    REVISION_REQUESTED: 'bg-red-100 text-red-800',
    DISPUTED: 'bg-red-200 text-red-900',
    PAYMENT_RELEASED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-green-200 text-green-900',
    CANCELLED: 'bg-gray-200 text-gray-700',
    REFUNDED: 'bg-gray-100 text-gray-600',
    PENDING: 'bg-gray-100 text-gray-800',
    FUNDED: 'bg-blue-100 text-blue-800',
    LOCKED: 'bg-yellow-100 text-yellow-800',
    RELEASED: 'bg-green-100 text-green-800',
    REFUNDED_ESC: 'bg-gray-100 text-gray-600',
    OPEN: 'bg-red-100 text-red-800',
    UNDER_REVIEW_DISP: 'bg-orange-100 text-orange-800',
    RESOLVED_CLIENT: 'bg-blue-100 text-blue-800',
    RESOLVED_VIBECODER: 'bg-green-100 text-green-800',
    RESOLVED_SPLIT: 'bg-purple-100 text-purple-800',
    CLOSED: 'bg-gray-100 text-gray-600',
    APPROVED: 'bg-green-100 text-green-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PROJECT_CREATED: 'Dibuat',
    ESCROW_FUNDED: 'Dana Terkunci',
    IN_PROGRESS: 'Dikerjakan',
    SUBMITTED: 'Dikirim',
    UNDER_REVIEW: 'Direview',
    REVISION_REQUESTED: 'Revisi',
    DISPUTED: 'Sengketa',
    PAYMENT_RELEASED: 'Dibayar',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    REFUNDED: 'Dikembalikan',
    PENDING: 'Menunggu',
    FUNDED: 'Didanai',
    LOCKED: 'Terkunci',
    RELEASED: 'Dilepas',
    OPEN: 'Terbuka',
    RESOLVED_CLIENT: 'Selesai (Client)',
    RESOLVED_VIBECODER: 'Selesai (Vibecoder)',
    RESOLVED_SPLIT: 'Selesai (Split)',
    CLOSED: 'Ditutup',
    APPROVED: 'Disetujui',
  }
  return labels[status] || status
}

export function calculatePlatformFee(amount: number, feePercent = 8): number {
  return Math.round(amount * (feePercent / 100))
}

export function calculateNetAmount(amount: number, feePercent = 8): number {
  return amount - calculatePlatformFee(amount, feePercent)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}
