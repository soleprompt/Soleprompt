"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  Download,
  RefreshCw,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import type { TrustMetrics } from "@/lib/marketplace";

interface TrustSectionProps {
  toolCountLabel: string;
  metrics?: TrustMetrics;
}

function formatCount(n: number): string | null {
  if (n <= 0) return null;
  if (n >= 10000) return `${Math.floor(n / 1000).toLocaleString()}k+`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  return n.toLocaleString();
}

export function TrustSection({ toolCountLabel, metrics }: TrustSectionProps) {
  const downloads = metrics ? formatCount(metrics.totalDownloads) : null;
  const buyers = metrics ? formatCount(metrics.verifiedBuyers) : null;
  const rating =
    metrics && metrics.avgRating > 0 ? `${metrics.avgRating}/5` : null;
  const reviewLabel =
    metrics && metrics.reviewCount > 0
      ? `${metrics.reviewCount.toLocaleString()} reviews`
      : null;

  const items = [
    {
      icon: Star,
      label: rating
        ? `${rating}${reviewLabel ? ` · ${reviewLabel}` : ""}`
        : "Top rated tools",
      iconClass: "text-amber-400",
    },
    {
      icon: Download,
      label: downloads ? `${downloads} Downloads` : "Instant Download",
      iconClass: "text-electric",
    },
    {
      icon: Users,
      label: buyers ? `${buyers} Verified Buyers` : "Trusted by professionals",
      iconClass: "text-purple-400",
    },
    {
      icon: RefreshCw,
      label: "Updated This Week",
      iconClass: "text-emerald-400",
    },
    {
      icon: ShieldCheck,
      label: "Money Back Guarantee",
      iconClass: "text-sky-400",
    },
    {
      icon: CreditCard,
      label: `${toolCountLabel} AI Tools`,
      iconClass: "text-orange-400",
    },
  ];

  return (
    <section className="relative border-y border-border/60 bg-muted/30 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/40 px-3 py-3 backdrop-blur-sm sm:gap-3 sm:px-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/60 ring-1 ring-border/60 sm:h-9 sm:w-9">
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${item.iconClass}`} aria-hidden />
                </div>
                <p className="text-xs font-medium leading-tight text-foreground sm:text-sm">
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
