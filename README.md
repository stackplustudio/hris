# 🚀 Stack Plus Studio - Core Engine V1.0

Boilerplate Fullstack Web Development kelas produksi yang dirancang khusus untuk mempercepat inisiasi proyek klien. Dibangun dengan arsitektur Monorepo (Turborepo), memisahkan Frontend (Next.js) dan Backend (NestJS) dalam satu *repository* yang terintegrasi, aman, dan siap *deploy*.

---

## 🛠️ Tech Stack Utama

**Arsitektur & Tooling**
- **Monorepo:** Turborepo
- **Package Manager:** pnpm

**Frontend (`apps/web`)**
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS & Shadcn UI / UI Components
- **State & HTTP:** React Hooks, Axios (dengan Interceptor)
- **Feedback UI:** React Hot Toast

**Backend (`apps/api`)**
- **Framework:** NestJS
- **Database ORM:** Prisma
- **Security:** JWT (JSON Web Token), bcryptjs
- **Infrastruktur:** Dockerfile ready

---

## 📦 Struktur Direktori

```text
.
├── apps
│   ├── api                # Backend NestJS
│   │   ├── prisma         # Skema database
│   │   ├── src
│   │   │   ├── auth       # Modul JWT & Middleware Guard
│   │   │   ├── users      # Blueprint CRUD Modul (Standar)
│   │   │   └── main.ts    # Entry point backend (Port 3001)
│   │   └── Dockerfile     # Setup kontainer deployment
│   │
│   └── web                # Frontend Next.js
│       ├── src
│       │   ├── app        # App Router (Pages, Dashboard)
│       │   ├── components # Komponen UI re-usable
│       │   └── lib        # Konfigurasi eksternal (Axios)
│       └── proxy.ts       # Middleware proteksi rute Next.js
│
├── packages               # Shared config (TS, ESLint, dll)
├── pnpm-workspace.yaml    # Definisi workspace pnpm
└── turbo.json             # Konfigurasi pipeline Turborepo
```

---

## 🚦 Panduan Instalasi & Menjalankan Proyek

### 1. Persiapan Identitas & Kloning

Gunakan repository ini sebagai template untuk memulai proyek baru. Pastikan Anda mengonfigurasi identitas Git lokal Anda dengan email dan nama profil Stack Plus Studio agar riwayat commit tetap rapi dan profesional untuk pengerjaan proyek klien.

```bash
# Konfigurasi identitas repositori (dijalankan di dalam folder proyek)
git config user.name "Stack Plus Studio"
git config user.email "admin@stackplus.studio"
```

### 2. Instalasi Dependensi

Pastikan Anda menggunakan pnpm. Jalankan perintah ini di direktori root:

```bash
pnpm install
```

### 3. Konfigurasi Environment Variables

Gunakan [`.env.example`](./.env.example) sebagai daftar lengkap variabel yang diperlukan.
Salin nilai yang sesuai ke file berikut (jangan menyalin placeholder apa adanya):

- `apps/api/.env`: konfigurasi API, termasuk `DATABASE_URL`, rahasia JWT, `PORT`,
  `NODE_ENV`, dan `CORS_ORIGINS`.
- `apps/web/.env.local`: `NEXT_PUBLIC_API_URL` untuk alamat API.
- `packages/database/.env`: `DATABASE_URL` dan `DIRECT_URL` untuk perintah Prisma
  yang dijalankan dari package database.

Gunakan URL PostgreSQL untuk `DATABASE_URL` dan `DIRECT_URL`. Isi secret JWT
dengan dua nilai acak yang berbeda; jangan gunakan nilai contoh pada production.
Untuk deployment, atur variabel yang sama pada konfigurasi environment platform.

### 4. Setup Database (Prisma)

Jalankan migrasi untuk men-sinkronkan skema Prisma dengan database Anda:

```bash
# Masuk ke direktori API atau gunakan filter pnpm
pnpm --filter ./apps/api prisma generate
pnpm --filter ./apps/api prisma db push
```

### 5. Menjalankan Development Server

Jalankan Frontend dan Backend secara bersamaan dari root direktori menggunakan Turborepo:

```bash
pnpm dev
```

- **Frontend (Next.js):** http://localhost:3000
- **Backend (NestJS API):** http://localhost:3001

---

## 🔐 Sistem Keamanan (Auth Flow)

Boilerplate ini sudah dilengkapi dengan alur autentikasi siap pakai:

1. **Login** — Frontend mengirim kredensial ke `/auth/login` (NestJS).
2. **Token** — Backend memvalidasi dan mengembalikan JWT Token.
3. **Cookies** — Frontend menyimpan token di dalam Cookies.
4. **Interceptor** — Setiap request Axios berikutnya secara otomatis akan menyisipkan `Authorization: Bearer <token>` di Headers.
5. **Proxy Guard** — `proxy.ts` di Next.js akan memblokir akses ke halaman `/dashboard/*` jika token tidak ditemukan, lalu melempar user kembali ke halaman login.

---

## 🚀 Panduan Deployment

### Deployment Frontend (Next.js)

Frontend sangat dioptimalkan untuk di-deploy ke Vercel.

1. Hubungkan repository ke Vercel.
2. Atur **Root Directory** ke `apps/web`.
3. Masukkan `NEXT_PUBLIC_API_URL` di pengaturan Environment Variables Vercel (arahkan ke URL backend produksi).

### Deployment Backend (NestJS / Docker)

Backend siap di-deploy ke VPS (DigitalOcean, AWS, GCP, dll) menggunakan Docker.

1. Masuk ke VPS Anda.
2. Build image menggunakan Dockerfile yang tersedia di `apps/api/Dockerfile`:

```bash
docker build -t stackplus-api -f apps/api/Dockerfile .
```

3. Jalankan container:

```bash
docker run -d -p 3001:3001 --env-file apps/api/.env stackplus-api
```

---

Developed with ❤️ by **Stack Plus Studio Core Team**.