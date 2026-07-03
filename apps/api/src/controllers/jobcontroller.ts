import { Request, Response } from "express";
import * as JobService from "../services/jobservice.js";
import { logAudit } from "../services/audit.service.js";
import { prisma } from "database";
import { jobsCreated } from "observability";

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
    },
  });

  await logAudit("JOB_RESUMED", job.id);

  res.json(job);
}
