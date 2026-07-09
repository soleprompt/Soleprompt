"use client";

import {
  BarChart3,
  Check,
  Clapperboard,
  FileText,
  ImageIcon,
  Lightbulb,
  Rocket,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { StudioGlassCard } from "@/components/studio/studio-ui";
import { cn } from "@/lib/utils";

const LANDING_FLOW: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "idea", label: "Idea", icon: Lightbulb },
  { id: "research", label: "Research", icon: Search },
  { id: "script", label: "Script", icon: FileText },
  { id: "storyboard", label: "Storyboard", icon: Clapperboard },
  { id: "thumbnail", label: "Thumbnail", icon: ImageIcon },
  { id: "seo", label: "SEO", icon: BarChart3 },
  { id: "publish", label: "Publish", icon: Rocket },
];

export function StudioLandingWorkflow() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % LANDING_FLOW.length);
    }, 2000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section
      id="workflow"
      className="scroll-mt-20 border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-purple">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          One topic in. Full package out.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          SolePrompt Studio walks your idea through every step a pro creator
          team handles — automatically.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-md">
        <StudioGlassCard glow className="p-5 sm:p-6">
          <ol className="space-y-0">
            {LANDING_FLOW.map((step, index) => {
              const state =
                index < activeIndex
                  ? "done"
                  : index === activeIndex
                    ? "active"
                    : "pending";
              const Icon = step.icon;
              const isLast = index === LANDING_FLOW.length - 1;

              return (
                <li key={step.id}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-500",
                      state === "active" &&
                        "bg-gradient-to-r from-purple/15 to-transparent shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]",
                      state === "done" && "opacity-70",
                      state === "pending" && "opacity-40",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-500",
                        state === "active"
                          ? "bg-purple text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] animate-studio-step-pulse"
                          : state === "done"
                            ? "bg-electric/20 text-electric"
                            : "bg-white/[0.05] text-muted-foreground",
                      )}
                    >
                      {state === "done" ? (
                        <Check className="h-4 w-4" strokeWidth={2.5} />
                      ) : (
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      )}
                    </div>
                    <p
                      className={cn(
                        "font-medium transition-all duration-500",
                        state === "active" && "text-foreground",
                        state === "done" && "text-electric",
                        state === "pending" && "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </p>
                  </div>

                  {!isLast && (
                    <div className="flex justify-start py-1 pl-[1.375rem]">
                      <span
                        className={cn(
                          "text-lg leading-none transition-colors duration-500",
                          index < activeIndex
                            ? "text-electric/50"
                            : "text-white/10",
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
        </StudioGlassCard>
      </div>
    </section>
  );
}
