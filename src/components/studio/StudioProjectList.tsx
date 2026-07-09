import { ArrowRight, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  StudioEmptyState,
  StudioGlassCard,
  StudioListItem,
  StudioMiniProgress,
} from "@/components/studio/studio-ui";
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
      <StudioGlassCard className="animate-studio-fade-in-up studio-stagger-2">
        <StudioEmptyState
          icon={FolderOpen}
          variant="purple"
          title="No projects yet"
          description="Create a project to generate research, script, storyboard, thumbnails, and SEO from a single topic."
        />
      </StudioGlassCard>
    );
  }

  return (
    <div className="space-y-4 animate-studio-fade-in-up studio-stagger-2">
      <h2 className="text-lg font-semibold tracking-tight">Your projects</h2>
      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.id}>
            <StudioListItem
              href={`/studio/projects/${project.id}`}
              title={project.topic}
              accent="purple"
              meta={
                <>
                  <Badge variant={statusVariant(project.status)}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {project.progressPercent}%
                  </span>
                  <div className="hidden w-24 sm:block">
                    <StudioMiniProgress percent={project.progressPercent} />
                  </div>
                </>
              }
              trailing={
                <>
                  <span className="hidden sm:inline">
                    {formatDate(project.createdAt)}
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
