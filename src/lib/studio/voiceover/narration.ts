import "server-only";

import { prisma } from "@/lib/db";
import type { StudioGeneratedContent } from "@/lib/studio/types";

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function isStudioGeneratedContent(value: unknown): value is StudioGeneratedContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.script === "string" && Array.isArray(record.titles);
}

function buildNarrationFromParts(script: StudioGeneratedContent): string {
  const sections = script.mainSections
    .map((section) => section.content.trim())
    .filter(Boolean);

  return [
    script.hook.trim(),
    script.intro.trim(),
    ...sections,
    script.outro.trim(),
    script.callToAction.trim(),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function resolveProjectNarrationText(
  projectId: string,
  userId: string,
): Promise<string> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    select: {
      metadata: true,
      packageId: true,
      package: {
        select: { script: true },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const metadata = toRecord(project.metadata);
  const script = isStudioGeneratedContent(metadata?.script) ? metadata.script : null;

  if (script?.script?.trim()) {
    return script.script.trim();
  }

  if (project.package?.script?.trim()) {
    return project.package.script.trim();
  }

  if (script) {
    const assembled = buildNarrationFromParts(script);
    if (assembled.trim()) {
      return assembled.trim();
    }
  }

  throw new Error(
    "Script required before generating voiceover. Complete the script step first.",
  );
}
