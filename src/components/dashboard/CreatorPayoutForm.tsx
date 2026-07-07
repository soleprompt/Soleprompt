"use client";

import { useActionState } from "react";
import {
  requestCreatorPayout,
  type CreatorActionState,
} from "@/app/actions/creator";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/format";

const initialState: CreatorActionState = {};

interface CreatorPayoutFormProps {
  availableBalance: number;
  minPayoutAmount: number;
}

export function CreatorPayoutForm({
  availableBalance,
  minPayoutAmount,
}: CreatorPayoutFormProps) {
  const [state, formAction, pending] = useActionState(
    requestCreatorPayout,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="payout-amount" className="mb-1.5 block text-sm font-medium">
          Request payout
        </label>
        <Input
          id="payout-amount"
          name="amount"
          type="number"
          min={minPayoutAmount}
          max={availableBalance}
          step="0.01"
          placeholder={availableBalance.toFixed(2)}
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
      {state.error && (
        <p className="w-full text-sm text-red-400 sm:col-span-2">{state.error}</p>
      )}
      {state.success && (
        <p className="w-full text-sm text-emerald-400 sm:col-span-2">
          {state.success}
        </p>
      )}
    </form>
  );
}
