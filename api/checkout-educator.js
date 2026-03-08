import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, email } = req.body

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price: process.env.STRIPE_EDUCATOR_PRICE_ID,
      quantity: 1,
    }],
    customer_email: email,
    metadata: { userId, plan: 'educator' },
    success_url: `${process.env.VITE_APP_URL || 'https://builtbyhuman.app'}/?upgraded=educator`,
    cancel_url: `${process.env.VITE_APP_URL || 'https://builtbyhuman.app'}/educators`,
  })

  res.status(200).json({ url: session.url })
}
