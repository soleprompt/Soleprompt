import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PromptCard } from "@/components/marketplace/PromptCard";
import { PromptFilters } from "@/components/marketplace/PromptFilters";
import { parsePromptFilterParams } from "@/lib/prompt-filters";
import { SearchBar } from "@/components/landing/SearchBar";
import {
  getCategoriesWithCounts,
  getPublishedPrompts,
} from "@/lib/marketplace";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    category?: string;
    price?: string;
    rating?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const filters = parsePromptFilterParams(params);
  const [prompts, categories] = await Promise.all([
    getPublishedPrompts(filters),
    getCategoriesWithCounts(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title={query ? `Results for "${query}"` : "Search Prompts"}
        description={
          query
            ? `${prompts.length} prompt${prompts.length === 1 ? "" : "s"} found`
            : "Find the perfect prompt for your next project."
        }
      />
      <div className="mb-6">
        <SearchBar defaultQuery={query} />
      </div>
      <Suspense fallback={null}>
        <PromptFilters categories={categories} basePath="/search" />
      </Suspense>
      {prompts.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No prompts found. Try a different search term or adjust filters.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
