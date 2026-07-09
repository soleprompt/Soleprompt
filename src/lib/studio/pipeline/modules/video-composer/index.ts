import type { PipelineModule } from "@/lib/studio/pipeline/modules/types";
import {
  getMetadataArray,
  successResult,
} from "@/lib/studio/pipeline/modules/helpers";

export interface VideoComposerService {
  composeVideo(input: {
    projectId: string;
    sceneCount: number;
    totalDurationSec: number;
  }): Promise<{
    status: string;
    provider: string;
    placeholderUrl: string;
    durationSec: number;
  }>;
}

export class DefaultVideoComposerService implements VideoComposerService {
  async composeVideo(input: {
    projectId: string;
    sceneCount: number;
    totalDurationSec: number;
  }) {
    return {
      status: "rendered",
      provider: "placeholder-composer",
      placeholderUrl: `https://placehold.co/video/${input.projectId}.mp4`,
      durationSec: input.totalDurationSec,
    };
  }
}

export function createVideoComposerModule(
  service: VideoComposerService = new DefaultVideoComposerService(),
): PipelineModule {
  return {
    stepId: "video_composer",
    name: "Video Composer",
    async execute(context) {
      const scenes = getMetadataArray(context, "scenes") as Array<{
        durationSec: number;
      }>;
      const totalDurationSec = scenes.reduce(
        (total, scene) => total + (scene.durationSec ?? 0),
        0,
      );

      const video = await service.composeVideo({
        projectId: context.projectId,
        sceneCount: scenes.length,
        totalDurationSec,
      });

      return successResult({ video }, { video });
    },
  };
}
