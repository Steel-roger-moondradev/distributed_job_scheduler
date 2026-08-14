import { Redis } from "ioredis";
import dotenv from "dotenv";
import path from "path/win32";

dotenv.config({ path: "../../.env" });


export const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  },
);

export const getRedisStatus = async () => {
  let redis = "disconnected";

  try {
    await connection.ping();
    redis = "connected";
  } catch {
    redis = "disconnected";
  }

  return redis;
};
