import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { generateStudioPackage } from "@/lib/studio/generate";
import { saveYouTubePackage } from "@/lib/studio/data";
import { appendProjectLog } from "@/lib/studio/projects/data";
import {
  createInitialMvpProgress,
  type MvpProgress,
  type MvpProjectState,
  type MvpSeoPackage,
  type MvpStep,
  MVP_STEPS,
} from "@/lib/studio/projects/mvp-types";
import { serializeStudioResearch } from "@/lib/studio/research/data";
import { runStudioResearch } from "@/lib/studio/research/run";
import {
  listStoryboardScenesForProject,
} from "@/lib/studio/storyboard/data";
import { runStoryboardEngine } from "@/lib/studio/storyboard/run";
import type { StudioGeneratedContent } from "@/lib/studio/types";
import { getVideoProjectState } from "@/lib/studio/video/state";
import { getProjectVoiceoverState } from "@/lib/studio/voiceover/generate";

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

function parseMvpProgress(metadata: unknown): MvpProgress {
  const record = toRecord(metadata);
  const raw = record?.mvpProgress;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return createInitialMvpProgress();
  }
  const progress = raw as Record<string, unknown>;
  const initial = createInitialMvpProgress();
  for (const step of MVP_STEPS) {
    const value = progress[step];
    if (value === "pending" || value === "running" || value === "completed" || value === "failed") {
      initial[step] = value;
    }
  }
  return initial;
}

async function patchProjectMetadata(
  projectId: string,
  patch: Record<string, unknown>,
) {
  const project = await prisma.studioProject.findUnique({
    where: { id: projectId },
    select: { metadata: true },
  });
  const merged = { ...(toRecord(project?.metadata) ?? {}), ...patch };
  await prisma.studioProject.update({
    where: { id: projectId },
    data: { metadata: merged as Prisma.InputJsonValue },
  });
}

async function setMvpProgress(
  projectId: string,
  step: MvpStep,
  status: MvpProgress[MvpStep],
  extra?: Record<string, unknown>,
) {
  const project = await prisma.studioProject.findUnique({
    where: { id: projectId },
    select: { metadata: true },
  });
  const metadata = toRecord(project?.metadata) ?? {};
  const mvpProgress = parseMvpProgress(metadata);
  mvpProgress[step] = status;

  const data: Prisma.StudioProjectUpdateInput = {
    metadata: {
      ...metadata,
      ...extra,
      mvpProgress,
      activeStep:
        status === "running"
          ? step
          : status === "completed"
            ? null
            : (metadata.activeStep as MvpStep | null) ?? null,
    } as Prisma.InputJsonValue,
  };

  if (status === "running") {
    if (step === "research") data.status = "researching";
    else if (step === "script") data.status = "writing";
    else if (step === "storyboard") data.status = "storyboarding";
  }

  const completedCount = MVP_STEPS.filter(
    (s) => (s === step ? status : mvpProgress[s]) === "completed",
  ).length;
  if (status === "completed") {
    data.progressPercent = Math.round((completedCount / MVP_STEPS.length) * 100);
  }

  await prisma.studioProject.update({
    where: { id: projectId },
    data,
  });
}

async function persistThumbnails(projectId: string, script: StudioGeneratedContent) {
  await prisma.studioThumbnail.deleteMany({ where: { projectId } });
  const ideas =
    script.thumbnailIdeas.length > 0
      ? script.thumbnailIdeas
      : script.titles.slice(0, 3);

  for (const [index, title] of ideas.slice(0, 5).entries()) {
    await prisma.studioThumbnail.create({
      data: {
        projectId,
        title,
        isPrimary: index === 0,
        provider: "concept",
      },
    });
  }
}

async function persistSeo(
  projectId: string,
  userId: string,
  script: StudioGeneratedContent,
): Promise<MvpSeoPackage> {
  const seo: MvpSeoPackage = {
    titles: script.titles,
    description: script.description,
    tags: script.tags,
    pinnedComment: script.pinnedComment,
  };

  await patchProjectMetadata(projectId, { seo });

  const project = await prisma.studioProject.findUnique({
    where: { id: projectId },
    select: { packageId: true, topic: true, niche: true, videoType: true, tone: true },
  });

  if (project?.packageId) {
    await prisma.youTubePackage.update({
      where: { id: project.packageId },
      data: {
        titles: seo.titles,
        description: seo.description,
        tags: seo.tags,
        pinnedComment: seo.pinnedComment,
      },
    });
  }

  return seo;
}

