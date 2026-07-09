import type { PipelineModule } from "@/lib/studio/pipeline/modules/types";
import {
  getMetadataObject,
  successResult,
} from "@/lib/studio/pipeline/modules/helpers";

export interface SeoGeneratorService {
  generateSeoPackage(script: Record<string, unknown>): Promise<{
    titles: string[];
    description: string;
    tags: string[];
    pinnedComment: string;
  }>;
}

export class DefaultSeoGeneratorService implements SeoGeneratorService {
  async generateSeoPackage(script: Record<string, unknown>) {
    return {
      titles: Array.isArray(script.titles)
        ? script.titles.filter((item): item is string => typeof item === "string")
        : [],
      description:
        typeof script.description === "string" ? script.description : "",
      tags: Array.isArray(script.tags)
        ? script.tags.filter((item): item is string => typeof item === "string")
        : [],
      pinnedComment:
        typeof script.pinnedComment === "string" ? script.pinnedComment : "",
    };
  }
}

export function createSeoGeneratorModule(
  service: SeoGeneratorService = new DefaultSeoGeneratorService(),
): PipelineModule {
  return {
    stepId: "seo_generator",
    name: "SEO Generator",
    async execute(context) {
      const script = getMetadataObject(context, "script");
      const seo = await service.generateSeoPackage(script);

      return successResult({ seo }, { seo });
    },
  };
}
