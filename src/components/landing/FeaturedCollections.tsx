"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const COLLECTIONS = [
  {
    id: "make-money",
    emoji: "🚀",
    title: "Make More Money",
    description: "Side hustles, pricing, and income-boosting AI workflows.",
    categorySlug: "finance",
    gradient: "from-emerald-500/25 via-green-500/15 to-teal-600/25",
    ring: "group-hover:ring-emerald-500/30",
  },
  {
    id: "grow-business",
    emoji: "📈",
    title: "Grow Your Business",
    description: "Ops, strategy, and scaling tools for small teams.",
    categorySlug: "business",
    gradient: "from-blue-500/25 via-indigo-500/15 to-violet-600/25",
    ring: "group-hover:ring-blue-500/30",
  },
  {
    id: "sales-marketing",
    emoji: "💼",
    title: "Sales & Marketing",
    description: "Outreach, ads, proposals, and conversion copy.",
    categorySlug: "sales",
    gradient: "from-rose-500/25 via-red-500/15 to-orange-600/25",
    ring: "group-hover:ring-rose-500/30",
  },
  {
    id: "productivity",
    emoji: "🧠",
    title: "Productivity",
    description: "Inbox triage, meeting notes, and daily workflows.",
    categorySlug: "productivity",
    gradient: "from-purple-500/25 via-violet-500/15 to-fuchsia-600/25",
    ring: "group-hover:ring-purple-500/30",
  },
  {
    id: "developers",
    emoji: "💻",
    title: "Developers",
    description: "Code review, debugging, docs, and ship-faster prompts.",
    categorySlug: "coding",
    gradient: "from-cyan-500/25 via-sky-500/15 to-blue-600/25",
    ring: "group-hover:ring-cyan-500/30",
  },
  {
    id: "solar",
    emoji: "☀️",
    title: "Solar Professionals",
    description: "ROI calculators, proposals, and solar sales follow-ups.",
    categorySlug: "solar",
    href: "/categories/solar",
    gradient: "from-amber-500/25 via-yellow-500/15 to-orange-600/25",
    ring: "group-hover:ring-amber-500/30",
  },
] as const;

interface FeaturedCollectionsProps {
  categories?: Category[];
}

export function FeaturedCollections({ categories = [] }: FeaturedCollectionsProps) {
  const countBySlug = Object.fromEntries(categories.map((c) => [c.id, c.count]));

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured Collections"
          title="Start with a collection that fits your work"
          description="Curated packs of professional AI tools — jump straight to what matters for your role."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((collection, index) => {
            const count = countBySlug[collection.categorySlug];
            const href =
              "href" in collection
                ? collection.href
                : `/explore?category=${collection.categorySlug}`;

            return (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <Link
                  href={href}
                  className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-electric/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div
                    className={cn(
                      "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-5 transition-all duration-300",
                      "hover:-translate-y-1 hover:border-electric/40 hover:shadow-xl hover:shadow-electric/10",
                      "ring-1 ring-transparent",
                      collection.ring,
                      collection.gradient,
                    )}
                  >
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 85% 15%, rgba(0,102,255,0.14) 0%, transparent 50%)",
                      }}
                      aria-hidden
                    />
                    <div className="relative flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-2xl" aria-hidden>
                          {collection.emoji}
                        </span>
                        {count !== undefined && count > 0 && (
                          <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground backdrop-blur-sm">
                            {count} tools
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-foreground">
                        {collection.title}
                      </h3>
                      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {collection.description}
                      </p>
                      <p className="mt-4 flex items-center gap-1 text-sm font-medium text-electric opacity-80 transition-opacity group-hover:opacity-100">
                        Explore collection
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
