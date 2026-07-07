"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionGlow } from "@/components/brand/SectionGlow";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  ACADEMY_AUDIENCES,
  ACADEMY_FREE_RESOURCES,
} from "@/lib/academy-landing";

const AUDIENCE_ORDER = [
  "students",
  "entrepreneurs",
  "creators",
  "freelancers",
  "learners",
] as const;

export function AcademySection() {
  return (
    <section className="relative py-24 sm:py-32" id="academy">
      <SectionGlow variant="hero" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="AI Academy"
          title="Learn AI. Buy tools that deliver outcomes."
          description="Free lessons and templates to build trust — premium prompt packs, workflows, and career toolkits when you're ready to level up."
          align="center"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACADEMY_FREE_RESOURCES.slice(0, 3).map((resource, index) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <Link
                href={resource.href}
                className="group flex h-full flex-col rounded-xl border border-border bg-card/40 p-5 transition-all hover:border-electric/40 hover:bg-card/60"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-electric" />
                  {resource.badge && (
                    <Badge variant="outline" className="text-[10px]">
                      {resource.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-foreground">
                  {resource.title}
                </h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
                  {resource.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12">
          <div className="mb-6 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-electric" />
            <h3 className="text-lg font-semibold text-foreground">
              Pick your path
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {AUDIENCE_ORDER.map((slug, index) => {
              const audience = ACADEMY_AUDIENCES[slug];
              return (
                <motion.div
                  key={slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    href={`/academy/${slug}`}
                    className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-electric/50"
                  >
                    <div
                      className={cn(
                        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-4 transition-all duration-300",
                        "hover:-translate-y-1 hover:border-electric/40 hover:shadow-lg hover:shadow-electric/10",
                        "ring-1 ring-transparent",
                        audience.ring,
                        audience.gradient,
                      )}
                    >
                      <span className="text-2xl" aria-hidden>
                        {audience.emoji}
                      </span>
                      <h4 className="mt-2 text-sm font-semibold text-foreground">
                        {audience.name}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {audience.headline}
                      </p>
                      <p className="mt-3 flex items-center gap-1 text-xs font-medium text-electric opacity-80 group-hover:opacity-100">
                        Explore
                        <ArrowRight className="h-3 w-3" />
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/academy">
            <Button size="lg" className="group">
              <Sparkles className="mr-2 h-4 w-4" />
              Enter AI Academy
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/explore">
            <Button size="lg" variant="outline">
              Browse all tools
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
