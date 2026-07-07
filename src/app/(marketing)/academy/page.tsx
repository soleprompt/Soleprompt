import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft, ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { SectionGlow } from "@/components/brand/SectionGlow";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  ACADEMY_AUDIENCES,
  ACADEMY_FREE_RESOURCES,
} from "@/lib/academy-landing";
import { recordToolVisit } from "@/lib/tool-visits";
import { parseUtmAttribution } from "@/lib/utm";

export const metadata: Metadata = {
  title: "AI Academy — Learn AI & Find Outcome-Focused Tools",
  description:
    "Free AI basics, prompt writing, and beginner templates. Premium prompt packs, workflows, and career toolkits for students, creators, and entrepreneurs.",
};

const AUDIENCE_ORDER = [
  "students",
  "entrepreneurs",
  "creators",
  "freelancers",
  "learners",
] as const;

export default async function AcademyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await currentUser();
  const utmParams = parseUtmAttribution(await searchParams);
  void recordToolVisit("academy", user?.id, utmParams);

  return (
    <div className="relative">
      <SectionGlow variant="hero" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>

        <div className="max-w-3xl">
          <Badge variant="electric" className="mb-4">
            AI Academy
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Learn AI.{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-electric to-purple bg-clip-text text-transparent">
              Ship real outcomes.
            </span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            SolePrompt is where students, creators, and entrepreneurs learn AI
            and buy tools that help them study, create, and grow faster — not
            just another prompt library.
          </p>
        </div>

        <section className="mt-16">
          <div className="mb-8 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-electric" />
            <h2 className="text-2xl font-semibold text-foreground">
              Start free
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ACADEMY_FREE_RESOURCES.map((resource) => (
              <Link
                key={resource.title}
                href={resource.href}
                className="group flex flex-col rounded-xl border border-border bg-card/40 p-5 transition-all hover:border-electric/40 hover:bg-card/60"
              >
                {resource.badge && (
                  <Badge variant="outline" className="w-fit text-[10px]">
                    {resource.badge}
                  </Badge>
                )}
                <h3 className="mt-3 font-semibold text-foreground group-hover:text-electric">
                  {resource.title}
                </h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
                  {resource.description}
                </p>
                <p className="mt-3 flex items-center gap-1 text-sm font-medium text-electric">
                  Get started
                  <ArrowRight className="h-3.5 w-3.5" />
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-electric" />
            <h2 className="text-2xl font-semibold text-foreground">
              Choose your audience
            </h2>
          </div>
          <p className="mb-8 max-w-2xl text-muted-foreground">
            Premium prompt packs, AI workflows, automation kits, and
            career-specific toolkits — curated for how you actually work.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIENCE_ORDER.map((slug) => {
              const audience = ACADEMY_AUDIENCES[slug];
              return (
                <Link
                  key={slug}
                  href={`/academy/${slug}`}
                  className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-electric/50"
                >
                  <div
                    className={cn(
                      "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-6 transition-all duration-300",
                      "hover:-translate-y-1 hover:border-electric/40 hover:shadow-xl hover:shadow-electric/10",
                      "ring-1 ring-transparent",
                      audience.ring,
                      audience.gradient,
                    )}
                  >
                    <span className="text-3xl" aria-hidden>
                      {audience.emoji}
                    </span>
                    <h3 className="mt-4 text-xl font-semibold text-foreground">
                      {audience.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {audience.tagline}
                    </p>
                    <p className="mt-4 flex items-center gap-1 text-sm font-medium text-electric">
                      View tools
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-20 rounded-2xl border border-border bg-card/30 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-foreground">
            Ready to skip the learning curve?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Browse {AUDIENCE_ORDER.length} curated paths or explore the full
            marketplace — instant download, no subscription.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/explore">
              <Button size="lg" className="group">
                Browse all tools
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/explore?price=free">
              <Button size="lg" variant="outline">
                Free tools first
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
