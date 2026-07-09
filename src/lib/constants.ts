import type { FAQItem, Testimonial } from "@/types";

export const SITE = {
  name: "SolePrompt",
  tagline: "Learn AI. Ship Real Outcomes.",
  description:
    "Where students, creators, and entrepreneurs learn AI and buy tools that help them study, create, and grow faster.",
  year: 2026,
} as const;

export const SOCIAL_LINKS = {
  twitter: "https://x.com/getsoleprompt",
  discord: "#",
} as const;

export const NAV_LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "SolePrompt Studio", href: "/studio/welcome" },
  { label: "Academy", href: "/academy" },
  { label: "Categories", href: "/categories" },
  { label: "Free X Checker", href: "/tools/x-checker" },
  { label: "Sell", href: "/#sell" },
  { label: "FAQ", href: "/#faq" },
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
      "We sell outcomes, not generic prompts. Start free in our AI Academy with basics and templates, then upgrade to career-specific toolkits for students, creators, and entrepreneurs — every tool is built for real results.",
  },
  {
    id: "6",
    question: "What is the AI Academy?",
    answer:
      "Our free learning hub inside SolePrompt. Get AI basics, prompt writing guides, and beginner templates — then explore premium prompt packs, workflows, and automation kits tailored to your goals.",
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
