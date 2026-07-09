import type { PipelineModule } from "@/lib/studio/pipeline/modules/types";
import {
  getMetadataObject,
  successResult,
} from "@/lib/studio/pipeline/modules/helpers";

export type GeneratedThumbnail = {
  title: string;
  provider: string;
  placeholderUrl: string;
  isPrimary: boolean;
};

export interface ThumbnailGeneratorService {
  generateThumbnails(input: {
    topic: string;
    thumbnailIdeas: string[];
  }): Promise<GeneratedThumbnail[]>;
}

export class DefaultThumbnailGeneratorService implements ThumbnailGeneratorService {
  async generateThumbnails(input: {
    topic: string;
    thumbnailIdeas: string[];
  }) {
    const ideas =
      input.thumbnailIdeas.length > 0
        ? input.thumbnailIdeas
        : [`${input.topic}`, `Watch This: ${input.topic}`, `You Need This`];

    return ideas.slice(0, 5).map((idea, index) => ({
      title: idea,
      provider: "placeholder",
      placeholderUrl: `https://placehold.co/1280x720?text=${encodeURIComponent(idea)}`,
      isPrimary: index === 0,
    }));
  }
}

export function createThumbnailGeneratorModule(
  service: ThumbnailGeneratorService = new DefaultThumbnailGeneratorService(),
): PipelineModule {
  return {
    stepId: "thumbnail_generator",
    name: "Thumbnail Generator",
    async execute(context) {
      const script = getMetadataObject(context, "script");
      const thumbnailIdeas = Array.isArray(script.thumbnailIdeas)
        ? script.thumbnailIdeas.filter(
            (item): item is string => typeof item === "string",
          )
        : [];

      const thumbnails = await service.generateThumbnails({
        topic: context.input.topic,
        thumbnailIdeas,
      });

      return successResult({ thumbnails }, { thumbnails });
    },
  };
}
