import { jobWorker } from "./workers/job.worker.js";
import { logger } from "observability";

logger.info("Worker started");

jobWorker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Job enqueued task completed in queue");
});

jobWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, error: String(err) }, "Job enqueued task failed in queue");
});
