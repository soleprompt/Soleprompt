import Link from "next/link";
import { Suspense } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import { XCheckerPanel } from "@/components/scrubber/XCheckerPanel";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  getScrubberProductId,
  hasScrubberAccess,
} from "@/lib/scrubber/access";
import { recordToolVisit } from "@/lib/tool-visits";
import { parseUtmAttribution } from "@/lib/utm";

const FEATURES = [
  {
    icon: Search,
    title: "Scan recent tweets",
    description:
      "Fetch your latest timeline posts and analyze them with keyword heuristics.",
  },
  {
    icon: AlertTriangle,
    title: "Risk scoring",
    description:
      "Flags political, offensive, controversial, and other brand-risk categories.",
  },
  {
    icon: Shield,
    title: "Read-only & free",
    description:
      "See what might hurt your reputation — no tweets are deleted on the free tier.",
  },
  {
    icon: CheckCircle2,
    title: "Actionable summary",
    description:
      "Total scanned, flagged count, and low / medium / high risk breakdown.",
  },
] as const;

function CheckerToolFallback() {
  return (
    <div className="text-sm text-muted-foreground">Loading checker…</div>
  );
}

export default async function XCheckerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await currentUser();
  const utmParams = parseUtmAttribution(await searchParams);
  void recordToolVisit("x-checker", user?.id, utmParams);

  const [scrubberProductId, userHasScrubber] = user
    ? await Promise.all([
        getScrubberProductId(),
        hasScrubberAccess(user.id),
      ])
    : [null, false];

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-purple">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Free X Checker
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Connect your X account and scan recent tweets for brand risk — free,
          read-only, and instant. See flagged posts with risk levels and
          reasons before recruiters or clients do.
        </p>
      </div>

      {!user ? (
        <>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardContent className="p-6">
                  <Icon className="h-5 w-5 text-electric" />
                  <h2 className="mt-3 font-semibold">{title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-10 border-purple/30 bg-purple/5">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <h2 className="text-xl font-semibold">Sign in to run your scan</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Create a free SolePrompt account, connect X via OAuth, and scan
                up to ~200 recent tweets. Upgrade anytime to delete flagged
                posts with the X Scrubbing Tool ($20).
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <SignInButton mode="redirect" forceRedirectUrl="/tools/x-checker">
                  <Button size="lg">Sign in to connect X</Button>
                </SignInButton>
                <SignUpButton mode="redirect" forceRedirectUrl="/tools/x-checker">
                  <Button variant="outline" size="lg">
                    Create account
                  </Button>
                </SignUpButton>
              </div>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Need delete capability?{" "}
            <Link
              href={
                scrubberProductId
                  ? `/prompts/${scrubberProductId}`
                  : "/explore?search=scrubbing"
              }
              className="text-electric hover:underline"
            >
              X Scrubbing Tool ($20)
            </Link>{" "}
            includes bulk delete, confirmation flow, and the full scrubbing
            prompt bundle.
          </p>
        </>
      ) : (
        <div className="mt-10">
          <Suspense fallback={<CheckerToolFallback />}>
            <XCheckerPanel
              scrubberProductId={scrubberProductId}
              hasScrubberAccess={userHasScrubber}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
