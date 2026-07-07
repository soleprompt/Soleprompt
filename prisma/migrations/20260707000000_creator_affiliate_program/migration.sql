-- Creator marketplace + affiliate program

CREATE TYPE "CreatorStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE "AffiliateStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'approved', 'paid', 'rejected');
CREATE TYPE "PayoutKind" AS ENUM ('creator', 'affiliate');

ALTER TABLE "SellerProfile"
  ADD COLUMN "creatorStatus" "CreatorStatus" NOT NULL DEFAULT 'approved',
  ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "verifiedAt" TIMESTAMP(3),
  ADD COLUMN "payoutEmail" TEXT,
  ADD COLUMN "payoutMethod" TEXT;

ALTER TABLE "Transaction"
  ADD COLUMN "creatorShare" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "affiliateCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "affiliateId" TEXT,
  ADD COLUMN "referralCode" TEXT;

CREATE TABLE "PlatformSettings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "creatorCommissionPercent" DOUBLE PRECISION NOT NULL DEFAULT 70,
  "affiliateCommissionPercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "minPayoutAmount" DOUBLE PRECISION NOT NULL DEFAULT 25,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "PlatformSettings" ("id", "creatorCommissionPercent", "affiliateCommissionPercent", "minPayoutAmount", "updatedAt")
VALUES ('default', 70, 10, 25, CURRENT_TIMESTAMP);

CREATE TABLE "PayoutRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind" "PayoutKind" NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
  "payoutEmail" TEXT,
  "payoutMethod" TEXT,
  "note" TEXT,
  "adminNote" TEXT,
  "processedAt" TIMESTAMP(3),
  "processedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Affiliate" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "status" "AffiliateStatus" NOT NULL DEFAULT 'pending',
  "totalClicks" INTEGER NOT NULL DEFAULT 0,
  "totalConversions" INTEGER NOT NULL DEFAULT 0,
  "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "paidBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "payoutEmail" TEXT,
  "payoutMethod" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReferralClick" (
  "id" TEXT NOT NULL,
  "affiliateId" TEXT NOT NULL,
  "landingPath" TEXT,
  "referrerCode" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReferralClick_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AffiliateReferral" (
  "id" TEXT NOT NULL,
  "affiliateId" TEXT NOT NULL,
  "transactionId" TEXT,
  "purchaseId" TEXT,
  "commission" DOUBLE PRECISION NOT NULL,
  "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliateReferral_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Affiliate_userId_key" ON "Affiliate"("userId");
CREATE UNIQUE INDEX "Affiliate_code_key" ON "Affiliate"("code");
CREATE UNIQUE INDEX "AffiliateReferral_transactionId_key" ON "AffiliateReferral"("transactionId");

CREATE INDEX "PayoutRequest_userId_kind_status_idx" ON "PayoutRequest"("userId", "kind", "status");
CREATE INDEX "PayoutRequest_status_createdAt_idx" ON "PayoutRequest"("status", "createdAt");
CREATE INDEX "ReferralClick_affiliateId_createdAt_idx" ON "ReferralClick"("affiliateId", "createdAt");
CREATE INDEX "AffiliateReferral_affiliateId_createdAt_idx" ON "AffiliateReferral"("affiliateId", "createdAt");
CREATE INDEX "Transaction_affiliateId_createdAt_idx" ON "Transaction"("affiliateId", "createdAt");

ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_affiliateId_fkey"
  FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PayoutRequest"
  ADD CONSTRAINT "PayoutRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Affiliate"
  ADD CONSTRAINT "Affiliate_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReferralClick"
  ADD CONSTRAINT "ReferralClick_affiliateId_fkey"
  FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AffiliateReferral"
  ADD CONSTRAINT "AffiliateReferral_affiliateId_fkey"
  FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AffiliateReferral"
  ADD CONSTRAINT "AffiliateReferral_transactionId_fkey"
  FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill commission splits on existing paid transactions
UPDATE "Transaction"
SET
  "creatorShare" = ROUND("amount" * 0.70::numeric, 2),
  "platformFee" = ROUND("amount" * 0.30::numeric, 2)
WHERE "amount" > 0 AND "creatorShare" = 0;
