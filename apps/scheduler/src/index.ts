import express from "express";
import { connection } from "shared";
import { logger, register } from "observability";
import { startScheduler } from "./scheduler.js";
import { startWorkerCleanup } from "./cleanup.js";
import path from "path/win32";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const app = express();

app.get("/metrics", async (_, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

const heartbeatInterval = setInterval(async () => {
  await connection.set("scheduler:heartbeat", Date.now(), "EX", 10);
}, 5000);

process.on("SIGINT", () => {
  clearInterval(heartbeatInterval);
  logger.info("Received SIGINT. Shutting down scheduler...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  clearInterval(heartbeatInterval);
  logger.info("Received SIGTERM. Shutting down scheduler...");
  process.exit(0);
});

async function main() {
  app.listen(5002, () => {
    logger.info("Scheduler metrics server listening on port 5002");
  });

   startWorkerCleanup();

  await startScheduler();

  logger.info("Scheduler service started");
}

main().catch((error) => {
  logger.error(error, "Scheduler crashed");
  process.exit(1);
});
