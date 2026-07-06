import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate, getSellerReviews } from "@/lib/marketplace";

export default async function SellerReviewsPage() {
  const user = await currentUser();
  const reviews = user ? await getSellerReviews(user.id) : [];

  return (
    <>
      <PageHeader
        title="Reviews"
        description="See what buyers are saying about your prompts."
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Reviews from buyers will appear here after they purchase your prompts."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/prompts/${review.promptId}`}
                      className="font-medium text-foreground hover:text-electric"
                    >
                      {review.promptTitle}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      by @{review.buyerUsername} · {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm text-electric">
                    {"★".repeat(review.rating)}
                    <span className="text-muted-foreground">
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
