"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { completePurchase } from "@/lib/purchase-fulfillment";
import {
  getCheckoutSessionAmount,
  getCheckoutSessionCurrency,
  getStripe,
  getStripePaymentId,
  isStripeConfigured,
  STRIPE_CHECKOUT_CANCEL_URL,
  STRIPE_CHECKOUT_SUCCESS_URL,
} from "@/lib/stripe";
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
    await completePurchase({
      promptId: prompt.id,
      buyerId: buyer.id,
      amount: 0,
      actorId: buyer.id,
    });

    return { url: "/buyer" };
  }

  if (!isStripeConfigured()) {
    return {
      error:
        "Payments are not configured yet. Add STRIPE_SECRET_KEY to enable checkout.",
    };
  }

  const stripe = getStripe();

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
    success_url: STRIPE_CHECKOUT_SUCCESS_URL,
    cancel_url: STRIPE_CHECKOUT_CANCEL_URL,
  });

  if (!session.url) {
    return { error: "Unable to start checkout. Please try again." };
  }

  return { url: session.url };
}

export type FulfillPurchaseResult = {
  success: boolean;
  promptId?: string;
  error?: string;
};

export async function fulfillPurchase(
  sessionId: string,
): Promise<FulfillPurchaseResult> {
  if (!sessionId || !isStripeConfigured()) {
    return { success: false, error: "Invalid checkout session." };
  }

  const buyer = await getBuyerUser();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return { success: false, error: "Payment has not been completed." };
  }

  const promptId = session.metadata?.promptId;
  const buyerId = session.metadata?.buyerId;

  if (!promptId || !buyerId || buyerId !== buyer.id) {
    return { success: false, error: "Checkout session does not match your account." };
  }

  const prompt = await prisma.prompt.findFirst({
    where: { id: promptId, status: "published" },
    select: { price: true },
  });

  if (!prompt) {
    return { success: false, error: "This prompt is no longer available." };
  }

  const amount = getCheckoutSessionAmount(session, prompt.price);

  try {
    const result = await completePurchase({
      promptId,
      buyerId: buyer.id,
      amount,
      currency: getCheckoutSessionCurrency(session),
      stripeSessionId: sessionId,
      stripePaymentId: getStripePaymentId(session),
      purchasedAt: new Date(session.created * 1000),
      actorId: buyer.id,
    });

    return { success: true, promptId: result.promptId };
  } catch (error) {
    console.error("[purchase] fulfillPurchase failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to complete purchase.",
    };
  }
}
