import type { StoryboardSceneContent } from "@/lib/studio/storyboard/types";

function asRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid ${field}: expected non-empty string.`);
  }
  return value.trim();
}

function asDuration(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid ${field}: expected positive number.`);
  }
  return Math.round(value);
}

function parseScene(raw: unknown, index: number): StoryboardSceneContent {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Invalid scenes[${index}].`);
  }

  const record = raw as Record<string, unknown>;
  const prefix = `scenes[${index}]`;

  return {
    sceneNumber:
      typeof record.sceneNumber === "number"
        ? record.sceneNumber
        : index + 1,
    title: asRequiredString(record.title, `${prefix}.title`),
    estimatedDurationSec: asDuration(
      record.estimatedDurationSec,
      `${prefix}.estimatedDurationSec`,
    ),
    narration: asRequiredString(record.narration, `${prefix}.narration`),
    onScreenText: asRequiredString(record.onScreenText, `${prefix}.onScreenText`),
    visualDescription: asRequiredString(
      record.visualDescription,
      `${prefix}.visualDescription`,
    ),
    cameraMovement: asRequiredString(
      record.cameraMovement,
      `${prefix}.cameraMovement`,
    ),
    bRollRecommendation: asRequiredString(
      record.bRollRecommendation,
      `${prefix}.bRollRecommendation`,
    ),
    aiImagePrompt: asRequiredString(record.aiImagePrompt, `${prefix}.aiImagePrompt`),
    aiVideoPrompt: asRequiredString(record.aiVideoPrompt, `${prefix}.aiVideoPrompt`),
    soundEffects: asRequiredString(record.soundEffects, `${prefix}.soundEffects`),
    backgroundMusicMood: asRequiredString(
      record.backgroundMusicMood,
      `${prefix}.backgroundMusicMood`,
    ),
    transitionType: asRequiredString(
      record.transitionType,
      `${prefix}.transitionType`,
    ),
    captionText: asRequiredString(record.captionText, `${prefix}.captionText`),
  };
}

export function parseStoryboardContent(raw: unknown): StoryboardSceneContent[] {
  if (!raw || typeof raw !== "object") {
    throw new Error("AI response was not a JSON object.");
  }

  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.scenes) || record.scenes.length === 0) {
    throw new Error("AI response must include a non-empty scenes array.");
  }

  const scenes = record.scenes.map((scene, index) => parseScene(scene, index));

  scenes.sort((a, b) => a.sceneNumber - b.sceneNumber);
  return scenes;
}
