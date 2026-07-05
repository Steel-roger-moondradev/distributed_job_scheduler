import { Job } from "./type.js";

export type JobRunStatus = "SUCCESS" | "FAILED" | "RUNNING";

export interface JobRun {
  id: string;
  jobId: string;
  job: Job;
  error?: string;
  startedAt: string;
  finishedAt?: string;
  duration: number;
  workerId: string;
  attempts: number;
  status: JobRunStatus;
  createdAt: string;
}

export interface RecentExecution {
  id: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
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
