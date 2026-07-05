-- CreateTable
CREATE TABLE "SocialReply" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL DEFAULT 'x',
    "targetTweetId" TEXT NOT NULL,
    "targetTweetUrl" TEXT,
    "targetAuthor" TEXT,
    "targetSnippet" TEXT,
    "content" TEXT NOT NULL,
    "status" "SocialPostStatus" NOT NULL DEFAULT 'draft',
    "includesLink" BOOLEAN NOT NULL DEFAULT false,
    "taglineKey" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "xReplyId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialReply_status_scheduledAt_idx" ON "SocialReply"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "SocialReply_targetTweetId_idx" ON "SocialReply"("targetTweetId");

-- CreateIndex
CREATE INDEX "SocialReply_taglineKey_idx" ON "SocialReply"("taglineKey");
