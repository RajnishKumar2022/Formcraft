import mongoose from "mongoose";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached = (globalThis.mongooseCache ??= {
  connection: null,
  promise: null,
});

export async function connectToDB() {
  const databaseUrl = process.env.DB_URL;
  if (!databaseUrl) {
    throw new Error("DB_URL is not configured");
  }

  if (mongoose.connection.readyState === 1) {
    cached.connection = mongoose;
    return mongoose;
  }

  if (mongoose.connection.readyState === 0 && cached.connection) {
    cached.connection = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(databaseUrl).catch((error: unknown) => {
      cached.promise = null;
      throw error;
    });
  }

  cached.connection = await cached.promise;
  return cached.connection;
}