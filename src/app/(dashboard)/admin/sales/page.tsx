import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function AdminSalesPage() {
  return (
    <>
      <PageHeader
        title="Sales"
        description="Platform-wide sales and transaction overview."
      />
      <EmptyState
        icon={TrendingUp}
        title="No sales data"
        description="Sales analytics will populate as transactions occur on the platform."
      />
    </>
  );
}
