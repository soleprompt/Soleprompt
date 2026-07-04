import { Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="Manage buyer, seller, and admin accounts."
      />
      <EmptyState
        icon={Users}
        title="User management"
        description="User listings and role management will be available once the database is connected."
      />
    </>
  );
}
