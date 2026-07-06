import Link from "next/link";
import {
  Star,
  Cpu,
  ShoppingBag,
  User,
  Eye,
  Lock,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PurchaseButton } from "@/components/marketplace/PurchaseButton";
import { FavoriteButton } from "@/components/marketplace/FavoriteButton";
import { ReviewForm } from "@/components/marketplace/ReviewForm";
import { CopyPromptButton } from "@/components/marketplace/CopyPromptButton";
import { DownloadPromptButton } from "@/components/marketplace/DownloadPromptButton";
import { PromptVariablesPreview } from "@/components/marketplace/PromptVariablesPreview";
import { extractPromptVariables } from "@/lib/prompt-variables";
import {
  formatCurrency,
  getPromptById,
  getPromptPurchaseState,
  getUserReviewForPrompt,
  isPromptWishlisted,
  mapPromptToListItem,
  recordPromptView,
} from "@/lib/marketplace";
import { syncCurrentUser } from "@/lib/user";

interface PromptDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout?: string }>;
}

export default async function PromptDetailPage({
  params,
  searchParams,
}: PromptDetailPageProps) {
  const { id } = await params;
  const { checkout } = await searchParams;
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
  }
  await recordPromptView(userId, id);

  const purchaseState = await getPromptPurchaseState(
    userId,
    prompt.id,
    prompt.sellerId,
  );

  const [wishlisted, userReview] = userId
    ? await Promise.all([
        isPromptWishlisted(userId, id),
        getUserReviewForPrompt(userId, id),
      ])
    : [false, null];

  const hasFullAccess =
    purchaseState.purchased || purchaseState.isOwnPrompt;

  const listing = mapPromptToListItem(prompt);
  const promptVariables = extractPromptVariables(listing.content);
  const hasVariables = promptVariables.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader title={prompt.title} description={prompt.description} />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="outline">{listing.category}</Badge>
                {listing.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-electric text-electric" />
                  {listing.rating > 0 ? listing.rating : "—"} ({listing.reviews}{" "}
                  reviews)
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {listing.salesCount.toLocaleString()} sold
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {prompt.views.toLocaleString()} views
                </span>
              </div>
            </CardContent>
          </Card>

          {hasVariables && (
            <PromptVariablesPreview
              content={hasFullAccess ? listing.content : ""}
              variableNames={hasFullAccess ? undefined : promptVariables}
              locked={!hasFullAccess}
            />
          )}

          {listing.preview && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Preview</h2>
                <p className="text-sm text-muted-foreground">
                  A teaser of what this prompt delivers before you buy.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="rounded-xl border border-border/60 bg-foreground/[0.02] px-4 py-3 text-sm leading-relaxed text-foreground/90">
                  {listing.preview}
                </p>
              </CardContent>
            </Card>
          )}

          <div id="full-prompt">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Full Prompt</h2>
                {!hasFullAccess && (
                  <Badge variant="purple">
                    <Lock className="mr-1 h-3 w-3" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {hasFullAccess
                  ? "Your purchased prompt content — copy or download anytime."
                  : "Complete prompt content included with purchase."}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {hasFullAccess ? (
                <>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <CopyPromptButton content={listing.content} />
                    <DownloadPromptButton
                      title={listing.title}
                      content={listing.content}
                    />
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-background px-4 py-4 font-mono text-sm leading-relaxed text-foreground/90">
                    {listing.content}
                  </pre>
                </>
              ) : (
                <div className="relative overflow-hidden rounded-xl border border-border bg-background">
                  <pre className="max-h-40 overflow-hidden whitespace-pre-wrap px-4 py-4 font-mono text-sm leading-relaxed text-foreground/40 blur-[2px] select-none">
                    {listing.content.slice(0, 280)}
                    {listing.content.length > 280 ? "…" : ""}
                  </pre>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 px-4 text-center">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      Purchase to unlock the full prompt
                    </p>
                    <p className="text-xs text-muted-foreground">
                      One-time purchase · Commercial license included
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </div>

          {listing.compatibleModels.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Cpu className="h-5 w-5 text-electric" />
                  AI Model Compatibility
                </h2>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {listing.compatibleModels.map((model) => (
                    <Badge key={model} variant="electric">
                      {model}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {listing.sampleOutput && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Sample Output</h2>
                <p className="text-sm text-muted-foreground">
                  Example result when using this prompt with a compatible model.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-xl border border-electric/20 bg-electric/5 px-4 py-4">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {listing.sampleOutput}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

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

          {purchaseState.purchased && (
            <Card>
              <CardContent className="pt-6">
                <ReviewForm
                  promptId={prompt.id}
                  existingRating={userReview?.rating}
                  existingComment={userReview?.comment}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{formatCurrency(prompt.price)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                One-time purchase · Commercial license included
              </p>
              {checkout === "cancelled" && (
                <p className="mt-4 rounded-lg border border-border bg-foreground/[0.02] px-3 py-2 text-sm text-muted-foreground">
                  Checkout was cancelled.
                </p>
              )}
              <PurchaseButton
                promptId={prompt.id}
                price={prompt.price}
                promptTitle={prompt.title}
                purchased={purchaseState.purchased}
                isOwnPrompt={purchaseState.isOwnPrompt}
              />
              <div className="mt-3">
                <FavoriteButton
                  promptId={prompt.id}
                  initialSaved={wishlisted}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5 text-electric" />
                Seller
              </h2>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                href={`/creators/${listing.seller.username}`}
                className="flex items-start gap-3 transition-colors hover:text-electric"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-electric/20 to-purple/20">
                  <User className="h-6 w-6 text-electric" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {listing.seller.displayName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{listing.seller.username}
                  </p>
                  {listing.seller.bio && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {listing.seller.bio}
                    </p>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
