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
