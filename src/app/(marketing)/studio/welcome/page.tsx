import type { Metadata } from "next";
import { StudioShell } from "@/components/studio/studio-ui";
import { StudioLandingDemo } from "@/components/studio/landing/StudioLandingDemo";
import { StudioLandingFAQ } from "@/components/studio/landing/StudioLandingFAQ";
import { StudioLandingFinalCta } from "@/components/studio/landing/StudioLandingFinalCta";
import { StudioLandingHero } from "@/components/studio/landing/StudioLandingHero";
import { StudioLandingPricing } from "@/components/studio/landing/StudioLandingPricing";
import { StudioLandingTestimonials } from "@/components/studio/landing/StudioLandingTestimonials";
import { StudioLandingWorkflow } from "@/components/studio/landing/StudioLandingWorkflow";

const TITLE = "SolePrompt Studio — YouTube Content Packages in Minutes";
const DESCRIPTION =
  "Turn one video idea into research, script, storyboard, thumbnail concepts, and SEO. Start free with 3 projects/month. SolePrompt Studio Pro at $49/mo for unlimited YouTube-ready packages.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    siteName: "SolePrompt Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function StudioWelcomePage() {
  return (
    <div className="dark bg-black text-foreground">
      <StudioShell>
        <StudioLandingHero />
        <StudioLandingWorkflow />
        <StudioLandingDemo />
        <StudioLandingPricing />
        <StudioLandingTestimonials />
        <StudioLandingFAQ />
        <StudioLandingFinalCta />
      </StudioShell>
    </div>
  );
}
