"use client";

import { Loader2, Sparkles } from "lucide-react";
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

type StudioFormProps = {
  className?: string;
};

export function StudioForm({ className }: StudioFormProps) {
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
      const response = await fetch("/api/studio/generate", {
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
          await parseApiError(response, "Failed to generate YouTube package."),
        );
      }

      const payload = (await response.json()) as {
        package?: { id: string };
      };

      if (!payload.package?.id) {
        throw new Error("Generation succeeded but no package was returned.");
      }

      router.push(`/studio/${payload.package.id}`);
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
      className={cn(
        "rounded-2xl border border-border bg-card/50 p-5 sm:p-6",
        className,
      )}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="studio-topic" className="text-sm font-medium">
            Video topic <span className="text-electric">*</span>
          </label>
          <Input
            id="studio-topic"
            placeholder="e.g. How to use AI prompts for side hustles"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            maxLength={200}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="studio-niche" className="text-sm font-medium">
            Niche
          </label>
          <Input
            id="studio-niche"
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
                    ? "border-electric bg-electric/10 text-electric"
                    : "border-border text-muted-foreground hover:border-electric/40 hover:text-foreground",
                )}
              >
                {STUDIO_VIDEO_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="studio-tone" className="text-sm font-medium">
            Tone
          </label>
          <select
            id="studio-tone"
            value={tone}
            onChange={(event) => setTone(event.target.value as StudioTone)}
            disabled={loading}
            className="flex h-12 w-full rounded-full border border-border bg-background/80 px-4 text-sm text-foreground backdrop-blur-sm transition-all duration-200 focus:border-electric/50 focus:outline-none focus:ring-2 focus:ring-electric/20"
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

        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating package…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate YouTube Package
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
