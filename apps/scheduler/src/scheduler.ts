import { logger } from "observability";
import { scheduleDueJobs } from "./services/jobScheduler.service.js";
import { sleep } from "./utils/sleep.js";
import { drainJobs } from "./services/drainjobs.service.js";

const POLL_INTERVAL = 5000;

export function startScheduler() {
  logger.info("Starting scheduler...");
  setInterval(async () => {
    try {
      await drainJobs();
    } catch (error) {
      console.error("Scheduler error:", error);
    }
  }, POLL_INTERVAL);
}
