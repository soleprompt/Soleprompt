"use client";

import { Check, Loader2 } from "lucide-react";
import { getNarrativeHeadline } from "@/lib/studio/projects/mvp-narrative";
import {
  MVP_STEP_LABELS,
  MVP_STEPS,
  type MvpProgress,
  type MvpStep,
  type MvpStepStatus,
} from "@/lib/studio/projects/mvp-types";
import { StudioGlassCard, StudioMiniProgress } from "@/components/studio/studio-ui";
import { cn } from "@/lib/utils";

type StudioMvpProgressProps = {
  progress: MvpProgress;
  activeStep: MvpStep | null;
};

function StepIndicator({ status }: { status: MvpStepStatus }) {
  if (status === "running") {
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />;
  }
  if (status === "completed") {
    return <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />;
  }
  if (status === "failed") {
    return <span className="text-[10px] font-bold text-white">!</span>;
  }
  return <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />;
}

export function StudioMvpProgress({ progress, activeStep }: StudioMvpProgressProps) {
  const completedCount = MVP_STEPS.filter((s) => progress[s] === "completed").length;
  const percent = Math.round((completedCount / MVP_STEPS.length) * 100);
  const isRunning = MVP_STEPS.some((s) => progress[s] === "running");

  return (
    <StudioGlassCard glow className="overflow-hidden p-5 sm:p-6 animate-studio-fade-in-up">
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple/20 blur-[60px]" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-electric/15 blur-[50px]" />

      <div className="relative">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              Production pipeline
            </p>
            <p className="mt-1.5 text-2xl font-semibold tracking-[-0.02em]">
              {getNarrativeHeadline(progress, activeStep)}
            </p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="bg-gradient-to-r from-purple to-electric bg-clip-text text-4xl font-bold tabular-nums text-transparent">
              {percent}
            </span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>

        <div className="relative mb-7">
          <StudioMiniProgress percent={percent} />
        </div>

        {isRunning && (
          <p className="mb-4 flex items-center gap-2 text-xs text-purple">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple" />
            </span>
            Live generation in progress
          </p>
        )}

        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-1">
          {MVP_STEPS.map((step, index) => {
            const status = progress[step];
            const isActive = status === "running" || activeStep === step;
            const isComplete = status === "completed";
            const isFailed = status === "failed";

            return (
              <li
                key={step}
                className={cn(
                  "relative animate-studio-fade-in-up opacity-0",
                  `studio-stagger-${index + 1}`,
                )}
                style={{ animationFillMode: "forwards" }}
              >
                {index < MVP_STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-[calc(50%+20px)] top-5 hidden h-px sm:block",
                      "w-[calc(100%-40px)] transition-colors duration-500",
                      isComplete ? "bg-electric/50" : "bg-white/[0.06]",
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition-all duration-300",
                    isActive && "bg-purple/10",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-500",
                      isComplete
                        ? "border-electric bg-electric shadow-[0_0_20px_rgba(0,102,255,0.35)]"
                        : isActive
                          ? "animate-studio-step-pulse border-purple bg-purple shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                          : isFailed
                            ? "border-red-500/60 bg-red-500/80"
                            : "border-white/[0.1] bg-white/[0.03]",
                    )}
                  >
                    <StepIndicator status={status} />
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium sm:text-xs",
                      isComplete
                        ? "text-electric"
                        : isActive
                          ? "text-purple"
                          : "text-muted-foreground",
                    )}
                  >
                    {MVP_STEP_LABELS[step]}
                    {isComplete && (
                      <span className="ml-0.5 opacity-80" aria-hidden>
                        ✓
                      </span>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </StudioGlassCard>
  );
}