export async function getMvpProjectState(
  projectId: string,
  userId: string,
): Promise<MvpProjectState | null> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    include: {
      research: true,
      thumbnails: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!project) return null;

  const metadata = toRecord(project.metadata);
  const script = isStudioGeneratedContent(metadata?.script)
    ? metadata.script
    : null;
  const seoRaw = metadata?.seo;
  const seo =
    seoRaw && typeof seoRaw === "object" && !Array.isArray(seoRaw)
      ? (seoRaw as MvpSeoPackage)
      : script
        ? {
            titles: script.titles,
            description: script.description,
            tags: script.tags,
            pinnedComment: script.pinnedComment,
          }
        : null;

  const scenes = await listStoryboardScenesForProject(projectId, userId);
  const voiceover = await getProjectVoiceoverState(projectId, userId);
  const video = await getVideoProjectState(projectId, userId);

  return {
    projectId: project.id,
    topic: project.topic,
    niche: project.niche,
    videoType: project.videoType,
    tone: project.tone,
    status: project.status,
    mvpProgress: parseMvpProgress(project.metadata),
    activeStep: (metadata?.activeStep as MvpStep | null) ?? null,
    error: project.error,
    research: project.research
      ? serializeStudioResearch(project.research)
      : null,
    script,
    scenes,
    thumbnails: project.thumbnails.map((thumb) => ({
      id: thumb.id,
      title: thumb.title,
      isPrimary: thumb.isPrimary,
    })),
    seo,
    voiceover,
    video,
    packageId: project.packageId,
  };
}

