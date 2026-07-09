import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { appendProjectLog } from "@/lib/studio/projects/data";
import { resolveProjectNarrationText } from "@/lib/studio/voiceover/narration";
import {
  deleteVoiceoverAudio,
  saveVoiceoverAudio,
  voiceoverAudioApiPath,
} from "@/lib/studio/voiceover/storage";
import { synthesizeSpeech } from "@/lib/studio/voiceover/tts";
import type { MvpVoiceoverState } from "@/lib/studio/voiceover/types";

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function estimateDurationSec(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round((words / 150) * 60));
}

function parseVoiceoverMetadata(metadata: unknown): {
  status?: MvpVoiceoverState["status"];
  error?: string;
} {
  const record = toRecord(metadata);
  const voiceover = toRecord(record?.voiceover);
  const status = voiceover?.status;
  const error = voiceover?.error;
  return {
    status:
      status === "pending" ||
      status === "generating" ||
      status === "completed" ||
      status === "failed"
        ? status
        : undefined,
    error: typeof error === "string" ? error : undefined,
  };
}

async function patchVoiceoverMetadata(
  projectId: string,
  patch: Record<string, unknown>,
) {
  const project = await prisma.studioProject.findUnique({
    where: { id: projectId },
    select: { metadata: true },
  });
  const metadata = toRecord(project?.metadata) ?? {};
  const voiceover = { ...(toRecord(metadata.voiceover) ?? {}), ...patch };

  await prisma.studioProject.update({
    where: { id: projectId },
    data: {
      metadata: {
        ...metadata,
        voiceover,
      } as Prisma.InputJsonValue,
      ...(patch.status === "generating" ? { status: "creating_voice" as const } : {}),
    },
  });
}

export async function getProjectVoiceoverState(
  projectId: string,
  userId: string,
): Promise<MvpVoiceoverState> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    select: { metadata: true },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const metaVoiceover = parseVoiceoverMetadata(project.metadata);

  const voiceover = await prisma.studioVoiceover.findFirst({
    where: { projectId, sceneId: null },
    orderBy: { updatedAt: "desc" },
  });

  if (voiceover?.audioUrl) {
    return {
      id: voiceover.id,
      status: "completed",
      audioUrl: voiceover.audioUrl,
      provider: voiceover.provider,
      voiceId: voiceover.voiceId,
      durationSec: voiceover.durationSec,
      textPreview: voiceover.text.slice(0, 160) || null,
      error: null,
      updatedAt: voiceover.updatedAt.toISOString(),
    };
  }

  if (metaVoiceover.status === "generating") {
    return {
      id: voiceover?.id ?? null,
      status: "generating",
      audioUrl: null,
      provider: voiceover?.provider ?? null,
      voiceId: voiceover?.voiceId ?? null,
      durationSec: null,
      textPreview: voiceover?.text?.slice(0, 160) ?? null,
      error: null,
      updatedAt: voiceover?.updatedAt.toISOString() ?? null,
    };
  }

  if (metaVoiceover.status === "failed") {
    return {
      id: voiceover?.id ?? null,
      status: "failed",
      audioUrl: null,
      provider: voiceover?.provider ?? null,
      voiceId: voiceover?.voiceId ?? null,
      durationSec: null,
      textPreview: voiceover?.text?.slice(0, 160) ?? null,
      error: metaVoiceover.error ?? "Voiceover generation failed.",
      updatedAt: voiceover?.updatedAt.toISOString() ?? null,
    };
  }

  return {
    id: voiceover?.id ?? null,
    status: "pending",
    audioUrl: null,
    provider: voiceover?.provider ?? null,
    voiceId: voiceover?.voiceId ?? null,
    durationSec: null,
    textPreview: voiceover?.text?.slice(0, 160) ?? null,
    error: null,
    updatedAt: voiceover?.updatedAt.toISOString() ?? null,
  };
}

export async function generateProjectVoiceover(
  projectId: string,
  userId: string,
  options?: { voice?: string },
): Promise<MvpVoiceoverState> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const narrationText = await resolveProjectNarrationText(projectId, userId);

  await patchVoiceoverMetadata(projectId, { status: "generating", error: null });
  await appendProjectLog(projectId, "Generating voiceover…", {
    step: "voiceover",
  });

  try {
    const tts = await synthesizeSpeech(narrationText, { voice: options?.voice });
    await saveVoiceoverAudio(projectId, tts.audio);

    const audioUrl = voiceoverAudioApiPath(projectId);
    const durationSec = estimateDurationSec(narrationText);

    const existing = await prisma.studioVoiceover.findFirst({
      where: { projectId, sceneId: null },
    });

    const voiceover = existing
      ? await prisma.studioVoiceover.update({
          where: { id: existing.id },
          data: {
            text: narrationText,
            audioUrl,
            provider: tts.provider,
            voiceId: tts.voiceId,
            durationSec,
            metadata: {
              model: tts.model ?? null,
              charCount: narrationText.length,
            } satisfies Prisma.InputJsonValue,
          },
        })
      : await prisma.studioVoiceover.create({
          data: {
            projectId,
            sceneId: null,
            text: narrationText,
            audioUrl,
            provider: tts.provider,
            voiceId: tts.voiceId,
            durationSec,
            metadata: {
              model: tts.model ?? null,
              charCount: narrationText.length,
            } satisfies Prisma.InputJsonValue,
          },
        });

    await patchVoiceoverMetadata(projectId, { status: "completed", error: null });
    await appendProjectLog(projectId, "Voiceover generated.", { step: "voiceover" });

    return {
      id: voiceover.id,
      status: "completed",
      audioUrl,
      provider: voiceover.provider,
      voiceId: voiceover.voiceId,
      durationSec: voiceover.durationSec,
      textPreview: narrationText.slice(0, 160),
      error: null,
      updatedAt: voiceover.updatedAt.toISOString(),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Voiceover generation failed.";

    await patchVoiceoverMetadata(projectId, { status: "failed", error: message });
    await appendProjectLog(projectId, message, {
      step: "voiceover",
      level: "error",
    });

    throw error;
  }
}

export async function regenerateProjectVoiceover(
  projectId: string,
  userId: string,
  options?: { voice?: string },
): Promise<MvpVoiceoverState> {
  await deleteVoiceoverAudio(projectId);
  return generateProjectVoiceover(projectId, userId, options);
}
