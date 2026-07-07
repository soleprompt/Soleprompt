import { PromptCard } from "@/components/marketplace/PromptCard";
import type { Prompt } from "@/types";

const PREMIUM_MIN_PRICE = 29;
const TOOL_MAX_PRICE = 9.99;

interface SolarCategoryLayoutProps {
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

export function SolarCategoryLayout({ prompts }: SolarCategoryLayoutProps) {
  const premiumBundles = prompts.filter((p) => p.price >= PREMIUM_MIN_PRICE);
  const quickTools = prompts.filter(
    (p) => p.price > 0 && p.price <= TOOL_MAX_PRICE,
  );
  const featuredIds = new Set([
    ...premiumBundles.map((p) => p.id),
    ...quickTools.map((p) => p.id),
  ]);
  const rest = prompts.filter((p) => !featuredIds.has(p.id));

  if (prompts.length === 0) {
    return (
      <p className="text-muted-foreground">No prompts in this category yet.</p>
    );
  }

  return (
    <div className="space-y-12">
      {premiumBundles.length > 0 && (
        <section>
          <SectionHeading
            title="Premium bundles"
            description="Complete sales and proposal packs — proposal generators, follow-ups, and closing scripts in one purchase."
          />
          <div className="grid gap-6 sm:grid-cols-2">
            {premiumBundles.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </section>
      )}

      {quickTools.length > 0 && (
        <section>
          <SectionHeading
            title="Quick tools"
            description="Low-cost individual prompts for ROI estimates, lead qualification, roof checks, and objection handling."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quickTools.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <SectionHeading
            title="All solar prompts"
            description="Everything in the Solar Professionals collection."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
