"use client";

import { useActionState } from "react";
import {
  updateAffiliatePayoutMethod,
  type AffiliateActionState,
} from "@/app/actions/affiliate";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const initialState: AffiliateActionState = {};

interface AffiliateSettingsFormProps {
  payoutEmail?: string | null;
  payoutMethod?: string | null;
}

export function AffiliateSettingsForm({
  payoutEmail,
  payoutMethod,
}: AffiliateSettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    updateAffiliatePayoutMethod,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Payout method</h2>
      </CardHeader>
      <CardContent className="pt-0">
        <form action={formAction} className="space-y-4">
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
          <div>
            <label htmlFor="payoutMethod" className="mb-1.5 block text-sm font-medium">
              Method
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
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save payout method"}
          </Button>
          {state.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state.success && (
            <p className="text-sm text-emerald-400">{state.success}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
