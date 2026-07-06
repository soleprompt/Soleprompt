"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PromptCard } from "@/components/marketplace/PromptCard";
import type { Prompt } from "@/types";

interface TrendingPromptsProps {
  prompts: Prompt[];
}

export function TrendingPrompts({ prompts }: TrendingPromptsProps) {
  if (prompts.length === 0) return null;

  return (
    <section className="border-t border-border/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Trending"
            title="Popular right now"
            description="Prompts buyers are viewing and purchasing most this week."
          />
          <Link
            href="/explore?sort=trending"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-electric hover:underline"
          >
            <TrendingUp className="h-4 w-4" />
            View all trending
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <PromptCard prompt={prompt} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
