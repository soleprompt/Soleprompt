"use client";

import {
  BarChart3,
  Check,
  Clapperboard,
  FileText,
  ImageIcon,
  Lightbulb,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  STUDIO_PRODUCTION_FLOW,
  getActiveFlowIndex,
  type StudioFlowBeat,
} from "@/lib/studio/projects/mvp-narrative";
import type { MvpProgress, MvpStep } from "@/lib/studio/projects/mvp-types";
import { StudioGlassCard } from "@/components/studio/studio-ui";
import { cn } from "@/lib/utils";

const FLOW_ICONS: Record<string, LucideIcon> = {
  intro: Lightbulb,
  research: Search,
  script: FileText,
  storyboard: Clapperboard,
  thumbnail: ImageIcon,
  seo: BarChart3,
  done: Sparkles,
};

type StudioProductionFlowProps = {
  mode?: "demo" | "live";
  progress?: MvpProgress;
  activeStep?: MvpStep | null;
  topic?: string;
  className?: string;
  compact?: boolean;
};

function beatState(
  index: number,
  activeIndex: number,
  mode: "demo" | "live",
  progress?: MvpProgress,
  beat?: StudioFlowBeat,
): "done" | "active" | "pending" {
  if (index < activeIndex) return "done";
  if (index === activeIndex) return "active";
  if (mode === "live" && beat?.step && beat.step !== "intro" && beat.step !== "done") {
    if (progress?.[beat.step] === "completed") return "done";
    if (progress?.[beat.step] === "running") return "active";
  }
  return "pending";
}

export function StudioProductionFlow({
  mode = "demo",
  progress,
  activeStep = null,
  topic,
  className,
  compact = false,
}: StudioProductionFlowProps) {
  const [demoIndex, setDemoIndex] = useState(0);

  const liveIndex =
    progress && mode === "live"
      ? getActiveFlowIndex(progress, activeStep)
      : demoIndex;

  const activeIndex = mode === "demo" ? demoIndex : liveIndex;

  useEffect(() => {
    if (mode !== "demo") return;

    const intervalId = window.setInterval(() => {
      setDemoIndex((current) => (current + 1) % STUDIO_PRODUCTION_FLOW.length);
    }, 2200);

    return () => window.clearInterval(intervalId);
  }, [mode]);

  return (
    <StudioGlassCard
      glow
      className={cn(
        "overflow-hidden animate-studio-fade-in-up",
        compact ? "p-4" : "p-5 sm:p-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-0 h-32 w-32 rounded-full bg-purple/20 blur-[50px]"
      />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
          {mode === "live" ? "Your journey" : "How it works"}
        </p>
        {topic && mode === "live" && (
          <p className={cn("mt-1 truncate text-muted-foreground", compact ? "text-xs" : "text-sm")}>
            &ldquo;{topic}&rdquo;
          </p>
        )}

        <ol className={cn("space-y-0", compact ? "mt-3" : "mt-5")}>
          {STUDIO_PRODUCTION_FLOW.map((beat, index) => {
            const state = beatState(index, activeIndex, mode, progress, beat);
            const Icon = FLOW_ICONS[beat.id] ?? Sparkles;
            const isLast = index === STUDIO_PRODUCTION_FLOW.length - 1;

            return (
              <li key={beat.id}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl transition-all duration-500",
                    compact ? "px-2 py-1.5" : "px-3 py-2.5",
                    state === "active" &&
                      "bg-gradient-to-r from-purple/15 to-transparent shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]",
                    state === "done" && "opacity-70",
                    state === "pending" && "opacity-40",
                  )}
                >
                  <div
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-lg transition-all duration-500",
                      compact ? "h-6 w-6" : "h-8 w-8",
                      state === "active"
                        ? "bg-purple text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                        : state === "done"
                          ? "bg-electric/20 text-electric"
                          : "bg-white/[0.05] text-muted-foreground",
                    )}
                  >
                    {state === "done" ? (
                      <Check className={compact ? "h-3 w-3" : "h-4 w-4"} strokeWidth={2.5} />
                    ) : state === "active" && mode === "live" ? (
                      <Loader2 className={cn("animate-spin", compact ? "h-3 w-3" : "h-4 w-4")} />
                    ) : (
                      <Icon className={compact ? "h-3 w-3" : "h-4 w-4"} strokeWidth={1.75} />
                    )}
                  </div>
                  <p
                    className={cn(
                      "font-medium transition-all duration-500",
                      compact ? "text-xs" : "text-sm sm:text-base",
                      state === "active" && "text-foreground",
                      state === "done" && "text-electric",
                      state === "pending" && "text-muted-foreground",
                    )}
                  >
                    {beat.label}
                  </p>
                </div>

                {!isLast && (
                  <div className={cn("flex justify-start", compact ? "py-0.5 pl-5" : "py-1 pl-[1.375rem]")}>
                    <span
                      className={cn(
                        "leading-none transition-colors duration-500",
                        compact ? "text-sm" : "text-lg",
                        index < activeIndex ? "text-electric/50" : "text-white/10",
                      )}
                      aria-hidden
                    >
                      ↓
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {mode === "demo" && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            One topic in — full YouTube package out
          </p>
        )}
      </div>
    </StudioGlassCard>
  );
}
