import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { LockedToolPurchaseCta } from "@/components/analytics/LockedToolPurchaseCta";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SocialToolsHub } from "@/components/social-tools/SocialToolsHub";
import {
  getSocialSuiteProductId,
  hasSocialSuiteAccess,
} from "@/lib/social-tools/access";
import { recordToolVisit } from "@/lib/tool-visits";

export default async function BuyerSocialToolsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  void recordToolVisit("social-tools", user.id);

  const hasAccess = await hasSocialSuiteAccess(user.id);
  if (!hasAccess) {
    const productId = await getSocialSuiteProductId();
    return (
      <>
        <PageHeader
          title="Social Tools"
          description="Facebook, Instagram, and LinkedIn reputation cleanup."
        />
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card/50 p-8 text-center">
          <h2 className="text-xl font-semibold">Premium tools locked</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Purchase the Social Scrubbing Suite to connect Facebook, Instagram,
            and LinkedIn accounts and clean up brand-risk content.
          </p>
          <LockedToolPurchaseCta
            href={
              productId
                ? `/prompts/${productId}`
                : "/explore?search=social+scrubbing"
            }
            targetKey="social-suite"
            source="locked-page"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Social Tools"
        description="Connect accounts and prepare for cross-platform reputation cleanup."
      />
      <SocialToolsHub />
    </>
  );
}
