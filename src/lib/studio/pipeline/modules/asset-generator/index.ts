import type { PipelineModule } from "@/lib/studio/pipeline/modules/types";
import {
  getMetadataArray,
  successResult,
} from "@/lib/studio/pipeline/modules/helpers";

export type GeneratedAsset = {
  sceneOrderIndex: number;
  type: "image" | "b_roll" | "graphic";
  name: string;
  provider: string;
  placeholderUrl: string;
};

export interface AssetGeneratorService {
  generateAssets(scenes: Array<{ orderIndex: number; title: string }>): Promise<
    GeneratedAsset[]
  >;
}

export class DefaultAssetGeneratorService implements AssetGeneratorService {
  async generateAssets(scenes: Array<{ orderIndex: number; title: string }>) {
    return scenes.flatMap((scene) => [
      {
        sceneOrderIndex: scene.orderIndex,
        type: "image" as const,
        name: `${scene.title} — hero frame`,
        provider: "placeholder",
        placeholderUrl: `https://placehold.co/1920x1080?text=${encodeURIComponent(scene.title)}`,
      },
      {
        sceneOrderIndex: scene.orderIndex,
        type: "b_roll" as const,
        name: `${scene.title} — b-roll clip`,
        provider: "placeholder",
        placeholderUrl: `https://placehold.co/1280x720?text=B-Roll+${scene.orderIndex + 1}`,
      },
    ]);
  }
}

export function createAssetGeneratorModule(
  service: AssetGeneratorService = new DefaultAssetGeneratorService(),
): PipelineModule {
  return {
    stepId: "asset_generator",
    name: "Asset Generator",
    async execute(context) {
      const scenes = getMetadataArray(context, "scenes") as Array<{
        orderIndex: number;
        title: string;
      }>;
      const assets = await service.generateAssets(scenes);

      return successResult({ assets }, { assets });
    },
  };
}
