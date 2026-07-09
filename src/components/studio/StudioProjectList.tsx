import Link from "next/link";
import { ArrowRight, Clapperboard } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PROJECT_STATUS_LABELS } from "@/lib/studio/pipeline/types";
import type { StudioProjectSummary } from "@/lib/studio/projects/types";
import type { StudioProjectStatus } from "@/generated/prisma/client";

type StudioProjectListProps = {
  projects: StudioProjectSummary[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusVariant(status: StudioProjectStatus) {
  switch (status) {
    case "completed":
      return "electric" as const;
    case "failed":
      return "outline" as const;
    case "cancelled":
      return "outline" as const;
    default:
      return "purple" as const;
  }
}

export function StudioProjectList({ projects }: StudioProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/30 px-6 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple/10">
          <Clapperboard className="h-6 w-6 text-purple" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No production projects yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Start a full pipeline project to research trends, generate scenes, compose
          video, and prepare SEO — all from one topic.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Production projects</h2>
      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/studio/projects/${project.id}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/50 px-4 py-4 transition-colors hover:border-purple/30 hover:bg-card"
            >
              <div className="min-w-0 space-y-2">
                <p className="truncate font-medium group-hover:text-purple">
                  {project.topic}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(project.status)}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {project.progressPercent}% complete
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">
                  {formatDate(project.createdAt)}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
