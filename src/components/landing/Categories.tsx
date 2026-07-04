"use client";

import Link from "next/link";
import {
  Megaphone,
  Code2,
  PenLine,
  Palette,
  Briefcase,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Category } from "@/types";

const ICON_MAP: Record<string, LucideIcon> = {
  Megaphone,
  Code2,
  PenLine,
  Palette,
  Briefcase,
  GraduationCap,
};

interface CategoriesProps {
  categories: Category[];
}

export function Categories({ categories }: CategoriesProps) {
  return (
    <section id="categories" className="border-y border-border bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Categories"
          title="Find prompts for every use case"
          description="Browse curated collections across industries and disciplines."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = ICON_MAP[category.icon] ?? Megaphone;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link href={`/categories/${category.id}`}>
                  <Card
                    hover
                    className="group cursor-pointer transition-transform hover:-translate-y-1"
                  >
                    <CardContent className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-electric/20 to-purple/20 transition-all group-hover:from-electric/30 group-hover:to-purple/30">
                        <Icon className="h-6 w-6 text-electric" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-foreground">
                            {category.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {category.count.toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
