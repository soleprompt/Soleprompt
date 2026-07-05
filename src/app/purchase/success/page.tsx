import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, ExternalLink, ShoppingBag } from "lucide-react";
import { fulfillFreePurchase, fulfillPurchase } from "@/app/actions/purchase";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getPromptById } from "@/lib/marketplace";
import { formatDate, formatPurchaseAmount } from "@/lib/format";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

interface PurchaseSuccessPageProps {
  searchParams: Promise<{ session_id?: string; purchase_id?: string }>;
}

export default async function PurchaseSuccessPage({
  searchParams,
}: PurchaseSuccessPageProps) {
  const { session_id: sessionId, purchase_id: purchaseId } = await searchParams;

  let result: {
    success: boolean;
    promptId?: string;
    purchaseId?: string;
    amount?: number;
    purchasedAt?: Date;
    error?: string;
  };

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
  const promptTitle = prompt?.title;
  const receiptPurchaseId = result.purchaseId ?? purchaseId;
  const receiptAmount =
    result.amount ?? (purchaseId || result.purchaseId ? prompt?.price ?? 0 : undefined);
  const receiptDate = result.purchasedAt;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center pt-8 text-center">
          {result.success ? (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-electric/10">
                <CheckCircle2 className="h-8 w-8 text-electric" />
              </div>
              <h1 className="text-2xl font-bold">Thank you for your purchase!</h1>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Your prompt is unlocked and ready to use.
              </p>

              {promptTitle && receiptPurchaseId && receiptDate != null && (
                <div className="mt-6 w-full rounded-xl border border-border/60 bg-foreground/[0.02] px-4 py-4 text-left text-sm">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Receipt
                  </p>
                  <dl className="space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Prompt</dt>
                      <dd className="text-right font-medium">{promptTitle}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Amount</dt>
                      <dd className="font-medium">
                        {formatPurchaseAmount(receiptAmount ?? 0)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Date</dt>
                      <dd>{formatDate(receiptDate)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Purchase ID</dt>
                      <dd className="font-mono text-xs">{receiptPurchaseId}</dd>
                    </div>
                  </dl>
                </div>
              )}

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                {result.promptId && (
                  <Link href={`/prompts/${result.promptId}`}>
                    <Button variant="primary" className="w-full gap-2 sm:w-auto">
                      <ExternalLink className="h-4 w-4" />
                      Open Prompt
                    </Button>
                  </Link>
                )}
                <Link href="/buyer">
                  <Button variant="outline" className="w-full gap-2 sm:w-auto">
                    <ShoppingBag className="h-4 w-4" />
                    View My Library
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Processing your purchase</h1>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {result.error ??
                  "We could not confirm your payment yet. If you were charged, your prompt will appear in My Library shortly."}
              </p>
              <Link href="/buyer" className="mt-8">
                <Button variant="outline" className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  View My Library
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
