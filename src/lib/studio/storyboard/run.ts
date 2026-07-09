import "server-only";

import { generateStoryboardFromScript } from "@/lib/studio/storyboard/generate";
import {
  listStoryboardScenesForProject,
  loadScriptForProject,
  logStoryboardEvent,
  persistStoryboardScenes,
  setProjectStoryboardStatus,
} from "@/lib/studio/storyboard/data";
import type { StoryboardSceneRecord } from "@/lib/studio/storyboard/types";
import { prisma } from "@/lib/db";

export type RunStoryboardResult = {
  projectId: string;
  status: "storyboard_complete";
  scenes: StoryboardSceneRecord[];
};

export async function runStoryboardEngine(
  projectId: string,
  userId: string,
): Promise<RunStoryboardResult> {
  const project = await prisma.studioProject.findFirst({
    where: { id: projectId, userId },
    select: {
      id: true,
      topic: true,
      niche: true,
      videoType: true,
      tone: true,
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const script = await loadScriptForProject(projectId, userId);
  if (!script) {
    throw new Error(
      "Script not found. Complete script generation before creating a storyboard.",
    );
  }

  await setProjectStoryboardStatus(projectId, "storyboarding");
  await logStoryboardEvent(projectId, "Generating storyboard from script…");

  try {
    const generated = await generateStoryboardFromScript({
      topic: project.topic,
      niche: project.niche ?? undefined,
      videoType: project.videoType,
      tone: project.tone ?? undefined,
      script,
    });

    await persistStoryboardScenes(projectId, generated.scenes);
    await setProjectStoryboardStatus(projectId, "storyboard_complete");
    await logStoryboardEvent(
      projectId,
      `Storyboard complete — ${generated.scenes.length} scenes generated.`,
    );

    const scenes = await listStoryboardScenesForProject(projectId, userId);

    return {
      projectId,
      status: "storyboard_complete",
      scenes,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Storyboard generation failed.";
    await setProjectStoryboardStatus(projectId, "writing");
    await logStoryboardEvent(projectId, message, "error");
    throw error;
  }
}
