-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM (
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED'
);

-- DropIndex
DROP INDEX IF EXISTS "Job_active_nextRunAt_idx";

-- AlterTable
ALTER TABLE "Job"
DROP COLUMN "active",
ADD COLUMN "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Job_status_nextRunAt_idx"
ON "Job"("status", "nextRunAt");