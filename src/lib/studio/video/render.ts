import "server-only";

import { access } from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { appendProjectLog } from "@/lib/studio/projects/data";
import { loadCaptionWords } from "@/lib/studio/video/captions";
import {
  REMOTION_COMPOSITION_ID,
  REMOTION_FPS,
  getVideoDimensions,
  type RemotionSceneInput,
} from "@/lib/studio/video/remotion/types";
import {
  ensureProjectDir,
  getSceneImagePath,
  getProjectDir,
  getVideoPath,
  videoDownloadApiPath,
  writeProjectFile,
} from "@/lib/studio/video/storage";
import { readVoiceoverAudio as readNarration } from "@/lib/studio/voiceover/storage";
import type { VideoRenderState } from "@/lib/studio/video/types";

const MUSIC_TRACKS = [
  "ambient-calm.mp3",
  "upbeat-focus.mp3",
  "cinematic-soft.mp3",
] as const;

async function pickBackgroundMusic(): Promise<string | null> {
  const track = MUSIC_TRACKS[0];
  const musicPath = path.join(process.cwd(), "public", "studio", "music", track);
  try {
    await access(musicPath);
    return musicPath;
  } catch {
    return null;
  }
}

async function patchRenderProgress(
  projectId: string,
  patch: Record<string, unknown>,
) {
  const project = await prisma.studioProject.findUnique({
    where: { id: projectId },
    select: { metadata: true },
  });
  const metadata =
    project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
      ? (project.metadata as Record<string, unknown>)
      : {};
  const video = {
  ...((metadata.video as Record<string, unknown>) ?? {}),
    ...patch,
  };

  await prisma.studioProject.update({
    where: { id: projectId },
    data: {
      metadata: { ...metadata, video } as Prisma.InputJsonValue,
    },
  });
}

export async function renderProjectVideo(
  projectId: string,
  userId: string,
): Promise<VideoRenderState> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    select: { videoType: true },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const scenes = await prisma.studioScene.findMany({
    where: { projectId },
    orderBy: { orderIndex: "asc" },
    include: {
      assets: { where: { type: "image" }, take: 1 },
    },
  });

  if (scenes.length === 0) {
    throw new Error("Scenes required before rendering video.");
  }

  const narrationBuffer = await readNarration(projectId);
  if (!narrationBuffer) {
    throw new Error("Voiceover required before rendering video.");
  }

  await appendProjectLog(projectId, "Rendering video…", { step: "video_render" });
  await patchRenderProgress(projectId, { renderProgress: 5, renderStatus: "running" });

  const allWords = await loadCaptionWords(projectId, userId);
  const totalDurationSec =
    (await prisma.studioVoiceover.findFirst({
      where: { projectId, sceneId: null },
      select: { durationSec: true },
    }))?.durationSec ?? 60;

  const sceneDurationSec = totalDurationSec / scenes.length;
  let wordOffset = 0;
  const wordsPerScene = Math.ceil(allWords.length / scenes.length);

  const remotionScenes: RemotionSceneInput[] = scenes.map((scene, index) => {
    const sceneWords = allWords.slice(wordOffset, wordOffset + wordsPerScene);
    wordOffset += wordsPerScene;

    const imagePath = getSceneImagePath(projectId, scene.id);
    const directions: RemotionSceneInput["kenBurnsDirection"][] = [
      "in",
      "out",
      "pan-left",
      "pan-right",
    ];

    return {
      imagePath,
      durationSec: scene.durationSec ?? sceneDurationSec,
      captionWords: sceneWords,
      kenBurnsDirection: directions[index % directions.length],
    };
  });

  await ensureProjectDir(projectId);
  const narrationPath = path.join(getProjectDir(projectId), "narration-render.mp3");
  await writeProjectFile(narrationPath, narrationBuffer);

  const { width, height } = getVideoDimensions(project.videoType);
  const outputPath = getVideoPath(projectId);
  const backgroundMusicPath = await pickBackgroundMusic();

  const entryPoint = path.join(
    process.cwd(),
    "src/lib/studio/video/remotion/index.ts",
  );

  await patchRenderProgress(projectId, { renderProgress: 15 });

  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => {
      config.resolve = config.resolve ?? {};
      config.resolve.alias = {
        ...((config.resolve.alias as Record<string, string>) ?? {}),
        "@": path.join(process.cwd(), "src"),
      };
      return config;
    },
  });

  await patchRenderProgress(projectId, { renderProgress: 30 });

  const inputProps = {
    scenes: remotionScenes,
    narrationAudioPath: narrationPath,
    backgroundMusicPath,
    width,
    height,
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: REMOTION_COMPOSITION_ID,
    inputProps,
  });

  composition.width = width;
  composition.height = height;

  await patchRenderProgress(projectId, { renderProgress: 45 });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      const pct = 45 + Math.round(progress * 50);
      void patchRenderProgress(projectId, { renderProgress: pct });
    },
  });

  const videoUrl = videoDownloadApiPath(projectId);
  const durationSec = Math.round(
    remotionScenes.reduce((sum, s) => sum + s.durationSec, 0),
  );

  const existing = await prisma.studioVideo.findFirst({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
  });

  const video = existing
    ? await prisma.studioVideo.update({
        where: { id: existing.id },
        data: {
          status: "completed",
          url: videoUrl,
          durationSec,
          provider: "remotion",
          metadata: {
            width,
            height,
            fps: REMOTION_FPS,
            outputPath,
          } satisfies Prisma.InputJsonValue,
        },
      })
    : await prisma.studioVideo.create({
        data: {
          projectId,
          status: "completed",
          url: videoUrl,
          durationSec,
          provider: "remotion",
          metadata: {
            width,
            height,
            fps: REMOTION_FPS,
            outputPath,
          } satisfies Prisma.InputJsonValue,
        },
      });

  await patchRenderProgress(projectId, {
    renderProgress: 100,
    renderStatus: "completed",
  });

  await appendProjectLog(projectId, "Video render complete.", {
    step: "video_render",
  });

  return {
    id: video.id,
    status: "completed",
    videoUrl,
    durationSec,
    provider: "remotion",
    error: null,
    progress: 100,
  };
}
