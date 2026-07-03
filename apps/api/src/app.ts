import dotenv from "dotenv";
import express from "express";
import { httpLogger } from "./middlewares/logger.middleware.js";
import jobRoutes from "./routes/job.routes.js";
import { register, queueDepth } from "observability";
import { jobQueue } from "shared";

dotenv.config();

const app = express();

app.use(express.json());
app.use(httpLogger);

const port = 5000;

app.get("/health", (req, res) => {
  res.send("API is healthy!");
});

app.use("/jobs", jobRoutes);

app.get("/metrics", async (req, res) => {
  const waiting = await jobQueue.getWaitingCount();
  queueDepth.set(waiting);

  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () => {
  console.log(`API server is running at http://localhost:${port}`);
});
