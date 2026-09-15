/*
  Warnings:

  - You are about to drop the column `status` on the `Job` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "JobRunStatus" ADD VALUE 'CLAIMED';

-- DropIndex
DROP INDEX "Job_nextRunAt_idx";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "status";

-- DropEnum
DROP TYPE "JobStatus";

-- CreateIndex
CREATE INDEX "Job_active_nextRunAt_idx" ON "Job"("active", "nextRunAt");
