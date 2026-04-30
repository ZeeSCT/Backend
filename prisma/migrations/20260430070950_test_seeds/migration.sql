-- CreateTable
CREATE TABLE "public"."ProjectHealthHistory" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "oldStatus" "public"."HealthStatus",
    "newStatus" "public"."HealthStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectHealthHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectHealthHistory_projectId_idx" ON "public"."ProjectHealthHistory"("projectId");

-- CreateIndex
CREATE INDEX "ProjectHealthHistory_changedAt_idx" ON "public"."ProjectHealthHistory"("changedAt");

-- AddForeignKey
ALTER TABLE "public"."ProjectHealthHistory" ADD CONSTRAINT "ProjectHealthHistory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
