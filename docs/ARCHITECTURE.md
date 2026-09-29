# LumaJournal — Architecture & System Design

## 1. High-Level Architecture Overview

LumaJournal is architected as a modern, decoupled full-stack platform consisting of an editorial single-page client application (`apps/web`), a resilient REST & WebSocket backend service (`apps/api`), a shared library (`packages/shared`), and a PostgreSQL database layer managed through Prisma ORM.

```
                          ┌──────────────────────────┐
                          │   Client Browser         │
                          │   (React + Vite + TW)    │
                          └─────────────┬────────────┘
                                        │
                    HTTP REST Requests  │  WebSocket (Socket.IO)
                    (JWT / Session)     │  (Real-Time Sync)
                                        ▼
                          ┌──────────────────────────┐
                          │   Node.js / Express API  │
                          │   Controllers & Services │
                          └─────────────┬────────────┘
                                        │
                                        │ Prisma ORM
                                        ▼
                          ┌──────────────────────────┐
                          │   PostgreSQL Database    │
                          │   (Relational storage)   │
                          └──────────────────────────┘
```

---

## 2. Directory Structure

```text
lumajournal/
│
├── apps/
│   ├── web/                     # React 18 frontend with Vite & Tailwind CSS
│   │   ├── src/
│   │   │   ├── components/      # Reusable UI components (Editor, Cards, Modals, Navbar, etc.)
│   │   │   ├── pages/           # Landing, Dashboard, Editor, Entries, Calendar, Insights, etc.
│   │   │   ├── layouts/         # AppLayout, AuthLayout, MarketingLayout
│   │   │   ├── hooks/           # useAuth, useEntries, useSocket, useTheme, etc.
│   │   │   ├── services/        # Axios/Fetch API client abstractions
│   │   │   ├── store/           # Global state (AuthContext, ThemeContext, SocketContext)
│   │   │   ├── lib/             # Utility helpers & styling helpers
│   │   │   ├── types/           # Client-specific types
│   │   │   └── routes/          # ProtectedRoute, PublicRoute, AppRouter
│   │   ├── public/              # Static assets & favicon
│   │   ├── vite.config.ts       # Vite bundler config with API proxy
│   │   ├── tailwind.config.js   # Tailored calm & editorial design system
│   │   └── package.json
│   │
│   └── api/                     # Node.js + Express backend service
│       ├── src/
│       │   ├── controllers/     # HTTP request handlers (auth, entries, tags, insights, etc.)
│       │   ├── routes/          # Express route definitions
│       │   ├── middleware/      # Auth JWT guard, rate limiter, error handling, validation
│       │   ├── services/        # Core business logic & database access
│       │   ├── utils/           # Password hashing, JWT generator, stats calculators
│       │   ├── validators/      # Zod validation middleware
│       │   ├── sockets/         # Socket.IO connection manager & event emitters
│       │   ├── config/          # Environment variables & Prisma client instance
│       │   └── types/           # Backend-specific TypeScript definitions
│       ├── prisma/
│       │   ├── schema.prisma    # PostgreSQL Prisma schema definition
│       │   └── seed.ts          # Realistic seed generator
│       ├── tests/               # Vitest & Supertest integration tests
│       └── package.json
│
├── packages/
│   ├── shared/                  # Common TypeScript interfaces, Zod schemas, constants
│   └── config/                  # Base tsconfig and linting standards
│
├── docs/                        # Complete technical documentation
│   ├── API.md
│   ├── DATABASE.md
│   └── ARCHITECTURE.md
│
├── docker-compose.yml           # PostgreSQL 16 container definition
├── .env.example
├── .gitignore
└── README.md
```

---

## 3. Real-Time Synchronization (Socket.IO)

1. **Client Connection**: When an authenticated user connects, they emit `join_user` with their `userId`.
2. **Autosave Confirmation**: During editing, debounced updates trigger `PUT /api/entries/:id`. Once persisted, the server emits `entry:saved` to the user's socket room with updated timestamp and word count.
3. **Cross-Tab & Dashboard Sync**: When an entry is saved or deleted, `entry:updated` and `stats:updated` events are emitted, allowing open tabs or background dashboard views to refresh their charts and streaks without full page reloads.

---

## 4. Security & Access Control

* **Multi-Tenant Isolation**: Every database query for entries, tags, moods, and profile records filters strictly by `userId: req.user.id`. A user can never read, modify, or delete another user's content.
* **Password Security**: Passwords are saved as one-way salted hashes using `bcryptjs` (salt rounds: 12).
* **JWT Integrity**: JSON Web Tokens are signed using HMAC-SHA256 with expiration checks and configurable storage (HTTP-only cookies or Bearer Authorization).
* **Defensive HTTP Headers**: Express uses `helmet` to set CSP, HSTS, X-Frame-Options, and X-Content-Type-Options.
* **Rate Limiting**: `express-rate-limit` prevents brute-force attacks on auth endpoints.
* **SQL Injection Immunity**: Prisma ORM executes parameterized queries for 100% SQL injection prevention.
