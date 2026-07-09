import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { appendProjectLog } from "@/lib/studio/projects/data";
import {
  ensureProjectDir,
  sceneImageApiPath,
  writeProjectFile,
  getSceneImagePath,
} from "@/lib/studio/video/storage";
import type { SceneImageAsset } from "@/lib/studio/video/types";

const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";
const DEFAULT_IMAGE_MODEL = "dall-e-3";

async function generateOpenAiImage(prompt: string): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch(OPENAI_IMAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL,
      prompt: prompt.slice(0, 1000),
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    let message = `OpenAI image generation failed (${response.status}).`;
    try {
      const payload = (await response.json()) as { error?: { message?: string } };
      if (payload.error?.message) message = payload.error.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as {
    data?: Array<{ b64_json?: string }>;
  };
  const b64 = payload.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI returned no image data.");
  }
  return Buffer.from(b64, "base64");
}

async function generatePlaceholderImage(
  prompt: string,
  sceneNumber: number,
): Promise<Buffer> {
  const hue = (sceneNumber * 47) % 360;
  const label = encodeURIComponent(
    `Scene ${sceneNumber}: ${prompt.slice(0, 40)}`,
  );
  const url = `https://placehold.co/1024x1024/${hue.toString(16).padStart(2, "0")}3366/ffffff/png?text=${label}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Placeholder image fetch failed (${response.status}).`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function generateSceneImage(
  projectId: string,
  userId: string,
  sceneId: string,
): Promise<SceneImageAsset> {
  const scene = await prisma.studioScene.findFirst({
    where: { id: sceneId, projectId, project: { userId } },
  });

  if (!scene) {
    throw new Error("Scene not found.");
  }

  const prompt =
    scene.aiImagePrompt?.trim() ||
    scene.visualDescription?.trim() ||
    scene.title;

  let imageBuffer: Buffer;
  let provider: string;

  if (process.env.OPENAI_API_KEY?.trim()) {
    try {
      imageBuffer = await generateOpenAiImage(prompt);
      provider = "openai";
    } catch {
      imageBuffer = await generatePlaceholderImage(prompt, scene.orderIndex + 1);
      provider = "placeholder";
    }
  } else {
    imageBuffer = await generatePlaceholderImage(prompt, scene.orderIndex + 1);
    provider = "placeholder";
  }

  await ensureProjectDir(projectId);
  const filePath = getSceneImagePath(projectId, sceneId);
  await writeProjectFile(filePath, imageBuffer);

  const imageUrl = sceneImageApiPath(projectId, sceneId);

  const existing = await prisma.studioAsset.findFirst({
    where: { projectId, sceneId, type: "image" },
  });

  if (existing) {
    await prisma.studioAsset.update({
      where: { id: existing.id },
      data: {
        url: imageUrl,
        provider,
        name: `Scene ${scene.orderIndex + 1}`,
        metadata: { prompt, filePath } satisfies Prisma.InputJsonValue,
      },
    });
  } else {
    await prisma.studioAsset.create({
      data: {
        projectId,
        sceneId,
        type: "image",
        name: `Scene ${scene.orderIndex + 1}`,
        url: imageUrl,
        provider,
        metadata: { prompt, filePath } satisfies Prisma.InputJsonValue,
      },
    });
  }

  return {
    sceneId: scene.id,
    sceneNumber: scene.orderIndex + 1,
    title: scene.title,
    imageUrl,
    provider,
    status: "completed",
  };
}

export async function generateAllSceneImages(
  projectId: string,
  userId: string,
): Promise<SceneImageAsset[]> {
  const scenes = await prisma.studioScene.findMany({
    where: { projectId, project: { userId } },
    orderBy: { orderIndex: "asc" },
  });

  if (scenes.length === 0) {
    throw new Error("Storyboard scenes required before generating images.");
  }

  await appendProjectLog(projectId, "Generating scene images…", {
    step: "video_scene_images",
  });

  const results: SceneImageAsset[] = [];
  for (const scene of scenes) {
    const asset = await generateSceneImage(projectId, userId, scene.id);
    results.push(asset);
  }

  await appendProjectLog(projectId, "Scene images generated.", {
    step: "video_scene_images",
  });

  return results;
}

export async function listSceneImages(
  projectId: string,
  userId: string,
): Promise<SceneImageAsset[]> {
  const scenes = await prisma.studioScene.findMany({
    where: { projectId, project: { userId } },
    orderBy: { orderIndex: "asc" },
    include: {
      assets: {
        where: { type: "image" },
        take: 1,
      },
    },
  });

  return scenes.map((scene) => {
    const asset = scene.assets[0];
    return {
      sceneId: scene.id,
      sceneNumber: scene.orderIndex + 1,
      title: scene.title,
      imageUrl: asset?.url ?? null,
      provider: asset?.provider ?? null,
      status: asset?.url ? "completed" : "pending",
    };
  });
}
