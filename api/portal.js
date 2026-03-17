import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const { email } = req.body

  if (!email) return res.status(400).json({ error: 'Email is required' })

  try {
    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email, limit: 1 })

    if (!customers.data.length) {
      return res.status(404).json({ error: 'No subscription found for this account.' })
    }

    const customerId = customers.data[0].id

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: req.headers.origin || 'https://builtbyhuman.app'
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
