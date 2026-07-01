import { logger } from "observability";
import { startScheduler } from "./scheduler.js";
import { connection } from "shared/dist/redis.js";

logger.info("Scheduler service started");

process.on("SIGINT", () => {
  logger.info("Received SIGINT. Shutting down scheduler...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM. Shutting down scheduler...");
  process.exit(0);
});

startScheduler().catch((error) => {
  logger.error(error, "Scheduler crashed");
  process.exit(1);
});
console.log("REDIS_URL =", process.env.REDIS_URL);
console.log("Redis status =", connection.status);
console.log("Redis options =", connection.options);
