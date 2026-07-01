import { Job, QueueEvents } from "bullmq";
import { jobQueue } from "../queue/queue.js";
import { connection } from "../redis.js";
import { prisma } from "database";
import { logger } from "observability";

const processedTerminalFailures = new Set<string>();

export const queueEvents = new QueueEvents("jobs", {
  connection,
});

export async function initializeQueueEvents() {
  await queueEvents.waitUntilReady();

  logger.info("QueueEvents Ready");

  /**
   * Fired when a BullMQ job completes successfully.
   */
  queueEvents.on("completed", async ({ jobId }) => {
    try {
      logger.info({ jobId }, "Job completed");

      const bullJob = await Job.fromId(jobQueue, jobId);

      if (!bullJob) {
        logger.warn({ jobId }, "Completed BullMQ job not found");
        return;
      }

      const dbJobId = bullJob.data?.jobId;

      if (!dbJobId) {
        logger.warn({ jobId }, "Completed BullMQ payload missing jobId");
        return;
      }

      // Worker remains the single source of truth for success state transitions.
      logger.info({ jobId: dbJobId }, "Completion event observed");
    } catch (error) {
      logger.error({ error: String(error) }, "Error handling completed event");
    }
  });

  /**
   * Fired whenever a BullMQ attempt fails.
   * BullMQ retries automatically.
   * We move the job to the application's DLQ only
   * after all retries have been exhausted.
   */
  queueEvents.on("failed", async ({ jobId, failedReason }) => {
    try {
      logger.warn({ jobId }, "Job failed");

      const bullJob = await Job.fromId(jobQueue, jobId);

      if (!bullJob) {
        logger.warn({ jobId }, "Failed BullMQ job not found");
        return;
      }

      const dbJobId = bullJob.data?.jobId;

      if (!dbJobId) {
        logger.warn({ jobId }, "Failed BullMQ payload missing jobId");
        return;
      }

      const attemptsMade = bullJob.attemptsMade;
      const maxAttempts = bullJob.opts.attempts ?? 1;
      const reason = failedReason ?? bullJob.failedReason ?? "Unknown error";

      // BullMQ will retry automatically.
      if (attemptsMade < maxAttempts) {
        logger.info(
          {
            jobId: dbJobId,
            attempts: attemptsMade,
            maxAttempts,
          },
          "Retrying job",
        );
        return;
      }

      const terminalFailureKey = `${jobId}:${attemptsMade}`;
      if (processedTerminalFailures.has(terminalFailureKey)) {
        logger.warn(
          { jobId: dbJobId, attempts: attemptsMade },
          "Duplicate terminal failed event ignored",
        );
        return;
      }
      processedTerminalFailures.add(terminalFailureKey);

      logger.warn(
        {
          jobId: dbJobId,
          attempts: attemptsMade,
          maxAttempts,
        },
        "Retries exhausted",
      );

      const now = new Date();

      await prisma.job.update({
        where: {
          id: dbJobId,
        },
        data: {
          status: "FAILED",
        },
      });

      const latestRun = await prisma.jobRun.findFirst({
        where: { jobId: dbJobId },
        orderBy: { createdAt: "desc" },
      });

      if (!latestRun) {
        logger.warn({ jobId: dbJobId }, "JobRun not found on final failure");
      } else {
        const duration = latestRun.startedAt
          ? now.getTime() - latestRun.startedAt.getTime()
          : null;

        await prisma.jobRun.update({
          where: { id: latestRun.id },
          data: {
            status: "FAILED",
            finishedAt: now,
            error: reason,
            attempts: attemptsMade,
            duration: duration !== null ? duration : undefined,
          },
        });
      }

      const existingFailedJob = await prisma.failedJob.findFirst({
        where: {
          jobId: dbJobId,
          attempts: attemptsMade,
          reason,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (existingFailedJob) {
        logger.warn(
          { jobId: dbJobId, failedJobId: existingFailedJob.id },
          "DLQ entry already exists",
        );
        return;
      }

      await prisma.failedJob.create({
        data: {
          jobId: dbJobId,
          payload: bullJob.data,
          reason,
          attempts: attemptsMade,
          failedAt: now,
        },
      });

      logger.info(
        {
          jobId: dbJobId,
        },
        "Moved to DLQ",
      );
    } catch (error) {
      logger.error({ error: String(error) }, "Error handling failed event");
    }
  });
}
