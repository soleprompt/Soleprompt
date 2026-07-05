import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ExternalLink, Receipt } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  formatCurrency,
  formatDate,
  formatPurchaseAmount,
  getBuyerPurchaseHistory,
} from "@/lib/marketplace";
import type { PurchaseStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Purchase History",
};

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

export default async function BuyerHistoryPage() {
  const user = await currentUser();
  const history = user ? await getBuyerPurchaseHistory(user.id) : [];

  const completed = history.filter((p) => p.status === "completed");
  const paidPurchases = completed.filter((p) => !p.isFree);
  const freePurchases = completed.filter((p) => p.isFree);
  const totalSpent = paidPurchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <PageHeader
        title="Purchase History"
        description="Invoices, receipts, and every prompt you've acquired."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Purchases" value={String(completed.length)} />
        <StatCard label="Paid Prompts" value={String(paidPurchases.length)} />
        <StatCard label="Free Downloads" value={String(freePurchases.length)} />
        <StatCard label="Total Spent" value={formatCurrency(totalSpent)} />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <p className="text-sm text-muted-foreground">
            {history.length} transaction{history.length === 1 ? "" : "s"}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {history.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No purchases yet"
              description="Your receipts and invoices will appear here after you buy or download prompts."
              action={
                <Link
                  href="/explore"
                  className="mt-4 inline-block text-sm text-electric hover:underline"
                >
                  Explore prompts
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Prompt</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((purchase) => {
                    const badge = statusBadge(purchase.status);
                    return (
                      <tr
                        key={purchase.id}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-4 pr-4 text-muted-foreground">
                          {formatDate(purchase.date)}
                        </td>
                        <td className="py-4 pr-4">
                          <Link
                            href={`/prompts/${purchase.promptId}`}
                            className="font-medium hover:text-electric hover:underline"
                          >
                            {purchase.promptTitle}
                          </Link>
                        </td>
                        <td className="py-4 pr-4">
                          {purchase.isFree ? (
                            <Badge variant="purple">Free</Badge>
                          ) : (
                            formatPurchaseAmount(purchase.amount)
                          )}
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-xs text-muted-foreground">
                              {purchase.id}
                            </span>
                            {purchase.stripePaymentId && (
                              <span className="font-mono text-xs text-muted-foreground">
                                {purchase.stripePaymentId}
                              </span>
                            )}
                            <Link href={`/prompts/${purchase.promptId}`}>
                              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2">
                                <ExternalLink className="h-3 w-3" />
                                Open
                              </Button>
                            </Link>
                          </div>
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
