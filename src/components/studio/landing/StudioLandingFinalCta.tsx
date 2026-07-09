"use client";

import { ArrowRight, Users } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { StudioGlassCard } from "@/components/studio/studio-ui";

export function StudioLandingFinalCta() {
  return (
    <section className="border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8 lg:pb-32">
      <div className="mx-auto max-w-3xl">
        <StudioGlassCard glow className="p-8 text-center sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple/50 to-transparent"
          />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to ship your next video faster?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Join creators using SolePrompt Studio to go from idea to
            YouTube-ready package in minutes — not days.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <SignUpButton mode="redirect" forceRedirectUrl="/studio/projects">
              <Button size="lg">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </SignUpButton>
            <a href="#demo">
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </a>
          </div>

          <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-electric" />
            Trusted by YouTube creators shipping weekly content
          </p>
        </StudioGlassCard>
      </div>
    </section>
  );
}
