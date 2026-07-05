-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "stripePaymentId" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'usd';

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_stripePaymentId_key" ON "Transaction"("stripePaymentId");
