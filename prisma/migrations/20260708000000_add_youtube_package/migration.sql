-- CreateTable
CREATE TABLE "YouTubePackage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "niche" TEXT,
    "videoType" TEXT NOT NULL,
    "tone" TEXT,
    "titles" JSONB NOT NULL,
    "script" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "mainSections" JSONB NOT NULL,
    "outro" TEXT NOT NULL,
    "callToAction" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "thumbnailIdeas" JSONB NOT NULL,
    "pinnedComment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouTubePackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YouTubePackage_userId_createdAt_idx" ON "YouTubePackage"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "YouTubePackage" ADD CONSTRAINT "YouTubePackage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
