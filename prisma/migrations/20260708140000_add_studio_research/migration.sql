-- CreateEnum
CREATE TYPE "StudioResearchStatus" AS ENUM ('queued', 'researching', 'completed', 'failed');

-- CreateTable
CREATE TABLE "StudioResearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "topic" TEXT NOT NULL,
    "niche" TEXT,
    "videoType" TEXT,
    "tone" TEXT,
    "status" "StudioResearchStatus" NOT NULL DEFAULT 'queued',
    "error" TEXT,
    "targetAudience" TEXT,
    "searchIntent" TEXT,
    "competitorChannels" JSONB,
    "trendingVideoAngles" JSONB,
    "viralHooks" JSONB,
    "keywordClusters" JSONB,
    "longTailKeywords" JSONB,
    "questionsPeopleAsk" JSONB,
    "emotionalTriggers" JSONB,
    "thumbnailPsychology" JSONB,
    "viewerObjections" JSONB,
    "retentionOpportunities" JSONB,
    "suggestedCta" TEXT,
    "monetizationIdeas" JSONB,
    "affiliateOpportunities" JSONB,
    "provider" TEXT,
    "model" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioResearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudioResearch_projectId_key" ON "StudioResearch"("projectId");

-- CreateIndex
CREATE INDEX "StudioResearch_userId_createdAt_idx" ON "StudioResearch"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StudioResearch_status_createdAt_idx" ON "StudioResearch"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "StudioResearch" ADD CONSTRAINT "StudioResearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioResearch" ADD CONSTRAINT "StudioResearch_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
