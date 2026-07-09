"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAppUrl } from "@/lib/app-url";
import {
  getStudioPriceIdForTier,
  type StudioTierId,
} from "@/lib/studio/subscription-catalog";
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

  const priceId = getStudioPriceIdForTier(tier);
  if (!priceId) {
    return {
      error: `Missing Stripe price ID for ${tier}. Set the corresponding STRIPE_STUDIO_* env var.`,
    };
  }

  const appUrl = getAppUrl();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
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
