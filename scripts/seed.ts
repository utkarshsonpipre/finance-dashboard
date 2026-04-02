// scripts/seed.ts
// Seeds the database with default users for development/testing
// Usage: ts-node --transpile-only -r tsconfig-paths/register scripts/seed.ts

import 'dotenv/config'
import mongoose from 'mongoose'
import { User } from '@/models/User'

const SEED_USERS = [
  {
    clerkId: 'seed_admin_123',
    name: 'Admin User',
    email: 'admin@finance.dev',
    role: 'admin' as const,
  },
  {
    clerkId: 'seed_analyst_123',
    name: 'Analyst User',
    email: 'analyst@finance.dev',
    role: 'analyst' as const,
  },
  {
    clerkId: 'seed_viewer_123',
    name: 'Viewer User',
    email: 'viewer@finance.dev',
    role: 'viewer' as const,
  },
]

const SEED_RECORDS = [
  { amount: 85000, type: 'income', category: 'Salary', date: new Date('2026-03-01'), notes: 'March salary' },
  { amount: 12000, type: 'income', category: 'Freelance', date: new Date('2026-03-15'), notes: 'Design project' },
  { amount: 3500, type: 'expense', category: 'Rent', date: new Date('2026-03-01'), notes: 'Monthly rent' },
  { amount: 1200, type: 'expense', category: 'Utilities', date: new Date('2026-03-05'), notes: 'Electricity & internet' },
  { amount: 5000, type: 'expense', category: 'Food', date: new Date('2026-03-10'), notes: 'Groceries + dining' },
  { amount: 2000, type: 'expense', category: 'Transport', date: new Date('2026-03-12'), notes: 'Fuel and metro' },
  { amount: 90000, type: 'income', category: 'Salary', date: new Date('2026-04-01'), notes: 'April salary' },
  { amount: 4000, type: 'expense', category: 'Rent', date: new Date('2026-04-01'), notes: 'Monthly rent' },
  { amount: 800, type: 'expense', category: 'Subscriptions', date: new Date('2026-04-02'), notes: 'Netflix, Spotify' },
  { amount: 15000, type: 'income', category: 'Investment', date: new Date('2026-04-03'), notes: 'Dividend income' },
]

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set in .env.local')

  await mongoose.connect(uri)
  console.log('✅ Connected to MongoDB')

  // Clear existing data
  await User.deleteMany({})
  console.log('🗑️  Cleared existing users')

  // Import FinancialRecord here to avoid circular dep issues
  const { FinancialRecord } = await import('@/models/FinancialRecord')
  await FinancialRecord.deleteMany({})
  console.log('🗑️  Cleared existing records')

  // Create seed users
  for (const userData of SEED_USERS) {
    await User.create(userData)
    console.log(`👤 Created user: ${userData.email} [${userData.role}]`)
  }

  // Create seed records
  await FinancialRecord.insertMany(SEED_RECORDS)
  console.log(`💰 Created ${SEED_RECORDS.length} financial records`)

  await mongoose.disconnect()
  console.log('\n✅ Database seeded successfully!')
  console.log('\nDefault credentials:')
  SEED_USERS.forEach(u => console.log(`  ${u.role}: ${u.email} / (Sign in with Clerk)`))
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
