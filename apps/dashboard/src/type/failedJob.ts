import { Job } from "./job.js";

export interface FailedJob {
  id: string;
  jobId: string;
  reason: string;
  attempts: number;
  payload: unknown;
  failedAt: string; // ISO timestamp
  createdAt: string;
  job: Job;
}
