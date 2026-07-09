import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { saveYouTubePackage } from "@/lib/studio/data";
import {
  estimateCompletionFromStep,
  getNextStepId,
  getStepDefinition,
  PIPELINE_STEPS,
  type PipelineStepId,
} from "@/lib/studio/pipeline/types";
import type {
  CreateStudioProjectInput,
  StudioProjectDetail,
  StudioProjectLogRecord,
  StudioProjectStatusPayload,
  StudioProjectSummary,
} from "@/lib/studio/projects/types";
import type { StudioGeneratedContent } from "@/lib/studio/types";
import { serializeStudioResearch } from "@/lib/studio/research/data";

const JOB_LOCK_TTL_MS = 5 * 60 * 1000;

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function serializeLog(log: {
  id: string;
  level: string;
  step: string | null;
  message: string;
  metadata: unknown;
  createdAt: Date;
}): StudioProjectLogRecord {
  return {
    id: log.id,
    level: log.level as StudioProjectLogRecord["level"],
    step: log.step,
    message: log.message,
    metadata: toRecord(log.metadata),
    createdAt: log.createdAt.toISOString(),
  };
}

function serializeProject(project: {
  id: string;
  topic: string;
  niche: string | null;
  videoType: string;
  tone: string | null;
  status: string;
  currentStep: string | null;
  progressPercent: number;
  estimatedCompletionAt: Date | null;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  packageId: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}): StudioProjectSummary {
  return {
    id: project.id,
    topic: project.topic,
    niche: project.niche,
    videoType: project.videoType,
    tone: project.tone,
    status: project.status as StudioProjectSummary["status"],
    currentStep: project.currentStep,
    progressPercent: project.progressPercent,
    estimatedCompletionAt: project.estimatedCompletionAt?.toISOString() ?? null,
    error: project.error,
    startedAt: project.startedAt?.toISOString() ?? null,
    completedAt: project.completedAt?.toISOString() ?? null,
    packageId: project.packageId,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export async function createStudioProject(
  userId: string,
  input: CreateStudioProjectInput,
): Promise<StudioProjectSummary> {
  const firstStep = PIPELINE_STEPS[0];
  if (!firstStep) {
    throw new Error("Pipeline is not configured.");
  }

  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.studioProject.create({
      data: {
        userId,
        topic: input.topic,
        niche: input.niche ?? null,
        videoType: input.videoType,
        tone: input.tone ?? null,
        status: "queued",
        currentStep: firstStep.id,
        progressPercent: 0,
        estimatedCompletionAt: estimateCompletionFromStep(firstStep.id),
        metadata: {
          input,
        } satisfies Prisma.InputJsonValue,
      },
    });

    await tx.studioProjectLog.create({
      data: {
        projectId: created.id,
        level: "info",
        message: "Project created and queued for production.",
      },
    });

    await tx.studioJob.create({
      data: {
        projectId: created.id,
        step: firstStep.id,
        status: "pending",
        payload: { input } satisfies Prisma.InputJsonValue,
      },
    });

    return created;
  });

  return serializeProject(project);
}

export async function listStudioProjectsForUser(
  userId: string,
  limit = 20,
): Promise<StudioProjectSummary[]> {
  const projects = await prisma.studioProject.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return projects.map(serializeProject);
}

