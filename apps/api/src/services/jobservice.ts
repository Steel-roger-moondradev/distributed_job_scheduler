import { Prisma, prisma } from "database";
import { JobStatus } from "@prisma/client";
import { CronExpressionParser } from "cron-parser";

interface CreateJobInput {
  name: string;
  description?: string;
  payload: Prisma.InputJsonValue;
  type: "ONCE" | "DELAYED" | "CRON";
  jobtype: "HTTP_REQUEST" | "EMAIL";
  cronExpression?: string;
  delaySeconds?: number;
  priority?: number;
  status?: JobStatus;
}

export function getNextCronRun(expression: string): Date {
  const interval = CronExpressionParser.parse(expression);

  return interval.next().toDate();
}

export async function createJob(data: CreateJobInput) {
  console.log("Creating job with data:", data);

  const {
    name,
    description,
    payload,
    type,
    jobtype,
    cronExpression,
    delaySeconds,
    priority,
    status,
  } = data;
  console.log("Parsed job data:", data);
  let nextRunAt: Date | null = null;

  switch (type) {
    case "ONCE": {
      nextRunAt = new Date();
      break;
    }

    case "DELAYED": {
      if (
        typeof delaySeconds !== "number" ||
        !Number.isFinite(delaySeconds) ||
        delaySeconds < 0
      ) {
        throw new Error(
          "delaySeconds must be a valid non-negative number for DELAYED jobs",
        );
      }

      nextRunAt = new Date(Date.now() + delaySeconds * 1000);

      break;
    }

    case "CRON": {
      if (!cronExpression) {
        throw new Error("cronExpression is required for CRON jobs");
      }

      nextRunAt = getNextCronRun(cronExpression);

      break;
    }

    default:
      throw new Error("Invalid job type");
  }

  const job = await prisma.job.create({
    data: {
      name,
      description,
      payload,
      type,
      jobtype,
      cronExpression,
      nextRunAt,
      status,

      priority: priority ?? 0,
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

export async function getFailedJobs() {
  return prisma.failedJob.findMany({
    include: {
      job: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
        },
      },
    },
    orderBy: {
      failedAt: "desc",
    },
  });
}

export async function getJobHistory(jobId: string) {
  return prisma.jobRun.findMany({
    where: {
      jobId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRecentExecutions() {
  return prisma.jobRun.findMany({
    take: 5,
    orderBy: {
      startedAt: "desc",
    },
    include: {
      job: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function getRecentFailedJobs() {
  return prisma.failedJob.findMany({
    take: 5,
    orderBy: {
      failedAt: "desc",
    },
    select: {
      id: true,
      reason: true,
      attempts: true,
      failedAt: true,
      job: {
        select: {
          name: true,
        },
      },
    },
  });
}
