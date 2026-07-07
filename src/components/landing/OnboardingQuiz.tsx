"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { PromptCard } from "@/components/marketplace/PromptCard";
import { SectionGlow } from "@/components/brand/SectionGlow";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import {
  getOnboardingGoal,
  getRecommendationsForGoal,
  ONBOARDING_GOALS,
  ONBOARDING_STORAGE_KEY,
  type OnboardingGoalId,
} from "@/lib/onboarding-quiz";
import type { Prompt } from "@/types";

interface OnboardingQuizProps {
  prompts: Prompt[];
}

export function OnboardingQuiz({ prompts }: OnboardingQuizProps) {
  const [selectedGoal, setSelectedGoal] = useState<OnboardingGoalId | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored && getOnboardingGoal(stored)) {
        setSelectedGoal(stored as OnboardingGoalId);
      }
    } catch {
      // localStorage unavailable
    }
    setHydrated(true);
  }, []);

  const activeGoal = selectedGoal ? getOnboardingGoal(selectedGoal) : null;

  const recommendations = useMemo(() => {
    if (!selectedGoal) return [];
    return getRecommendationsForGoal(selectedGoal, prompts, 3);
  }, [selectedGoal, prompts]);

  function handleSelect(goalId: OnboardingGoalId) {
    setSelectedGoal(goalId);
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, goalId);
    } catch {
      // ignore
    }

    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function handleReset() {
    setSelectedGoal(null);
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  if (!hydrated) {
    return (
      <section className="relative py-16 sm:py-20" id="onboarding">
        <SectionGlow variant="section" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="h-48 animate-pulse rounded-2xl border border-border bg-card/30" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 sm:py-24" id="onboarding">
      <SectionGlow variant="section" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Quick start"
          title="What are you trying to accomplish today?"
          description="Pick a goal and we'll recommend tools tailored to you — takes 5 seconds."
          align="center"
        />

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ONBOARDING_GOALS.map((goal, index) => {
            const isSelected = selectedGoal === goal.id;

            return (
              <motion.button
                key={goal.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                onClick={() => handleSelect(goal.id)}
                className={cn(
                  "group relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200",
                  "hover:-translate-y-0.5 hover:border-electric/50 hover:shadow-lg hover:shadow-electric/10",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50",
                  isSelected
                    ? "border-electric bg-electric/10 shadow-md shadow-electric/10"
                    : "border-border bg-card/40 hover:bg-card/60",
                )}
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background/60 text-2xl"
                  aria-hidden
                >
                  {goal.emoji}
                </span>
                <span className="font-medium text-foreground">{goal.label}</span>
                {isSelected && (
                  <Sparkles className="ml-auto h-4 w-4 text-electric" aria-hidden />
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeGoal && (
            <motion.div
              key={activeGoal.id}
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mt-12"
            >
              <div className="rounded-2xl border border-electric/30 bg-gradient-to-br from-electric/5 via-card/40 to-purple/5 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-electric">
                      {activeGoal.emoji} Picked for you
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
                      {activeGoal.resultHeadline}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                      {activeGoal.resultDescription}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Change goal
                  </button>
                </div>

                {recommendations.length > 0 ? (
                  <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {recommendations.map((prompt, index) => (
                      <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        priorityImage={index === 0}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-muted-foreground">
                    Browse our curated path for this goal.
                  </p>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link href={activeGoal.academyHref}>
                    <Button size="lg" className="group w-full sm:w-auto">
                      {activeGoal.pathCta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href={activeGoal.exploreHref}>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Browse all matching tools
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
