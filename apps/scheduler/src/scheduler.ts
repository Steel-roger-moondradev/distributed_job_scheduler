import { logger } from "observability";

import { scheduleDueJobs } from "./services/jobScheduler.service.js";
import { sleep } from "./utils/sleep.js";

const POLL_INTERVAL = 5000;

let running = false;

export async function startScheduler(): Promise<void> {
  if (running) {
    return;
  }

  running = true;

  logger.info("Starting scheduler...");

  while (running) {
    try {
      await scheduleDueJobs();
    } catch (error) {
      logger.error(error, "Scheduler loop error");
    }

    if (running) {
      await sleep(POLL_INTERVAL);
    }
  }

  logger.info("Scheduler loop stopped");
}

export function stopScheduler(): void {
  running = false;

  logger.info("Scheduler stopping...");
}
