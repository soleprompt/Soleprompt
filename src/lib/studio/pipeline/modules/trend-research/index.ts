import type { PipelineModule } from "@/lib/studio/pipeline/modules/types";
import { successResult } from "@/lib/studio/pipeline/modules/helpers";

export interface TrendResearchService {
  findTrendingAngles(topic: string, niche?: string): Promise<string[]>;
}

export class DefaultTrendResearchService implements TrendResearchService {
  async findTrendingAngles(topic: string, niche?: string): Promise<string[]> {
    const base = niche ?? "YouTube";
    return [
      `${topic} — what creators miss in ${base}`,
      `Why ${topic} is trending now`,
      `The ${base} angle on ${topic}`,
      `Common mistakes with ${topic}`,
      `Future of ${topic} in ${base}`,
    ];
  }
}

export function createTrendResearchModule(
  service: TrendResearchService = new DefaultTrendResearchService(),
): PipelineModule {
  return {
    stepId: "trend_research",
    name: "Trend Research Engine",
    async execute(context) {
      const angles = await service.findTrendingAngles(
        context.input.topic,
        context.input.niche,
      );

      return successResult(
        { trendingAngles: angles },
        { trendingAngles: angles },
      );
    },
  };
}