export async function runMvpStep(
  projectId: string,
  userId: string,
  step: MvpStep,
): Promise<void> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    select: {
      id: true,
      topic: true,
      niche: true,
      videoType: true,
      tone: true,
      packageId: true,
      metadata: true,
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  await setMvpProgress(projectId, step, "running");
  await appendProjectLog(projectId, `Running ${step}…`, { step: `mvp_${step}` });

  try {
    switch (step) {
      case "research": {
        await runStudioResearch({
          userId,
          projectId,
          input: {
            topic: project.topic,
            niche: project.niche ?? undefined,
            videoType: project.videoType,
            tone: project.tone ?? undefined,
          },
        });
        break;
      }
      case "script": {
        const script = await generateStudioPackage({
          topic: project.topic,
          niche: project.niche ?? undefined,
          videoType: project.videoType as "shorts" | "long-form",
          tone: project.tone as
            | "educational"
            | "viral"
            | "motivational"
            | "professional"
            | "funny"
            | undefined,
        });

        let packageId = project.packageId;
        if (!packageId) {
          const saved = await saveYouTubePackage(
            userId,
            {
              topic: project.topic,
              niche: project.niche ?? undefined,
              videoType: project.videoType,
              tone: project.tone ?? undefined,
            },
            script,
          );
          packageId = saved.id;
          await prisma.studioProject.update({
            where: { id: projectId },
            data: { packageId },
          });
        } else {
          await prisma.youTubePackage.update({
            where: { id: packageId },
            data: {
              titles: script.titles,
              script: script.script,
              hook: script.hook,
              intro: script.intro,
              mainSections: script.mainSections,
              outro: script.outro,
              callToAction: script.callToAction,
              description: script.description,
              tags: script.tags,
              thumbnailIdeas: script.thumbnailIdeas,
              pinnedComment: script.pinnedComment,
            },
          });
        }

        await patchProjectMetadata(projectId, { script });
        break;
      }
      case "storyboard": {
        await runStoryboardEngine(projectId, userId);
        break;
      }
      case "thumbnail": {
        const metadata = toRecord(project.metadata);
        const script = isStudioGeneratedContent(metadata?.script)
          ? metadata.script
          : null;
        if (!script) {
          throw new Error("Script required before generating thumbnails.");
        }
        await persistThumbnails(projectId, script);
        break;
      }
      case "seo": {
        const metadata = toRecord(project.metadata);
        const script = isStudioGeneratedContent(metadata?.script)
          ? metadata.script
          : null;
        if (!script) {
          throw new Error("Script required before generating SEO.");
        }
        await persistSeo(projectId, userId, script);
        break;
      }
    }

    await setMvpProgress(projectId, step, "completed");
    await appendProjectLog(projectId, `${step} completed.`, { step: `mvp_${step}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : `${step} failed.`;
    await setMvpProgress(projectId, step, "failed");
    await prisma.studioProject.update({
      where: { id: projectId },
      data: { error: message },
    });
    await appendProjectLog(projectId, message, {
      step: `mvp_${step}`,
      level: "error",
    });
    throw error;
  }
}

export async function runFullMvpWorkflow(
  projectId: string,
  userId: string,
): Promise<MvpProjectState> {
  await prisma.studioProject.update({
    where: { id: projectId },
    data: {
      startedAt: new Date(),
      error: null,
      metadata: {
        ...(toRecord(
          (
            await prisma.studioProject.findUnique({
              where: { id: projectId },
              select: { metadata: true },
            })
          )?.metadata,
        ) ?? {}),
        mvpProgress: createInitialMvpProgress(),
        activeStep: "research",
      } as Prisma.InputJsonValue,
    },
  });

  for (const step of MVP_STEPS) {
    await runMvpStep(projectId, userId, step);
  }

  await prisma.studioProject.update({
    where: { id: projectId },
    data: {
      status: "completed",
      progressPercent: 100,
      completedAt: new Date(),
      metadata: {
        ...(toRecord(
          (
            await prisma.studioProject.findUnique({
              where: { id: projectId },
              select: { metadata: true },
            })
          )?.metadata,
        ) ?? {}),
        activeStep: null,
      } as Prisma.InputJsonValue,
    },
  });

  await appendProjectLog(projectId, "MVP package complete — ready for demo.");

  const state = await getMvpProjectState(projectId, userId);
  if (!state) {
    throw new Error("Failed to load project after MVP run.");
  }
  return state;
}

export async function createMvpStudioProject(
  userId: string,
  input: {
    topic: string;
    niche?: string;
    videoType: string;
    tone?: string;
  },
) {
  const project = await prisma.studioProject.create({
    data: {
      userId,
      topic: input.topic,
      niche: input.niche ?? null,
      videoType: input.videoType,
      tone: input.tone ?? null,
      status: "queued",
      progressPercent: 0,
      metadata: {
        input,
        mvpProgress: createInitialMvpProgress(),
      } satisfies Prisma.InputJsonValue,
    },
  });

  await appendProjectLog(project.id, "Project created — starting MVP workflow.");

  return project;
}

export async function updateMvpSectionContent(
  projectId: string,
  userId: string,
  step: MvpStep,
  data: unknown,
): Promise<MvpProjectState | null> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    select: { id: true, packageId: true, metadata: true },
  });

  if (!project) return null;

  switch (step) {
    case "research": {
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Invalid research payload.");
      }
      const research = await prisma.studioResearch.findFirst({
        where: { projectId, userId },
      });
      if (!research) throw new Error("Research not found.");
      const patch = data as Record<string, unknown>;
      await prisma.studioResearch.update({
        where: { id: research.id },
        data: {
          targetAudience:
            typeof patch.targetAudience === "string"
              ? patch.targetAudience
              : undefined,
          searchIntent:
            typeof patch.searchIntent === "string" ? patch.searchIntent : undefined,
          suggestedCta:
            typeof patch.suggestedCta === "string" ? patch.suggestedCta : undefined,
          trendingVideoAngles: Array.isArray(patch.trendingVideoAngles)
            ? (patch.trendingVideoAngles as string[])
            : undefined,
          viralHooks: Array.isArray(patch.viralHooks)
            ? (patch.viralHooks as string[])
            : undefined,
          longTailKeywords: Array.isArray(patch.longTailKeywords)
            ? (patch.longTailKeywords as string[])
            : undefined,
          questionsPeopleAsk: Array.isArray(patch.questionsPeopleAsk)
            ? (patch.questionsPeopleAsk as string[])
            : undefined,
          emotionalTriggers: Array.isArray(patch.emotionalTriggers)
            ? (patch.emotionalTriggers as string[])
            : undefined,
          viewerObjections: Array.isArray(patch.viewerObjections)
            ? (patch.viewerObjections as string[])
            : undefined,
          retentionOpportunities: Array.isArray(patch.retentionOpportunities)
            ? (patch.retentionOpportunities as string[])
            : undefined,
          monetizationIdeas: Array.isArray(patch.monetizationIdeas)
            ? (patch.monetizationIdeas as string[])
            : undefined,
          affiliateOpportunities: Array.isArray(patch.affiliateOpportunities)
            ? (patch.affiliateOpportunities as string[])
            : undefined,
        },
      });
      break;
    }
    case "script": {
      if (!isStudioGeneratedContent(data)) {
        throw new Error("Invalid script payload.");
      }
      await patchProjectMetadata(projectId, { script: data });
      if (project.packageId) {
        await prisma.youTubePackage.update({
          where: { id: project.packageId },
          data: {
            titles: data.titles,
            script: data.script,
            hook: data.hook,
            intro: data.intro,
            mainSections: data.mainSections,
            outro: data.outro,
            callToAction: data.callToAction,
            description: data.description,
            tags: data.tags,
            thumbnailIdeas: data.thumbnailIdeas,
            pinnedComment: data.pinnedComment,
          },
        });
      }
      break;
    }
    case "thumbnail": {
      if (!Array.isArray(data)) {
        throw new Error("Invalid thumbnail payload.");
      }
      for (const item of data) {
        if (!item || typeof item !== "object") continue;
        const record = item as Record<string, unknown>;
        if (typeof record.id !== "string" || typeof record.title !== "string") {
          continue;
        }
        await prisma.studioThumbnail.updateMany({
          where: { id: record.id, projectId },
          data: { title: record.title.trim() },
        });
      }
      break;
    }
    case "seo": {
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Invalid SEO payload.");
      }
      const seo = data as MvpSeoPackage;
      await patchProjectMetadata(projectId, { seo });
      if (project.packageId) {
        await prisma.youTubePackage.update({
          where: { id: project.packageId },
          data: {
            titles: seo.titles,
            description: seo.description,
            tags: seo.tags,
            pinnedComment: seo.pinnedComment,
          },
        });
      }
      break;
    }
    case "storyboard":
      throw new Error("Edit storyboard scenes individually.");
  }

  await appendProjectLog(projectId, `${step} updated manually.`, {
    step: `mvp_${step}_edit`,
  });

  return getMvpProjectState(projectId, userId);
}
