import { FailedJob } from "./failedJob.js";
import { JobRun } from "./jobRun.js";

export type JobStatus =
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface Job {
  id: string;

  name: string;
  description?: string | null;

  payload: unknown;

  type: "CRON" | "ONCE" | "DELAYED";
  jobtype: string;

  cronExpression?: string | null;

  status: JobStatus;

  priority: number;

  nextRunAt?: string | null;

  maxRetries: number;
  timeoutMs: number;

  createdAt: string;
  updatedAt: string;

  runs: JobRun[];
  failedJobs: FailedJob[];
}
