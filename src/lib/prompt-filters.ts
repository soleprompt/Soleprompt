import type { PromptSortOption } from "@/lib/marketplace";

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
