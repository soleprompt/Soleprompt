import "server-only";

import { mkdir, writeFile, readFile, unlink, access } from "node:fs/promises";
import path from "node:path";

const DEFAULT_ASSETS_DIR = "storage/studio";

export function getStudioAssetsRoot(): string {
  return (
    process.env.STUDIO_ASSETS_DIR?.trim() ||
    path.join(process.cwd(), DEFAULT_ASSETS_DIR)
  );
}

export function getProjectDir(projectId: string): string {
  return path.join(getStudioAssetsRoot(), "projects", projectId);
}

export function getSceneImagePath(projectId: string, sceneId: string): string {
  return path.join(getProjectDir(projectId), "scenes", `${sceneId}.png`);
}

export function getVideoPath(projectId: string): string {
  return path.join(getProjectDir(projectId), "output.mp4");
}

export function getSrtPath(projectId: string): string {
  return path.join(getProjectDir(projectId), "captions.srt");
}

export function getExportZipPath(projectId: string): string {
  return path.join(getProjectDir(projectId), "export.zip");
}

export async function ensureProjectDir(projectId: string): Promise<string> {
  const dir = getProjectDir(projectId);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function writeProjectFile(
  filePath: string,
  data: Buffer | string,
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, data);
}

export async function readProjectFile(filePath: string): Promise<Buffer | null> {
  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function deleteProjectFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch {
    // file may not exist
  }
}

export function sceneImageApiPath(projectId: string, sceneId: string): string {
  return `/api/studio/projects/${projectId}/video/scenes/${sceneId}/image`;
}

export function videoDownloadApiPath(projectId: string): string {
  return `/api/studio/projects/${projectId}/video/download`;
}

export function srtDownloadApiPath(projectId: string): string {
  return `/api/studio/projects/${projectId}/video/captions`;
}

export function exportZipApiPath(projectId: string): string {
  return `/api/studio/projects/${projectId}/video/export`;
}
