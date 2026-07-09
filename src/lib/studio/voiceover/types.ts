export type VoiceoverProvider = "openai" | "elevenlabs";

export type VoiceoverStatus = "pending" | "generating" | "completed" | "failed";

export type MvpVoiceoverState = {
  id: string | null;
  status: VoiceoverStatus;
  audioUrl: string | null;
  provider: string | null;
  voiceId: string | null;
  durationSec: number | null;
  textPreview: string | null;
  error: string | null;
  updatedAt: string | null;
};

export type TtsResult = {
  audio: Buffer;
  provider: VoiceoverProvider;
  voiceId: string;
  model?: string;
};
