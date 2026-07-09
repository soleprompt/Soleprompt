import "server-only";

import { generateStudioResearch } from "@/lib/studio/research/generate";
import {
  createQueuedResearch,
  getOrCreateProjectResearch,
  markResearchFailed,
  markResearchResearching,
  saveResearchResults,
} from "@/lib/studio/research/data";
import type {
  StudioResearchInput,
  StudioResearchRecord,
} from "@/lib/studio/research/types";

export type RunStudioResearchOptions = {
  userId: string;
  input: StudioResearchInput;
  projectId?: string;
  researchId?: string;
};

export async function runStudioResearch(
  options: RunStudioResearchOptions,
): Promise<StudioResearchRecord> {
  let research: StudioResearchRecord;

  if (options.researchId) {
    research = await markResearchResearching(options.researchId);
  } else if (options.projectId) {
    research = await getOrCreateProjectResearch(
      options.userId,
      options.projectId,
      options.input,
    );
    if (research.status === "completed") {
      return research;
    }
    research = await markResearchResearching(research.id);
  } else {
    research = await createQueuedResearch(options.userId, options.input);
    research = await markResearchResearching(research.id);
  }

  try {
    const generated = await generateStudioResearch(options.input);
    return saveResearchResults(research.id, generated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Research generation failed.";
    await markResearchFailed(research.id, message);
    throw error;
  }
}
