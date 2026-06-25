import { scheduleDueJobs } from "./services/jobScheduler.service.js";

/**
 * Orchestrates job scheduling by delegating to the job scheduler service.
 */
export async function processJobs(): Promise<void> {
  await scheduleDueJobs();
}
