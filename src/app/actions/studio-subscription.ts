"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAppUrl } from "@/lib/app-url";
import {
  areStudioPriceIdsConfigured,
  getStudioPriceIdForTier,
  type StudioTierId,
} from "@/lib/studio/subscription-catalog";
import {
  getOrCreateStudioSubscription,
  getStudioAccess,
} from "@/lib/studio/subscription";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { syncClerkUser } from "@/lib/user";

export type StudioSubscriptionActionResult = {
  error?: string;
  url?: string;
};

async function getAuthenticatedUser() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await syncClerkUser(user);
  if (!dbUser) {
    throw new Error("Unable to sync user account.");
  }

  return dbUser;
}

export async function startStudioSubscriptionCheckout(
  tier: StudioTierId,
): Promise<StudioSubscriptionActionResult> {
  if (tier === "free") {
    return { error: "Free tier does not require checkout." };
  }

  const buyer = await getAuthenticatedUser();

  if (!isStripeConfigured()) {
    return {
      error:
        "SolePrompt Studio subscriptions are not configured yet. Add STRIPE_SECRET_KEY and Studio price IDs.",
    };
  }

  if (!areStudioPriceIdsConfigured()) {
    return {
      error:
        "SolePrompt Studio price IDs are not fully configured. Set STRIPE_STUDIO_CREATOR_PRICE_ID, STRIPE_STUDIO_PRO_PRICE_ID, and STRIPE_STUDIO_AGENCY_PRICE_ID.",
    };
  }

  const access = await getStudioAccess(buyer.id);
  if (access.isPaid) {
    return { error: "You already have an active SolePrompt Studio subscription." };
  }

  const priceId = getStudioPriceIdForTier(tier);
  if (!priceId) {
    return {
      error: `Missing Stripe price ID for ${tier}. Set the corresponding STRIPE_STUDIO_* env var.`,
    };
  }

  const existingSubscription = await getOrCreateStudioSubscription(buyer.id);
  const appUrl = getAppUrl();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    ...(existingSubscription.stripeCustomerId
      ? { customer: existingSubscription.stripeCustomerId }
      : buyer.email
        ? { customer_email: buyer.email }
        : {}),
    metadata: {
      type: "studio_subscription",
      userId: buyer.id,
      tier,
    },
    subscription_data: {
      metadata: {
        type: "studio_subscription",
        userId: buyer.id,
        tier,
      },
    },
    success_url: `${appUrl}/studio/projects?subscribed=1`,
    cancel_url: `${appUrl}/studio/projects?canceled=1`,
  });

  if (!session.url) {
    return { error: "Unable to start checkout. Please try again." };
  }

  return { url: session.url };
}
