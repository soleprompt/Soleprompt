"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface ClickableTableRowProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function ClickableTableRow({
  href,
  children,
  className = "",
}: ClickableTableRowProps) {
  const router = useRouter();

  return (
    <tr
      className={`cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-muted/40 ${className}`}
      onClick={() => router.push(href)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(href);
        }
      }}
      role="link"
      tabIndex={0}
    >
      {children}
    </tr>
  );
}
