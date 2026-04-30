-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EXECUTIVE', 'PROJECT_MANAGER', 'ENGINEER', 'FINANCE', 'PROCUREMENT', 'QAQC', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."HealthStatus" AS ENUM ('ON_TRACK', 'AT_RISK', 'DELAYED', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."TenderStage" AS ENUM ('ENQUIRY', 'INTERNAL_REVIEW', 'COSTING', 'RISK_REVIEW', 'APPROVAL_PENDING', 'APPROVED_TO_BID', 'SUBMITTED', 'AWARDED', 'LOST', 'CANCELLED', 'NO_BID');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'ENGINEER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "portfolio" TEXT NOT NULL,
    "projectManagerId" TEXT,
    "contractValue" DECIMAL(18,2),
    "completionPct" INTEGER NOT NULL DEFAULT 0,
    "plannedProgress" INTEGER NOT NULL DEFAULT 0,
    "actualProgress" INTEGER NOT NULL DEFAULT 0,
    "healthStatus" "public"."HealthStatus" NOT NULL DEFAULT 'ON_TRACK',
    "plannedStart" TIMESTAMP(3),
    "plannedFinish" TIMESTAMP(3),
    "forecastFinish" TIMESTAMP(3),
    "status" "public"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tender" (
    "id" TEXT NOT NULL,
    "refNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "source" TEXT,
    "estimatedValue" DECIMAL(18,2),
    "bidValue" DECIMAL(18,2),
    "stage" "public"."TenderStage" NOT NULL DEFAULT 'ENQUIRY',
    "submissionDeadline" TIMESTAMP(3),
    "projectId" TEXT,
    "owner" TEXT,
    "riskScore" INTEGER,
    "marginPct" DECIMAL(5,2),
    "status" "public"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanningDocument" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "revision" TEXT NOT NULL,
    "planType" TEXT NOT NULL DEFAULT 'BASELINE',
    "baselineStart" TIMESTAMP(3),
    "baselineFinish" TIMESTAMP(3),
    "forecastFinish" TIMESTAMP(3),
    "status" "public"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanningDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanningActivity" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "documentId" TEXT,
    "wbsCode" TEXT,
    "activityId" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "discipline" TEXT,
    "location" TEXT,
    "durationDays" INTEGER,
    "plannedStart" TIMESTAMP(3),
    "plannedFinish" TIMESTAMP(3),
    "actualStart" TIMESTAMP(3),
    "actualFinish" TIMESTAMP(3),
    "floatDays" INTEGER,
    "percentComplete" INTEGER NOT NULL DEFAULT 0,
    "owner" TEXT,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "healthStatus" "public"."HealthStatus" NOT NULL DEFAULT 'ON_TRACK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanningActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanningMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "documentId" TEXT,
    "milestoneCode" TEXT,
    "milestoneName" TEXT NOT NULL,
    "baselineDate" TIMESTAMP(3),
    "forecastDate" TIMESTAMP(3),
    "actualDate" TIMESTAMP(3),
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "linkedActivity" TEXT,
    "healthStatus" "public"."HealthStatus" NOT NULL DEFAULT 'ON_TRACK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanningMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanningResource" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "documentId" TEXT,
    "activityId" TEXT,
    "resourceRole" TEXT NOT NULL,
    "resourceName" TEXT,
    "plannedQty" INTEGER NOT NULL DEFAULT 0,
    "availableQty" INTEGER NOT NULL DEFAULT 0,
    "requiredDate" TIMESTAMP(3),
    "healthStatus" "public"."HealthStatus" NOT NULL DEFAULT 'ON_TRACK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanningResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Inspection" (
    "id" TEXT NOT NULL,
    "refNo" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "inspectionType" TEXT,
    "inspectorName" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "outcome" TEXT,
    "healthStatus" "public"."HealthStatus" NOT NULL DEFAULT 'ON_TRACK',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ncr" (
    "id" TEXT NOT NULL,
    "refNo" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "packageName" TEXT,
    "raisedBy" TEXT,
    "severity" TEXT,
    "healthStatus" "public"."HealthStatus" NOT NULL DEFAULT 'AT_RISK',
    "dateRaised" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ncr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MaterialRequest" (
    "id" TEXT NOT NULL,
    "refNo" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "quantity" TEXT,
    "requestedBy" TEXT,
    "priority" TEXT,
    "healthStatus" "public"."HealthStatus" NOT NULL DEFAULT 'ON_TRACK',
    "requestDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PurchaseOrder" (
    "id" TEXT NOT NULL,
    "refNo" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "amount" DECIMAL(18,2),
    "issuedAt" TIMESTAMP(3),
    "expectedDelivery" TIMESTAMP(3),
    "healthStatus" "public"."HealthStatus" NOT NULL DEFAULT 'ON_TRACK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "assetCode" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "location" TEXT,
    "healthStatus" "public"."HealthStatus" NOT NULL DEFAULT 'ON_TRACK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "public"."Project"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Tender_refNo_key" ON "public"."Tender"("refNo");

-- CreateIndex
CREATE INDEX "PlanningActivity_projectId_idx" ON "public"."PlanningActivity"("projectId");

-- CreateIndex
CREATE INDEX "PlanningActivity_activityId_idx" ON "public"."PlanningActivity"("activityId");

-- CreateIndex
CREATE INDEX "PlanningActivity_wbsCode_idx" ON "public"."PlanningActivity"("wbsCode");

-- CreateIndex
CREATE UNIQUE INDEX "PlanningActivity_projectId_activityId_key" ON "public"."PlanningActivity"("projectId", "activityId");

-- CreateIndex
CREATE INDEX "PlanningMilestone_projectId_idx" ON "public"."PlanningMilestone"("projectId");

-- CreateIndex
CREATE INDEX "PlanningResource_projectId_idx" ON "public"."PlanningResource"("projectId");

-- CreateIndex
CREATE INDEX "PlanningResource_activityId_idx" ON "public"."PlanningResource"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_refNo_key" ON "public"."Inspection"("refNo");

-- CreateIndex
CREATE UNIQUE INDEX "Ncr_refNo_key" ON "public"."Ncr"("refNo");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialRequest_refNo_key" ON "public"."MaterialRequest"("refNo");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_refNo_key" ON "public"."PurchaseOrder"("refNo");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetCode_key" ON "public"."Asset"("assetCode");

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tender" ADD CONSTRAINT "Tender_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanningActivity" ADD CONSTRAINT "PlanningActivity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanningActivity" ADD CONSTRAINT "PlanningActivity_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."PlanningDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanningMilestone" ADD CONSTRAINT "PlanningMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanningMilestone" ADD CONSTRAINT "PlanningMilestone_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."PlanningDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanningResource" ADD CONSTRAINT "PlanningResource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanningResource" ADD CONSTRAINT "PlanningResource_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."PlanningDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inspection" ADD CONSTRAINT "Inspection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ncr" ADD CONSTRAINT "Ncr_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MaterialRequest" ADD CONSTRAINT "MaterialRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
