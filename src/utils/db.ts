// src/utils/db.ts
// MongoDB connection manager using Mongoose

import mongoose from 'mongoose'

let isConnected = false

export async function connectDB(): Promise<void> {
  if (isConnected) return

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI environment variable is not set')

  try {
    const conn = await mongoose.connect(uri, {
      bufferCommands: false,
    })
    isConnected = conn.connections[0].readyState === 1
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}
