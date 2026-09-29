# 📖 LumaJournal — Personal Digital Journal Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **A modern full-stack digital journaling platform featuring daily mood tracking, rich-text reflections, real-time insights, and interactive calendar analytics.**

---

## ✨ Features

- ✍️ **Distraction-Free Journal Editor**: Rich text editing, auto-save status indicators, word count, reading time calculator, and instant drafts.
- 🎭 **Daily Mood Tracking**: Visual mood picker (excellent, good, calm, neutral, low, anxious, sad, angry) paired with daily reflection notes.
- 📊 **Mood Analytics & Insights**: Interactive charts powered by Recharts showing mood trends, weekly breakdown, and writing consistency streaks.
- 📅 **Interactive Calendar View**: View past reflections by date with mood badge highlights and daily entries overview.
- 🏷️ **Tagging & Filtering**: Organize thoughts with custom tags, quick search, pinned favorites, and archive management.
- ⚡ **Real-Time Synchronization**: Instant multi-tab synchronization and live stats updates using Socket.IO.
- 🌓 **Curated Theming**: Sleek dark and calm light modes with glassmorphic aesthetics and smooth micro-animations.
- 🔒 **Secure Authentication**: Salted bcrypt password hashing, JWT authentication, and multi-tenant user data isolation.
- 📥 **Data Portability**: Export your personal journal entries anytime as JSON or Markdown.

---

## 🏗️ Architecture & Tech Stack

LumaJournal is organized as a modular TypeScript monorepo:

| Layer | Technologies | Description |
|---|---|---|
| **Frontend (`apps/web`)** | React 18, Vite 6, Tailwind CSS, Lucide Icons, Recharts, Framer Motion, TanStack Query | Single-page application with responsive layouts and theme controls |
| **Backend (`apps/api`)** | Node.js, Express, Socket.IO, Helmet, CORS, Multer, Zod | RESTful API and WebSocket server with security middleware |
| **Database & ORM** | PostgreSQL 16, Prisma ORM | Relational schema with migrations, indexing, and seed data |
| **Shared (`packages/shared`)** | TypeScript, Zod | Shared validation schemas, DTOs, and event constants |
| **Testing** | Vitest, Supertest | Integration and unit testing suite |

```text
lumajournal/
├── apps/
│   ├── web/               # React + Vite frontend
│   └── api/               # Express + Socket.IO API server
├── packages/
│   ├── shared/            # Shared TypeScript types & Zod schemas
│   └── config/            # Shared tsconfig configs
├── docs/                  # API, Database, and Architecture documentation
├── docker-compose.yml     # PostgreSQL 16 Docker service
└── package.json           # Monorepo workspaces & root scripts
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18+` or `v20+` (tested on `v24`)
- **npm**: `v9+` or `v11+`
- **Docker** *(Optional, for running PostgreSQL in a container)*

### 2. Clone the Repository
```bash
git clone https://github.com/sinchana1408/Digital-Journal-Platform.git
cd Digital-Journal-Platform
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Windows PowerShell: `Copy-Item .env.example .env`)*

Default environment values:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumajournal?schema=public"
JWT_SECRET="lumajournal_super_secure_jwt_secret_key_change_in_production_2026"
CLIENT_URL="http://localhost:5173"
UPLOAD_DIR="./uploads"
```

### 5. Database Setup (PostgreSQL)
Start PostgreSQL using Docker:
```bash
docker compose up -d
```
Push the Prisma schema and seed initial sample data:
```bash
npm run db:push
npm run db:seed
```

*(Note: The API server also features built-in fallback resilience so you can test routes and UI even if PostgreSQL is not immediately active).*

---

## 💻 Available Commands

| Command | Description |
|---|---|
| `npm run dev` | **Start both API backend & Web frontend concurrently** |
| `npm run dev:web` | Start only the React/Vite web application (`http://localhost:5173`) |
| `npm run dev:api` | Start only the Express API backend (`http://localhost:5000/api`) |
| `npm run build` | Build shared package, API, and optimized web bundle |
| `npm test` | Run the backend integration and unit test suite |
| `npm run db:push` | Synchronize Prisma schema with PostgreSQL database |
| `npm run db:seed` | Seed test user and sample journal reflections |
| `npm run db:studio` | Open Prisma Studio database viewer in browser |

---

## 🧪 Testing

Run automated API test suite covering authentication, authorization, and CRUD operations:
```bash
npm test
```

---

## 📚 Documentation

For deeper details, consult the dedicated guides in the `/docs` folder:
- [API Documentation](docs/API.md) — Comprehensive endpoints and request/response payloads
- [Architecture & Design](docs/ARCHITECTURE.md) — System design, WebSocket flow, and security model
- [Database Schema](docs/DATABASE.md) — ER diagram, Prisma schema models, and indexes

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
