import { Job } from "./job.js";
export interface FailedJob {
    id: string;
    jobId: string;
    reason: string;
    attempts: number;
    payload: unknown;
    failedAt: string;
    createdAt: string;
    job: Job;
}
//# sourceMappingURL=failedJob.d.ts.map