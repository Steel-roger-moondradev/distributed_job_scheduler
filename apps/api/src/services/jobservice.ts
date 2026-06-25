import { prisma } from "database";
import { Prisma } from "@prisma/client";
import { parseExpression } from "cron-parser";

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

  if (type === "ONCE") {
    nextRunAt = new Date();
  } else if (type === "DELAYED") {
    nextRunAt = new Date(Date.now() + delaySeconds * 1000);
  } else if (type === "CRON" && cronExpression) {
    try {
      nextRunAt = parser.parseExpression(cronExpression).next().toDate();
    } catch (error) {
      throw new Error(`Invalid cron expression: ${String(error)}`);
    }
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
    },
  });

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
