import { JobRunStatus, JobStatus, prisma } from "database";
import { jobQueue } from "shared";

import { calculateNextRun } from "./calculateNextrun.js";

const BATCH_SIZE = 50;

// TEMPORARY: only for testing row locking
const LOCK_TEST_DELAY_MS = 10_000;

const schedulerId = `scheduler-${process.pid}`;

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

  console.log(`[${schedulerId}] Checking for due jobs at ${now.toISOString()}`);

  let claimedJobs: ClaimedJob[] = [];

  try {
    claimedJobs = await prisma.$transaction(
      async (tx) => {
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

        console.log(
          `[${schedulerId}] Due active jobs locked:`,
          jobs.map((job) => job.id),
        );

        if (jobs.length > 0) {
          console.log(
            `[${schedulerId}] 🔒 LOCK ACQUIRED for jobs:`,
            jobs.map((job) => job.id),
          );

          console.log(
            `[${schedulerId}] Holding locks for ${LOCK_TEST_DELAY_MS}ms...`,
          );

          await new Promise((resolve) =>
            setTimeout(resolve, LOCK_TEST_DELAY_MS),
          );

          console.log(`[${schedulerId}] Finished lock test delay`);
        }

        const result: ClaimedJob[] = [];

        for (const job of jobs) {
          console.log(`[${schedulerId}] Creating JobRun for ${job.id}`);

          const jobRun = await tx.jobRun.create({
            data: {
              jobId: job.id,
              status: JobRunStatus.CLAIMED,
              attempts: 1,
            },
          });

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

          console.log(`[${schedulerId}] Job claimed successfully:`, {
            jobId: job.id,
            jobRunId: jobRun.id,
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
      },
      {
        // TEMPORARY: must be > LOCK_TEST_DELAY_MS
        timeout: 15_000,
      },
    );
  } catch (error) {
    console.error(`[${schedulerId}] Failed to claim due jobs:`, error);

    return;
  }

  console.log(`[${schedulerId}] Jobs claimed: ${claimedJobs.length}`);

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

      console.log(`[${schedulerId}] Job queued:`, {
        jobId: job.jobId,
        jobRunId: job.jobRunId,
        bullJobId: queueJob.id,
        priority: job.priority,
      });
    } catch (error) {
      console.error(`[${schedulerId}] Failed to enqueue job:`, {
        jobId: job.jobId,
        jobRunId: job.jobRunId,
        error,
      });
    }
  }
}
