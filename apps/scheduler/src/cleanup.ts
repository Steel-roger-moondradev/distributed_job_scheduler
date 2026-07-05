import { connection } from "shared";
import { logger } from "../../../packages/observability/dist/pino.js";

export async function startWorkerCleanup() {
  // Run once on startup
  await cleanupWorkers();

  // Then run every 30 seconds
  setInterval(cleanupWorkers, 30_000);
}

async function cleanupWorkers() {
  try {
    const workers = await connection.smembers("workers");

    for (const workerId of workers) {
      const heartbeatKey = `worker:${workerId}:heartbeat`;

      const exists = await connection.exists(heartbeatKey);

      if (!exists) {
        await connection.srem("workers", workerId);

        logger.info(`Removed stale worker: ${workerId}`);
      }
    }
  } catch (error: any) {
    logger.error("Worker cleanup failed:", error);
  }
}
