/**
 * @file db.ts
 * @description Manages MongoDB connection pooling using Mongoose.
 * Reuses existing connection in development to prevent connection exhaustion during Next.js hot reloads.
 */

import mongoose from 'mongoose';

// Environment variable for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/malik_hardware_mart';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global cache interface to persist connection across hot-reloading in development.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global declaration to attach cache to Node.js global object
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Initialize cached object from global or create new
let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB or return existing connection.
 * @returns {Promise<typeof mongoose>} Active mongoose instance
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // If active connection already exists in cache, return immediately to save overhead
  if (cached.conn) {
    return cached.conn;
  }

  // If connection is not in flight, initiate new connection promise
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    // Store pending promise in cache
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    // Await connection resolution and cache the resolved connection
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset cache promise on failure so subsequent calls can retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
