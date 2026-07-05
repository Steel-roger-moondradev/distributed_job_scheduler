import { Router } from "express";
import {
  createJob,
  deleteJob,
  failedJob,
  getJob,
  getJobHistory,
  getJobs,
  getRecentExecutions,
  getRecentFailedJobs,
  pauseJobHandler,
  resumeJobHandler,
} from "../controllers/jobcontroller.js";
import { createJobSchema } from "../validators/job.validator.js";
import { validate } from "../middlewares/validate.js";
import { jobIdSchema } from "../validators/common.validator.js";

const router = Router();

router.post("/create", validate(createJobSchema), createJob);

router.get("/get", getJobs);
router.get("/failed", failedJob);

router.get("/:id", validate(jobIdSchema, "params"), getJob);

router.delete("/:id/delete", validate(jobIdSchema, "params"), deleteJob);

router.patch("/:id/pause", validate(jobIdSchema, "params"), pauseJobHandler);

router.patch("/:id/resume", validate(jobIdSchema, "params"), resumeJobHandler);

router.get("/:id/history", validate(jobIdSchema, "params"), getJobHistory);

router.get("/job-runs/recent", getRecentExecutions);
router.get("/job-fails/recent", getRecentFailedJobs);
export default router;
