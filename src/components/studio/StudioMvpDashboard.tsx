"use client";

import {
  ArrowLeft,
  BarChart3,
  Clapperboard,
  FileText,
  ImageIcon,
  Loader2,
  Mic,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StudioMvpProgress } from "@/components/studio/StudioMvpProgress";
import { StudioProductionFlow } from "@/components/studio/StudioProductionFlow";
import { StudioMvpSection } from "@/components/studio/StudioMvpSection";
import { StudioStoryboardTimeline } from "@/components/studio/StudioStoryboardTimeline";
import {
  StudioAlert,
  StudioBrandPill,
  StudioEmptyState,
  StudioInfoBlock,
  StudioLoadingState,
  StudioTagBlock,
  studioGlass,
  studioInput,
  studioLabel,
} from "@/components/studio/studio-ui";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { parseApiError } from "@/lib/api-error";
import {
  MVP_STEPS,
  type MvpProjectState,
  type MvpStep,
} from "@/lib/studio/projects/mvp-types";
import type { StudioGeneratedContent } from "@/lib/studio/types";
import type { StudioResearchRecord } from "@/lib/studio/research/types";
import type { MvpVoiceoverState } from "@/lib/studio/voiceover/types";
import { cn } from "@/lib/utils";

type StudioMvpDashboardProps = {
  initialState: MvpProjectState;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function formatList(items: string[]) {
  return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
}

function formatResearchExport(research: StudioResearchRecord) {
  return [
    `# Research: ${research.topic}`,
    "",
    "## Target audience",
    research.targetAudience,
    "",
    "## Search intent",
    research.searchIntent,
    "",
    "## Viral hooks",
    formatList(research.viralHooks),
    "",
    "## Trending angles",
    formatList(research.trendingVideoAngles),
    "",
    "## Long-tail keywords",
    research.longTailKeywords.join(", "),
    "",
    "## Questions people ask",
    formatList(research.questionsPeopleAsk),
    "",
    "## Emotional triggers",
    research.emotionalTriggers.join(", "),
    "",
    "## Retention opportunities",
    formatList(research.retentionOpportunities),
    "",
    "## Suggested CTA",
    research.suggestedCta,
  ].join("\n");
}

function formatScriptExport(script: StudioGeneratedContent) {
  const sections = script.mainSections
    .map(
      (section) =>
        `### ${section.heading}\n${section.content}${section.retentionTip ? `\n_Retention tip: ${section.retentionTip}_` : ""}`,
    )
    .join("\n\n");

  return [
    "# Video Script",
    "",
    "## Hook",
    script.hook,
    "",
    "## Intro",
    script.intro,
    "",
    sections,
    "",
    "## Outro",
    script.outro,
    "",
    "## Call to action",
    script.callToAction,
    "",
    "---",
    "",
    script.script,
  ].join("\n");
}

function formatStoryboardExport(state: MvpProjectState) {
  return state.scenes
    .map(
      (scene) =>
        `## Scene ${scene.sceneNumber}: ${scene.title} (${scene.estimatedDurationSec}s)\n\n` +
        `**Narration:** ${scene.narration}\n\n` +
        `**Visual:** ${scene.visualDescription}\n\n` +
        `**On-screen text:** ${scene.onScreenText}\n\n` +
        `**AI image prompt:** ${scene.aiImagePrompt}`,
    )
    .join("\n\n---\n\n");
}

function formatThumbnailExport(state: MvpProjectState) {
  return state.thumbnails
    .map(
      (thumb, index) =>
        `${index + 1}. ${thumb.title}${thumb.isPrimary ? " (Primary)" : ""}`,
    )
    .join("\n");
}

function formatSeoExport(state: MvpProjectState) {
  if (!state.seo) return "";
  return [
    "# SEO Package",
    "",
    "## Title options",
    formatList(state.seo.titles),
    "",
    "## Description",
    state.seo.description,
    "",
    "## Tags",
    state.seo.tags.join(", "),
    "",
    "## Pinned comment",
    state.seo.pinnedComment,
  ].join("\n");
}

function Field({
  label,
  value,
  onChange,
  rows = 3,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className={studioLabel}>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className={studioInput}
      />
    </label>
  );
}

function ListField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <Field
      label={label}
      value={items.join("\n")}
      rows={4}
      onChange={(value) =>
        onChange(
          value
            .split("\n")
            .map((line) => line.replace(/^\d+\.\s*/, "").trim())
            .filter(Boolean),
        )
      }
    />
  );
}

