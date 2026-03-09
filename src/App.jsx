import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import ScanHistory from './ScanHistory'
import Educators from './Educators'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #F9F8F6;
    --ink: #0E0E12;
    --ink2: #3D3D4E;
    --ink3: #8A8A9A;
    --border: #E4E4EC;
    --blue: #1A6CFF;
    --blue-dim: #EEF3FF;
    --green: #00875A;
    --green-dim: #E6F6F1;
    --amber: #C47800;
    --amber-dim: #FFF7E6;
    --red: #D0021B;
    --red-dim: #FFF0F0;
    --purple-mid: #7C3AED;
    --purple-dim: #F3EEFF;
    --radius: 12px;
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
  }
  body { background: var(--bg); color: var(--ink); font-family: 'Outfit', sans-serif; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  .fade-up { animation: fadeUp 0.6s ease forwards; }
  .fade-up-2 { animation: fadeUp 0.6s 0.1s ease both; }
  .fade-up-3 { animation: fadeUp 0.6s 0.2s ease both; }
  .fade-up-4 { animation: fadeUp 0.6s 0.3s ease both; }
  .btn-primary {
    background: var(--blue); color: white; border: none; border-radius: 8px;
    padding: 12px 28px; font-family: 'Outfit', sans-serif; font-weight: 600;
    font-size: 15px; cursor: pointer; transition: all 0.15s ease; letter-spacing: -0.01em;
  }
  .btn-primary:hover { background: #0F5AE8; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(26,108,255,0.3); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { background: #9DB8FF; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-secondary {
    background: white; color: var(--ink); border: 1.5px solid var(--border); border-radius: 8px;
    padding: 11px 24px; font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 14px;
    cursor: pointer; transition: all 0.15s ease;
  }
  .btn-secondary:hover { border-color: var(--blue); color: var(--blue); transform: translateY(-1px); }
  .btn-purple {
    background: var(--purple-mid); color: white; border: none; border-radius: 8px;
    padding: 12px 28px; font-family: 'Outfit', sans-serif; font-weight: 600;
    font-size: 15px; cursor: pointer; transition: all 0.15s ease; letter-spacing: -0.01em;
  }
  .btn-purple:hover { background: #6D28D9; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(124,58,237,0.3); }
  .card { background: white; border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .nav-link { font-size: 14px; color: var(--ink2); text-decoration: none; font-weight: 500; transition: color 0.15s; cursor: pointer; background: none; border: none; font-family: 'Outfit', sans-serif; }
  .nav-link:hover { color: var(--blue); }
  .feature-card { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 28px; transition: all 0.2s; }
  .feature-card:hover { border-color: rgba(26,108,255,0.3); box-shadow: 0 8px 32px rgba(26,108,255,0.08); transform: translateY(-2px); }
  .pricing-card { background: white; border: 1.5px solid var(--border); border-radius: 20px; padding: 36px; flex: 1; min-width: 260px; max-width: 340px; }
  .pricing-card.featured { border-color: var(--blue); background: linear-gradient(135deg, #F0F5FF 0%, #FFFFFF 100%); box-shadow: 0 8px 40px rgba(26,108,255,0.12); }
  .pricing-card.educator { border-color: var(--purple-mid); background: linear-gradient(135deg, #F5F0FF 0%, #FFFFFF 100%); box-shadow: 0 8px 40px rgba(124,58,237,0.10); }
  .step-num { width: 36px; height: 36px; border-radius: 50%; background: var(--blue-dim); color: var(--blue); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; flex-shrink: 0; }
  .guest-upsell { background: linear-gradient(135deg, #1A6CFF 0%, #7C3AED 100%); border-radius: 16px; padding: 32px; color: white; text-align: center; margin-top: 32px; }
`

const GUEST_SCAN_KEY = 'bbh_guest_scan_used'

export default function App() {
  const { user } = useUser()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [scansUsed, setScansUsed] = useState(0)
  const [scanLimit, setScanLimit] = useState(3)
  const [resetDate, setResetDate] = useState(null)
  const [scanMode, setScanMode] = useState('single')
  const [reportId, setReportId] = useState(null)
  const [sharedReport, setSharedReport] = useState(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [guestScanUsed, setGuestScanUsed] = useState(false)

  useEffect(() => {
    // Check if guest already used their free scan
    const used = localStorage.getItem(GUEST_SCAN_KEY)
    if (used) setGuestScanUsed(true)
  }, [])

  useEffect(() => {
    if (!user) return
    async function fetchUserData() {
      let { data: userData } = await supabase.from('users').select('*').eq('user_id', user.id).single()
      if (!userData) {
        const { data: newUser } = await supabase.from('users').insert({ user_id: user.id, scan_limit: 3, scans_used: 0 }).select().single()
        userData = newUser
      }
      if (userData) { setScanLimit(userData.scan_limit); setScansUsed(userData.scans_used); setResetDate(userData.reset_date) }
    }
    fetchUserData()
  }, [user])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const report = params.get('report')
    if (report) {
      async function fetchReport() {
        const { data } = await supabase.from('scans').select('*').eq('id', report).single()
        if (data) setSharedReport(data)
      }
      fetchReport()
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const scanParam = params.get('scan')
    if (scanParam) {
      setUrl(scanParam)
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const handleScan = async (isGuest = false) => {
    if (!url) return
    setLoading(true); setResult(null); setError(null)
    const endpoint = scanMode === 'site' ? '/api/crawl' : '/api/scan'
    try {
      const body = isGuest
        ? { url, guest: true }
        : { url, userId: user?.id }
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) {
        if (data.limitReached) throw new Error(`You've used all ${scanLimit} scans this month. Upgrade to Pro for 50 scans.`)
        throw new Error(data.error || 'Scan failed')
      }
      if (isGuest) {
        localStorage.setItem(GUEST_SCAN_KEY, '1')
        setGuestScanUsed(true)
      } else {
        setScansUsed(prev => prev + 1)
      }
      setResult({ ...data, mode: scanMode }); setReportId(data.id || null)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user?.id, email: user?.primaryEmailAddress?.emailAddress }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) { console.error(err) }
  }

  const verdictConfig = {
    likely_human: { color: 'var(--green)', bg: 'var(--green-dim)', label: 'Likely Human', icon: '◎' },
    mixed: { color: 'var(--amber)', bg: 'var(--amber-dim)', label: 'Mixed Signals', icon: '◑' },
    likely_ai: { color: 'var(--red)', bg: 'var(--red-dim)', label: 'Likely AI', icon: '◉' },
    almost_certainly_ai: { color: 'var(--red)', bg: 'var(--red-dim)', label: 'Almost Certainly AI', icon: '●' },
  }
  const getVC = (verdict) => verdictConfig[verdict] || { color: 'var(--ink3)', bg: 'var(--border)', label: verdict || 'Unknown', icon: '○' }

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?report=${reportId}`)
    setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000)
  }

  if (window.location.pathname === '/educators') return <Educators />

  const ScoreDisplay = ({ score, verdict, size = 'lg', cached = false, confidence }) => {
    const vc = getVC(verdict)
    const fontSize = size === 'lg' ? '64px' : size === 'md' ? '40px' : '28px'
    const margin = score <= 5 ? 5 : score >= 95 ? 5 : 10
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
          <span className="mono" style={{ fontSize, fontWeight: 700, color: vc.color, lineHeight: 1, letterSpacing: '-0.03em' }}>
            {score}<span style={{ fontSize: '0.45em', opacity: 0.7 }}>%</span>
          </span>
          <span style={{ background: vc.bg, color: vc.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em' }}>
            {vc.icon} {vc.label}
          </span>
          {cached && (
            <span style={{ background: 'var(--blue-dim)', color: 'var(--blue)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
              ⚡ Cached
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--ink3)', marginTop: '6px', fontFamily: 'JetBrains Mono' }}>
          Confidence range: {Math.max(0, score - margin)}–{Math.min(100, score + margin)}%
          {confidence && ` · ${confidence} confidence`}
        </div>
      </div>
    )
  }

  const SignalGrid = ({ signals, compact = false }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>AI Indicators</div>
        {signals?.ai_indicators?.slice(0, compact ? 3 : 99).map((s, i) => (
          <div key={i} style={{ fontSize: compact ? '11px' : '12px', color: 'var(--ink2)', marginBottom: '5px', paddingLeft: '10px', borderLeft: '2px solid rgba(208,2,27,0.15)', lineHeight: 1.5 }}>{s}</div>
        ))}
      </div>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Human Indicators</div>
        {signals?.human_indicators?.slice(0, compact ? 3 : 99).map((s, i) => (
          <div key={i} style={{ fontSize: compact ? '11px' : '12px', color: 'var(--ink2)', marginBottom: '5px', paddingLeft: '10px', borderLeft: '2px solid rgba(0,135,90,0.15)', lineHeight: 1.5 }}>{s}</div>
        ))}
      </div>
    </div>
  )

  const EvidenceBlock = ({ evidence }) => {
    if (!evidence || evidence.length === 0) return null
    return (
      <div style={{ marginTop: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: '10px' }}>Code Evidence</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {evidence.map((e, i) => (
            <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${e.type === 'ai' ? 'rgba(208,2,27,0.15)' : 'rgba(0,135,90,0.15)'}` }}>
              <div style={{ background: e.type === 'ai' ? 'rgba(208,2,27,0.06)' : 'rgba(0,135,90,0.06)', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: e.type === 'ai' ? 'var(--red)' : 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {e.type === 'ai' ? '◉ AI' : '◎ Human'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--ink3)' }}>{e.label}</span>
              </div>
              <div style={{ background: '#1A1A2E', padding: '10px 14px', overflowX: 'auto' }}>
                <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: e.type === 'ai' ? '#FF6B6B' : '#69DB7C', whiteSpace: 'pre', display: 'block' }}>{e.snippet}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const PageCard = ({ page }) => {
    const vc = getVC(page.verdict)
    if (page.error) return (
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '13px', color: 'var(--ink3)', wordBreak: 'break-all', fontFamily: 'JetBrains Mono' }}>{page.url}</span>
        <span style={{ fontSize: '12px', color: 'var(--red)', marginLeft: '12px', flexShrink: 0 }}>Failed to scan</span>
      </div>
    )
    return (
      <div className="card" style={{ padding: '20px 24px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--ink3)', wordBreak: 'break-all', flex: 1, fontFamily: 'JetBrains Mono', lineHeight: 1.5 }}>{page.url}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span className="mono" style={{ fontSize: '22px', fontWeight: 700, color: vc.color }}>{page.score}%</span>
            <span style={{ background: vc.bg, color: vc.color, padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{vc.label}</span>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--ink2)', lineHeight: 1.6, marginBottom: '12px' }}>{page.reasoning}</p>
        {page.signals && <SignalGrid signals={page.signals} compact />}
        {page.evidence && <EvidenceBlock evidence={page.evidence} />}
        {page.filesAnalyzed > 0 && <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--ink3)', fontFamily: 'JetBrains Mono' }}>↳ {page.filesAnalyzed} file{page.filesAnalyzed > 1 ? 's' : ''} analyzed</div>}
      </div>
    )
  }

  const ScanInput = ({ isGuest = false }) => (
    <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '4px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
        <input
          autoFocus
          type="url"
          placeholder="https://freelancer-portfolio.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleScan(isGuest)}
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '12px 14px', fontSize: '15px', fontFamily: 'Outfit, sans-serif', color: 'var(--ink)' }}
        />
        <button
          className="btn-primary"
          onClick={() => handleScan(isGuest)}
          disabled={loading || !url}
          style={{ borderRadius: '9px', padding: '12px 24px', whiteSpace: 'nowrap', minWidth: '130px' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Scanning…
            </span>
          ) : 'Scan URL →'}
        </button>
      </div>
      {!isGuest && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {['single', 'site'].map(mode => (
            <button
              key={mode}
              onMouseDown={e => e.preventDefault()}
              onClick={() => setScanMode(mode)}
              style={{ background: scanMode === mode ? 'var(--blue-dim)' : 'transparent', color: scanMode === mode ? 'var(--blue)' : 'var(--ink3)', border: '1px solid', borderColor: scanMode === mode ? 'rgba(26,108,255,0.2)' : 'transparent', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s' }}
            >
              {mode === 'single' ? 'Single Page' : '🌐 Entire Site'}
            </button>
          ))}
          <span style={{ fontSize: '12px', color: 'var(--ink3)', marginLeft: '4px' }}>
            {Math.max(0, scanLimit - scansUsed)} scan{(scanLimit - scansUsed) !== 1 ? 's' : ''} remaining
            {resetDate && ` · resets ${new Date(resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </span>
        </div>
      )}
      {isGuest && (
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--ink3)', marginTop: '10px' }}>
          1 free scan · No account needed · Sign up for 3/month free
        </p>
      )}
    </div>
  )

  // Guest upsell shown after result or when scan limit reached
  const GuestUpsell = () => (
    <div className="guest-upsell" style={{ animation: 'fadeUp 0.5s ease' }}>
      <div style={{ fontSize: '28px', marginBottom: '12px' }}>🎉</div>
      <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
        Like what you see?
      </div>
      <div style={{ fontSize: '15px', opacity: 0.9, lineHeight: 1.6, marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
        Sign up free and get 3 scans every month. No credit card required.
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <SignInButton mode="modal">
          <button style={{ background: 'white', color: 'var(--blue)', border: 'none', borderRadius: '8px', padding: '12px 28px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '15px', cursor: 'pointer', transition: 'all 0.15s' }}>
            Create Free Account →
          </button>
        </SignInButton>
        <SignInButton mode="modal">
          <button style={{ background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '12px 24px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s' }}>
            Sign In
          </button>
        </SignInButton>
      </div>
      <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '16px' }}>Free forever · No credit card · Cancel anytime</p>
    </div>
  )

  // SHARED REPORT VIEW
  if (sharedReport) {
    return (
      <>
        <style>{FONTS}</style>
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
          <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.03em' }}>BuiltBy<span style={{ color: 'var(--blue)' }}>Human</span></span>
            <span style={{ fontSize: '12px', fontWeight: 600, background: 'var(--blue-dim)', color: 'var(--blue)', padding: '4px 10px', borderRadius: '20px' }}>Verified Report</span>
          </nav>
          <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px' }}>
            <div className="fade-up" style={{ marginBottom: '32px' }}>
              <div className="mono" style={{ fontSize: '12px', color: 'var(--ink3)', marginBottom: '6px' }}>
                {new Date(sharedReport.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="mono" style={{ fontSize: '13px', color: 'var(--ink2)', wordBreak: 'break-all' }}>{sharedReport.url}</div>
            </div>
            <div className="card fade-up-2" style={{ padding: '32px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: '16px' }}>
                {sharedReport.report?.pages ? 'Site-Wide Score' : 'AI Authorship Score'}
              </div>
              <ScoreDisplay score={sharedReport.score} verdict={sharedReport.verdict} cached={false} />
              {sharedReport.report?.pages && (
                <div style={{ fontSize: '13px', color: 'var(--ink3)', marginTop: '8px' }}>{sharedReport.report.pages.length} pages analyzed</div>
              )}
            </div>
            {sharedReport.report?.pages ? (
              <div className="fade-up-3">
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', margin: '20px 0 12px' }}>Page Breakdown</div>
                {sharedReport.report.pages.map((page, i) => <PageCard key={i} page={page} />)}
              </div>
            ) : (
              <div className="card fade-up-3" style={{ padding: '28px' }}>
                <p style={{ fontSize: '14px', color: 'var(--ink2)', lineHeight: 1.7, marginBottom: '16px' }}>{sharedReport.report?.reasoning}</p>
                {sharedReport.report?.signals && <SignalGrid signals={sharedReport.report.signals} />}
                {sharedReport.report?.evidence && <EvidenceBlock evidence={sharedReport.report.evidence} />}
              </div>
            )}
            <div className="card fade-up-4" style={{ padding: '28px', marginTop: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Verify any website yourself</div>
              <div style={{ fontSize: '13px', color: 'var(--ink3)', marginBottom: '20px' }}>Free · No credit card · 3 scans/month</div>
              <button className="btn-primary" onClick={() => window.location.href = '/'}>Try BuiltByHuman Free →</button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{FONTS}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

        {/* NAV */}
        <nav style={{ background: 'rgba(249,248,246,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <span style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.04em' }}>BuiltBy<span style={{ color: 'var(--blue)' }}>Human</span></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
            <button className="nav-link" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Pricing</button>
            <a href="/educators" className="nav-link" style={{ color: 'var(--purple-mid)', fontWeight: 600 }}>For Educators</a>
            <SignedOut>
              <SignInButton mode="modal"><button className="btn-secondary" style={{ padding: '8px 18px', fontSize: '14px' }}>Sign in</button></SignInButton>
              <SignInButton mode="modal"><button className="btn-primary" style={{ padding: '9px 18px', fontSize: '14px' }}>Get Started Free</button></SignInButton>
            </SignedOut>
            <SignedIn><UserButton /></SignedIn>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ padding: '80px 24px 64px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--blue-dim)', color: 'var(--blue)', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '28px', border: '1px solid rgba(26,108,255,0.15)' }}>
            ◉ AI Authorship Detection
          </div>
          <h1 className="fade-up-2" style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--ink)', marginBottom: '24px' }}>
            Verify the Human Behind the Screen.
          </h1>
          <p className="fade-up-3" style={{ fontSize: '18px', color: 'var(--ink2)', lineHeight: 1.7, marginBottom: '44px', maxWidth: '620px', margin: '0 auto 44px' }}>
            The gold standard for academic integrity and professional trust. Whether you're an educator protecting the classroom or a student proving your original voice, BuiltByHuman.app provides deep AI authorship signal breakdowns for any URL in seconds.
          </p>

          {/* SIGNED IN */}
          <SignedIn>
            <div className="fade-up-4"><ScanInput isGuest={false} /></div>

            {error && (
              <div style={{ marginTop: '20px', background: 'var(--red-dim)', border: '1px solid rgba(208,2,27,0.2)', borderRadius: '10px', padding: '14px 20px', color: 'var(--red)', fontSize: '14px', maxWidth: '640px', margin: '20px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span>{error}</span>
                {error.includes('Upgrade') && <button className="btn-primary" onClick={handleUpgrade} style={{ padding: '7px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}>Upgrade →</button>}
              </div>
            )}

            {scansUsed >= scanLimit && !error && (
              <div style={{ marginTop: '24px', background: 'white', border: '1.5px solid var(--blue)', borderRadius: '16px', padding: '28px', maxWidth: '440px', margin: '24px auto 0', boxShadow: '0 8px 32px rgba(26,108,255,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '10px' }}>🚀</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>You've used all your free scans</div>
                <div style={{ fontSize: '13px', color: 'var(--ink3)', marginBottom: '20px' }}>Upgrade to Pro for 50 scans/month and site-wide crawling.</div>
                <button className="btn-primary" onClick={handleUpgrade}>Upgrade to Pro — $12/month</button>
              </div>
            )}

            {result && (
              <div style={{ marginTop: '40px', maxWidth: '760px', margin: '40px auto 0', textAlign: 'left' }}>
                {result.mode === 'site' ? (
                  <>
                    <div className="card" style={{ padding: '28px 32px', marginBottom: '12px', animation: 'fadeUp 0.5s ease' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: '10px' }}>Site-Wide Score · {result.pagesScanned} pages</div>
                          <ScoreDisplay score={result.overallScore} verdict={result.verdict} cached={result.cached} />
                        </div>
                        {reportId && (
                          <button onClick={copyLink} style={{ background: linkCopied ? 'var(--green-dim)' : 'var(--blue-dim)', color: linkCopied ? 'var(--green)' : 'var(--blue)', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}>
                            {linkCopied ? '✓ Copied' : '🔗 Share Report'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', margin: '20px 0 10px' }}>Page Breakdown</div>
                    {result.pages?.map((page, i) => <PageCard key={i} page={page} />)}
                  </>
                ) : (
                  <div className="card" style={{ padding: '32px', animation: 'fadeUp 0.5s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: '10px' }}>AI Authorship Score</div>
                        <ScoreDisplay score={result.score} verdict={result.verdict} cached={result.cached} confidence={result.confidence} />
                      </div>
                      {reportId && (
                        <button onClick={copyLink} style={{ background: linkCopied ? 'var(--green-dim)' : 'var(--blue-dim)', color: linkCopied ? 'var(--green)' : 'var(--blue)', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}>
                          {linkCopied ? '✓ Copied' : '🔗 Share Report'}
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: '10px' }}>Analysis</div>
                    <p style={{ fontSize: '14px', color: 'var(--ink2)', lineHeight: 1.7 }}>{result.reasoning}</p>
                    {result.signals && <SignalGrid signals={result.signals} />}
                    {result.evidence && <EvidenceBlock evidence={result.evidence} />}
                    {result.filesAnalyzed > 0 && <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--ink3)', fontFamily: 'JetBrains Mono' }}>↳ {result.filesAnalyzed} file{result.filesAnalyzed > 1 ? 's' : ''} analyzed</div>}
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--ink3)', fontFamily: 'JetBrains Mono', wordBreak: 'break-all' }}>scanned: {result.url}</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ maxWidth: '760px', margin: '40px auto 0' }}><ScanHistory /></div>
          </SignedIn>

          {/* SIGNED OUT — GUEST SCAN */}
          <SignedOut>
            <div className="fade-up-4">
              {!guestScanUsed ? (
                <ScanInput isGuest={true} />
              ) : (
                // Already used guest scan — show locked input with sign-up nudge
                <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', gap: '4px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', opacity: 0.5, pointerEvents: 'none' }}>
                    <input
                      type="url"
                      placeholder="https://freelancer-portfolio.com"
                      disabled
                      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '12px 14px', fontSize: '15px', fontFamily: 'Outfit, sans-serif', color: 'var(--ink)' }}
                    />
                    <button className="btn-primary" disabled style={{ borderRadius: '9px', padding: '12px 24px', whiteSpace: 'nowrap', minWidth: '130px' }}>Scan URL →</button>
                  </div>
                  <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--ink3)', marginTop: '10px' }}>
                    Guest scan used. Sign up free for 3 scans every month.
                  </p>
                </div>
              )}
            </div>

            {/* Guest error */}
            {error && (
              <div style={{ marginTop: '20px', background: 'var(--red-dim)', border: '1px solid rgba(208,2,27,0.2)', borderRadius: '10px', padding: '14px 20px', color: 'var(--red)', fontSize: '14px', maxWidth: '640px', margin: '20px auto 0' }}>
                {error}
              </div>
            )}

            {/* Guest result */}
            {result && !guestScanUsed === false && (
              <div style={{ marginTop: '40px', maxWidth: '760px', margin: '40px auto 0', textAlign: 'left' }}>
                <div className="card" style={{ padding: '32px', animation: 'fadeUp 0.5s ease' }}>
                  <div style={{ paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: '10px' }}>AI Authorship Score</div>
                    <ScoreDisplay score={result.score} verdict={result.verdict} cached={result.cached} confidence={result.confidence} />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: '10px' }}>Analysis</div>
                  <p style={{ fontSize: '14px', color: 'var(--ink2)', lineHeight: 1.7 }}>{result.reasoning}</p>
                  {result.signals && <SignalGrid signals={result.signals} />}
                </div>
                <GuestUpsell />
              </div>
            )}

            {/* Show upsell immediately after guest scan used if no result yet */}
            {guestScanUsed && !result && (
              <div style={{ maxWidth: '760px', margin: '24px auto 0' }}>
                <GuestUpsell />
              </div>
            )}

            {/* If no guest scan used yet, show subtle sign-in links below input */}
            {!guestScanUsed && !result && (
              <p style={{ marginTop: '14px', fontSize: '13px', color: 'var(--ink3)' }}>
                Already have an account?{' '}
                <SignInButton mode="modal">
                  <span style={{ color: 'var(--blue)', cursor: 'pointer', fontWeight: 600 }}>Sign in</span>
                </SignInButton>
              </p>
            )}
          </SignedOut>
        </section>

        {/* TRUST BAR */}
        <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'white', padding: '18px 40px', display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
          {[['Freelancer Vetting', 'Verify before you pay'], ['Academic Integrity', 'Confirm student work'], ['Agency Audits', 'Quality assurance']].map(([title, sub]) => (
            <div key={title} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
              <div style={{ fontSize: '12px', color: 'var(--ink3)', marginTop: '2px' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <section id="features" style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '12px' }}>What We Detect</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Deep code forensics</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {[
              { icon: '⬡', title: 'JavaScript Analysis', desc: 'Detects AI-generated patterns in external JS files, inline scripts, and framework code. Identifies Copilot, ChatGPT, and v0.dev fingerprints.' },
              { icon: '◈', title: 'CSS Pattern Detection', desc: 'Spots overly systematic AI-generated styling — uniform spacing, cookie-cutter component structure, and generated utility classes.' },
              { icon: '◎', title: 'Site-Wide Crawling', desc: 'Scans up to 5 pages across an entire domain and aggregates an overall authorship score with per-page breakdowns.' },
              { icon: '◉', title: 'Confidence Scoring', desc: 'Returns a 0–100 AI probability score alongside human vs. AI signal breakdowns with detailed reasoning from Claude Sonnet.' },
              { icon: '↗', title: 'Shareable Reports', desc: 'Every scan generates a permanent public report URL. Share with clients, professors, or colleagues — no login required to view.' },
              { icon: '◑', title: 'Human Signal Detection', desc: "Identifies genuine human patterns — inconsistent style, TODO comments, domain vocabulary, and custom logic that AI wouldn't write." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div style={{ fontSize: '20px', marginBottom: '14px', background: 'var(--blue-dim)', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>{icon}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.01em' }}>{title}</div>
                <div style={{ fontSize: '13px', color: 'var(--ink3)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" style={{ padding: '64px 40px', background: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '12px' }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '48px' }}>Results in seconds</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', textAlign: 'left' }}>
              {[
                ['Paste a URL', 'Enter any website URL — a freelancer portfolio, student project, or site you want to verify.'],
                ['We crawl the code', 'BuiltByHuman fetches HTML, JavaScript, and CSS files and extracts meaningful code samples from across the site.'],
                ['Claude Sonnet analyzes', 'Our AI model examines code patterns, naming conventions, structure, and stylistic signals to determine authorship.'],
                ['Get your verdict', 'Receive a 0–100 score, a verdict, and a detailed breakdown of AI vs. human indicators — shareable with one click.'],
              ].map(([title, desc], i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div className="step-num">{i + 1}</div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink3)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '12px' }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: '15px', color: 'var(--ink3)', marginTop: '12px' }}>Whether you're vetting freelancers, protecting your classroom, or scaling a team.</p>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>

            {/* FREE */}
            <div className="pricing-card">
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>Free</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span className="mono" style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-0.03em' }}>$0</span>
                <span style={{ fontSize: '13px', color: 'var(--ink3)' }}>/forever</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink3)', marginBottom: '20px' }}>Try it out, no commitment</div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {['3 scans per month', 'Single page scanning', 'AI / Human signal breakdown', 'Shareable report links'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--ink2)' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <SignedOut>
                <SignInButton mode="modal"><button className="btn-secondary" style={{ width: '100%', padding: '12px' }}>Get Started Free</button></SignInButton>
              </SignedOut>
              <SignedIn>
                <button className="btn-secondary" style={{ width: '100%', padding: '12px', cursor: 'default' }}>Current Plan</button>
              </SignedIn>
            </div>

            {/* PRO */}
            <div className="pricing-card featured">
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '14px' }}>Most Popular</div>
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>Pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span className="mono" style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-0.03em' }}>$12</span>
                <span style={{ fontSize: '13px', color: 'var(--ink3)' }}>/month</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink3)', marginBottom: '20px' }}>For freelancers and agencies</div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {['50 scans per month', 'Site-wide crawling (5 pages)', 'Priority Claude Sonnet analysis', 'Full signal breakdown', 'Shareable report links', 'Monthly scan reset'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--ink2)' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <SignedOut>
                <SignInButton mode="modal"><button className="btn-primary" style={{ width: '100%', padding: '12px' }}>Upgrade to Pro</button></SignInButton>
              </SignedOut>
              <SignedIn>
                <button className="btn-primary" style={{ width: '100%', padding: '12px' }} onClick={handleUpgrade}>Upgrade to Pro</button>
              </SignedIn>
            </div>

            {/* EDUCATOR */}
            <div className="pricing-card educator">
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--purple-mid)', marginBottom: '14px' }}>🎓 For Educators</div>
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>Educator</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span className="mono" style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--purple-mid)' }}>$29</span>
                <span style={{ fontSize: '13px', color: 'var(--ink3)' }}>/month</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink3)', marginBottom: '20px' }}>Built for teachers and institutions</div>
              <div style={{ borderTop: '1px solid rgba(124,58,237,0.15)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {['Unlimited scans', 'Bulk student submission checks', 'Site-wide crawling (5 pages)', 'Full signal breakdown', 'Shareable report links', 'Priority support'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--ink2)' }}>
                    <span style={{ color: 'var(--purple-mid)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <a href="/educators">
                <button className="btn-purple" style={{ width: '100%', padding: '12px' }}>Learn More →</button>
              </a>
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid var(--border)', background: 'white', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.03em' }}>BuiltBy<span style={{ color: 'var(--blue)' }}>Human</span></span>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <a href="/educators" style={{ fontSize: '13px', color: 'var(--ink3)', textDecoration: 'none' }}>For Educators</a>
            <a href="/privacy.html" style={{ fontSize: '13px', color: 'var(--ink3)', textDecoration: 'none' }}>Privacy Policy</a>
            <span style={{ fontSize: '12px', color: 'var(--ink3)' }}>AI Authorship Detection · {new Date().getFullYear()}</span>
          </div>
        </footer>

      </div>
    </>
  )
}
