"use client";

import { Loader2, Rocket, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StudioTemplatePicker } from "@/components/studio/StudioTemplatePicker";
import {
  StudioAlert,
  StudioGlassCard,
  studioChip,
  studioInput,
  studioLabel,
} from "@/components/studio/studio-ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { parseApiError } from "@/lib/api-error";
import type { StudioProjectTemplateId } from "@/lib/studio/templates";
import {
  STUDIO_TONE_LABELS,
  STUDIO_TONES,
  STUDIO_VIDEO_TYPES,
  STUDIO_VIDEO_TYPE_LABELS,
  type StudioTone,
  type StudioVideoType,
} from "@/lib/studio/types";
import { cn } from "@/lib/utils";

type StudioProjectFormProps = {
  canCreateProject?: boolean;
  remainingProjects?: number | null;
};

export function StudioProjectForm({
  canCreateProject = true,
  remainingProjects = null,
}: StudioProjectFormProps) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [videoType, setVideoType] = useState<StudioVideoType>("long-form");
  const [tone, setTone] = useState<StudioTone>("educational");
  const [topicPlaceholder, setTopicPlaceholder] = useState(
    "e.g. How AI side hustles work in 2026",
  );
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<StudioProjectTemplateId | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!canCreateProject) {
      setError(
        "You've reached your free project limit for this month. Upgrade to create more.",
      );
      return;
    }

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
          templateId: selectedTemplateId ?? undefined,
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
    <div className="space-y-5">
      <StudioTemplatePicker
        selectedId={selectedTemplateId}
        disabled={loading || !canCreateProject}
        onSelect={(template) => {
          if (!template) {
            setSelectedTemplateId(null);
            setTopicPlaceholder("e.g. How AI side hustles work in 2026");
            return;
          }

          setSelectedTemplateId(template.id);
          setNiche(template.niche);
          setVideoType(template.videoType);
          setTone(template.tone);
          setTopicPlaceholder(template.topicPlaceholder);
        }}
      />

      <StudioGlassCard glow className="p-5 sm:p-7 animate-studio-fade-in-up">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple/25 to-purple/5 text-purple">
            <Wand2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Create project</h2>
            <p className="text-sm text-muted-foreground">
              Research, script, storyboard, thumbnails & SEO — one click
            </p>
          </div>
        </div>

        {!canCreateProject && (
          <StudioAlert variant="warning" >
            You&apos;ve used all free projects this month. Upgrade below to keep
            creating.
          </StudioAlert>
        )}

        {remainingProjects !== null && canCreateProject && (
          <p className="mb-5 text-sm text-muted-foreground">
            {remainingProjects} free project{remainingProjects === 1 ? "" : "s"}{" "}
            remaining this month.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="project-topic" className={studioLabel}>
              Video topic <span className="text-purple">*</span>
            </label>
            <Input
              id="project-topic"
              placeholder={topicPlaceholder}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              maxLength={200}
              disabled={loading || !canCreateProject}
              required
              className="border-white/[0.08] bg-black/30 focus:border-purple/40 focus:ring-purple/20"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="project-niche" className={studioLabel}>
              Niche
            </label>
            <Input
              id="project-niche"
              placeholder="e.g. Personal finance, tech, fitness"
              value={niche}
              onChange={(event) => setNiche(event.target.value)}
              maxLength={120}
              disabled={loading || !canCreateProject}
              className="border-white/[0.08] bg-black/30 focus:border-purple/40 focus:ring-purple/20"
            />
          </div>

          <div className="space-y-2">
            <span className={studioLabel}>Video type</span>
            <div className="flex flex-wrap gap-2">
              {STUDIO_VIDEO_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={loading || !canCreateProject}
                  onClick={() => setVideoType(type)}
                  className={studioChip(videoType === type)}
                >
                  {STUDIO_VIDEO_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="project-tone" className={studioLabel}>
              Tone
            </label>
            <select
              id="project-tone"
              value={tone}
              onChange={(event) => setTone(event.target.value as StudioTone)}
              disabled={loading || !canCreateProject}
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
            variant="secondary"
            size="lg"
            className="w-full shadow-[0_0_32px_rgba(139,92,246,0.25)] sm:w-auto"
            disabled={loading || !canCreateProject}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating project…
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Create Project
              </>
            )}
          </Button>
        </form>
      </StudioGlassCard>
    </div>
  );
}
