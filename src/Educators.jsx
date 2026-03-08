import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react'

export default function Educators() {
  const { user } = useUser()

  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/checkout-educator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.primaryEmailAddress?.emailAddress
        })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
    }
  }

  const STYLES = `
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
      --purple: #6B21A8;
      --purple-dim: #F5F0FF;
      --purple-mid: #7C3AED;
      --radius: 12px;
      --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    }
    body { background: var(--bg); color: var(--ink); font-family: 'Outfit', sans-serif; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp 0.6s ease forwards; }
    .fade-up-2 { animation: fadeUp 0.6s 0.1s ease both; }
    .fade-up-3 { animation: fadeUp 0.6s 0.2s ease both; }
    .fade-up-4 { animation: fadeUp 0.6s 0.3s ease both; }
    .btn-primary {
      background: var(--purple-mid); color: white; border: none; border-radius: 8px;
      padding: 12px 28px; font-family: 'Outfit', sans-serif; font-weight: 600;
      font-size: 15px; cursor: pointer; transition: all 0.15s ease;
    }
    .btn-primary:hover { background: var(--purple); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(107,33,168,0.3); }
    .btn-secondary {
      background: white; color: var(--ink); border: 1.5px solid var(--border); border-radius: 8px;
      padding: 11px 24px; font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 14px;
      cursor: pointer; transition: all 0.15s ease; text-decoration: none; display: inline-block;
    }
    .btn-secondary:hover { border-color: var(--purple-mid); color: var(--purple-mid); }
    .card { background: white; border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); }
    .nav-link { font-size: 14px; color: var(--ink2); text-decoration: none; font-weight: 500; transition: color 0.15s; cursor: pointer; background: none; border: none; font-family: 'Outfit', sans-serif; }
    .nav-link:hover { color: var(--purple-mid); }
    .feature-card { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 28px; transition: all 0.2s; }
    .feature-card:hover { border-color: rgba(124,58,237,0.3); box-shadow: 0 8px 32px rgba(124,58,237,0.08); transform: translateY(-2px); }
    .step-num { width: 36px; height: 36px; border-radius: 50%; background: var(--purple-dim); color: var(--purple-mid); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; flex-shrink: 0; }
    .mono { font-family: 'JetBrains Mono', monospace; }
  `

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

        {/* NAV */}
        <nav style={{ background: 'rgba(249,248,246,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <a href="/" style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.04em', textDecoration: 'none', color: 'var(--ink)' }}>
            BuiltBy<span style={{ color: 'var(--blue)' }}>Human</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="/" className="nav-link">← Back to main site</a>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-primary" style={{ padding: '9px 20px', fontSize: '14px' }}>Get Educator Access</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button className="btn-primary" style={{ padding: '9px 20px', fontSize: '14px' }} onClick={handleUpgrade}>Get Educator Access</button>
            </SignedIn>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ padding: '80px 24px 64px', textAlign: 'center', maxWidth: '860px', margin: '0 auto' }}>
          <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--purple-dim)', color: 'var(--purple-mid)', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '28px', border: '1px solid rgba(124,58,237,0.15)' }}>
            🎓 For Educators
          </div>
          <h1 className="fade-up-2" style={{ fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--ink)', marginBottom: '24px' }}>
            Did your students<br />write this themselves?
          </h1>
          <p className="fade-up-3" style={{ fontSize: '18px', color: 'var(--ink2)', lineHeight: 1.6, maxWidth: '540px', margin: '0 auto 44px' }}>
            Verify student-submitted portfolios, coding assignments, and project sites with forensic-level AI authorship detection. Built for professors, instructors, and academic institutions.
          </p>
          <div className="fade-up-4" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>Start Free Trial →</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }} onClick={handleUpgrade}>Get Educator Access — $29/month →</button>
            </SignedIn>
            <button className="btn-secondary" style={{ padding: '14px 28px', fontSize: '15px' }} onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>See how it works</button>
          </div>
          <p style={{ marginTop: '14px', fontSize: '13px', color: 'var(--ink3)' }}>Unlimited scans · Cancel anytime · No per-student fees</p>
        </section>

        {/* TRUST BAR */}
        <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'white', padding: '18px 40px', display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
          {[
            ['Unlimited Scans', 'No monthly cap, ever'],
            ['Any Assignment Type', 'Portfolios, codebases, project sites'],
            ['Shareable Reports', 'Evidence you can show students'],
            ['Academic Integrity', 'Trusted AI authorship analysis'],
          ].map(([title, sub]) => (
            <div key={title} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
              <div style={{ fontSize: '12px', color: 'var(--ink3)', marginTop: '2px' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* USE CASES */}
        <section style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--purple-mid)', marginBottom: '12px' }}>Use Cases</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Built for the classroom</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {[
              { icon: '💻', title: 'Coding Assignments', desc: 'Scan student GitHub Pages, Netlify sites, and project portfolios to verify that submitted code was genuinely written by the student.' },
              { icon: '🎨', title: 'Web Design Courses', desc: 'Detect AI-generated CSS, templated layouts, and v0.dev-style scaffolding in student design submissions.' },
              { icon: '📁', title: 'Portfolio Reviews', desc: 'Audit student portfolio sites before grades are finalized. Get a detailed per-page breakdown of AI vs. human authorship signals.' },
              { icon: '🔍', title: 'Capstone Projects', desc: 'For high-stakes final projects, run a full site-wide crawl and receive a shareable report you can attach to grade records.' },
              { icon: '📊', title: 'Batch Verification', desc: 'Scan multiple student URLs back to back. Unlimited scans means you can get through an entire class in one sitting.' },
              { icon: '📋', title: 'Evidence for Review Panels', desc: 'Every scan produces a permanent public report URL with code evidence. Share directly with department heads or academic integrity boards.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div style={{ fontSize: '24px', marginBottom: '14px', background: 'var(--purple-dim)', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.01em' }}>{title}</div>
                <div style={{ fontSize: '13px', color: 'var(--ink3)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" style={{ padding: '64px 40px', background: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--purple-mid)', marginBottom: '12px' }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '48px' }}>Verify a submission in 30 seconds</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', textAlign: 'left' }}>
              {[
                ['Student submits a URL', 'Ask students to submit their project as a live URL — a GitHub Pages site, Netlify deployment, or any hosted portfolio.'],
                ['Paste the URL into BuiltByHuman', 'Run a single page scan or a full site-wide crawl across up to 5 pages of the submission.'],
                ['Claude Sonnet analyzes the code', 'Our AI model examines HTML, JavaScript, and CSS for AI-generated patterns — variable names, structure, comment style, and more.'],
                ['Share the report as evidence', 'Every scan generates a permanent public report URL with a score, verdict, and actual code snippets as evidence. Attach it to your grade record.'],
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

        {/* WHAT WE DETECT */}
        <section style={{ padding: '80px 40px', maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--purple-mid)', marginBottom: '12px' }}>Detection Signals</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em' }}>What our analysis looks for</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D0021B', marginBottom: '16px' }}>AI Authorship Signals</div>
              {['Perfectly uniform indentation and spacing', 'Generic variable names (data, result, item, el)', 'Boilerplate comment blocks', 'Cookie-cutter component structure', 'v0.dev, Copilot, or ChatGPT artifacts in comments', 'Excessive abstraction for simple tasks', 'No debugging artifacts or commented-out experiments'].map((s, i) => (
                <div key={i} style={{ fontSize: '13px', color: 'var(--ink2)', marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid rgba(208,2,27,0.15)', lineHeight: 1.5 }}>{s}</div>
              ))}
            </div>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '16px' }}>Human Authorship Signals</div>
              {['Inconsistent but intentional style', 'Creative or domain-specific naming', 'TODO comments and personal notes', 'Debugging artifacts and experiments', 'Custom logic that solves a specific problem', 'Unconventional but working patterns', 'Evidence of learning and iteration'].map((s, i) => (
                <div key={i} style={{ fontSize: '13px', color: 'var(--ink2)', marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid rgba(0,135,90,0.15)', lineHeight: 1.5 }}>{s}</div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section style={{ padding: '64px 40px', background: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--purple-mid)', marginBottom: '12px' }}>Educator Pricing</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '32px' }}>One flat rate. No limits.</h2>
            <div style={{ background: 'white', border: '2px solid var(--purple-mid)', borderRadius: '20px', padding: '40px', boxShadow: '0 8px 40px rgba(124,58,237,0.12)', background: 'linear-gradient(135deg, #F5F0FF 0%, #FFFFFF 100%)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--purple-mid)', marginBottom: '14px' }}>Educator Plan</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'center', marginBottom: '6px' }}>
                <span className="mono" style={{ fontSize: '52px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)' }}>$29</span>
                <span style={{ fontSize: '14px', color: 'var(--ink3)' }}>/month</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink3)', marginBottom: '28px' }}>per instructor account</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', textAlign: 'left' }}>
                {[
                  'Unlimited scans — no monthly cap',
                  'Site-wide crawling (5 pages per scan)',
                  'Full AI vs. Human signal breakdown',
                  'Code evidence snippets',
                  'Shareable permanent report URLs',
                  'Priority Claude Sonnet analysis',
                  'Cancel anytime',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--ink2)' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>Get Educator Access →</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }} onClick={handleUpgrade}>Get Educator Access →</button>
              </SignedIn>
              <p style={{ fontSize: '12px', color: 'var(--ink3)', marginTop: '14px' }}>No per-student fees · No setup costs · Cancel anytime</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 40px', maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--purple-mid)', marginBottom: '12px' }}>FAQ</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em' }}>Common questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              ['Is this 100% accurate?', 'No AI detection tool is 100% accurate — including ours. BuiltByHuman provides a probability score and code evidence, not a definitive verdict. We recommend using it as one signal alongside other assessment methods, not as the sole basis for an academic integrity decision.'],
              ['What kinds of submissions can I scan?', 'Any publicly accessible URL — GitHub Pages, Netlify, Vercel deployments, personal websites, and hosted portfolios. The site must be live and publicly accessible (not password protected).'],
              ['Can students see if their site has been scanned?', 'No. Scans are passive — we fetch the page like any browser would. There is no notification to the site owner.'],
              ['Does one account cover my whole class?', 'Yes. One Educator account gives you unlimited scans, so you can scan every student in your class as many times as needed.'],
              ['Can I use scan reports as formal evidence?', 'Yes. Every scan generates a permanent public report URL showing the score, verdict, and actual code snippets. These can be shared with department heads or academic integrity boards. We recommend disclosing that the report was generated by an AI detection tool.'],
            ].map(([q, a], i) => (
              <div key={i} className="card" style={{ padding: '24px 28px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.01em' }}>{q}</div>
                <div style={{ fontSize: '13px', color: 'var(--ink3)', lineHeight: 1.7 }}>{a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER CTA */}
        <section style={{ padding: '64px 40px', background: 'linear-gradient(135deg, #F5F0FF 0%, #EEF3FF 100%)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>Ready to verify your class?</h2>
          <p style={{ fontSize: '16px', color: 'var(--ink2)', marginBottom: '32px' }}>Unlimited scans · $29/month · Cancel anytime</p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '16px' }}>Get Educator Access →</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '16px' }} onClick={handleUpgrade}>Get Educator Access →</button>
          </SignedIn>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid var(--border)', background: 'white', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <a href="/" style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.03em', textDecoration: 'none', color: 'var(--ink)' }}>
            BuiltBy<span style={{ color: 'var(--blue)' }}>Human</span>
          </a>
          <span style={{ fontSize: '12px', color: 'var(--ink3)' }}>AI Authorship Detection for Educators · {new Date().getFullYear()}</span>
        </footer>

      </div>
    </>
  )
}
