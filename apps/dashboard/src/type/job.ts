import { FailedJob } from "./failedJob.js";
import { JobRun } from "./jobRun.js";

export type JobStatus =
  | "ACTIVE"
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "PAUSED";

export interface Job {
  id: string;
  name: string;
  description: string;
  cronExpression: string;
  type: string;
  priority: number;
  active: boolean;
  status: JobStatus;
  nextRunAt: string; // ISO timestamp
  timeoutMs: number; // seconds
  maxRetries: number;
  payload: unknown;
  createdAt: string;
  updatedAt: string;
  runs: JobRun[];
  failedJobs: FailedJob[];
}
