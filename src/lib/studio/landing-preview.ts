export type StudioLandingPreview = {
  titles: string[];
  hook: string;
  storyboardScene: string;
  thumbnailIdea: string;
  seoTags: string[];
};

const TITLE_TEMPLATES = [
  (topic: string) => `The Truth About ${topic} Nobody Tells You`,
  (topic: string) => `I Tried ${topic} for 30 Days — Here's What Happened`,
  (topic: string) => `${topic}: The Complete Beginner's Guide (2026)`,
  (topic: string) => `Why Everyone Is Wrong About ${topic}`,
  (topic: string) => `5 ${topic} Mistakes Costing You Views`,
];

const HOOK_TEMPLATES = [
  (topic: string) =>
    `Most creators get ${topic} completely wrong. In the next 60 seconds, I'll show you the framework top channels use to turn one idea into a full video package — without spending hours in ChatGPT.`,
  (topic: string) =>
    `Stop scrolling for ${topic} inspiration. What if one sentence could give you a researched script, storyboard, thumbnail concept, and SEO tags — all in under a minute?`,
  (topic: string) =>
    `If you're making videos about ${topic}, you're probably doing 80% of the work manually. Here's how to ship a YouTube-ready package before your coffee gets cold.`,
];

const STORYBOARD_TEMPLATES = [
  (topic: string) =>
    `Scene 1 — Cold open: Split-screen "before/after" on ${topic}. Host walks into frame, bold text overlay: "This changed everything." B-roll: quick cuts of research notes transforming into a script.`,
  (topic: string) =>
    `Scene 1 — Hook shot: Close-up on host with dramatic lighting. Text pops: "${topic} in 60 seconds." Cut to whiteboard sketch animating the core concept.`,
  (topic: string) =>
    `Scene 1 — Pattern interrupt: Fast montage of failed ${topic} attempts, then freeze-frame. Host: "Here's what actually works." Transition to clean talking-head setup.`,
];

const THUMBNAIL_TEMPLATES = [
  (topic: string) =>
    `Bold split-face reaction + "${topic}" in yellow block text. High contrast purple/blue gradient background. Arrow pointing to key visual element.`,
  (topic: string) =>
    `Before/after comparison layout with shocked expression. Large "${topic}" headline, red accent on the number "5" or "30 Days".`,
  (topic: string) =>
    `Minimal dark background, glowing ${topic} icon center, host silhouette left. Electric blue outline, curiosity-gap subtitle in white.`,
];

const SEO_TAG_POOL = [
  "youtube tips",
  "content strategy",
  "video ideas",
  "creator tools",
  "how to grow",
  "script writing",
  "thumbnail design",
  "seo optimization",
  "faceless youtube",
  "ai for creators",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

export function generateLandingPreview(topic: string): StudioLandingPreview {
  const clean = topic.trim() || "your next video idea";
  const seed = hashString(clean.toLowerCase());

  const titles = [
    pick(TITLE_TEMPLATES, seed, 0)(clean),
    pick(TITLE_TEMPLATES, seed, 1)(clean),
    pick(TITLE_TEMPLATES, seed, 2)(clean),
  ];

  const seoTags = [
    clean.toLowerCase(),
    ...SEO_TAG_POOL.filter((_, i) => (seed >> i) % 2 === 0).slice(0, 4),
  ].slice(0, 6);

  return {
    titles,
    hook: pick(HOOK_TEMPLATES, seed)(clean),
    storyboardScene: pick(STORYBOARD_TEMPLATES, seed)(clean),
    thumbnailIdea: pick(THUMBNAIL_TEMPLATES, seed)(clean),
    seoTags,
  };
}
