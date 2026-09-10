-- DropIndex
DROP INDEX "JobRun_jobId_key";

-- AlterTable
ALTER TABLE "JobRun" ADD COLUMN     "result" JSONB;
