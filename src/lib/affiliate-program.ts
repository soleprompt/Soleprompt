import { prisma } from "@/lib/db";
import type { AffiliateStatus, PayoutStatus } from "@/generated/prisma/client";

export const REFERRAL_COOKIE_NAME = "sp_affiliate";
export const REFERRAL_QUERY_PARAM = "ref";

export function buildAffiliateCode(username: string): string {
  const base = username.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
  return `SOLE-${base || "PARTNER"}`;
}

export async function getAffiliateByUserId(userId: string) {
  return prisma.affiliate.findUnique({
    where: { userId },
    include: {
      user: { select: { username: true, email: true } },
    },
  });
}

export async function getAffiliateByCode(code: string) {
  return prisma.affiliate.findFirst({
    where: {
      code: { equals: code, mode: "insensitive" },
      status: "approved",
    },
  });
}

export async function getAffiliateDashboard(userId: string) {
  const affiliate = await getAffiliateByUserId(userId);
  if (!affiliate) return null;

  const [recentClicks, recentReferrals, payoutRequests, settings] =
    await Promise.all([
      prisma.referralClick.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.affiliateReferral.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          transaction: {
            select: {
              amount: true,
              prompt: { select: { title: true } },
            },
          },
        },
      }),
      prisma.payoutRequest.findMany({
        where: { userId, kind: "affiliate" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.platformSettings.findUnique({ where: { id: "default" } }),
    ]);

  const reserved = payoutRequests
    .filter((p) => p.status === "pending" || p.status === "approved")
    .reduce((sum, p) => sum + p.amount, 0);

  const availableBalance = Math.max(0, affiliate.pendingBalance - reserved);

  return {
    affiliate,
    referralLink: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://getsoleprompt.com"}?${REFERRAL_QUERY_PARAM}=${affiliate.code}`,
    recentClicks,
    recentReferrals,
    payoutRequests,
    availableBalance,
    minPayoutAmount: settings?.minPayoutAmount ?? 25,
    commissionPercent: settings?.affiliateCommissionPercent ?? 10,
  };
}

export async function getAffiliateLeaderboard(limit = 10) {
  return prisma.affiliate.findMany({
    where: { status: "approved" },
    orderBy: [{ totalEarnings: "desc" }, { totalConversions: "desc" }],
    take: limit,
    include: {
      user: { select: { username: true } },
    },
  });
}

export async function getAdminAffiliates() {
  return prisma.affiliate.findMany({
    include: {
      user: { select: { id: true, username: true, email: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateAffiliateStatus(
  affiliateId: string,
  status: AffiliateStatus,
) {
  return prisma.affiliate.update({
    where: { id: affiliateId },
    data: { status },
  });
}

export async function recordReferralClick(
  code: string,
  landingPath?: string,
) {
  const affiliate = await getAffiliateByCode(code);
  if (!affiliate) return null;

  await prisma.$transaction([
    prisma.referralClick.create({
      data: {
        affiliateId: affiliate.id,
        landingPath,
        referrerCode: code,
      },
    }),
    prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { totalClicks: { increment: 1 } },
    }),
  ]);

  return affiliate;
}

export function mapAffiliatePayoutStatus(
  status: PayoutStatus,
): "paid" | "processing" | "failed" {
  switch (status) {
    case "paid":
      return "paid";
    case "pending":
    case "approved":
      return "processing";
    default:
      return "failed";
  }
}
