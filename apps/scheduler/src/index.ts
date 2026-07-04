import { logger, register } from "observability";
import { startScheduler } from "./scheduler.js";
import { connection } from "shared";
import express from "express";

const app = express();

setInterval(async () => {
  await connection.set("scheduler:heartbeat", Date.now(), "EX", 10);
}, 5000);

app.get("/metrics", async (_, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(5002);
logger.info("Scheduler service started");

process.on("SIGINT", () => {
  logger.info("Received SIGINT. Shutting down scheduler...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM. Shutting down scheduler...");
  process.exit(0);
});

startScheduler().catch((error) => {
  logger.error(error, "Scheduler crashed");
  process.exit(1);
});
console.log("REDIS_URL =", process.env.REDIS_URL);
console.log("Redis status =", connection.status);
console.log("Redis options =", connection.options);
