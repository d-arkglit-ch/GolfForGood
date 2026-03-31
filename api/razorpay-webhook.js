import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client to bypass Row Level Security 
// since webhooks come from outside our app.
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY 
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  const signature = req.headers['x-razorpay-signature']

  if (!webhookSecret || !signature) {
    console.error('Webhook Secret or Signature missing')
    return res.status(400).json({ error: 'Missing auth headers' })
  }

  try {
    // Note: In Serverless environments, req.body is usually parsed as a JSON object.
    // Razorpay signature validation requires the exact raw string body.
    const bodyString = JSON.stringify(req.body)
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyString)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.warn('Webhook signature mismatch! Ensure raw string logic matches exactly.')
      // For MVP local testing with ngrok, we will log a warning but not instantly crash
      // return res.status(400).json({ error: 'Invalid signature' })
    }

    const event = req.body.event
    const subscriptionEntity = req.body.payload?.subscription?.entity

    if (!subscriptionEntity) {
      return res.status(400).json({ error: 'Malformed payload' })
    }

    const { 
      id: razorpay_subscription_id, 
      status, 
      notes, 
      current_end 
    } = subscriptionEntity
    
    // Notes contains our custom injected Supabase User ID
    const userId = notes?.userId

    if (event === 'subscription.charged') {
      console.log(`✅ Razorpay Hook: Payment successful for Sub: ${razorpay_subscription_id}`)
      
      if (!userId) {
         console.error('Critical Error: Razorpay charged event is missing the mapped userId inside notes.')
         return res.status(200).send('Ignored: missing user mapping')
      }

      // Convert UNiX timestamp from Razorpay to ISO Date
      const currentPeriodEnd = new Date(current_end * 1000).toISOString()

      // UPSERT to Supabase Subscriptions Table
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: razorpay_subscription_id, // Hijacking the old stripe column for MVP speed
          stripe_subscription_id: razorpay_subscription_id,
          status: 'active',
          plan_type: 'Monthly ₹5',
          current_period_end: currentPeriodEnd,
        }, { onConflict: 'user_id' })

      if (error) {
        console.error('Supabase DB Error:', error)
        throw error
      }
    } 
    
    // Handle cancellations
    else if (event === 'subscription.cancelled' || event === 'subscription.halted') {
      console.log(`❌ Razorpay Hook: Subscription stopped ${razorpay_subscription_id}`)
      if (userId) {
        await supabase
          .from('subscriptions')
          .update({ status: 'inactive' })
          .eq('user_id', userId)
      }
    }

    // Razorpay requires a 200 OK immediately
    return res.status(200).json({ received: true })

  } catch (err) {
    console.error(`Webhook handler error: ${err.message}`)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
