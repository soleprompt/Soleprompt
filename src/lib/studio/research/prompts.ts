import type { StudioResearchInput } from "@/lib/studio/research/types";

export const RESEARCH_JSON_SCHEMA = `{
  "targetAudience": "string — specific viewer persona, demographics, and psychographics",
  "searchIntent": "string — primary YouTube/Google search intent this video satisfies",
  "competitorChannels": [
    {
      "channelName": "string — realistic YouTube channel name or archetype",
      "contentAngle": "string — how they cover this topic",
      "strength": "string — what they do well",
      "gapToExploit": "string — opportunity your video can own"
    }
  ],
  "trendingVideoAngles": ["string x5-8 — timely angles with high click potential"],
  "viralHooks": ["string x5 — spoken hooks for first 3 seconds"],
  "keywordClusters": [
    { "theme": "string", "keywords": ["string x3-6"] }
  ],
  "longTailKeywords": ["string x10-15 — low-competition search phrases"],
  "questionsPeopleAsk": ["string x8-12 — real questions from comments/forums"],
  "emotionalTriggers": ["string x5-8 — emotions to activate (curiosity, fear, hope, etc.)"],
  "thumbnailPsychology": [
    { "principle": "string", "recommendation": "string — how to apply on thumbnail" }
  ],
  "viewerObjections": ["string x4-6 — doubts viewers have before watching"],
  "retentionOpportunities": ["string x5-8 — pattern interrupts, open loops, payoffs"],
  "suggestedCta": "string — natural CTA; may mention SolePrompt when relevant",
  "monetizationIdeas": ["string x3-5 — ads, products, services, memberships"],
  "affiliateOpportunities": ["string x3-5 — specific affiliate angles or product types"]
}`;

export function buildResearchSystemPrompt(): string {
  return `You are SolePrompt Studio's YouTube Research Engine — an elite strategist combining SEO, audience psychology, and retention science.
Return ONLY valid JSON matching the schema. No markdown fences, no commentary.
Ground recommendations in how YouTube discovery, CTR, and watch-time actually work in 2026.
Be specific to the topic and niche. Avoid generic filler. Competitor channels should feel like real YouTube archetypes.
CTA may mention SolePrompt (AI tools marketplace) when natural — never force it.`;
}

export function buildResearchUserPrompt(input: StudioResearchInput): string {
  const angles =
    input.trendingAngles && input.trendingAngles.length > 0
      ? input.trendingAngles.map((angle, index) => `${index + 1}. ${angle}`).join("\n")
      : "None provided — infer from topic and niche.";

  return `Conduct deep YouTube research for a video production project.

Topic: ${input.topic}
Niche: ${input.niche ?? "General / infer from topic"}
Format: ${input.videoType ?? "long-form"}
Tone: ${input.tone ?? "educational"}
Prior trend angles:
${angles}

Requirements:
- competitorChannels: exactly 4 entries
- trendingVideoAngles: 5-8 entries
- viralHooks: exactly 5 entries
- keywordClusters: 4-6 clusters
- longTailKeywords: 10-15 entries
- questionsPeopleAsk: 8-12 entries
- emotionalTriggers: 5-8 entries
- thumbnailPsychology: 4-6 entries
- viewerObjections: 4-6 entries
- retentionOpportunities: 5-8 entries
- monetizationIdeas: 3-5 entries
- affiliateOpportunities: 3-5 entries

JSON schema:
${RESEARCH_JSON_SCHEMA}`;
}
