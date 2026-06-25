import { processJobs } from "./scheduler.js";
import { logger } from "observability";

logger.info("Scheduler started");

// Immediately poll once on startup
(async () => {
  logger.info("Polling");
  try {
    await processJobs();
  } catch (error) {
    logger.error(error, "Error during initial scheduler poll");
  }
})();

// Continue polling every 30 seconds (30000ms)
setInterval(async () => {
  logger.info("Polling");
  try {
    await processJobs();
  } catch (error) {
    logger.error(error, "Error during scheduler poll");
  }
}, 30000);
