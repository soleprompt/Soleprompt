import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { XScrubberPanel } from "@/components/scrubber/XScrubberPanel";
import { Button } from "@/components/ui/Button";
import {
  getScrubberProductId,
  hasScrubberAccess,
} from "@/lib/scrubber/access";

export default async function BuyerScrubberPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

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
          <Link
            href={
              productId ? `/prompts/${productId}` : "/explore?search=scrubbing"
            }
          >
            <Button className="mt-6">View product</Button>
          </Link>
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
