import { isAdminUser } from "@/lib/admin";
import { createDashboardLayout } from "@/lib/dashboard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return createDashboardLayout("admin", ["admin"], children, {
    hasAccess: isAdminUser,
  });
}
