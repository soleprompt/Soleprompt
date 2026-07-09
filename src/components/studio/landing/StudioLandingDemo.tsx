"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2, Lock, Sparkles } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import {
  StudioGlassCard,
  StudioLoadingState,
  studioInput,
  studioLabel,
} from "@/components/studio/studio-ui";
import {
  generateLandingPreview,
  type StudioLandingPreview,
} from "@/lib/studio/landing-preview";

export function StudioLandingDemo() {
  const [topic, setTopic] = useState("");
  const [preview, setPreview] = useState<StudioLandingPreview | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) return;

    startTransition(() => {
      window.setTimeout(() => {
        setPreview(generateLandingPreview(trimmed));
      }, 900);
    });
  }

  return (
    <section
      id="demo"
      className="scroll-mt-20 border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-electric">
          Try it now
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          See what SolePrompt Studio generates
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Enter any video topic — no sign-in required. Preview a sample of your
          full content package.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <StudioGlassCard glow className="p-5 sm:p-8">
          <form onSubmit={handleGenerate} className="space-y-4">
            <label className="block text-left">
              <span className={studioLabel}>Your video topic</span>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. morning routines for productivity"
                className={studioInput + " mt-2"}
                maxLength={120}
              />
            </label>
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              disabled={!topic.trim() || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating preview…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Preview
                </>
              )}
            </Button>
          </form>

          {isPending && (
            <div className="mt-8">
              <StudioLoadingState
                label="Building your preview package"
                sublabel="Research → Script → Storyboard → SEO"
              />
            </div>
          )}

          {preview && !isPending && (
            <div className="mt-8 space-y-4 animate-studio-fade-in-up">
              <div className="grid gap-4 sm:grid-cols-2">
                <PreviewCard title="Title options">
                  <ul className="space-y-2 text-sm leading-relaxed">
                    {preview.titles.map((title) => (
                      <li
                        key={title}
                        className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2"
                      >
                        {title}
                      </li>
                    ))}
                  </ul>
                </PreviewCard>

                <PreviewCard title="Hook snippet">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {preview.hook}
                  </p>
                </PreviewCard>

                <PreviewCard title="Storyboard scene">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {preview.storyboardScene}
                  </p>
                </PreviewCard>

                <PreviewCard title="Thumbnail idea">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {preview.thumbnailIdea}
                  </p>
                </PreviewCard>
              </div>

              <PreviewCard title="SEO tags">
                <div className="flex flex-wrap gap-1.5">
                  {preview.seoTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-0.5 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </PreviewCard>

              <div className="rounded-2xl border border-purple/25 bg-gradient-to-r from-purple/10 to-electric/5 p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-purple/30 bg-purple/10">
                  <Lock className="h-4 w-4 text-purple" />
                </div>
                <p className="font-medium">
                  Sign up to generate your full package
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Full script, complete storyboard, all thumbnail variants, and
                  publish-ready SEO — not just a preview.
                </p>
                <SignUpButton
                  mode="redirect"
                  forceRedirectUrl="/studio/projects"
                >
                  <Button variant="secondary" size="lg" className="mt-4">
                    Start Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </SignUpButton>
              </div>
            </div>
          )}
        </StudioGlassCard>
      </div>
    </section>
  );
}

function PreviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left">
      <p className={studioLabel}>{title}</p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}
