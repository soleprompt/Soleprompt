-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('x');

-- CreateEnum
CREATE TYPE "SocialPostStatus" AS ENUM ('draft', 'approved', 'scheduled', 'posted', 'failed');

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL DEFAULT 'x',
    "content" TEXT NOT NULL,
    "status" "SocialPostStatus" NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "xPostId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialPost_status_scheduledAt_idx" ON "SocialPost"("status", "scheduledAt");
