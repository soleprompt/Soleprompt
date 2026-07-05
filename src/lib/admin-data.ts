import { prisma } from "@/lib/db";
import { safeDbRead } from "@/lib/safe-db";
import type { PromptStatus, PurchaseStatus, UserRole } from "@/generated/prisma/client";

export async function getAdminOverviewStats() {
  return safeDbRead(
    {
      totalUsers: 0,
      activePrompts: 0,
      pendingPrompts: 0,
      totalPurchases: 0,
      totalRevenue: 0,
      stripePayments: 0,
    },
    async () => {
      const [
        totalUsers,
        activePrompts,
        pendingPrompts,
        totalPurchases,
        revenueResult,
        purchaseRevenue,
        stripePayments,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.prompt.count({ where: { status: "published" } }),
        prisma.prompt.count({ where: { status: "review" } }),
        prisma.purchase.count({ where: { status: "completed" } }),
        prisma.transaction.aggregate({
          where: { status: "completed" },
          _sum: { amount: true },
        }),
        prisma.purchase.aggregate({
          where: { status: "completed" },
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
      ]);

      const transactionRevenue = revenueResult._sum.amount ?? 0;
      const purchaseOnlyRevenue = purchaseRevenue._sum.amount ?? 0;

      return {
        totalUsers,
        activePrompts,
        pendingPrompts,
        totalPurchases,
        totalRevenue:
          transactionRevenue > 0 ? transactionRevenue : purchaseOnlyRevenue,
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

export async function getAdminPurchases(options?: {
  search?: string;
  status?: PurchaseStatus | "all";
}) {
  return safeDbRead([], async () => {
    const search = options?.search?.trim();
    const status =
      options?.status && options.status !== "all" ? options.status : undefined;

    const purchases = await prisma.purchase.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { prompt: { title: { contains: search, mode: "insensitive" } } },
                { buyer: { email: { contains: search, mode: "insensitive" } } },
                { buyer: { username: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        prompt: { select: { title: true } },
        buyer: { select: { username: true, email: true } },
        transaction: { select: { stripeSessionId: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return purchases.map((purchase) => ({
      id: purchase.id,
      promptTitle: purchase.prompt.title,
      buyer: purchase.buyer.username,
      buyerEmail: purchase.buyer.email,
      amount: purchase.amount,
      status: purchase.status,
      stripeSessionId: purchase.transaction?.stripeSessionId ?? null,
      createdAt: purchase.createdAt.toISOString(),
    }));
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

    if (transactions.length > 0 || search) {
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
    }

    const purchases = await prisma.purchase.findMany({
      where: { status: "completed" },
      include: {
        prompt: { select: { title: true, seller: { select: { username: true, email: true } } } },
        buyer: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return purchases.map((purchase) => ({
      id: purchase.id,
      promptTitle: purchase.prompt.title,
      seller: purchase.prompt.seller.username,
      sellerEmail: purchase.prompt.seller.email,
      buyer: purchase.buyer.username,
      buyerEmail: purchase.buyer.email,
      amount: purchase.amount,
      status: purchase.status,
      stripeSessionId: null,
      createdAt: purchase.createdAt.toISOString(),
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
