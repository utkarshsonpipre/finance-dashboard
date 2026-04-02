'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function SelectRolePage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [roleError, setRoleError] = useState('')

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.push('/login')
      return
    }

    const checkRole = async () => {
      try {
        const token = await getToken()
        const res = await api.get<any>('/api/users/me', token)
        if (res.success && res.data?.roleSelected) {
          router.push('/dashboard')
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to init role selection:', err)
        setLoading(false)
      }
    }
    
    checkRole()
  }, [isLoaded, isSignedIn, getToken, router])

  const selectRole = async (role: string) => {
    setUpdating(true)
    try {
      const token = await getToken()
      // Use the API wrapper which probably takes (url, body, token)
      const fetchApi = async () => {
         const res = await fetch('/api/users/me/role', {
           method: 'PATCH',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
           },
           body: JSON.stringify({ role })
         })
         return res.json()
      }
      
      const res = await fetchApi()
      if (res.success) {
        router.push('/dashboard')
      } else {
        setRoleError(res.message)
        setUpdating(false)
      }
    } catch (err: any) {
      setRoleError(err.message || 'Failed to update role')
      setUpdating(false)
    }
  }

  if (loading || updating || !isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <p style={{ color: '#64748b' }}>{updating ? 'Assigning role...' : 'Loading...'}</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 50%, #0f1117 100%)',
      padding: '1.5rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 600, position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>
          Welcome, {user?.firstName || 'User'}!
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
          Please select a role to get started with your account.
        </p>

        {roleError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.85rem' }}>
            {roleError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          
          <div 
            onClick={() => selectRole('viewer')}
            style={{
              background: 'rgba(30,36,53,0.8)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, 
              padding: '2rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#3b82f6'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,130,246,0.2)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👁️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.5rem' }}>Viewer</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Can only view summarized dashboard analytics and overall metrics.
            </p>
          </div>

          <div 
            onClick={() => selectRole('analyst')}
            style={{
              background: 'rgba(30,36,53,0.8)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 20, 
              padding: '2rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#8b5cf6'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,92,246,0.2)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.5rem' }}>Analyst</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Can view dashboard insights and deep-dive into chronological transaction records.
            </p>
          </div>

          <div 
            onClick={() => selectRole('admin')}
            style={{
              background: 'rgba(30,36,53,0.8)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, 
              padding: '2rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#ef4444'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚙️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.5rem' }}>Admin</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Full system access. Can modify/create records, view insights, and manage the platform.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
