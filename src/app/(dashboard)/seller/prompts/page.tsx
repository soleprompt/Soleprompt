import Link from "next/link";
import { Eye, Pencil, Trash2, Upload } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DeletePromptButton } from "@/components/dashboard/DeletePromptButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  formatCurrency,
  formatDate,
  getSellerPrompts,
} from "@/lib/marketplace";
import type { PromptStatus } from "@/generated/prisma/client";

function statusBadgeVariant(status: PromptStatus) {
  switch (status) {
    case "published":
      return "electric" as const;
    case "review":
      return "purple" as const;
    case "rejected":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}

function statusLabel(status: PromptStatus) {
  switch (status) {
    case "published":
      return "Published";
    case "review":
      return "In Review";
    case "rejected":
      return "Rejected";
    default:
      return "Draft";
  }
}

export default async function SellerPromptsPage() {
  const user = await currentUser();
  const prompts = user ? await getSellerPrompts(user.id) : [];

  const publishedCount = prompts.filter((p) => p.status === "published").length;
  const draftCount = prompts.filter((p) => p.status === "draft").length;

  return (
    <>
      <PageHeader
        title="My Prompts"
        description="Manage your published and draft prompt listings."
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge variant="electric">{publishedCount} published</Badge>
          <Badge variant="outline">{draftCount} drafts</Badge>
        </div>
        <Link href="/seller/upload">
          <Button variant="primary" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload New Prompt
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">All Listings</h2>
          <p className="text-sm text-muted-foreground">
            {prompts.length} prompts total
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {prompts.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No prompts yet. Upload your first prompt to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Title</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Price</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Sales</th>
                    <th className="pb-3 pr-4 font-medium">Rating</th>
                    <th className="pb-3 pr-4 font-medium">Updated</th>
                    <th className="pb-3 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prompts.map((prompt) => (
                    <tr
                      key={prompt.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-4 pr-4">
                        <p className="font-medium">{prompt.title}</p>
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {prompt.category}
                      </td>
                      <td className="py-4 pr-4">
                        {formatCurrency(prompt.price)}
                      </td>
                      <td className="py-4 pr-4">
                        <Badge variant={statusBadgeVariant(prompt.status)}>
                          {statusLabel(prompt.status)}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4">{prompt.sales}</td>
                      <td className="py-4 pr-4">
                        {prompt.rating > 0 ? (
                          <span>{prompt.rating.toFixed(1)} ★</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {formatDate(prompt.updatedAt)}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          {prompt.status === "published" && (
                            <Link href={`/prompts/${prompt.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                aria-label="View prompt"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/seller/prompts/${prompt.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              aria-label="Edit prompt"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeletePromptButton promptId={prompt.id}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              aria-label="Delete prompt"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DeletePromptButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
