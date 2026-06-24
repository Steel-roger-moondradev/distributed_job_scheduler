import { Worker } from "bullmq";
import { prisma } from "database";
import { connection } from "shared";

export const jobWorker = new Worker(
  "jobs",
  async (job) => {
    const run = await prisma.jobRun.create({
      data: {
        jobId: job.data.jobId,
        status: "RUNNING",
        workerId: process.env.WORKER_ID || "worker-1",
        attempts: job.attemptsMade,
        startedAt: new Date(),
      },
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await prisma.jobRun.update({
        where: {
          id: run.id,
        },
        data: {
          status: "SUCCESS",
          completedAt: new Date(),
        },
      });
    } catch (error) {
      await prisma.jobRun.update({
        where: {
          id: run.id,
        },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          error: String(error),
        },
      });

      throw error;
    }
  },
  {
    connection,
  },
);
