// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { connectDB } from '@/utils/db'
import { User } from '@/models/User'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env or .env.local')
  }

  // Get the headers as a Promise-resolved instance in Next.js 15+
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type
  await connectDB()

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const email = email_addresses[0]?.email_address
    const name = [first_name, last_name].filter(Boolean).join(' ') || 'User'

    await User.findOneAndUpdate(
      { clerkId: id },
      {
        clerkId: id,
        email,
        name,
        // Role defaults to viewer in schema if new, keeps existing if updated
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    console.log(`User ${id} synced to MongoDB`)
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data
    await User.findOneAndDelete({ clerkId: id })
    console.log(`User ${id} removed from MongoDB`)
  }

  return new Response('', { status: 200 })
}
