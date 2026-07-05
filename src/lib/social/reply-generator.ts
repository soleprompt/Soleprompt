import crypto from "node:crypto";
import {
  detectCategoryFromText,
  renderReplyTemplate,
  REPLY_STYLES,
  REPLY_TEMPLATES,
  SOLEPROMPT_LINK,
  type ReplyCategory,
  type ReplyStyle,
  type ReplyTemplate,
} from "@/lib/social/reply-templates";

export { REPLY_STYLES, type ReplyStyle };

export type GeneratedReplyOption = {
  style: ReplyStyle;
  content: string;
  includesLink: boolean;
  taglineKey: string;
};

const TOPIC_HINTS: Record<ReplyCategory, string> = {
  "ai-prompts": "AI prompts and getting better outputs",
  chatgpt: "using ChatGPT effectively",
  productivity: "productivity with AI workflows",
  marketing: "AI for marketing and copy",
  "small-business": "AI for small business owners",
};

function firstSentence(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const match = trimmed.match(/^[^.!?]+[.!?]?/);
  return match ? match[0].trim() : trimmed.slice(0, 120);
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

export function summarizePost(
  snippet: string | null | undefined,
  author?: string | null,
): string {
  const text = snippet?.trim();
  const handle = author?.trim().replace(/^@/, "");

  if (!text) {
    return handle
      ? `@${handle} shared a post about AI and productivity — a good opportunity for a thoughtful, value-first reply.`
      : "A post about AI, prompts, or productivity — reply with something genuinely helpful rather than promotional.";
  }

  const lead = firstSentence(text);
  const topic = detectCategoryFromText(text);
  const topicLabel = TOPIC_HINTS[topic];

  if (handle) {
    return `@${handle} discusses ${topicLabel}: "${truncate(lead, 100)}" — aim for a reply that adds insight without sounding salesy.`;
  }

  return `Post about ${topicLabel}: "${truncate(lead, 100)}" — reply with practical value that fits the conversation.`;
}

function pickTemplateForStyle(
  category: ReplyCategory,
  style: ReplyStyle,
  index: number,
): ReplyTemplate {
  const templates = REPLY_TEMPLATES[category];
  const nonLink = templates.filter((t) => !t.includesLink);
  const withLink = templates.filter((t) => t.includesLink);

  if (style === "less-promotional") {
    return nonLink[index % nonLink.length] ?? templates[0]!;
  }

  if (style === "helpful" && withLink.length > 0 && index === 3) {
    return withLink[0]!;
  }

  const pool = nonLink.length > 0 ? nonLink : templates;
  return pool[index % pool.length]!;
}

function applyStyleFrame(
  style: ReplyStyle,
  body: string,
  author?: string | null,
): string {
  const handle = author?.trim().replace(/^@/, "");
  const mention = handle ? `@${handle} ` : "";

  switch (style) {
    case "educational":
      return `${mention}One thing I've learned: ${body.charAt(0).toLowerCase()}${body.slice(1)}`;
    case "question":
      return `${mention}${body} Curious — what's your go-to approach here?`;
    case "founder":
      return `${mention}As a founder building with AI daily: ${body.charAt(0).toLowerCase()}${body.slice(1)}`;
    case "helpful":
      return `${mention}Hope this helps — ${body.charAt(0).toLowerCase()}${body.slice(1)}`;
    case "less-promotional":
      return `${mention}${body.replace(new RegExp(SOLEPROMPT_LINK, "g"), "").replace(/\s+/g, " ").trim()}`;
    default:
      return body;
  }
}

function ensureMaxLength(content: string, max = 280): string {
  if (content.length <= max) return content;
  return truncate(content, max);
}

export function generateFiveReplies(
  tweetText: string,
  category: ReplyCategory,
  options?: {
    author?: string | null;
    usedTaglineKeys?: Set<string>;
  },
): GeneratedReplyOption[] {
  const used = options?.usedTaglineKeys ?? new Set<string>();
  const author = options?.author;
  const results: GeneratedReplyOption[] = [];

  for (let i = 0; i < REPLY_STYLES.length; i++) {
    const style = REPLY_STYLES[i]!.id;
    let template = pickTemplateForStyle(category, style, i);

    if (used.has(template.taglineKey)) {
      const alternatives = REPLY_TEMPLATES[category].filter(
        (t) =>
          !used.has(t.taglineKey) &&
          (style === "less-promotional" ? !t.includesLink : true),
      );
      if (alternatives.length > 0) {
        template = alternatives[i % alternatives.length]!;
      }
    }

    let includesLink = template.includesLink;
    if (style === "less-promotional") {
      includesLink = false;
    }

    const rendered = renderReplyTemplate({
      ...template,
      includesLink,
    });

    let content = applyStyleFrame(style, rendered, author);
    content = ensureMaxLength(content);

    results.push({
      style,
      content,
      includesLink,
      taglineKey: `${template.taglineKey}-${style}`,
    });
  }

  return results;
}

export function createBatchId(): string {
  return crypto.randomUUID();
}
