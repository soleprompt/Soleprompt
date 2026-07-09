import type { StoryboardGenerateInput } from "@/lib/studio/storyboard/types";

export type StoryboardValidationResult =
  | { ok: true; data: StoryboardGenerateInput }
  | { ok: false; error: string };

export function validateStoryboardInput(body: unknown): StoryboardValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const record = body as Record<string, unknown>;
  const projectId =
    typeof record.projectId === "string" ? record.projectId.trim() : "";

  if (!projectId) {
    return { ok: false, error: "projectId is required." };
  }

  return { ok: true, data: { projectId } };
}

export type StoryboardSceneUpdateInput = Partial<{
  title: string;
  estimatedDurationSec: number;
  narration: string;
  onScreenText: string;
  visualDescription: string;
  cameraMovement: string;
  bRollRecommendation: string;
  aiImagePrompt: string;
  aiVideoPrompt: string;
  soundEffects: string;
  backgroundMusicMood: string;
  transitionType: string;
  captionText: string;
}>;

export function validateStoryboardSceneUpdate(
  body: unknown,
): { ok: true; data: StoryboardSceneUpdateInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const record = body as Record<string, unknown>;
  const data: StoryboardSceneUpdateInput = {};

  const stringFields = [
    "title",
    "narration",
    "onScreenText",
    "visualDescription",
    "cameraMovement",
    "bRollRecommendation",
    "aiImagePrompt",
    "aiVideoPrompt",
    "soundEffects",
    "backgroundMusicMood",
    "transitionType",
    "captionText",
  ] as const;

  for (const field of stringFields) {
    if (record[field] !== undefined) {
      if (typeof record[field] !== "string") {
        return { ok: false, error: `${field} must be a string.` };
      }
      data[field] = record[field];
    }
  }

  if (record.estimatedDurationSec !== undefined) {
    if (
      typeof record.estimatedDurationSec !== "number" ||
      record.estimatedDurationSec <= 0
    ) {
      return { ok: false, error: "estimatedDurationSec must be a positive number." };
    }
    data.estimatedDurationSec = Math.round(record.estimatedDurationSec);
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "No valid fields to update." };
  }

  return { ok: true, data };
}
