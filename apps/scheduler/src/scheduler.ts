import { logger } from "observability";
import { scheduleDueJobs } from "./services/jobScheduler.service.js";
import { sleep } from "./utils/sleep.js";

const POLL_INTERVAL_MS = 30_000;

export async function startScheduler(): Promise<void> {
  while (true) {
    logger.info("Polling for due jobs...");

    try {
      await scheduleDueJobs();
    } catch (error) {
      logger.error(error, "Scheduler polling failed");
    }

    await sleep(POLL_INTERVAL_MS);
  }
}