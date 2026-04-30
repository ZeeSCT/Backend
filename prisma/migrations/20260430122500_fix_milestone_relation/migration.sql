/*
  Warnings:

  - You are about to drop the column `linkedActivity` on the `PlanningMilestone` table. All the data in the column will be lost.
  - You are about to drop the column `actualProgress` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `plannedProgress` on the `Project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."MilestoneStatus" AS ENUM ('PENDING', 'COMPLETED', 'BLOCKED');

-- AlterTable
ALTER TABLE "public"."PlanningMilestone" DROP COLUMN "linkedActivity";

-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "actualProgress",
DROP COLUMN "plannedProgress";
