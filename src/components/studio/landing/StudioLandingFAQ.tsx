"use client";

import { Accordion } from "@/components/ui/Accordion";

const STUDIO_FAQ_ITEMS = [
  {
    id: "what-is-studio",
    question: "What is SolePrompt Studio?",
    answer:
      "SolePrompt Studio is an AI-powered production workflow for YouTube creators. Enter one topic and get research, a full script, storyboard scenes, thumbnail concepts, and SEO metadata — everything you need before hitting record.",
  },
  {
    id: "why-49",
    question: "Why should I pay $49/month for SolePrompt Studio Pro?",
    answer:
      "SolePrompt Studio Pro removes the 3-project monthly cap and unlocks unlimited packages — built for creators publishing weekly. At $49/mo, one extra video per month typically pays for itself in ad revenue or sponsorships. You also get batch workflows and advanced exports.",
  },
  {
    id: "vs-chatgpt",
    question: "How is this different from ChatGPT?",
    answer:
      "ChatGPT gives you one response at a time. SolePrompt Studio runs a structured production pipeline — each step builds on the last, tuned for YouTube format, hooks, retention, and SEO. No prompt engineering required.",
  },
  {
    id: "free-tier",
    question: "What's included in the free tier?",
    answer:
      "Free includes 3 full SolePrompt Studio projects per month with the complete workflow: research, script, storyboard, thumbnail ideas, and SEO. No credit card required to start.",
  },
  {
    id: "cancel",
    question: "Can I cancel anytime?",
    answer:
      "Yes. Paid plans are month-to-month with no long-term contract. Cancel from your account and you keep access through the end of your billing period.",
  },
  {
    id: "video-rendering",
    question: "Does SolePrompt Studio render or edit videos?",
    answer:
      "Not yet — SolePrompt Studio focuses on pre-production: the creative package before you film. You bring your own camera and editor. Video rendering is on our roadmap.",
  },
  {
    id: "channels",
    question: "Can I use SolePrompt Studio for multiple channels?",
    answer:
      "Yes. Creator and Pro plans support unlimited projects across any channels you manage. Agency ($99/mo) adds team-ready workflows and priority support for multi-channel operations.",
  },
  {
    id: "niches",
    question: "What niches does SolePrompt Studio work for?",
    answer:
      "Any YouTube niche — education, tech reviews, lifestyle, finance, gaming, and more. The workflow adapts to your topic, audience, and content style.",
  },
];

export function StudioLandingFAQ() {
  return (
    <section
      id="faq"
      className="scroll-mt-20 border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-purple">
          FAQ
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Questions about SolePrompt Studio
        </h2>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <Accordion items={STUDIO_FAQ_ITEMS} />
      </div>
    </section>
  );
}
