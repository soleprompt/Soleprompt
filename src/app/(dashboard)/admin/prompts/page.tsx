import { FileText } from "lucide-react";
import { AdminPromptActions } from "@/components/dashboard/AdminPromptActions";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency, formatDate, getReviewPrompts } from "@/lib/marketplace";

export default async function AdminPromptsPage() {
  const prompts = await getReviewPrompts();

  return (
    <>
      <PageHeader
        title="Prompts"
        description="Review and approve marketplace listings submitted for publication."
      />

      {prompts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No prompts in review"
          description="New submissions awaiting approval will appear here."
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Pending Review</h2>
                <p className="text-sm text-muted-foreground">
                  {prompts.length} prompt{prompts.length === 1 ? "" : "s"} awaiting
                  approval
                </p>
              </div>
              <Badge variant="purple">In Review</Badge>
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
                    <th className="pb-3 pr-4 font-medium">Submitted</th>
                    <th className="pb-3 font-medium">Actions</th>
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
                      <td className="py-4 pr-4 text-muted-foreground">
                        {formatDate(prompt.updatedAt)}
                      </td>
                      <td className="py-4">
                        <AdminPromptActions promptId={prompt.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
