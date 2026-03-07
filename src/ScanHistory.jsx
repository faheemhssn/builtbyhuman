import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase } from './supabase'

export default function ScanHistory() {
  const { user } = useUser()
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)

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

  const getColor = (score) => {
    if (score <= 30) return '#22c55e'
    if (score <= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getVerdict = (verdict) => {
    if (!verdict) return 'Unknown'
    return verdict.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) return (
    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
      Loading history...
    </div>
  )

  if (scans.length === 0) return (
    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
      No scans yet. Scan your first URL above!
    </div>
  )

  return (
    <div style={{ marginTop: '2rem', width: '100%', maxWidth: '680px', margin: '2rem auto 0' }}>
      <h2 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>
        Your Scan History
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {scans.map(scan => (
          <div key={scan.id} style={{
            background: '#1e293b',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: '#60a5fa',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {scan.url}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {new Date(scan.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                color: getColor(scan.score),
                fontSize: '1.25rem',
                fontWeight: 700
              }}>
                {scan.score}%
              </div>
              <div style={{
                color: getColor(scan.score),
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {getVerdict(scan.verdict)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}