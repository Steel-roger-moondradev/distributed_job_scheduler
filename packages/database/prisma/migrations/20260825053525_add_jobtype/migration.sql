/*
  Warnings:

  - Added the required column `jobtype` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Job` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "jobruncategory" AS ENUM ('CRON', 'ONCE', 'DELAYED');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "jobtype" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "jobruncategory" NOT NULL;
