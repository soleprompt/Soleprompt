import { currentUser } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  formatCurrency,
  formatDate,
  formatPurchaseAmount,
  getSellerSales,
} from "@/lib/marketplace";
import type { PurchaseStatus } from "@/generated/prisma/client";

function statusBadge(status: PurchaseStatus) {
  switch (status) {
    case "completed":
      return { variant: "electric" as const, label: "Completed" };
    case "pending":
      return { variant: "purple" as const, label: "Pending" };
    default:
      return { variant: "outline" as const, label: "Refunded" };
  }
}

export default async function SellerSalesPage() {
  const user = await currentUser();
  const sales = user ? await getSellerSales(user.id) : [];

  const paidSales = sales.filter((s) => s.status === "completed" && !s.isFree);
  const freeDownloads = sales.filter((s) => s.status === "completed" && s.isFree);
  const totalRevenue = paidSales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <>
      <PageHeader
        title="Sales"
        description="View your recent sales and transaction history."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <StatCard label="Paid Sales" value={String(paidSales.length)} />
        <StatCard label="Free Downloads" value={String(freeDownloads.length)} />
        <StatCard
          label="Avg. Order Value"
          value={
            paidSales.length > 0
              ? formatCurrency(totalRevenue / paidSales.length)
              : "$0.00"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <p className="text-sm text-muted-foreground">
            {sales.length} transactions · {freeDownloads.length} free download
            {freeDownloads.length === 1 ? "" : "s"}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {sales.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No sales recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Prompt</th>
                    <th className="pb-3 pr-4 font-medium">Buyer</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => {
                    const badge = statusBadge(sale.status);
                    return (
                      <tr
                        key={sale.id}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-4 pr-4 text-muted-foreground">
                          {formatDate(sale.date)}
                        </td>
                        <td className="py-4 pr-4 font-medium">
                          {sale.promptTitle}
                        </td>
                        <td className="py-4 pr-4 text-muted-foreground">
                          {sale.buyer}
                        </td>
                        <td className="py-4 pr-4">
                          {sale.isFree ? (
                            <Badge variant="purple">Free</Badge>
                          ) : (
                            formatPurchaseAmount(sale.amount)
                          )}
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
