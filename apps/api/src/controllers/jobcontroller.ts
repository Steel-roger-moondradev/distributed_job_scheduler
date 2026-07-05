import { Request, Response } from "express";
import * as JobService from "../services/jobservice.js";
import { logAudit } from "../services/audit.service.js";
import { prisma } from "database";
import { jobsCreated } from "observability";
import { connection, getRedisStatus } from "shared";

export async function createJob(req: Request, res: Response) {
  const job = await JobService.createJob(req.body);

  if (!job) {
    return res.status(404).json({
      message: "Job not found",
    });
  }
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
  console.log(`Deleting job with id: ${req.params.id}`);
  await JobService.deleteJob(req.params.id as string);
  await logAudit("JOB_DELETED", req.params.id as string);

  res.status(204).send();
}

export async function pauseJobHandler(req: Request, res: Response) {
  const job = await prisma.job.update({
    where: {
      id: req.params.id as string,
    },
    data: {
      active: false,
      status: "PAUSED",
    },
  });

  await logAudit("JOB_PAUSED", job.id);

  res.json(job);
}

export async function resumeJobHandler(req: Request, res: Response) {
  const job = await prisma.job.update({
    where: {
      id: req.params.id as string,
    },
    data: {
      active: true,
      status: "ACTIVE",
    },
  });

  await logAudit("JOB_RESUMED", job.id);

  res.json(job);
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
