import { Flag } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function AdminReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Review flagged content and user reports."
      />
      <EmptyState
        icon={Flag}
        title="No open reports"
        description="User-submitted reports will be listed here for review."
      />
    </>
  );
}
