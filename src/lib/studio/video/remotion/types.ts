import type { CaptionWord } from "@/lib/studio/video/captions";

export type RemotionSceneInput = {
  imagePath: string;
  durationSec: number;
  captionWords: CaptionWord[];
  kenBurnsDirection: "in" | "out" | "pan-left" | "pan-right";
};

export type RemotionVideoInput = {
  scenes: RemotionSceneInput[];
  narrationAudioPath: string;
  backgroundMusicPath: string | null;
  width: number;
  height: number;
  fps: number;
};

export const REMOTION_COMPOSITION_ID = "FacelessVideo";

export const REMOTION_FPS = 30;

export function getVideoDimensions(
  videoType: string,
): { width: number; height: number } {
  if (videoType === "shorts") {
    return { width: 1080, height: 1920 };
  }
  return { width: 1920, height: 1080 };
}
