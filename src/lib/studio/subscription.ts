import "server-only";

import type {
  StudioSubscriptionStatus,
  StudioSubscriptionTier,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  getStudioTierDefinition,
  resolveTierFromPriceId,
  type StudioAccessSnapshot,
  type StudioTierId,
} from "@/lib/studio/subscription-catalog";

export {
  getStudioPriceIdForTier,
  getStudioTierDefinition,
  STUDIO_FREE_MONTHLY_PROJECT_LIMIT,
  STUDIO_TIER_CATALOG,
  type StudioAccessSnapshot,
  type StudioTierDefinition,
  type StudioTierId,
} from "@/lib/studio/subscription-catalog";

const PAID_TIERS = new Set<StudioTierId>(["creator", "pro", "agency"]);

const ACTIVE_PAID_STATUSES = new Set<StudioSubscriptionStatus>([
  "active",
  "trialing",
]);

export class StudioProjectLimitError extends Error {
  readonly code = "STUDIO_PROJECT_LIMIT" as const;

  constructor(
    readonly projectsThisMonth: number,
    readonly monthlyLimit: number,
  ) {
    super(
      `You've used all ${monthlyLimit} free SolePrompt Studio projects this month. Upgrade to create more.`,
    );
    this.name = "StudioProjectLimitError";
  }
}

export function getMonthStart(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getOrCreateStudioSubscription(userId: string) {
  const existing = await prisma.studioSubscription.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing;
  }

  return prisma.studioSubscription.create({
    data: {
      userId,
      tier: "free",
      status: "active",
    },
  });
}

function resolveEffectiveTier(
  tier: StudioSubscriptionTier,
  status: StudioSubscriptionStatus,
): StudioTierId {
  if (PAID_TIERS.has(tier as StudioTierId) && ACTIVE_PAID_STATUSES.has(status)) {
    return tier as StudioTierId;
  }
  return "free";
}

export async function countStudioProjectsThisMonth(userId: string): Promise<number> {
  return prisma.studioProject.count({
    where: {
      userId,
      createdAt: { gte: getMonthStart() },
    },
  });
}

export async function getStudioAccess(userId: string): Promise<StudioAccessSnapshot> {
  const subscription = await getOrCreateStudioSubscription(userId);
  const tier = resolveEffectiveTier(subscription.tier, subscription.status);
  const tierDefinition = getStudioTierDefinition(tier);
  const projectsThisMonth = await countStudioProjectsThisMonth(userId);
  const monthlyLimit = tierDefinition.monthlyProjectLimit;
  const remainingProjects =
    monthlyLimit === null ? null : Math.max(0, monthlyLimit - projectsThisMonth);
  const canCreateProject =
    monthlyLimit === null ? true : projectsThisMonth < monthlyLimit;

  return {
    tier,
    tierName: tierDefinition.name,
    status: subscription.status,
    projectsThisMonth,
    monthlyLimit,
    remainingProjects,
    canCreateProject,
    isPaid: tier !== "free",
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

export async function assertCanCreateStudioProject(userId: string): Promise<void> {
  const access = await getStudioAccess(userId);
  if (!access.canCreateProject && access.monthlyLimit !== null) {
    throw new StudioProjectLimitError(
      access.projectsThisMonth,
      access.monthlyLimit,
    );
  }
}

export function mapStripeSubscriptionStatus(
  status: string,
): StudioSubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "canceled";
    default:
      return "incomplete";
  }
}

export async function upsertStudioSubscriptionFromStripe(input: {
  userId: string;
  tier: StudioTierId;
  status: StudioSubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}) {
  const effectiveTier = PAID_TIERS.has(input.tier) ? input.tier : "free";

  return prisma.studioSubscription.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      tier: effectiveTier,
      status: input.status,
      stripeCustomerId: input.stripeCustomerId ?? null,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      stripePriceId: input.stripePriceId ?? null,
      currentPeriodStart: input.currentPeriodStart ?? null,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
    },
    update: {
      tier: effectiveTier,
      status: input.status,
      stripeCustomerId: input.stripeCustomerId ?? undefined,
      stripeSubscriptionId: input.stripeSubscriptionId ?? undefined,
      stripePriceId: input.stripePriceId ?? undefined,
      currentPeriodStart: input.currentPeriodStart ?? undefined,
      currentPeriodEnd: input.currentPeriodEnd ?? undefined,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? undefined,
    },
  });
}

export async function downgradeStudioSubscriptionByStripeId(
  stripeSubscriptionId: string,
) {
  const existing = await prisma.studioSubscription.findFirst({
    where: { stripeSubscriptionId },
  });

  if (!existing) {
    return null;
  }

  return prisma.studioSubscription.update({
    where: { id: existing.id },
    data: {
      tier: "free",
      status: "canceled",
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: null,
      stripePriceId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
    },
  });
}

export { resolveTierFromPriceId };
