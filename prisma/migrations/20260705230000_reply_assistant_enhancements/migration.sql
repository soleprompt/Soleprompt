-- AlterTable
ALTER TABLE "SocialReply" ADD COLUMN "postSummary" TEXT;
ALTER TABLE "SocialReply" ADD COLUMN "replyStyle" TEXT;
ALTER TABLE "SocialReply" ADD COLUMN "parentBatchId" TEXT;
ALTER TABLE "SocialReply" ADD COLUMN "likeCount" INTEGER;
ALTER TABLE "SocialReply" ADD COLUMN "impressionCount" INTEGER;
ALTER TABLE "SocialReply" ADD COLUMN "replyCount" INTEGER;
ALTER TABLE "SocialReply" ADD COLUMN "profileVisitCount" INTEGER;
ALTER TABLE "SocialReply" ADD COLUMN "followerGain" INTEGER;
ALTER TABLE "SocialReply" ADD COLUMN "metricsFetchedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "SocialReply_parentBatchId_idx" ON "SocialReply"("parentBatchId");
