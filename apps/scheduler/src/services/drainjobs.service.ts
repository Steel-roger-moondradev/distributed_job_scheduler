import { claimJobs } from "./claimjobs.service.js";
const BATCH_SIZE = 50;
const MAX_BATCHES_PER_CYCLE = 10;

export async function drainJobs() {
  for (let i = 0; i < MAX_BATCHES_PER_CYCLE; i++) {
    const jobIds = await claimJobs(BATCH_SIZE);

    // No more due jobs
    if (jobIds.length === 0) {
      break;
    }

    console.log(`Claimed ${jobIds.length} jobs`);

    for (const jobId of jobIds) {
      await enqueueJob(jobId);
    }

    // We got fewer than the batch size,
    // so there probably aren't more jobs.
    if (jobIds.length < BATCH_SIZE) {
      break;
    }
  }
}
