import {
  AD_PLATFORMS,
  AD_TONES,
  ANIME_STYLES,
  type AdPlatformId,
  type AdToneId,
  type AnimeStyleId,
} from "@/lib/anime-ad/constants";

export type AnimeAdInput = {
  productName: string;
  productDescription?: string;
  targetAudience: string;
  platform: AdPlatformId;
  animeStyle: AnimeStyleId;
  tone: AdToneId;
  cta?: string;
  brandColors?: string;
};

export type AnimeAdConcept = {
  id: number;
  title: string;
  hook: string;
  script: string;
  onScreenText: string[];
  visualDirection: string;
  imagePrompt: string;
  videoPrompt: string;
  cta: string;
  musicMood: string;
  platformNotes: string;
};

export type AnimeAdResult = {
  concepts: AnimeAdConcept[];
  generatedAt: string;
  summary: string;
};

const HOOK_TEMPLATES = [
  "What if {{product}} had a secret power?",
  "POV: {{audience}} finally found {{product}}",
  "They said {{product}} couldn't change the game…",
  "Watch this {{audience}} unlock {{product}} in 15 seconds",
  "The anime opening {{product}} deserves",
] as const;

const CTA_DEFAULTS = [
  "Shop now — link in bio",
  "Try free today",
  "Get yours before the arc ends",
  "Start your journey →",
  "Claim your starter pack",
] as const;

const MUSIC_BY_TONE: Record<AdToneId, string[]> = {
  energetic: ["J-rock opener", "hyperpop drop", "drum & bass chase"],
  emotional: ["soft piano + strings", "acoustic anime ending theme", "ambient swell"],
  humorous: ["bouncy chiptune", "comedic brass sting", "upbeat ukulele loop"],
  epic: ["orchestral crescendo", "taiko + choir rise", "cinematic trailer score"],
  mysterious: ["synth noir pulse", "lo-fi tape hiss", "minimal arpeggio tension"],
};

const SCENE_BEATS = [
  "cold open on protagonist's problem",
  "product reveal as power-up item",
  "before/after split-screen transformation",
  "group reaction shot (friends cheering)",
  "slow-motion hero pose with product",
  "speed-line montage of results",
  "cozy payoff scene with satisfied smile",
  "cliffhanger tease for next episode",
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: readonly T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length]!;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function buildImagePrompt(
  input: AnimeAdInput,
  style: (typeof ANIME_STYLES)[number],
  beat: string,
): string {
  const colors = input.brandColors?.trim() || style.palette;
  const product = input.productName.trim();
  const desc = input.productDescription?.trim();

  return [
    `anime advertisement key visual, ${style.label} style`,
    `${style.mood}`,
    `scene: ${beat} featuring "${product}"${desc ? ` — ${desc}` : ""}`,
    `target audience: ${input.targetAudience}`,
    `color palette: ${colors}`,
    "cinematic composition, detailed background, professional ad quality",
    "no text, no watermark, 4k illustration",
  ].join(", ");
}

function buildVideoPrompt(
  input: AnimeAdInput,
  style: (typeof ANIME_STYLES)[number],
  platform: (typeof AD_PLATFORMS)[number],
): string {
  return [
    `${platform.duration} anime-style ad for ${input.productName}`,
    `${style.label} aesthetic, ${style.mood}`,
    `${platform.aspectRatio} vertical video, smooth camera push-in`,
    "anime speed lines, particle effects, dynamic lighting",
    "product hero shot at 0:08, CTA end card with logo space",
  ].join(". ");
}

function buildScript(
  input: AnimeAdInput,
  hook: string,
  beat: string,
  tone: (typeof AD_TONES)[number],
  platform: (typeof AD_PLATFORMS)[number],
): string {
  const product = input.productName.trim();
  const audience = input.targetAudience.trim();
  const payoff = input.productDescription?.trim()
    ? `That's ${product} — ${input.productDescription.trim()}`
    : `That's ${product} — built for ${audience}.`;

  return [
    `[${platform.hookWindow}] ${hook}`,
    `[0:03] ${beat}. Character realizes the old way isn't working.`,
    `[0:06] Product appears with ${tone.voice}.`,
    `[0:10] ${payoff}`,
    `[0:13] Quick montage: 3 results shots (stats, smile, social proof).`,
    `[0:15] CTA card + logo sting.`,
  ].join("\n");
}

