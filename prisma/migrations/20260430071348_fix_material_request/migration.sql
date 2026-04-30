/*
  Warnings:

  - You are about to drop the column `quantity` on the `MaterialRequest` table. All the data in the column will be lost.
  - You are about to drop the column `requestDate` on the `MaterialRequest` table. All the data in the column will be lost.
  - Added the required column `plannedQty` to the `MaterialRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."MaterialRequest" DROP COLUMN "quantity",
DROP COLUMN "requestDate",
ADD COLUMN     "availableQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "plannedQty" INTEGER NOT NULL,
ADD COLUMN     "requiredDate" TIMESTAMP(3);
