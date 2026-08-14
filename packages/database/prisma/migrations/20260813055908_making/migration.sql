/*
  Warnings:

  - A unique constraint covering the columns `[jobId,attempts]` on the table `JobRun` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "JobRun_jobId_attempts_key" ON "JobRun"("jobId", "attempts");
