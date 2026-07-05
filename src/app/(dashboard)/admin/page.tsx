import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  getAdminOverviewStats,
  getRecentAuditLogs,
} from "@/lib/admin-data";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminOverviewPage() {
  const [stats, auditLogs] = await Promise.all([
    getAdminOverviewStats(),
    getRecentAuditLogs(8),
  ]);

  const statCards = [
    { label: "Total Users", value: String(stats.totalUsers) },
    { label: "Active Prompts", value: String(stats.activePrompts) },
    { label: "Pending Review", value: String(stats.pendingPrompts) },
    { label: "Completed Purchases", value: String(stats.totalPurchases) },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue) },
    { label: "Stripe Payments", value: String(stats.stripePayments) },
  ];

  return (
    <>
      <PageHeader
        title="Admin Overview"
        description="Platform-wide metrics and management tools."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick links</h2>
          </CardHeader>
          <CardContent className="grid gap-2 pt-0 text-sm">
            <Link href="/admin/prompts?status=review" className="text-electric hover:underline">
              Review pending prompts ({stats.pendingPrompts})
            </Link>
            <Link href="/admin/purchases" className="text-electric hover:underline">
              View all purchases
            </Link>
            <Link href="/admin/sales" className="text-electric hover:underline">
              View Stripe transactions
            </Link>
            <Link href="/admin/users" className="text-electric hover:underline">
              Manage users
            </Link>
          </CardContent>
        </Card>

        <Card>
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
      </div>

      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-electric/10">
            <LayoutDashboard className="h-7 w-7 text-electric" />
          </div>
          <h3 className="text-lg font-semibold">Admin Dashboard</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Manage users, prompts, purchases, and sales from the sidebar.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
