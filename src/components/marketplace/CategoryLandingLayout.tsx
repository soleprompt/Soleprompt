import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PromptCard } from "@/components/marketplace/PromptCard";
import {
  buildCategoryLandingSections,
  type CategoryLandingConfig,
} from "@/lib/category-landing";
import type { Prompt } from "@/types";

interface CategoryLandingLayoutProps {
  config: CategoryLandingConfig;
  prompts: Prompt[];
  crossSellPrompts?: Prompt[];
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function PromptGrid({
  prompts,
  columns = 3,
}: {
  prompts: Prompt[];
  columns?: 2 | 3;
}) {
  return (
    <div
      className={
        columns === 2
          ? "grid gap-6 sm:grid-cols-2"
          : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}

export function CategoryLandingLayout({
  config,
  prompts,
  crossSellPrompts = [],
}: CategoryLandingLayoutProps) {
  const { featured, sections, rest } = buildCategoryLandingSections(
    prompts,
    config,
    [
      ...prompts,
      ...crossSellPrompts.filter(
        (c) => !prompts.some((p) => p.id === c.id),
      ),
    ],
  );

  const showCrossSell =
    prompts.length < 4 &&
    crossSellPrompts.length > 0 &&
    config.crossSellSlug;

  if (
    prompts.length === 0 &&
    crossSellPrompts.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-border bg-card/30 p-10 text-center">
        <p className="text-muted-foreground">
          New tools coming soon. Browse the full marketplace in the meantime.
        </p>
        <Link
          href="/explore"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-electric hover:underline"
        >
          Explore all AI tools
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {featured.length > 0 && (
        <section>
          <SectionHeading
            title="Featured tools"
            description={`Top picks for ${config.slug.replace(/-/g, " ")} professionals.`}
          />
          <PromptGrid prompts={featured} columns={featured.length <= 2 ? 2 : 3} />
        </section>
      )}

      {sections.map((section) => (
        <section key={section.title}>
          <SectionHeading
            title={section.title}
            description={section.description}
          />
          <PromptGrid
            prompts={section.prompts}
            columns={section.columns ?? 3}
          />
        </section>
      ))}

      {rest.length > 0 && (
        <section>
          <SectionHeading
            title={`All ${config.slug.replace(/-/g, " ")} tools`}
            description="Everything in this collection."
          />
          <PromptGrid prompts={rest} />
        </section>
      )}

      {showCrossSell && (
        <section>
          <SectionHeading
            title={config.crossSellLabel ?? "Related tools"}
            description="Hand-picked tools from a related category."
          />
          <PromptGrid
            prompts={crossSellPrompts.slice(0, 6)}
            columns={3}
          />
          {config.crossSellSlug && (
            <Link
              href={`/categories/${config.crossSellSlug}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-electric hover:underline"
            >
              View all {config.crossSellSlug.replace(/-/g, " ")} tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
