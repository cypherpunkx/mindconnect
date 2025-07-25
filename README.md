# 🌱 MindConnect – Ruang Aman Remaja

**MindConnect** adalah aplikasi web interaktif yang dirancang khusus untuk membantu generasi muda menghadapi tantangan kesehatan mental, literasi keuangan, manajemen teknologi, dan akses terhadap informasi bermanfaat. MindConnect menyediakan ruang aman digital dengan pendekatan yang inklusif, ringan, dan mudah digunakan oleh remaja dari berbagai latar belakang.

---

## 🔧 Fitur-Fitur Utama

### 🧠 1. Zona Kesehatan Mental
- **Tes Self-Assessment**  
  Tes awal berbasis skala (misalnya PHQ-9, GAD-7) untuk mengukur tingkat stres, depresi, dan kecemasan.

- **Jurnal Emosi**  
  Alat pencatatan harian untuk membantu pengguna mengenali suasana hati, emosi, dan pemicunya.

- **Sesi Mindfulness & Meditasi**  
  Akses ke video/audio bimbingan singkat untuk menenangkan pikiran dan mengelola stres.

- **Komunitas Anonim**  
  Forum diskusi aman dan anonim, dengan topik seperti depresi, body image, burnout, dan lainnya.

- **Live Chat Psikolog (Terjadwal)**  
  Layanan konseling profesional (gratis atau berbayar ringan) untuk dukungan yang lebih personal.

---

### 💸 2. Zona Edukasi Finansial
- **Simulasi Keuangan**  
  Game interaktif tentang budgeting, menabung, dan membuat keputusan belanja yang cerdas.

- **Kelas Mini (Microlearning)**  
  Materi edukatif singkat mengenai keuangan pribadi, investasi dasar, dan strategi hemat.

- **Kalkulator Finansial Remaja**  
  Alat bantu untuk menghitung uang jajan, target tabungan, atau estimasi biaya harian.

---

### 📵 3. Zona Manajemen Teknologi
- **Tracker Waktu Layar**  
  Sistem pelacakan penggunaan gadget, baik melalui input manual atau integrasi API (opsional).

- **Detoks Digital**  
  Tantangan 7, 14, atau 30 hari tanpa media sosial, lengkap dengan sistem motivasi dan penghargaan.

- **Kelas Literasi Digital**  
  Edukasi tentang keamanan digital, hoaks, cyberbullying, dan privasi online.

---

### 🌍 4. Zona Akses dan Inklusi
- **Peta Akses Bantuan**  
  Direktori interaktif yang memuat informasi lokasi psikolog, bimbingan karir, dan layanan dukungan lokal.

- **Beasiswa & Peluang**  
  Update info beasiswa, magang, dan program pengembangan remaja yang relevan.

- **Bahasa Sederhana & Aksesibilitas**  
  Desain ramah untuk pengguna dengan berbagai tingkat literasi dan kemampuan.

---

## 📈 Manfaat Langsung Bagi Remaja

- ✅ Mendapat dukungan emosional tanpa stigma.
- ✅ Lebih sadar dan bijak dalam menggunakan teknologi.
- ✅ Meningkatkan literasi finansial sejak dini.
- ✅ Merasa tidak sendirian dan punya ruang aman.

---

## 🛠️ Teknologi yang Digunakan

### Frontend
- **Next.js 15** dengan TypeScript untuk full-stack React framework
- **Tailwind CSS** untuk styling yang konsisten dan responsive
- **PWA capabilities** dengan next-pwa untuk offline functionality
- **TanStack Query** (React Query) untuk state management dan caching
- **Socket.io Client** untuk real-time features
- **Zod** untuk validation dan type safety

### Backend
- **Node.js** dengan **Express.js** framework
- **TypeScript** untuk type safety dan better developer experience
- **Socket.io** untuk real-time features (live chat, notifications)
- **JWT** untuk authentication dan session management
- **Helmet** untuk security headers dan protection

### Database & Caching
- **MySQL 8.0+** sebagai primary database dengan connection pooling
- **Redis** untuk session storage dan caching
- **MySQL JSON** data type untuk semi-structured content

### Infrastructure
- **Docker & Docker Compose** untuk development environment
- **GitHub Actions** untuk CI/CD pipeline
- **Security scanning** dengan Trivy
- **Automated testing** dengan Jest dan Playwright

---

## 📁 Struktur Proyek

```
mindconnect/
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Next.js pages
│   │   ├── lib/            # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets and PWA files
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
├── backend/                  # Express.js Backend API
│   ├── src/
│   │   ├── config/         # Database and Redis configuration
│   │   ├── routes/         # API route handlers
│   │   ├── models/         # Data models and schemas
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── database/
│   └── init/               # Database initialization scripts
├── .github/
│   └── workflows/          # CI/CD pipeline configuration
├── .kiro/
│   └── specs/              # Feature specifications and documentation
├── docker-compose.yml      # Development environment setup
├── setup.js               # Automated setup script
├── test-infrastructure.js # Infrastructure testing script
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### Automated Setup
```bash
# Clone the repository
git clone <repository-url>
cd mindconnect

# Run automated setup
node setup.js
```

### Manual Setup
```bash
# Install dependencies
cd frontend && npm ci
cd ../backend && npm ci

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Start services with Docker
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/health
# MySQL: localhost:3307
# Redis: localhost:6380
```

### Development Commands
```bash
# Start development servers
cd frontend && npm run dev  # Frontend development server
cd backend && npm run dev   # Backend development server

# Run tests
cd frontend && npm test     # Frontend tests
cd backend && npm test      # Backend tests

# Type checking
npm run type-check          # TypeScript validation

# Linting
npm run lint               # Code linting
npm run lint:fix           # Auto-fix linting issues
```

---

## 🧪 Testing

### Infrastructure Test
```bash
node test-infrastructure.js
```

### Unit & Integration Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test

# Test coverage
npm run test:coverage
```

### End-to-End Tests
```bash
# Run E2E tests (coming soon)
npm run test:e2e
```

---

## 🐳 Docker Development

### Start all services
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f [service-name]
```

### Stop services
```bash
docker-compose down
```

### Clean up (remove volumes)
```bash
docker-compose down -v
```

---

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration for cross-origin requests
- **JWT** authentication with secure session management
- **Input validation** and sanitization
- **Rate limiting** for API endpoints
- **Data encryption** for sensitive information
- **Automated security scanning** in CI/CD pipeline

---

## 📊 Database Schema

The application uses MySQL with the following core tables:
- `users` - User accounts and preferences
- `assessment_results` - Mental health assessment data
- `journal_entries` - Emotional journal entries
- `financial_progress` - Financial education progress
- `screen_time_logs` - Digital wellness tracking
- `community_posts` - Anonymous forum posts

See `database/init/01-init.sql` for complete schema.


---

## 🧑‍💻 Kontribusi

Kami sangat terbuka untuk kolaborasi!  
Jika kamu tertarik berkontribusi dalam pengembangan, desain, atau riset UX:

1. Fork repo ini.
2. Buat branch baru (`feature/nama-fitur`).
3. Commit perubahanmu.
4. Kirim Pull Request (PR).

---

## ⚖️ Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

## 📫 Kontak & Diskusi

Untuk pertanyaan atau kolaborasi lebih lanjut, hubungi:
- ✉️ Email: mindconnect.team@example.com
- 💬 Forum komunitas: (coming soon)

---

## ❤️ Catatan

Proyek ini dibuat dengan semangat empati dan peduli terhadap kesehatan mental generasi muda.  
Bantu kami membangun ruang yang aman, inklusif, dan penuh harapan bagi semua remaja. 🌟
