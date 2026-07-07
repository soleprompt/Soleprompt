import type { Prompt } from "@/types";

export type PromptBadgeType = "free" | "bestseller" | "trending" | "new";

export interface PromptBadge {
  type: PromptBadgeType;
  label: string;
}

const NEW_DAYS = 30;
const BESTSELLER_SALES = 8;
const TRENDING_VIEWS = 80;

export function getPromptBadges(
  prompt: Prompt & { createdAt?: string | Date },
  options?: { trendingIds?: Set<string> },
): PromptBadge[] {
  const badges: PromptBadge[] = [];

  if (prompt.price <= 0) {
    badges.push({ type: "free", label: "Free" });
  }

  if (prompt.salesCount >= BESTSELLER_SALES) {
    badges.push({ type: "bestseller", label: "Best Seller" });
  }

  if (options?.trendingIds?.has(prompt.id) || prompt.viewCount >= TRENDING_VIEWS) {
    badges.push({ type: "trending", label: "Trending" });
  }

  const createdAt = prompt.createdAt ? new Date(prompt.createdAt) : null;
  const isNew =
    createdAt &&
    Date.now() - createdAt.getTime() < NEW_DAYS * 86_400_000;

  if (isNew && !badges.some((b) => b.type === "bestseller")) {
    badges.push({ type: "new", label: "New" });
  }

  return badges.slice(0, 2);
}

export const BADGE_STYLES: Record<
  PromptBadgeType,
  string
> = {
  free: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  bestseller: "border-electric/40 bg-electric/15 text-electric",
  trending: "border-orange-500/40 bg-orange-500/15 text-orange-300",
  new: "border-purple-500/40 bg-purple-500/15 text-purple-300",
};
