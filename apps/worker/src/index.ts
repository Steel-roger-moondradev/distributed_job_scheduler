console.log("Before worker import");

import "./workers/job.worker.js";

console.log("After worker import");
import { connection, initializeQueueEvents } from "shared";
import { logger } from "observability";

async function start() {
  await initializeQueueEvents();

  logger.info("Worker started");
}

start().catch((err) => {
  logger.error({ error: String(err) }, "Failed to start worker");
  process.exit(1);
});
console.log("REDIS_URL =", process.env.REDIS_URL);
console.log("Redis status =", connection.status);
console.log("Redis options =", connection.options);
