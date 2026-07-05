import { Suspense } from "react";
import { ShoppingBag } from "lucide-react";
import { AdminTableFilters } from "@/components/dashboard/AdminTableFilters";
import { ClickableTableRow } from "@/components/dashboard/ClickableTableRow";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ExportPurchasesCsvButton } from "@/components/dashboard/ExportPurchasesCsvButton";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  getAdminPurchases,
  type PurchasePeriodFilter,
  type PurchaseTypeFilter,
} from "@/lib/admin-data";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PurchaseStatus } from "@/generated/prisma/client";

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "paid", label: "Paid" },
  { value: "free", label: "Free" },
  { value: "refunded", label: "Refunded" },
];

const PERIOD_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
];

interface AdminPurchasesPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    period?: string;
  }>;
}

export default async function AdminPurchasesPage({
  searchParams,
}: AdminPurchasesPageProps) {
  const { search, status, type, period } = await searchParams;
  const statusFilter =
    status && status !== "all" ? (status as PurchaseStatus) : "all";
  const typeFilter =
    type && type !== "all" ? (type as PurchaseTypeFilter) : "all";
  const periodFilter =
    period && period !== "all" ? (period as PurchasePeriodFilter) : "all";

  const purchases = await getAdminPurchases({
    search,
    status: statusFilter,
    type: typeFilter,
    period: periodFilter,
  });

  return (
    <>
      <PageHeader
        title="Purchases"
        description="Live buyer purchases from Stripe checkout and free downloads."
        action={
          <Suspense fallback={null}>
            <ExportPurchasesCsvButton />
          </Suspense>
        }
      />

      <AdminTableFilters
        search={search}
        searchPlaceholder="Search by prompt, buyer, email, or Stripe ID…"
        type={typeFilter}
        typeOptions={TYPE_OPTIONS}
        period={periodFilter}
        periodOptions={PERIOD_OPTIONS}
        status={statusFilter}
        statusOptions={STATUS_OPTIONS}
      />

      {purchases.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No purchases found"
          description="Live purchases will appear here after checkout completes."
        />
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Live purchase records</h2>
            <p className="text-sm text-muted-foreground">
              {purchases.length} purchase{purchases.length === 1 ? "" : "s"} ·
              click a row for details
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
                    <ClickableTableRow
                      key={purchase.id}
                      href={`/admin/purchases/${purchase.id}`}
                    >
                      <td className="py-4 pr-4 font-medium">{purchase.promptTitle}</td>
                      <td className="py-4 pr-4">
                        <p>{purchase.buyer}</p>
                        <p className="text-muted-foreground">{purchase.buyerEmail}</p>
                      </td>
                      <td className="py-4 pr-4">
                        {purchase.amount <= 0 ? (
                          <Badge variant="purple">FREE</Badge>
                        ) : (
                          formatCurrency(purchase.amount)
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        <Badge
                          variant={
                            purchase.status === "completed"
                              ? "electric"
                              : purchase.status === "refunded"
                                ? "outline"
                                : "outline"
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
                    </ClickableTableRow>
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
