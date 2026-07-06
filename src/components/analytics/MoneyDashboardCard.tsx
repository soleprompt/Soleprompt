import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { MoneyDashboardStats } from "@/lib/analytics/money-dashboard";

type MoneyDashboardCardProps = {
  stats: MoneyDashboardStats;
};

function formatPercent(value: number) {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

type MetricProps = {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
};

function Metric({ label, value, hint, highlight }: MetricProps) {
  return (
    <div
      className={
        highlight
          ? "rounded-lg border border-electric/20 bg-electric/5 p-4"
          : "rounded-lg border border-border p-4"
      }
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${
          highlight ? "text-electric" : ""
        }`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function MoneyDashboardCard({ stats }: MoneyDashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">💰 Money Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Live revenue and conversion · UTC week {stats.weekLabel}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric
            label="Revenue Today"
            value={formatCurrency(stats.revenueToday)}
            hint="Paid live purchases (UTC day)"
            highlight
          />
          <Metric
            label="Revenue This Week"
            value={formatCurrency(stats.revenueThisWeek)}
            hint="UTC calendar week (Mon–Sun)"
            highlight
          />
          <Metric
            label="Average Order"
            value={formatCurrency(stats.averageOrder)}
            hint="Revenue this week ÷ orders this week"
          />
          <Metric
            label="Conversion"
            value={formatPercent(stats.conversion)}
            hint="Purchased ÷ X Checker Visits (today)"
          />
          <Metric
            label="Top Product"
            value={stats.topProduct ?? "—"}
            hint="Highest revenue this week"
          />
          <Metric
            label="Top Traffic Source"
            value={stats.topTrafficSource ?? "—"}
            hint="Most UTM-attributed visits (all time)"
          />
        </div>
      </CardContent>
    </Card>
  );
}
