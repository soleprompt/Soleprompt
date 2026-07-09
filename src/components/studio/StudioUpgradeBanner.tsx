import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function StudioUpgradeBanner() {
  return (
    <div className="rounded-2xl border border-purple/30 bg-gradient-to-br from-purple/10 via-card/50 to-electric/5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="purple">Beta access</Badge>
            <Badge variant="electric">3 free packages / month</Badge>
          </div>
          <h2 className="text-lg font-semibold">SolePrompt Studio Pro — coming soon</h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Unlimited YouTube packages, batch generation, and channel templates will
            unlock with Studio Pro. You&apos;re on the free beta tier for now.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled className="shrink-0">
          <Sparkles className="h-4 w-4" />
          Upgrade (soon)
        </Button>
      </div>
    </div>
  );
}
