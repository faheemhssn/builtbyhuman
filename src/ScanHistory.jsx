import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase } from './supabase'

const verdictConfig = {
  likely_human: { color: '#00875A', bg: '#E6F6F1', label: 'Likely Human', icon: '◎' },
  mixed: { color: '#C47800', bg: '#FFF7E6', label: 'Mixed Signals', icon: '◑' },
  likely_ai: { color: '#D0021B', bg: '#FFF0F0', label: 'Likely AI', icon: '◉' },
  almost_certainly_ai: { color: '#D0021B', bg: '#FFF0F0', label: 'Almost Certainly AI', icon: '●' },
}
const getVC = (verdict) => verdictConfig[verdict] || { color: '#8A8A9A', bg: '#E4E4EC', label: verdict || 'Unknown', icon: '○' }

export default function ScanHistory() {
  const { user } = useUser()
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [linkCopied, setLinkCopied] = useState(null)

  useEffect(() => {
    if (!user) return
    async function fetchScans() {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error) setScans(data)
      setLoading(false)
    }
    fetchScans()
  }, [user])

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/?report=${id}`)
    setLinkCopied(id)
    setTimeout(() => setLinkCopied(null), 2000)
  }

  const SignalGrid = ({ signals }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#D0021B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>AI Indicators</div>
        {signals?.ai_indicators?.map((s, i) => (
          <div key={i} style={{ fontSize: '12px', color: '#3D3D4E', marginBottom: '5px', paddingLeft: '10px', borderLeft: '2px solid rgba(208,2,27,0.15)', lineHeight: 1.5 }}>{s}</div>
        ))}
      </div>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#00875A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Human Indicators</div>
        {signals?.human_indicators?.map((s, i) => (
          <div key={i} style={{ fontSize: '12px', color: '#3D3D4E', marginBottom: '5px', paddingLeft: '10px', borderLeft: '2px solid rgba(0,135,90,0.15)', lineHeight: 1.5 }}>{s}</div>
        ))}
      </div>
    </div>
  )

  const EvidenceBlock = ({ evidence }) => {
    if (!evidence?.length) return null
    return (
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8A9A', marginBottom: '10px' }}>Code Evidence</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {evidence.map((e, i) => (
            <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${e.type === 'ai' ? 'rgba(208,2,27,0.15)' : 'rgba(0,135,90,0.15)'}` }}>
              <div style={{ background: e.type === 'ai' ? 'rgba(208,2,27,0.06)' : 'rgba(0,135,90,0.06)', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: e.type === 'ai' ? '#D0021B' : '#00875A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {e.type === 'ai' ? '◉ AI' : '◎ Human'}
                </span>
                <span style={{ fontSize: '11px', color: '#8A8A9A' }}>{e.label}</span>
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

  if (loading) return (
    <div style={{ textAlign: 'center', color: '#8A8A9A', padding: '2rem', fontSize: '14px' }}>Loading history...</div>
  )

  if (scans.length === 0) return (
    <div style={{ textAlign: 'center', color: '#8A8A9A', padding: '2rem', fontSize: '14px' }}>No scans yet. Scan your first URL above!</div>
  )

  return (
    <div style={{ marginTop: '40px', width: '100%' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8A9A', marginBottom: '12px' }}>
        Your Scan History
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {scans.map(scan => {
          const vc = getVC(scan.verdict)
          const isOpen = expanded === scan.id
          const report = scan.report || {}
          const isMultiPage = !!report.pages

          return (
            <div
              key={scan.id}
              style={{ background: 'white', border: `1px solid ${isOpen ? 'rgba(26,108,255,0.25)' : '#E4E4EC'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s', boxShadow: isOpen ? '0 4px 20px rgba(26,108,255,0.08)' : 'none' }}
            >
              {/* Row */}
              <div
                onClick={() => setExpanded(isOpen ? null : scan.id)}
                style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', cursor: 'pointer' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: '#1A6CFF', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {scan.url}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8A8A9A', marginTop: '3px' }}>
                    {new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {isMultiPage && ` · ${report.pages?.length} pages`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: vc.color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{scan.score}%</div>
                    <div style={{ fontSize: '10px', background: vc.bg, color: vc.color, padding: '2px 7px', borderRadius: '20px', fontWeight: 600, marginTop: '3px' }}>{vc.icon} {vc.label}</div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#8A8A9A', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</div>
                </div>
              </div>

              {/* Expanded report */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #E4E4EC', padding: '20px 18px' }}>

                  {isMultiPage ? (
                    // Multi-page site scan
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8A9A', marginBottom: '12px' }}>Page Breakdown</div>
                      {report.pages?.map((page, i) => {
                        const pvc = getVC(page.verdict)
                        return (
                          <div key={i} style={{ background: '#F9F8F6', borderRadius: '10px', padding: '14px', marginBottom: '10px', border: '1px solid #E4E4EC' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '11px', color: '#8A8A9A', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all', flex: 1 }}>{page.url}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                <span style={{ fontSize: '16px', fontWeight: 700, color: pvc.color, fontFamily: 'JetBrains Mono, monospace' }}>{page.score}%</span>
                                <span style={{ fontSize: '10px', background: pvc.bg, color: pvc.color, padding: '2px 6px', borderRadius: '20px', fontWeight: 600 }}>{pvc.label}</span>
                              </div>
                            </div>
                            {page.reasoning && <p style={{ fontSize: '12px', color: '#3D3D4E', lineHeight: 1.6 }}>{page.reasoning}</p>}
                            {page.signals && <SignalGrid signals={page.signals} />}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    // Single page scan
                    <div>
                      {report.reasoning && (
                        <>
                          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A8A9A', marginBottom: '8px' }}>Analysis</div>
                          <p style={{ fontSize: '13px', color: '#3D3D4E', lineHeight: 1.7, marginBottom: '4px' }}>{report.reasoning}</p>
                        </>
                      )}
                      {report.signals && <SignalGrid signals={report.signals} />}
                      {report.evidence && <EvidenceBlock evidence={report.evidence} />}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E4E4EC' }}>
                    <button
                      onClick={() => copyLink(scan.id)}
                      style={{ background: linkCopied === scan.id ? '#E6F6F1' : '#EEF3FF', color: linkCopied === scan.id ? '#00875A' : '#1A6CFF', border: 'none', borderRadius: '7px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}
                    >
                      {linkCopied === scan.id ? '✓ Copied' : '🔗 Share Report'}
                    </button>
                    <a
                      href={`/?report=${scan.id}`}
                      style={{ background: '#F9F8F6', color: '#3D3D4E', border: '1px solid #E4E4EC', borderRadius: '7px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', textDecoration: 'none' }}
                    >
                      Open Full Report →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