export async function getStudioProjectForUser(
  projectId: string,
  userId: string,
): Promise<StudioProjectDetail | null> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    include: {
      research: true,
      logs: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: {
        select: {
          scenes: true,
          assets: true,
          voiceovers: true,
          videos: true,
          thumbnails: true,
          uploads: true,
          analytics: true,
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  return {
    ...serializeProject(project),
    metadata: toRecord(project.metadata),
    logs: project.logs.map(serializeLog),
    research: project.research
      ? serializeStudioResearch(project.research)
      : null,
    sceneCount: project._count.scenes,
    assetCount: project._count.assets,
    voiceoverCount: project._count.voiceovers,
    videoCount: project._count.videos,
    thumbnailCount: project._count.thumbnails,
    uploadCount: project._count.uploads,
    analyticsCount: project._count.analytics,
  };
}

export async function getStudioProjectStatusForUser(
  projectId: string,
  userId: string,
): Promise<StudioProjectStatusPayload | null> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    include: {
      research: true,
      logs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: {
        select: { scenes: true },
      },
    },
  });

  if (!project) {
    return null;
  }

  return {
    id: project.id,
    status: project.status,
    currentStep: project.currentStep,
    progressPercent: project.progressPercent,
    estimatedCompletionAt: project.estimatedCompletionAt?.toISOString() ?? null,
    error: project.error,
    completedAt: project.completedAt?.toISOString() ?? null,
    logs: project.logs.map(serializeLog),
    research: project.research
      ? serializeStudioResearch(project.research)
      : null,
    sceneCount: project._count.scenes,
  };
}

