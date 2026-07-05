import { revalidatePath } from "next/cache";
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
  stripeSessionId?: string | null;
  actorId?: string | null;
};

export type CompletePurchaseResult = {
  purchaseId: string;
  promptId: string;
  created: boolean;
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

export async function completePurchase(
  input: CompletePurchaseInput,
): Promise<CompletePurchaseResult> {
  const existing = await findExistingPurchase(
    input.buyerId,
    input.promptId,
    input.stripeSessionId,
  );

  if (existing) {
    return {
      purchaseId: existing.purchaseId,
      promptId: existing.promptId,
      created: false,
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

  const purchasedAt = new Date();
  const appUrl = getAppUrl();

  const purchase = await prisma.$transaction(async (tx) => {
    const createdPurchase = await tx.purchase.create({
      data: {
        promptId: prompt.id,
        buyerId: buyer.id,
        amount: input.amount,
        status: "completed",
        createdAt: purchasedAt,
      },
    });

    await tx.transaction.create({
      data: {
        purchaseId: createdPurchase.id,
        stripeSessionId: input.stripeSessionId ?? null,
        amount: input.amount,
        status: "completed",
        buyerId: buyer.id,
        sellerId: prompt.sellerId,
        promptId: prompt.id,
        createdAt: purchasedAt,
      },
    });

    await tx.sellerProfile.updateMany({
      where: { userId: prompt.sellerId },
      data: {
        salesCount: { increment: 1 },
        totalEarnings: { increment: input.amount },
      },
    });

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
          amount: input.amount,
          stripeSessionId: input.stripeSessionId ?? null,
        },
      },
    });

    return createdPurchase;
  });

  try {
    await sendPurchaseReceipt({
      to: buyer.email,
      promptTitle: prompt.title,
      amount: input.amount,
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
      amount: input.amount,
      soldAt: purchasedAt,
      salesUrl: `${appUrl}/seller/sales`,
      earningsUrl: `${appUrl}/seller/earnings`,
    });
  } catch (error) {
    console.error("[email] Failed to send seller sale notification:", error);
  }

  revalidatePath(`/prompts/${prompt.id}`);
  revalidatePath("/buyer");
  revalidatePath("/seller/sales");
  revalidatePath("/seller/earnings");
  revalidatePath("/admin");
  revalidatePath("/admin/purchases");
  revalidatePath("/admin/sales");

  return {
    purchaseId: purchase.id,
    promptId: prompt.id,
    created: true,
  };
}
