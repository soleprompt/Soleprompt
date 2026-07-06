-- CreateTable
CREATE TABLE "EngageTargetAccount" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "xUserId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngageTargetAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagePost" (
    "id" TEXT NOT NULL,
    "targetAccountId" TEXT NOT NULL,
    "xTweetId" TEXT NOT NULL,
    "authorUsername" TEXT NOT NULL,
    "tweetText" TEXT NOT NULL,
    "tweetUrl" TEXT NOT NULL,
    "tweetedAt" TIMESTAMP(3) NOT NULL,
    "relevanceScore" INTEGER NOT NULL DEFAULT 0,
    "matchedTopics" TEXT[],
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "retweetCount" INTEGER NOT NULL DEFAULT 0,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngageReplyDraft" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "SocialPostStatus" NOT NULL DEFAULT 'draft',
    "includesLink" BOOLEAN NOT NULL DEFAULT false,
    "taglineKey" TEXT,
    "postedAt" TIMESTAMP(3),
    "xReplyId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngageReplyDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EngageTargetAccount_username_key" ON "EngageTargetAccount"("username");

-- CreateIndex
CREATE UNIQUE INDEX "EngagePost_xTweetId_key" ON "EngagePost"("xTweetId");

-- CreateIndex
CREATE INDEX "EngagePost_targetAccountId_tweetedAt_idx" ON "EngagePost"("targetAccountId", "tweetedAt");

-- CreateIndex
CREATE INDEX "EngagePost_relevanceScore_idx" ON "EngagePost"("relevanceScore");

-- CreateIndex
CREATE INDEX "EngageReplyDraft_postId_idx" ON "EngageReplyDraft"("postId");

-- CreateIndex
CREATE INDEX "EngageReplyDraft_status_idx" ON "EngageReplyDraft"("status");

-- AddForeignKey
ALTER TABLE "EngagePost" ADD CONSTRAINT "EngagePost_targetAccountId_fkey" FOREIGN KEY ("targetAccountId") REFERENCES "EngageTargetAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngageReplyDraft" ADD CONSTRAINT "EngageReplyDraft_postId_fkey" FOREIGN KEY ("postId") REFERENCES "EngagePost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
