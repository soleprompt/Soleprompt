import "server-only";

import {
  buildStudioSystemPrompt,
  buildStudioUserPrompt,
} from "@/lib/studio/prompts";
import type {
  StudioGeneratedContent,
  StudioGenerateInput,
  StudioMainSection,
} from "@/lib/studio/types";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

function asStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Invalid ${field}: expected string array.`);
  }
  return value;
}

function asMainSections(value: unknown): StudioMainSection[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Invalid mainSections: expected non-empty array.");
  }

  return value.map((section, index) => {
    if (!section || typeof section !== "object") {
      throw new Error(`Invalid mainSections[${index}].`);
    }

    const record = section as Record<string, unknown>;
    const heading = typeof record.heading === "string" ? record.heading.trim() : "";
    const content = typeof record.content === "string" ? record.content.trim() : "";

    if (!heading || !content) {
      throw new Error(`Invalid mainSections[${index}]: heading and content required.`);
    }

    const retentionTip =
      typeof record.retentionTip === "string" && record.retentionTip.trim()
        ? record.retentionTip.trim()
        : undefined;

    return { heading, content, retentionTip };
  });
}

function asRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid ${field}: expected non-empty string.`);
  }
  return value.trim();
}

export function parseStudioGeneratedContent(raw: unknown): StudioGeneratedContent {
  if (!raw || typeof raw !== "object") {
    throw new Error("AI response was not a JSON object.");
  }

  const record = raw as Record<string, unknown>;
  const titles = asStringArray(record.titles, "titles");

  if (titles.length < 5) {
    throw new Error("AI response must include at least 5 titles.");
  }

  return {
    titles,
    script: asRequiredString(record.script, "script"),
    hook: asRequiredString(record.hook, "hook"),
    intro: asRequiredString(record.intro, "intro"),
    mainSections: asMainSections(record.mainSections),
    outro: asRequiredString(record.outro, "outro"),
    callToAction: asRequiredString(record.callToAction, "callToAction"),
    description: asRequiredString(record.description, "description"),
    tags: asStringArray(record.tags, "tags"),
    thumbnailIdeas: asStringArray(record.thumbnailIdeas, "thumbnailIdeas"),
    pinnedComment: asRequiredString(record.pinnedComment, "pinnedComment"),
  };
}

export async function generateStudioPackage(
  input: StudioGenerateInput,
): Promise<StudioGeneratedContent> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

  const response = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildStudioSystemPrompt() },
        { role: "user", content: buildStudioUserPrompt(input) },
      ],
    }),
  });

  const payload = (await response.json()) as OpenAIChatResponse;

  if (!response.ok) {
    throw new Error(
      payload.error?.message ?? `OpenAI request failed (${response.status}).`,
    );
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned invalid JSON.");
  }

  return parseStudioGeneratedContent(parsed);
}
