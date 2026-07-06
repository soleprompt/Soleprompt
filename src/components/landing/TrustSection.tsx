"use client";

import { motion } from "framer-motion";
import { CreditCard, Star, Zap } from "lucide-react";

interface TrustSectionProps {
  toolCountLabel: string;
}

const STATIC_ITEMS = [
  {
    icon: Star,
    emoji: "⭐",
    label: "4.9/5 Community Rating",
    iconClass: "text-amber-400",
  },
  {
    icon: Zap,
    emoji: "⚡",
    label: "Instant Download",
    iconClass: "text-electric",
  },
  {
    icon: CreditCard,
    emoji: "💳",
    label: "Secure Checkout",
    iconClass: "text-emerald-400",
  },
] as const;

export function TrustSection({ toolCountLabel }: TrustSectionProps) {
  const items = [
    ...STATIC_ITEMS,
    {
      icon: Zap,
      emoji: "🤖",
      label: `${toolCountLabel} AI Tools`,
      iconClass: "text-purple-400",
    },
  ];

  return (
    <section className="relative border-y border-border/60 bg-muted/30 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3 backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/60 ring-1 ring-border/60">
                  <Icon className={`h-4 w-4 ${item.iconClass}`} aria-hidden />
                </div>
                <p className="text-sm font-medium leading-tight text-foreground">
                  <span className="mr-1" aria-hidden>
                    {item.emoji}
                  </span>
                  {item.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
