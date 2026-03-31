import Razorpay from 'razorpay'

// Vercel Serverless Function
export default async function handler(req, res) {
  // Add CORS headers for local development testing
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' })
    }

    if (!process.env.VITE_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !process.env.RAZORPAY_PLAN_ID) {
      return res.status(500).json({ error: 'Razorpay environment variables are missing on the server' })
    }

    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    // Create a subscription linked to the User ID via notes
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      total_count: 120, // Standard limit for repeated billing
      quantity: 1,
      customer_notify: 1, 
      notes: {
        userId: userId, // Crucial for mapping the successful payment back to the Supabase user
      }
    })

    return res.status(200).json({
      subscriptionId: subscription.id,
    })

  } catch (error) {
    console.error('Error creating Razorpay subscription:', error)
    return res.status(500).json({ error: error.message || 'Internal server error while linking Razorpay' })
  }
}
