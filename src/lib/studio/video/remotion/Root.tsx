import React from "react";
import { Composition } from "remotion";
import { FacelessVideo } from "@/lib/studio/video/remotion/FacelessVideo";
import {
  REMOTION_COMPOSITION_ID,
  REMOTION_FPS,
} from "@/lib/studio/video/remotion/types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={REMOTION_COMPOSITION_ID}
        component={FacelessVideo}
        durationInFrames={REMOTION_FPS * 60}
        fps={REMOTION_FPS}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: [],
          narrationAudioPath: "",
          backgroundMusicPath: null,
        }}
        calculateMetadata={({ props }) => {
          const scenes = props.scenes as Array<{ durationSec: number }>;
          const totalSec = scenes.reduce((sum, s) => sum + s.durationSec, 0);
          return {
            durationInFrames: Math.max(
              REMOTION_FPS,
              Math.round(totalSec * REMOTION_FPS),
            ),
          };
        }}
      />
    </>
  );
};
