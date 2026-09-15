import { prisma } from "database";
import { jobQueue } from "shared";
import { logger } from "observability";

import { calculateNextRun } from "./calculateNextrun.js";

const BATCH_SIZE = 50;

type DueJob = {
  id: string;
  name: string;
  type: "CRON" | "ONCE" | "DELAYED";
  cronExpression: string | null;
  nextRunAt: Date | null;
  priority: number;
};

type ClaimedJob = {
  jobId: string;
  jobRunId: string;
  priority: number;
  name: string;
};

export async function scheduleDueJobs(): Promise<void> {
  const now = new Date();

  logger.info(
    {
      now: now.toISOString(),
    },
    "Checking for due jobs",
  );

  let claimedJobs: ClaimedJob[] = [];

  try {
    /**
     * Everything inside this transaction happens
     * while the selected Job rows are locked.
     */
    claimedJobs = await prisma.$transaction(async (tx) => {
      /**
       * Find due jobs and lock them.
       *
       * FOR UPDATE:
       * Locks the selected rows.
       *
       * SKIP LOCKED:
       * If another scheduler instance has already
       * locked a row, skip it instead of waiting.
       */
      const jobs = await tx.$queryRaw<DueJob[]>`
          SELECT
            "id",
            "name",
            "type",
            "cronExpression",
            "nextRunAt",
            "priority"
          FROM "Job"
          WHERE
            "active" = true
            AND "nextRunAt" IS NOT NULL
            AND "nextRunAt" <= ${now}
          ORDER BY
            "priority" DESC,
            "nextRunAt" ASC
          LIMIT ${BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        `;

      logger.info(
        {
          count: jobs.length,
        },
        "Due jobs locked",
      );

      const result: ClaimedJob[] = [];

      for (const job of jobs) {
        /**
         * Create an execution record.
         */
        const jobRun = await tx.jobRun.create({
          data: {
            jobId: job.id,
            status: "CLAIMED",
            attempts: 1,
          },
        });

        /**
         * Calculate the next execution time.
         */
        const nextRunAt = calculateNextRun({
          type: job.type,
          cronExpression: job.cronExpression,
          currentTime: now,
        });

        /**
         * IMPORTANT:
         *
         * Update nextRunAt in the SAME transaction
         * as the row lock.
         */
        await tx.job.update({
          where: {
            id: job.id,
          },
          data: {
            nextRunAt,
          },
        });

        result.push({
          jobId: job.id,
          jobRunId: jobRun.id,
          priority: job.priority,
          name: job.name,
        });
      }

      return result;
    });
  } catch (error) {
    logger.error(
      {
        error: String(error),
      },
      "Failed to claim due jobs",
    );

    return;
  }

  logger.info(
    {
      count: claimedJobs.length,
    },
    "Jobs claimed",
  );

  /**
   * PostgreSQL transaction is now committed.
   *
   * Therefore there are NO database locks being held
   * while we communicate with Redis/BullMQ.
   */
  for (const job of claimedJobs) {
    try {
      const queueJob = await jobQueue.add(
        "execute-job",
        {
          jobId: job.jobId,
          jobRunId: job.jobRunId,
        },
        {
          priority: job.priority,
        },
      );

      logger.info(
        {
          jobId: job.jobId,
          jobRunId: job.jobRunId,
          bullJobId: queueJob.id,
          priority: job.priority,
        },
        "Job queued",
      );
    } catch (error) {
      logger.error(
        {
          jobId: job.jobId,
          jobRunId: job.jobRunId,
          error: String(error),
        },
        "Failed to enqueue claimed job",
      );

      /**
       * DO NOT set active = false.
       *
       * active means whether the job itself is enabled.
       *
       * The JobRun is already CLAIMED.
       *
       * Recovery of failed queue insertion will be
       * handled separately.
       */
    }
  }
}
