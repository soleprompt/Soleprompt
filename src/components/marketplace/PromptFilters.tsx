"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { PromptSortOption } from "@/lib/marketplace";
import type { Category } from "@/types";

interface PromptFiltersProps {
  categories: Category[];
  basePath?: string;
}

const SORT_OPTIONS: { value: PromptSortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Best Selling" },
  { value: "trending", label: "Trending" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function PromptFilters({
  categories,
  basePath = "/search",
}: PromptFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sort") as PromptSortOption) || "newest";
  const currentCategory = searchParams.get("category") ?? "";
  const currentPrice = searchParams.get("price") ?? "";
  const currentRating = searchParams.get("rating") ?? "";
  const query = searchParams.get("q") ?? "";

  function updateFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.push(`${basePath}?${params.toString()}`);
  }

  const selectClass =
    "h-10 rounded-full border border-border bg-background px-3 text-sm text-foreground focus:border-electric/50 focus:outline-none focus:ring-2 focus:ring-electric/20";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={currentSort}
        onChange={(e) => updateFilters({ sort: e.target.value })}
        className={selectClass}
        aria-label="Sort prompts"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={currentCategory}
        onChange={(e) => updateFilters({ category: e.target.value })}
        className={selectClass}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={currentPrice}
        onChange={(e) => updateFilters({ price: e.target.value })}
        className={selectClass}
        aria-label="Filter by price"
      >
        <option value="">Any price</option>
        <option value="free">Free only</option>
        <option value="under5">Under $5</option>
        <option value="under10">Under $10</option>
      </select>

      <select
        value={currentRating}
        onChange={(e) => updateFilters({ rating: e.target.value })}
        className={selectClass}
        aria-label="Filter by minimum rating"
      >
        <option value="">Any rating</option>
        <option value="4">4+ stars</option>
        <option value="3">3+ stars</option>
      </select>

      {(currentSort !== "newest" ||
        currentCategory ||
        currentPrice ||
        currentRating) && (
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams();
            if (query) params.set("q", query);
            router.push(`${basePath}?${params.toString()}`);
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export function parsePromptFilterParams(searchParams: {
  q?: string;
  sort?: string;
  category?: string;
  price?: string;
  rating?: string;
}) {
  const sort = (searchParams.sort as PromptSortOption) || "newest";
  const price = searchParams.price;
  const rating = searchParams.rating ? Number(searchParams.rating) : undefined;

  return {
    search: searchParams.q?.trim() || undefined,
    categorySlug: searchParams.category || undefined,
    sort,
    freeOnly: price === "free",
    maxPrice:
      price === "under5" ? 5 : price === "under10" ? 10 : undefined,
    minRating:
      rating && Number.isFinite(rating) && rating > 0 ? rating : undefined,
  };
}
