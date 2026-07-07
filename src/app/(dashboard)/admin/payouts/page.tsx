import { PageHeader } from "@/components/dashboard/PageHeader";
import { PayoutAdminActions } from "@/components/admin/PayoutAdminActions";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getAdminPayoutRequests } from "@/lib/creator-program";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminPayoutsPage() {
  const payouts = await getAdminPayoutRequests();

  return (
    <>
      <PageHeader
        title="Payout Requests"
        description="Review and process creator and affiliate payout requests."
      />

      <Card>
        <CardContent className="pt-6">
          {payouts.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No payout requests yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">User</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Method</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Requested</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-border/50">
                      <td className="py-4 pr-4">
                        <p className="font-medium">
                          {payout.user.sellerProfile?.displayName ??
                            `@${payout.user.username}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payout.payoutEmail ?? payout.user.email}
                        </p>
                      </td>
                      <td className="py-4 pr-4 capitalize">{payout.kind}</td>
                      <td className="py-4 pr-4 font-medium">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="py-4 pr-4">{payout.payoutMethod ?? "—"}</td>
                      <td className="py-4 pr-4">
                        <Badge variant="outline">{payout.status}</Badge>
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {formatDate(payout.createdAt.toISOString())}
                      </td>
                      <td className="py-4">
                        <PayoutAdminActions
                          payoutId={payout.id}
                          status={payout.status}
                        />
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
