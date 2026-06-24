import { jobWorker } from "./workers/job.worker.js";

console.log("Worker started");

jobWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

jobWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});
