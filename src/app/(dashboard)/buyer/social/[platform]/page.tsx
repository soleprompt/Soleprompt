import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { LockedToolPurchaseCta } from "@/components/analytics/LockedToolPurchaseCta";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SocialToolPanel } from "@/components/social-tools/SocialToolPanel";
import {
  getSocialSuiteProductId,
  hasSocialSuiteAccess,
} from "@/lib/social-tools/access";
import {
  SOCIAL_TOOL_LABELS,
  type SocialToolPlatform,
} from "@/lib/social-tools/constants";
import { recordToolVisit } from "@/lib/tool-visits";
import { socialPlatformToolSlug } from "@/lib/tool-visits/constants";
import { parseUtmAttribution } from "@/lib/utm";

type PlatformPageProps = {
  params: Promise<{ platform: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePlatform(value: string): SocialToolPlatform | null {
  if (value === "facebook" || value === "instagram" || value === "linkedin") {
    return value;
  }
  return null;
}

export default async function BuyerSocialPlatformPage({
  params,
  searchParams,
}: PlatformPageProps) {
  const platform = parsePlatform((await params).platform);
  if (!platform) {
    redirect("/buyer/social");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const utmParams = parseUtmAttribution(await searchParams);
  void recordToolVisit(socialPlatformToolSlug(platform), user.id, utmParams);

  const label = SOCIAL_TOOL_LABELS[platform];
  const hasAccess = await hasSocialSuiteAccess(user.id);

  if (!hasAccess) {
    const productId = await getSocialSuiteProductId();
    return (
      <>
        <PageHeader
          title={`${label} Scrubber`}
          description={`Connect ${label} and clean up brand-risk content.`}
        />
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card/50 p-8 text-center">
          <h2 className="text-xl font-semibold">Premium tool locked</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Purchase the Social Scrubbing Suite to connect {label} and prepare
            for content scanning and cleanup.
          </p>
          <LockedToolPurchaseCta
            href={
              productId
                ? `/prompts/${productId}`
                : "/explore?search=social+scrubbing"
            }
            targetKey="social-suite"
            source={`locked-${platform}`}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`${label} Scrubber`}
        description={`Connect your ${label} account. Scanning and deletion workflows are coming soon.`}
      />
      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">Loading…</div>
        }
      >
        <SocialToolPanel platform={platform} />
      </Suspense>
    </>
  );
}
