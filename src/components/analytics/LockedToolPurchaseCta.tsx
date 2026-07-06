"use client";

import { ClickThroughLink } from "@/components/analytics/ClickThroughLink";
import { Button } from "@/components/ui/Button";
import type { PaidToolTargetKey } from "@/lib/click-throughs/constants";

type LockedToolPurchaseCtaProps = {
  href: string;
  targetKey: PaidToolTargetKey;
  source: string;
};

export function LockedToolPurchaseCta({
  href,
  targetKey,
  source,
}: LockedToolPurchaseCtaProps) {
  return (
    <ClickThroughLink
      href={href}
      eventType="paid_tool_cta"
      targetKey={targetKey}
      metadata={{ source }}
    >
      <Button className="mt-6">View product</Button>
    </ClickThroughLink>
  );
}
