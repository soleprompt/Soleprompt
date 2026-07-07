"use client";

import { motion } from "framer-motion";
import { DollarSign, Users, TrendingUp, Shield } from "lucide-react";
import { StartSellingButton } from "@/components/dashboard/StartSellingButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionGlow } from "@/components/brand/SectionGlow";
import { BrandWatermark } from "@/components/brand/BrandWatermark";

const BENEFITS = [
  {
    icon: DollarSign,
    title: "Earn on your expertise",
    description: "Set your own prices and keep up to 85% of every sale.",
  },
  {
    icon: Users,
    title: "Built-in audience",
    description: "Reach thousands of buyers actively searching for quality prompts.",
  },
  {
    icon: TrendingUp,
    title: "Analytics dashboard",
    description: "Track views, conversions, and revenue in real time.",
  },
  {
    icon: Shield,
    title: "Secure payouts",
    description: "Get paid reliably with industry-standard payment processing.",
  },
];

export function BecomeSeller() {
  return (
    <section id="sell" className="relative py-24 sm:py-32">
      <SectionGlow variant="cta" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-electric/5 via-background to-purple/5 p-8 sm:p-12 lg:p-16">
          <BrandWatermark
            src="/brand/brand-showcase.png"
            opacity={0.05}
            className="rounded-3xl"
          />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-electric/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple/10 blur-3xl" />

          <div className="relative grid gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="purple" className="mb-4">
                For Creators
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Turn your prompts into{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-electric to-purple bg-clip-text text-transparent">
                  passive income
                </span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Join thousands of creators monetizing their AI expertise. List
                once, earn forever — we handle discovery, delivery, and support.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <StartSellingButton size="lg" />
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {BENEFITS.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-electric/10">
                    <benefit.icon className="h-5 w-5 text-electric" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
