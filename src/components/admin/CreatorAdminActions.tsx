"use client";

import { adminApproveCreator, adminRejectCreator, adminToggleCreatorVerified } from "@/app/actions/creator-admin";
import { Button } from "@/components/ui/Button";

interface CreatorAdminActionsProps {
  userId: string;
  creatorStatus: string;
  verified: boolean;
}

export function CreatorAdminActions({
  userId,
  creatorStatus,
  verified,
}: CreatorAdminActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {creatorStatus !== "approved" && (
        <form action={adminApproveCreator.bind(null, userId)}>
          <Button type="submit" size="sm" variant="primary">
            Approve
          </Button>
        </form>
      )}
      {creatorStatus !== "rejected" && (
        <form action={adminRejectCreator.bind(null, userId)}>
          <Button type="submit" size="sm" variant="outline">
            Reject
          </Button>
        </form>
      )}
      <form action={adminToggleCreatorVerified.bind(null, userId, !verified)}>
        <Button type="submit" size="sm" variant="ghost">
          {verified ? "Remove verify" : "Verify"}
        </Button>
      </form>
    </div>
  );
}
