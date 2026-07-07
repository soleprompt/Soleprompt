import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AffiliatePayoutForm } from "@/components/affiliate/AffiliatePayoutForm";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/format";
import { getAffiliateDashboard, mapAffiliatePayoutStatus } from "@/lib/affiliate-program";
import { syncClerkUser } from "@/lib/user";

export default async function AffiliateEarningsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const dbUser = await syncClerkUser(clerkUser);
  if (!dbUser) redirect("/buyer");

  const dashboard = await getAffiliateDashboard(dbUser.id);
  if (!dashboard) redirect("/affiliate");

  return (
    <>
      <PageHeader
        title="Affiliate Earnings"
        description="Track commissions and request manual payouts."
      />

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Request payout</h2>
        </CardHeader>
        <CardContent className="pt-0">
          <AffiliatePayoutForm
            availableBalance={dashboard.availableBalance}
            minPayoutAmount={dashboard.minPayoutAmount}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Payout history</h2>
        </CardHeader>
        <CardContent className="pt-0">
          {dashboard.payoutRequests.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">No payouts yet.</p>
          ) : (
            <div className="space-y-3">
              {dashboard.payoutRequests.map((payout) => {
                const status = mapAffiliatePayoutStatus(payout.status);
                return (
                  <div
                    key={payout.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{formatCurrency(payout.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payout.createdAt.toISOString())}
                      </p>
                    </div>
                    <Badge variant={status === "paid" ? "electric" : "outline"}>
                      {status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
