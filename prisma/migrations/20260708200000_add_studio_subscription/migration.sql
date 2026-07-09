-- CreateEnum
CREATE TYPE "StudioSubscriptionTier" AS ENUM ('free', 'creator', 'pro', 'agency');

-- CreateEnum
CREATE TYPE "StudioSubscriptionStatus" AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');

-- CreateTable
CREATE TABLE "StudioSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "StudioSubscriptionTier" NOT NULL DEFAULT 'free',
    "status" "StudioSubscriptionStatus" NOT NULL DEFAULT 'active',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudioSubscription_userId_key" ON "StudioSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudioSubscription_stripeCustomerId_key" ON "StudioSubscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "StudioSubscription_stripeSubscriptionId_key" ON "StudioSubscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "StudioSubscription_stripeCustomerId_idx" ON "StudioSubscription"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "StudioSubscription_status_idx" ON "StudioSubscription"("status");

-- AddForeignKey
ALTER TABLE "StudioSubscription" ADD CONSTRAINT "StudioSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
