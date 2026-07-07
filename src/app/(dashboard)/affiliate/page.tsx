import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowRight, Copy, MousePointerClick, TrendingUp } from "lucide-react";
import { joinAffiliateProgram } from "@/app/actions/affiliate";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";
import { getAffiliateDashboard } from "@/lib/affiliate-program";
import { syncClerkUser } from "@/lib/user";

export default async function AffiliatePage() {
  const clerkUser = await currentUser();
  const dbUser = clerkUser ? await syncClerkUser(clerkUser) : null;
  const dashboard = dbUser ? await getAffiliateDashboard(dbUser.id) : null;

  if (!dashboard) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Affiliate Program"
          description="Earn commission by referring students, creators, and entrepreneurs to SolePrompt."
        />
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">
              Get a unique referral link, track clicks and conversions, and request
              payouts when you hit the minimum threshold.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Unique referral code and link</li>
              <li>• Click and conversion tracking</li>
              <li>• Commission on referred purchases</li>
              <li>• Marketing assets and leaderboard</li>
            </ul>
            <form action={joinAffiliateProgram}>
              <Button type="submit" className="group">
                Apply to Affiliate Program
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { affiliate, referralLink, commissionPercent } = dashboard;
  const statusLabel =
    affiliate.status === "approved"
      ? "Active"
      : affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1);

  return (
    <>
      <PageHeader
        title="Affiliate Overview"
        description="Share your link and earn commission on every referred purchase."
      />

      <div className="mb-4">
        <Badge variant={affiliate.status === "approved" ? "electric" : "outline"}>
          {statusLabel}
        </Badge>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Clicks"
          value={affiliate.totalClicks.toString()}
          icon={<MousePointerClick className="h-4 w-4 text-electric" />}
        />
        <StatCard
          label="Conversions"
          value={affiliate.totalConversions.toString()}
          icon={<TrendingUp className="h-4 w-4 text-electric" />}
        />
        <StatCard
          label="Total Earnings"
          value={formatCurrency(affiliate.totalEarnings)}
        />
        <StatCard
          label="Available"
          value={formatCurrency(dashboard.availableBalance)}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Your referral link</h2>
          <p className="text-sm text-muted-foreground">
            Code: <strong className="text-foreground">{affiliate.code}</strong> ·{" "}
            {commissionPercent}% commission
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 overflow-x-auto rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
              {referralLink}
            </code>
            <Link href="/affiliate/assets">
              <Button variant="outline" className="w-full sm:w-auto">
                <Copy className="mr-2 h-4 w-4" />
                Marketing assets
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {affiliate.status !== "approved" && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Your affiliate application is <strong>{affiliate.status}</strong>.
            You&apos;ll get full tracking and payouts once approved.
          </CardContent>
        </Card>
      )}
    </>
  );
}
