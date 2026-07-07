"use client";

import { adminSetAffiliateStatus } from "@/app/actions/creator-admin";
import { Button } from "@/components/ui/Button";
import type { AffiliateStatus } from "@/generated/prisma/client";

interface AffiliateAdminActionsProps {
  affiliateId: string;
  status: AffiliateStatus;
}

export function AffiliateAdminActions({
  affiliateId,
  status,
}: AffiliateAdminActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "approved" && (
        <form action={adminSetAffiliateStatus.bind(null, affiliateId, "approved")}>
          <Button type="submit" size="sm" variant="primary">
            Approve
          </Button>
        </form>
      )}
      {status !== "rejected" && (
        <form action={adminSetAffiliateStatus.bind(null, affiliateId, "rejected")}>
          <Button type="submit" size="sm" variant="outline">
            Reject
          </Button>
        </form>
      )}
      {status !== "suspended" && (
        <form action={adminSetAffiliateStatus.bind(null, affiliateId, "suspended")}>
          <Button type="submit" size="sm" variant="ghost">
            Suspend
          </Button>
        </form>
      )}
    </div>
  );
}
