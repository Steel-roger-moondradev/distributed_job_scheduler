import { FailedJob } from "./failedJob.js";
import { JobRun } from "./jobRun.js";
export type JobStatus =
  | "ACTIVE"
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "PAUSED"
  | "PENDING";
export interface Job {
  id: string;
  name: string;
  description?: string | null;
  cronExpression?: string | null;
  type: string;
  priority: number;
  active: boolean;
  status: JobStatus;
  nextRunAt?: string | null;
  timeoutMs: number;
  maxRetries: number;
  payload: unknown;
  createdAt: string;
  updatedAt: string;
  runs: JobRun[];
  failedJobs: FailedJob[];
}
