import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getCaptionState } from "@/lib/studio/video/captions";
import { listSceneImages } from "@/lib/studio/video/scene-images";
import {
  createInitialVideoProgress,
  type VideoProgress,
  type VideoProjectState,
  type VideoStep,
  VIDEO_STEPS,
} from "@/lib/studio/video/types";
import type { MvpVoiceoverState } from "@/lib/studio/voiceover/types";
import { getProjectVoiceoverState } from "@/lib/studio/voiceover/generate";

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

export function parseVideoProgress(metadata: unknown): VideoProgress {
  const record = toRecord(metadata);
  const raw = record?.videoProgress;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return createInitialVideoProgress();
  }
  const progress = raw as Record<string, unknown>;
  const initial = createInitialVideoProgress();
  for (const step of VIDEO_STEPS) {
    const value = progress[step];
    if (
      value === "pending" ||
      value === "running" ||
      value === "completed" ||
      value === "failed"
    ) {
      initial[step] = value;
    }
  }
  return initial;
}

function mapVoiceoverToProgress(voiceover: MvpVoiceoverState): VideoProgress["voiceover"] {
  if (voiceover.status === "generating") return "running";
  if (voiceover.status === "completed") return "completed";
  if (voiceover.status === "failed") return "failed";
  return "pending";
}

export async function getVideoProjectState(
  projectId: string,
  userId: string,
): Promise<VideoProjectState> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    select: {
      metadata: true,
      scenes: { select: { id: true } },
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const metadata = toRecord(project.metadata);
  let videoProgress = parseVideoProgress(metadata);

  const voiceover = await getProjectVoiceoverState(projectId, userId);
  videoProgress = {
    ...videoProgress,
    voiceover: mapVoiceoverToProgress(voiceover),
  };

  const sceneImages = await listSceneImages(projectId, userId);
  if (sceneImages.length > 0 && sceneImages.every((s) => s.status === "completed")) {
    videoProgress.scene_images = "completed";
  } else if (sceneImages.some((s) => s.status === "completed")) {
    videoProgress.scene_images =
      videoProgress.scene_images === "running" ? "running" : "pending";
  }

  const captions = await getCaptionState(projectId);
  if (captions.status === "completed") {
    videoProgress.captions = "completed";
  }

  const studioVideo = await prisma.studioVideo.findFirst({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
  });

  const videoMeta = toRecord(metadata?.video);
  const renderProgress =
    typeof videoMeta?.renderProgress === "number" ? videoMeta.renderProgress : 0;

  if (studioVideo?.status === "completed" && studioVideo.url) {
    videoProgress.render = "completed";
  } else if (videoProgress.render === "running" || renderProgress > 0) {
    videoProgress.render = "running";
  }

  const activeVideoStep =
    (metadata?.activeVideoStep as VideoStep | null) ?? null;

  const hasStoryboard = project.scenes.length > 0;
  const isGenerating = VIDEO_STEPS.some(
    (step) => videoProgress[step] === "running",
  );

  return {
    videoProgress,
    activeVideoStep,
    voiceover,
    sceneImages,
    captions,
    video: {
      id: studioVideo?.id ?? null,
      status: studioVideo?.status === "completed" ? "completed" : videoProgress.render,
      videoUrl: studioVideo?.url ?? null,
      durationSec: studioVideo?.durationSec ?? null,
      provider: studioVideo?.provider ?? null,
      error:
        typeof videoMeta?.renderError === "string" ? videoMeta.renderError : null,
      progress: studioVideo?.status === "completed" ? 100 : renderProgress,
    },
    canStart: hasStoryboard,
    isGenerating,
  };
}

export async function setVideoProgress(
  projectId: string,
  step: VideoStep,
  status: VideoProgress[VideoStep],
  extra?: Record<string, unknown>,
) {
  const project = await prisma.studioProject.findUnique({
    where: { id: projectId },
    select: { metadata: true },
  });
  const metadata = toRecord(project?.metadata) ?? {};
  const videoProgress = parseVideoProgress(metadata);
  videoProgress[step] = status;

  await prisma.studioProject.update({
    where: { id: projectId },
    data: {
      metadata: {
        ...metadata,
        ...extra,
        videoProgress,
        activeVideoStep:
          status === "running"
            ? step
            : status === "completed"
              ? null
              : (metadata.activeVideoStep as VideoStep | null) ?? null,
      } as Prisma.InputJsonValue,
    },
  });
}
