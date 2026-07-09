import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { appendProjectLog } from "@/lib/studio/projects/data";
import { generateCaptions } from "@/lib/studio/video/captions";
import { renderProjectVideo } from "@/lib/studio/video/render";
import { generateAllSceneImages } from "@/lib/studio/video/scene-images";
import { getVideoProjectState, setVideoProgress } from "@/lib/studio/video/state";
import {
  VIDEO_STEPS,
  type VideoStep,
  type VideoProjectState,
} from "@/lib/studio/video/types";
import {
  generateProjectVoiceover,
  regenerateProjectVoiceover,
} from "@/lib/studio/voiceover/generate";

export const VIDEO_JOB_PREFIX = "video_";

export function videoStepToJobStep(step: VideoStep): string {
  return `${VIDEO_JOB_PREFIX}${step}`;
}

export function isVideoJobStep(step: string): step is `video_${VideoStep}` {
  return step.startsWith(VIDEO_JOB_PREFIX);
}

export function jobStepToVideoStep(step: string): VideoStep | null {
  if (!isVideoJobStep(step)) return null;
  const videoStep = step.slice(VIDEO_JOB_PREFIX.length) as VideoStep;
  return VIDEO_STEPS.includes(videoStep) ? videoStep : null;
}

export async function runVideoStep(
  projectId: string,
  userId: string,
  step: VideoStep,
  options?: { voice?: string; regenerate?: boolean },
): Promise<VideoProjectState> {
  await setVideoProgress(projectId, step, "running");
  await appendProjectLog(projectId, `Running video step: ${step}…`, {
    step: `video_${step}`,
  });

  try {
    switch (step) {
      case "voiceover": {
        if (options?.regenerate) {
          await regenerateProjectVoiceover(projectId, userId, {
            voice: options.voice,
          });
        } else {
          await generateProjectVoiceover(projectId, userId, {
            voice: options?.voice,
          });
        }
        break;
      }
      case "scene_images": {
        await generateAllSceneImages(projectId, userId);
        break;
      }
      case "captions": {
        await generateCaptions(projectId, userId);
        break;
      }
      case "render": {
        await renderProjectVideo(projectId, userId);
        break;
      }
    }

    await setVideoProgress(projectId, step, "completed");
    await appendProjectLog(projectId, `Video step ${step} completed.`, {
      step: `video_${step}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : `Video step ${step} failed.`;
    await setVideoProgress(projectId, step, "failed", {
      video: { [`${step}Error`]: message },
    });
    await appendProjectLog(projectId, message, {
      step: `video_${step}`,
      level: "error",
    });
    throw error;
  }

  return getVideoProjectState(projectId, userId);
}

export async function enqueueVideoPipeline(
  projectId: string,
  userId: string,
): Promise<void> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    select: { id: true, metadata: true },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  await prisma.studioProject.update({
    where: { id: projectId },
    data: {
      metadata: {
        ...(project.metadata &&
        typeof project.metadata === "object" &&
        !Array.isArray(project.metadata)
          ? project.metadata
          : {}),
        videoProgress: {
          voiceover: "pending",
          scene_images: "pending",
          captions: "pending",
          render: "pending",
        },
      } as Prisma.InputJsonValue,
    },
  });

  for (const step of VIDEO_STEPS) {
    await prisma.studioJob.create({
      data: {
        projectId,
        step: videoStepToJobStep(step),
        status: "pending",
      },
    });
  }

  await appendProjectLog(projectId, "Video pipeline queued.", {
    step: "video_pipeline",
  });
}

export async function runFullVideoPipelineInline(
  projectId: string,
  userId: string,
  options?: { voice?: string },
): Promise<VideoProjectState> {
  for (const step of VIDEO_STEPS) {
    await runVideoStep(projectId, userId, step, options);
  }
  return getVideoProjectState(projectId, userId);
}
