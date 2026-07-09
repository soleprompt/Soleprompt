export type StoryboardSceneContent = {
  sceneNumber: number;
  title: string;
  estimatedDurationSec: number;
  narration: string;
  onScreenText: string;
  visualDescription: string;
  cameraMovement: string;
  bRollRecommendation: string;
  aiImagePrompt: string;
  aiVideoPrompt: string;
  soundEffects: string;
  backgroundMusicMood: string;
  transitionType: string;
  captionText: string;
};

export type StoryboardGenerationResult = {
  scenes: StoryboardSceneContent[];
  provider: string;
  model: string;
};

export type StoryboardSceneRecord = StoryboardSceneContent & {
  id: string;
  projectId: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type StoryboardGenerateInput = {
  projectId: string;
};

export const STORYBOARD_STATUS_LABELS = {
  writing: "Writing Script",
  storyboarding: "Generating Storyboard",
  storyboard_complete: "Storyboard Complete",
} as const;

export const STORYBOARD_SCENE_FIELDS = [
  { key: "narration", label: "Narration" },
  { key: "onScreenText", label: "On-screen text" },
  { key: "visualDescription", label: "Visual description" },
  { key: "cameraMovement", label: "Camera movement" },
  { key: "bRollRecommendation", label: "B-roll recommendation" },
  { key: "aiImagePrompt", label: "AI image prompt" },
  { key: "aiVideoPrompt", label: "AI video prompt" },
  { key: "soundEffects", label: "Sound effects" },
  { key: "backgroundMusicMood", label: "Background music mood" },
  { key: "transitionType", label: "Transition type" },
  { key: "captionText", label: "Caption text" },
] as const;

export type StoryboardSceneEditableField =
  (typeof STORYBOARD_SCENE_FIELDS)[number]["key"] | "title" | "estimatedDurationSec";
