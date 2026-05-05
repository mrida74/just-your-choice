import mongoose from "mongoose";
import { MongoClient } from "mongodb";

declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

const cached = global.mongooseConnection ?? {
  conn: null,
  promise: null,
};

global.mongooseConnection = cached;

// MongoDB native client for NextAuth adapter
let _mongoClientPromise: Promise<MongoClient> | null = null;

function getMongoClientPromise(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to your environment variables.");
  }

  if (!_mongoClientPromise) {
    _mongoClientPromise = new Promise((resolve, reject) => {
      const client = new MongoClient(MONGODB_URI);
      client.connect()
        .then(() => resolve(client))
        .catch(reject);
    });
  }

  return _mongoClientPromise;
}

// Export as both named export and a thenable for NextAuth adapter
export const mongoClient = getMongoClientPromise();

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to your environment variables.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "just-your-choice",
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
