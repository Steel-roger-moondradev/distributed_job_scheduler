import { Redis } from "ioredis";

console.log("REDIS_URL =", process.env.REDIS_URL);

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
