import { LayoutDashboard } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";

export default function AdminOverviewPage() {
  const stats = [
    { label: "Total Users", value: "0" },
    { label: "Active Prompts", value: "0" },
    { label: "Open Reports", value: "0" },
    { label: "Total Revenue", value: "$0" },
  ];

  return (
    <>
      <PageHeader
        title="Admin Overview"
        description="Platform-wide metrics and management tools."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-electric/10">
            <LayoutDashboard className="h-7 w-7 text-electric" />
          </div>
          <h3 className="text-lg font-semibold">Admin Dashboard</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Manage users, prompts, reports, and categories from the sidebar.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
