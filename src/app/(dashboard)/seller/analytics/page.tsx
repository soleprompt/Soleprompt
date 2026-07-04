import { currentUser } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { BarChartPlaceholder } from "@/components/dashboard/BarChartPlaceholder";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency, getSellerAnalytics } from "@/lib/marketplace";

export default async function SellerAnalyticsPage() {
  const user = await currentUser();
  const analytics = user
    ? await getSellerAnalytics(user.id)
    : {
        totalViews: 0,
        conversionRate: 0,
        avgOrderValue: 0,
        repeatBuyersPct: 0,
        topPrompts: [],
        weeklyViews: [],
      };

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Understand how your prompts are performing."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Views"
          value={analytics.totalViews.toLocaleString()}
        />
        <StatCard
          label="Conversion Rate"
          value={`${analytics.conversionRate}%`}
        />
        <StatCard
          label="Avg. Order Value"
          value={formatCurrency(analytics.avgOrderValue)}
        />
        <StatCard
          label="Repeat Buyers"
          value={`${analytics.repeatBuyersPct}%`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartPlaceholder
          title="Weekly Views"
          description="Store page views over the last 7 days"
          data={analytics.weeklyViews}
        />

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Top Performing Prompts</h2>
            <p className="text-sm text-muted-foreground">
              Ranked by revenue
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {analytics.topPrompts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No sales data yet.
              </p>
            ) : (
              <div className="space-y-4">
                {analytics.topPrompts.map((prompt, index) => {
                  const maxRevenue = analytics.topPrompts[0]?.revenue ?? 1;
                  const pct = (prompt.revenue / maxRevenue) * 100;

                  return (
                    <div key={prompt.title}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-electric/10 text-xs text-electric">
                            {index + 1}
                          </span>
                          {prompt.title}
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(prompt.revenue)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-electric to-purple"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                        <span>{prompt.views.toLocaleString()} views</span>
                        <span>{prompt.sales} sales</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
