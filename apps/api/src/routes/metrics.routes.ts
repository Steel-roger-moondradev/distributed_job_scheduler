import { Router } from "express";
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
router.get("/metricsdashboard", async (req, res) => {
  const range = (req.query.range as keyof typeof config) || "24h";
  const { amount, unit, bucket } = config[range];
  const from = new Date(
    Date.now() -
      (unit == "hour" ? amount * 60 * 60 * 1000 : amount * 24 * 60 * 60 * 1000),
  );
  const to = new Date();

  const successcount = await prisma.jobRun.count({
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
      status: "SUCCESS",
    },
  });
  const failcount = await prisma.jobRun.count({
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
      status: "FAILED",
    },
  });

  const averageExecutionTime = await prisma.jobRun.aggregate({
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
      status: "SUCCESS",
    },
    _avg: {
      duration: true,
    },
  });

  let distribution;
  const interval = unit === "hour" ? "hour" : "day";
  if (unit == "hour") {
    distribution = await prisma.$queryRaw`
    SELECT 
      date_trunc('hour',"finishedAt") as bucket,
      AVG("duration")::float AS average_duration
      FROM "JobRun"
      WHERE "finishedAt" >= ${from} AND "finishedAt" <= ${to} AND "status" = 'SUCCESS'
      GROUP BY bucket
      ORDER BY bucket;
      `;
  } else {
    distribution = await prisma.$queryRaw`
    SELECT 
      date_trunc('day',"finishedAt") as bucket,
      AVG("duration")::float AS average_duration
      FROM "JobRun"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to} AND "status" = 'SUCCESS'
      GROUP BY bucket
      ORDER BY bucket;
      `;
  }

  let jobscount;
  if (unit == "hour") {
    jobscount = await prisma.$queryRaw`
    SELECT 
      date_trunc('hour',"finishedAt") as bucket,
      COUNT(*)::int AS job_count
      FROM "JobRun"
      WHERE "finishedAt" >= ${from} AND "finishedAt" <= ${to} AND "status" = 'SUCCESS'
      GROUP BY bucket
      ORDER BY bucket;
      `;
  } else {
    jobscount = await prisma.$queryRaw`
    SELECT 
      date_trunc('day',"finishedAt") as bucket,
      COUNT(*)::int AS job_count
      FROM "JobRun"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to} AND "status" = 'SUCCESS'
      GROUP BY bucket
      ORDER BY bucket;
      `;
  }

  const data = await prisma.$queryRaw`
    SELECT
  CASE
    WHEN "duration" < 1000 THEN '<1s'
    WHEN "duration" < 5000 THEN '1s-5s'
    WHEN "duration" < 10000 THEN '5s-10s'
    ELSE '10s+'
  END AS duration_range,
  COUNT(*) ::int AS job_count
FROM "JobRun"
WHERE
  "finishedAt" >= ${from}
  AND "finishedAt" <= ${to}
  AND "status" = 'SUCCESS'
GROUP BY
  CASE
    WHEN "duration" < 1000 THEN '<1s'
    WHEN "duration" < 5000 THEN '1s-5s'
    WHEN "duration" < 10000 THEN '5s-10s'
    ELSE '10s+'
  END
ORDER BY
CASE
  WHEN MIN("duration") < 1000 THEN 1
  WHEN MIN("duration") < 5000 THEN 2
  WHEN MIN("duration") < 10000 THEN 3
  ELSE 4
END`;

  const slowestJobs = await prisma.jobRun.findMany({
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
      status: "SUCCESS",
    },
    orderBy: {
      duration: "desc",
    },
    take: 10,
  });
  res.json({
    successcount,
    failcount,
    averageExecutionTime,
    distribution,
    jobscount,
    data,
    slowestJobs,
  });
});
export default router;
