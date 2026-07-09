import "server-only";

import type { TtsResult, VoiceoverProvider } from "@/lib/studio/voiceover/types";

const OPENAI_SPEECH_URL = "https://api.openai.com/v1/audio/speech";
const DEFAULT_OPENAI_TTS_MODEL = "tts-1";
const DEFAULT_OPENAI_VOICE = "onyx";
const DEFAULT_ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const MAX_CHUNK_CHARS = 3500;

type OpenAIErrorResponse = {
  error?: { message?: string };
};

function resolveProvider(): VoiceoverProvider {
  const override = process.env.STUDIO_VOICEOVER_PROVIDER?.trim().toLowerCase();
  if (override === "openai" || override === "elevenlabs") {
    return override;
  }
  if (process.env.OPENAI_API_KEY?.trim()) {
    return "openai";
  }
  if (process.env.ELEVENLABS_API_KEY?.trim()) {
    return "elevenlabs";
  }
  throw new Error(
    "No TTS provider configured. Set OPENAI_API_KEY or ELEVENLABS_API_KEY.",
  );
}

function splitTextIntoChunks(text: string): string[] {
  if (text.length <= MAX_CHUNK_CHARS) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > MAX_CHUNK_CHARS) {
    let splitAt = remaining.lastIndexOf("\n\n", MAX_CHUNK_CHARS);
    if (splitAt < MAX_CHUNK_CHARS * 0.5) {
      splitAt = remaining.lastIndexOf(". ", MAX_CHUNK_CHARS);
    }
    if (splitAt < MAX_CHUNK_CHARS * 0.5) {
      splitAt = MAX_CHUNK_CHARS;
    }

    const chunk = remaining.slice(0, splitAt).trim();
    if (chunk) chunks.push(chunk);
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining.trim()) {
    chunks.push(remaining.trim());
  }

  return chunks;
}

async function synthesizeOpenAiChunk(
  text: string,
  voiceOverride?: string,
): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const model = process.env.OPENAI_TTS_MODEL?.trim() || DEFAULT_OPENAI_TTS_MODEL;
  const voice =
    voiceOverride || process.env.OPENAI_TTS_VOICE?.trim() || DEFAULT_OPENAI_VOICE;

  const response = await fetch(OPENAI_SPEECH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    let message = `OpenAI TTS failed (${response.status}).`;
    try {
      const payload = (await response.json()) as OpenAIErrorResponse;
      if (payload.error?.message) {
        message = payload.error.message;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function synthesizeElevenLabsChunk(text: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured.");
  }

  const voiceId =
    process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_ELEVENLABS_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2";

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
      }),
    },
  );

  if (!response.ok) {
    let message = `ElevenLabs TTS failed (${response.status}).`;
    try {
      const payload = (await response.json()) as { detail?: { message?: string } };
      if (payload.detail?.message) {
        message = payload.detail.message;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function synthesizeSpeech(
  text: string,
  options?: { voice?: string },
): Promise<TtsResult> {
  const provider = resolveProvider();
  const chunks = splitTextIntoChunks(text.trim());
  const buffers: Buffer[] = [];
  const voiceOverride = options?.voice?.trim();

  for (const chunk of chunks) {
    if (provider === "openai") {
      buffers.push(await synthesizeOpenAiChunk(chunk, voiceOverride));
    } else {
      buffers.push(await synthesizeElevenLabsChunk(chunk));
    }
  }

  const voiceId =
    provider === "openai"
      ? voiceOverride || process.env.OPENAI_TTS_VOICE?.trim() || DEFAULT_OPENAI_VOICE
      : process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_ELEVENLABS_VOICE_ID;

  return {
    audio: Buffer.concat(buffers),
    provider,
    voiceId,
    model:
      provider === "openai"
        ? process.env.OPENAI_TTS_MODEL?.trim() || DEFAULT_OPENAI_TTS_MODEL
        : process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2",
  };
}
