import { JobRun } from "./jobRun.js";
import { FailedJob } from "./failedJob.js";

export interface Job {
  id: string;

  name: string;

  description: string;

  cronExpression: string;

  type: string;

  priority: number;

  timeoutMs: number;

  maxRetries: number;

  active: boolean;

  runs: JobRun[];

  failedJobs: FailedJob[];

  payload: any;

  status: string;

  nextRunAt: string;

  createdAt: string;

  updatedAt: string;
}
