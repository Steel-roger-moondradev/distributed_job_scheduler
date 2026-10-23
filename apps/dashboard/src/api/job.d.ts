import { Job } from "../type/job.js";
import { JobRun } from "../type/jobRun.js";
import { FailedJob } from "../type/failedJob.js";
export declare const getJobs: () => Promise<import("axios").AxiosResponse<Job[], any, {}>>;
export declare const getJob: (id: string) => Promise<import("axios").AxiosResponse<Job, any, {}>>;
export declare const pauseJob: (id: string) => Promise<import("axios").AxiosResponse<void, any, {}>>;
export declare const resumeJob: (id: string) => Promise<import("axios").AxiosResponse<void, any, {}>>;
export declare const deleteJob: (id: string) => Promise<import("axios").AxiosResponse<void, any, {}>>;
export declare const getJobHistory: (id: string) => Promise<import("axios").AxiosResponse<JobRun[], any, {}>>;
export declare const queueSize: () => Promise<import("axios").AxiosResponse<number, any, {}>>;
export declare const getFailedJobs: () => Promise<import("axios").AxiosResponse<FailedJob[], any, {}>>;
export declare const retryFailedJob: (id: string) => Promise<import("axios").AxiosResponse<void, any, {}>>;
//# sourceMappingURL=job.d.ts.map