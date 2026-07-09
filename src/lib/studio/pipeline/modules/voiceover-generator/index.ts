import type { PipelineModule } from "@/lib/studio/pipeline/modules/types";
import {
  getMetadataArray,
  successResult,
} from "@/lib/studio/pipeline/modules/helpers";

export type GeneratedVoiceover = {
  sceneOrderIndex: number;
  text: string;
  provider: string;
  voiceId: string;
  durationSec: number;
  placeholderAudioUrl: string;
};

export interface VoiceoverGeneratorService {
  generateVoiceovers(
    scenes: Array<{ orderIndex: number; script: string; durationSec: number }>,
  ): Promise<GeneratedVoiceover[]>;
}

export class DefaultVoiceoverGeneratorService implements VoiceoverGeneratorService {
  async generateVoiceovers(
    scenes: Array<{ orderIndex: number; script: string; durationSec: number }>,
  ) {
    return scenes.map((scene) => ({
      sceneOrderIndex: scene.orderIndex,
      text: scene.script,
      provider: "placeholder-tts",
      voiceId: "default-narrator",
      durationSec: scene.durationSec,
      placeholderAudioUrl: `https://placehold.co/audio/scene-${scene.orderIndex + 1}.mp3`,
    }));
  }
}

export function createVoiceoverGeneratorModule(
  service: VoiceoverGeneratorService = new DefaultVoiceoverGeneratorService(),
): PipelineModule {
  return {
    stepId: "voiceover_generator",
    name: "Voiceover Generator",
    async execute(context) {
      const scenes = getMetadataArray(context, "scenes") as Array<{
        orderIndex: number;
        script: string;
        durationSec: number;
      }>;
      const voiceovers = await service.generateVoiceovers(scenes);

      return successResult({ voiceovers }, { voiceovers });
    },
  };
}
