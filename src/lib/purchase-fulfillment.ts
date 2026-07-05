import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  sendPurchaseReceipt,
  sendSellerSaleNotification,
} from "@/lib/email";
import { getAppUrl } from "@/lib/stripe";

export type CompletePurchaseInput = {
  promptId: string;
  buyerId: string;
  amount: number;
  currency?: string;
  stripeSessionId?: string | null;
  stripePaymentId?: string | null;
  actorId?: string | null;
  purchasedAt?: Date;
  quiet?: boolean;
};

export type CompletePurchaseResult = {
  purchaseId: string;
  promptId: string;
  created: boolean;
  updated: boolean;
};

async function findExistingPurchase(
  buyerId: string,
  promptId: string,
  stripeSessionId?: string | null,
) {
  if (stripeSessionId) {
    const bySession = await prisma.transaction.findUnique({
      where: { stripeSessionId },
      select: { purchaseId: true, promptId: true },
    });

    if (bySession) {
      return {
        purchaseId: bySession.purchaseId,
        promptId: bySession.promptId,
      };
    }
  }

  const purchase = await prisma.purchase.findFirst({
    where: { buyerId, promptId, status: "completed" },
    select: { id: true, promptId: true },
  });

  if (!purchase) return null;

  return {
    purchaseId: purchase.id,
    promptId: purchase.promptId,
  };
}

function resolveAmount(storedAmount: number, inputAmount: number): number {
  if (inputAmount > 0) return inputAmount;
  return storedAmount;
}

function isFreePurchase(amount: number): boolean {
  return amount <= 0;
}

async function incrementSellerStats(
  tx: Prisma.TransactionClient,
  sellerId: string,
  amount: number,
) {
  if (isFreePurchase(amount)) {
    await tx.sellerProfile.updateMany({
      where: { userId: sellerId },
      data: { freeDownloadCount: { increment: 1 } },
    });
    return;
  }

  await tx.sellerProfile.updateMany({
    where: { userId: sellerId },
    data: {
      salesCount: { increment: 1 },
      totalEarnings: { increment: amount },
    },
  });
}

async function repairExistingPurchase(
  purchaseId: string,
  input: CompletePurchaseInput,
): Promise<{ updated: boolean }> {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      transaction: true,
      prompt: { select: { sellerId: true } },
    },
  });

  if (!purchase || purchase.status !== "completed") {
    return { updated: false };
  }

  const resolvedAmount = resolveAmount(purchase.amount, input.amount);
  const currency = input.currency ?? purchase.transaction?.currency ?? "usd";
  const purchasedAt = input.purchasedAt ?? purchase.createdAt;

  const transaction = purchase.transaction;
  const amountChanged =
    resolvedAmount > 0 &&
    (purchase.amount !== resolvedAmount ||
      (transaction != null && transaction.amount !== resolvedAmount));
  const needsTransaction = transaction == null;
  const needsStripeFields =
    Boolean(input.stripeSessionId) &&
    transaction?.stripeSessionId !== input.stripeSessionId;
  const needsPaymentId =
    Boolean(input.stripePaymentId) &&
    transaction?.stripePaymentId !== input.stripePaymentId;

  if (
    !needsTransaction &&
    !amountChanged &&
    !needsStripeFields &&
    !needsPaymentId
  ) {
    return { updated: false };
  }

  const previousAmount = transaction?.amount ?? purchase.amount;
  const earningsDelta = resolvedAmount - previousAmount;

  await prisma.$transaction(async (tx) => {
    if (purchase.amount !== resolvedAmount) {
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { amount: resolvedAmount },
      });
    }

    if (transaction) {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          amount: resolvedAmount,
          currency,
          ...(input.stripeSessionId ? { stripeSessionId: input.stripeSessionId } : {}),
          ...(input.stripePaymentId ? { stripePaymentId: input.stripePaymentId } : {}),
          status: "completed",
        },
      });
    } else {
      await tx.transaction.create({
        data: {
          purchaseId: purchase.id,
          stripeSessionId: input.stripeSessionId ?? null,
          stripePaymentId: input.stripePaymentId ?? null,
          amount: resolvedAmount,
          currency,
          status: "completed",
          buyerId: purchase.buyerId,
          sellerId: purchase.prompt.sellerId,
          promptId: purchase.promptId,
          createdAt: purchasedAt,
        },
      });
    }

    if (needsTransaction) {
      await incrementSellerStats(tx, purchase.prompt.sellerId, resolvedAmount);
    } else if (earningsDelta !== 0 && !isFreePurchase(resolvedAmount)) {
      await tx.sellerProfile.updateMany({
        where: { userId: purchase.prompt.sellerId },
        data: {
          totalEarnings: { increment: earningsDelta },
        },
      });
    }

    await tx.auditLog.create({
      data: {
        action: needsTransaction ? "purchase.completed" : "purchase.repaired",
        actorId: input.actorId ?? purchase.buyerId,
        entityType: "purchase",
        entityId: purchase.id,
        metadata: {
          promptId: purchase.promptId,
          buyerId: purchase.buyerId,
          sellerId: purchase.prompt.sellerId,
          amount: resolvedAmount,
          currency,
          stripeSessionId: input.stripeSessionId ?? null,
          stripePaymentId: input.stripePaymentId ?? null,
        },
      },
    });
  });

  return { updated: true };
}

