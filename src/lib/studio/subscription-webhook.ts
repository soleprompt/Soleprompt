import "server-only";

import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import {
  resolveTierFromPriceId,
  type StudioTierId,
} from "@/lib/studio/subscription-catalog";
import {
  downgradeStudioSubscriptionByStripeId,
  mapStripeSubscriptionStatus,
  upsertStudioSubscriptionFromStripe,
} from "@/lib/studio/subscription";

function readTierFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
): StudioTierId | null {
  const tier = metadata?.tier;
  if (tier === "creator" || tier === "pro" || tier === "agency") {
    return tier;
  }
  return null;
}

function readUserIdFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
): string | null {
  const userId = metadata?.userId?.trim();
  return userId || null;
}

function resolveTierFromSubscription(
  subscription: Stripe.Subscription,
): StudioTierId | null {
  const metadataTier = readTierFromMetadata(subscription.metadata);
  if (metadataTier) {
    return metadataTier;
  }

  const priceId = subscription.items.data[0]?.price?.id;
  if (priceId) {
    return resolveTierFromPriceId(priceId);
  }

  return null;
}

function readSubscriptionPeriod(subscription: Stripe.Subscription): {
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
} {
  const item = subscription.items.data[0];
  if (item?.current_period_start) {
    return {
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: item.current_period_end
        ? new Date(item.current_period_end * 1000)
        : null,
    };
  }

  const legacy = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };

  if (legacy.current_period_start) {
    return {
      currentPeriodStart: new Date(legacy.current_period_start * 1000),
      currentPeriodEnd: legacy.current_period_end
        ? new Date(legacy.current_period_end * 1000)
        : null,
    };
  }

  if (subscription.billing_cycle_anchor) {
    return {
      currentPeriodStart: new Date(subscription.billing_cycle_anchor * 1000),
      currentPeriodEnd: null,
    };
  }

  return { currentPeriodStart: null, currentPeriodEnd: null };
}

export async function handleStudioSubscriptionCheckoutCompleted(
  session: Stripe.Checkout.Session,
) {
  if (session.metadata?.type !== "studio_subscription") {
    return;
  }

  const userId = readUserIdFromMetadata(session.metadata);
  const tier = readTierFromMetadata(session.metadata);
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!userId || !tier || !subscriptionId) {
    console.error("[stripe] studio subscription checkout missing metadata");
    return;
  }

  const stripe = await import("@/lib/stripe").then((mod) => mod.getStripe());
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const period = readSubscriptionPeriod(subscription);

  await upsertStudioSubscriptionFromStripe({
    userId,
    tier,
    status: mapStripeSubscriptionStatus(subscription.status),
    stripeCustomerId:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    currentPeriodStart: period.currentPeriodStart,
    currentPeriodEnd: period.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

export async function handleStudioSubscriptionUpdated(
  subscription: Stripe.Subscription,
) {
  if (subscription.metadata?.type !== "studio_subscription") {
    const existing = await prisma.studioSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!existing) {
      return;
    }
  }

  const userId =
    readUserIdFromMetadata(subscription.metadata) ??
    (
      await prisma.studioSubscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        select: { userId: true },
      })
    )?.userId;

  if (!userId) {
    console.error("[stripe] studio subscription update missing user");
    return;
  }

  const tier = resolveTierFromSubscription(subscription);
  if (!tier) {
    console.error("[stripe] studio subscription update missing tier");
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const period = readSubscriptionPeriod(subscription);

  await upsertStudioSubscriptionFromStripe({
    userId,
    tier,
    status: mapStripeSubscriptionStatus(subscription.status),
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    currentPeriodStart: period.currentPeriodStart,
    currentPeriodEnd: period.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

export async function handleStudioSubscriptionDeleted(
  subscription: Stripe.Subscription,
) {
  await downgradeStudioSubscriptionByStripeId(subscription.id);
}
