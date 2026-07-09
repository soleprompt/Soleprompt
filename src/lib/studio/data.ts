import "server-only";

import { prisma } from "@/lib/db";
import type { StudioMainSection, StudioPackageRecord } from "@/lib/studio/types";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toMainSections(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((section) => {
    if (!section || typeof section !== "object") return [];
    const record = section as Record<string, unknown>;
    const heading = typeof record.heading === "string" ? record.heading : "";
    const content = typeof record.content === "string" ? record.content : "";
    if (!heading || !content) return [];
    const retentionTip =
      typeof record.retentionTip === "string" ? record.retentionTip : undefined;
    return [{ heading, content, retentionTip }];
  });
}

export function serializeYouTubePackage(
  pkg: Awaited<ReturnType<typeof prisma.youTubePackage.findUnique>>,
): StudioPackageRecord | null {
  if (!pkg) return null;

  return {
    id: pkg.id,
    topic: pkg.topic,
    niche: pkg.niche,
    videoType: pkg.videoType,
    tone: pkg.tone,
    titles: toStringArray(pkg.titles),
    script: pkg.script,
    hook: pkg.hook,
    intro: pkg.intro,
    mainSections: toMainSections(pkg.mainSections),
    outro: pkg.outro,
    callToAction: pkg.callToAction,
    description: pkg.description,
    tags: toStringArray(pkg.tags),
    thumbnailIdeas: toStringArray(pkg.thumbnailIdeas),
    pinnedComment: pkg.pinnedComment,
    createdAt: pkg.createdAt.toISOString(),
    updatedAt: pkg.updatedAt.toISOString(),
  };
}

export async function listYouTubePackagesForUser(userId: string, limit = 10) {
  const packages = await prisma.youTubePackage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return packages
    .map((pkg) => serializeYouTubePackage(pkg))
    .filter((pkg): pkg is StudioPackageRecord => pkg !== null);
}

export async function getYouTubePackageForUser(id: string, userId: string) {
  const pkg = await prisma.youTubePackage.findFirst({
    where: { id, userId },
  });
  return serializeYouTubePackage(pkg);
}

export async function saveYouTubePackage(
  userId: string,
  input: {
    topic: string;
    niche?: string;
    videoType: string;
    tone?: string;
  },
  content: {
    titles: string[];
    script: string;
    hook: string;
    intro: string;
    mainSections: StudioMainSection[];
    outro: string;
    callToAction: string;
    description: string;
    tags: string[];
    thumbnailIdeas: string[];
    pinnedComment: string;
  },
) {
  const pkg = await prisma.youTubePackage.create({
    data: {
      userId,
      topic: input.topic,
      niche: input.niche ?? null,
      videoType: input.videoType,
      tone: input.tone ?? null,
      titles: content.titles,
      script: content.script,
      hook: content.hook,
      intro: content.intro,
      mainSections: content.mainSections,
      outro: content.outro,
      callToAction: content.callToAction,
      description: content.description,
      tags: content.tags,
      thumbnailIdeas: content.thumbnailIdeas,
      pinnedComment: content.pinnedComment,
    },
  });

  return serializeYouTubePackage(pkg)!;
}
