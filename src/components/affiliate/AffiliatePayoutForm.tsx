"use client";

import { useActionState } from "react";
import {
  requestAffiliatePayout,
  type AffiliateActionState,
} from "@/app/actions/affiliate";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/format";

const initialState: AffiliateActionState = {};

interface AffiliatePayoutFormProps {
  availableBalance: number;
  minPayoutAmount: number;
}

export function AffiliatePayoutForm({
  availableBalance,
  minPayoutAmount,
}: AffiliatePayoutFormProps) {
  const [state, formAction, pending] = useActionState(
    requestAffiliatePayout,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="affiliate-payout" className="mb-1.5 block text-sm font-medium">
          Request payout
        </label>
        <Input
          id="affiliate-payout"
          name="amount"
          type="number"
          min={minPayoutAmount}
          max={availableBalance}
          step="0.01"
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Available {formatCurrency(availableBalance)} · Min{" "}
          {formatCurrency(minPayoutAmount)}
        </p>
      </div>
      <Button type="submit" disabled={pending || availableBalance < minPayoutAmount}>
        {pending ? "Submitting..." : "Request Payout"}
      </Button>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-400">{state.success}</p>}
    </form>
  );
}