export function StudioMvpDashboard({ initialState }: StudioMvpDashboardProps) {
  const [mvp, setMvp] = useState<MvpProjectState>(initialState);
  const [pollingError, setPollingError] = useState<string | null>(null);

  const researchDraft = useRef<Partial<StudioResearchRecord>>({});
  const scriptDraft = useRef<StudioGeneratedContent | null>(null);
  const thumbnailDraft = useRef<{ id: string; title: string }[]>([]);
  const seoDraft = useRef<MvpProjectState["seo"]>(null);

  const isGenerating = useMemo(
    () => MVP_STEPS.some((step) => mvp.mvpProgress[step] === "running"),
    [mvp.mvpProgress],
  );

  const isComplete = useMemo(
    () => MVP_STEPS.every((step) => mvp.mvpProgress[step] === "completed"),
    [mvp.mvpProgress],
  );

  const hasScript = Boolean(mvp.script);
  const isVoiceoverGenerating = mvp.voiceover.status === "generating";

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/studio/projects/${mvp.projectId}/mvp`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(await parseApiError(response, "Failed to refresh project."));
    }
    const payload = (await response.json()) as { mvp: MvpProjectState };
    setMvp(payload.mvp);
    setPollingError(null);
  }, [mvp.projectId]);

  useEffect(() => {
    if (isComplete && !isGenerating) return;

    let cancelled = false;

    async function poll() {
      try {
        if (!cancelled) await refresh();
      } catch (error) {
        if (!cancelled) {
          setPollingError(
            error instanceof Error ? error.message : "Polling failed.",
          );
        }
      }
    }

    const intervalId = window.setInterval(poll, 2500);
    void poll();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isComplete, isGenerating, refresh]);

  useEffect(() => {
    if (!isVoiceoverGenerating) return;

    let cancelled = false;

    async function pollVoiceover() {
      try {
        const response = await fetch(
          `/api/studio/projects/${mvp.projectId}/voiceover`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as { voiceover: MvpVoiceoverState };
        if (!cancelled && payload.voiceover.status !== "generating") {
          setMvp((current) => ({ ...current, voiceover: payload.voiceover }));
        }
      } catch {
        // ignore transient polling errors
      }
    }

    const intervalId = window.setInterval(pollVoiceover, 2000);
    void pollVoiceover();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isVoiceoverGenerating, mvp.projectId]);

  async function regenerate(step: MvpStep) {
    const response = await fetch(
      `/api/studio/projects/${mvp.projectId}/regenerate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step }),
      },
    );
    if (!response.ok) {
      throw new Error(await parseApiError(response, "Regeneration failed."));
    }
    const payload = (await response.json()) as { mvp: MvpProjectState };
    setMvp(payload.mvp);
  }

  async function saveSection(step: MvpStep, data: unknown) {
    const response = await fetch(`/api/studio/projects/${mvp.projectId}/mvp`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step, data }),
    });
    if (!response.ok) {
      throw new Error(await parseApiError(response, "Failed to save changes."));
    }
    const payload = (await response.json()) as { mvp: MvpProjectState };
    setMvp(payload.mvp);
  }

  const slug = slugify(mvp.topic);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      <header className="space-y-5 animate-studio-fade-in-up">
        <Link href="/studio/projects">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            SolePrompt Studio Projects
          </Button>
        </Link>

        <div className="space-y-4">
          <StudioBrandPill>
            <Sparkles className="h-3.5 w-3.5" />
            SolePrompt Studio
          </StudioBrandPill>
          <h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {mvp.topic}
          </h1>
          <div className="flex flex-wrap gap-2">
            {mvp.niche && (
              <Badge variant="outline" className="border-white/[0.1] bg-white/[0.03]">
                {mvp.niche}
              </Badge>
            )}
            <Badge variant="outline" className="border-white/[0.1] bg-white/[0.03]">
              {mvp.videoType}
            </Badge>
            {mvp.tone && (
              <Badge variant="outline" className="border-white/[0.1] bg-white/[0.03]">
                {mvp.tone}
              </Badge>
            )}
            {isComplete && (
              <Badge variant="electric" className="shadow-[0_0_16px_rgba(0,102,255,0.25)]">
                Ready to publish
              </Badge>
            )}
          </div>
        </div>
      </header>

      {pollingError && <StudioAlert variant="warning">{pollingError}</StudioAlert>}

      {mvp.error && <StudioAlert variant="error">{mvp.error}</StudioAlert>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:items-start">
        <StudioMvpProgress progress={mvp.mvpProgress} activeStep={mvp.activeStep} />
        <StudioProductionFlow
          mode="live"
          progress={mvp.mvpProgress}
          activeStep={mvp.activeStep}
          topic={mvp.topic}
          compact
          className="lg:sticky lg:top-6"
        />
      </div>

      <div className="space-y-6">
        <StudioMvpSection
          id="research"
          title="Research"
          icon={<Search className="h-4 w-4" />}
          status={mvp.mvpProgress.research}
          exportText={mvp.research ? formatResearchExport(mvp.research) : ""}
          exportFilename={`${slug}-research.txt`}
          onRegenerate={() => regenerate("research")}
          onSave={
            mvp.research
              ? async () => {
                  await saveSection("research", researchDraft.current);
                }
              : undefined
          }
          editContent={
            mvp.research ? (
              <ResearchEditForm
                research={mvp.research}
                onChange={(draft) => {
                  researchDraft.current = draft;
                }}
              />
            ) : undefined
          }
        >
          {mvp.research ? (
            <ResearchView research={mvp.research} />
          ) : (
            <StudioEmptyState
              icon={Search}
              variant="purple"
              title="Research pending"
              description="Research insights will appear here once generation starts."
            />
          )}
        </StudioMvpSection>

        <StudioMvpSection
          id="script"
          title="Script"
          icon={<FileText className="h-4 w-4" />}
          status={mvp.mvpProgress.script}
          exportText={mvp.script ? formatScriptExport(mvp.script) : ""}
          exportFilename={`${slug}-script.txt`}
          onRegenerate={() => regenerate("script")}
          onSave={
            mvp.script
              ? async () => {
                  if (scriptDraft.current) {
                    await saveSection("script", scriptDraft.current);
                  }
                }
              : undefined
          }
          editContent={
            mvp.script ? (
              <ScriptEditForm
                script={mvp.script}
                onChange={(draft) => {
                  scriptDraft.current = draft;
                }}
              />
            ) : undefined
          }
        >
          {mvp.script ? (
            <ScriptView script={mvp.script} />
          ) : (
            <StudioEmptyState
              icon={FileText}
              variant="purple"
              title="Script pending"
              description="Your full video script will appear here."
            />
          )}
        </StudioMvpSection>

        <StudioVoiceoverSection
          projectId={mvp.projectId}
          voiceover={mvp.voiceover}
          hasScript={hasScript}
          onUpdate={(voiceover) => setMvp((current) => ({ ...current, voiceover }))}
        />

        <StudioMvpSection
          id="storyboard"
          title="Storyboard"
          icon={<Clapperboard className="h-4 w-4" />}
          status={mvp.mvpProgress.storyboard}
          exportText={mvp.scenes.length > 0 ? formatStoryboardExport(mvp) : ""}
          exportFilename={`${slug}-storyboard.txt`}
          onRegenerate={() => regenerate("storyboard")}
        >
          {mvp.scenes.length > 0 ? (
            <StudioStoryboardTimeline
              key={`${mvp.mvpProgress.storyboard}-${mvp.scenes.map((s) => s.id).join("-")}`}
              projectId={mvp.projectId}
              projectStatus={mvp.status as "completed"}
              hasScript={Boolean(mvp.script)}
              initialScenes={mvp.scenes}
            />
          ) : mvp.mvpProgress.storyboard === "completed" ? (
            <StudioEmptyState
              icon={Clapperboard}
              variant="purple"
              title="No scenes"
              description="Storyboard generation completed but no scenes were created."
            />
          ) : (
            <StudioEmptyState
              icon={Clapperboard}
              variant="purple"
              title="Storyboard pending"
              description="Scene-by-scene storyboard will appear here."
            />
          )}
        </StudioMvpSection>

        <StudioMvpSection
          id="thumbnail"
          title="Thumbnail Concepts"
          icon={<ImageIcon className="h-4 w-4" />}
          status={mvp.mvpProgress.thumbnail}
          exportText={mvp.thumbnails.length > 0 ? formatThumbnailExport(mvp) : ""}
          exportFilename={`${slug}-thumbnails.txt`}
          onRegenerate={() => regenerate("thumbnail")}
          onSave={
            mvp.thumbnails.length > 0
              ? async () => {
                  await saveSection("thumbnail", thumbnailDraft.current);
                }
              : undefined
          }
          editContent={
            mvp.thumbnails.length > 0 ? (
              <ThumbnailEditForm
                thumbnails={mvp.thumbnails}
                onChange={(draft) => {
                  thumbnailDraft.current = draft;
                }}
              />
            ) : undefined
          }
        >
          {mvp.thumbnails.length > 0 ? (
            <ThumbnailView thumbnails={mvp.thumbnails} />
          ) : (
            <StudioEmptyState
              icon={ImageIcon}
              variant="electric"
              title="Thumbnails pending"
              description="Thumbnail concept ideas will appear here."
            />
          )}
        </StudioMvpSection>

        <StudioMvpSection
          id="seo"
          title="SEO Package"
          icon={<BarChart3 className="h-4 w-4" />}
          status={mvp.mvpProgress.seo}
          exportText={formatSeoExport(mvp)}
          exportFilename={`${slug}-seo.txt`}
          onRegenerate={() => regenerate("seo")}
          onSave={
            mvp.seo
              ? async () => {
                  if (seoDraft.current) {
                    await saveSection("seo", seoDraft.current);
                  }
                }
              : undefined
          }
          editContent={
            mvp.seo ? (
              <SeoEditForm
                seo={mvp.seo}
                onChange={(draft) => {
                  seoDraft.current = draft;
                }}
              />
            ) : undefined
          }
        >
          {mvp.seo ? (
            <SeoView seo={mvp.seo} />
          ) : (
            <StudioEmptyState
              icon={BarChart3}
              variant="electric"
              title="SEO pending"
              description="Titles, description, tags, and pinned comment will appear here."
            />
          )}
        </StudioMvpSection>
      </div>
    </div>
  );
}

