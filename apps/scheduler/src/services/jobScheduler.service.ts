import { prisma } from "database";
import { jobQueue } from "shared";
import { logger } from "observability";

export async function scheduleDueJobs(): Promise<void> {
  const now = new Date();

  logger.info({ now: now.toISOString() }, "Current time");

  let duejobs;

  try {
    duejobs = await prisma.job.findMany({
      where: {
        active: true,
        nextRunAt: {
          lte: now,
        },
        status: "ACTIVE",
      },
    });
  } catch (error) {
    logger.error(error, "Error fetching due jobs from database");
    return;
  }

  logger.info(
    {
      dueJobs: duejobs.length,
    },
    "Due jobs",
  );

  for (const job of duejobs) {
    try {
      await prisma.job.update({
        where: {
          id: job.id,
        },
        data: {
          status: "QUEUED",
        },
      });

      const executionId = `${job.id}-${job.nextRunAt!.getTime()}`;

      const bullJob = await jobQueue.add(
        "execute-job",
        {
          jobId: job.id,
          executionId,
        },
        {
          priority: job.priority,
        },
      );

      logger.info(
        {
          bullJobId: bullJob.id,
          queueName: bullJob.queueName,
          data: bullJob.data,
          priority: job.priority,
        },
        "BullMQ job created",
      );

      logger.info(
        {
          jobId: job.id,
          name: job.name,
          executionId,
        },
        "Job queued",
      );
    } catch (error) {
      logger.error(
        {
          jobId: job.id,
          name: job.name,
          error: String(error),
        },
        "Error enqueuing job",
      );

      try {
        await prisma.job.update({
          where: {
            id: job.id,
          },
          data: {
            status: "ACTIVE",
          },
        });
      } catch (revertError) {
        logger.error(
          {
            jobId: job.id,
            error: String(revertError),
          },
          "Failed to revert job status",
        );
      }
    }
  }
}
