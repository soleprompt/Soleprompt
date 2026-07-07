import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PromptCard } from "@/components/marketplace/PromptCard";
import {
  buildAcademyLandingSections,
  type AcademyAudienceConfig,
} from "@/lib/academy-landing";
import type { Prompt } from "@/types";

interface AcademyLandingLayoutProps {
  config: AcademyAudienceConfig;
  prompts: Prompt[];
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

export function AcademyLandingLayout({
  config,
  prompts,
}: AcademyLandingLayoutProps) {
  const { featured, sections, rest } = buildAcademyLandingSections(
    prompts,
    config,
  );

  if (prompts.length === 0) {
    return (
      <p className="text-muted-foreground">
        Tools for this audience are coming soon.{" "}
        <Link href="/explore" className="text-electric hover:underline">
          Browse all tools
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-16">
      {featured.length > 0 && (
        <section>
          <SectionHeading
            title="Top picks"
            description={`Hand-picked tools for ${config.name.toLowerCase()}.`}
          />
          <PromptGrid prompts={featured} />
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
            title="More tools"
            description="Additional picks from across the marketplace."
          />
          <PromptGrid prompts={rest.slice(0, 9)} />
          {rest.length > 9 && (
            <div className="mt-6 text-center">
              <Link
                href="/explore"
                className="inline-flex items-center gap-1 text-sm font-medium text-electric hover:underline"
              >
                View all {prompts.length} tools
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
