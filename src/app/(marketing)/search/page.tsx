import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CategoryFilterChips } from "@/components/marketplace/CategoryFilterChips";
import { PromptCard } from "@/components/marketplace/PromptCard";
import { PromptFilters } from "@/components/marketplace/PromptFilters";
import { SearchQuickFilters } from "@/components/marketplace/SearchQuickFilters";
import { parsePromptFilterParams } from "@/lib/prompt-filters";
import { SearchBar } from "@/components/landing/SearchBar";
import {
  getCategoriesWithCounts,
  getPopularSearchTerms,
  getPublishedPrompts,
  getTrendingPromptIds,
} from "@/lib/marketplace";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    category?: string;
    price?: string;
    rating?: string;
    model?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const filters = parsePromptFilterParams(params);
  const [prompts, categories, suggestions, trendingIds] = await Promise.all([
    getPublishedPrompts(filters),
    getCategoriesWithCounts(),
    getPopularSearchTerms(12),
    getTrendingPromptIds(24),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title={query ? `Results for "${query}"` : "Search AI Tools"}
        description={
          query
            ? `${prompts.length} tool${prompts.length === 1 ? "" : "s"} found`
            : "Find calculators, generators, and workflow templates."
        }
      />
      <div className="mb-6">
        <SearchBar defaultQuery={query} suggestions={suggestions} />
      </div>
      <Suspense fallback={null}>
        <div className="space-y-4">
          <SearchQuickFilters basePath="/search" />
          <CategoryFilterChips categories={categories} basePath="/search" />
          <PromptFilters categories={categories} basePath="/search" />
        </div>
      </Suspense>
      {prompts.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No prompts found. Try a different search term or adjust filters.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              trendingIds={trendingIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
