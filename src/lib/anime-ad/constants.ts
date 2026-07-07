export const ANIME_AD_TOOL_PATH = "/admin/anime-ad";
export const ANIME_AD_TOOL_TITLE = "Anime Ad Generator";

export const ANIME_STYLES = [
  {
    id: "shonen",
    label: "Shōnen Action",
    mood: "high-energy battle sparks and speed lines",
    palette: "electric blue, crimson accents, bold outlines",
  },
  {
    id: "slice-of-life",
    label: "Slice of Life",
    mood: "warm afternoon light and gentle character moments",
    palette: "pastel sky, soft peach, watercolor textures",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk Anime",
    mood: "neon rain, holographic UI, dystopian city depth",
    palette: "magenta neon, cyan glow, deep purple shadows",
  },
  {
    id: "studio-ghibli",
    label: "Studio Ghibli",
    mood: "whimsical nature, floating particles, nostalgic wonder",
    palette: "lush green, golden hour, hand-painted clouds",
  },
  {
    id: "mecha",
    label: "Mecha",
    mood: "giant robot scale, cockpit HUD, cinematic lens flare",
    palette: "gunmetal, warning orange, cockpit teal",
  },
  {
    id: "dark-fantasy",
    label: "Dark Fantasy",
    mood: "dramatic shadows, arcane symbols, epic tension",
    palette: "obsidian, blood red, moonlit silver",
  },
] as const;

export const AD_PLATFORMS = [
  {
    id: "tiktok",
    label: "TikTok",
    aspectRatio: "9:16",
    duration: "15–30 sec",
    hookWindow: "first 1.5 seconds",
  },
  {
    id: "instagram-reels",
    label: "Instagram Reels",
    aspectRatio: "9:16",
    duration: "15–30 sec",
    hookWindow: "first 2 seconds",
  },
  {
    id: "youtube-short",
    label: "YouTube Short",
    aspectRatio: "9:16",
    duration: "30–60 sec",
    hookWindow: "first 3 seconds",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    aspectRatio: "16:9 or 1:1",
    duration: "6–15 sec loop",
    hookWindow: "instant visual punch",
  },
  {
    id: "facebook",
    label: "Facebook / Meta",
    aspectRatio: "1:1 or 4:5",
    duration: "15 sec",
    hookWindow: "first 2 seconds (sound-off safe)",
  },
] as const;

export const AD_TONES = [
  { id: "energetic", label: "Energetic", voice: "fast cuts, hype VO, punchy on-screen text" },
  { id: "emotional", label: "Emotional", voice: "slow build, piano swell, character close-ups" },
  { id: "humorous", label: "Humorous", voice: "exaggerated reactions, comedic timing, meme beats" },
  { id: "epic", label: "Epic", voice: "orchestral rise, hero framing, dramatic reveals" },
  { id: "mysterious", label: "Mysterious", voice: "teaser cuts, whisper VO, glitch transitions" },
] as const;

export type AnimeStyleId = (typeof ANIME_STYLES)[number]["id"];
export type AdPlatformId = (typeof AD_PLATFORMS)[number]["id"];
export type AdToneId = (typeof AD_TONES)[number]["id"];
