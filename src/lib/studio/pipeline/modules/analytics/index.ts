import type { PipelineModule } from "@/lib/studio/pipeline/modules/types";
import { successResult } from "@/lib/studio/pipeline/modules/helpers";

export interface AnalyticsService {
  initializeTracking(projectId: string): Promise<{
    views: number;
    likes: number;
    comments: number;
    watchTimeSec: number;
    ctr: number | null;
  }>;
}

export class DefaultAnalyticsService implements AnalyticsService {
  async initializeTracking(_projectId: string) {
    return {
      views: 0,
      likes: 0,
      comments: 0,
      watchTimeSec: 0,
      ctr: null,
    };
  }
}

export function createAnalyticsModule(
  service: AnalyticsService = new DefaultAnalyticsService(),
): PipelineModule {
  return {
    stepId: "analytics",
    name: "Analytics",
    async execute(context) {
      const analytics = await service.initializeTracking(context.projectId);
      return successResult({ analytics }, { analytics });
    },
  };
}
