# Finance Dashboard

A full-stack financial records management system with JWT-based auth, role-based access control, MongoDB aggregation-powered analytics, and a minimal Next.js + Tailwind frontend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + Tailwind CSS |
| Backend | Express.js (custom Next.js server) |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | Zod |
| Language | TypeScript (strict) |

## Quick Start

### Prerequisites
- Node.js >= 20
- MongoDB running locally on port 27017 (or Atlas URI)

### 1. Clone & Install
```bash
git clone <repo-url>
cd zorvyn
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local — set MONGODB_URI and JWT_SECRET
```

### 3. Seed the Database (optional but recommended)
```bash
npm run seed
```
This creates 3 test users and 10 sample records.

**Default credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@finance.dev | Admin1234! |
| Analyst | analyst@finance.dev | Analyst1234! |
| Viewer | viewer@finance.dev | Viewer1234! |

### 4. Start the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
zorvyn/
├── server.ts                 # Custom Express + Next.js entry point
├── src/
│   ├── app.ts                # Express app factory
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Root redirect
│   │   ├── login/page.tsx    # Login page
│   │   └── dashboard/page.tsx# Dashboard page
│   ├── controllers/          # Route handlers
│   │   ├── authController.ts
│   │   ├── recordController.ts
│   │   └── dashboardController.ts
│   ├── services/             # Business logic + Zod schemas
│   │   ├── authService.ts
│   │   ├── recordService.ts
│   │   └── dashboardService.ts
│   ├── models/               # Mongoose schemas
│   │   ├── User.ts
│   │   └── FinancialRecord.ts
│   ├── middleware/
│   │   ├── auth.ts           # verifyJWT + authorizeRoles
│   │   ├── validate.ts       # Zod validation middleware
│   │   ├── errorHandler.ts   # Global error handler
│   │   └── rateLimiter.ts    # express-rate-limit
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── recordRoutes.ts
│   │   └── dashboardRoutes.ts
│   ├── utils/
│   │   ├── db.ts             # MongoDB connection
│   │   ├── jwt.ts            # Token helpers
│   │   └── response.ts       # Standardized API responses
│   ├── lib/
│   │   └── api.ts            # Frontend fetch wrapper
│   └── types/
│       └── index.ts          # Shared TypeScript types
├── scripts/
│   └── seed.ts               # DB seeder
├── docs/
│   └── api.md                # Full API documentation
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## API Reference

See [`docs/api.md`](./docs/api.md) for full API documentation.

**Base:** `http://localhost:3000/api`

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login` |
| Records | `GET/POST /records`, `PATCH/DELETE /records/:id` |
| Dashboard | `GET /dashboard/summary`, `/category-totals`, `/monthly-trends`, `/recent-transactions` |

## Role-Based Access

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| Read records & summary | ✅ | ✅ | ✅ |
| Analytics (category/monthly) | ❌ | ✅ | ✅ |
| Create/Update/Delete records | ❌ | ❌ | ✅ |

## Docker

```bash
# Start app + MongoDB
docker-compose up -d

# Seed inside container
docker-compose exec app npm run seed
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | ❌ | Token expiry (default: `7d`) |
| `PORT` | ❌ | Server port (default: `3000`) |
| `NODE_ENV` | ❌ | `development` or `production` |

## Assumptions

1. JWT is stored in **localStorage** for simplicity (production apps should use `httpOnly` cookies).
2. Roles are assigned at registration — there is no admin UI for role management (use the seed script or MongoDB directly).
3. The custom server approach is used to satisfy the Express.js requirement while keeping a single unified port.
4. Financial amounts are stored as plain numbers without currency — the frontend renders them in INR (₹).
5. Rate limiting uses in-memory storage; for multi-instance deployments, switch to Redis-backed `rate-limit-redis`.

## Running Automated Tests

This project includes a comprehensive integration test suite for backend APIs using Vitest and Supertest.

### 1. Seed the Database (Recommended)
Before running tests, seed the database with test users and records:
```bash
npm run seed
```

### 2. Run All Tests
```bash
npm run test
```

- Tests are located in the `tests/` directory.
- The suite covers authentication, access control, CRUD, and dashboard analytics for all roles.
- Update the test tokens in `tests/api.integration.test.ts` with valid JWTs for the seeded users (see credentials above).

### 3. Test Output
Vitest will display a summary of all passing and failing tests. All core backend features are covered.
