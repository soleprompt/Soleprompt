import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PromptCard } from "@/components/marketplace/PromptCard";
import { PromptFilters } from "@/components/marketplace/PromptFilters";
import { parsePromptFilterParams } from "@/lib/prompt-filters";
import {
  getCategoriesWithCounts,
  getPublishedPrompts,
} from "@/lib/marketplace";

interface ExplorePageProps {
  searchParams: Promise<{
    sort?: string;
    category?: string;
    price?: string;
    rating?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const filters = parsePromptFilterParams(params);
  const [prompts, categories] = await Promise.all([
    getPublishedPrompts(filters),
    getCategoriesWithCounts(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="Explore Prompts"
        description="Browse all premium prompts in the marketplace."
      />
      <Suspense fallback={null}>
        <PromptFilters categories={categories} basePath="/explore" />
      </Suspense>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </div>
  );
}
