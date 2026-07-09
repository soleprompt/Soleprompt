import "server-only";

import { prisma } from "@/lib/db";
import type { StoryboardSceneContent, StoryboardSceneRecord } from "@/lib/studio/storyboard/types";
import type { StudioGeneratedContent } from "@/lib/studio/types";
import { appendProjectLog } from "@/lib/studio/projects/data";

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function isStudioGeneratedContent(value: unknown): value is StudioGeneratedContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.script === "string" && Array.isArray(record.titles);
}

export function serializeStoryboardScene(row: {
  id: string;
  projectId: string;
  orderIndex: number;
  title: string;
  durationSec: number | null;
  narration: string | null;
  onScreenText: string | null;
  visualDescription: string | null;
  cameraMovement: string | null;
  bRollRecommendation: string | null;
  aiImagePrompt: string | null;
  aiVideoPrompt: string | null;
  soundEffects: string | null;
  backgroundMusicMood: string | null;
  transitionType: string | null;
  captionText: string | null;
  createdAt: Date;
  updatedAt: Date;
}): StoryboardSceneRecord {
  return {
    id: row.id,
    projectId: row.projectId,
    orderIndex: row.orderIndex,
    sceneNumber: row.orderIndex + 1,
    title: row.title,
    estimatedDurationSec: row.durationSec ?? 0,
    narration: row.narration ?? "",
    onScreenText: row.onScreenText ?? "",
    visualDescription: row.visualDescription ?? "",
    cameraMovement: row.cameraMovement ?? "",
    bRollRecommendation: row.bRollRecommendation ?? "",
    aiImagePrompt: row.aiImagePrompt ?? "",
    aiVideoPrompt: row.aiVideoPrompt ?? "",
    soundEffects: row.soundEffects ?? "",
    backgroundMusicMood: row.backgroundMusicMood ?? "",
    transitionType: row.transitionType ?? "",
    captionText: row.captionText ?? "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function loadScriptForProject(
  projectId: string,
  userId: string,
): Promise<StudioGeneratedContent | null> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    select: {
      metadata: true,
      packageId: true,
    },
  });

  if (!project) {
    return null;
  }

  const metadata = toRecord(project.metadata);
  const scriptFromMetadata = metadata?.script;
  if (isStudioGeneratedContent(scriptFromMetadata)) {
    return scriptFromMetadata;
  }

  if (project.packageId) {
    const pkg = await prisma.youTubePackage.findFirst({
      where: { id: project.packageId, userId },
    });

    if (pkg) {
      return {
        titles: Array.isArray(pkg.titles)
          ? (pkg.titles as string[])
          : [],
        script: pkg.script,
        hook: pkg.hook,
        intro: pkg.intro,
        mainSections: Array.isArray(pkg.mainSections)
          ? (pkg.mainSections as StudioGeneratedContent["mainSections"])
          : [],
        outro: pkg.outro,
        callToAction: pkg.callToAction,
        description: pkg.description,
        tags: Array.isArray(pkg.tags) ? (pkg.tags as string[]) : [],
        thumbnailIdeas: Array.isArray(pkg.thumbnailIdeas)
          ? (pkg.thumbnailIdeas as string[])
          : [],
        pinnedComment: pkg.pinnedComment,
      };
    }
  }

  return null;
}

export async function setProjectStoryboardStatus(
  projectId: string,
  status: "writing" | "storyboarding" | "storyboard_complete",
) {
  await prisma.studioProject.update({
    where: { id: projectId },
    data: { status },
  });
}

export async function persistStoryboardScenes(
  projectId: string,
  scenes: StoryboardSceneContent[],
) {
  await prisma.$transaction(async (tx) => {
    await tx.studioScene.deleteMany({ where: { projectId } });

    for (const scene of scenes) {
      await tx.studioScene.create({
        data: {
          projectId,
          orderIndex: scene.sceneNumber - 1,
          title: scene.title,
          description: scene.visualDescription,
          script: scene.narration,
          durationSec: scene.estimatedDurationSec,
          visualNotes: scene.cameraMovement,
          narration: scene.narration,
          onScreenText: scene.onScreenText,
          visualDescription: scene.visualDescription,
          cameraMovement: scene.cameraMovement,
          bRollRecommendation: scene.bRollRecommendation,
          aiImagePrompt: scene.aiImagePrompt,
          aiVideoPrompt: scene.aiVideoPrompt,
          soundEffects: scene.soundEffects,
          backgroundMusicMood: scene.backgroundMusicMood,
          transitionType: scene.transitionType,
          captionText: scene.captionText,
        },
      });
    }
  });
}

export async function listStoryboardScenesForProject(
  projectId: string,
  userId: string,
): Promise<StoryboardSceneRecord[]> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });

  if (!project) {
    return [];
  }

  const scenes = await prisma.studioScene.findMany({
    where: { projectId },
    orderBy: { orderIndex: "asc" },
  });

  return scenes.map(serializeStoryboardScene);
}

export async function updateStoryboardScene(
  sceneId: string,
  userId: string,
  updates: Partial<{
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
  }>,
): Promise<StoryboardSceneRecord | null> {
  const scene = await prisma.studioScene.findFirst({
    where: {
      id: sceneId,
      project: { userId },
    },
  });

  if (!scene) {
    return null;
  }

  const updated = await prisma.studioScene.update({
    where: { id: sceneId },
    data: {
      title: updates.title,
      durationSec: updates.estimatedDurationSec,
      narration: updates.narration,
      onScreenText: updates.onScreenText,
      visualDescription: updates.visualDescription,
      description: updates.visualDescription,
      script: updates.narration,
      cameraMovement: updates.cameraMovement,
      visualNotes: updates.cameraMovement,
      bRollRecommendation: updates.bRollRecommendation,
      aiImagePrompt: updates.aiImagePrompt,
      aiVideoPrompt: updates.aiVideoPrompt,
      soundEffects: updates.soundEffects,
      backgroundMusicMood: updates.backgroundMusicMood,
      transitionType: updates.transitionType,
      captionText: updates.captionText,
    },
  });

  return serializeStoryboardScene(updated);
}

export async function logStoryboardEvent(
  projectId: string,
  message: string,
  level: "info" | "error" = "info",
) {
  await appendProjectLog(projectId, message, {
    step: "storyboard_engine",
    level,
  });
}
