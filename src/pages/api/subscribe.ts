import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { stripe } from "../../services/stripe";

export default async(req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getSession({ req })

    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
    })

    const stripeCheockoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {price:'price_1IeJZuA9FOCg0y1cC6mdJiX2', quantity: 1}
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    })

    return res.status(201).json({ sessionId: stripeCheockoutSession.id })
  } else {
    res.setHeader('Allow', 'POST'),
    res.status(405).end('Method not allowed')
  }
}