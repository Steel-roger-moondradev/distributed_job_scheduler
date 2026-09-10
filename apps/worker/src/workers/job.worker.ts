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
import { JobStatus, JobRunStatus, Prisma } from "@prisma/client";
import dotenv from "dotenv";

import { httphandler, HttpHandler } from "../handler/httphandler.js";

import { emailhandler, EmailHandler } from "../handler/emailhandler.js";

dotenv.config({
  path: "../../.env",
});

export const jobWorker = new Worker(
  "jobs",
  async (job) => {
    const { jobId, executionId, runId: existingRunId } = job.data;
    console.log(`🚀 EXECUTING JOB: ${job.id} | priority: ${job.opts.priority}`);
    if (!jobId) {
      const err = new Error(
        "Job execution failed: No jobId provided in enqueued payload",
      );

      logger.error(err.message);
      jobsFailed.inc();
      workerThroughput.inc();

      throw err;
    }

    logger.info(
      {
        bullmqJobId: job.id,
        jobId,
        executionId,
        attempt: job.attemptsMade + 1,
      },
      "Worker executing",
    );

    const dbJob = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!dbJob) {
      const err = new Error(
        `Job execution failed: Job with ID ${jobId} not found in database`,
      );

      logger.error(
        {
          jobId,
        },
        err.message,
      );

      jobsFailed.inc();
      workerThroughput.inc();

      throw err;
    }

    let runId = existingRunId;
    let startedAt = new Date();

    const workerId = `worker-${process.pid}`;

    if (!runId) {
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

      if (run.status === JobRunStatus.SUCCESS) {
        logger.warn(
          {
            jobId,
            runId,
          },
          "JobRun already marked as SUCCESS. Skipping execution.",
        );

        return;
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

    logger.info(
      {
        jobId,
        runId,
        jobType: dbJob.jobtype,
        attempt: job.attemptsMade + 1,
      },
      "Running Job",
    );

    await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        status: JobStatus.RUNNING,
      },
    });
    const start = Date.now();

    let executionResult: unknown = null;

    try {
      switch (dbJob.jobtype) {
        case "HTTP_REQUEST": {
          const payload = dbJob.payload as unknown as HttpHandler;
          logger.info(
            {
              jobId,
              runId,
              method: payload.method,
              url: payload.url,
              timeoutMs: dbJob.timeoutMs,
            },
            "Executing HTTP request",
          );
          const result = await httphandler(payload, dbJob.timeoutMs);
          executionResult = {
            status: result.status,
            statusText: result.statusText,
            headers: result.headers,
            body: result.body,
          };
          logger.info(
            {
              jobId,
              runId,
              method: payload.method,
              url: payload.url,
              status: result.status,
            },
            "HTTP request completed",
          );
          break;
        }

        case "EMAIL": {
          const payload = dbJob.payload as unknown as EmailHandler;
          logger.info(
            { jobId, runId, to: payload.to, subject: payload.subject },
            "Sending email",
          );
          const result = await emailhandler(payload);
          executionResult = { provider: "resend", emailId: result.id };
          logger.info(
            {
              jobId,
              runId,
              emailId: result.id,
              to: payload.to,
              subject: payload.subject,
            },
            "Email sent successfully",
          );
          break;
        }

        default: {
          throw new Error(`Unsupported job type: ${dbJob.jobtype}`);
        }
      }

      const durationSeconds = (Date.now() - start) / 1000;

      jobDuration.observe(durationSeconds);

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
            {
              jobId,
              nextRunAt: nextRunAt.toISOString(),
            },
            "Cron next execution",
          );
        } catch (cronError) {
          logger.error(
            {
              jobId,
              cronExpression: dbJob.cronExpression,
              error: String(cronError),
            },
            "Cron parsing error",
          );

          nextStatus = JobStatus.FAILED;
        }
      }

      await prisma.$transaction([
        prisma.job.update({
          where: {
            id: jobId,
          },
          data: {
            status: nextStatus,
            nextRunAt,
          },
        }),

        prisma.jobRun.update({
          where: {
            id: runId,
          },
          data: {
            status: JobRunStatus.SUCCESS,
            finishedAt,
            duration,
            error: null,
            result: executionResult as Prisma.InputJsonValue,
          },
        }),
      ]);

      jobsCompleted.inc();
      workerThroughput.inc();

      logger.info(
        {
          jobId,
          runId,
          jobType: dbJob.jobtype,
          attempt: job.attemptsMade + 1,
          duration,
        },
        "Completed Job",
      );
    } catch (error) {
      const durationSeconds = (Date.now() - start) / 1000;

      jobDuration.observe(durationSeconds);

      const maxAttempts = job.opts.attempts ?? dbJob.maxRetries + 1;

      const failedAttempts = job.attemptsMade + 1;

      const isLastAttempt = failedAttempts >= maxAttempts;

      const finishedAt = new Date();

      const duration = finishedAt.getTime() - startedAt.getTime();

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.error(
        {
          jobId,
          runId,
          jobType: dbJob.jobtype,
          attempt: failedAttempts,
          maxAttempts,
          error: errorMessage,
        },
        "Execution failure",
      );

      let nextStatus: JobStatus = JobStatus.FAILED;

      let nextRunAt: Date | null = null;

      if (isLastAttempt && dbJob.type === "CRON" && dbJob.cronExpression) {
        nextStatus = JobStatus.ACTIVE;

        try {
          const interval = CronExpressionParser.parse(dbJob.cronExpression);

          nextRunAt = interval.next().toDate();

          logger.info(
            {
              jobId,
              nextRunAt: nextRunAt.toISOString(),
            },
            "Cron next execution after failure",
          );
        } catch (cronError) {
          logger.error(
            {
              jobId,
              cronExpression: dbJob.cronExpression,
              error: String(cronError),
            },
            "Cron parsing error after failure",
          );

          nextStatus = JobStatus.FAILED;
        }
      }

      await prisma.$transaction(async (tx) => {
        await tx.jobRun.update({
          where: {
            id: runId,
          },
          data: {
            status: JobRunStatus.FAILED,
            attempts: failedAttempts,
            finishedAt,
            error: errorMessage,
            duration,
          },
        });

        if (isLastAttempt) {
          await tx.job.update({
            where: {
              id: jobId,
            },
            data: {
              status: nextStatus,
              nextRunAt,
            },
          });

          await tx.failedJob.create({
            data: {
              jobId,
              attempts: failedAttempts,
              reason: errorMessage,
              payload: dbJob.payload as Prisma.InputJsonValue,
            },
          });
        }
      });

      if (!isLastAttempt) {
        logger.warn(
          {
            jobId,
            runId,
            attempt: failedAttempts,
            maxAttempts,
          },
          "Retrying Job",
        );
      } else {
        logger.error(
          {
            jobId,
            runId,
            attempt: failedAttempts,
            maxAttempts,
          },
          "Job Failed Permanently",
        );
      }

      jobsFailed.inc();
      workerThroughput.inc();

      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
  },
);

jobWorker.on("ready", () => {
  logger.info(
    {
      queueName: jobWorker.name,
    },
    "Worker READY",
  );
});

jobWorker.on("active", (job) => {
  logger.info(
    {
      id: job.id,
      data: job.data,
    },
    "Worker ACTIVE",
  );
});

jobWorker.on("completed", (job) => {
  logger.info(
    {
      id: job.id,
    },
    "Worker COMPLETED",
  );
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
  logger.error(
    {
      err,
    },
    "Worker ERROR",
  );
});

logger.info(
  {
    queueName: jobWorker.name,
  },
  "Worker created",
);

logger.info(
  {
    host: connection.options.host,
    port: connection.options.port,
  },
  "Worker Redis connection",
);

logger.info(
  {
    isRunning: !jobWorker.closing,
  },
  "Worker status",
);
