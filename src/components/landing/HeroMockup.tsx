"use client";

import { motion } from "framer-motion";
import {
  Calculator,
  Download,
  FileText,
  Mail,
  ShieldCheck,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS = [
  {
    title: "X Account Checker",
    subtitle: "Audit risky posts",
    icon: ShieldCheck,
    accent: "from-sky-500/20 to-blue-600/30",
    iconColor: "text-sky-400",
  },
  {
    title: "Solar ROI Calculator",
    subtitle: "Estimate payback",
    icon: Calculator,
    accent: "from-amber-500/20 to-orange-600/30",
    iconColor: "text-amber-400",
  },
  {
    title: "Cold Email Generator",
    subtitle: "Outreach that converts",
    icon: Mail,
    accent: "from-emerald-500/20 to-teal-600/30",
    iconColor: "text-emerald-400",
  },
  {
    title: "Resume Optimizer",
    subtitle: "ATS-ready in minutes",
    icon: FileText,
    accent: "from-purple-500/20 to-violet-600/30",
    iconColor: "text-purple-400",
  },
] as const;

const MODEL_BADGES = [
  {
    label: "ChatGPT",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    position: "-left-4 top-8 sm:-left-8 sm:top-12",
    delay: 0,
  },
  {
    label: "Claude",
    className: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    position: "-right-2 top-1/4 sm:-right-6",
    delay: 0.5,
  },
  {
    label: "Gemini",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    position: "-left-2 bottom-1/3 sm:-left-6",
    delay: 1,
  },
  {
    label: "Grok",
    className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-200",
    position: "-right-4 bottom-16 sm:-right-8 sm:bottom-20",
    delay: 1.5,
  },
] as const;

interface HeroMockupProps {
  toolCountLabel?: string;
}

export function HeroMockup({ toolCountLabel = "500+" }: HeroMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.35 }}
      className="relative mx-auto w-full max-w-xl lg:max-w-none"
    >
      {MODEL_BADGES.map((badge) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 + badge.delay * 0.15 }}
          className={cn(
            "animate-float-badge absolute z-20 hidden rounded-full border px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md sm:block",
            badge.position,
            badge.className,
          )}
          style={{ animationDelay: `${badge.delay}s` }}
        >
          {badge.label}
        </motion.div>
      ))}

      <div
        className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-electric/25 via-purple/15 to-transparent blur-3xl"
        aria-hidden
      />

      {/* Laptop base */}
      <div className="relative">
        <div className="relative overflow-hidden rounded-t-2xl border border-border/80 bg-[#0a0a0f] shadow-2xl shadow-electric/15 ring-1 ring-white/10">
          <div className="flex items-center gap-2 border-b border-white/5 bg-[#111118] px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="mx-auto flex h-7 max-w-[280px] flex-1 items-center justify-center gap-2 rounded-lg bg-black/50 px-4 text-[11px] text-muted-foreground ring-1 ring-white/5">
              <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
              soleprompt.com/explore
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-electric">
                  SolePrompt Marketplace
                </p>
                <h2 className="mt-1.5 text-lg font-semibold leading-snug text-foreground sm:text-xl">
                  AI tools ready to download
                </h2>
              </div>
              <div className="hidden items-center gap-1 rounded-lg border border-electric/20 bg-electric/10 px-2.5 py-1.5 sm:flex">
                <Star className="h-3.5 w-3.5 fill-electric text-electric" />
                <span className="text-xs font-medium text-electric">4.9</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {TOOLS.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
                    className={cn(
                      "rounded-xl border border-white/5 bg-gradient-to-br p-3.5 transition-colors hover:border-electric/30",
                      tool.accent,
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/40 ring-1 ring-white/10">
                        <Icon className={cn("h-4 w-4", tool.iconColor)} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {tool.title}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                          {tool.subtitle}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-electric/25 bg-electric/5 px-4 py-2.5">
              <span className="text-xs text-muted-foreground">
                {toolCountLabel} ready-to-download tools
              </span>
              <span className="flex items-center gap-1 rounded-full bg-electric/20 px-2.5 py-1 text-[10px] font-medium text-electric">
                <Download className="h-3 w-3" />
                Instant access
              </span>
            </div>
          </div>
        </div>

        {/* Laptop hinge / base */}
        <div
          className="mx-auto h-3 w-[92%] rounded-b-lg bg-gradient-to-b from-zinc-700/80 to-zinc-900/90"
          aria-hidden
        />
        <div
          className="mx-auto -mt-0.5 h-1.5 w-[70%] rounded-full bg-zinc-800/90"
          aria-hidden
        />
      </div>
    </motion.div>
  );
}
