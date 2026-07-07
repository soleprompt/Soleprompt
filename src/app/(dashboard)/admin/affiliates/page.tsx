import { PageHeader } from "@/components/dashboard/PageHeader";
import { AffiliateAdminActions } from "@/components/admin/AffiliateAdminActions";
import { Card, CardContent } from "@/components/ui/Card";
import { getAdminAffiliates } from "@/lib/affiliate-program";
import { formatCurrency } from "@/lib/format";

export default async function AdminAffiliatesPage() {
  const affiliates = await getAdminAffiliates();

  return (
    <>
      <PageHeader
        title="Affiliates"
        description="Manage affiliate applications and partner accounts."
      />

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Partner</th>
                  <th className="pb-3 pr-4 font-medium">Code</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Clicks</th>
                  <th className="pb-3 pr-4 font-medium">Earnings</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="border-b border-border/50">
                    <td className="py-4 pr-4">
                      <p className="font-medium">@{affiliate.user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {affiliate.user.email}
                      </p>
                    </td>
                    <td className="py-4 pr-4 font-mono text-xs">{affiliate.code}</td>
                    <td className="py-4 pr-4 capitalize">{affiliate.status}</td>
                    <td className="py-4 pr-4">{affiliate.totalClicks}</td>
                    <td className="py-4 pr-4">
                      {formatCurrency(affiliate.totalEarnings)}
                    </td>
                    <td className="py-4">
                      <AffiliateAdminActions
                        affiliateId={affiliate.id}
                        status={affiliate.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
