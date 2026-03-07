import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url, userId } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    const pageRes = await fetch(url)
    const html = await pageRes.text()
    const codeChunk = html.slice(0, 3000)

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze this web code and determine if it was written by a human or AI. Return ONLY valid JSON like this:
{
  "ai_probability": 72,
  "verdict": "likely_ai",
  "reasoning": "brief explanation"
}

Code to analyze:
${codeChunk}`
        }]
      })
    })

    const claudeData = await claudeRes.json()
    const text = claudeData.content[0].text
    const result = JSON.parse(text.replace(/```json|```/g, '').trim())

    // Save to Supabase
    await supabase.from('scans').insert({
      url,
      score: result.ai_probability,
      verdict: result.verdict,
      report: result,
      status: 'complete',
      user_id: userId || null
    })

    return res.status(200).json({
      url,
      score: result.ai_probability,
      verdict: result.verdict,
      reasoning: result.reasoning
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Scan failed', details: err.message })
  }
}