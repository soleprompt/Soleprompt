import { PageHeader } from "@/components/dashboard/PageHeader";
import { adminUpdateCommissionSettings } from "@/app/actions/creator-admin";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getPlatformSettings } from "@/lib/commissions";

export default async function AdminProgramSettingsPage() {
  const settings = await getPlatformSettings();

  return (
    <>
      <PageHeader
        title="Program Settings"
        description="Adjust creator and affiliate commission rates."
      />

      <Card className="max-w-xl">
        <CardHeader>
          <h2 className="text-lg font-semibold">Revenue split</h2>
          <p className="text-sm text-muted-foreground">
            Creators earn {settings.creatorCommissionPercent}% by default. Affiliates
            earn {settings.affiliateCommissionPercent}% on referred purchases.
            Platform keeps the remainder.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <form action={adminUpdateCommissionSettings} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Creator commission (%)
              </label>
              <Input
                name="creatorCommissionPercent"
                type="number"
                min={0}
                max={100}
                step="0.1"
                defaultValue={settings.creatorCommissionPercent}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Affiliate commission (%)
              </label>
              <Input
                name="affiliateCommissionPercent"
                type="number"
                min={0}
                max={100}
                step="0.1"
                defaultValue={settings.affiliateCommissionPercent}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Minimum payout ($)
              </label>
              <Input
                name="minPayoutAmount"
                type="number"
                min={1}
                step="0.01"
                defaultValue={settings.minPayoutAmount}
                required
              />
            </div>
            <Button type="submit">Save settings</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
