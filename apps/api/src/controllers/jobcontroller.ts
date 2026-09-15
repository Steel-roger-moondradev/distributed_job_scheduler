import { Request, Response } from "express";
import * as JobService from "../services/jobservice.js";
import { logAudit } from "../services/audit.service.js";
import { prisma } from "database";
import { jobsCreated } from "observability";
import { connection, getRedisStatus } from "shared";

export async function createJob(req: Request, res: Response) {
  console.log("REQUEST BODY controller:", req.body);
  const job = await JobService.createJob(req.body);
  console.log("REQUEST BODY:", req.body);
  if (!job) {
    return res.status(404).json({
      message: "Job not found",
    });
  }

  console.log("Job created:", job);
  jobsCreated.inc();

  await logAudit("JOB_CREATED", job.id);

  res.status(201).json(job);
}

export async function getJobs(req: Request, res: Response) {
  const jobs = await JobService.getJobs();

  res.json(jobs);
}

export async function getJob(req: Request, res: Response) {
  const job = await JobService.getJob(req.params.id as string);

  if (!job) {
    return res.status(404).json({
      message: "Job not found",
    });
  }

  res.json(job);
}

export async function deleteJob(req: Request, res: Response) {
  await JobService.deleteJob(req.params.id as string);

  await logAudit("JOB_DELETED", req.params.id as string);

  res.status(204).send();
}

export async function pauseJobHandler(req: Request, res: Response) {
  try {
    const jobId = req.params.id;

    if (!jobId || jobId === "undefined") {
      return res.status(400).json({
        message: "Job ID is required",
      });
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId as string,
      },
      select: {
        id: true,
        type: true,
        status: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // ONCE jobs can never be paused.
    if (job.type === "ONCE") {
      return res.status(400).json({
        message: "ONCE jobs cannot be paused",
      });
    }

    // Only ACTIVE jobs can be paused.
    if (job.status !== "ACTIVE") {
      return res.status(400).json({
        message: `Job cannot be paused because its status is ${job.status}`,
      });
    }

    // Atomically change ACTIVE -> PAUSED.
    const updatedJob = await prisma.job.update({
      where: {
        id: jobId as string,
        status: "ACTIVE",
      },
      data: {
        status: "PAUSED",
      },
    });

    await logAudit("JOB_PAUSED", updatedJob.id);

    return res.json(updatedJob);
  } catch (error) {
    console.error("Failed to pause job:", error);

    return res.status(500).json({
      message: "Failed to pause job",
    });
  }
}

export async function resumeJobHandler(req: Request, res: Response) {
  try {
    const jobId = req.params.id;

    if (!jobId || jobId === "undefined") {
      return res.status(400).json({
        message: "Job ID is required",
      });
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId as string,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Only PAUSED jobs can be resumed.
    if (job.status !== "PAUSED") {
      return res.status(400).json({
        message: `Job cannot be resumed because its status is ${job.status}`,
      });
    }

    // Atomically change PAUSED -> ACTIVE.
    const updatedJob = await prisma.job.update({
      where: {
        id: jobId as string,
        status: "PAUSED",
      },
      data: {
        status: "ACTIVE",
      },
    });

    await logAudit("JOB_RESUMED", updatedJob.id);

    return res.json(updatedJob);
  } catch (error) {
    console.error("Failed to resume job:", error);

    return res.status(500).json({
      message: "Failed to resume job",
    });
  }
}

export async function failedJob(req: Request, res: Response) {
  const failedJobs = await JobService.getFailedJobs();

  res.json(failedJobs);
}

export async function gethealth(req: Request, res: Response) {
  const redisStatus = await getRedisStatus();

  const statusdb = await prisma.$queryRaw`SELECT 1`
    .then(() => "connected")
    .catch(() => "disconnected");

  const heartbeat = await connection.get("scheduler:heartbeat");

  const schedulerStatus = heartbeat ? "connected" : "disconnected";

  res.json({
    redis: redisStatus,
    database: statusdb,
    scheduler: schedulerStatus,
    api: "connected",
    timestamp: new Date().toISOString(),
  });
}

export const getJobHistory = async (req: Request, res: Response) => {
  const jobId = req.params.id;

  const jobHistory = await JobService.getJobHistory(jobId as string);

  res.json(jobHistory);
};

export const getRecentExecutions = async (req: Request, res: Response) => {
  const executions = await JobService.getRecentExecutions();

  res.json(executions);
};

export const getRecentFailedJobs = async (req: Request, res: Response) => {
  const failedExecutions = await JobService.getRecentFailedJobs();

  res.json(failedExecutions);
};
