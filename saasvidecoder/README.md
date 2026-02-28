# 🌉 VibeBridge — SaaS Vibecoder Marketplace

> Platform marketplace escrow terpercaya yang menghubungkan **Client** dengan **Vibecoder** (AI-assisted developer) di Indonesia.

![VibeBridge](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite)

---

## 📋 Deskripsi

VibeBridge adalah platform SaaS marketplace dengan sistem **escrow payment** yang aman. Platform ini bertindak sebagai **Trusted Digital Intermediary** antara client dan vibecoder.

### Prinsip Utama
```
Client → Platform Escrow → Validasi → Vibecoder
```

Dana proyek **TIDAK pernah** langsung diberikan ke Vibecoder. Platform memegang kontrol penuh terhadap pelepasan dana.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm atau yarn

### Installation

```bash
# Clone repository
git clone https://github.com/mysitleh/saasvibecoder.git
cd saasvibecoder/saasvidecoder

# Install dependencies
npm install

# Setup database
npm run db:push

# Seed demo data
node prisma/seed.js

# Start development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 👤 Demo Accounts

| Role | Email | Password | Akses |
|------|-------|----------|-------|
| 🔴 Admin | admin@demo.com | demo123 | Full platform control |
| 🔵 Client | client@demo.com | demo123 | Buat & kelola proyek |
| 🟣 Vibecoder | vibecoder@demo.com | demo123 | Ambil & kerjakan proyek |

---

## 🏗️ Arsitektur Sistem

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS 3 |
| Language | TypeScript 5 |
| Database | SQLite (via Prisma) |
| ORM | Prisma 5 |
| Auth | NextAuth.js 4 |
| Icons | Lucide React |

### Struktur Direktori
```
saasvidecoder/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js            # Demo data seeder
├── src/
│   ├── app/
│   │   ├── admin/         # Admin dashboard
│   │   ├── api/           # REST API routes
│   │   ├── auth/          # Login & Register
│   │   └── dashboard/     # User dashboards
│   ├── components/
│   │   └── layout/        # Sidebar & Header
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts       # Helper functions
│   └── types/
│       └── next-auth.d.ts # Type extensions
└── ...config files
```

---

## 💰 Payment Lifecycle (Escrow Flow)

```
STEP 1: PROJECT_CREATED
  └─ Client membuat proyek + milestone

STEP 2: ESCROW_FUNDED
  └─ Client melakukan pembayaran
  └─ Dana dikunci di ESCROW_ACCOUNT_PLATFORM

STEP 3: IN_PROGRESS
  └─ LOCK_FUND() — Dana tidak bisa refund/withdraw
  └─ Vibecoder mulai mengerjakan

STEP 4: SUBMITTED
  └─ Vibecoder submit deliverable
  └─ (repo link, demo URL, deployment, docs)

STEP 5: UNDER_REVIEW (3-5 hari)
  └─ Client memilih: APPROVE / REVISION / DISPUTE

STEP 6A: PAYMENT_RELEASED
  └─ RELEASE_ESCROW()
  └─ Dana → Vibecoder Wallet (dikurangi platform fee)

STEP 6B: REVISION_REQUESTED
  └─ Status kembali ke IN_PROGRESS
  └─ Dana tetap terkunci

STEP 6C: DISPUTED
  └─ Masuk ARBITRATION MODE
  └─ Admin sebagai mediator
