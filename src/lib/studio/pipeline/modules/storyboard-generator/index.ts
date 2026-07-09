import type { PipelineModule } from "@/lib/studio/pipeline/modules/types";
import {
  getMetadataObject,
  sceneCountForVideoType,
  successResult,
} from "@/lib/studio/pipeline/modules/helpers";

export type StoryboardBeat = {
  orderIndex: number;
  title: string;
  description: string;
  visualNotes: string;
  durationSec: number;
};

export interface StoryboardGeneratorService {
  generateStoryboard(input: {
    topic: string;
    videoType: string;
    script: Record<string, unknown>;
  }): Promise<StoryboardBeat[]>;
}

export class DefaultStoryboardGeneratorService
  implements StoryboardGeneratorService
{
  async generateStoryboard(input: {
    topic: string;
    videoType: string;
    script: Record<string, unknown>;
  }): Promise<StoryboardBeat[]> {
    const sceneCount = sceneCountForVideoType(input.videoType);
    const mainSections = Array.isArray(input.script.mainSections)
      ? input.script.mainSections
      : [];

    const beats: StoryboardBeat[] = [
      {
        orderIndex: 0,
        title: "Hook",
        description:
          typeof input.script.hook === "string"
            ? input.script.hook
            : `Open with a pattern interrupt about ${input.topic}`,
        visualNotes: "Tight face-cam or bold text overlay, fast cut",
        durationSec: input.videoType === "shorts" ? 3 : 8,
      },
      {
        orderIndex: 1,
        title: "Intro",
        description:
          typeof input.script.intro === "string"
            ? input.script.intro
            : `Set up the promise for ${input.topic}`,
        visualNotes: "B-roll montage + lower-third topic title",
        durationSec: input.videoType === "shorts" ? 5 : 20,
      },
    ];

    for (let index = 0; index < sceneCount - 3; index += 1) {
      const section = mainSections[index] as Record<string, unknown> | undefined;
      beats.push({
        orderIndex: index + 2,
        title:
          typeof section?.heading === "string"
            ? section.heading
            : `Section ${index + 1}`,
        description:
          typeof section?.content === "string"
            ? section.content
            : `Deliver key insight ${index + 1} about ${input.topic}`,
        visualNotes:
          typeof section?.retentionTip === "string"
            ? section.retentionTip
            : "Pattern interrupt: zoom, graphic, or cutaway",
        durationSec: input.videoType === "shorts" ? 8 : 90,
      });
    }

    beats.push({
      orderIndex: sceneCount - 1,
      title: "Outro + CTA",
      description: [
        typeof input.script.outro === "string" ? input.script.outro : "",
        typeof input.script.callToAction === "string"
          ? input.script.callToAction
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
      visualNotes: "End card + subscribe animation",
      durationSec: input.videoType === "shorts" ? 4 : 25,
    });

    return beats;
  }
}

export function createStoryboardGeneratorModule(
  service: StoryboardGeneratorService = new DefaultStoryboardGeneratorService(),
): PipelineModule {
  return {
    stepId: "storyboard_generator",
    name: "Storyboard Generator",
    async execute(context) {
      const script = getMetadataObject(context, "script");
      const beats = await service.generateStoryboard({
        topic: context.input.topic,
        videoType: context.input.videoType,
        script,
      });

      return successResult({ storyboard: beats }, { storyboard: beats });
    },
  };
}
