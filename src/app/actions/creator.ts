"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCreatorEarnings } from "@/lib/creator-program";
import { syncClerkUser } from "@/lib/user";

export type CreatorActionState = {
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

export async function requestCreatorPayout(
  _prev: CreatorActionState,
  formData: FormData,
): Promise<CreatorActionState> {
  const dbUser = await getDbUser();
  if (dbUser.role !== "seller" && dbUser.role !== "admin") {
    return { error: "Creator account required." };
  }

  const amountRaw = formData.get("amount") as string;
  const amount = parseFloat(amountRaw);
  const note = (formData.get("note") as string)?.trim() || null;

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: dbUser.id },
  });

  if (!profile) {
    return { error: "Creator profile not found." };
  }

  const earnings = await getCreatorEarnings(dbUser.id);

  if (Number.isNaN(amount) || amount <= 0) {
    return { error: "Enter a valid payout amount." };
  }

  if (amount < earnings.minPayoutAmount) {
    return {
      error: `Minimum payout is $${earnings.minPayoutAmount.toFixed(2)}.`,
    };
  }

  if (amount > earnings.availableBalance) {
    return { error: "Amount exceeds your available balance." };
  }

  if (!profile.payoutEmail) {
    return { error: "Add a payout email in Settings first." };
  }

  await prisma.payoutRequest.create({
    data: {
      userId: dbUser.id,
      kind: "creator",
      amount,
      note,
      payoutEmail: profile.payoutEmail,
      payoutMethod: profile.payoutMethod ?? "PayPal",
    },
  });

  revalidatePath("/seller/earnings");
  revalidatePath("/admin/payouts");
  return { success: "Payout request submitted. We'll review it within 2–3 business days." };
}

export async function updateCreatorPayoutMethod(
  _prev: CreatorActionState,
  formData: FormData,
): Promise<CreatorActionState> {
  const dbUser = await getDbUser();
  if (dbUser.role !== "seller" && dbUser.role !== "admin") {
    return { error: "Creator account required." };
  }

  const payoutEmail = (formData.get("payoutEmail") as string)?.trim();
  const payoutMethod = (formData.get("payoutMethod") as string)?.trim() || "PayPal";

  if (!payoutEmail) {
    return { error: "Payout email is required." };
  }

  await prisma.sellerProfile.update({
    where: { userId: dbUser.id },
    data: { payoutEmail, payoutMethod },
  });

  revalidatePath("/seller/settings");
  revalidatePath("/seller/earnings");
  return { success: "Payout method updated." };
}

export async function updateCreatorProfile(
  _prev: CreatorActionState,
  formData: FormData,
): Promise<CreatorActionState> {
  const dbUser = await getDbUser();
  if (dbUser.role !== "seller" && dbUser.role !== "admin") {
    return { error: "Creator account required." };
  }

  const displayName = (formData.get("displayName") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim() || null;

  if (!displayName) {
    return { error: "Display name is required." };
  }

  await prisma.sellerProfile.update({
    where: { userId: dbUser.id },
    data: { displayName, bio },
  });

  revalidatePath("/seller/settings");
  revalidatePath(`/creators/${dbUser.username}`);
  return { success: "Profile updated." };
}
