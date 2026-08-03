import mongoose from "mongoose";

let connected = false;

export async function connectDB(): Promise<void> {
  if (connected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy server/.env.example to server/.env and configure it.");
  }

  await mongoose.connect(uri);
  connected = true;
  console.info("[db] connected to MongoDB");
}

export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
