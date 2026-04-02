# 📈 Zorvyn Finance Dashboard

> **Live Demo:** [https://finance-dashboard-rho-one.vercel.app](https://finance-dashboard-rho-one.vercel.app)

A full-stack, enterprise-grade financial records management system complete with **Clerk Authentication**, self-serve **Role-Based Access Control (RBAC)**, robust MongoDB aggregation analytics, and a beautiful minimal Next.js + Tailwind frontend.

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router) + React + Tailwind CSS |
| **Backend** | Express.js (custom Next.js server routing) |
| **Database** | MongoDB + Mongoose |
| **Auth** | **Clerk** (Drop-in UI + Webhook synchronization) |
| **Validation** | Zod (Strict schema enforcement) |
| **Language** | TypeScript (strict mode) |

## ✨ Core Features

1. **Seamless Authentication**: Powered by Clerk. Users can securely sign up via OAuth or email.
2. **Self-Serve Role Selection**: Upon their first login, users select their own role (`Viewer`, `Analyst`, or `Admin`). A robust race-condition-protected backend syncs this flawlessly into MongoDB.
3. **Role-Based Access Control**:
   - `Viewer`: Can only view the global dashboard summary metrics.
   - `Analyst`: Can view records, chronological tables, and access deep-dive insights.
   - `Admin`: Can create, update, and manage financial records freely.
4. **Dashboard Analytics**: Tracks Total Income, Total Expenses, and Net Balance using dynamic MongoDB aggregation pipelines.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 20
- MongoDB running locally on port 27017 (or an Atlas URI)
- A [Clerk](https://clerk.com) Account for Authentication keys.

### 1. Clone & Install
```bash
git clone https://github.com/utkarshsonpipre/finance-dashboard.git
cd finance-dashboard
npm install
```

### 2. Configure Environment
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env
```
Ensure your `.env` includes your Clerk keys and MongoDB URL:
```env
MONGODB_URI=mongodb+srv://...

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/select-role
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/select-role
```

### 3. Start the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

_Note: For local development, Clerk's `user.created` webhooks require an Ngrok tunnel to hit your local machine. If Ngrok isn't running, the backend will automatically intercept your role-selection, gracefully fetch your info from the Clerk REST API, and synchronize the database manually!_

---

## 📂 Project Structure

```
finance-dashboard/
├── server.ts                 # Custom Express + Next.js entry point
├── src/
│   ├── app.ts                # Express app factory
│   ├── app/                  # Next.js App Router (Frontend)
│   │   ├── dashboard/page.tsx# Dashboard & Gatekeeper logic
│   │   ├── login/page.tsx    # Clerk Sign-In
│   │   └── select-role/      # Onboarding role selection UI
│   ├── controllers/          # Express Route Handlers
│   ├── services/             # Business logic & DB Operations
│   ├── models/               # Mongoose Schemas (User, Records)
│   ├── middleware/           # RBAC & Error Handling
│   └── routes/               # Express API definitions
├── render.yaml               # Cloud infrastructure blueprint
└── docs/api.md               # Full Backend API specification
```

## 🌐 Deployment (Vercel / Render)

This application is equipped with a `render.yaml` file for immediate, autonomous deployment of the Express/Next.js instance on Render's cloud infrastructure. It has also been tailored to run powerfully via Vercel.

**Live Project link**: [https://finance-dashboard-rho-one.vercel.app](https://finance-dashboard-rho-one.vercel.app)

_When deploying to production, ensure your Clerk Dashboard Webhooks are pointed to `https://your-domain.com/api/webhooks/clerk`._
