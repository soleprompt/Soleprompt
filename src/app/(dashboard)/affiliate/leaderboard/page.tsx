import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { getAffiliateLeaderboard } from "@/lib/affiliate-program";

export default async function AffiliateLeaderboardPage() {
  const leaders = await getAffiliateLeaderboard(20);

  return (
    <>
      <PageHeader
        title="Affiliate Leaderboard"
        description="Top partners by referred revenue."
      />

      <Card>
        <CardContent className="pt-6">
          {leaders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Leaderboard updates as affiliates earn commissions.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">#</th>
                    <th className="pb-3 pr-4 font-medium">Affiliate</th>
                    <th className="pb-3 pr-4 font-medium">Conversions</th>
                    <th className="pb-3 font-medium">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-border/50">
                      <td className="py-3 pr-4">{index + 1}</td>
                      <td className="py-3 pr-4 font-medium">
                        @{entry.user.username}
                      </td>
                      <td className="py-3 pr-4">{entry.totalConversions}</td>
                      <td className="py-3 font-medium">
                        {formatCurrency(entry.totalEarnings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
