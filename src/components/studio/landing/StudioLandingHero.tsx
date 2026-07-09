"use client";

import { ArrowRight, Play, Sparkles } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import {
  StudioBrandPill,
  StudioGlassCard,
} from "@/components/studio/studio-ui";

export function StudioLandingHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-28 lg:pt-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-[10%] top-[5%] h-[420px] w-[420px] rounded-full bg-purple/25 blur-[100px] animate-studio-glow-pulse" />
        <div className="absolute -right-[5%] top-[20%] h-[360px] w-[360px] rounded-full bg-electric/20 blur-[90px] animate-studio-glow-pulse [animation-delay:1.2s]" />
        <div className="absolute bottom-0 left-1/2 h-[280px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-purple/10 via-electric/10 to-purple/10 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="animate-studio-fade-in-up">
              <StudioBrandPill>
                <Sparkles className="h-3.5 w-3.5" />
                SolePrompt Studio
              </StudioBrandPill>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1] animate-studio-fade-in-up studio-stagger-1">
              From One Idea to a{" "}
              <span className="bg-gradient-to-r from-purple via-electric to-electric bg-clip-text text-transparent">
                YouTube-Ready Content Package
              </span>{" "}
              in Minutes
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0 animate-studio-fade-in-up studio-stagger-2">
              SolePrompt Studio Pro ($49/mo) turns a single topic into research,
              script, storyboard, thumbnail concepts, and SEO — so you publish
              faster without juggling five AI chats.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start animate-studio-fade-in-up studio-stagger-3">
              <SignUpButton mode="redirect" forceRedirectUrl="/studio/projects">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </SignUpButton>
              <a href="#demo" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-white/10 bg-white/[0.02]"
                >
                  <Play className="h-4 w-4" />
                  Watch Demo
                </Button>
              </a>
            </div>

            <p className="mt-5 text-sm text-muted-foreground animate-studio-fade-in-up studio-stagger-4">
              3 free projects/month · No credit card · Cancel anytime
            </p>
          </div>

          <div className="animate-studio-fade-in-up studio-stagger-2">
            <StudioGlassCard glow className="p-6 sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-purple/30 blur-[60px]"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                What you get per project
              </p>
              <ul className="mt-5 space-y-3">
                {[
                  "Audience research & angle finder",
                  "Full video script with hooks",
                  "Scene-by-scene storyboard",
                  "Thumbnail concept briefs",
                  "Title, description & tag SEO",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple/20 text-purple">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-purple/20 bg-gradient-to-r from-purple/10 to-electric/5 px-4 py-3 text-center text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Pro $49/mo</span>{" "}
                — unlimited projects for channels shipping weekly
              </div>
            </StudioGlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
