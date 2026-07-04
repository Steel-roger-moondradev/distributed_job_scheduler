console.log("Before worker import");

import "./workers/job.worker.js";

console.log("After worker import");
import { connection, initializeQueueEvents } from "shared";
import { logger, register } from "observability";
import express from "express";

const app = express();

const workerId = `worker-${process.pid}`;

setInterval(async () => {
  await connection.set(`worker:${workerId}:heartbeat`, Date.now(), "EX", 10);
}, 5000);

app.get("/workers", async (_, res) => {
  const keys = await connection.keys("worker:*:heartbeat");

  const workers = await Promise.all(
    keys.map(async (key) => {
      const lastSeen = await connection.get(key);

      return {
        id: key.split(":")[1],
        status: "connected",
        lastSeen: Number(lastSeen),
      };
    }),
  );

  res.json(workers);
});

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(5001, () => {
  console.log("Worker metrics on :5001");
});

async function start() {
  await initializeQueueEvents();

  logger.info("Worker started");
}

start().catch((err) => {
  logger.error({ error: String(err) }, "Failed to start worker");
  process.exit(1);
});
console.log("REDIS_URL =", process.env.REDIS_URL);
console.log("Redis status =", connection.status);
console.log("Redis options =", connection.options);
