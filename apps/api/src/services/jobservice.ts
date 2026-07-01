import { jobQueue } from "shared/src/queue/queue.js";
import { prisma } from "database";
import { Prisma } from "@prisma/client";
import { connection } from "shared";
interface CreateJobInput {
  name: string;
  description?: string;
  payload: Prisma.InputJsonValue;
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

  switch (type) {
    case "ONCE":
      // Run immediately
      nextRunAt = new Date();
      break;

    case "DELAYED":
      // Run after the specified delay
      nextRunAt = new Date(Date.now() + delaySeconds * 1000);
      break;

    case "CRON":
      // The scheduler will calculate the next execution time
      if (!cronExpression) {
        throw new Error("cronExpression is required for CRON jobs");
      }

      nextRunAt = null;
      break;

    default:
      throw new Error("Invalid job type");
  }

  const job = await prisma.job.create({
    data: {
      name,
      description,
      payload,
      type,
      cronExpression,
      nextRunAt,
      status: "ACTIVE",
      active: true,
    },
  });
  console.log("REDIS_URL =", process.env.REDIS_URL);
  console.log("Redis status =", connection.status);
  console.log("Redis options =", connection.options);
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
