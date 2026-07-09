import "server-only";

import { prisma } from "@/lib/db";
import { appendProjectLog } from "@/lib/studio/projects/data";
import { resolveProjectNarrationText } from "@/lib/studio/voiceover/narration";
import {
  ensureProjectDir,
  getSrtPath,
  srtDownloadApiPath,
  writeProjectFile,
} from "@/lib/studio/video/storage";
import type { CaptionState } from "@/lib/studio/video/types";

export type CaptionWord = {
  text: string;
  startSec: number;
  endSec: number;
};

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

export function buildCaptionWords(
  text: string,
  totalDurationSec: number,
): CaptionWord[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const durationPerWord = totalDurationSec / words.length;
  return words.map((word, index) => ({
    text: word,
    startSec: index * durationPerWord,
    endSec: (index + 1) * durationPerWord,
  }));
}

function buildSrtContent(words: CaptionWord[]): string {
  const chunks: string[] = [];
  const wordsPerCue = 6;

  for (let i = 0; i < words.length; i += wordsPerCue) {
    const cueWords = words.slice(i, i + wordsPerCue);
    const startSec = cueWords[0]?.startSec ?? 0;
    const endSec = cueWords[cueWords.length - 1]?.endSec ?? startSec + 2;
    const index = Math.floor(i / wordsPerCue) + 1;

    chunks.push(
      String(index),
      `${formatSrtTime(startSec)} --> ${formatSrtTime(endSec)}`,
      cueWords.map((w) => w.text).join(" "),
      "",
    );
  }

  return chunks.join("\n");
}

export async function generateCaptions(
  projectId: string,
  userId: string,
): Promise<CaptionState> {
  const narrationText = await resolveProjectNarrationText(projectId, userId);

  const voiceover = await prisma.studioVoiceover.findFirst({
    where: { projectId, sceneId: null },
  });

  const wordCount = narrationText.trim().split(/\s+/).filter(Boolean).length;
  const durationSec =
    voiceover?.durationSec ??
    Math.max(10, Math.round((wordCount / 150) * 60));

  const words = buildCaptionWords(narrationText, durationSec);
  const srtContent = buildSrtContent(words);

  await ensureProjectDir(projectId);
  await writeProjectFile(getSrtPath(projectId), srtContent);

  await appendProjectLog(projectId, "Captions generated.", {
    step: "video_captions",
  });

  return {
    status: "completed",
    srtUrl: srtDownloadApiPath(projectId),
    wordCount,
    error: null,
  };
}

export async function getCaptionState(
  projectId: string,
): Promise<CaptionState> {
  const exists = await import("@/lib/studio/video/storage").then((m) =>
    m.fileExists(m.getSrtPath(projectId)),
  );

  if (!exists) {
    return {
      status: "pending",
      srtUrl: null,
      wordCount: 0,
      error: null,
    };
  }

  const content = await import("@/lib/studio/video/storage").then(async (m) => {
    const buf = await m.readProjectFile(m.getSrtPath(projectId));
    return buf?.toString("utf-8") ?? "";
  });

  const wordCount = content
    .split("\n")
    .filter((line) => line && !/^\d+$/.test(line) && !line.includes("-->"))
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    status: "completed",
    srtUrl: srtDownloadApiPath(projectId),
    wordCount,
    error: null,
  };
}

export async function loadCaptionWords(
  projectId: string,
  userId: string,
): Promise<CaptionWord[]> {
  const narrationText = await resolveProjectNarrationText(projectId, userId);
  const voiceover = await prisma.studioVoiceover.findFirst({
    where: { projectId, sceneId: null },
  });
  const wordCount = narrationText.trim().split(/\s+/).filter(Boolean).length;
  const durationSec =
    voiceover?.durationSec ??
    Math.max(10, Math.round((wordCount / 150) * 60));
  return buildCaptionWords(narrationText, durationSec);
}
