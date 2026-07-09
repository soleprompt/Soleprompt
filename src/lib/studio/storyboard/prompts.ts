import type { StudioGeneratedContent } from "@/lib/studio/types";

export const STORYBOARD_JSON_SCHEMA = `{
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "string — short scene label",
      "estimatedDurationSec": 8,
      "narration": "string — spoken words for this scene",
      "onScreenText": "string — text overlays, lower thirds, titles",
      "visualDescription": "string — what the viewer sees",
      "cameraMovement": "string — e.g. static, push-in, handheld, drone",
      "bRollRecommendation": "string — specific b-roll shots to cut in",
      "aiImagePrompt": "string — detailed prompt for AI image generation",
      "aiVideoPrompt": "string — detailed prompt for AI video generation",
      "soundEffects": "string — specific SFX cues",
      "backgroundMusicMood": "string — music tone and energy",
      "transitionType": "string — cut, dissolve, whip, match cut, etc.",
      "captionText": "string — accessibility captions for this scene"
    }
  ]
}`;

export function buildStoryboardSystemPrompt(): string {
  return `You are SolePrompt Studio's Storyboard Engine — a professional video director and editor.
Convert a completed YouTube script into a production-ready storyboard.
Return ONLY valid JSON matching the schema. No markdown fences, no commentary.
Each scene must be independently producable by a video team or AI pipeline.
AI image/video prompts must be detailed, cinematic, and platform-safe.
Duration estimates must sum to a realistic total for the video format.`;
}

export function buildStoryboardUserPrompt(input: {
  topic: string;
  niche?: string;
  videoType: string;
  tone?: string;
  script: StudioGeneratedContent;
}): string {
  const isShorts = input.videoType === "shorts";

  return `Create a full storyboard from this completed script.

Topic: ${input.topic}
Niche: ${input.niche ?? "General"}
Format: ${isShorts ? "YouTube Shorts (under 60s total)" : "Long-form YouTube (8-15 min total)"}
Tone: ${input.tone ?? "educational"}

Script JSON:
${JSON.stringify(input.script, null, 2)}

Requirements:
- Break the script into ${isShorts ? "4-8" : "8-14"} sequential scenes covering hook → intro → main beats → outro/CTA
- sceneNumber starts at 1 and increments
- estimatedDurationSec must be realistic per scene
- Every field must be filled with specific, actionable content (no placeholders)
- aiImagePrompt and aiVideoPrompt: 2-3 sentences each, include lighting, composition, style
- transitionType must vary across scenes where appropriate

JSON schema:
${STORYBOARD_JSON_SCHEMA}`;
}
