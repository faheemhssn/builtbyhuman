import { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'

export default function App() {
  const { user } = useUser()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleScan = async () => {
    if (!url) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, userId: user?.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // ... rest of your component

  const getVerdictColor = (verdict) => {
    if (!verdict) return '#94a3b8'
    if (verdict.includes('human')) return '#22c55e'
    if (verdict.includes('mixed')) return '#f59e0b'
    return '#ef4444'
  }

  const getVerdictLabel = (verdict) => {
    const labels = {
      likely_human: 'Likely Human',
      mixed: 'Mixed',
      likely_ai: 'Likely AI',
      almost_certainly_ai: 'Almost Certainly AI'
    }
    return labels[verdict] || verdict
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
              style={{ padding: '14px 28px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Scanning...' : 'Scan URL'}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: '24px', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '10px', padding: '16px', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{ marginTop: '40px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '32px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>AI Authorship Score</div>
                  <div style={{ fontSize: '56px', fontWeight: '800', color: getVerdictColor(result.verdict), lineHeight: 1 }}>
                    {result.score}%
                  </div>
                </div>
                <div style={{ background: '#0f172a', borderRadius: '12px', padding: '12px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Verdict</div>
                  <div style={{ fontWeight: '700', color: getVerdictColor(result.verdict) }}>
                    {getVerdictLabel(result.verdict)}
                  </div>
                </div>
              </div>

              <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analysis</div>
                <p style={{ color: '#cbd5e1', margin: 0, lineHeight: '1.6' }}>{result.reasoning}</p>
              </div>

              <div style={{ marginTop: '16px', fontSize: '12px', color: '#475569', wordBreak: 'break-all' }}>
                Scanned: {result.url}
              </div>
            </div>
          )}
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