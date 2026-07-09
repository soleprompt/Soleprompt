export type StudioTierId = "free" | "creator" | "pro" | "agency";

export type StudioTierDefinition = {
  id: StudioTierId;
  name: string;
  priceMonthly: number;
  monthlyProjectLimit: number | null;
  description: string;
  highlights: string[];
  stripePriceEnvKey?: string;
};

export const STUDIO_FREE_MONTHLY_PROJECT_LIMIT = 3;

export const STUDIO_TIER_CATALOG: StudioTierDefinition[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    monthlyProjectLimit: STUDIO_FREE_MONTHLY_PROJECT_LIMIT,
    description: "Try SolePrompt Studio with a few projects each month.",
    highlights: ["3 projects / month", "Full MVP workflow", "Research & SEO"],
  },
  {
    id: "creator",
    name: "Creator",
    priceMonthly: 19,
    monthlyProjectLimit: null,
    description: "For solo creators publishing weekly.",
    highlights: ["Unlimited projects", "All templates", "Priority generation"],
    stripePriceEnvKey: "STRIPE_STUDIO_CREATOR_PRICE_ID",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 49,
    monthlyProjectLimit: null,
    description: "For serious channels scaling output.",
    highlights: ["Unlimited projects", "Batch workflows", "Advanced exports"],
    stripePriceEnvKey: "STRIPE_STUDIO_PRO_PRICE_ID",
  },
  {
    id: "agency",
    name: "Agency",
    priceMonthly: 99,
    monthlyProjectLimit: null,
    description: "For teams managing multiple channels.",
    highlights: ["Unlimited projects", "Team-ready workflows", "Priority support"],
    stripePriceEnvKey: "STRIPE_STUDIO_AGENCY_PRICE_ID",
  },
];

export type StudioAccessSnapshot = {
  tier: StudioTierId;
  tierName: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  projectsThisMonth: number;
  monthlyLimit: number | null;
  remainingProjects: number | null;
  canCreateProject: boolean;
  isPaid: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export function getStudioTierDefinition(tier: StudioTierId): StudioTierDefinition {
  const definition = STUDIO_TIER_CATALOG.find((item) => item.id === tier);
  if (!definition) {
    throw new Error(`Unknown Studio tier: ${tier}`);
  }
  return definition;
}

export function getStudioPriceIdForTier(tier: StudioTierId): string | null {
  const definition = getStudioTierDefinition(tier);
  if (!definition.stripePriceEnvKey) {
    return null;
  }
  return process.env[definition.stripePriceEnvKey]?.trim() || null;
}

export function areStudioPriceIdsConfigured(): boolean {
  return STUDIO_TIER_CATALOG.filter((tier) => tier.stripePriceEnvKey).every(
    (tier) => Boolean(process.env[tier.stripePriceEnvKey!]?.trim()),
  );
}

export function resolveTierFromPriceId(priceId: string): StudioTierId | null {
  for (const tier of STUDIO_TIER_CATALOG) {
    if (!tier.stripePriceEnvKey) continue;
    const configured = process.env[tier.stripePriceEnvKey]?.trim();
    if (configured && configured === priceId) {
      return tier.id;
    }
  }
  return null;
}
