import { Job } from "./type.js";

export type JobRunStatus =
  | "PENDING"
  | "CLAIMED"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED";

export interface JobRun {
  id: string;

  jobId: string;
  job: Job;

  status: JobRunStatus;

  startedAt: string;
  finishedAt: string | null;

  duration: number | null;

  workerId: string | null;

  attempts: number;

  error: string | null;
  result: unknown;

  createdAt: string;
}

export interface RecentExecution {
  id: string;

  status: "PENDING" | "CLAIMED" | "RUNNING" | "SUCCESS" | "FAILED";

  workerId: string | null;

  startedAt: string;
  duration: number | null;

  job: {
    name: string;
  };
}

export interface RecentFailedJob {
  id: string;

  reason: string;
  attempts: number;
  failedAt: string;

  job: {
    name: string;
  };
}
