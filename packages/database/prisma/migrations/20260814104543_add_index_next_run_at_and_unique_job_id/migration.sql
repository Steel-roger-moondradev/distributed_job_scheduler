/*
  Warnings:

  - A unique constraint covering the columns `[jobId]` on the table `JobRun` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "JobRun_jobId_attempts_key";

-- CreateIndex
CREATE INDEX "Job_nextRunAt_idx" ON "Job"("nextRunAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobRun_jobId_key" ON "JobRun"("jobId");
