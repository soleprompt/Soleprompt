"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface QuickFilter {
  label: string;
  params: Record<string, string>;
}

const QUICK_FILTERS: QuickFilter[] = [
  { label: "Trending", params: { sort: "trending" } },
  { label: "Recently Added", params: { sort: "newest" } },
  { label: "Best Sellers", params: { sort: "popular" } },
  { label: "Free", params: { price: "free" } },
  { label: "Under $10", params: { price: "under10" } },
  { label: "Top Rated", params: { sort: "rating", rating: "4" } },
];

interface SearchQuickFiltersProps {
  basePath?: string;
}

export function SearchQuickFilters({
  basePath = "/explore",
}: SearchQuickFiltersProps) {
  const searchParams = useSearchParams();

  function buildHref(filter: QuickFilter) {
    const params = new URLSearchParams(searchParams.toString());
    const q = params.get("q");
    params.forEach((_, key) => params.delete(key));
    if (q) params.set("q", q);
    for (const [key, value] of Object.entries(filter.params)) {
      params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  function isActive(filter: QuickFilter): boolean {
    return Object.entries(filter.params).every(
      ([key, value]) => searchParams.get(key) === value,
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Quick filters">
      {QUICK_FILTERS.map((filter) => {
        const active = isActive(filter);
        return (
          <Link
            key={filter.label}
            href={buildHref(filter)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
              active
                ? "border-electric/50 bg-electric/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-electric/30 hover:text-foreground",
            )}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
