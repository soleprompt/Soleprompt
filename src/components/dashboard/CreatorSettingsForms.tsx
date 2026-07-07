"use client";

import { useActionState } from "react";
import {
  updateCreatorPayoutMethod,
  updateCreatorProfile,
  type CreatorActionState,
} from "@/app/actions/creator";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const initialState: CreatorActionState = {};

interface CreatorSettingsFormsProps {
  displayName: string;
  bio?: string | null;
  payoutEmail?: string | null;
  payoutMethod?: string | null;
}

export function CreatorSettingsForms({
  displayName,
  bio,
  payoutEmail,
  payoutMethod,
}: CreatorSettingsFormsProps) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateCreatorProfile,
    initialState,
  );
  const [payoutState, payoutAction, payoutPending] = useActionState(
    updateCreatorPayoutMethod,
    initialState,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Creator profile</h2>
          <p className="text-sm text-muted-foreground">
            Shown on your public creator page.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <form action={profileAction} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium">
                Display name
              </label>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={displayName}
                required
              />
            </div>
            <div>
              <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={bio ?? ""}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                placeholder="Tell buyers about your expertise..."
              />
            </div>
            <Button type="submit" disabled={profilePending}>
              {profilePending ? "Saving..." : "Save profile"}
            </Button>
            {profileState.error && (
              <p className="text-sm text-red-400">{profileState.error}</p>
            )}
            {profileState.success && (
              <p className="text-sm text-emerald-400">{profileState.success}</p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Payout settings</h2>
          <p className="text-sm text-muted-foreground">
            Required before requesting a manual payout.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <form action={payoutAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="payoutMethod" className="mb-1.5 block text-sm font-medium">
                  Payout method
                </label>
                <select
                  id="payoutMethod"
                  name="payoutMethod"
                  defaultValue={payoutMethod ?? "PayPal"}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
                >
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Venmo">Venmo</option>
                </select>
              </div>
              <div>
                <label htmlFor="payoutEmail" className="mb-1.5 block text-sm font-medium">
                  Payout email
                </label>
                <Input
                  id="payoutEmail"
                  name="payoutEmail"
                  type="email"
                  defaultValue={payoutEmail ?? ""}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={payoutPending}>
              {payoutPending ? "Saving..." : "Save payout settings"}
            </Button>
            {payoutState.error && (
              <p className="text-sm text-red-400">{payoutState.error}</p>
            )}
            {payoutState.success && (
              <p className="text-sm text-emerald-400">{payoutState.success}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
