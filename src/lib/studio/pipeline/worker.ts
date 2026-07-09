import "server-only";

import { getPipelineModule } from "@/lib/studio/pipeline/modules/registry";
import {
  getNextStepId,
  getStepDefinition,
  type PipelineStepId,
} from "@/lib/studio/pipeline/types";
import type { StudioGenerateInput } from "@/lib/studio/types";
import {
  appendProjectLog,
  claimNextStudioJob,
  enqueueStudioJob,
  finalizeProjectPackage,
  markProjectFailed,
  markProjectStarted,
  markStudioJobCompleted,
  markStudioJobFailed,
  persistStepArtifacts,
  updateProjectProgress,
} from "@/lib/studio/projects/data";

function toMetadataRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function getProjectInput(metadata: unknown): StudioGenerateInput {
  const record = toMetadataRecord(metadata);
  const input = record.input;
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Project input metadata is missing.");
  }

  const typed = input as Record<string, unknown>;
  const topic = typeof typed.topic === "string" ? typed.topic : "";
  if (!topic) {
    throw new Error("Project topic is missing.");
  }

  return {
    topic,
    niche: typeof typed.niche === "string" ? typed.niche : undefined,
    videoType:
      typed.videoType === "shorts" || typed.videoType === "long-form"
        ? typed.videoType
        : "long-form",
    tone:
      typed.tone === "educational" ||
      typed.tone === "viral" ||
      typed.tone === "motivational" ||
      typed.tone === "professional" ||
      typed.tone === "funny"
        ? typed.tone
        : undefined,
  };
}

export async function processNextStudioJob(workerId: string) {
  const job = await claimNextStudioJob(workerId);
  if (!job) {
    return { processed: false as const };
  }

  const stepId = job.step as PipelineStepId;
  const step = getStepDefinition(stepId);
  const project = job.project;

  try {
    if (!project.startedAt) {
      await markProjectStarted(project.id);
    }

    await appendProjectLog(project.id, `Starting ${step.label}…`, {
      step: stepId,
    });

    const metadata = toMetadataRecord(project.metadata);
    const module = getPipelineModule(stepId);
    const result = await module.execute({
      projectId: project.id,
      userId: project.userId,
      input: getProjectInput(project.metadata),
      metadata,
    });

    await persistStepArtifacts(project.id, stepId, result.output);
    await markStudioJobCompleted(job.id, result.output);
    await updateProjectProgress(
      project.id,
      stepId,
      result.metadataPatch ?? result.output,
    );

    await appendProjectLog(project.id, `${step.label} completed.`, {
      step: stepId,
    });

    const nextStepId = getNextStepId(stepId);
    if (nextStepId) {
      await enqueueStudioJob(project.id, nextStepId);
      return {
        processed: true as const,
        projectId: project.id,
        stepId,
        nextStepId,
        status: "continued" as const,
      };
    }

    const finalMetadata = {
      ...metadata,
      ...(result.metadataPatch ?? result.output),
    };
    const packageId = await finalizeProjectPackage(
      project.id,
      project.userId,
      finalMetadata,
    );

    await appendProjectLog(project.id, "Production pipeline completed.", {
      step: stepId,
      metadata: packageId ? { packageId } : undefined,
    });

    return {
      processed: true as const,
      projectId: project.id,
      stepId,
      status: "completed" as const,
      packageId,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown pipeline error.";

    await markStudioJobFailed(job.id, message);
    await markProjectFailed(project.id, message);
    await appendProjectLog(project.id, message, {
      step: stepId,
      level: "error",
    });

    return {
      processed: true as const,
      projectId: project.id,
      stepId,
      status: "failed" as const,
      error: message,
    };
  }
}

export async function processStudioQueue(workerId: string, maxJobs = 5) {
  const results = [];

  for (let index = 0; index < maxJobs; index += 1) {
    const result = await processNextStudioJob(workerId);
    if (!result.processed) {
      break;
    }
    results.push(result);
  }

  return {
    processedCount: results.length,
    results,
  };
}

export async function kickstartStudioProject(projectId: string) {
  const workerId = `inline-${projectId}`;
  return processStudioQueue(workerId, 12);
}
