import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/format";
import { getAffiliateDashboard } from "@/lib/affiliate-program";
import { syncClerkUser } from "@/lib/user";

export default async function AffiliateReferralsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const dbUser = await syncClerkUser(clerkUser);
  if (!dbUser) redirect("/buyer");

  const dashboard = await getAffiliateDashboard(dbUser.id);
  if (!dashboard) redirect("/affiliate");

  return (
    <>
      <PageHeader
        title="Referral Activity"
        description="Recent clicks and conversions from your referral link."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent clicks</h2>
          </CardHeader>
          <CardContent className="pt-0">
            {dashboard.recentClicks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No clicks yet. Share your link to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {dashboard.recentClicks.map((click) => (
                  <div
                    key={click.id}
                    className="rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <p className="text-foreground">{click.landingPath ?? "/"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(click.createdAt.toISOString())}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Conversions</h2>
          </CardHeader>
          <CardContent className="pt-0">
            {dashboard.recentReferrals.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No conversions yet.
              </p>
            ) : (
              <div className="space-y-2">
                {dashboard.recentReferrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-foreground">
                      {referral.transaction?.prompt.title ?? "Purchase"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(referral.commission)} ·{" "}
                      {formatDate(referral.createdAt.toISOString())}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
