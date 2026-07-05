import dotenv from "dotenv";
import express from "express";
import { httpLogger } from "./middlewares/logger.middleware.js";
import jobRoutes from "./routes/job.routes.js";
import { register, queueDepth } from "observability";
import { connection, jobQueue } from "shared";
import cors from "cors";
import healthRouter from "./routes/health.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
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
  const data = await connection.smembers("workers");
  res.json(data);
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

app.listen(port, () => {
  console.log(`API server is running at http://localhost:${port}`);
});
