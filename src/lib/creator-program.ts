import { prisma } from "@/lib/db";
import { effectiveCreatorShare } from "@/lib/commissions";
import type { CreatorStatus, PayoutKind, PayoutStatus } from "@/generated/prisma/client";

export const CREATOR_PRICE_PRESETS = [
  { label: "Free", value: 0 },
  { label: "$2.99", value: 2.99 },
  { label: "$4.99", value: 4.99 },
  { label: "$9.99", value: 9.99 },
  { label: "$19.99", value: 19.99 },
  { label: "$29.99", value: 29.99 },
] as const;

export const SUPPORTED_AI_MODELS = [
  "ChatGPT",
  "GPT-4o",
  "Claude",
  "Claude 3.5 Sonnet",
  "Gemini",
  "Gemini 2.0",
  "Cursor",
] as const;

export async function getCreatorProfile(userId: string) {
  return prisma.sellerProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, username: true, email: true, role: true } },
    },
  });
}

export async function getCreatorEarnings(userId: string) {
  const [transactions, payoutRequests, settings] = await Promise.all([
    prisma.transaction.findMany({
      where: { sellerId: userId, status: "completed" },
      select: { amount: true, creatorShare: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payoutRequest.findMany({
      where: { userId, kind: "creator" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.platformSettings.findUnique({ where: { id: "default" } }),
  ]);

  const lifetimeEarnings = transactions.reduce(
    (sum, tx) => sum + effectiveCreatorShare(tx),
    0,
  );

  const reserved = payoutRequests
    .filter((p) => p.status === "pending" || p.status === "approved")
    .reduce((sum, p) => sum + p.amount, 0);

  const paidOut = payoutRequests
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const availableBalance = Math.max(0, lifetimeEarnings - reserved - paidOut);
  const minPayout = settings?.minPayoutAmount ?? 25;

  return {
    lifetimeEarnings,
    availableBalance,
    pending: reserved,
    paidOut,
    minPayoutAmount: minPayout,
    creatorCommissionPercent: settings?.creatorCommissionPercent ?? 70,
    payouts: payoutRequests.map((p) => ({
      id: p.id,
      amount: p.amount,
      date: p.createdAt.toISOString(),
      status: mapPayoutStatus(p.status),
      method: p.payoutMethod ?? "—",
      note: p.note,
      adminNote: p.adminNote,
    })),
  };
}

function mapPayoutStatus(
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

export async function getAdminCreators() {
  return prisma.sellerProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { prompts: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateCreatorStatus(
  userId: string,
  creatorStatus: CreatorStatus,
) {
  return prisma.sellerProfile.update({
    where: { userId },
    data: { creatorStatus },
  });
}

export async function verifyCreator(userId: string, verified: boolean) {
  return prisma.sellerProfile.update({
    where: { userId },
    data: {
      verified,
      verifiedAt: verified ? new Date() : null,
    },
  });
}

export async function getAdminPayoutRequests(kind?: PayoutKind) {
  return prisma.payoutRequest.findMany({
    where: kind ? { kind } : undefined,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          sellerProfile: { select: { displayName: true } },
          affiliate: { select: { code: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
