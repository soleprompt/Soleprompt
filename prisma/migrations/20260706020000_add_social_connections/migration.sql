-- Extend SocialPlatform for buyer social tools
ALTER TYPE "SocialPlatform" ADD VALUE 'facebook';
ALTER TYPE "SocialPlatform" ADD VALUE 'instagram';
ALTER TYPE "SocialPlatform" ADD VALUE 'linkedin';

-- CreateTable
CREATE TABLE "SocialConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "displayName" TEXT NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialConnection_connectedAt_idx" ON "SocialConnection"("connectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SocialConnection_userId_platform_key" ON "SocialConnection"("userId", "platform");

-- AddForeignKey
ALTER TABLE "SocialConnection" ADD CONSTRAINT "SocialConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
