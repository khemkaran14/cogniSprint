import mongoose from "mongoose";

let connected = false;

export async function connectDB(): Promise<void> {
  if (connected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy server/.env.example to server/.env and configure it.");
  }

  try {
    await mongoose.connect(uri, { autoIndex: process.env.NODE_ENV !== "production" });
  } catch (error) {
    const cause = error as NodeJS.ErrnoException;
    if (cause.syscall === "querySrv" || cause.code === "ECONNREFUSED") {
      throw new Error(
        "MongoDB Atlas DNS lookup failed. Check your DNS/VPN/firewall, then verify the mongodb+srv URI; " +
          "for local development you can use mongodb://127.0.0.1:27017/cognisprint.",
        { cause: error }
      );
    }
    throw error;
  }
  connected = true;
  console.info("[db] connected to MongoDB");
}

export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
