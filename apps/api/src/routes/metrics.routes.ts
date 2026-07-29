import { Router } from "express";
import { jobQueue } from "../../../../packages/shared/dist/queue/queue.js";
import { prisma } from "database";
const router = Router();

const config = {
  "1h": {
    amount: 1,
    unit: "hour",
    bucket: "5 minutes",
  },
  "6h": {
    amount: 6,
    unit: "hour",
    bucket: "30 minutes",
  },
  "24h": {
    amount: 24,
    unit: "hour",
    bucket: "1 hour",
  },
  "7d": {
    amount: 7,
    unit: "day",
    bucket: "1 day",
  },
} as const;
