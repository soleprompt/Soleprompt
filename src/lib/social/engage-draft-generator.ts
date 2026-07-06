import {
  detectCategoryFromText,
  renderReplyTemplate,
  REPLY_TEMPLATES,
  SOLEPROMPT_LINK,
  type ReplyCategory,
} from "@/lib/social/reply-templates";
import type { EngageTopicId } from "@/lib/social/engage-topics";

export const ENGAGE_REPLY_STYLES = [
  { id: "helpful", label: "Helpful" },
  { id: "question", label: "Question" },
  { id: "founder_pov", label: "Founder POV" },
  { id: "soft_promo", label: "Soft Promo" },
] as const;

export type EngageReplyStyle = (typeof ENGAGE_REPLY_STYLES)[number]["id"];

export type GeneratedEngageDraft = {
  style: EngageReplyStyle;
  content: string;
  includesLink: boolean;
  taglineKey: string;
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function ensureMaxLength(content: string, max = 280): string {
  if (content.length <= max) return content;
  return truncate(content, max);
}

function pickThirdStyle(matchedTopics: EngageTopicId[]): EngageReplyStyle {
  if (
    matchedTopics.includes("marketing") ||
    matchedTopics.includes("saas") ||
    matchedTopics.includes("prompts")
  ) {
    return "soft_promo";
  }
  return "founder_pov";
}

function pickTemplate(
  category: ReplyCategory,
  preferLink: boolean,
  index: number,
): (typeof REPLY_TEMPLATES)[ReplyCategory][number] {
  const templates = REPLY_TEMPLATES[category];
  const withLink = templates.filter((t) => t.includesLink);
  const withoutLink = templates.filter((t) => !t.includesLink);

  if (preferLink && withLink.length > 0) {
    return withLink[index % withLink.length]!;
  }

  const pool = withoutLink.length > 0 ? withoutLink : templates;
  return pool[index % pool.length]!;
}

function applyEngageStyleFrame(
  style: EngageReplyStyle,
  body: string,
  author?: string | null,
): string {
  const handle = author?.trim().replace(/^@/, "");
  const mention = handle ? `@${handle} ` : "";

  switch (style) {
    case "helpful":
      return `${mention}Hope this helps — ${body.charAt(0).toLowerCase()}${body.slice(1)}`;
    case "question":
      return `${mention}${body} What's worked for you on this?`;
    case "founder_pov":
      return `${mention}Building with AI daily as a founder — ${body.charAt(0).toLowerCase()}${body.slice(1)}`;
    case "soft_promo":
      return `${mention}${body}`;
    default:
      return body;
  }
}

export function generateEngageDrafts(
  tweetText: string,
  options?: {
    author?: string | null;
    matchedTopics?: EngageTopicId[];
    usedTaglineKeys?: Set<string>;
  },
): GeneratedEngageDraft[] {
  const category = detectCategoryFromText(tweetText);
  const author = options?.author;
  const used = options?.usedTaglineKeys ?? new Set<string>();
  const matchedTopics = options?.matchedTopics ?? [];

  const styles: EngageReplyStyle[] = [
    "helpful",
    "question",
    pickThirdStyle(matchedTopics),
  ];

  const results: GeneratedEngageDraft[] = [];

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i]!;
    const preferLink = style === "soft_promo";
    let template = pickTemplate(category, preferLink, i);

    if (used.has(template.taglineKey)) {
      const alternatives = REPLY_TEMPLATES[category].filter(
        (t) =>
          !used.has(t.taglineKey) &&
          (preferLink ? t.includesLink : !t.includesLink),
      );
      if (alternatives.length > 0) {
        template = alternatives[i % alternatives.length]!;
      }
    }

    let includesLink = template.includesLink && style === "soft_promo";
    if (style !== "soft_promo") {
      includesLink = false;
    }

    const rendered = renderReplyTemplate({
      ...template,
      includesLink,
    });

    let body = rendered;
    if (style !== "soft_promo") {
      body = body.replace(new RegExp(SOLEPROMPT_LINK, "g"), "").replace(/\s+/g, " ").trim();
    }

    let content = applyEngageStyleFrame(style, body, author);
    content = ensureMaxLength(content);

    results.push({
      style,
      content,
      includesLink,
      taglineKey: `engage-${template.taglineKey}-${style}`,
    });
  }

  return results;
}
