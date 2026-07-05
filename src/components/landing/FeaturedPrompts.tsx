"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PromptCard } from "@/components/marketplace/PromptCard";
import type { Prompt } from "@/types";

interface FeaturedPromptsProps {
  prompts: Prompt[];
}

export function FeaturedPrompts({ prompts }: FeaturedPromptsProps) {
  return (
    <section id="featured" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured"
          title="Top-rated prompts"
          description="Hand-picked by our team. Every prompt is tested, refined, and ready to deliver results."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <PromptCard prompt={prompt} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
