import "server-only";

import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { prisma } from "@/lib/db";
import {
  getExportZipPath,
  getSrtPath,
  getVideoPath,
  exportZipApiPath,
  ensureProjectDir,
} from "@/lib/studio/video/storage";

export async function buildExportPackage(
  projectId: string,
  userId: string,
): Promise<string> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    include: {
      thumbnails: { where: { isPrimary: true }, take: 1 },
      videos: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const videoPath = getVideoPath(projectId);
  const srtPath = getSrtPath(projectId);
  const zipPath = getExportZipPath(projectId);

  await ensureProjectDir(projectId);

  const { ZipArchive } = await import("archiver");
  const output = createWriteStream(zipPath);
  const archive = new ZipArchive({ zlib: { level: 9 } });

  const archivePromise = pipeline(archive, output);

  const fs = await import("node:fs/promises");
  try {
    await fs.access(videoPath);
    archive.file(videoPath, { name: "video.mp4" });
  } catch {
    throw new Error("Video not rendered yet.");
  }

  try {
    await fs.access(srtPath);
    archive.file(srtPath, { name: "captions.srt" });
  } catch {
    // captions optional in zip
  }

  const primaryThumb = project.thumbnails[0];
  if (primaryThumb?.imageUrl) {
    archive.append(`Thumbnail concept: ${primaryThumb.title}`, {
      name: "thumbnail.txt",
    });
  } else if (primaryThumb) {
    archive.append(primaryThumb.title, { name: "thumbnail-concept.txt" });
  }

  const readme = [
    `# ${project.topic}`,
    "",
    `Video type: ${project.videoType}`,
    `Exported: ${new Date().toISOString()}`,
    "",
    "Contents:",
    "- video.mp4 — rendered faceless video",
    "- captions.srt — subtitle file",
    "- thumbnail-concept.txt — primary thumbnail idea",
  ].join("\n");

  archive.append(readme, { name: "README.txt" });
  await archive.finalize();
  await archivePromise;

  return exportZipApiPath(projectId);
}
