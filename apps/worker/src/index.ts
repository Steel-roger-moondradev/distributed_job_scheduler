import "./workers/job.worker.js";

import { connection } from "shared";
import { logger, register } from "observability";
import express from "express";
import dotenv from "dotenv";

dotenv.config({
  path: "../../.env",
});

const app = express();

const workerId = `worker-${process.pid}`;

await connection.sadd("workers", workerId);

logger.info(
  {
    workerId,
  },
  "Worker registered",
);

const heartbeatInterval = setInterval(async () => {
  try {
    await connection.set(`worker:${workerId}:heartbeat`, Date.now(), "EX", 10);
  } catch (error) {
    logger.error(
      {
        error,
        workerId,
      },
      "Failed to update worker heartbeat",
    );
  }
}, 5000);

app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", register.contentType);

  res.end(await register.metrics());
});

app.listen(5001, () => {
  logger.info("Worker metrics server listening on :5001");
});

async function shutdown(signal: string) {
  logger.info(
    {
      signal,
      workerId,
    },
    "Worker shutting down",
  );

  clearInterval(heartbeatInterval);

  try {
    await connection.del(`worker:${workerId}:heartbeat`);

    await connection.srem("workers", workerId);

    logger.info(
      {
        workerId,
      },
      "Worker deregistered",
    );
  } catch (error) {
    logger.error(
      {
        error,
        workerId,
      },
      "Failed to deregister worker",
    );
  }

  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

logger.info(
  {
    workerId,
  },
  "Worker started",
);
