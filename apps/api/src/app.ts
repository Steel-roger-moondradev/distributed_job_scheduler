import dotenv from "dotenv";
import express from "express";
import { httpLogger } from "./middlewares/logger.middleware.js";
import jobRoutes from "./routes/job.routes.js";
import { register, queueDepth } from "observability";
import { connection, jobQueue } from "shared";
import cors from "cors";
import healthRouter from "./routes/health.routes.js";
import metricsdashboard from "./routes/metrics.routes.js";
import path from "path/win32";

dotenv.config({ path: "../../.env" });

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: false,
  }),
);

app.use(express.json());
app.use(httpLogger);

const port = 5000;

app.get("/jobs/dashboard", async (req, res) => {
  const size = await jobQueue.getWaitingCount();
  res.json(size);
});

app.get("/api/worker", async (req, res) => {
  const workers: string[] = await connection.smembers("workers");
  const activeworkers: any[] = [];

  for (const worker of workers) {
    const heartbeatKey = `worker:${worker}:heartbeat`;
    const exists = await connection.get(heartbeatKey);
    if (exists != null) {
      activeworkers.push({
        workerId: worker,
        status: "connected",
        heartbeat: exists,
      });
    }
  }
  console.log("Active workers:", activeworkers);
  res.json(activeworkers);
});

app.use("/jobs", jobRoutes);

app.use("/health", healthRouter);

app.get("/metrics", async (req, res) => {
  const waiting = await jobQueue.getWaitingCount();
  queueDepth.set(waiting);

  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/jobs/dashboard", async (req, res) => {
  const size = await jobQueue.getWaitingCount();

  res.json(size);
});

app.use("/api", metricsdashboard);

app.listen(port, () => {
  console.log(`API server is running at ${process.env.CORS_ORIGIN}`);
});
