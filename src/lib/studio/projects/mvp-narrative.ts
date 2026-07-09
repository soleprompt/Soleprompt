import type { MvpProgress, MvpStep } from "@/lib/studio/projects/mvp-types";

export type StudioFlowBeat = {
  id: string;
  label: string;
  step: MvpStep | "intro" | "done" | null;
};

export const STUDIO_PRODUCTION_FLOW: StudioFlowBeat[] = [
  { id: "intro", label: "I typed one idea…", step: "intro" },
  { id: "research", label: "Research starts…", step: "research" },
  { id: "script", label: "Script writes…", step: "script" },
  { id: "storyboard", label: "Storyboard appears…", step: "storyboard" },
  { id: "thumbnail", label: "Thumbnail ideas appear…", step: "thumbnail" },
  { id: "seo", label: "SEO generated…", step: "seo" },
  { id: "done", label: "Done in under a minute.", step: "done" },
];

export function getActiveFlowIndex(
  progress: MvpProgress,
  activeStep: MvpStep | null,
): number {
  const allComplete = STUDIO_PRODUCTION_FLOW.slice(1, -1).every((beat) => {
    if (!beat.step || beat.step === "intro" || beat.step === "done") return true;
    return progress[beat.step] === "completed";
  });

  if (allComplete) {
    return STUDIO_PRODUCTION_FLOW.length - 1;
  }

  if (activeStep) {
    const index = STUDIO_PRODUCTION_FLOW.findIndex((beat) => beat.step === activeStep);
    if (index >= 0) return index;
  }

  for (const beat of STUDIO_PRODUCTION_FLOW) {
    if (!beat.step || beat.step === "intro" || beat.step === "done") continue;
    if (progress[beat.step] === "running") {
      return STUDIO_PRODUCTION_FLOW.findIndex((b) => b.step === beat.step);
    }
  }

  for (const beat of STUDIO_PRODUCTION_FLOW) {
    if (!beat.step || beat.step === "intro" || beat.step === "done") continue;
    if (progress[beat.step] === "pending") {
      return STUDIO_PRODUCTION_FLOW.findIndex((b) => b.step === beat.step);
    }
  }

  return 0;
}

export function getNarrativeHeadline(
  progress: MvpProgress,
  activeStep: MvpStep | null,
): string {
  return STUDIO_PRODUCTION_FLOW[getActiveFlowIndex(progress, activeStep)].label;
}

export function isFlowComplete(progress: MvpProgress): boolean {
  return STUDIO_PRODUCTION_FLOW.slice(1, -1).every((beat) => {
    if (!beat.step || beat.step === "intro" || beat.step === "done") return true;
    return progress[beat.step] === "completed";
  });
}
