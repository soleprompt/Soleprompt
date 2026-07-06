"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

interface BeforeAfterProps {
  title: string;
  beforeLabel: string;
  afterLabel: string;
  before: React.ReactNode;
  after: React.ReactNode;
}

function BeforeAfterCard({
  title,
  beforeLabel,
  afterLabel,
  before,
  after,
}: BeforeAfterProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5 backdrop-blur-sm">
      <h3 className="mb-4 text-center text-sm font-semibold text-foreground">
        {title}
      </h3>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-red-400/90">
            {beforeLabel}
          </p>
          {before}
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-electric" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-emerald-400/90">
            {afterLabel}
          </p>
          {after}
        </div>
      </div>
    </div>
  );
}

function TweetMockup({ messy }: { messy: boolean }) {
  const tweets = messy
    ? [
        "ugh mondays 😤",
        "hot take: clients suck",
        "party pics 🍻",
      ]
    : [
        "3 posts flagged for review",
        "Reputation score: 92/100",
        "Export-ready cleanup report",
      ];

  return (
    <div className="space-y-1.5 rounded-lg border border-white/5 bg-[#0c0c12] p-2.5">
      {tweets.map((text) => (
        <div
          key={text}
          className={cn(
            "rounded-md px-2 py-1.5 text-[10px] leading-snug",
            messy
              ? "bg-red-500/10 text-red-200/80 line-through decoration-red-400/50"
              : "bg-emerald-500/10 text-emerald-100/90",
          )}
        >
          {text}
        </div>
      ))}
    </div>
  );
}

function BillMockup({ messy }: { messy: boolean }) {
  return messy ? (
    <div className="rounded-lg border border-white/5 bg-[#0c0c12] p-2.5 text-[10px] text-muted-foreground">
      <p className="font-medium text-foreground">Electric Bill — Jan</p>
      <p className="mt-1 text-lg font-bold text-red-400">$284.50</p>
      <p className="mt-1">Usage: 1,240 kWh</p>
      <p className="text-red-400/70">↑ 18% vs last year</p>
    </div>
  ) : (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-[10px]">
      <p className="font-medium text-emerald-300">Solar ROI Estimate</p>
      <p className="mt-1 text-lg font-bold text-emerald-400">$1,840/yr saved</p>
      <p className="text-emerald-200/70">Payback: 6.2 years</p>
      <p className="text-emerald-200/70">25-yr savings: $46k</p>
    </div>
  );
}

function EmailMockup({ messy }: { messy: boolean }) {
  return messy ? (
    <div className="rounded-lg border border-white/5 bg-[#0c0c12] p-2.5 text-[10px] text-muted-foreground">
      <p className="text-red-300/80">hey saw ur company online</p>
      <p className="mt-1">we do marketing stuff lol</p>
      <p className="mt-1">lmk if u want 2 chat!!!</p>
    </div>
  ) : (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-[10px] text-emerald-100/90">
      <p className="font-medium text-emerald-300">Subject: Quick idea for Acme Co.</p>
      <p className="mt-1.5 leading-relaxed">
        Hi Sarah — I noticed Acme&apos;s recent product launch. We helped similar
        teams increase qualified leads 34% in 90 days…
      </p>
    </div>
  );
}

export function BeforeAfterShowcase() {
  return (
    <section className="border-y border-border bg-muted/20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="See the difference"
          title="From messy input to polished output"
          description="Every tool is designed to turn real-world inputs into work-ready results."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <BeforeAfterCard
              title="X Account Checker"
              beforeLabel="Before"
              afterLabel="After"
              before={<TweetMockup messy />}
              after={<TweetMockup messy={false} />}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <BeforeAfterCard
              title="Solar ROI Calculator"
              beforeLabel="Before"
              afterLabel="After"
              before={<BillMockup messy />}
              after={<BillMockup messy={false} />}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <BeforeAfterCard
              title="Cold Email Generator"
              beforeLabel="Before"
              afterLabel="After"
              before={<EmailMockup messy />}
              after={<EmailMockup messy={false} />}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
