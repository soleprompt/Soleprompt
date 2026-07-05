"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { syncClerkUser } from "@/lib/user";

export type PurchaseActionResult = {
  error?: string;
  url?: string;
};

async function getBuyerUser() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await syncClerkUser(user);
  if (!dbUser) {
    throw new Error("Unable to sync user account.");
  }

  return dbUser;
}

async function hasCompletedPurchase(buyerId: string, promptId: string) {
  const existing = await prisma.purchase.findFirst({
    where: { buyerId, promptId, status: "completed" },
    select: { id: true },
  });

  return Boolean(existing);
}

export async function startPurchase(
  promptId: string,
): Promise<PurchaseActionResult> {
  const buyer = await getBuyerUser();

  const prompt = await prisma.prompt.findFirst({
    where: { id: promptId, status: "published" },
    select: {
      id: true,
      title: true,
      price: true,
      sellerId: true,
    },
  });

  if (!prompt) {
    return { error: "This prompt is no longer available." };
  }

  if (prompt.sellerId === buyer.id) {
    return { error: "You cannot purchase your own prompt." };
  }

  if (await hasCompletedPurchase(buyer.id, prompt.id)) {
    return { error: "You already own this prompt." };
  }

  if (prompt.price <= 0) {
    await prisma.purchase.create({
      data: {
        promptId: prompt.id,
        buyerId: buyer.id,
        amount: 0,
        status: "completed",
      },
    });

    revalidatePath(`/prompts/${prompt.id}`);
    revalidatePath("/buyer");

    return { url: "/buyer" };
  }

  if (!isStripeConfigured()) {
    return {
      error:
        "Payments are not configured yet. Add STRIPE_SECRET_KEY to enable checkout.",
    };
  }

  const stripe = getStripe();
  const appUrl = getAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: prompt.title,
          },
          unit_amount: Math.round(prompt.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      promptId: prompt.id,
      buyerId: buyer.id,
    },
    success_url: `${appUrl}/prompts/${prompt.id}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/prompts/${prompt.id}?checkout=cancelled`,
  });

  if (!session.url) {
    return { error: "Unable to start checkout. Please try again." };
  }

  return { url: session.url };
}

export async function fulfillPurchase(sessionId: string): Promise<void> {
  if (!sessionId || !isStripeConfigured()) return;

  const buyer = await getBuyerUser();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") return;

  const promptId = session.metadata?.promptId;
  const buyerId = session.metadata?.buyerId;

  if (!promptId || !buyerId || buyerId !== buyer.id) return;

  if (await hasCompletedPurchase(buyer.id, promptId)) return;

  const prompt = await prisma.prompt.findFirst({
    where: { id: promptId, status: "published" },
    select: { id: true, price: true },
  });

  if (!prompt) return;

  await prisma.purchase.create({
    data: {
      promptId: prompt.id,
      buyerId: buyer.id,
      amount: prompt.price,
      status: "completed",
    },
  });

  revalidatePath(`/prompts/${prompt.id}`);
  revalidatePath("/buyer");
}
