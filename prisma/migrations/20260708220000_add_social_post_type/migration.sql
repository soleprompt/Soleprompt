-- CreateEnum
CREATE TYPE "SocialPostType" AS ENUM ('original', 'demo_video', 'customer_win', 'ai_tip', 'youtube_example');

-- AlterTable
ALTER TABLE "SocialPost" ADD COLUMN "postType" "SocialPostType" NOT NULL DEFAULT 'original';

-- CreateIndex
CREATE INDEX "SocialPost_postType_createdAt_idx" ON "SocialPost"("postType", "createdAt");
