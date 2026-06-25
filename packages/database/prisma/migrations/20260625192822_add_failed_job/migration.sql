/*
  Warnings:

  - You are about to drop the column `error` on the `FailedJob` table. All the data in the column will be lost.
  - You are about to drop the column `retryCount` on the `FailedJob` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `JobRun` table. All the data in the column will be lost.
  - Added the required column `payload` to the `FailedJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `FailedJob` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `JobRun` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `startedAt` on table `JobRun` required. This step will fail if there are existing NULL values in that column.
  - Made the column `attempts` on table `JobRun` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FailedJob" DROP COLUMN "error",
DROP COLUMN "retryCount",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "payload" JSONB NOT NULL,
ADD COLUMN     "reason" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "JobRun" DROP COLUMN "completedAt",
DROP COLUMN "status",
ADD COLUMN     "status" "JobRunStatus" NOT NULL,
ALTER COLUMN "startedAt" SET NOT NULL,
ALTER COLUMN "startedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "attempts" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "FailedJob" ADD CONSTRAINT "FailedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
