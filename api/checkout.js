import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const { userId, email } = req.body

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: 'price_1T5tn3BbA4BFPLV6UfcWn65s',
        quantity: 1
      }],
      customer_email: email,
      metadata: { userId },
      success_url: `${req.headers.origin}?upgraded=true`,
      cancel_url: `${req.headers.origin}?upgraded=false`
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}