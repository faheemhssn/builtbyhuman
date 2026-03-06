import { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleScan = async () => {
    if (!url) return
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>

      <header style={{ padding: '16px 32px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>BuiltByHuman</div>
        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: '600' }}>Sign in</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#1e3a5f', color: '#60a5fa', borderRadius: '999px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
          AI Authorship Detection
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.1', marginBottom: '16px', color: '#f8fafc' }}>
          Was this site built by a human?
        </h1>
        <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '48px', lineHeight: '1.6' }}>
          Paste any URL and get an AI Authorship Score in seconds. Know before you pay. Know after you receive.
        </p>

        <SignedIn>
          <div style={{ display: 'flex', gap: '12px', maxWidth: '600px', margin: '0 auto' }}>
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              style={{ flex: 1, padding: '14px 18px', borderRadius: '10px', border: '1px solid #334155', background: '#1e293b', color: '#f8fafc', fontSize: '16px', outline: 'none' }}
            />
            <button
              onClick={handleScan}
              disabled={loading || !url}
              style={{ padding: '14px 28px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
            >
              {loading ? 'Scanning...' : 'Scan URL'}
            </button>
          </div>
        </SignedIn>

        <SignedOut>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ color: '#94a3b8', marginBottom: '16px' }}>Sign in to start scanning websites</p>
            <SignInButton mode="modal">
              <button style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 32px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>
                Get Started Free
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <p style={{ marginTop: '24px', fontSize: '13px', color: '#475569' }}>
          Free • No credit card required • 3 scans/month
        </p>
      </main>

    </div>
  )
}