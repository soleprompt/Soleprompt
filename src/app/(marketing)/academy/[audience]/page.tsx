import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { AcademyLandingLayout } from "@/components/academy/AcademyLandingLayout";
import { Badge } from "@/components/ui/Badge";
import { SectionGlow } from "@/components/brand/SectionGlow";
import { cn } from "@/lib/utils";
import {
  ACADEMY_AUDIENCE_SLUGS,
  dedupePrompts,
  getAcademyAudienceConfig,
} from "@/lib/academy-landing";
import { getPublishedPrompts } from "@/lib/marketplace";
import { recordToolVisit } from "@/lib/tool-visits";
import type { TrackedToolSlug } from "@/lib/tool-visits/constants";
import { parseUtmAttribution } from "@/lib/utm";

const AUDIENCE_TRACK_SLUGS: Record<string, TrackedToolSlug> = {
  students: "academy-students",
  entrepreneurs: "academy-entrepreneurs",
  creators: "academy-creators",
  freelancers: "academy-freelancers",
  learners: "academy-learners",
};

interface AcademyAudiencePageProps {
  params: Promise<{ audience: string }>;
}

export async function generateMetadata({
  params,
}: AcademyAudiencePageProps): Promise<Metadata> {
  const { audience } = await params;
  const config = getAcademyAudienceConfig(audience);

  if (!config) {
    return { title: "AI Academy" };
  }

  return {
    title: config.seoTitle,
    description: config.seoDescription,
  };
}

export function generateStaticParams() {
  return ACADEMY_AUDIENCE_SLUGS.map((audience) => ({ audience }));
}

export default async function AcademyAudiencePage({
  params,
  searchParams,
}: AcademyAudiencePageProps & {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { audience } = await params;
  const config = getAcademyAudienceConfig(audience);

  if (!config) {
    notFound();
  }

  const user = await currentUser();
  const utmParams = parseUtmAttribution(await searchParams);
  void recordToolVisit(
    AUDIENCE_TRACK_SLUGS[audience] ?? "academy",
    user?.id,
    utmParams,
  );

  const categoryResults = await Promise.all(
    config.categorySlugs.map((slug) =>
      getPublishedPrompts({ categorySlug: slug, limit: 80 }),
    ),
  );
  const prompts = dedupePrompts(categoryResults.flat());

  return (
    <div className="relative">
      <SectionGlow variant="section" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/academy"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          AI Academy
        </Link>

        <div
          className={cn(
            "mb-8 rounded-2xl border border-border bg-gradient-to-br p-8 sm:p-10",
            config.gradient,
          )}
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl" aria-hidden>
              {config.emoji}
            </span>
            <div className="flex-1">
              <Badge variant="outline" className="mb-3">
                AI Academy
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {config.name}
              </h1>
              <p className="mt-2 text-lg text-foreground/90">
                {config.headline}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {config.tagline}
              </p>
            </div>
          </div>
        </div>

        {config.freeResources.length > 0 && (
          <section className="mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Free resources
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {config.freeResources.map((resource) => (
                <Link
                  key={resource.title}
                  href={resource.href}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm transition-colors hover:border-electric/40 hover:text-electric"
                >
                  {resource.badge && (
                    <span className="text-[10px] font-medium uppercase text-electric">
                      {resource.badge}
                    </span>
                  )}
                  {resource.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        <AcademyLandingLayout config={config} prompts={prompts} />
      </div>
    </div>
  );
}
