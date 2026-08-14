import "./workers/job.worker.js";
import { connection, initializeQueueEvents } from "shared";
import { logger, register } from "observability";
import express from "express";
import path from "path/win32";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });
const app = express();

const workerId = `worker-${process.pid}`;

await connection.sadd("workers", workerId);

setInterval(async () => {
  await connection.set(`worker:${workerId}:heartbeat`, Date.now(), "EX", 10);
}, 5000);

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(5001, () => {
  logger.info("Worker metrics on :5001");
});

async function start() {
  await initializeQueueEvents();

  logger.info("Worker started");
}

start().catch((err) => {
  logger.error({ error: String(err) }, "Failed to start worker");
  process.exit(1);
});
