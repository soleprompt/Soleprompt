import type { PipelineModule } from "@/lib/studio/pipeline/modules/types";
import {
  getMetadataObject,
  successResult,
} from "@/lib/studio/pipeline/modules/helpers";

export interface PublisherService {
  publish(input: {
    projectId: string;
    topic: string;
    seo: Record<string, unknown>;
  }): Promise<{
    platform: string;
    status: string;
    externalUrl: string;
  }>;
}

export class DefaultPublisherService implements PublisherService {
  async publish(input: {
    projectId: string;
    topic: string;
    seo: Record<string, unknown>;
  }) {
    const slug = input.topic.toLowerCase().replace(/\s+/g, "-").slice(0, 48);
    return {
      platform: "youtube",
      status: "ready_to_publish",
      externalUrl: `https://youtube.com/watch?v=studio-${input.projectId}-${slug}`,
    };
  }
}

export function createPublisherModule(
  service: PublisherService = new DefaultPublisherService(),
): PipelineModule {
  return {
    stepId: "publisher",
    name: "Publisher",
    async execute(context) {
      const seo = getMetadataObject(context, "seo");
      const upload = await service.publish({
        projectId: context.projectId,
        topic: context.input.topic,
        seo,
      });

      return successResult({ upload }, { upload });
    },
  };
}
