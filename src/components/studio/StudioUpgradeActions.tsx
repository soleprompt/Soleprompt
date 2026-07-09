"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { startStudioSubscriptionCheckout } from "@/app/actions/studio-subscription";
import type { StudioAccessSnapshot } from "@/lib/studio/subscription-catalog";
import {
  STUDIO_TIER_CATALOG,
  type StudioTierId,
} from "@/lib/studio/subscription-catalog";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type StudioUpgradeActionsProps = {
  access: StudioAccessSnapshot;
  compact?: boolean;
};

export function StudioUpgradeActions({
  access,
  compact = false,
}: StudioUpgradeActionsProps) {
  const [pendingTier, setPendingTier] = useState<StudioTierId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpgrade(tier: StudioTierId) {
    setError(null);
    setPendingTier(tier);

    startTransition(async () => {
      const result = await startStudioSubscriptionCheckout(tier);
      setPendingTier(null);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  const paidTiers = STUDIO_TIER_CATALOG.filter((tier) => tier.id !== "free");

  if (compact) {
    const nextTier =
      access.tier === "free"
        ? paidTiers[0]
        : access.tier === "creator"
          ? paidTiers[1]
          : access.tier === "pro"
            ? paidTiers[2]
            : null;

    if (!nextTier || access.tier === "agency") {
      return null;
    }

    return (
      <div className="space-y-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isPending}
          onClick={() => handleUpgrade(nextTier.id)}
          className="shadow-[0_0_24px_rgba(139,92,246,0.2)]"
        >
          {isPending && pendingTier === nextTier.id ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Upgrade to {nextTier.name}
            </>
          )}
        </Button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-3">
        {paidTiers.map((tier) => {
          const isCurrent = access.tier === tier.id;
          const isDowngrade =
            access.isPaid &&
            STUDIO_TIER_CATALOG.findIndex((item) => item.id === tier.id) <
              STUDIO_TIER_CATALOG.findIndex((item) => item.id === access.tier);

          return (
            <div
              key={tier.id}
              className={cn(
                "rounded-2xl border p-4 transition-all duration-300",
                isCurrent
                  ? "border-purple/40 bg-purple/10 shadow-[0_0_24px_rgba(139,92,246,0.12)]"
                  : "border-white/[0.08] bg-white/[0.02]",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold">{tier.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${tier.priceMonthly}
                  <span className="text-xs">/mo</span>
                </p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {tier.description}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {tier.highlights.map((highlight) => (
                  <li key={highlight}>• {highlight}</li>
                ))}
              </ul>
              <Button
                type="button"
                variant={isCurrent ? "outline" : "secondary"}
                size="sm"
                className="mt-4 w-full"
                disabled={isCurrent || isPending || isDowngrade}
                onClick={() => handleUpgrade(tier.id)}
              >
                {isCurrent ? (
                  "Current plan"
                ) : isPending && pendingTier === tier.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting…
                  </>
                ) : isDowngrade ? (
                  "Included in your plan"
                ) : (
                  `Choose ${tier.name}`
                )}
              </Button>
            </div>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
