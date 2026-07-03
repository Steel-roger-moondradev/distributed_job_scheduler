import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

export default api;

export const getJobs = () => api.get("/jobs");

export const getJob = (id: string) => api.get(`/jobs/${id}`);

export const pauseJob = (id: string) => api.patch(`/jobs/${id}/pause`);

export const resumeJob = (id: string) => api.patch(`/jobs/${id}/resume`);

export const deleteJob = (id: string) => api.delete(`/jobs/${id}`);

export const failedJobs = () => api.get("/failed-jobs");

export const retryFailedJob = (id: string) =>
  api.post(`/failed-jobs/${id}/retry`);
