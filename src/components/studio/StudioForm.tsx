"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  StudioAlert,
  StudioGlassCard,
  studioChipElectric,
  studioInput,
  studioLabel,
} from "@/components/studio/studio-ui";
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
    <StudioGlassCard glow className={cn("p-5 sm:p-7 animate-studio-fade-in-up", className)}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric/25 to-electric/5 text-electric">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Quick package</h2>
          <p className="text-sm text-muted-foreground">
            Script, titles, tags & description in one generation
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="studio-topic" className={studioLabel}>
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
            className="border-white/[0.08] bg-black/30 focus:border-electric/40 focus:ring-electric/20"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="studio-niche" className={studioLabel}>
            Niche
          </label>
          <Input
            id="studio-niche"
            placeholder="e.g. Personal finance, tech, fitness"
            value={niche}
            onChange={(event) => setNiche(event.target.value)}
            maxLength={120}
            disabled={loading}
            className="border-white/[0.08] bg-black/30 focus:border-electric/40 focus:ring-electric/20"
          />
        </div>

        <div className="space-y-2">
          <span className={studioLabel}>Video type</span>
          <div className="flex flex-wrap gap-2">
            {STUDIO_VIDEO_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                disabled={loading}
                onClick={() => setVideoType(type)}
                className={studioChipElectric(videoType === type)}
              >
                {STUDIO_VIDEO_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="studio-tone" className={studioLabel}>
            Tone
          </label>
          <select
            id="studio-tone"
            value={tone}
            onChange={(event) => setTone(event.target.value as StudioTone)}
            disabled={loading}
            className={cn(studioInput, "h-12 rounded-full px-4")}
          >
            {STUDIO_TONES.map((option) => (
              <option key={option} value={option}>
                {STUDIO_TONE_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        {error && <StudioAlert variant="error">{error}</StudioAlert>}

        <Button
          type="submit"
          size="lg"
          className="w-full shadow-[0_0_32px_rgba(0,102,255,0.25)] sm:w-auto"
          disabled={loading}
        >
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
      </form>
    </StudioGlassCard>
  );
}
