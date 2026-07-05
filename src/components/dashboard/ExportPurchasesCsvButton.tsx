"use client";

import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function ExportPurchasesCsvButton() {
  const params = useSearchParams();
  const query = params.toString();
  const href = query
    ? `/api/admin/purchases/export?${query}`
    : "/api/admin/purchases/export";

  return (
    <a
      href={href}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted/50"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </a>
  );
}
