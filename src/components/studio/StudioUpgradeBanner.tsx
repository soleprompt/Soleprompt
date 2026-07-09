import { Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StudioGlassCard } from "@/components/studio/studio-ui";
import { Button } from "@/components/ui/Button";

export function StudioUpgradeBanner() {
  return (
    <StudioGlassCard
      glow
      className="relative overflow-hidden p-5 sm:p-6 animate-studio-fade-in-up"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple/10 via-transparent to-electric/10"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="purple">Beta access</Badge>
            <Badge variant="electric">3 free packages / month</Badge>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple/30 to-electric/20 text-purple">
              <Crown className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                SolePrompt Studio Pro — coming soon
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Unlimited YouTube packages, batch generation, and channel
                templates will unlock with Studio Pro. You&apos;re on the free
                beta tier for now.
              </p>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="shrink-0 border-white/[0.1] bg-white/[0.02]"
        >
          <Sparkles className="h-4 w-4" />
          Upgrade (soon)
        </Button>
      </div>
    </StudioGlassCard>
  );
}
