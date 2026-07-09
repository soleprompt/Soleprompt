import "server-only";

import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";

const DEFAULT_ASSETS_DIR = "storage/studio/voiceovers";

function getAssetsRoot(): string {
  return process.env.STUDIO_ASSETS_DIR?.trim() || path.join(process.cwd(), DEFAULT_ASSETS_DIR);
}

function getProjectAudioPath(projectId: string): string {
  return path.join(getAssetsRoot(), projectId, "narration.mp3");
}

export async function saveVoiceoverAudio(
  projectId: string,
  audio: Buffer,
): Promise<string> {
  const filePath = getProjectAudioPath(projectId);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, audio);
  return filePath;
}

export async function readVoiceoverAudio(projectId: string): Promise<Buffer | null> {
  try {
    return await readFile(getProjectAudioPath(projectId));
  } catch {
    return null;
  }
}

export async function deleteVoiceoverAudio(projectId: string): Promise<void> {
  try {
    await unlink(getProjectAudioPath(projectId));
  } catch {
    // file may not exist
  }
}

export function voiceoverAudioApiPath(projectId: string): string {
  return `/api/studio/projects/${projectId}/voiceover/audio`;
}
