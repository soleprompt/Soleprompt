"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StudioResearchPanel } from "@/components/studio/StudioResearchPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { parseApiError } from "@/lib/api-error";
import {
  PIPELINE_STEPS,
  PROJECT_STATUS_LABELS,
  type PipelineStepId,
} from "@/lib/studio/pipeline/types";
import type {
  StudioProjectDetail,
  StudioProjectLogRecord,
  StudioProjectStatusPayload,
} from "@/lib/studio/projects/types";
import type { StudioProjectStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type StudioProjectDashboardProps = {
  initialProject: StudioProjectDetail;
};

const TERMINAL_STATUSES: StudioProjectStatus[] = [
  "completed",
  "failed",
  "cancelled",
];

function formatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatEstimatedCompletion(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function logLevelClass(level: StudioProjectLogRecord["level"]) {
  switch (level) {
    case "error":
      return "text-red-400";
    case "warn":
      return "text-amber-400";
    case "debug":
      return "text-muted-foreground";
    default:
      return "text-foreground";
  }
}

function StepIcon({
  completed,
  active,
  failed,
}: {
  completed: boolean;
  active: boolean;
  failed: boolean;
}) {
  if (failed) {
    return <AlertCircle className="h-4 w-4 text-red-400" />;
  }
  if (completed) {
    return <CheckCircle2 className="h-4 w-4 text-electric" />;
  }
  if (active) {
    return <Loader2 className="h-4 w-4 animate-spin text-purple" />;
  }
  return <Circle className="h-4 w-4 text-muted-foreground" />;
}

export function StudioProjectDashboard({
  initialProject,
}: StudioProjectDashboardProps) {
  const [project, setProject] = useState<StudioProjectDetail>(initialProject);
  const [pollingError, setPollingError] = useState<string | null>(null);

  const isTerminal = TERMINAL_STATUSES.includes(project.status);

  useEffect(() => {
    if (isTerminal) {
      return;
    }

    let cancelled = false;

    async function pollStatus() {
      try {
        const response = await fetch(
          `/api/studio/projects/${project.id}?status=1`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error(
            await parseApiError(response, "Failed to refresh project status."),
          );
        }

        const payload = (await response.json()) as {
          status: StudioProjectStatusPayload;
        };

        if (cancelled) return;

        setProject((current) => ({
          ...current,
          status: payload.status.status,
          currentStep: payload.status.currentStep,
          progressPercent: payload.status.progressPercent,
          estimatedCompletionAt: payload.status.estimatedCompletionAt,
          error: payload.status.error,
          completedAt: payload.status.completedAt,
          logs: payload.status.logs,
          research: payload.status.research,
        }));
        setPollingError(null);
      } catch (error) {
        if (!cancelled) {
          setPollingError(
            error instanceof Error ? error.message : "Polling failed.",
          );
        }
      }
    }

    const intervalId = window.setInterval(pollStatus, 2000);
    void pollStatus();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [project.id, isTerminal]);

  const currentStepIndex = useMemo(() => {
    if (!project.currentStep) return -1;
    return PIPELINE_STEPS.findIndex((step) => step.id === project.currentStep);
  }, [project.currentStep]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Link href="/studio/projects">
            <Button type="button" variant="ghost" size="sm" className="-ml-2">
              <ArrowLeft className="h-4 w-4" />
              All projects
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {project.topic}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  project.status === "completed"
                    ? "electric"
                    : project.status === "failed"
                      ? "outline"
                      : "purple"
                }
              >
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
              {project.niche && <Badge variant="outline">{project.niche}</Badge>}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Progress
            </p>
            <p className="mt-1 text-2xl font-semibold">{project.progressPercent}%</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Est. completion
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium">
              <Clock3 className="h-4 w-4 text-purple" />
              {formatEstimatedCompletion(project.estimatedCompletionAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Pipeline progress</h2>
          {!isTerminal && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-purple" />
              </span>
              Live updates
            </span>
          )}
        </div>

        <div className="mb-3 h-2 overflow-hidden rounded-full bg-foreground/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple to-electric transition-all duration-500"
            style={{ width: `${project.progressPercent}%` }}
          />
        </div>

        <ol className="space-y-3">
          {PIPELINE_STEPS.map((step, index) => {
            const stepId = step.id as PipelineStepId;
            const completed =
              project.status === "completed" ||
              (currentStepIndex > index && project.status !== "failed");
            const active =
              !isTerminal &&
              project.currentStep === stepId &&
              project.status !== "failed";
            const failed = project.status === "failed" && active;

            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                  active
                    ? "border-purple/40 bg-purple/5"
                    : "border-transparent bg-transparent",
                )}
              >
                <StepIcon completed={completed} active={active} failed={failed} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {PROJECT_STATUS_LABELS[step.projectStatus]}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {step.progressPercent}%
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6">
        <StudioResearchPanel research={project.research} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Artifacts</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Scenes</dt>
              <dd className="font-medium">{project.sceneCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Assets</dt>
              <dd className="font-medium">{project.assetCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Voiceovers</dt>
              <dd className="font-medium">{project.voiceoverCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Videos</dt>
              <dd className="font-medium">{project.videoCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Thumbnails</dt>
              <dd className="font-medium">{project.thumbnailCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Uploads</dt>
              <dd className="font-medium">{project.uploadCount}</dd>
            </div>
          </dl>

          {project.packageId && (
            <div className="mt-5">
              <Link href={`/studio/${project.packageId}`}>
                <Button type="button" variant="outline" size="sm">
                  View SEO package
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Logs</h2>
          {pollingError && (
            <p className="mt-2 text-xs text-amber-400">{pollingError}</p>
          )}
          {project.error && (
            <p className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {project.error}
            </p>
          )}
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
            {project.logs.length === 0 ? (
              <li className="text-sm text-muted-foreground">No logs yet.</li>
            ) : (
              project.logs.map((log) => (
                <li
                  key={log.id}
                  className="rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{formatTimestamp(log.createdAt)}</span>
                    {log.step && <span>{log.step}</span>}
                  </div>
                  <p className={cn("mt-1", logLevelClass(log.level))}>
                    {log.message}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
