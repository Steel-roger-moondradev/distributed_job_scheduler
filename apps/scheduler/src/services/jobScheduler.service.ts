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

  let allJobs;
  try {
  allJobs = await prisma.job.findMany();
  }
  catch (error) {
    logger.error(error, "Error fetching all jobs from database");
    return;
  }
  if(allJobs.length!=0) {
  logger.info(
    {
      totalJobs: allJobs.length,
    },
    "Total jobs in database",
  );

  logger.info(allJobs);
}

  // Find all active and due jobs
  const dueJobs = [];
  for(const job of allJobs) {
    if(job.active && job.nextRunAt && job.nextRunAt <= now) {
      dueJobs.push(job);
    }
  }
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
      //this executionId is used to identify the job execution uniquely in the worker
      //This prevents the worker from executing the same job multiple times if it is enqueued multiple times due to some error(idempotency)
      const executionId=`${job.id}-${job.nextRunAt!.getTime()}`;
      const bullJob = await jobQueue.add("execute-job", {
        jobId: job.id,
        executionId,
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
