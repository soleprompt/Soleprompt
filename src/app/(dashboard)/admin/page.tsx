import Link from "next/link";
import { BarChartPlaceholder } from "@/components/dashboard/BarChartPlaceholder";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  getAdminOverviewStats,
  getRecentAuditLogs,
} from "@/lib/admin-data";
import { formatCurrency, formatDate } from "@/lib/format";
import { MoneyDashboardCard } from "@/components/analytics/MoneyDashboardCard";
import { ScrubberPaidFunnelCard } from "@/components/analytics/ScrubberPaidFunnelCard";
import { TodayFunnelCard } from "@/components/analytics/TodayFunnelCard";
import { TopAcquisitionSourcesCard } from "@/components/analytics/TopAcquisitionSourcesCard";
import { getAcquisitionSourceStats } from "@/lib/analytics/acquisition-sources";
import { getMoneyDashboardStats } from "@/lib/analytics/money-dashboard";
import { getScrubberPaidFunnelStats } from "@/lib/analytics/scrubber-paid-funnel";
import { getTodayFunnelStats } from "@/lib/analytics/today-funnel";
import { getClickThroughStats } from "@/lib/click-throughs";
import { getToolVisitStats } from "@/lib/tool-visits";

export default async function AdminOverviewPage() {
  const [
    stats,
    auditLogs,
    toolVisits,
    clickThroughs,
    moneyDashboard,
    todayFunnel,
    scrubberPaidFunnel,
    acquisitionSources,
  ] = await Promise.all([
    getAdminOverviewStats(),
    getRecentAuditLogs(8),
    getToolVisitStats(),
    getClickThroughStats(),
    getMoneyDashboardStats(),
    getTodayFunnelStats(),
    getScrubberPaidFunnelStats(),
    getAcquisitionSourceStats(),
  ]);

  const statCards = [
    { emoji: "💰", label: "Gross Revenue", value: formatCurrency(stats.grossRevenue) },
    { emoji: "💵", label: "Net Revenue", value: formatCurrency(stats.netRevenue) },
    { emoji: "🛒", label: "Total Orders", value: String(stats.totalOrders) },
    { emoji: "👥", label: "Total Users", value: String(stats.totalUsers) },
    { emoji: "📦", label: "Prompts Sold", value: String(stats.promptsSold) },
  ];

  const revenue30DayTotal = stats.revenueLast30Days.reduce(
    (sum, day) => sum + day.value,
    0,
  );

  return (
    <>
      <PageHeader
        title="Admin Overview"
        description="Live platform metrics from Stripe checkout and real purchases."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                {stat.emoji} {stat.label}
              </p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <MoneyDashboardCard stats={moneyDashboard} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TodayFunnelCard stats={todayFunnel} />
        <ScrubberPaidFunnelCard stats={scrubberPaidFunnel} />
      </div>

      <div className="mt-6">
        <TopAcquisitionSourcesCard stats={acquisitionSources} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">🛠️ Tool visits</h2>
            <p className="text-sm text-muted-foreground">
              Page views per buyer-facing tool · all time and last 7 days
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-border text-sm">
              {toolVisits.map((tool) => (
                <li
                  key={tool.slug}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{tool.label}</p>
                    <p className="text-muted-foreground">{tool.description}</p>
                    <p className="text-xs text-muted-foreground">{tool.path}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium tabular-nums">
                      {tool.totalVisits.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                      {tool.visitsLast7Days.toLocaleString()} last 7d
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">🖱️ Click-throughs</h2>
            <p className="text-sm text-muted-foreground">
              Paid tool CTAs, checkout starts, marketplace clicks, and upgrades ·
              all time and last 7 days
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {clickThroughs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No click-throughs yet.
              </p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {clickThroughs.map((row) => (
                  <li
                    key={row.key}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{row.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.eventType}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-medium tabular-nums">
                        {row.totalClicks.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">
                        {row.clicksLast7Days.toLocaleString()} last 7d
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">⭐ Top Sellers</h2>
            <p className="text-sm text-muted-foreground">
              By paid revenue from live transactions
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.topSellers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {stats.topSellers.map((seller, index) => (
                  <li
                    key={seller.name}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-electric/10 text-xs font-semibold text-electric">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{seller.name}</p>
                        <p className="text-muted-foreground">
                          {seller.sales} sale{seller.sales === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(seller.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick links</h2>
          </CardHeader>
          <CardContent className="grid gap-2 pt-0 text-sm">
            <Link href="/admin/prompts?status=review" className="text-electric hover:underline">
              Review pending prompts ({stats.pendingPrompts})
            </Link>
            <Link href="/admin/purchases" className="text-electric hover:underline">
              View live purchases
            </Link>
            <Link href="/admin/sales" className="text-electric hover:underline">
              View Stripe transactions ({stats.stripePayments})
            </Link>
            <Link href="/admin/users" className="text-electric hover:underline">
              Manage users
            </Link>
            <Link href="/admin/anime-ad" className="text-electric hover:underline">
              Anime Ad Generator
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <BarChartPlaceholder
          title="📈 Revenue (last 30 days)"
          description={`${formatCurrency(revenue30DayTotal)} total · live paid purchases only`}
          data={stats.revenueLast30Days.filter((_, index) => index % 5 === 0 || index === 29)}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Recent audit activity</h2>
        </CardHeader>
        <CardContent className="pt-0">
          {auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit events yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {auditLogs.map((log) => (
                <li key={log.id} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-muted-foreground">
                      {log.actor} · {log.entityType} {log.entityId.slice(0, 8)}
                    </p>
                  </div>
                  <span className="shrink-0 text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
