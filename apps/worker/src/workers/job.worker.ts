import { Worker } from "bullmq";
import { prisma } from "database";
import { connection } from "shared";
import { logger } from "observability";
import parser from "cron-parser";

export const jobWorker = new Worker(
  "jobs",
  async (job) => {
    const { jobId } = job.data;
    if (!jobId) {
      const err = new Error("Job execution failed: No jobId provided in enqueued payload");
      logger.error(err.message);
      throw err;
    }

    logger.info({ jobId }, "Worker executing");

    // Fetch the job details from PostgreSQL
    const dbJob = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!dbJob) {
      const err = new Error(`Job execution failed: Job with ID ${jobId} not found in database`);
      logger.error(err.message);
      throw err;
    }

    const startedAt = new Date();

    // Create JobRun entry recording start details
    const run = await prisma.jobRun.create({
      data: {
        jobId,
        status: "RUNNING",
        workerId: process.env.WORKER_ID || "worker-1",
        attempts: job.attemptsMade,
        startedAt,
      },
    });

    // Update Job status to RUNNING in database
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "RUNNING",
      },
    });

    try {
      // Simulate execution (3000ms delay)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const finishedAt = new Date();
      const duration = finishedAt.getTime() - startedAt.getTime();

      let nextStatus = "COMPLETED";
      let nextRunAt: Date | null = null;

      if (dbJob.type === "CRON" && dbJob.cronExpression) {
        nextStatus = "ACTIVE";
        try {
          const interval = parser.parseExpression(dbJob.cronExpression);
          nextRunAt = interval.next().toDate();
          logger.info({ jobId, nextRunAt: nextRunAt.toISOString() }, "Cron next execution");
        } catch (cronError) {
          logger.error(
            { jobId, cronExpression: dbJob.cronExpression, error: String(cronError) },
            "Cron parsing error on success transition"
          );
          nextStatus = "FAILED";
        }
      }

      // Atomically update both job schedule and run history status
      await prisma.$transaction([
        prisma.job.update({
          where: { id: jobId },
          data: {
            status: nextStatus,
            nextRunAt,
          },
        }),
        prisma.jobRun.update({
          where: { id: run.id },
          data: {
            status: "SUCCESS",
            finishedAt,
            completedAt: finishedAt,
            duration,
          },
        }),
      ]);

      logger.info({ jobId }, "Execution success");
    } catch (error) {
      const finishedAt = new Date();
      const duration = finishedAt.getTime() - startedAt.getTime();

      logger.error({ jobId, error: String(error) }, "Execution failure");

      let nextStatus = "FAILED";
      let nextRunAt: Date | null = null;

      if (dbJob.type === "CRON" && dbJob.cronExpression) {
        nextStatus = "ACTIVE";
        try {
          const interval = parser.parseExpression(dbJob.cronExpression);
          nextRunAt = interval.next().toDate();
          logger.info({ jobId, nextRunAt: nextRunAt.toISOString() }, "Cron next execution");
        } catch (cronError) {
          logger.error(
            { jobId, cronExpression: dbJob.cronExpression, error: String(cronError) },
            "Cron parsing error on failure transition"
          );
          nextStatus = "FAILED";
        }
      }

      await prisma.$transaction([
        prisma.job.update({
          where: { id: jobId },
          data: {
            status: nextStatus,
            nextRunAt,
          },
        }),
        prisma.jobRun.update({
          where: { id: run.id },
          data: {
            status: "FAILED",
            finishedAt,
            completedAt: finishedAt,
            error: String(error),
            duration,
          },
        }),
      ]);

      throw error;
    }
  },
  {
    connection,
  }
);
