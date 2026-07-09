import type { StudioResearchInput, StudioResearchRecord } from "@/lib/studio/research/types";
import { runStudioResearch } from "@/lib/studio/research/run";

export interface AiResearchService {
  runResearch(options: {
    userId: string;
    projectId: string;
    input: StudioResearchInput;
  }): Promise<StudioResearchRecord>;
}

export class OpenAiResearchService implements AiResearchService {
  async runResearch(options: {
    userId: string;
    projectId: string;
    input: StudioResearchInput;
  }) {
    return runStudioResearch({
      userId: options.userId,
      projectId: options.projectId,
      input: options.input,
    });
  }
}
