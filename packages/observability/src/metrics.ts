import client from "prom-client";

export const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const jobsCreated = new client.Counter({
  name: "jobs_created_total",
  help: "Total jobs created",
  registers: [register],
});

export const jobsCompleted = new client.Counter({
  name: "jobs_completed_total",
  help: "Total jobs completed",
  registers: [register],
});

export const jobsFailed = new client.Counter({
  name: "jobs_failed_total",
  help: "Total jobs failed",
  registers: [register],
});

export const queueDepth = new client.Gauge({
  name: "queue_depth",
  help: "Current queue depth",
  registers: [register],
});

export const workerThroughput = new client.Counter({
  name: "worker_throughput",
  help: "Total jobs processed by workers",
  registers: [register],
});

export const jobDuration = new client.Histogram({
  name: "job_duration_seconds",
  help: "Job execution duration",
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});
