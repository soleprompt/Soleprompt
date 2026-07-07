import { prisma } from "@/lib/db";

export type CommissionSplit = {
  creatorShare: number;
  platformFee: number;
  affiliateCommission: number;
  creatorPercent: number;
  affiliatePercent: number;
};

const DEFAULT_SETTINGS = {
  creatorCommissionPercent: 70,
  affiliateCommissionPercent: 10,
  minPayoutAmount: 25,
};

export async function getPlatformSettings() {
  const settings = await prisma.platformSettings.findUnique({
    where: { id: "default" },
  });

  return settings ?? {
    id: "default",
    ...DEFAULT_SETTINGS,
    updatedAt: new Date(),
  };
}

export function calculateCommissionSplit(
  amount: number,
  settings: {
    creatorCommissionPercent: number;
    affiliateCommissionPercent: number;
  },
  hasAffiliate: boolean,
): CommissionSplit {
  if (amount <= 0) {
    return {
      creatorShare: 0,
      platformFee: 0,
      affiliateCommission: 0,
      creatorPercent: settings.creatorCommissionPercent,
      affiliatePercent: hasAffiliate ? settings.affiliateCommissionPercent : 0,
    };
  }

  const creatorShare = roundMoney(
    amount * (settings.creatorCommissionPercent / 100),
  );
  const affiliateCommission = hasAffiliate
    ? roundMoney(amount * (settings.affiliateCommissionPercent / 100))
    : 0;
  const platformFee = roundMoney(amount - creatorShare - affiliateCommission);

  return {
    creatorShare,
    platformFee,
    affiliateCommission,
    creatorPercent: settings.creatorCommissionPercent,
    affiliatePercent: hasAffiliate ? settings.affiliateCommissionPercent : 0,
  };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function effectiveCreatorShare(transaction: {
  amount: number;
  creatorShare: number;
}): number {
  if (transaction.amount <= 0) return 0;
  if (transaction.creatorShare > 0) return transaction.creatorShare;
  return roundMoney(transaction.amount * 0.7);
}
