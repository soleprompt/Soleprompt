"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  buildAffiliateCode,
  getAffiliateByUserId,
  getAffiliateDashboard,
} from "@/lib/affiliate-program";
import { syncClerkUser } from "@/lib/user";

export type AffiliateActionState = {
  error?: string;
  success?: string;
};

async function getDbUser() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const dbUser = await syncClerkUser(user);
  if (!dbUser) redirect("/buyer");
  return dbUser;
}

export async function joinAffiliateProgram(): Promise<void> {
  const dbUser = await getDbUser();

  const existing = await getAffiliateByUserId(dbUser.id);
  if (existing) {
    redirect("/affiliate");
  }

  let code = buildAffiliateCode(dbUser.username);
  let suffix = 1;
  while (await prisma.affiliate.findUnique({ where: { code } })) {
    code = `${buildAffiliateCode(dbUser.username)}${suffix}`;
    suffix += 1;
  }

  await prisma.affiliate.create({
    data: {
      userId: dbUser.id,
      code,
      status: "pending",
    },
  });

  redirect("/affiliate");
}

export async function requestAffiliatePayout(
  _prev: AffiliateActionState,
  formData: FormData,
): Promise<AffiliateActionState> {
  const dbUser = await getDbUser();
  const dashboard = await getAffiliateDashboard(dbUser.id);

  if (!dashboard?.affiliate) {
    return { error: "Affiliate account not found." };
  }

  const amountRaw = formData.get("amount") as string;
  const amount = parseFloat(amountRaw);
  const note = (formData.get("note") as string)?.trim() || null;

  if (Number.isNaN(amount) || amount <= 0) {
    return { error: "Enter a valid payout amount." };
  }

  if (amount < dashboard.minPayoutAmount) {
    return {
      error: `Minimum payout is $${dashboard.minPayoutAmount.toFixed(2)}.`,
    };
  }

  if (amount > dashboard.availableBalance) {
    return { error: "Amount exceeds your available balance." };
  }

  const payoutEmail =
    dashboard.affiliate.payoutEmail ?? dbUser.email;

  await prisma.payoutRequest.create({
    data: {
      userId: dbUser.id,
      kind: "affiliate",
      amount,
      note,
      payoutEmail,
      payoutMethod: dashboard.affiliate.payoutMethod ?? "PayPal",
    },
  });

  revalidatePath("/affiliate/earnings");
  revalidatePath("/admin/payouts");
  return { success: "Payout request submitted." };
}

export async function updateAffiliatePayoutMethod(
  _prev: AffiliateActionState,
  formData: FormData,
): Promise<AffiliateActionState> {
  const dbUser = await getDbUser();
  const payoutEmail = (formData.get("payoutEmail") as string)?.trim();
  const payoutMethod = (formData.get("payoutMethod") as string)?.trim() || "PayPal";

  if (!payoutEmail) {
    return { error: "Payout email is required." };
  }

  await prisma.affiliate.update({
    where: { userId: dbUser.id },
    data: { payoutEmail, payoutMethod },
  });

  revalidatePath("/affiliate");
  revalidatePath("/affiliate/earnings");
  return { success: "Payout method updated." };
}
