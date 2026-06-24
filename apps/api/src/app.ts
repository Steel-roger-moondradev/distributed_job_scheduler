import express from "express";
import { httpLogger } from "./middlewares/logger.middleware.js";
import jobRoutes from "./routes/job.routes.js";

const app = express();

app.use(express.json());
app.use(httpLogger);

const port = 5000;

app.get("/health", (req, res) => {
  res.send("API is healthy!");
});

app.use("/jobs", jobRoutes);

app.listen(port, () => {
  console.log(`API server is running at http://localhost:${port}`);
});
