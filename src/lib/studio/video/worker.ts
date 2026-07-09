import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { appendProjectLog } from "@/lib/studio/projects/data";
import { jobStepToVideoStep } from "@/lib/studio/video/workflow";
import { runVideoStep } from "@/lib/studio/video/workflow";

const JOB_LOCK_TTL_MS = 5 * 60 * 1000;

async function claimNextVideoJob(workerId: string) {
  const staleLockBefore = new Date(Date.now() - JOB_LOCK_TTL_MS);

  const candidate = await prisma.studioJob.findFirst({
    where: {
      step: { startsWith: "video_" },
      OR: [
        { status: "pending" },
        { status: "processing", lockedAt: { lt: staleLockBefore } },
      ],
    },
    orderBy: [{ priority: "desc" }, { scheduledAt: "asc" }],
    include: { project: true },
  });

  if (!candidate) return null;

  const updated = await prisma.studioJob.updateMany({
    where: {
      id: candidate.id,
      OR: [
        { status: "pending" },
        { status: "processing", lockedAt: { lt: staleLockBefore } },
      ],
    },
    data: {
      status: "processing",
      lockedAt: new Date(),
      lockedBy: workerId,
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  if (updated.count === 0) return null;

  return prisma.studioJob.findUnique({
    where: { id: candidate.id },
    include: { project: true },
  });
}

export async function processNextVideoJob(workerId: string) {
  const job = await claimNextVideoJob(workerId);
  if (!job) {
    return { processed: false as const };
  }

  const videoStep = jobStepToVideoStep(job.step);
  if (!videoStep) {
    await prisma.studioJob.update({
      where: { id: job.id },
      data: { status: "failed", error: "Unknown video step." },
    });
    return { processed: true as const, status: "failed" as const };
  }

  const project = job.project;

  try {
    await runVideoStep(project.id, project.userId, videoStep);
    await prisma.studioJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        result: { step: videoStep } as Prisma.InputJsonValue,
        completedAt: new Date(),
        lockedAt: null,
        lockedBy: null,
        error: null,
      },
    });
    return {
      processed: true as const,
      projectId: project.id,
      step: videoStep,
      status: "completed" as const,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Video job failed.";
    await prisma.studioJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        error: message,
        completedAt: new Date(),
        lockedAt: null,
        lockedBy: null,
      },
    });
    await appendProjectLog(project.id, message, {
      step: job.step,
      level: "error",
    });
    return {
      processed: true as const,
      projectId: project.id,
      step: videoStep,
      status: "failed" as const,
      error: message,
    };
  }
}

export async function processVideoQueue(workerId: string, maxJobs = 5) {
  const results = [];

  for (let i = 0; i < maxJobs; i += 1) {
    const result = await processNextVideoJob(workerId);
    if (!result.processed) break;
    results.push(result);
  }

  return { processedCount: results.length, results };
}

export async function kickstartVideoPipeline(projectId: string, userId: string) {
  const { enqueueVideoPipeline } = await import("@/lib/studio/video/workflow");
  await enqueueVideoPipeline(projectId, userId);
  const workerId = `video-inline-${projectId}`;
  return processVideoQueue(workerId, 8);
}
