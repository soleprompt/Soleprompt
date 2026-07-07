"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  updateCreatorStatus,
  verifyCreator,
} from "@/lib/creator-program";
import { updateAffiliateStatus } from "@/lib/affiliate-program";
import { resolveAdminAccess } from "@/lib/user";
import type {
  AffiliateStatus,
  CreatorStatus,
  PayoutStatus,
} from "@/generated/prisma/client";

async function requireAdmin() {
  const allowed = await resolveAdminAccess();
  if (!allowed) {
    throw new Error("Unauthorized");
  }
}

export async function adminApproveCreator(userId: string) {
  await requireAdmin();
  await updateCreatorStatus(userId, "approved");
  revalidatePath("/admin/creators");
}

export async function adminRejectCreator(userId: string) {
  await requireAdmin();
  await updateCreatorStatus(userId, "rejected");
  revalidatePath("/admin/creators");
}

export async function adminToggleCreatorVerified(userId: string, verified: boolean) {
  await requireAdmin();
  await verifyCreator(userId, verified);
  revalidatePath("/admin/creators");
  revalidatePath(`/creators/${userId}`);
}

export async function adminSetAffiliateStatus(
  affiliateId: string,
  status: AffiliateStatus,
) {
  await requireAdmin();
  await updateAffiliateStatus(affiliateId, status);
  revalidatePath("/admin/affiliates");
}

export async function adminApprovePayout(payoutId: string) {
  await requireAdmin();
  await processPayout(payoutId, "approved");
}

export async function adminMarkPayoutPaid(payoutId: string) {
  await requireAdmin();
  await processPayout(payoutId, "paid");
}

export async function adminRejectPayout(payoutId: string) {
  await requireAdmin();
  await processPayout(payoutId, "rejected");
}

async function processPayout(payoutId: string, status: PayoutStatus, adminNote?: string) {
  const user = await currentUser();

  const payout = await prisma.payoutRequest.findUnique({
    where: { id: payoutId },
    include: { user: { include: { affiliate: true, sellerProfile: true } } },
  });

  if (!payout) return;

  await prisma.$transaction(async (tx) => {
    await tx.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status,
        adminNote: adminNote ?? null,
        processedAt: new Date(),
        processedById: user?.id ?? null,
      },
    });

    if (status === "paid") {
      if (payout.kind === "affiliate" && payout.user.affiliate) {
        await tx.affiliate.update({
          where: { id: payout.user.affiliate.id },
          data: {
            pendingBalance: { decrement: payout.amount },
            paidBalance: { increment: payout.amount },
          },
        });
      }
    }
  });

  revalidatePath("/admin/payouts");
  revalidatePath("/seller/earnings");
  revalidatePath("/affiliate/earnings");
}

export async function adminUpdateCommissionSettings(formData: FormData) {
  await requireAdmin();

  const creatorCommissionPercent = parseFloat(
    formData.get("creatorCommissionPercent") as string,
  );
  const affiliateCommissionPercent = parseFloat(
    formData.get("affiliateCommissionPercent") as string,
  );
  const minPayoutAmount = parseFloat(formData.get("minPayoutAmount") as string);

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      creatorCommissionPercent,
      affiliateCommissionPercent,
      minPayoutAmount,
    },
    update: {
      creatorCommissionPercent,
      affiliateCommissionPercent,
      minPayoutAmount,
    },
  });

  revalidatePath("/admin/settings");
}
