import { PageHeader } from "@/components/dashboard/PageHeader";
import { PromptCard } from "@/components/marketplace/PromptCard";
import { SearchBar } from "@/components/landing/SearchBar";
import { getPublishedPrompts } from "@/lib/marketplace";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const prompts = await getPublishedPrompts({ search: query || undefined });

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
      <div className="mb-8">
        <SearchBar defaultQuery={query} />
      </div>
      {prompts.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No prompts found. Try a different search term.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
