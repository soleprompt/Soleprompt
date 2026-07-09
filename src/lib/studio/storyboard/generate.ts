import "server-only";

import {
  buildStoryboardSystemPrompt,
  buildStoryboardUserPrompt,
} from "@/lib/studio/storyboard/prompts";
import { parseStoryboardContent } from "@/lib/studio/storyboard/parse";
import type { StoryboardGenerationResult } from "@/lib/studio/storyboard/types";
import type { StudioGeneratedContent } from "@/lib/studio/types";

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

export async function generateStoryboardFromScript(input: {
  topic: string;
  niche?: string;
  videoType: string;
  tone?: string;
  script: StudioGeneratedContent;
}): Promise<StoryboardGenerationResult> {
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
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildStoryboardSystemPrompt() },
        { role: "user", content: buildStoryboardUserPrompt(input) },
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

  const scenes = parseStoryboardContent(parsed);

  return {
    scenes,
    provider: "openai",
    model,
  };
}
