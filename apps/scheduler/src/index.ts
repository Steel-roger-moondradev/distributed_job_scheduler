import { processJobs } from "./scheduler.js";

console.log("Scheduler started");

processJobs();

setInterval(async () => {
  try {
    await processJobs();
  } catch (error) {
    console.error(error);
  }
}, 30000);
