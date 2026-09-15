import { JobRun } from "./jobRun.js";
import { FailedJob } from "./failedJob.js";

export type JobStatus =
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface Job {
  id: string;

  name: string;
  description: string | null;

  payload: unknown;

  type: "CRON" | "ONCE" | "DELAYED";
  jobtype: string;

  cronExpression: string | null;

  status: JobStatus;

  priority: number;
  timeoutMs: number;
  maxRetries: number;

  nextRunAt: string | null;

  runs: JobRun[];
  failedJobs: FailedJob[];

  createdAt: string;
  updatedAt: string;
}
