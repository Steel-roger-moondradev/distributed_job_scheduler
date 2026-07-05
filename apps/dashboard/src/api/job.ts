import api from "./client.js";
import { Job } from "../type/job.js";
import { JobRun } from "../type/jobRun.js";
import { FailedJob } from "../type/failedJob.js";

export const getJobs = () => api.get<Job[]>("/jobs/get");
export const getJob = (id: string) => api.get<Job>(`/jobs/${id}`);
export const pauseJob = (id: string) => api.patch<void>(`/jobs/${id}/pause`);
export const resumeJob = (id: string) => api.patch<void>(`/jobs/${id}/resume`);
export const deleteJob = (id: string) => api.delete<void>(`/jobs/${id}/delete`);
export const getJobHistory = (id: string) =>
  api.get<JobRun[]>(`/jobs/${id}/history`);
export const queueSize = () => api.get<number>("/jobs/dashboard");
console.log("queue size", queueSize());

export const getFailedJobs = () => api.get<FailedJob[]>("/failed-jobs");
export const retryFailedJob = (id: string) =>
  api.post<void>(`/failed-jobs/${id}/retry`);
