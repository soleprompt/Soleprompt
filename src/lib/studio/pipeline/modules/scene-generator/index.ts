import type { StoryboardBeat } from "@/lib/studio/pipeline/modules/storyboard-generator";
import type { PipelineModule } from "@/lib/studio/pipeline/modules/types";
import {
  getMetadataArray,
  successResult,
} from "@/lib/studio/pipeline/modules/helpers";

export interface SceneGeneratorService {
  materializeScenes(beats: StoryboardBeat[]): Promise<
    Array<{
      orderIndex: number;
      title: string;
      description: string;
      script: string;
      durationSec: number;
      visualNotes: string;
    }>
  >;
}

export class DefaultSceneGeneratorService implements SceneGeneratorService {
  async materializeScenes(beats: StoryboardBeat[]) {
    return beats.map((beat) => ({
      orderIndex: beat.orderIndex,
      title: beat.title,
      description: beat.description,
      script: beat.description,
      durationSec: beat.durationSec,
      visualNotes: beat.visualNotes,
    }));
  }
}

export function createSceneGeneratorModule(
  service: SceneGeneratorService = new DefaultSceneGeneratorService(),
): PipelineModule {
  return {
    stepId: "scene_generator",
    name: "Scene Generator",
    async execute(context) {
      const storyboard = getMetadataArray(context, "storyboard") as StoryboardBeat[];
      const scenes = await service.materializeScenes(storyboard);

      return successResult({ scenes }, { scenes });
    },
  };
}
