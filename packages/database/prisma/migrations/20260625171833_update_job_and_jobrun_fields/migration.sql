-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "JobRun" ADD COLUMN     "attempts" INTEGER DEFAULT 1,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "workerId" TEXT;
