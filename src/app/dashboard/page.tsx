'use client'
// src/app/dashboard/page.tsx
// Dashboard — Clerk auth, stats, records table, role-based UI

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useAuth, UserButton } from '@clerk/nextjs'
import { api, type UserInfo } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Summary { totalIncome: number; totalExpenses: number; netBalance: number }
interface Transaction {
  _id: string; amount: number; type: 'income' | 'expense'
  category: string; date: string; notes?: string
}
interface Pagination { total: number; page: number; limit: number; totalPages: number }
interface RecordsData { records: Transaction[]; pagination: Pagination }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '1.5rem',
      borderTop: `3px solid ${color}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 30px rgba(0,0,0,0.3)` }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: 700, marginTop: 6 }}>{value}</p>
        </div>
        <div style={{ fontSize: 28, opacity: 0.8 }}>{icon}</div>
      </div>
    </div>
  )
}

function Badge({ type }: { type: 'income' | 'expense' }) {
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
      background: type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
      color: type === 'income' ? '#10b981' : '#ef4444',
      border: `1px solid ${type === 'income' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
    }}>{type}</span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()

  const [dbUser, setDbUser] = useState<UserInfo | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [records, setRecords] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  
  // Create record form
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ amount: '', type: 'income', category: '', date: '', notes: '' })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const fetchRecords = useCallback(async () => {
    const token = await getToken()
    const params = new URLSearchParams({ page: String(page), limit: '10' })
    if (typeFilter) params.set('type', typeFilter)
    if (search) params.set('search', search)
    const res = await api.get<RecordsData>(`/api/records?${params}`, token)
    if (res.success && res.data) {
      setRecords(res.data.records)
      setPagination(res.data.pagination)
    }
  }, [page, typeFilter, search, getToken])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) return

    const init = async () => {
      setLoading(true)
      const token = await getToken()
      
      try {
        const [meRes, sumRes] = await Promise.all([
          api.get<UserInfo>('/api/users/me', token),
          api.get<Summary>('/api/dashboard/summary', token),
          fetchRecords(),
        ])
        
        if (meRes.success && meRes.data) {
          if (meRes.data.roleSelected !== true) {
            router.push('/select-role')
            return
          }
          setDbUser(meRes.data)
        } else {
          // If we 404 because webhook hasn't synced the DB yet, they still must select a role
          router.push('/select-role')
          return
        }
        
        if (sumRes.success && sumRes.data) setSummary(sumRes.data)
      } catch (err) {
        console.error('Failed to init dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    
    init()
  }, [isLoaded, isSignedIn, fetchRecords, getToken])

  async function handleCreateRecord(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      const token = await getToken()
      const res = await api.post('/api/records', {
        amount: Number(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        notes: formData.notes || undefined,
      }, token)

      if (!res.success) { setFormError(res.message); return }
      setShowForm(false)
      setFormData({ amount: '', type: 'income', category: '', date: '', notes: '' })
      await fetchRecords()
    } catch { 
      setFormError('Failed to create record') 
    } finally { 
      setFormLoading(false) 
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this record?')) return
    const token = await getToken()
    await api.delete(`/api/records/${id}`, token)
    await fetchRecords()
  }

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.85rem', borderRadius: 8,
    background: 'rgba(15,17,23,0.8)', border: '1px solid #2d3548',
    color: '#f1f5f9', fontSize: '0.875rem', outline: 'none',
  }

  const roleBadgeColor = dbUser?.role === 'admin' ? '#ef4444' : dbUser?.role === 'analyst' ? '#8b5cf6' : '#3b82f6'

  if (!isLoaded || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b' }}>Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── Navbar ── */}
      <nav style={{
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
        padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>💰</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9' }}>Finance Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {dbUser && (
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                padding: '3px 8px', borderRadius: 20,
                background: `${roleBadgeColor}22`, color: roleBadgeColor,
                border: `1px solid ${roleBadgeColor}44`,
              }}>{dbUser.role}</span>
            </div>
          )}
          <UserButton />
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9' }}>Financial Overview</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 2 }}>
              Manage and track your financial records
            </p>
          </div>
          {dbUser?.role === 'admin' && (
            <button onClick={() => setShowForm(true)} style={{
              padding: '0.6rem 1.25rem', borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: 'none', color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            }}>+ Add Record</button>
          )}
        </div>

        {/* ── Create Form Modal ── */}
        {showForm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 480,
            }}>
              <h2 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '1.5rem' }}>New Financial Record</h2>
              {formError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.85rem' }}>{formError}</div>
              )}
              <form onSubmit={handleCreateRecord} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>Amount (₹)</label>
                    <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required style={inputStyle} placeholder="5000" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>Type</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>Category</label>
                  <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required style={inputStyle} placeholder="Salary, Rent, Food…" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>Notes (optional)</label>
                  <input type="text" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} style={inputStyle} placeholder="Brief description" />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 4 }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '0.7rem', borderRadius: 8, border: '1px solid #2d3548', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={formLoading} style={{ flex: 1, padding: '0.7rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                    {formLoading ? 'Creating…' : 'Create Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Summary Cards ── */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard label="Total Income" value={fmt(summary.totalIncome)} icon="📈" color="#10b981" />
            <StatCard label="Total Expenses" value={fmt(summary.totalExpenses)} icon="📉" color="#ef4444" />
            <StatCard
              label="Net Balance"
              value={fmt(summary.netBalance)}
              icon={summary.netBalance >= 0 ? '✅' : '⚠️'}
              color={summary.netBalance >= 0 ? '#3b82f6' : '#f59e0b'}
            />
          </div>
        )}

        {/* ── Transactions Table ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Table header / filters */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontWeight: 600, color: '#f1f5f9' }}>
              Transactions
              <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.85rem', marginLeft: 8 }}>({pagination.total} total)</span>
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text" placeholder="Search notes…"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                style={{ ...inputStyle, width: 180 }}
              />
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} style={{ ...inputStyle, width: 130, cursor: 'pointer' }}>
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(15,17,23,0.5)' }}>
                  {['Date', 'Category', 'Type', 'Amount', 'Notes', ...(dbUser?.role === 'admin' ? ['Actions'] : [])].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
                      No transactions found. {dbUser?.role === 'admin' ? 'Add one above.' : ''}
                    </td>
                  </tr>
                ) : records.map((r, i) => (
                  <tr key={r._id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(15,17,23,0.2)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(59,130,246,0.05)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'transparent' : 'rgba(15,17,23,0.2)'}
                  >
                    <td style={{ padding: '0.875rem 1.25rem', color: '#94a3b8', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: '#f1f5f9', fontWeight: 500 }}>{r.category}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><Badge type={r.type} /></td>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: r.type === 'income' ? '#10b981' : '#ef4444', whiteSpace: 'nowrap' }}>
                      {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', color: '#64748b', fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</td>
                    {dbUser?.role === 'admin' && (
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <button onClick={() => handleDelete(r._id)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}>
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #2d3548', background: 'transparent', color: page <= 1 ? '#2d3548' : '#94a3b8', cursor: page <= 1 ? 'default' : 'pointer' }}>← Prev</button>
                <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #2d3548', background: 'transparent', color: page >= pagination.totalPages ? '#2d3548' : '#94a3b8', cursor: page >= pagination.totalPages ? 'default' : 'pointer' }}>Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Role access notice ── */}
        {dbUser?.role === 'viewer' && (
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: 12, background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>👁️</span>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>You have <strong style={{ color: '#94a3b8' }}>Viewer</strong> access — read-only. Contact an admin to create or modify records.</p>
          </div>
        )}
        {dbUser?.role === 'analyst' && (
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: 12, background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>You have <strong style={{ color: '#94a3b8' }}>Analyst</strong> access — read and analytics. Use the API to access category totals and monthly trends.</p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
