"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import type { ClickThroughEventType } from "@/lib/click-throughs/constants";
import type { ClickThroughMetadata } from "@/lib/click-throughs";
import { trackClickThrough } from "@/lib/click-throughs/client";

type ClickThroughLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  eventType: ClickThroughEventType;
  targetKey: string;
  metadata?: ClickThroughMetadata;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function ClickThroughLink({
  eventType,
  targetKey,
  metadata,
  children,
  onClick,
  ...linkProps
}: ClickThroughLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackClickThrough({ eventType, targetKey, metadata });
    onClick?.(event);
  }

  return (
    <Link {...linkProps} onClick={handleClick}>
      {children}
    </Link>
  );
}
