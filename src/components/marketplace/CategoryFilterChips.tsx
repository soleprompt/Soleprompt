"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getCategoryVisual } from "@/lib/category-visuals";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryFilterChipsProps {
  categories: Category[];
  basePath?: string;
}

const chipBase =
  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm outline-none transition-all duration-200";

const chipInteractive =
  "hover:-translate-y-0.5 hover:border-electric/40 hover:shadow-md hover:shadow-electric/5 focus-visible:-translate-y-0.5 focus-visible:border-electric/40 focus-visible:shadow-md focus-visible:shadow-electric/5 focus-visible:ring-2 focus-visible:ring-electric/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function CategoryFilterChips({
  categories,
  basePath = "/explore",
}: CategoryFilterChipsProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";

  function buildHref(categorySlug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug) {
      params.set("category", categorySlug);
    } else {
      params.delete("category");
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      <Link
        href={buildHref("")}
        className={cn(
          chipBase,
          chipInteractive,
          !activeCategory
            ? "border-electric/50 bg-electric/10 text-foreground"
            : "border-border bg-background text-muted-foreground hover:text-foreground",
        )}
      >
        All topics
      </Link>
      {categories.map((cat) => {
        const visual = getCategoryVisual(cat.id);
        const Icon = visual.icon;
        const isActive = activeCategory === cat.id;

        return (
          <Link
            key={cat.id}
            href={buildHref(cat.id)}
            title={`${cat.count.toLocaleString()} prompts`}
            className={cn(
              chipBase,
              chipInteractive,
              "group/chip",
              isActive
                ? "border-electric/50 bg-electric/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br transition-all duration-200",
                "group-hover/chip:scale-110 group-hover/chip:brightness-110",
                "group-focus-visible/chip:scale-110 group-focus-visible/chip:brightness-110",
                visual.gradient,
              )}
            >
              <Icon className={cn("h-3 w-3", visual.iconColor)} />
            </span>
            {cat.name}
            <span
              className={cn(
                "ml-0.5 text-[10px] tabular-nums text-muted-foreground transition-all duration-200",
                "opacity-0 group-hover/chip:opacity-100 group-focus-visible/chip:opacity-100",
                isActive && "opacity-100 text-electric/80",
              )}
            >
              {cat.count.toLocaleString()}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
