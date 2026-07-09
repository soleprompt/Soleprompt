"use client";

import { Loader2, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { parseApiError } from "@/lib/api-error";
import {
  STUDIO_TONE_LABELS,
  STUDIO_TONES,
  STUDIO_VIDEO_TYPES,
  STUDIO_VIDEO_TYPE_LABELS,
  type StudioTone,
  type StudioVideoType,
} from "@/lib/studio/types";
import { cn } from "@/lib/utils";

export function StudioProjectForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [videoType, setVideoType] = useState<StudioVideoType>("long-form");
  const [tone, setTone] = useState<StudioTone>("educational");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError("Please enter a video topic.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/studio/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: trimmedTopic,
          niche: niche.trim() || undefined,
          videoType,
          tone,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to start production project."),
        );
      }

      const payload = (await response.json()) as {
        project?: { id: string };
      };

      if (!payload.project?.id) {
        throw new Error("Project was created but no ID was returned.");
      }

      router.push(`/studio/projects/${payload.project.id}`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card/50 p-5 sm:p-6"
    >
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold">Full production pipeline</h2>
        <p className="text-sm text-muted-foreground">
          One topic in — research, script, storyboard, assets, voice, video, SEO,
          and publish prep out.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="project-topic" className="text-sm font-medium">
            Video topic <span className="text-electric">*</span>
          </label>
          <Input
            id="project-topic"
            placeholder="e.g. How AI side hustles work in 2026"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            maxLength={200}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="project-niche" className="text-sm font-medium">
            Niche
          </label>
          <Input
            id="project-niche"
            placeholder="e.g. Personal finance, tech, fitness"
            value={niche}
            onChange={(event) => setNiche(event.target.value)}
            maxLength={120}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Video type</span>
          <div className="flex flex-wrap gap-2">
            {STUDIO_VIDEO_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                disabled={loading}
                onClick={() => setVideoType(type)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  videoType === type
                    ? "border-purple bg-purple/10 text-purple"
                    : "border-border text-muted-foreground hover:border-purple/40 hover:text-foreground",
                )}
              >
                {STUDIO_VIDEO_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="project-tone" className="text-sm font-medium">
            Tone
          </label>
          <select
            id="project-tone"
            value={tone}
            onChange={(event) => setTone(event.target.value as StudioTone)}
            disabled={loading}
            className="flex h-12 w-full rounded-full border border-border bg-background/80 px-4 text-sm text-foreground backdrop-blur-sm transition-all duration-200 focus:border-purple/50 focus:outline-none focus:ring-2 focus:ring-purple/20"
          >
            {STUDIO_TONES.map((option) => (
              <option key={option} value={option}>
                {STUDIO_TONE_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting production…
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              Start YouTube Production
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
