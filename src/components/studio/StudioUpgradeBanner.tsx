import { Crown } from "lucide-react";
import { StudioUpgradeActions } from "@/components/studio/StudioUpgradeActions";
import { StudioGlassCard } from "@/components/studio/studio-ui";
import { Badge } from "@/components/ui/Badge";
import type { StudioAccessSnapshot } from "@/lib/studio/subscription-catalog";
import { STUDIO_FREE_MONTHLY_PROJECT_LIMIT } from "@/lib/studio/subscription-catalog";

type StudioUpgradeBannerProps = {
  access: StudioAccessSnapshot;
};

export function StudioUpgradeBanner({ access }: StudioUpgradeBannerProps) {
  const usageLabel =
    access.monthlyLimit === null
      ? `${access.projectsThisMonth} projects this month`
      : `${access.projectsThisMonth} / ${access.monthlyLimit} free projects this month`;

  return (
    <StudioGlassCard
      glow
      className="relative overflow-hidden p-5 sm:p-6 animate-studio-fade-in-up"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple/10 via-transparent to-electric/10"
      />
      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple">{access.tierName} plan</Badge>
              <Badge variant="electric">{usageLabel}</Badge>
              {access.isPaid && access.cancelAtPeriodEnd && (
                <Badge variant="outline">Cancels at period end</Badge>
              )}
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple/30 to-electric/20 text-purple">
                <Crown className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {access.isPaid
                    ? "You're on SolePrompt Studio paid access"
                    : "Upgrade SolePrompt Studio for unlimited projects"}
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {access.isPaid
                    ? "Your subscription unlocks unlimited SolePrompt Studio projects, templates, and the full MVP production workflow."
                    : `Free includes ${STUDIO_FREE_MONTHLY_PROJECT_LIMIT} projects per month. Creator ($19), Pro ($49), and Agency ($99) unlock unlimited production.`}
                </p>
              </div>
            </div>
          </div>

          {!access.isPaid && (
            <div className="shrink-0">
              <StudioUpgradeActions access={access} compact />
            </div>
          )}
        </div>

        {!access.isPaid && <StudioUpgradeActions access={access} />}
      </div>
    </StudioGlassCard>
  );
}
