import { Users } from "lucide-react";
import { AdminTableFilters } from "@/components/dashboard/AdminTableFilters";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getAdminUsers } from "@/lib/admin-data";
import { formatCurrency, formatDate } from "@/lib/format";
import type { UserRole } from "@/generated/prisma/client";

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "buyer", label: "Buyers" },
  { value: "seller", label: "Sellers" },
  { value: "admin", label: "Admins" },
];

interface AdminUsersPageProps {
  searchParams: Promise<{ search?: string; role?: string }>;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const { search, role } = await searchParams;
  const roleFilter = role && role !== "all" ? (role as UserRole) : "all";

  const users = await getAdminUsers({ search, role: roleFilter });

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage buyer, seller, and admin accounts."
      />

      <AdminTableFilters
        search={search}
        searchPlaceholder="Search by username or email…"
        role={roleFilter}
        roleOptions={ROLE_OPTIONS}
      />

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0 pt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-6 pb-3 font-medium">User</th>
                  <th className="px-6 pb-3 font-medium">Email</th>
                  <th className="px-6 pb-3 font-medium">Role</th>
                  <th className="px-6 pb-3 font-medium">Prompts</th>
                  <th className="px-6 pb-3 font-medium">Purchases</th>
                  <th className="px-6 pb-3 font-medium">Sales</th>
                  <th className="px-6 pb-3 font-medium">Earnings</th>
                  <th className="px-6 pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-6 py-4 font-medium">@{user.username}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={user.role === "admin" ? "purple" : "outline"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{user.prompts}</td>
                    <td className="px-6 py-4">{user.purchases}</td>
                    <td className="px-6 py-4">{user.salesCount}</td>
                    <td className="px-6 py-4">{formatCurrency(user.totalEarnings)}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(user.createdAt)}
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
