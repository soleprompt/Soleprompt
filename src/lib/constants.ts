import type { FAQItem, Testimonial } from "@/types";

export const SITE = {
  name: "SolePrompt",
  tagline: "The Marketplace for Premium AI Prompts",
  description:
    "Discover, buy, and sell expertly crafted AI prompts. Premium quality for creators, marketers, and developers.",
  year: 2026,
} as const;

export const NAV_LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "Categories", href: "/categories" },
  { label: "Sell", href: "#sell" },
  { label: "FAQ", href: "#faq" },
] as const;

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Alexandra Kim",
    role: "Head of Growth",
    company: "ScaleUp Inc.",
    content:
      "SolePrompt cut our content production time in half. The quality of prompts here is unmatched — every purchase feels like hiring a specialist.",
    avatar: "AK",
  },
  {
    id: "2",
    name: "David Torres",
    role: "Senior Developer",
    company: "TechFlow",
    content:
      "I've sold over 200 prompts on SolePrompt. The platform makes it easy to monetize expertise I already had. Buyers love the quality.",
    avatar: "DT",
  },
  {
    id: "3",
    name: "Morgan Lee",
    role: "Creative Director",
    company: "Studio North",
    content:
      "The curation is what sets SolePrompt apart. No junk, no filler — just premium prompts that actually deliver results for our clients.",
    avatar: "ML",
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    question: "What makes SolePrompt different from free prompt libraries?",
    answer:
      "Every prompt on SolePrompt is vetted for quality, tested across multiple AI models, and backed by creator expertise. You're paying for proven results, not guesswork.",
  },
  {
    id: "2",
    question: "How do I become a seller on SolePrompt?",
    answer:
      "Apply through our seller program, submit sample prompts for review, and once approved, list your prompts with full pricing control. We handle discovery and delivery.",
  },
  {
    id: "3",
    question: "Which AI models are supported?",
    answer:
      "Our prompts are optimized for GPT-4, Claude, Gemini, and other leading models. Each listing specifies compatible models and includes usage instructions.",
  },
  {
    id: "4",
    question: "What is your refund policy?",
    answer:
      "If a prompt doesn't perform as described, request a refund within 7 days. We stand behind every listing on our marketplace.",
  },
  {
    id: "5",
    question: "Can I use purchased prompts commercially?",
    answer:
      "Yes. All premium prompts include a commercial license unless otherwise noted. Check individual listing details for specific usage rights.",
  },
];
