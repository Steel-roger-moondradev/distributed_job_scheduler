import { jobQueue } from "shared/src/queue/queue.js";
import { prisma } from "database";

interface CreateJobInput {
  name: string;
  description?: string;
  payload: unknown;
  type: "ONCE" | "DELAYED" | "CRON";
  cronExpression?: string;
  delaySeconds?: number;
}

export async function createJob(data: CreateJobInput) {
  const {
    name,
    description,
    payload,
    type,
    cronExpression,
    delaySeconds = 0,
  } = data;

  let nextRunAt: Date | null = null;

  if (type === "ONCE") {
    nextRunAt = new Date();
  } else if (type === "DELAYED") {
    nextRunAt = new Date(Date.now() + delaySeconds * 1000);
  }

  const job = await prisma.job.create({
    data: {
      name,
      description,
      payload,
      type,
      cronExpression,
      nextRunAt,
    },
  });

  // Queue only immediate and delayed jobs.
  // CRON jobs will be queued by the scheduler on Day 4.
  if (type === "ONCE" || type === "DELAYED") {
    await jobQueue.add(
      "execute-job",
      {
        jobId: job.id,
      },
      {
        attempts: job.maxRetries,
        delay: type === "DELAYED" ? delaySeconds * 1000 : 0,
      },
    );
  }

  return job;
}

export async function getJobs() {
  return prisma.job.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getJob(id: string) {
  return prisma.job.findUnique({
    where: {
      id,
    },
  });
}

export async function deleteJob(id: string) {
  return prisma.job.delete({
    where: {
      id,
    },
  });
}
