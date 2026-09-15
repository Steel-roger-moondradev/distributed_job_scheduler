import { JobRunStatus, JobStatus, prisma } from "database";
import { jobQueue } from "shared";
import { logger } from "observability";

import { calculateNextRun } from "./calculateNextrun.js";

const BATCH_SIZE = 50;

type DueJob = {
  id: string;
  name: string;
  description: string | null;
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
  description: string | null;
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
    claimedJobs = await prisma.$transaction(async (tx) => {
      logger.debug(
        {
          now: now.toISOString(),
          batchSize: BATCH_SIZE,
        },
        "Scheduler attempting to acquire job row locks",
      );
      const jobs = await tx.$queryRaw<DueJob[]>`
        SELECT
          "id",
          "name",
          "description",
          "type",
          "cronExpression",
          "nextRunAt",
          "priority"
        FROM "Job"
        WHERE
          "status" = ${JobStatus.ACTIVE}::"JobStatus"
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
          jobIds: jobs.map((job) => job.id),
        },
        "Scheduler acquired job row locks",
      );

      const result: ClaimedJob[] = [];

      for (const job of jobs) {
        /**
         * Create execution record.
         */
        const jobRun = await tx.jobRun.create({
          data: {
            jobId: job.id,
            status: JobRunStatus.CLAIMED,
            attempts: 1,
          },
        });
        logger.info(
          {
            count: claimedJobs.length,
            jobIds: claimedJobs.map((job) => job.jobId),
          },
          "Scheduler transaction committed; job row locks released",
        );

        const nextRunAt = calculateNextRun({
          type: job.type,
          cronExpression: job.cronExpression,
          currentTime: now,
        });

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
          description: job.description,
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
    }
  }
}
