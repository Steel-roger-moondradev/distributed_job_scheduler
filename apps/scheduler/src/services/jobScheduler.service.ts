import { prisma } from "database";
import { jobQueue } from "shared";
import { logger } from "observability";

export async function scheduleDueJobs(): Promise<void> {
  const now = new Date();
  logger.info(
    {
      now: now.toISOString(),
    },
    "Current time",
  );

  const allJobs = await prisma.job.findMany();

  logger.info(
    {
      totalJobs: allJobs.length,
    },
    "Total jobs in database",
  );

  logger.info(allJobs);

  // Find all active and due jobs
  const dueJobs = await prisma.job.findMany({
    where: {
      status: "ACTIVE",
      active: true,
      nextRunAt: {
        lte: now,
      },
    },
    orderBy: {
      nextRunAt: "asc",
    },
  });
  logger.info(
    {
      dueJobs: dueJobs.length,
    },
    "Due jobs",
  );

  if (dueJobs.length > 0) {
    logger.info({ count: dueJobs.length }, "Jobs found");
  }

  for (const job of dueJobs) {
    try {
      // Transition status to QUEUED first to prevent duplicate scheduling in subsequent poll intervals
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "QUEUED",
        },
      });

      // Enqueue to BullMQ containing ONLY jobId
      const bullJob = await jobQueue.add("execute-job", {
        jobId: job.id,
      });

      logger.info(
        {
          bullJobId: bullJob.id,
          queueName: bullJob.queueName,
          data: bullJob.data,
        },
        "BullMQ job created",
      );

      logger.info({ jobId: job.id, name: job.name }, "Jobs queued");
    } catch (error) {
      logger.error(
        { jobId: job.id, name: job.name, error: String(error) },
        "Error enqueuing or updating job",
      );

      // Revert state back to ACTIVE so that it can be retried on next poll
      try {
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "ACTIVE",
          },
        });
      } catch (revertError) {
        logger.error(
          { jobId: job.id, error: String(revertError) },
          "Failed to revert status back to ACTIVE",
        );
      }
    }
  }
}
