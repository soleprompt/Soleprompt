"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { SignUpButton, useAuth } from "@clerk/nextjs";
import { startStudioSubscriptionCheckout } from "@/app/actions/studio-subscription";
import { Button } from "@/components/ui/Button";
import { StudioGlassCard } from "@/components/studio/studio-ui";
import {
  STUDIO_TIER_CATALOG,
  type StudioTierId,
} from "@/lib/studio/subscription-catalog";
import { cn } from "@/lib/utils";

export function StudioLandingPricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-purple">
          Pricing
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Start free. Scale when you&apos;re ready.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Every plan includes the full SolePrompt Studio workflow. SolePrompt Studio Pro is built
          for creators publishing weekly who need unlimited projects.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STUDIO_TIER_CATALOG.map((tier) => (
          <PricingCard key={tier.id} tierId={tier.id} recommended={tier.id === "pro"} />
        ))}
      </div>
    </section>
  );
}

function PricingCard({
  tierId,
  recommended,
}: {
  tierId: StudioTierId;
  recommended?: boolean;
}) {
  const tier = STUDIO_TIER_CATALOG.find((t) => t.id === tierId)!;
  const { isSignedIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePaidCheckout() {
    setError(null);
    startTransition(async () => {
      const result = await startStudioSubscriptionCheckout(tierId);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  const signUpUrl =
    tierId === "free"
      ? "/sign-up?redirect_url=/studio/projects"
      : `/sign-up?redirect_url=${encodeURIComponent(`/studio/projects?plan=${tierId}`)}`;

  return (
    <StudioGlassCard
      glow={recommended}
      className={cn(
        "flex flex-col p-5 sm:p-6",
        recommended && "border-purple/30 ring-1 ring-purple/20",
      )}
    >
      {recommended && (
        <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-purple/30 bg-purple/15 px-3 py-1 text-xs font-medium text-purple">
          <Sparkles className="h-3 w-3" />
          Recommended
        </div>
      )}

      <div className="flex items-baseline gap-1">
        <h3 className="text-lg font-semibold">{tier.name}</h3>
      </div>
      <p className="mt-2">
        <span className="text-3xl font-bold">${tier.priceMonthly}</span>
        {tier.priceMonthly > 0 && (
          <span className="text-sm text-muted-foreground">/mo</span>
        )}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {tier.description}
      </p>

      <ul className="mt-4 flex-1 space-y-2">
        {tier.highlights.map((highlight) => (
          <li
            key={highlight}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric" />
            {highlight}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {tierId === "free" ? (
          <SignUpButton mode="redirect" forceRedirectUrl="/studio/projects">
            <Button variant="outline" className="w-full">
              Start Free
            </Button>
          </SignUpButton>
        ) : isSignedIn ? (
          <Button
            variant={recommended ? "secondary" : "outline"}
            className="w-full"
            disabled={isPending}
            onClick={handlePaidCheckout}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting…
              </>
            ) : (
              `Get ${tier.name}`
            )}
          </Button>
        ) : (
          <Link href={signUpUrl} className="block">
            <Button
              variant={recommended ? "secondary" : "outline"}
              className="w-full"
            >
              Get {tier.name}
            </Button>
          </Link>
        )}
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    </StudioGlassCard>
  );
}
