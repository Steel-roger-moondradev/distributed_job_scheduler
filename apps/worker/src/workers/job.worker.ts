import { Worker } from "bullmq";
import { prisma } from "database";
import { connection } from "shared";
import {
  jobDuration,
  jobsCompleted,
  jobsFailed,
  logger,
  workerThroughput,
} from "observability";
import { CronExpressionParser } from "cron-parser";
import { JobStatus, JobRunStatus } from "@prisma/client";

export const jobWorker = new Worker(
  "jobs",
  async (job) => {
    const { jobId } = job.data;
    if (!jobId) {
      const err = new Error(
        "Job execution failed: No jobId provided in enqueued payload",
      );
      logger.error(err.message);
      jobsFailed.inc();
      throw err;
    }

    logger.info({ jobId }, "Worker executing");

    //    Fetch the job details from PostgreSQL
    const dbJob = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!dbJob) {
      const err = new Error(
        `Job execution failed: Job with ID ${jobId} not found in database`,
      );
      logger.error(err.message);
      throw err;
    }

    let startedAt = new Date();

    let runId = job.data.runId;
    const workerId = `worker-${process.pid}`;
    if (!runId) {
      startedAt = new Date();
      const run = await prisma.jobRun.create({
        data: {
          jobId,
          status: JobRunStatus.RUNNING,
          workerId,
          attempts: 1,
          startedAt,
        },
      });

      runId = run.id;

      await job.updateData({
        ...job.data,
        runId,
      });
    } else {
      const run = await prisma.jobRun.findUnique({
        where: {
          id: runId,
        },
      });

      if (!run) {
        throw new Error(`JobRun ${runId} not found`);
      }

      startedAt = run.startedAt;
      await prisma.jobRun.update({
        where: {
          id: runId,
        },
        data: {
          status: JobRunStatus.RUNNING,
          attempts: job.attemptsMade + 1,
          error: null,

          finishedAt: null,

          duration: null,
        },
      });
    }

    logger.info({ jobId, attempt: job.attemptsMade + 1 }, "Running Job");

    //  Update Job status to RUNNING in database
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.RUNNING,
      },
    });
    const start = Date.now();

    try {
      //   Simulate execution (3000ms delay)
      const duration2 = (Date.now() - start) / 1000;

      jobDuration.observe(duration2);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const finishedAt = new Date();
      const duration = finishedAt.getTime() - startedAt.getTime();

      let nextStatus: JobStatus = JobStatus.COMPLETED;
      let nextRunAt: Date | null = null;

      if (dbJob.type === "CRON" && dbJob.cronExpression) {
        nextStatus = JobStatus.ACTIVE;
        try {
          const interval = CronExpressionParser.parse(dbJob.cronExpression);
          nextRunAt = interval.next().toDate();
          logger.info(
            { jobId, nextRunAt: nextRunAt.toISOString() },
            "Cron next execution",
          );
        } catch (cronError) {
          logger.error(
            {
              jobId,
              cronExpression: dbJob.cronExpression,
              error: String(cronError),
            },
            "Cron parsing error on success transition",
          );
          nextStatus = JobStatus.FAILED;
        }
      }

      //  Atomically update both job schedule and run history status
      await prisma.$transaction([
        prisma.job.update({
          where: { id: jobId },
          data: {
            status: nextStatus,
            nextRunAt,
          },
        }),
        prisma.jobRun.update({
          where: { id: runId },
          data: {
            status: JobRunStatus.SUCCESS,
            finishedAt,
            duration,
          },
        }),
      ]);
      jobsCompleted.inc();
      workerThroughput.inc();

      logger.info({ jobId, attempt: job.attemptsMade + 1 }, "Completed Job");
    } catch (error) {
      const duration2 = (Date.now() - start) / 1000;

      jobDuration.observe(duration2);
      const maxAttempts = job.opts.attempts ?? 1;
      const failedAttempts = job.attemptsMade + 1;
      const isLastAttempt = failedAttempts >= maxAttempts;
      const finishedAt = new Date();
      const duration = finishedAt.getTime() - startedAt.getTime();

      logger.error({ jobId, error: String(error) }, "Execution failure");

      let nextStatus: JobStatus = JobStatus.FAILED;
      let nextRunAt: Date | null = null;

      if (isLastAttempt && dbJob.type === "CRON" && dbJob.cronExpression) {
        nextStatus = JobStatus.ACTIVE;
        try {
          const interval = CronExpressionParser.parse(dbJob.cronExpression);
          nextRunAt = interval.next().toDate();
          logger.info(
            { jobId, nextRunAt: nextRunAt.toISOString() },
            "Cron next execution",
          );
        } catch (cronError) {
          logger.error(
            {
              jobId,
              cronExpression: dbJob.cronExpression,
              error: String(cronError),
            },
            "Cron parsing error on failure transition",
          );
          nextStatus = JobStatus.FAILED;
        }
      }

      await prisma.jobRun.update({
        where: {
          id: runId,
        },
        data: {
          status: JobRunStatus.FAILED,
          attempts: failedAttempts,
          finishedAt,
          error: String(error),
          duration,
        },
      });

      if (isLastAttempt) {
        await prisma.job.update({
          where: { id: jobId },
          data: {
            status: nextStatus,
            nextRunAt,
          },
        });
      }

      if (failedAttempts < maxAttempts) {
        logger.warn(
          { jobId, attempt: failedAttempts, maxAttempts },
          "Retrying Job",
        );
      } else {
        logger.error(
          { jobId, attempt: failedAttempts, maxAttempts },
          "Job Failed",
        );
      }
      jobsFailed.inc();
      workerThroughput.inc();

      throw error;
    }
  },
  {
    connection,
  },
);
jobWorker.on("ready", () => {
  logger.info("Worker READY");
});

jobWorker.on("active", (job) => {
  logger.info({ id: job.id, data: job.data }, "Worker ACTIVE");
});

jobWorker.on("completed", (job) => {
  logger.info({ id: job.id }, "Worker COMPLETED");
});

jobWorker.on("failed", (job, err) => {
  logger.error(
    {
      id: job?.id,
      error: err.message,
    },
    "Worker FAILED",
  );
});

jobWorker.on("error", (err) => {
  logger.error({ err }, "Worker ERROR");
});
logger.info(
  {
    queueName: jobWorker.name,
  },
  "Worker created",
);

logger.info(connection.options, "Worker Redis connection");
logger.info(
  {
    isRunning: !jobWorker.closing,
  },
  "Worker status",
);