```

---

## 🎯 Fitur Utama

### 👤 Client
- ✅ Buat proyek dengan milestone
- ✅ Fund escrow (simulasi QRIS/VA/E-wallet)
- ✅ Review deliverable vibecoder
- ✅ Approve/Request Revision/Dispute
- ✅ Dashboard proyek real-time
- ✅ Notifikasi sistem

### 💻 Vibecoder
- ✅ Browse proyek tersedia
- ✅ Ambil proyek yang sesuai skill
- ✅ Submit deliverable per milestone
- ✅ Wallet terintegrasi
- ✅ Withdrawal ke rekening bank
- ✅ Trust score tracking

### 🛡️ Admin (SaaS Provider)
- ✅ Dashboard analytics lengkap
- ✅ Kelola semua proyek
- ✅ Resolve sengketa (Client/Vibecoder/Split)
- ✅ Kontrol penuh escrow
- ✅ Suspend account
- ✅ Revenue tracking

---

## 🗄️ Database Schema

### Models
| Model | Deskripsi |
|-------|-----------|
| `User` | Client, Vibecoder, Admin dengan trust score |
| `Project` | Proyek dengan status lifecycle |
| `Milestone` | Tahapan proyek dengan persentase |
| `EscrowTransaction` | Transaksi escrow per milestone |
| `Wallet` | Wallet user dengan balance |
| `WalletTransaction` | Riwayat transaksi wallet |
| `Deliverable` | Hasil kerja vibecoder |
| `Dispute` | Sengketa dengan resolusi |
| `Review` | Rating & ulasan |
| `Notification` | Notifikasi sistem |

---

## 🔒 Automatic Protection Logic

### Auto Approval
```
Jika client tidak merespon dalam 72 jam:
→ AUTO_APPROVE_AFTER(72 hours)
→ Melindungi vibecoder dari keterlambatan
```

### Auto Cancellation
```
Jika vibecoder tidak mulai:
→ AUTO_CANCEL()
→ Dana kembali ke client
```

### Refund Protection
```
Refund hanya jika:
- Milestone belum submit
- Arbitration decision (admin)
```

---

## 💵 Revenue Model

```
Platform Revenue =
  Commission Fee (8% default)
  + Payment Processing Fee
  + Subscription Vibecoder Pro (Rp 99K/bln)
  + Enterprise Client Plan
  + AI Code Revision Services (Add-on)
```

---

## 🔐 API Endpoints

### Authentication
```
POST /api/auth/register    — Registrasi user baru
POST /api/auth/[...nextauth] — NextAuth handler
```

### Projects
```
GET  /api/projects         — List proyek
POST /api/projects         — Buat proyek baru
GET  /api/projects/[id]    — Detail proyek
PATCH /api/projects/[id]   — Update status proyek
```

### Escrow
```
POST /api/escrow/fund      — Fund escrow proyek
```

### Milestones
```
POST /api/milestones/[id]/submit  — Submit deliverable
POST /api/milestones/[id]/approve — Approve milestone
```

### Disputes
```
GET  /api/disputes         — List sengketa
POST /api/disputes         — Buka sengketa
POST /api/disputes/[id]/resolve — Resolve sengketa (Admin)
```

### Wallet
```
GET  /api/wallet           — Info wallet & transaksi
POST /api/wallet           — Withdrawal
```

---

## 🌐 Pages

| Route | Deskripsi | Role |
|-------|-----------|------|
| `/` | Landing page | Public |
| `/auth/login` | Login | Public |
| `/auth/register` | Registrasi | Public |
| `/dashboard` | Dashboard utama | Client/Vibecoder |
| `/dashboard/projects` | List proyek | All |
| `/dashboard/projects/new` | Buat proyek | Client |
| `/dashboard/projects/[id]` | Detail proyek | All |
| `/dashboard/browse` | Browse proyek | Vibecoder |
| `/dashboard/wallet` | Wallet | Vibecoder |
| `/dashboard/disputes` | Sengketa | All |
| `/admin` | Admin dashboard | Admin |
| `/admin/projects` | Semua proyek | Admin |
| `/admin/disputes` | Kelola sengketa | Admin |

---

## 🏆 Trust Score System

### Vibecoder Score
- **Delivery Speed** — Kecepatan pengiriman
- **Dispute Rate** — Tingkat sengketa
- **Success Ratio** — Rasio proyek berhasil

### Client Score
- **Approval Delay** — Keterlambatan approval
- **Dispute Abuse** — Penyalahgunaan sengketa

Matching engine menggunakan score ini untuk rekomendasi.

---

## 🔮 Future Roadmap

- [ ] AI Dispute Judge
- [ ] Smart milestone validator
- [ ] Auto release via deployment check
- [ ] DAO-style arbitration
- [ ] Cross-border payout
- [ ] Real payment gateway (Midtrans/Xendit)
- [ ] Mobile app (React Native)
- [ ] AI Code Revision Add-on service

---

## 📄 Compliance (Indonesia)

Platform berperan sebagai **Digital Escrow Marketplace**, bukan:
- Bank
- Employer  
- Payment issuer

Membutuhkan:
- Terms of Service
- Digital Contract
- Arbitration Policy
- Refund Policy

---

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

MIT License — bebas digunakan untuk keperluan komersial dan non-komersial.

---

<div align="center">
  <strong>VibeBridge</strong> — Trusted Digital Intermediary untuk Ekosistem Vibecoder Indonesia 🇮🇩
</div>
