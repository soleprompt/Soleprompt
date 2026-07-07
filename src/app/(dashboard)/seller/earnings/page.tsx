import { currentUser } from "@clerk/nextjs/server";
import { DollarSign } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { CreatorPayoutForm } from "@/components/dashboard/CreatorPayoutForm";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency, formatDate, getSellerEarnings } from "@/lib/marketplace";
import { getPlatformSettings } from "@/lib/commissions";

function payoutStatusBadge(status: "paid" | "processing" | "failed") {
  switch (status) {
    case "paid":
      return { variant: "electric" as const, label: "Paid" };
    case "processing":
      return { variant: "purple" as const, label: "Processing" };
    default:
      return { variant: "outline" as const, label: "Failed" };
  }
}

export default async function SellerEarningsPage() {
  const user = await currentUser();
  const [earnings, settings] = await Promise.all([
    user ? getSellerEarnings(user.id) : Promise.resolve({
      availableBalance: 0,
      pending: 0,
      lifetimeEarnings: 0,
      paidOut: 0,
      minPayoutAmount: 25,
      creatorCommissionPercent: 70,
      payouts: [],
    }),
    getPlatformSettings(),
  ]);

  return (
    <>
      <PageHeader
        title="Revenue"
        description={`You keep ${settings.creatorCommissionPercent}% of every sale. Request manual payouts when you're ready.`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Available Balance"
          value={formatCurrency(earnings.availableBalance)}
          icon={<DollarSign className="h-4 w-4 text-electric" />}
        />
        <StatCard
          label="Pending Payouts"
          value={formatCurrency(earnings.pending)}
          change="Awaiting admin review"
          trend="neutral"
        />
        <StatCard
          label="Lifetime Earnings"
          value={formatCurrency(earnings.lifetimeEarnings)}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Request payout</h2>
        </CardHeader>
        <CardContent className="pt-0">
          <CreatorPayoutForm
            availableBalance={earnings.availableBalance}
            minPayoutAmount={earnings.minPayoutAmount}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Payout History</h2>
          <p className="text-sm text-muted-foreground">
            {earnings.payouts.length} requests on record
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {earnings.payouts.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No payout requests yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Method</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.payouts.map((payout) => {
                    const badge = payoutStatusBadge(payout.status);
                    return (
                      <tr
                        key={payout.id}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-4 pr-4 text-muted-foreground">
                          {formatDate(payout.date)}
                        </td>
                        <td className="py-4 pr-4 font-medium">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="py-4 pr-4 text-muted-foreground">
                          {payout.method}
                        </td>
                        <td className="py-4">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
