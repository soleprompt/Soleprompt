"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TESTIMONIALS } from "@/lib/constants";

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by creators and buyers"
          description="See what our community has to say about SolePrompt."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card className="relative h-full overflow-hidden">
                <CardContent className="flex h-full flex-col">
                  <Quote className="mb-4 h-8 w-8 text-electric/40" />
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-electric to-purple text-xs font-semibold text-white">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
