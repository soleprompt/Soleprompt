import type { PipelineModule } from "@/lib/studio/pipeline/modules/types";
import {
  getMetadataArray,
  successResult,
} from "@/lib/studio/pipeline/modules/helpers";
import {
  OpenAiResearchService,
  type AiResearchService,
} from "@/lib/studio/research/service";

export type { AiResearchService } from "@/lib/studio/research/service";
export { OpenAiResearchService } from "@/lib/studio/research/service";

export function createAiResearchModule(
  service: AiResearchService = new OpenAiResearchService(),
): PipelineModule {
  return {
    stepId: "ai_research",
    name: "AI Research Engine",
    async execute(context) {
      const trendingAngles = getMetadataArray(context, "trendingAngles").filter(
        (item): item is string => typeof item === "string",
      );

      const record = await service.runResearch({
        userId: context.userId,
        projectId: context.projectId,
        input: {
          topic: context.input.topic,
          niche: context.input.niche,
          videoType: context.input.videoType,
          tone: context.input.tone,
          trendingAngles,
        },
      });

      return successResult(
        { researchId: record.id, research: record },
        { research: record, researchId: record.id },
      );
    },
  };
}
