"use client";

import Link from "next/link";
import { Check, Circle, Sparkles, X } from "lucide-react";
import { useTransition } from "react";
import { dismissOnboarding } from "@/app/actions/onboarding";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { OnboardingProgress } from "@/lib/onboarding";

type OnboardingChecklistProps = {
  progress: OnboardingProgress;
};

export function OnboardingChecklist({ progress }: OnboardingChecklistProps) {
  const [isPending, startTransition] = useTransition();
  const progressPercent = Math.round(
    (progress.completedCount / progress.totalCount) * 100,
  );

  function handleDismiss() {
    startTransition(() => {
      void dismissOnboarding();
    });
  }

  return (
    <Card className="mb-6 border-electric/20 bg-gradient-to-br from-electric/5 via-card/50 to-purple/5 lg:mb-8">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-electric/10">
            <Sparkles className="h-5 w-5 text-electric" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Get started with SolePrompt
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {progress.completedCount} of {progress.totalCount} complete — finish
              these steps to make the most of your account.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          disabled={isPending}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          aria-label="Dismiss checklist"
        >
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-electric to-purple transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <ul className="space-y-2">
          {progress.steps.map((step) => (
            <li key={step.id}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors",
                  step.completed
                    ? "text-muted-foreground"
                    : "hover:border-electric/20 hover:bg-electric/5",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    step.completed
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      : "border-border bg-background text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {step.completed ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    step.completed && "line-through",
                  )}
                >
                  {step.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
