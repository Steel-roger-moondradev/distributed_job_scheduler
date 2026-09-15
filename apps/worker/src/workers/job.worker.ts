import { Worker } from "bullmq";
import { JobRunStatus, JobStatus, Prisma, prisma } from "database";
import { connection } from "shared";
import {
  jobDuration,
  jobsCompleted,
  jobsFailed,
  logger,
  workerThroughput,
} from "observability";
import dotenv from "dotenv";

import { httphandler, HttpHandler } from "../handler/httphandler.js";
import { emailhandler, EmailHandler } from "../handler/emailhandler.js";

dotenv.config({
  path: "../../.env",
});

interface JobData {
  jobId: string;
  jobRunId: string;
}

export const jobWorker = new Worker<JobData>(
  "jobs",

  async (job) => {
    const { jobId, jobRunId } = job.data;

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

    if (!jobRunId) {
      const err = new Error(
        "Job execution failed: No jobRunId provided in enqueued payload",
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
        jobRunId,
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
          jobRunId,
        },
        err.message,
      );

      jobsFailed.inc();
      workerThroughput.inc();

      throw err;
    }

    const run = await prisma.jobRun.findUnique({
      where: {
        id: jobRunId,
      },
    });

    if (!run) {
      const err = new Error(`JobRun ${jobRunId} not found for Job ${jobId}`);

      logger.error(
        {
          jobId,
          jobRunId,
        },
        err.message,
      );

      jobsFailed.inc();
      workerThroughput.inc();

      throw err;
    }

    if (run.status === JobRunStatus.SUCCESS) {
      logger.warn(
        {
          jobId,
          jobRunId,
        },
        "JobRun already completed. Skipping execution.",
      );

      return;
    }

    if (run.status === JobRunStatus.RUNNING && run.workerId) {
      logger.warn(
        {
          jobId,
          jobRunId,
          workerId: run.workerId,
        },
        "JobRun is already running. Skipping duplicate execution.",
      );

      return;
    }

    if (
      run.status !== JobRunStatus.CLAIMED &&
      run.status !== JobRunStatus.PENDING &&
      run.status !== JobRunStatus.FAILED
    ) {
      logger.warn(
        {
          jobId,
          jobRunId,
          currentStatus: run.status,
        },
        "JobRun has unexpected status before execution",
      );
    }

    const workerId = `worker-${process.pid}`;
    const startedAt = new Date();
    const currentAttempt = job.attemptsMade + 1;

    await prisma.jobRun.update({
      where: {
        id: jobRunId,
      },
      data: {
        status: JobRunStatus.RUNNING,
        workerId,
        startedAt,
        attempts: currentAttempt,
        error: null,
        finishedAt: null,
        duration: null,
      },
    });

    logger.info(
      {
        jobId,
        jobRunId,
        workerId,
        jobType: dbJob.jobtype,
        attempt: currentAttempt,
      },
      "JobRun marked RUNNING",
    );

    const start = Date.now();

    let executionResult: unknown = null;

    try {
      switch (dbJob.jobtype) {
        case "HTTP_REQUEST": {
          const payload = dbJob.payload as unknown as HttpHandler;

          logger.info(
            {
              jobId,
              jobRunId,
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
              jobRunId,
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
            {
              jobId,
              jobRunId,
              to: payload.to,
              subject: payload.subject,
            },
            "Sending email",
          );

          const result = await emailhandler(payload);

          executionResult = {
            provider: "resend",
            emailId: result.id,
          };

          logger.info(
            {
              jobId,
              jobRunId,
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

      await prisma.jobRun.update({
        where: {
          id: jobRunId,
        },
        data: {
          status: JobRunStatus.SUCCESS,
          finishedAt,
          duration,
          error: null,
          result: executionResult as Prisma.InputJsonValue,
        },
      });

      if (dbJob.type === "ONCE" || dbJob.type === "DELAYED") {
        await prisma.job.update({
          where: {
            id: jobId,
          },
          data: {
            status: JobStatus.COMPLETED,
          },
        });

        logger.info(
          {
            jobId,
            jobRunId,
            jobType: dbJob.type,
          },
          "Job marked COMPLETED",
        );
      }

      jobsCompleted.inc();
      workerThroughput.inc();

      logger.info(
        {
          jobId,
          jobRunId,
          jobType: dbJob.jobtype,
          attempt: currentAttempt,
          duration,
        },
        "Completed Job",
      );

      return executionResult;
    } catch (error) {
      const durationSeconds = (Date.now() - start) / 1000;

      jobDuration.observe(durationSeconds);

      const maxAttempts = job.opts.attempts ?? dbJob.maxRetries + 1;

      const failedAttempt = job.attemptsMade + 1;

      const isLastAttempt = failedAttempt >= maxAttempts;

      const finishedAt = new Date();

      const duration = finishedAt.getTime() - startedAt.getTime();

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.error(
        {
          jobId,
          jobRunId,
          jobType: dbJob.jobtype,
          attempt: failedAttempt,
          maxAttempts,
          error: errorMessage,
        },
        "Execution failure",
      );

      await prisma.jobRun.update({
        where: {
          id: jobRunId,
        },
        data: {
          status: JobRunStatus.FAILED,
          attempts: failedAttempt,
          finishedAt,
          error: errorMessage,
          duration,
        },
      });

      if (isLastAttempt) {
        await prisma.failedJob.create({
          data: {
            jobId,
            attempts: failedAttempt,
            reason: errorMessage,
            payload: dbJob.payload as Prisma.InputJsonValue,
          },
        });

        if (dbJob.type === "ONCE" || dbJob.type === "DELAYED") {
          await prisma.job.update({
            where: {
              id: jobId,
            },
            data: {
              status: JobStatus.FAILED,
            },
          });

          logger.error(
            {
              jobId,
              jobRunId,
              jobType: dbJob.type,
              attempt: failedAttempt,
              maxAttempts,
            },
            "Job failed permanently",
          );
        }

        if (dbJob.type === "CRON") {
          logger.error(
            {
              jobId,
              jobRunId,
              jobType: dbJob.type,
              attempt: failedAttempt,
              maxAttempts,
            },
            "CRON JobRun failed permanently; Job remains ACTIVE",
          );
        }
      } else {
        logger.warn(
          {
            jobId,
            jobRunId,
            attempt: failedAttempt,
            maxAttempts,
          },
          "Retrying Job",
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
