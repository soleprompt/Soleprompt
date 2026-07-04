import Link from "next/link";
import { Star } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  formatCurrency,
  getPromptById,
  mapPromptToListItem,
  recordPromptView,
} from "@/lib/marketplace";
import { syncCurrentUser } from "@/lib/user";

interface PromptDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PromptDetailPage({
  params,
}: PromptDetailPageProps) {
  const { id } = await params;
  const prompt = await getPromptById(id);

  if (!prompt || prompt.status !== "published") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Prompt not found</h1>
        <Link href="/explore" className="mt-4 inline-block text-electric">
          Browse all prompts
        </Link>
      </div>
    );
  }

  const { userId } = await auth();
  if (userId) {
    await syncCurrentUser();
    await recordPromptView(userId, id);
  }

  const listItem = mapPromptToListItem(prompt);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader title={prompt.title} description={prompt.description} />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="outline">{listItem.category}</Badge>
                {listItem.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>By {listItem.author}</span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-electric text-electric" />
                  {listItem.rating > 0 ? listItem.rating : "—"} ({listItem.reviews}{" "}
                  reviews)
                </span>
                <span>{prompt.views.toLocaleString()} views</span>
              </div>
            </CardContent>
          </Card>

          {prompt.reviews.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="mb-4 text-lg font-semibold">Reviews</h2>
                <div className="space-y-4">
                  {prompt.reviews.slice(0, 5).map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-border/50 pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {review.user.username}
                        </span>
                        <span className="text-sm text-electric">
                          {"★".repeat(review.rating)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{formatCurrency(prompt.price)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                One-time purchase · Commercial license included
              </p>
              <button
                type="button"
                className="mt-6 w-full rounded-full bg-electric px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Purchase Prompt
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
