import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { RemotionSceneInput } from "@/lib/studio/video/remotion/types";

function KenBurnsImage({
  src,
  direction,
  durationInFrames,
}: {
  src: string;
  direction: RemotionSceneInput["kenBurnsDirection"];
  durationInFrames: number;
}) {
  const frame = useCurrentFrame();

  const scaleStart = direction === "out" ? 1.15 : 1;
  const scaleEnd = direction === "in" ? 1.15 : direction === "out" ? 1 : 1.08;
  const scale = interpolate(frame, [0, durationInFrames], [scaleStart, scaleEnd], {
    extrapolateRight: "clamp",
  });

  const translateX =
    direction === "pan-left"
      ? interpolate(frame, [0, durationInFrames], [0, -40], {
          extrapolateRight: "clamp",
        })
      : direction === "pan-right"
        ? interpolate(frame, [0, durationInFrames], [0, 40], {
            extrapolateRight: "clamp",
          })
        : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateX(${translateX}px)`,
        }}
      />
    </AbsoluteFill>
  );
}

function SceneCaptions({ words }: { words: RemotionSceneInput["captionWords"] }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  const activeIndex = words.findIndex(
    (w) => currentSec >= w.startSec && currentSec < w.endSec,
  );

  const windowStart = Math.max(0, activeIndex - 2);
  const windowEnd = Math.min(words.length, windowStart + 6);
  const visibleWords = words.slice(windowStart, windowEnd);

  if (visibleWords.length === 0) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 120,
        paddingLeft: 48,
        paddingRight: 48,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px 10px",
          backgroundColor: "rgba(0,0,0,0.55)",
          borderRadius: 12,
          padding: "16px 24px",
          maxWidth: "90%",
        }}
      >
        {visibleWords.map((word, i) => {
          const globalIndex = windowStart + i;
          const isActive = globalIndex === activeIndex;
          return (
            <span
              key={`${word.text}-${globalIndex}`}
              style={{
                fontSize: 42,
                fontWeight: 700,
                fontFamily: "system-ui, sans-serif",
                color: isActive ? "#66B3FF" : "#FFFFFF",
                textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                transition: "color 0.1s",
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function FadeTransition({
  children,
  durationInFrames,
  fadeFrames = 15,
}: {
  children: React.ReactNode;
  durationInFrames: number;
  fadeFrames?: number;
}) {
  const frame = useCurrentFrame();
  const opacityIn = interpolate(frame, [0, fadeFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const opacityOut = interpolate(
    frame,
    [durationInFrames - fadeFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity: Math.min(opacityIn, opacityOut) }}>
      {children}
    </AbsoluteFill>
  );
}

export type FacelessVideoProps = {
  scenes: RemotionSceneInput[];
  narrationAudioPath: string;
  backgroundMusicPath: string | null;
};

const KEN_BURNS_DIRECTIONS: RemotionSceneInput["kenBurnsDirection"][] = [
  "in",
  "out",
  "pan-left",
  "pan-right",
];

export function FacelessVideo({
  scenes,
  narrationAudioPath,
  backgroundMusicPath,
}: FacelessVideoProps) {
  const { fps } = useVideoConfig();
  let frameOffset = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {scenes.map((scene, index) => {
        const durationInFrames = Math.max(1, Math.round(scene.durationSec * fps));
        const from = frameOffset;
        frameOffset += durationInFrames;

        const direction =
          scene.kenBurnsDirection ??
          KEN_BURNS_DIRECTIONS[index % KEN_BURNS_DIRECTIONS.length];

        return (
          <Sequence key={`scene-${index}`} from={from} durationInFrames={durationInFrames}>
            <FadeTransition durationInFrames={durationInFrames}>
              <KenBurnsImage
                src={scene.imagePath}
                direction={direction}
                durationInFrames={durationInFrames}
              />
              <SceneCaptions words={scene.captionWords} />
            </FadeTransition>
          </Sequence>
        );
      })}

      <Audio src={narrationAudioPath} volume={1} />
      {backgroundMusicPath && (
        <Audio src={backgroundMusicPath} volume={0.18} />
      )}
    </AbsoluteFill>
  );
}
