import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PromptCard } from "@/components/marketplace/PromptCard";
import type { Prompt } from "@/types";

interface RelatedPromptsSectionProps {
  title: string;
  description?: string;
  prompts: Prompt[];
  viewAllHref?: string;
}

export function RelatedPromptsSection({
  title,
  description,
  prompts,
  viewAllHref,
}: RelatedPromptsSectionProps) {
  if (prompts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm font-medium text-electric hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} variant="compact" />
        ))}
      </div>
    </section>
  );
}
