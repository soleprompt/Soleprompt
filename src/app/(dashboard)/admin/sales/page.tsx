import { TrendingUp } from "lucide-react";
import { AdminTableFilters } from "@/components/dashboard/AdminTableFilters";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getAdminOverviewStats, getAdminSales } from "@/lib/admin-data";
import { formatCurrency, formatDate } from "@/lib/format";

interface AdminSalesPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AdminSalesPage({
  searchParams,
}: AdminSalesPageProps) {
  const { search } = await searchParams;
  const [stats, sales] = await Promise.all([
    getAdminOverviewStats(),
    getAdminSales({ search }),
  ]);

  return (
    <>
      <PageHeader
        title="Sales"
        description="Platform-wide Stripe transactions and seller earnings."
      />

      <AdminTableFilters
        search={search}
        searchPlaceholder="Search by prompt, seller, buyer, or session ID…"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Completed Purchases</p>
            <p className="mt-1 text-2xl font-bold">{stats.totalPurchases}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Gross Revenue</p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Stripe Payments</p>
            <p className="mt-1 text-2xl font-bold">{stats.stripePayments}</p>
          </CardContent>
        </Card>
      </div>

      {sales.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No sales data"
          description="Stripe transactions will appear here after checkout completes."
        />
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Transactions</h2>
          </CardHeader>
          <CardContent className="overflow-x-auto pt-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Prompt</th>
                  <th className="pb-3 pr-4 font-medium">Seller</th>
                  <th className="pb-3 pr-4 font-medium">Buyer</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-4 pr-4 font-medium">{sale.promptTitle}</td>
                    <td className="py-4 pr-4">
                      <p>{sale.seller}</p>
                      <p className="text-muted-foreground">{sale.sellerEmail}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <p>{sale.buyer}</p>
                      <p className="text-muted-foreground">{sale.buyerEmail}</p>
                    </td>
                    <td className="py-4 pr-4">{formatCurrency(sale.amount)}</td>
                    <td className="py-4 pr-4">
                      <Badge
                        variant={sale.status === "completed" ? "electric" : "outline"}
                      >
                        {sale.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {formatDate(sale.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
