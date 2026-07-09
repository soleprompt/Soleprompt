import type { MvpVoiceoverState } from "@/lib/studio/voiceover/types";

export const VIDEO_STEPS = [
  "voiceover",
  "scene_images",
  "captions",
  "render",
] as const;

export type VideoStep = (typeof VIDEO_STEPS)[number];

export type VideoStepStatus = "pending" | "running" | "completed" | "failed";

export type VideoProgress = Record<VideoStep, VideoStepStatus>;

export const VIDEO_STEP_LABELS: Record<VideoStep, string> = {
  voiceover: "Voiceover",
  scene_images: "Scene Images",
  captions: "Captions",
  render: "Video Render",
};

export type SceneImageAsset = {
  sceneId: string;
  sceneNumber: number;
  title: string;
  imageUrl: string | null;
  provider: string | null;
  status: VideoStepStatus;
};

export type CaptionState = {
  status: VideoStepStatus;
  srtUrl: string | null;
  wordCount: number;
  error: string | null;
};

export type VideoRenderState = {
  id: string | null;
  status: VideoStepStatus;
  videoUrl: string | null;
  durationSec: number | null;
  provider: string | null;
  error: string | null;
  progress: number;
};

export type VideoProjectState = {
  videoProgress: VideoProgress;
  activeVideoStep: VideoStep | null;
  voiceover: MvpVoiceoverState;
  sceneImages: SceneImageAsset[];
  captions: CaptionState;
  video: VideoRenderState;
  canStart: boolean;
  isGenerating: boolean;
};

export const OPENAI_TTS_VOICES = [
  { id: "alloy", label: "Alloy" },
  { id: "echo", label: "Echo" },
  { id: "fable", label: "Fable" },
  { id: "onyx", label: "Onyx" },
  { id: "nova", label: "Nova" },
  { id: "shimmer", label: "Shimmer" },
] as const;

export type OpenAiTtsVoice = (typeof OPENAI_TTS_VOICES)[number]["id"];

export function createInitialVideoProgress(): VideoProgress {
  return {
    voiceover: "pending",
    scene_images: "pending",
    captions: "pending",
    render: "pending",
  };
}
