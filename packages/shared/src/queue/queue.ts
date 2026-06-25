import { Queue } from "bullmq";
import { connection } from "shared";

export const jobsQueue = new Queue("jobs", {
  connection,
});
