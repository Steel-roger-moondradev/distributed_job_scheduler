/*
  Warnings:

  - The `status` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `attempts` to the `FailedJob` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED');

-- AlterTable
ALTER TABLE "FailedJob" ADD COLUMN     "attempts" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "status",
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE';
