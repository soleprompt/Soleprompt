import type { PipelineContext, PipelineStepResult } from "@/lib/studio/pipeline/types";

export function getMetadataString(
  context: PipelineContext,
  key: string,
): string | undefined {
  const value = context.metadata[key];
  return typeof value === "string" ? value : undefined;
}

export function getMetadataArray(
  context: PipelineContext,
  key: string,
): unknown[] {
  const value = context.metadata[key];
  return Array.isArray(value) ? value : [];
}

export function getMetadataObject(
  context: PipelineContext,
  key: string,
): Record<string, unknown> {
  const value = context.metadata[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

export function successResult(
  output: Record<string, unknown>,
  metadataPatch?: Record<string, unknown>,
): PipelineStepResult {
  return { output, metadataPatch };
}

export function sceneCountForVideoType(videoType: string): number {
  return videoType === "shorts" ? 4 : 6;
}