export async function appendProjectLog(
  projectId: string,
  message: string,
  options?: {
    level?: "info" | "warn" | "error" | "debug";
    step?: string;
    metadata?: Record<string, unknown>;
  },
) {
  await prisma.studioProjectLog.create({
    data: {
      projectId,
      level: options?.level ?? "info",
      step: options?.step,
      message,
      metadata: options?.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function claimNextStudioJob(workerId: string) {
  const staleLockBefore = new Date(Date.now() - JOB_LOCK_TTL_MS);

  const candidate = await prisma.studioJob.findFirst({
    where: {
      OR: [
        { status: "pending" },
        {
          status: "processing",
          lockedAt: { lt: staleLockBefore },
        },
      ],
      project: {
        status: {
          notIn: ["completed", "failed", "cancelled"],
        },
      },
    },
    orderBy: [{ priority: "desc" }, { scheduledAt: "asc" }],
  });

  if (!candidate) {
    return null;
  }

  const job = await prisma.studioJob.updateMany({
    where: {
      id: candidate.id,
      OR: [
        { status: "pending" },
        {
          status: "processing",
          lockedAt: { lt: staleLockBefore },
        },
      ],
    },
    data: {
      status: "processing",
      lockedAt: new Date(),
      lockedBy: workerId,
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  if (job.count === 0) {
    return null;
  }

  return prisma.studioJob.findUnique({
    where: { id: candidate.id },
    include: { project: true },
  });
}

export async function markStudioJobCompleted(
  jobId: string,
  result: Record<string, unknown>,
) {
  await prisma.studioJob.update({
    where: { id: jobId },
    data: {
      status: "completed",
      result: result as Prisma.InputJsonValue,
      completedAt: new Date(),
      lockedAt: null,
      lockedBy: null,
      error: null,
    },
  });
}

export async function markStudioJobFailed(jobId: string, error: string) {
  await prisma.studioJob.update({
    where: { id: jobId },
    data: {
      status: "failed",
      error,
      completedAt: new Date(),
      lockedAt: null,
      lockedBy: null,
    },
  });
}

export async function enqueueStudioJob(projectId: string, stepId: PipelineStepId) {
  await prisma.studioJob.create({
    data: {
      projectId,
      step: stepId,
      status: "pending",
    },
  });
}

export async function updateProjectProgress(
  projectId: string,
  stepId: PipelineStepId,
  metadataPatch?: Record<string, unknown>,
) {
  const step = getStepDefinition(stepId);
  const nextStepId = getNextStepId(stepId);
  const isFinalStep = !nextStepId;

  const existing = await prisma.studioProject.findUnique({
    where: { id: projectId },
    select: { metadata: true, startedAt: true },
  });

  const mergedMetadata = {
    ...(toRecord(existing?.metadata) ?? {}),
    ...(metadataPatch ?? {}),
  };

  await prisma.studioProject.update({
    where: { id: projectId },
    data: {
      status: isFinalStep ? "completed" : step.projectStatus,
      currentStep: isFinalStep ? stepId : nextStepId,
      progressPercent: step.progressPercent,
      estimatedCompletionAt: isFinalStep
        ? null
        : estimateCompletionFromStep(nextStepId),
      completedAt: isFinalStep ? new Date() : null,
      metadata: mergedMetadata as Prisma.InputJsonValue,
      startedAt: existing?.startedAt ?? new Date(),
    },
  });
}

export async function markProjectStarted(projectId: string) {
  await prisma.studioProject.update({
    where: { id: projectId },
    data: {
      startedAt: new Date(),
      status: "researching",
    },
  });
}

export async function markProjectFailed(projectId: string, error: string) {
  await prisma.studioProject.update({
    where: { id: projectId },
    data: {
      status: "failed",
      error,
    },
  });

  await appendProjectLog(projectId, error, { level: "error" });
}

export async function persistStepArtifacts(
  projectId: string,
  stepId: PipelineStepId,
  output: Record<string, unknown>,
) {
  switch (stepId) {
    case "scene_generator": {
      const scenes = Array.isArray(output.scenes) ? output.scenes : [];
      await prisma.studioScene.deleteMany({ where: { projectId } });
      for (const scene of scenes) {
        if (!scene || typeof scene !== "object") continue;
        const record = scene as Record<string, unknown>;
        await prisma.studioScene.create({
          data: {
            projectId,
            orderIndex:
              typeof record.orderIndex === "number" ? record.orderIndex : 0,
            title: typeof record.title === "string" ? record.title : "Scene",
            description:
              typeof record.description === "string" ? record.description : "",
            script: typeof record.script === "string" ? record.script : null,
            durationSec:
              typeof record.durationSec === "number"
                ? record.durationSec
                : null,
            visualNotes:
              typeof record.visualNotes === "string"
                ? record.visualNotes
                : null,
          },
        });
      }
      break;
    }
    case "asset_generator": {
      const assets = Array.isArray(output.assets) ? output.assets : [];
      const scenes = await prisma.studioScene.findMany({
        where: { projectId },
        select: { id: true, orderIndex: true },
      });
      const sceneByOrder = new Map(scenes.map((scene) => [scene.orderIndex, scene.id]));

      for (const asset of assets) {
        if (!asset || typeof asset !== "object") continue;
        const record = asset as Record<string, unknown>;
        const orderIndex =
          typeof record.sceneOrderIndex === "number" ? record.sceneOrderIndex : 0;

        await prisma.studioAsset.create({
          data: {
            projectId,
            sceneId: sceneByOrder.get(orderIndex),
            type:
              record.type === "b_roll"
                ? "b_roll"
                : record.type === "graphic"
                  ? "graphic"
                  : "image",
            name: typeof record.name === "string" ? record.name : "Asset",
            url:
              typeof record.placeholderUrl === "string"
                ? record.placeholderUrl
                : null,
            provider:
              typeof record.provider === "string" ? record.provider : null,
          },
        });
      }
      break;
    }
    case "voiceover_generator": {
      const voiceovers = Array.isArray(output.voiceovers) ? output.voiceovers : [];
      const scenes = await prisma.studioScene.findMany({
        where: { projectId },
        select: { id: true, orderIndex: true },
      });
      const sceneByOrder = new Map(scenes.map((scene) => [scene.orderIndex, scene.id]));

      for (const voiceover of voiceovers) {
        if (!voiceover || typeof voiceover !== "object") continue;
        const record = voiceover as Record<string, unknown>;
        const orderIndex =
          typeof record.sceneOrderIndex === "number" ? record.sceneOrderIndex : 0;

        await prisma.studioVoiceover.create({
          data: {
            projectId,
            sceneId: sceneByOrder.get(orderIndex),
            text: typeof record.text === "string" ? record.text : "",
            audioUrl:
              typeof record.placeholderAudioUrl === "string"
                ? record.placeholderAudioUrl
                : null,
            provider:
              typeof record.provider === "string" ? record.provider : null,
            voiceId: typeof record.voiceId === "string" ? record.voiceId : null,
            durationSec:
              typeof record.durationSec === "number"
                ? record.durationSec
                : null,
          },
        });
      }
      break;
    }
    case "thumbnail_generator": {
      const thumbnails = Array.isArray(output.thumbnails)
        ? output.thumbnails
        : [];
      await prisma.studioThumbnail.deleteMany({ where: { projectId } });
      for (const thumbnail of thumbnails) {
        if (!thumbnail || typeof thumbnail !== "object") continue;
        const record = thumbnail as Record<string, unknown>;
        await prisma.studioThumbnail.create({
          data: {
            projectId,
            title: typeof record.title === "string" ? record.title : "Thumbnail",
            imageUrl:
              typeof record.placeholderUrl === "string"
                ? record.placeholderUrl
                : null,
            provider:
              typeof record.provider === "string" ? record.provider : null,
            isPrimary: record.isPrimary === true,
          },
        });
      }
      break;
    }
    case "video_composer": {
      const video = output.video;
      if (!video || typeof video !== "object") break;
      const record = video as Record<string, unknown>;
      await prisma.studioVideo.create({
        data: {
          projectId,
          status: typeof record.status === "string" ? record.status : "rendered",
          url:
            typeof record.placeholderUrl === "string"
              ? record.placeholderUrl
              : null,
          durationSec:
            typeof record.durationSec === "number" ? record.durationSec : null,
          provider:
            typeof record.provider === "string" ? record.provider : null,
        },
      });
      break;
    }
    case "publisher": {
      const upload = output.upload;
      if (!upload || typeof upload !== "object") break;
      const record = upload as Record<string, unknown>;
      await prisma.studioUpload.create({
        data: {
          projectId,
          platform:
            typeof record.platform === "string" ? record.platform : "youtube",
          status: "completed",
          externalUrl:
            typeof record.externalUrl === "string" ? record.externalUrl : null,
          uploadedAt: new Date(),
          metadata: record as Prisma.InputJsonValue,
        },
      });
      break;
    }
    case "analytics": {
      const analytics = output.analytics;
      if (!analytics || typeof analytics !== "object") break;
      const record = analytics as Record<string, unknown>;
      await prisma.studioAnalytics.create({
        data: {
          projectId,
          views: typeof record.views === "number" ? record.views : 0,
          likes: typeof record.likes === "number" ? record.likes : 0,
          comments: typeof record.comments === "number" ? record.comments : 0,
          watchTimeSec:
            typeof record.watchTimeSec === "number" ? record.watchTimeSec : 0,
          ctr: typeof record.ctr === "number" ? record.ctr : null,
        },
      });
      break;
    }
    default:
      break;
  }
}

export async function finalizeProjectPackage(
  projectId: string,
  userId: string,
  metadata: Record<string, unknown>,
) {
  const script = metadata.script;
  if (!script || typeof script !== "object" || Array.isArray(script)) {
    return null;
  }

  const project = await prisma.studioProject.findUnique({
    where: { id: projectId },
    select: {
      topic: true,
      niche: true,
      videoType: true,
      tone: true,
      packageId: true,
    },
  });

  if (!project || project.packageId) {
    return project?.packageId ?? null;
  }

  const content = script as StudioGeneratedContent;
  const saved = await saveYouTubePackage(
    userId,
    {
      topic: project.topic,
      niche: project.niche ?? undefined,
      videoType: project.videoType,
      tone: project.tone ?? undefined,
    },
    content,
  );

  await prisma.studioProject.update({
    where: { id: projectId },
    data: { packageId: saved.id },
  });

  return saved.id;
}
