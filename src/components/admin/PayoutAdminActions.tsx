"use client";

import {
  adminApprovePayout,
  adminMarkPayoutPaid,
  adminRejectPayout,
} from "@/app/actions/creator-admin";
import { Button } from "@/components/ui/Button";
import type { PayoutStatus } from "@/generated/prisma/client";

interface PayoutAdminActionsProps {
  payoutId: string;
  status: PayoutStatus;
}

export function PayoutAdminActions({ payoutId, status }: PayoutAdminActionsProps) {
  if (status === "paid" || status === "rejected") {
    return <span className="text-xs text-muted-foreground">Closed</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <form action={adminApprovePayout.bind(null, payoutId)}>
        <Button type="submit" size="sm" variant="outline">
          Approve
        </Button>
      </form>
      <form action={adminMarkPayoutPaid.bind(null, payoutId)}>
        <Button type="submit" size="sm" variant="primary">
          Mark paid
        </Button>
      </form>
      <form action={adminRejectPayout.bind(null, payoutId)}>
        <Button type="submit" size="sm" variant="ghost">
          Reject
        </Button>
      </form>
    </div>
  );
}
