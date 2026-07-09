import { generateStudioPackage } from "@/lib/studio/generate";
import type { StudioGeneratedContent } from "@/lib/studio/types";
import type { PipelineModule } from "@/lib/studio/pipeline/modules/types";
import { successResult } from "@/lib/studio/pipeline/modules/helpers";

export interface ScriptGeneratorService {
  generateScript(input: {
    topic: string;
    niche?: string;
    videoType: string;
    tone?: string;
  }): Promise<StudioGeneratedContent>;
}

export class OpenAiScriptGeneratorService implements ScriptGeneratorService {
  async generateScript(input: {
    topic: string;
    niche?: string;
    videoType: string;
    tone?: string;
  }) {
    return generateStudioPackage({
      topic: input.topic,
      niche: input.niche,
      videoType: input.videoType as "shorts" | "long-form",
      tone: input.tone as
        | "educational"
        | "viral"
        | "motivational"
        | "professional"
        | "funny"
        | undefined,
    });
  }
}

export function createScriptGeneratorModule(
  service: ScriptGeneratorService = new OpenAiScriptGeneratorService(),
): PipelineModule {
  return {
    stepId: "script_generator",
    name: "Script Generator",
    async execute(context) {
      const script = await service.generateScript({
        topic: context.input.topic,
        niche: context.input.niche,
        videoType: context.input.videoType,
        tone: context.input.tone,
      });

      return successResult({ script }, { script });
    },
  };
}