function StudioVoiceoverSection({
  projectId,
  voiceover,
  hasScript,
  onUpdate,
}: {
  projectId: string;
  voiceover: MvpVoiceoverState;
  hasScript: boolean;
  onUpdate: (voiceover: MvpVoiceoverState) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isGenerating = generating || voiceover.status === "generating";
  const hasAudio = voiceover.status === "completed" && Boolean(voiceover.audioUrl);

  async function handleGenerate(regenerate = false) {
    setActionError(null);
    setGenerating(true);
    onUpdate({ ...voiceover, status: "generating", error: null });

    try {
      const response = await fetch(`/api/studio/projects/${projectId}/voiceover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate }),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Voiceover generation failed."));
      }
      const payload = (await response.json()) as { voiceover: MvpVoiceoverState };
      onUpdate(payload.voiceover);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Voiceover generation failed.";
      setActionError(message);
      onUpdate({
        ...voiceover,
        status: "failed",
        error: message,
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section id="voiceover" className={cn(studioGlass, "overflow-hidden p-6")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple/25 bg-purple/10 text-purple">
            <Mic className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Voiceover</h2>
            <p className="text-sm text-muted-foreground">
              AI narration from your final script
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isGenerating || !hasScript}
            onClick={() => void handleGenerate(hasAudio)}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasAudio ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            {hasAudio ? "Regenerate voiceover" : "Generate voiceover"}
          </Button>
        </div>
      </div>

      <div className="mt-5">
        {actionError && (
          <div className="mb-4">
            <StudioAlert variant="error">{actionError}</StudioAlert>
          </div>
        )}

        {voiceover.error && voiceover.status === "failed" && !actionError && (
          <div className="mb-4">
            <StudioAlert variant="error">{voiceover.error}</StudioAlert>
          </div>
        )}

        {!hasScript ? (
          <StudioEmptyState
            icon={Mic}
            variant="purple"
            title="Script required"
            description="Generate your script first — voiceover uses the full narration text."
          />
        ) : isGenerating ? (
          <StudioLoadingState label="Synthesizing voiceover…" />
        ) : hasAudio && voiceover.audioUrl ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-electric/20 bg-gradient-to-br from-electric/10 to-transparent p-5">
              <audio
                controls
                preload="metadata"
                className="w-full"
                src={voiceover.audioUrl}
              >
                Your browser does not support audio playback.
              </audio>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {voiceover.provider && (
                <span>
                  Provider: <span className="text-foreground">{voiceover.provider}</span>
                </span>
              )}
              {voiceover.voiceId && (
                <span>
                  Voice: <span className="text-foreground">{voiceover.voiceId}</span>
                </span>
              )}
              {voiceover.durationSec != null && (
                <span>
                  Est. duration:{" "}
                  <span className="text-foreground">
                    {Math.floor(voiceover.durationSec / 60)}:
                    {String(voiceover.durationSec % 60).padStart(2, "0")}
                  </span>
                </span>
              )}
            </div>
            {voiceover.textPreview && (
              <StudioInfoBlock
                title="Narration preview"
                content={`${voiceover.textPreview}${voiceover.textPreview.length >= 160 ? "…" : ""}`}
              />
            )}
          </div>
        ) : (
          <StudioEmptyState
            icon={Mic}
            variant="electric"
            title="No voiceover yet"
            description="Turn your script into a studio-quality MP3 narration with one click."
          />
        )}
      </div>
    </section>
  );
}

function ResearchView({ research }: { research: StudioResearchRecord }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StudioInfoBlock title="Target audience" content={research.targetAudience} />
      <StudioInfoBlock title="Search intent" content={research.searchIntent} />
      <StudioTagBlock title="Viral hooks" items={research.viralHooks} />
      <StudioTagBlock title="Trending angles" items={research.trendingVideoAngles} />
      <StudioTagBlock title="Long-tail keywords" items={research.longTailKeywords} />
      <StudioTagBlock title="Questions people ask" items={research.questionsPeopleAsk} />
      <StudioInfoBlock title="Suggested CTA" content={research.suggestedCta} className="sm:col-span-2" />
    </div>
  );
}

function ResearchEditForm({
  research,
  onChange,
}: {
  research: StudioResearchRecord;
  onChange: (draft: Partial<StudioResearchRecord>) => void;
}) {
  const [draft, setDraft] = useState({
    targetAudience: research.targetAudience,
    searchIntent: research.searchIntent,
    suggestedCta: research.suggestedCta,
    viralHooks: research.viralHooks,
    trendingVideoAngles: research.trendingVideoAngles,
    longTailKeywords: research.longTailKeywords,
    questionsPeopleAsk: research.questionsPeopleAsk,
  });

  function update(patch: Partial<typeof draft>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    onChange(next);
  }

  useEffect(() => {
    onChange(draft);
    // Seed save draft on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Target audience" value={draft.targetAudience} onChange={(v) => update({ targetAudience: v })} />
      <Field label="Search intent" value={draft.searchIntent} onChange={(v) => update({ searchIntent: v })} />
      <ListField label="Viral hooks" items={draft.viralHooks} onChange={(v) => update({ viralHooks: v })} />
      <ListField label="Trending angles" items={draft.trendingVideoAngles} onChange={(v) => update({ trendingVideoAngles: v })} />
      <ListField label="Long-tail keywords" items={draft.longTailKeywords} onChange={(v) => update({ longTailKeywords: v })} />
      <ListField label="Questions people ask" items={draft.questionsPeopleAsk} onChange={(v) => update({ questionsPeopleAsk: v })} />
      <Field label="Suggested CTA" value={draft.suggestedCta} onChange={(v) => update({ suggestedCta: v })} className="sm:col-span-2" />
    </div>
  );
}

function ScriptView({ script }: { script: StudioGeneratedContent }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-purple/20 bg-gradient-to-br from-purple/10 to-transparent p-5">
        <p className={studioLabel}>Hook</p>
        <p className="mt-2 text-sm leading-relaxed">{script.hook}</p>
      </div>
      {script.mainSections.map((section) => (
        <div
          key={section.heading}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <h3 className="text-sm font-semibold">{section.heading}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {section.content}
          </p>
        </div>
      ))}
      <div className="rounded-xl border border-dashed border-white/[0.08] bg-black/20 p-5">
        <p className={studioLabel}>Full script</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {script.script}
        </p>
      </div>
    </div>
  );
}

function ScriptEditForm({
  script,
  onChange,
}: {
  script: StudioGeneratedContent;
  onChange: (draft: StudioGeneratedContent) => void;
}) {
  const [draft, setDraft] = useState(script);

  useEffect(() => {
    onChange(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <Field label="Hook" value={draft.hook} onChange={(v) => { const next = { ...draft, hook: v }; setDraft(next); onChange(next); }} />
      <Field label="Intro" value={draft.intro} onChange={(v) => { const next = { ...draft, intro: v }; setDraft(next); onChange(next); }} rows={2} />
      <Field label="Full script" value={draft.script} onChange={(v) => { const next = { ...draft, script: v }; setDraft(next); onChange(next); }} rows={12} />
      <Field label="Outro" value={draft.outro} onChange={(v) => { const next = { ...draft, outro: v }; setDraft(next); onChange(next); }} rows={2} />
      <Field label="Call to action" value={draft.callToAction} onChange={(v) => { const next = { ...draft, callToAction: v }; setDraft(next); onChange(next); }} />
    </div>
  );
}

function ThumbnailView({
  thumbnails,
}: {
  thumbnails: MvpProjectState["thumbnails"];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {thumbnails.map((thumb, index) => (
        <div
          key={thumb.id}
          className={cn(
            "group relative overflow-hidden rounded-xl border p-4 transition-all duration-300",
            thumb.isPrimary
              ? "border-electric/30 bg-gradient-to-br from-electric/10 to-transparent shadow-[0_0_24px_rgba(0,102,255,0.1)]"
              : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]",
          )}
        >
          <div className="relative mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple/15 via-black/40 to-electric/15">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
            <ImageIcon className="relative h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-medium">{thumb.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Concept {index + 1}
            {thumb.isPrimary && " · Primary pick"}
          </p>
        </div>
      ))}
    </div>
  );
}

function ThumbnailEditForm({
  thumbnails,
  onChange,
}: {
  thumbnails: MvpProjectState["thumbnails"];
  onChange: (draft: { id: string; title: string }[]) => void;
}) {
  const [draft, setDraft] = useState(thumbnails.map((t) => ({ id: t.id, title: t.title })));

  useEffect(() => {
    onChange(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      {draft.map((thumb, index) => (
        <Field
          key={thumb.id}
          label={`Concept ${index + 1}`}
          value={thumb.title}
          onChange={(value) => {
            const next = draft.map((item) =>
              item.id === thumb.id ? { ...item, title: value } : item,
            );
            setDraft(next);
            onChange(next);
          }}
          rows={2}
        />
      ))}
    </div>
  );
}

function SeoView({ seo }: { seo: NonNullable<MvpProjectState["seo"]> }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className={studioLabel}>Title options</p>
        <ol className="mt-2.5 space-y-2">
          {seo.titles.map((title, i) => (
            <li key={title} className="flex gap-2 text-sm">
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-medium">{title}</span>
            </li>
          ))}
        </ol>
      </div>
      <StudioInfoBlock title="Description" content={seo.description} />
      <StudioTagBlock title="Tags" items={seo.tags} />
      <StudioInfoBlock title="Pinned comment" content={seo.pinnedComment} />
    </div>
  );
}

function SeoEditForm({
  seo,
  onChange,
}: {
  seo: NonNullable<MvpProjectState["seo"]>;
  onChange: (draft: NonNullable<MvpProjectState["seo"]>) => void;
}) {
  const [draft, setDraft] = useState(seo);

  useEffect(() => {
    onChange(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <ListField
        label="Title options"
        items={draft.titles}
        onChange={(titles) => { const next = { ...draft, titles }; setDraft(next); onChange(next); }}
      />
      <Field
        label="Description"
        value={draft.description}
        onChange={(description) => { const next = { ...draft, description }; setDraft(next); onChange(next); }}
        rows={6}
      />
      <ListField
        label="Tags"
        items={draft.tags}
        onChange={(tags) => { const next = { ...draft, tags }; setDraft(next); onChange(next); }}
      />
      <Field
        label="Pinned comment"
        value={draft.pinnedComment}
        onChange={(pinnedComment) => { const next = { ...draft, pinnedComment }; setDraft(next); onChange(next); }}
        rows={3}
      />
    </div>
  );
}
