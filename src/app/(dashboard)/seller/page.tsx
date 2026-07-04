import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import {
  BarChart3,
  DollarSign,
  FileText,
  Star,
  TrendingUp,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  formatCurrency,
  formatDate,
  getSellerOverviewStats,
  getSellerSales,
} from "@/lib/marketplace";

export default async function SellerOverviewPage() {
  const user = await currentUser();
  const stats = user
    ? await getSellerOverviewStats(user.id)
    : { totalSales: 0, activePrompts: 0, avgRating: 0, totalEarnings: 0 };
  const recentSales = user ? (await getSellerSales(user.id)).slice(0, 5) : [];

  return (
    <>
      <PageHeader
        title="Seller Overview"
        description="Track your prompt performance and earnings at a glance."
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/seller/upload">
          <Button variant="primary" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Prompt
          </Button>
        </Link>
        <Link href="/seller/analytics">
          <Button variant="outline" size="sm" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Sales"
          value={String(stats.totalSales)}
          icon={<TrendingUp className="h-4 w-4 text-electric" />}
        />
        <StatCard
          label="Active Prompts"
          value={String(stats.activePrompts)}
          icon={<FileText className="h-4 w-4 text-electric" />}
        />
        <StatCard
          label="Avg. Rating"
          value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
          icon={<Star className="h-4 w-4 text-purple" />}
        />
        <StatCard
          label="Total Earnings"
          value={formatCurrency(stats.totalEarnings)}
          icon={<DollarSign className="h-4 w-4 text-purple" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent Sales</h2>
              <p className="text-sm text-muted-foreground">
                Your latest transactions
              </p>
            </div>
            <Link href="/seller/sales">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {recentSales.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No sales yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Prompt</th>
                      <th className="pb-3 pr-4 font-medium">Buyer</th>
                      <th className="pb-3 pr-4 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale) => (
                      <tr
                        key={sale.id}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium">
                          {sale.promptTitle}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {sale.buyer}
                        </td>
                        <td className="py-3 pr-4">
                          {formatCurrency(sale.amount)}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {formatDate(sale.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Performance Snapshot</h2>
            <p className="text-sm text-muted-foreground">
              Key metrics from your store
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {[
                {
                  label: "Total sales",
                  value: String(stats.totalSales),
                  pct: Math.min(stats.totalSales * 5, 100),
                },
                {
                  label: "Active prompts",
                  value: String(stats.activePrompts),
                  pct: Math.min(stats.activePrompts * 10, 100),
                },
                {
                  label: "Avg. rating",
                  value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—",
                  pct: stats.avgRating > 0 ? (stats.avgRating / 5) * 100 : 0,
                },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className="font-medium">{metric.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-electric to-purple"
                      style={{ width: `${metric.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {stats.avgRating >= 4.5 && (
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="electric">Top seller</Badge>
                <Badge variant="purple">
                  {stats.avgRating.toFixed(1)} avg rating
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
