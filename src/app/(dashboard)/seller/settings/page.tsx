import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SellerSettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your seller account and profile."
      />

      <ProfileSettings />

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Payout Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure how you receive earnings from prompt sales.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="payout-method"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Payout Method
                </label>
                <select
                  id="payout-method"
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-electric/50"
                  defaultValue="paypal"
                >
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="payout-email"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Payout Email
                </label>
                <Input
                  id="payout-email"
                  type="email"
                  placeholder="you@example.com"
                  defaultValue="seller@example.com"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="min-payout"
                className="mb-1.5 block text-sm font-medium"
              >
                Minimum Payout Threshold
              </label>
              <Input
                id="min-payout"
                type="number"
                defaultValue="50"
                min="25"
                step="5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Payouts are processed automatically when your balance exceeds this
                amount.
              </p>
            </div>
            <Button type="button" variant="primary">
              Save Payout Settings
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Seller Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Notification and listing preferences.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "sales-notifications",
                label: "Sales notifications",
                description: "Get notified when someone purchases your prompts.",
              },
              {
                id: "review-notifications",
                label: "Review notifications",
                description: "Get notified when buyers leave reviews.",
              },
              {
                id: "payout-notifications",
                label: "Payout notifications",
                description: "Get notified when payouts are processed.",
              },
            ].map((pref) => (
              <label
                key={pref.id}
                htmlFor={pref.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted/30"
              >
                <input
                  id={pref.id}
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 h-4 w-4 rounded border-border accent-electric"
                />
                <div>
                  <p className="text-sm font-medium">{pref.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {pref.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