export async function syncPurchaseRecord(
  purchaseId: string,
  overrides: Partial<CompletePurchaseInput> = {},
): Promise<CompletePurchaseResult> {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    select: {
      id: true,
      promptId: true,
      buyerId: true,
      amount: true,
      createdAt: true,
      status: true,
    },
  });

  if (!purchase || purchase.status !== "completed") {
    throw new Error("Purchase not found or not completed.");
  }

  const input: CompletePurchaseInput = {
    promptId: purchase.promptId,
    buyerId: purchase.buyerId,
    amount: purchase.amount,
    purchasedAt: purchase.createdAt,
    ...overrides,
  };

  const { updated } = await repairExistingPurchase(purchase.id, input);

  if (updated && !input.quiet) {
    revalidatePurchasePaths();
    revalidatePath(`/prompts/${purchase.promptId}`);
  }

  return {
    purchaseId: purchase.id,
    promptId: purchase.promptId,
    created: false,
    updated,
  };
}

function revalidatePurchasePaths() {
  try {
    revalidatePath("/buyer");
    revalidatePath("/seller/sales");
    revalidatePath("/seller/earnings");
    revalidatePath("/admin");
    revalidatePath("/admin/purchases");
    revalidatePath("/admin/sales");
  } catch {
    // no-op outside Next.js request context
  }
}

export async function completePurchase(
  input: CompletePurchaseInput,
): Promise<CompletePurchaseResult> {
  const existing = await findExistingPurchase(
    input.buyerId,
    input.promptId,
    input.stripeSessionId,
  );

  if (existing) {
    const { updated } = await repairExistingPurchase(existing.purchaseId, input);

    if (updated && !input.quiet) {
      revalidatePurchasePaths();
      revalidatePath(`/prompts/${existing.promptId}`);
    }

    return {
      purchaseId: existing.purchaseId,
      promptId: existing.promptId,
      created: false,
      updated,
    };
  }

  const prompt = await prisma.prompt.findFirst({
    where: { id: input.promptId, status: "published" },
    select: {
      id: true,
      title: true,
      sellerId: true,
      seller: {
        select: {
          email: true,
          username: true,
          sellerProfile: { select: { displayName: true } },
        },
      },
    },
  });

  if (!prompt) {
    throw new Error("Prompt is not available for purchase.");
  }

  const buyer = await prisma.user.findUnique({
    where: { id: input.buyerId },
    select: { id: true, email: true, username: true },
  });

  if (!buyer) {
    throw new Error("Buyer account not found.");
  }

  if (prompt.sellerId === buyer.id) {
    throw new Error("Cannot purchase your own prompt.");
  }

  const purchasedAt = input.purchasedAt ?? new Date();
  const amount = resolveAmount(0, input.amount);
  const currency = input.currency ?? "usd";
  const appUrl = getAppUrl();

  const purchase = await prisma.$transaction(async (tx) => {
    const createdPurchase = await tx.purchase.create({
      data: {
        promptId: prompt.id,
        buyerId: buyer.id,
        amount,
        status: "completed",
        createdAt: purchasedAt,
      },
    });

    await tx.transaction.create({
      data: {
        purchaseId: createdPurchase.id,
        stripeSessionId: input.stripeSessionId ?? null,
        stripePaymentId: input.stripePaymentId ?? null,
        amount,
        currency,
        status: "completed",
        buyerId: buyer.id,
        sellerId: prompt.sellerId,
        promptId: prompt.id,
        createdAt: purchasedAt,
      },
    });

    await incrementSellerStats(tx, prompt.sellerId, amount);

    await tx.auditLog.create({
      data: {
        action: "purchase.completed",
        actorId: input.actorId ?? buyer.id,
        entityType: "purchase",
        entityId: createdPurchase.id,
        metadata: {
          promptId: prompt.id,
          buyerId: buyer.id,
          sellerId: prompt.sellerId,
          amount,
          currency,
          stripeSessionId: input.stripeSessionId ?? null,
          stripePaymentId: input.stripePaymentId ?? null,
        },
      },
    });

    return createdPurchase;
  });

  if (!input.quiet) {
    try {
      await sendPurchaseReceipt({
        to: buyer.email,
        promptTitle: prompt.title,
        amount,
        purchasedAt,
        promptUrl: `${appUrl}/prompts/${prompt.id}`,
        purchasesUrl: `${appUrl}/buyer`,
      });
    } catch (error) {
      console.error("[email] Failed to send purchase receipt:", error);
    }

    const sellerName =
      prompt.seller.sellerProfile?.displayName ?? prompt.seller.username;

    try {
      await sendSellerSaleNotification({
        to: prompt.seller.email,
        sellerName,
        promptTitle: prompt.title,
        amount,
        soldAt: purchasedAt,
        salesUrl: `${appUrl}/seller/sales`,
        earningsUrl: `${appUrl}/seller/earnings`,
      });
    } catch (error) {
      console.error("[email] Failed to send seller sale notification:", error);
    }

    revalidatePath(`/prompts/${prompt.id}`);
    revalidatePurchasePaths();
  }

  return {
    purchaseId: purchase.id,
    promptId: prompt.id,
    created: true,
    updated: false,
  };
}
