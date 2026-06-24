import { Queue } from "bullmq";
import { connection } from "shared";

export const jobQueue = new Queue("jobs", {
  connection,
});
