import { PageHeader } from "@/components/dashboard/PageHeader";
import { PromptCard } from "@/components/marketplace/PromptCard";
import { getPublishedPrompts } from "@/lib/marketplace";

export default async function ExplorePage() {
  const prompts = await getPublishedPrompts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="Explore Prompts"
        description="Browse all premium prompts in the marketplace."
      />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </div>
  );
}
