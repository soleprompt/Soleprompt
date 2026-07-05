import { FileText } from "lucide-react";
import { AdminPromptActions } from "@/components/dashboard/AdminPromptActions";
import { AdminTableFilters } from "@/components/dashboard/AdminTableFilters";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/format";
import { getAdminPrompts } from "@/lib/admin-data";
import type { PromptStatus } from "@/generated/prisma/client";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "review", label: "Pending review" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "rejected", label: "Rejected" },
];

function statusBadge(status: PromptStatus) {
  switch (status) {
    case "published":
      return { variant: "electric" as const, label: "Published" };
    case "review":
      return { variant: "purple" as const, label: "In Review" };
    case "rejected":
      return { variant: "outline" as const, label: "Rejected" };
    default:
      return { variant: "default" as const, label: "Draft" };
  }
}

interface AdminPromptsPageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function AdminPromptsPage({
  searchParams,
}: AdminPromptsPageProps) {
  const { search, status } = await searchParams;
  const statusFilter =
    status && status !== "all" ? (status as PromptStatus) : "all";

  const prompts = await getAdminPrompts({
    search,
    status: statusFilter,
  });

  const pendingCount = prompts.filter((p) => p.status === "review").length;

  return (
    <>
      <PageHeader
        title="Prompts"
        description="Review, approve, and manage marketplace listings."
      />

      <AdminTableFilters
        search={search}
        searchPlaceholder="Search by title, seller, or email…"
        status={statusFilter}
        statusOptions={STATUS_OPTIONS}
      />

      {prompts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No prompts found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Marketplace prompts</h2>
                <p className="text-sm text-muted-foreground">
                  {prompts.length} prompt{prompts.length === 1 ? "" : "s"}
                  {pendingCount > 0 ? ` · ${pendingCount} pending review` : ""}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Title</th>
                    <th className="pb-3 pr-4 font-medium">Seller</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Price</th>
                    <th className="pb-3 pr-4 font-medium">Sales</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Updated</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prompts.map((prompt) => {
                    const badge = statusBadge(prompt.status);
                    return (
                      <tr
                        key={prompt.id}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-medium">{prompt.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-muted-foreground">
                            {prompt.description}
                          </p>
                        </td>
                        <td className="py-4 pr-4">
                          <p>{prompt.seller}</p>
                          <p className="text-muted-foreground">{prompt.sellerEmail}</p>
                        </td>
                        <td className="py-4 pr-4 text-muted-foreground">
                          {prompt.category}
                        </td>
                        <td className="py-4 pr-4">{formatCurrency(prompt.price)}</td>
                        <td className="py-4 pr-4">{prompt.sales}</td>
                        <td className="py-4 pr-4">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="py-4 pr-4 text-muted-foreground">
                          {formatDate(prompt.updatedAt)}
                        </td>
                        <td className="py-4">
                          {prompt.status === "review" ? (
                            <AdminPromptActions promptId={prompt.id} />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
