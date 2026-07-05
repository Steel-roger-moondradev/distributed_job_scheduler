-- DropForeignKey
ALTER TABLE "JobRun" DROP CONSTRAINT "JobRun_jobId_fkey";

-- AddForeignKey
ALTER TABLE "JobRun" ADD CONSTRAINT "JobRun_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
