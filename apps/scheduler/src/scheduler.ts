import { prisma } from "database";
import { jobsQueue } from "./queue.js";
import { CronExpressionParser } from "cron-parser";

export async function processJobs() {
  const jobs = await prisma.job.findMany({
    where: {
      nextRunAt: {
        lte: new Date(),
      },
    },
  });

  for (const job of jobs) {
    await jobsQueue.add(
      job.name,
      {
        jobId: job.id,
        payload: job.payload,
      },
      {
        removeOnComplete: true,
      },
    );

    // cron job
    if (job.cronExpression) {
      const interval = CronExpressionParser.parse(job.cronExpression);

      await prisma.job.update({
        where: { id: job.id },
        data: {
          nextRunAt: interval.next().toDate(),
        },
      });
    } else {
      // one-time job
      await prisma.job.update({
        where: { id: job.id },
        data: {
          nextRunAt: null,
          status: "QUEUED",
        },
      });
    }
  }
}
