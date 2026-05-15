# Vibe-coding Backend Application

Aplikasi ini adalah backend service (RESTful API) untuk mengelola autentikasi pengguna. Aplikasi ini dibangun dengan performa tinggi menggunakan ekosistem terbaru Javascript/Typescript.

## 🛠️ Technology Stack & Library

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Elysia JS](https://elysiajs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: MySQL
- **Library Tambahan**: 
  - `dotenv` (untuk manajemen environment variables)
  - `bun-types` (untuk integrasi tipe data Bun di TypeScript)
  - `mysql2` (driver MySQL)

## 📂 Arsitektur & Struktur Folder

Aplikasi ini menggunakan pola arsitektur **Controller-Service-Route** yang disederhanakan, di mana routing dan controller (request/response handling) digabung dalam folder `routes`, sedangkan business logic dipisah ke folder `services`.

```text
/
├── src/                # Kode sumber utama
│   ├── db/             # Konfigurasi database dan skema Drizzle ORM
│   │   └── schema.ts   # Definisi tabel database
│   ├── routes/         # Definisi endpoint API dan validasi request (Elysia route)
│   │   └── user-routes.ts 
│   ├── services/       # Business logic (pemrosesan data, interaksi database)
│   │   └── user-services.ts
│   └── index.ts        # Entry point aplikasi (Inisialisasi server Elysia)
├── tests/              # Berisi unit test
│   └── user.test.ts
├── .env                # Variabel environment (kredensial DB)
├── bun.lock            # Lockfile untuk dependensi Bun
├── drizzle.config.ts   # Konfigurasi Drizzle ORM
├── package.json        # Definisi project dan scripts
└── tsconfig.json       # Konfigurasi TypeScript
```

## 🗄️ Database Schema

Terdapat 2 tabel utama dalam aplikasi ini:

1. **`users`** (Tabel Pengguna)
   - `id`: `INT` (Primary Key, Auto-increment)
   - `name`: `VARCHAR(255)` (Nama pengguna, wajib)
   - `email`: `VARCHAR(255)` (Email pengguna, wajib & unik)
   - `password`: `VARCHAR(255)` (Password yang sudah di-hash, wajib)
   - `createdAt`: `TIMESTAMP` (Waktu pendaftaran, otomatis)

2. **`sessions`** (Tabel Sesi Login)
   - `id`: `INT` (Primary Key, Auto-increment)
   - `token`: `VARCHAR(255)` (Token sesi / UUID, wajib)
   - `userId`: `INT` (Foreign Key ke `users.id`, referensi, wajib)
   - `createdAt`: `TIMESTAMP` (Waktu sesi dibuat, otomatis)

## 🌐 API Endpoints (Tersedia)

Base URL: `/api/users`

| Method | Endpoint    | Deskripsi | Body Request / Headers | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Mendaftar user baru (Register) | `name`, `email`, `password` | Data user yang baru dibuat |
| `POST` | `/login` | Login user | `email`, `password` | Token Sesi (`data: token`) |
| `POST` | `/current` | Mendapatkan data user saat ini | **Headers**: `Authorization: Bearer <token>` | Data user |
| `DELETE` | `/logout` | Logout (menghapus sesi) | **Headers**: `Authorization: Bearer <token>` | Pesan sukses logout |

## 🚀 Cara Setup Project

1. **Clone repositori ini** (atau pastikan Anda berada di direktori project).
2. **Install dependensi** menggunakan Bun:
   ```bash
   bun install
   ```
3. **Setup Environment Variables**:
   Buat file `.env` di root direktori (jika belum ada) dan sesuaikan URL database Anda. Contoh:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/nama_database"
   ```
4. **Push Schema ke Database** (Membuat tabel secara otomatis):
   ```bash
   bun run db:push
   ```

## 💻 Cara Menjalankan Aplikasi

Untuk menjalankan server dalam mode development (dengan fitur hot-reload):
```bash
bun run dev
```
Aplikasi akan berjalan di `http://localhost:3000` (secara default akan menampilkan "Hello Elysia" di root endpoint `/`).

## 🧪 Cara Test Aplikasi

Aplikasi menggunakan test runner bawaan dari Bun. Untuk menjalankan unit test:
```bash
bun test
```
