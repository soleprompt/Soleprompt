import { getAppUrl } from "@/lib/app-url";
import type { AutoPostType } from "@/lib/social/auto-post-types";
import { pickRandomTemplates } from "@/lib/social/tweet-templates";

function studioUrl(path: string): string {
  return `${getAppUrl()}${path}`;
}

const DEMO_VIDEO_TEMPLATES = (): string[] => {
  const welcome = studioUrl("/studio/welcome");
  return [
    `See SolePrompt Studio in action — turn a topic into a full YouTube package in minutes: ${welcome}`,
    `From idea to script, storyboard, and thumbnail prompts. Watch how Studio works: ${welcome}`,
    `Stop staring at a blank doc. SolePrompt Studio builds your YouTube content pipeline: ${welcome}`,
    `One topic in, complete YouTube package out. Try the Studio demo: ${welcome}`,
    `Creators: this is what AI-assisted production looks like. Studio walkthrough: ${welcome}`,
  ];
};

const CUSTOMER_WIN_TEMPLATES = (): string[] => {
  const site = getAppUrl();
  return [
    `"I used to spend 6 hours on one video outline. SolePrompt Studio cut it to 45 minutes." — creator using ${site}`,
    `A solar rep closed 2 extra deals last month using SolePrompt sales prompts. Small change, big pipeline.`,
    `"Finally, AI output I can actually publish." — marketer who switched to SolePrompt prompts at ${site}`,
    `One creator went from 1 video/month to 4 using Studio's script + storyboard workflow. Momentum matters.`,
    `"My team stopped rewriting the same ChatGPT prompts." SolePrompt gave us repeatable templates that work.`,
    `Customer win: a solo founder launched a weekly YouTube series without hiring a content team. Tools > headcount.`,
  ];
};

const AI_TIP_TEMPLATES = (): string[] => {
  const site = getAppUrl();
  return [
    `AI tip: give ChatGPT a role, audience, and output format in the first line. Vague prompts = vague results. More templates at ${site}`,
    `Prompt tip: ask for 3 variants, then say "combine the best parts." You'll get sharper copy faster.`,
    `YouTube growth tip: hook in the first 8 seconds, promise in the title, deliver in the first 30. Studio helps structure all three.`,
    `AI tip: paste your last 3 posts and ask "what pattern should I repeat?" Consistency beats novelty for growth.`,
    `Prompt engineering shortcut: "Act as [expert]. Goal: [X]. Constraints: [Y]. Format: [Z]." Steal ready-made versions at ${site}`,
    `Creator tip: batch your outlines on Monday, record on Tuesday, edit Wed–Thu. Studio speeds up the Monday step.`,
    `AI tip: end prompts with "ask me 2 clarifying questions first" when the task is complex. Saves bad first drafts.`,
  ];
};

const YOUTUBE_EXAMPLE_TEMPLATES = (): string[] => {
  const site = studioUrl("/studio/welcome");
  return [
    `Studio output example: Title → Hook → Full script → Scene storyboard → Thumbnail concepts. One workflow, one place: ${site}`,
    `What a SolePrompt Studio package looks like: research brief, outline, script beats, B-roll ideas, and publish checklist.`,
    `YouTube example format we generate: cold open hook, chapter markers, CTA, and description SEO — not just a wall of text.`,
    `Example pipeline: Topic "solar panel ROI" → 8-min script → 12 storyboard frames → 5 thumbnail angles. Built in Studio.`,
    `This is the difference between "write a video" and "ship a video." See the full Studio output format: ${site}`,
  ];
};

export function pickAutoPostContent(postType: AutoPostType): string {
  let pool: string[];

  switch (postType) {
    case "original":
      return pickRandomTemplates(1)[0] ?? `Practical AI prompts for real work: ${getAppUrl()}`;
    case "demo_video":
      pool = DEMO_VIDEO_TEMPLATES();
      break;
    case "customer_win":
      pool = CUSTOMER_WIN_TEMPLATES();
      break;
    case "ai_tip":
      pool = AI_TIP_TEMPLATES();
      break;
    case "youtube_example":
      pool = YOUTUBE_EXAMPLE_TEMPLATES();
      break;
  }

  const index = Math.floor(Math.random() * pool.length);
  return pool[index]!;
}
