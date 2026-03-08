import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.userId
    const plan = session.metadata?.plan
    const scanLimit = plan === 'educator' ? 99999 : 50

    if (userId) {
      const resetDate = new Date()
      resetDate.setMonth(resetDate.getMonth() + 1)

      await supabase.from('users').upsert({
        user_id: userId,
        is_pro: true,
        scan_limit: scanLimit,
        scans_used: 0,
        reset_date: resetDate.toISOString().split('T')[0]
      }, { onConflict: 'user_id' })
    }
  }

  res.status(200).json({ received: true })
}
