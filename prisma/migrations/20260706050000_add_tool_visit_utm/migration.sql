-- AlterTable
ALTER TABLE "ToolVisit" ADD COLUMN "utmSource" TEXT,
ADD COLUMN "utmCampaign" TEXT;

-- CreateIndex
CREATE INDEX "ToolVisit_utmSource_visitedAt_idx" ON "ToolVisit"("utmSource", "visitedAt");