function conceptTitle(seed: number, product: string): string {
  const frames = [
    `Episode 1: ${product} Awakens`,
    `The ${product} Arc`,
    `${product} — Final Form`,
    `Side Quest: Find ${product}`,
    `${product} Origin Story`,
  ];
  return pick(frames, seed);
}

export function generateAnimeAds(input: AnimeAdInput): AnimeAdResult {
  const product = input.productName.trim();
  const audience = input.targetAudience.trim();

  if (!product || !audience) {
    throw new Error("Product name and target audience are required.");
  }

  const style = ANIME_STYLES.find((s) => s.id === input.animeStyle) ?? ANIME_STYLES[0]!;
  const platform =
    AD_PLATFORMS.find((p) => p.id === input.platform) ?? AD_PLATFORMS[0]!;
  const tone = AD_TONES.find((t) => t.id === input.tone) ?? AD_TONES[0]!;
  const seed = hashString(
    `${product}|${audience}|${input.platform}|${input.animeStyle}|${input.tone}`,
  );
  const cta = input.cta?.trim() || pick(CTA_DEFAULTS, seed);

  const concepts: AnimeAdConcept[] = [0, 1, 2].map((index) => {
    const conceptSeed = seed + index * 17;
    const hookTemplate = pick(HOOK_TEMPLATES, conceptSeed);
    const hook = hookTemplate
      .replace(/\{\{product\}\}/g, product)
      .replace(/\{\{audience\}\}/g, audience);
    const beat = pick(SCENE_BEATS, conceptSeed, index);
    const music = pick(MUSIC_BY_TONE[input.tone], conceptSeed);

    const onScreenText = [
      truncate(hook, 42),
      product.toUpperCase(),
      cta,
    ];

    const platformNotes =
      platform.id === "facebook"
        ? "Design for sound-off: bold captions on every beat. Add burned-in subtitles."
        : platform.id === "twitter"
          ? "Loop-friendly ending — last frame matches first frame for seamless replay."
          : `Optimize for ${platform.hookWindow}. Front-load the product name or visual.`;

    return {
      id: index + 1,
      title: conceptTitle(conceptSeed, product),
      hook,
      script: buildScript(input, hook, beat, tone, platform),
      onScreenText,
      visualDirection: [
        `Style: ${style.label} — ${style.mood}`,
        `Opening: ${beat}`,
        `Tone: ${tone.label} (${tone.voice})`,
        `Format: ${platform.label}, ${platform.aspectRatio}, ${platform.duration}`,
        `Color direction: ${input.brandColors?.trim() || style.palette}`,
      ].join("\n"),
      imagePrompt: buildImagePrompt(input, style, beat),
      videoPrompt: buildVideoPrompt(input, style, platform),
      cta,
      musicMood: music,
      platformNotes,
    };
  });

  return {
    concepts,
    generatedAt: new Date().toISOString(),
    summary: `3 ${style.label} ad concepts for ${product} on ${platform.label}, targeting ${audience} with a ${tone.label.toLowerCase()} tone.`,
  };
}

export function formatAnimeAdExport(result: AnimeAdResult, input: AnimeAdInput): string {
  const sections = result.concepts.map((concept) => {
    return `## Concept ${concept.id}: ${concept.title}

### Hook
${concept.hook}

### Script
${concept.script}

### On-Screen Text
${concept.onScreenText.map((line) => `- ${line}`).join("\n")}

### Visual Direction
${concept.visualDirection}

### Image Prompt (Midjourney / DALL·E)
${concept.imagePrompt}

### Video Prompt (Runway / Pika)
${concept.videoPrompt}

### CTA
${concept.cta}

### Music Mood
${concept.musicMood}

### Platform Notes
${concept.platformNotes}`;
  });

  return `# Anime Ad Generator — Export

**Product:** ${input.productName}
**Audience:** ${input.targetAudience}
**Platform:** ${input.platform}
**Style:** ${input.animeStyle}
**Tone:** ${input.tone}

${result.summary}

---

${sections.join("\n\n---\n\n")}`;
}
