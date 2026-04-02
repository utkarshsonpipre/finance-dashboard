'use client'
// src/app/login/page.tsx — Clerk Login page

import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 50%, #0f1117 100%)',
      padding: '1rem',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <SignIn fallbackRedirectUrl="/select-role" appearance={{
          elements: {
            rootBox: {
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            },
            card: {
              background: 'rgba(30,36,53,0.95)',
              border: '1px solid rgba(59,130,246,0.2)',
              backdropFilter: 'blur(20px)',
            },
            headerTitle: { color: '#f1f5f9' },
            headerSubtitle: { color: '#94a3b8' },
            socialButtonsBlockButton: { 
              color: '#f1f5f9', border: '1px solid #2d3548',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } 
            },
            dividerLine: { background: '#2d3548' },
            dividerText: { color: '#64748b' },
            formFieldLabel: { color: '#94a3b8' },
            formFieldInput: { 
              background: 'rgba(15,17,23,0.8)', border: '1px solid #2d3548', color: '#f1f5f9' 
            },
            formButtonPrimary: { 
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)', 
              '&:hover': { background: 'linear-gradient(135deg, #2563eb, #4f46e5)' } 
            },
            footerActionText: { color: '#94a3b8' },
            footerActionLink: { color: '#3b82f6' },
          }
        }} />
      </div>
    </div>
  )
}
