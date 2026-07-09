import { createAiResearchModule } from "@/lib/studio/pipeline/modules/ai-research";
import { createAnalyticsModule } from "@/lib/studio/pipeline/modules/analytics";
import { createAssetGeneratorModule } from "@/lib/studio/pipeline/modules/asset-generator";
import { createPublisherModule } from "@/lib/studio/pipeline/modules/publisher";
import { createSceneGeneratorModule } from "@/lib/studio/pipeline/modules/scene-generator";
import { createScriptGeneratorModule } from "@/lib/studio/pipeline/modules/script-generator";
import { createSeoGeneratorModule } from "@/lib/studio/pipeline/modules/seo-generator";
import { createStoryboardGeneratorModule } from "@/lib/studio/pipeline/modules/storyboard-generator";
import type { ModuleRegistry } from "@/lib/studio/pipeline/modules/types";
import { createThumbnailGeneratorModule } from "@/lib/studio/pipeline/modules/thumbnail-generator";
import { createTrendResearchModule } from "@/lib/studio/pipeline/modules/trend-research";
import { createVideoComposerModule } from "@/lib/studio/pipeline/modules/video-composer";
import { createVoiceoverGeneratorModule } from "@/lib/studio/pipeline/modules/voiceover-generator";
import type { PipelineStepId } from "@/lib/studio/pipeline/types";

let registry: ModuleRegistry | null = null;

export function getModuleRegistry(): ModuleRegistry {
  if (!registry) {
    registry = {
      trend_research: createTrendResearchModule(),
      ai_research: createAiResearchModule(),
      script_generator: createScriptGeneratorModule(),
      storyboard_generator: createStoryboardGeneratorModule(),
      scene_generator: createSceneGeneratorModule(),
      asset_generator: createAssetGeneratorModule(),
      voiceover_generator: createVoiceoverGeneratorModule(),
      thumbnail_generator: createThumbnailGeneratorModule(),
      video_composer: createVideoComposerModule(),
      seo_generator: createSeoGeneratorModule(),
      publisher: createPublisherModule(),
      analytics: createAnalyticsModule(),
    };
  }

  return registry;
}

export function getPipelineModule(stepId: PipelineStepId) {
  const stepModule = getModuleRegistry()[stepId];
  if (!stepModule) {
    throw new Error(`No module registered for step: ${stepId}`);
  }
  return stepModule;
}

export function setModuleRegistry(customRegistry: ModuleRegistry) {
  registry = customRegistry;
}
