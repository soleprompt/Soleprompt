"use client";

import {
  Clapperboard,
  Film,
  Loader2,
  Music,
  Sparkles,
  Type,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { parseApiError } from "@/lib/api-error";
import type { StoryboardSceneRecord } from "@/lib/studio/storyboard/types";
import { STORYBOARD_SCENE_FIELDS } from "@/lib/studio/storyboard/types";
import type { StudioProjectStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type StudioStoryboardTimelineProps = {
  projectId: string;
  projectStatus: StudioProjectStatus;
  hasScript: boolean;
  initialScenes?: StoryboardSceneRecord[];
};

const PIXELS_PER_SECOND = 12;
const MIN_CLIP_WIDTH = 72;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function SceneField({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm leading-relaxed focus:border-purple/50 focus:outline-none focus:ring-2 focus:ring-purple/20"
      />
    </label>
  );
}

export function StudioStoryboardTimeline({
  projectId,
  projectStatus,
  hasScript,
  initialScenes = [],
}: StudioStoryboardTimelineProps) {
  const [scenes, setScenes] = useState<StoryboardSceneRecord[]>(initialScenes);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialScenes[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<StoryboardSceneRecord | null>(
    initialScenes[0] ?? null,
  );
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const totalDuration = useMemo(
    () => scenes.reduce((sum, scene) => sum + scene.estimatedDurationSec, 0),
    [scenes],
  );

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedId) ?? null,
    [scenes, selectedId],
  );

  const loadScenes = useCallback(async () => {
    const response = await fetch(
      `/api/studio/storyboard?projectId=${encodeURIComponent(projectId)}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error(await parseApiError(response, "Failed to load storyboard."));
    }

    const payload = (await response.json()) as { scenes: StoryboardSceneRecord[] };
    setScenes(payload.scenes);

    if (payload.scenes.length > 0) {
      setSelectedId((current) => current ?? payload.scenes[0]?.id ?? null);
      setDraft((current) => current ?? payload.scenes[0] ?? null);
    }
  }, [projectId]);

  useEffect(() => {
    if (initialScenes.length === 0) {
      void loadScenes().catch(() => {
        // Empty storyboard is valid before generation.
      });
    }
  }, [initialScenes.length, loadScenes]);

  useEffect(() => {
    if (projectStatus === "storyboard_complete") {
      void loadScenes().catch(() => undefined);
    }
  }, [projectStatus, loadScenes]);

  useEffect(() => {
    if (selectedScene) {
      setDraft({ ...selectedScene });
    }
  }, [selectedScene]);

  async function handleGenerate() {
    setError(null);
    setGenerating(true);

    try {
      const response = await fetch("/api/studio/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to generate storyboard."),
        );
      }

      const payload = (await response.json()) as {
        scenes: StoryboardSceneRecord[];
      };

      setScenes(payload.scenes);
      setSelectedId(payload.scenes[0]?.id ?? null);
      setDraft(payload.scenes[0] ?? null);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Storyboard generation failed.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!draft) return;

    setSaving(true);
    setSaveMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/studio/storyboard/scenes/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          estimatedDurationSec: draft.estimatedDurationSec,
          narration: draft.narration,
          onScreenText: draft.onScreenText,
          visualDescription: draft.visualDescription,
          cameraMovement: draft.cameraMovement,
          bRollRecommendation: draft.bRollRecommendation,
          aiImagePrompt: draft.aiImagePrompt,
          aiVideoPrompt: draft.aiVideoPrompt,
          soundEffects: draft.soundEffects,
          backgroundMusicMood: draft.backgroundMusicMood,
          transitionType: draft.transitionType,
          captionText: draft.captionText,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response, "Failed to save scene."));
      }

      const payload = (await response.json()) as { scene: StoryboardSceneRecord };
      setScenes((current) =>
        current.map((scene) =>
          scene.id === payload.scene.id ? payload.scene : scene,
        ),
      );
      setDraft(payload.scene);
      setSaveMessage("Scene saved.");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const isGeneratingStatus = projectStatus === "storyboarding" || generating;
  const isComplete =
    projectStatus === "storyboard_complete" || scenes.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clapperboard className="h-5 w-5 text-purple" />
          <h2 className="text-lg font-semibold">Storyboard Timeline</h2>
          {isComplete && (
            <Badge variant="electric">{scenes.length} scenes</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasScript && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isGeneratingStatus}
              onClick={handleGenerate}
            >
              {isGeneratingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {scenes.length > 0 ? "Regenerate" : "Generate Storyboard"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {!hasScript && (
        <p className="text-sm text-muted-foreground">
          Complete script generation before creating a storyboard.
        </p>
      )}

      {scenes.length === 0 && hasScript && !isGeneratingStatus && (
        <div className="rounded-2xl border border-dashed border-border bg-background/40 px-6 py-10 text-center">
          <Film className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No storyboard yet. Generate scenes from your completed script.
          </p>
        </div>
      )}

      {scenes.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-[#0d0d12]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-muted-foreground">
              <span>Timeline — {formatTime(totalDuration)} total</span>
              <span className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Film className="h-3 w-3" /> Video
                </span>
                <span className="inline-flex items-center gap-1">
                  <Volume2 className="h-3 w-3" /> Audio
                </span>
                <span className="inline-flex items-center gap-1">
                  <Type className="h-3 w-3" /> Text
                </span>
              </span>
            </div>

            <div className="overflow-x-auto p-4">
              <div
                className="relative min-w-max"
                style={{ width: Math.max(totalDuration * PIXELS_PER_SECOND + 48, 320) }}
              >
                <div className="mb-3 flex h-6 items-end border-b border-white/10 pb-1">
                  {Array.from({ length: Math.ceil(totalDuration / 5) + 1 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="shrink-0 text-[10px] text-muted-foreground"
                        style={{ width: 5 * PIXELS_PER_SECOND }}
                      >
                        {formatTime(index * 5)}
                      </div>
                    ),
                  )}
                </div>

                <div className="relative space-y-2">
                  <div className="flex h-16 items-stretch gap-1">
                    {scenes.map((scene) => {
                      const width = Math.max(
                        scene.estimatedDurationSec * PIXELS_PER_SECOND,
                        MIN_CLIP_WIDTH,
                      );
                      const isSelected = scene.id === selectedId;

                      return (
                        <button
                          key={scene.id}
                          type="button"
                          onClick={() => {
                            setSelectedId(scene.id);
                            setDraft({ ...scene });
                          }}
                          className={cn(
                            "group relative flex shrink-0 flex-col justify-between overflow-hidden rounded-lg border px-2 py-1.5 text-left transition-all",
                            isSelected
                              ? "border-purple bg-purple/20 shadow-lg shadow-purple/20"
                              : "border-white/10 bg-white/5 hover:border-purple/40 hover:bg-white/10",
                          )}
                          style={{ width }}
                        >
                          <span className="truncate text-[11px] font-semibold text-white">
                            {scene.sceneNumber}. {scene.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {scene.estimatedDurationSec}s · {scene.transitionType}
                          </span>
                          <span className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple to-electric opacity-80" />
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex h-8 items-center gap-1 opacity-70">
                    {scenes.map((scene) => {
                      const width = Math.max(
                        scene.estimatedDurationSec * PIXELS_PER_SECOND,
                        MIN_CLIP_WIDTH,
                      );

                      return (
                        <div
                          key={`${scene.id}-audio`}
                          className="flex shrink-0 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2"
                          style={{ width }}
                        >
                          <Music className="h-3 w-3 text-emerald-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {draft && (
            <div className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">
                    Scene {draft.sceneNumber}: {draft.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {draft.estimatedDurationSec}s · {draft.cameraMovement}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {saveMessage && (
                    <span className="text-sm text-electric">{saveMessage}</span>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save scene"
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <SceneField
                  label="Title"
                  value={draft.title}
                  onChange={(value) => setDraft({ ...draft, title: value })}
                  rows={1}
                />
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Duration (seconds)
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={draft.estimatedDurationSec}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        estimatedDurationSec: Number(event.target.value) || 1,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm focus:border-purple/50 focus:outline-none focus:ring-2 focus:ring-purple/20"
                  />
                </label>

                {STORYBOARD_SCENE_FIELDS.map((field) => (
                  <SceneField
                    key={field.key}
                    label={field.label}
                    value={draft[field.key]}
                    onChange={(value) =>
                      setDraft({ ...draft, [field.key]: value })
                    }
                    rows={
                      field.key === "aiImagePrompt" ||
                      field.key === "aiVideoPrompt" ||
                      field.key === "visualDescription"
                        ? 3
                        : 2
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
