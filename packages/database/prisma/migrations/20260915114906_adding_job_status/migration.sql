/*
  Warnings:

  - You are about to drop the column `active` on the `Job` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Job` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobRunCategory" AS ENUM ('CRON', 'ONCE', 'DELAYED');

-- DropIndex
DROP INDEX "Job_active_nextRunAt_idx";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "active",
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "type",
ADD COLUMN     "type" "JobRunCategory" NOT NULL;

-- DropEnum
DROP TYPE "jobruncategory";

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "FailedJob_jobId_idx" ON "FailedJob"("jobId");

-- CreateIndex
CREATE INDEX "Job_status_nextRunAt_idx" ON "Job"("status", "nextRunAt");

-- CreateIndex
CREATE INDEX "JobRun_jobId_idx" ON "JobRun"("jobId");

-- CreateIndex
CREATE INDEX "JobRun_status_idx" ON "JobRun"("status");
