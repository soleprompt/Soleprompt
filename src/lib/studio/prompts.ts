import type { StudioGenerateInput } from "@/lib/studio/types";

export const STUDIO_JSON_SCHEMA_DESCRIPTION = `{
  "titles": ["string x5 — click-worthy, varied angles"],
  "script": "string — full spoken script with pacing cues",
  "hook": "string — first 3-8 seconds",
  "intro": "string — channel promise + episode setup",
  "mainSections": [
    {
      "heading": "string",
      "content": "string — spoken content for this beat",
      "retentionTip": "string — optional edit/pattern interrupt note"
    }
  ],
  "outro": "string",
  "callToAction": "string — may mention SolePrompt naturally",
  "description": "string — YouTube description with keywords",
  "tags": ["string"],
  "thumbnailIdeas": ["string x3-5 — on-image text concepts"],
  "pinnedComment": "string"
}`;

export function buildStudioSystemPrompt(): string {
  return `You are SolePrompt Studio — an elite YouTube retention strategist and scriptwriter.
Return ONLY valid JSON matching the schema. No markdown fences, no commentary.
Optimize every field for watch time, clarity, and shareability.
Use conversational spoken English. Include pattern interrupts and open loops where appropriate.
CTA may mention SolePrompt (AI tools marketplace) when natural — never force it.`;
}

export function buildStudioUserPrompt(input: StudioGenerateInput): string {
  const isShorts = input.videoType === "shorts";

  return `Create a high-retention YouTube ${isShorts ? "Short" : "long-form video"} package.

Topic: ${input.topic}
Niche: ${input.niche ?? "General / inferred from topic"}
Tone: ${input.tone ?? "educational"}
Format: ${isShorts ? "Shorts (under 60s, vertical, punchy beats)" : "Long-form (8-15 min structure, deeper sections)"}

Requirements:
- Exactly 5 title options (curiosity + clarity, no clickbait lies)
- Full script with [VISUAL] or [B-ROLL] cues where helpful
- Hook optimized for the first 3 seconds
- ${isShorts ? "3-4" : "4-6"} mainSections with retentionTip each
- Description: first 2 lines hook + timestamps-style beats for long-form
- 10-15 SEO tags
- 3-5 thumbnail text ideas (short, high contrast)
- Pinned comment that drives engagement

JSON schema:
${STUDIO_JSON_SCHEMA_DESCRIPTION}`;
}
