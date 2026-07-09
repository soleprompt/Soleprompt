"use client";

import {
  Download,
  Film,
  ImageIcon,
  Mic,
  RefreshCw,
  Subtitles,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  StudioAlert,
  StudioEmptyState,
  StudioInfoBlock,
  StudioLoadingState,
  studioGlass,
  studioLabel,
} from "@/components/studio/studio-ui";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { parseApiError } from "@/lib/api-error";
import {
  OPENAI_TTS_VOICES,
  VIDEO_STEP_LABELS,
  VIDEO_STEPS,
  type VideoProjectState,
  type VideoStep,
} from "@/lib/studio/video/types";
import { cn } from "@/lib/utils";

type StudioVideoPanelProps = {
  projectId: string;
  storyboardComplete: boolean;
  hasScript: boolean;
  initialVideo: VideoProjectState;
  onUpdate: (video: VideoProjectState) => void;
};

function stepStatusVariant(
  status: string,
): "default" | "electric" | "outline" {
  if (status === "completed") return "electric";
  if (status === "running") return "default";
  return "outline";
}

export function StudioVideoPanel({
  projectId,
  storyboardComplete,
  hasScript,
  initialVideo,
  onUpdate,
}: StudioVideoPanelProps) {
  const [video, setVideo] = useState(initialVideo);
  const [selectedVoice, setSelectedVoice] = useState("onyx");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setVideo(initialVideo);
  }, [initialVideo]);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/studio/projects/${projectId}/video`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(await parseApiError(response, "Failed to refresh video."));
    }
    const payload = (await response.json()) as { video: VideoProjectState };
    setVideo(payload.video);
    onUpdate(payload.video);
    return payload.video;
  }, [projectId, onUpdate]);

  useEffect(() => {
    if (!video.isGenerating) return;

    const intervalId = window.setInterval(() => {
      void refresh().catch(() => undefined);
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [video.isGenerating, refresh]);

  async function runStep(step: VideoStep, regenerate = false) {
    setBusy(true);
    setActionError(null);
    try {
      const response = await fetch(
        `/api/studio/projects/${projectId}/video/${step}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voice: selectedVoice, regenerate }),
        },
      );
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Video step failed."));
      }
      const payload = (await response.json()) as { video: VideoProjectState };
      setVideo(payload.video);
      onUpdate(payload.video);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Video step failed.",
      );
      void refresh();
    } finally {
      setBusy(false);
    }
  }

  async function startFullPipeline() {
    setBusy(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/studio/projects/${projectId}/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice: selectedVoice, inline: true }),
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to start video pipeline."),
        );
      }
      const payload = (await response.json()) as { video: VideoProjectState };
      setVideo(payload.video);
      onUpdate(payload.video);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Pipeline failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function buildExport() {
    setBusy(true);
    setActionError(null);
    try {
      const response = await fetch(
        `/api/studio/projects/${projectId}/video/export`,
        { method: "POST" },
      );
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Export failed."));
      }
      window.location.href = `/api/studio/projects/${projectId}/video/export`;
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  const canGenerate = storyboardComplete && hasScript;
  const renderComplete = video.videoProgress.render === "completed";

  return (
    <section id="generate-video" className={cn(studioGlass, "overflow-hidden p-6")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-electric" />
            <h2 className="text-lg font-semibold tracking-tight">Generate Video</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Voiceover → scene images → captions → Remotion render
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={!canGenerate || busy || video.isGenerating}
          onClick={() => void startFullPipeline()}
        >
          <Film className="h-4 w-4" />
          Generate full video
        </Button>
      </div>

      {!canGenerate && (
        <div className="mt-4">
          <StudioAlert variant="warning">
            Complete the script and storyboard before generating video.
          </StudioAlert>
        </div>
      )}

      {actionError && (
        <div className="mt-4">
          <StudioAlert variant="error">{actionError}</StudioAlert>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {VIDEO_STEPS.map((step) => (
          <Badge
            key={step}
            variant={stepStatusVariant(video.videoProgress[step])}
            className="border-white/[0.1]"
          >
            {VIDEO_STEP_LABELS[step]}
            {video.videoProgress[step] === "running" && "…"}
          </Badge>
        ))}
      </div>

      {video.isGenerating && (
        <div className="mt-4">
          <StudioLoadingState label="Video pipeline running…" />
          {video.video.progress > 0 && video.video.progress < 100 && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-electric transition-all duration-500"
                style={{ width: `${video.video.progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-6 space-y-6">
        <VideoStepCard
          title="Voiceover"
          icon={<Mic className="h-4 w-4" />}
          status={video.videoProgress.voiceover}
          onRun={() => void runStep("voiceover")}
          onRegenerate={() => void runStep("voiceover", true)}
          disabled={!canGenerate || busy}
        >
          <div className="space-y-3">
            <label className="block space-y-1.5">
              <span className={studioLabel}>Narrator voice</span>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm"
                disabled={busy}
              >
                {OPENAI_TTS_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
            {video.voiceover.audioUrl && (
              <audio controls className="w-full" src={video.voiceover.audioUrl}>
                <track kind="captions" />
              </audio>
            )}
            {video.voiceover.textPreview && (
              <StudioInfoBlock
                title="Preview"
                content={`${video.voiceover.textPreview}…`}
              />
            )}
          </div>
        </VideoStepCard>

        <VideoStepCard
          title="Scene Images"
          icon={<ImageIcon className="h-4 w-4" />}
          status={video.videoProgress.scene_images}
          onRun={() => void runStep("scene_images")}
          onRegenerate={() => void runStep("scene_images", true)}
          disabled={!canGenerate || busy}
        >
          {video.sceneImages.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {video.sceneImages.map((scene) => (
                <div
                  key={scene.sceneId}
                  className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="relative aspect-video bg-black/40">
                    {scene.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={scene.imageUrl}
                        alt={scene.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        Pending
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <p className="truncate text-xs font-medium">
                      Scene {scene.sceneNumber}: {scene.title}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await fetch(
                            `/api/studio/projects/${projectId}/video/scenes/${scene.sceneId}/image`,
                            { method: "POST" },
                          );
                          await refresh();
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <StudioEmptyState
              icon={ImageIcon}
              variant="purple"
              title="No scene images"
              description="AI images will be generated from storyboard prompts."
            />
          )}
        </VideoStepCard>

        <VideoStepCard
          title="Captions"
          icon={<Subtitles className="h-4 w-4" />}
          status={video.videoProgress.captions}
          onRun={() => void runStep("captions")}
          onRegenerate={() => void runStep("captions", true)}
          disabled={!canGenerate || busy}
        >
          {video.captions.srtUrl ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {video.captions.wordCount} words · SRT ready
              </p>
              <a
                href={video.captions.srtUrl}
                className="text-sm text-electric hover:underline"
              >
                Download SRT
              </a>
            </div>
          ) : (
            <StudioEmptyState
              icon={Subtitles}
              variant="electric"
              title="No captions yet"
              description="Word-timed subtitles are generated from your script."
            />
          )}
        </VideoStepCard>

        <VideoStepCard
          title="Video Render"
          icon={<Film className="h-4 w-4" />}
          status={video.videoProgress.render}
          onRun={() => void runStep("render")}
          onRegenerate={() => void runStep("render", true)}
          disabled={!canGenerate || busy}
        >
          {renderComplete && video.video.videoUrl ? (
            <div className="space-y-4">
              <video
                controls
                className="w-full rounded-xl border border-white/[0.08] bg-black"
                src={video.video.videoUrl}
              >
                <track kind="captions" />
              </video>
              <div className="flex flex-wrap gap-2">
                <a href={video.video.videoUrl}>
                  <Button type="button" variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Download MP4
                  </Button>
                </a>
                {video.captions.srtUrl && (
                  <a href={video.captions.srtUrl}>
                    <Button type="button" variant="ghost" size="sm">
                      Download SRT
                    </Button>
                  </a>
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={busy}
                  onClick={() => void buildExport()}
                >
                  <Download className="h-4 w-4" />
                  Export ZIP
                </Button>
              </div>
              {video.video.durationSec != null && (
                <p className="text-xs text-muted-foreground">
                  Duration: {Math.floor(video.video.durationSec / 60)}:
                  {String(video.video.durationSec % 60).padStart(2, "0")} ·{" "}
                  {video.video.provider}
                </p>
              )}
            </div>
          ) : video.videoProgress.render === "running" ? (
            <StudioLoadingState label="Rendering with Remotion…" />
          ) : (
            <StudioEmptyState
              icon={Film}
              variant="purple"
              title="No video yet"
              description="Remotion composites images, narration, captions, and music."
            />
          )}
        </VideoStepCard>
      </div>
    </section>
  );
}

function VideoStepCard({
  title,
  icon,
  status,
  onRun,
  onRegenerate,
  disabled,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  status: string;
  onRun: () => void;
  onRegenerate: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const isComplete = status === "completed";
  const isRunning = status === "running";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <h3 className="text-sm font-semibold">{title}</h3>
          <Badge variant={stepStatusVariant(status)} className="text-[10px]">
            {status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isRunning}
            onClick={onRun}
          >
            {isComplete ? "Re-run" : "Run"}
          </Button>
          {isComplete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || isRunning}
              onClick={onRegenerate}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
