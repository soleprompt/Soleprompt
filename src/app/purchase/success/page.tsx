import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { fulfillFreePurchase, fulfillPurchase } from "@/app/actions/purchase";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  getPromptById,
  mapPromptToListItem,
} from "@/lib/marketplace";
import { formatPurchaseAmount } from "@/lib/format";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

interface PurchaseSuccessPageProps {
  searchParams: Promise<{ session_id?: string; purchase_id?: string }>;
}

export default async function PurchaseSuccessPage({
  searchParams,
}: PurchaseSuccessPageProps) {
  const { session_id: sessionId, purchase_id: purchaseId } = await searchParams;

  let result: { success: boolean; promptId?: string; error?: string };

  if (purchaseId) {
    result = await fulfillFreePurchase(purchaseId);
  } else if (sessionId) {
    if (!isStripeConfigured()) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
          <Card className="w-full max-w-lg">
            <CardContent className="pt-8 text-center">
              <h1 className="text-2xl font-bold">Purchase unavailable</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Payments are not configured for this environment.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    result = await fulfillPurchase(sessionId);
  } else {
    redirect("/buyer");
  }

  const prompt = result.promptId ? await getPromptById(result.promptId) : null;
  const listing = prompt ? mapPromptToListItem(prompt) : null;
  const isFree = Boolean(purchaseId) || (prompt?.price ?? 0) <= 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center pt-8 text-center">
          {result.success ? (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-electric/10">
                <CheckCircle2 className="h-8 w-8 text-electric" />
              </div>
              <h1 className="text-2xl font-bold">
                {isFree ? "You're all set!" : "Purchase successful"}
              </h1>
              {listing && prompt ? (
                <>
                  <p className="mt-2 text-lg font-medium">{listing.title}</p>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    {listing.description}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {formatPurchaseAmount(prompt.price)} · {listing.category}
                  </p>
                </>
              ) : (
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Your prompt is unlocked and ready to use.
                </p>
              )}
              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                {result.promptId && (
                  <Link href={`/prompts/${result.promptId}`}>
                    <Button variant="primary" className="w-full sm:w-auto">
                      View prompt
                    </Button>
                  </Link>
                )}
                <Link href="/buyer">
                  <Button variant="outline" className="w-full gap-2 sm:w-auto">
                    <ShoppingBag className="h-4 w-4" />
                    My Purchases
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Processing your purchase</h1>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {result.error ??
                  "We could not confirm your payment yet. If you were charged, your prompt will appear in My Purchases shortly."}
              </p>
              <Link href="/buyer" className="mt-8">
                <Button variant="outline">Go to My Purchases</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
