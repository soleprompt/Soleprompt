import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { safeDbRead } from "@/lib/safe-db";
import type { PromptStatus, PurchaseStatus, UserRole } from "@/generated/prisma/client";

/** Purchases created via completePurchase / Stripe webhook (have a Transaction). */
export const livePurchaseWhere: Prisma.PurchaseWhereInput = {
  transaction: { isNot: null },
};

const liveUserWhere: Prisma.UserWhereInput = {
  NOT: { clerkUserId: { startsWith: "seed_" } },
};

export type PurchaseTypeFilter = "all" | "paid" | "free" | "refunded";
export type PurchasePeriodFilter = "all" | "today" | "7d" | "30d";

function buildPurchaseTypeWhere(type: PurchaseTypeFilter): Prisma.PurchaseWhereInput {
  switch (type) {
    case "paid":
      return { amount: { gt: 0 }, status: { not: "refunded" } };
    case "free":
      return { amount: { lte: 0 } };
    case "refunded":
      return { status: "refunded" };
    default:
      return {};
  }
}

function buildPurchasePeriodWhere(period: PurchasePeriodFilter): Prisma.PurchaseWhereInput {
  if (period === "all") return {};

  const now = new Date();
  let since: Date;

  if (period === "today") {
    since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "7d") {
    since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { createdAt: { gte: since } };
}

function buildLivePurchaseWhere(
  options?: {
    search?: string;
    status?: PurchaseStatus | "all";
    type?: PurchaseTypeFilter;
    period?: PurchasePeriodFilter;
  },
): Prisma.PurchaseWhereInput {
  const search = options?.search?.trim();
  const status =
    options?.status && options.status !== "all" ? options.status : undefined;

  return {
    ...livePurchaseWhere,
    ...(status ? { status } : {}),
    ...buildPurchaseTypeWhere(options?.type ?? "all"),
    ...buildPurchasePeriodWhere(options?.period ?? "all"),
    ...(search
      ? {
          OR: [
            { prompt: { title: { contains: search, mode: "insensitive" } } },
            { buyer: { email: { contains: search, mode: "insensitive" } } },
            { buyer: { username: { contains: search, mode: "insensitive" } } },
            {
              transaction: {
                stripeSessionId: { contains: search, mode: "insensitive" },
              },
            },
            {
              transaction: {
                stripePaymentId: { contains: search, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };
}

function buildRevenueChart(days: number) {
  const buckets: { label: string; value: number }[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    buckets.push({
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: 0,
    });
  }

  return buckets;
}

export async function getAdminOverviewStats() {
  return safeDbRead(
    {
      totalUsers: 0,
      grossRevenue: 0,
      netRevenue: 0,
      totalOrders: 0,
      promptsSold: 0,
      topSellers: [] as { name: string; sales: number; revenue: number }[],
      revenueLast30Days: buildRevenueChart(30),
      activePrompts: 0,
      pendingPrompts: 0,
      totalPurchases: 0,
      totalRevenue: 0,
      stripePayments: 0,
    },
    async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const completedLive = { ...livePurchaseWhere, status: "completed" as const };

      const [
        totalUsers,
        activePrompts,
        pendingPrompts,
        totalOrders,
        promptsSold,
        grossResult,
        refundedResult,
        stripePayments,
        recentPurchases,
        topSellerGroups,
      ] = await Promise.all([
        prisma.user.count({ where: liveUserWhere }),
        prisma.prompt.count({ where: { status: "published" } }),
        prisma.prompt.count({ where: { status: "review" } }),
        prisma.purchase.count({ where: completedLive }),
        prisma.purchase.count({
          where: { ...completedLive, amount: { gt: 0 } },
        }),
        prisma.purchase.aggregate({
          where: { ...completedLive, amount: { gt: 0 } },
          _sum: { amount: true },
        }),
        prisma.purchase.aggregate({
          where: { ...livePurchaseWhere, status: "refunded", amount: { gt: 0 } },
          _sum: { amount: true },
        }),
        prisma.transaction.count({
          where: {
            status: "completed",
            OR: [
              { stripeSessionId: { not: null } },
              { stripePaymentId: { not: null } },
            ],
          },
        }),
        prisma.purchase.findMany({
          where: {
            ...completedLive,
            amount: { gt: 0 },
            createdAt: { gte: thirtyDaysAgo },
          },
          select: { amount: true, createdAt: true },
        }),
        prisma.transaction.groupBy({
          by: ["sellerId"],
          where: { status: "completed", amount: { gt: 0 } },
          _sum: { amount: true },
          _count: { id: true },
          orderBy: { _sum: { amount: "desc" } },
          take: 5,
        }),
      ]);

      const grossRevenue = grossResult._sum.amount ?? 0;
      const refundedAmount = refundedResult._sum.amount ?? 0;
      const netRevenue = grossRevenue - refundedAmount;

      const revenueLast30Days = buildRevenueChart(30);
      for (const purchase of recentPurchases) {
        const dayStart = new Date(
          purchase.createdAt.getFullYear(),
          purchase.createdAt.getMonth(),
          purchase.createdAt.getDate(),
        );
        const todayStart = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
        );
        const dayIndex =
          29 -
          Math.round((todayStart.getTime() - dayStart.getTime()) / (24 * 60 * 60 * 1000));
        if (dayIndex >= 0 && dayIndex < 30) {
          revenueLast30Days[dayIndex].value += purchase.amount;
        }
      }

      const sellerIds = topSellerGroups.map((g) => g.sellerId);
      const sellers =
        sellerIds.length > 0
          ? await prisma.user.findMany({
              where: { id: { in: sellerIds } },
              include: { sellerProfile: { select: { displayName: true } } },
            })
          : [];
      const sellerById = new Map(sellers.map((s) => [s.id, s]));

      const topSellers = topSellerGroups.map((group) => {
        const seller = sellerById.get(group.sellerId);
        return {
          name:
            seller?.sellerProfile?.displayName ??
            seller?.username ??
            "Unknown seller",
          sales: group._count.id,
          revenue: group._sum.amount ?? 0,
        };
      });

      return {
        totalUsers,
        grossRevenue,
        netRevenue,
        totalOrders,
        promptsSold,
        topSellers,
        revenueLast30Days,
        activePrompts,
        pendingPrompts,
        totalPurchases: totalOrders,
        totalRevenue: netRevenue > 0 ? netRevenue : grossRevenue,
        stripePayments,
      };
    },
  );
}

export async function getAdminUsers(options?: {
  search?: string;
  role?: UserRole | "all";
}) {
  return safeDbRead([], async () => {
    const search = options?.search?.trim();
    const role = options?.role && options.role !== "all" ? options.role : undefined;

    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(search
          ? {
              OR: [
                { email: { contains: search, mode: "insensitive" } },
                { username: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        sellerProfile: { select: { salesCount: true, totalEarnings: true } },
        _count: { select: { purchases: true, prompts: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      purchases: user._count.purchases,
      prompts: user._count.prompts,
      salesCount: user.sellerProfile?.salesCount ?? 0,
      totalEarnings: user.sellerProfile?.totalEarnings ?? 0,
      createdAt: user.createdAt.toISOString(),
    }));
  });
}

export async function getAdminPrompts(options?: {
  search?: string;
  status?: PromptStatus | "all";
}) {
  return safeDbRead([], async () => {
    const search = options?.search?.trim();
    const status =
      options?.status && options.status !== "all" ? options.status : undefined;

    const prompts = await prisma.prompt.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { seller: { username: { contains: search, mode: "insensitive" } } },
                { seller: { email: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        seller: { include: { sellerProfile: true } },
        _count: { select: { purchases: true } },
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 100,
    });

    return prompts.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      price: prompt.price,
      status: prompt.status,
      category: prompt.category.name,
      seller:
        prompt.seller.sellerProfile?.displayName ?? prompt.seller.username,
      sellerEmail: prompt.seller.email,
      sales: prompt._count.purchases,
      updatedAt: prompt.updatedAt.toISOString(),
    }));
  });
}

function mapAdminPurchase(purchase: {
  id: string;
  amount: number;
  status: PurchaseStatus;
  createdAt: Date;
  prompt: { id: string; title: string; seller?: { username: string; email: string; sellerProfile?: { displayName: string | null } | null } };
  buyer: { username: string; email: string };
  transaction: {
    stripeSessionId: string | null;
    stripePaymentId: string | null;
    currency: string;
  } | null;
}) {
  const seller = purchase.prompt.seller;

  return {
    id: purchase.id,
    promptId: purchase.prompt.id,
    promptTitle: purchase.prompt.title,
    buyer: purchase.buyer.username,
    buyerEmail: purchase.buyer.email,
    seller: seller?.sellerProfile?.displayName ?? seller?.username ?? null,
    sellerEmail: seller?.email ?? null,
    amount: purchase.amount,
    status: purchase.status,
    stripeSessionId: purchase.transaction?.stripeSessionId ?? null,
    stripePaymentId: purchase.transaction?.stripePaymentId ?? null,
    currency: purchase.transaction?.currency ?? "usd",
    createdAt: purchase.createdAt.toISOString(),
  };
}

const purchaseInclude = {
  prompt: {
    select: {
      id: true,
      title: true,
      seller: {
        select: {
          username: true,
          email: true,
          sellerProfile: { select: { displayName: true } },
        },
      },
    },
  },
  buyer: { select: { username: true, email: true } },
  transaction: {
    select: {
      stripeSessionId: true,
      stripePaymentId: true,
      currency: true,
    },
  },
} as const;

export async function getAdminPurchases(options?: {
  search?: string;
  status?: PurchaseStatus | "all";
  type?: PurchaseTypeFilter;
  period?: PurchasePeriodFilter;
}) {
  return safeDbRead([], async () => {
    const purchases = await prisma.purchase.findMany({
      where: buildLivePurchaseWhere(options),
      include: purchaseInclude,
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return purchases.map(mapAdminPurchase);
  });
}

export async function getAdminPurchaseById(id: string) {
  return safeDbRead(null, async () => {
    const purchase = await prisma.purchase.findFirst({
      where: { id, ...livePurchaseWhere },
      include: purchaseInclude,
    });

    if (!purchase) return null;

    return mapAdminPurchase(purchase);
  });
}

export async function getAdminSales(options?: {
  search?: string;
}) {
  return safeDbRead([], async () => {
    const search = options?.search?.trim();
    const searchFilter = search
      ? {
          OR: [
            { prompt: { title: { contains: search, mode: "insensitive" as const } } },
            { seller: { email: { contains: search, mode: "insensitive" as const } } },
            { buyer: { email: { contains: search, mode: "insensitive" as const } } },
            { stripeSessionId: { contains: search, mode: "insensitive" as const } },
            { stripePaymentId: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const transactions = await prisma.transaction.findMany({
      where: searchFilter,
      include: {
        prompt: { select: { title: true } },
        seller: { select: { username: true, email: true } },
        buyer: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return transactions.map((tx) => ({
      id: tx.id,
      promptTitle: tx.prompt.title,
      seller: tx.seller.username,
      sellerEmail: tx.seller.email,
      buyer: tx.buyer.username,
      buyerEmail: tx.buyer.email,
      amount: tx.amount,
      status: tx.status,
      stripeSessionId: tx.stripeSessionId,
      createdAt: tx.createdAt.toISOString(),
    }));
  });
}

export async function getRecentAuditLogs(limit = 10) {
  return safeDbRead([], async () => {
    const logs = await prisma.auditLog.findMany({
      include: {
        actor: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      actor: log.actor?.username ?? log.actor?.email ?? "System",
      entityType: log.entityType,
      entityId: log.entityId,
      createdAt: log.createdAt.toISOString(),
    }));
  });
}

export function purchasesToCsv(
  purchases: Awaited<ReturnType<typeof getAdminPurchases>>,
): string {
  const headers = [
    "ID",
    "Prompt",
    "Buyer",
    "Buyer Email",
    "Seller",
    "Seller Email",
    "Amount",
    "Currency",
    "Status",
    "Stripe Session ID",
    "Stripe Payment ID",
    "Date",
  ];

  const rows = purchases.map((p) => [
    p.id,
    p.promptTitle,
    p.buyer,
    p.buyerEmail,
    p.seller ?? "",
    p.sellerEmail ?? "",
    String(p.amount),
    p.currency,
    p.status,
    p.stripeSessionId ?? "",
    p.stripePaymentId ?? "",
    p.createdAt,
  ]);

  const escape = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}
