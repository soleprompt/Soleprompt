import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { TodayFunnelStats } from "@/lib/analytics/today-funnel";

type TodayFunnelCardProps = {
  stats: TodayFunnelStats;
};

function formatPercent(value: number) {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function TodayFunnelCard({ stats }: TodayFunnelCardProps) {
  const maxValue = stats.steps[0]?.value ?? 0;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">📊 Today — X Checker funnel</h2>
        <p className="text-sm text-muted-foreground">
          UTC day · {stats.dateLabel} · visitors through purchase
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <ul className="space-y-3">
          {stats.steps.map((step) => {
            const barWidth =
              maxValue > 0
                ? Math.max(4, Math.round((step.value / maxValue) * 100))
                : 0;

            return (
              <li key={step.key} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="font-medium">{step.label}</span>
                  <div className="shrink-0 text-right">
                    <span className="font-semibold tabular-nums">
                      {step.value.toLocaleString()}
                    </span>
                    {step.stepRate !== undefined && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatPercent(step.stepRate)} of prior
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-electric/70 transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {formatPercent(stats.conversionRate)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Purchased ÷ X Checker Visits
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Revenue Today</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {formatCurrency(stats.revenueToday)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Paid live purchases (UTC day)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
