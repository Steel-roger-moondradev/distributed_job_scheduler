import express from "express";
import { connection } from "shared";
import { logger, register } from "observability";

import { startScheduler, stopScheduler } from "./scheduler.js";

import { startWorkerCleanup } from "./cleanup.js";

import dotenv from "dotenv";

dotenv.config({
  path: "../../.env",
});

const app = express();

app.get("/metrics", async (_, res) => {
  res.setHeader("Content-Type", register.contentType);

  res.end(await register.metrics());
});

const heartbeatInterval = setInterval(async () => {
  try {
    await connection.set("scheduler:heartbeat", Date.now(), "EX", 10);
  } catch (error) {
    logger.error(error, "Failed to update scheduler heartbeat");
  }
}, 5000);

function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down scheduler...`);

  clearInterval(heartbeatInterval);

  stopScheduler();

  process.exit(0);
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

async function main() {
  app.listen(5002, () => {
    logger.info("Scheduler metrics server listening on port 5002");
  });

  startWorkerCleanup();

  /**
   * startScheduler contains a long-running loop,
   * so don't await it here.
   */
  void startScheduler();

  logger.info("Scheduler service started");
}

main().catch((error) => {
  logger.error(error, "Scheduler crashed");

  process.exit(1);
});
