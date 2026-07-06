import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { LockedToolPurchaseCta } from "@/components/analytics/LockedToolPurchaseCta";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { XScrubberPanel } from "@/components/scrubber/XScrubberPanel";
import {
  getScrubberProductId,
  hasScrubberAccess,
} from "@/lib/scrubber/access";
import { recordToolVisit } from "@/lib/tool-visits";
import { parseUtmAttribution } from "@/lib/utm";

export default async function BuyerScrubberPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const utmParams = parseUtmAttribution(await searchParams);
  void recordToolVisit("x-scrubber", user.id, utmParams);

  const hasAccess = await hasScrubberAccess(user.id);
  if (!hasAccess) {
    const productId = await getScrubberProductId();
    return (
      <>
        <PageHeader
          title="X Scrubber"
          description="Delete risky tweets and protect your brand."
        />
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card/50 p-8 text-center">
          <h2 className="text-xl font-semibold">Premium tool locked</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Purchase the X Scrubbing Tool ($20) to connect your account, scan
            tweets for brand risk, and delete selected posts with confirmation.
          </p>
          <LockedToolPurchaseCta
            href={
              productId ? `/prompts/${productId}` : "/explore?search=scrubbing"
            }
            targetKey="x-scrubber"
            source="locked-page"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="X Scrubber"
        description="Scan recent tweets for brand risk, select posts to remove, and confirm deletions. No auto-delete."
      />
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <XScrubberPanel />
      </Suspense>
    </>
  );
}
