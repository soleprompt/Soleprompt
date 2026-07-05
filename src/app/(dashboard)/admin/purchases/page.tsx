import { ShoppingBag } from "lucide-react";
import { AdminTableFilters } from "@/components/dashboard/AdminTableFilters";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getAdminPurchases } from "@/lib/admin-data";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PurchaseStatus } from "@/generated/prisma/client";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
];

interface AdminPurchasesPageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function AdminPurchasesPage({
  searchParams,
}: AdminPurchasesPageProps) {
  const { search, status } = await searchParams;
  const statusFilter =
    status && status !== "all" ? (status as PurchaseStatus) : "all";

  const purchases = await getAdminPurchases({
    search,
    status: statusFilter,
  });

  return (
    <>
      <PageHeader
        title="Purchases"
        description="All buyer purchases across the marketplace."
      />

      <AdminTableFilters
        search={search}
        searchPlaceholder="Search by prompt, buyer, or email…"
        status={statusFilter}
        statusOptions={STATUS_OPTIONS}
      />

      {purchases.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No purchases found"
          description="Completed purchases will appear here after checkout."
        />
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Purchase records</h2>
            <p className="text-sm text-muted-foreground">
              {purchases.length} purchase{purchases.length === 1 ? "" : "s"}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Prompt</th>
                    <th className="pb-3 pr-4 font-medium">Buyer</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Stripe session</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-4 pr-4 font-medium">{purchase.promptTitle}</td>
                      <td className="py-4 pr-4">
                        <p>{purchase.buyer}</p>
                        <p className="text-muted-foreground">{purchase.buyerEmail}</p>
                      </td>
                      <td className="py-4 pr-4">{formatCurrency(purchase.amount)}</td>
                      <td className="py-4 pr-4">
                        <Badge
                          variant={
                            purchase.status === "completed" ? "electric" : "outline"
                          }
                        >
                          {purchase.status}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4 font-mono text-xs text-muted-foreground">
                        {purchase.stripeSessionId?.slice(0, 20) ?? "—"}
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {formatDate(purchase.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
