import { bundlePrompt } from "./helpers";

/** Keep in sync with src/lib/scrubber/constants.ts */
export const X_SCRUBBING_TOOL_TITLE =
  "X Scrubbing Tool — Delete Risky Tweets & Clean Your Brand";

export const X_SCRUBBING_TOOL = {
  ...bundlePrompt(
    X_SCRUBBING_TOOL_TITLE,
    "marketing",
    [
      "X Scrubber",
      "Twitter",
      "Delete Tweets",
      "Brand Safety",
      "Premium Tool",
    ],
    20,
    "intermediate",
    "3+ hours",
    "Premium bundle: full social scrubbing prompt library plus access to the X Scrubbing Tool in your buyer dashboard. Connect X, scan recent tweets for brand risk, select posts to remove, and confirm deletions — no auto-delete. Includes step-by-step cleanup guide and all scrubbing prompts.",
    `# X Scrubbing Tool — Premium Bundle

## What's Included

1. **Buyer dashboard tool** — Connect your X account, fetch recent tweets, see risk scores, select tweets, confirm, and delete (manual only).
2. **Full scrubbing prompt library** — copy-paste prompts for audits, rewrites, and multi-platform cleanup.
3. **Step-by-step cleanup guide** below.

---

## Quick Start Guide

1. Purchase this product, then open **Buyer Dashboard → X Scrubber**.
2. Connect your X account via OAuth (Read + Write permissions required).
3. Click **Scan tweets** to load your recent timeline with risk scores.
4. Review flagged tweets — select only what you want removed.
5. Confirm deletion — nothing is deleted without your explicit confirmation.
6. Check the deletion log for a record of removed tweets.

---

## Included Prompts

### Twitter/X Tweet Scrubbing Audit

You are a social media reputation consultant. Audit the user's Twitter/X timeline for brand risk. Return: risk tier summary, category breakdown, top 10 highest-risk tweets, cleanup priorities, brand-safe guidelines.

### Delete Risky Old Tweets Checklist

You are a digital hygiene coach. Create a prioritized checklist for finding and deleting risky old tweets. Return: backup steps, search queries, priority order, batch workflow, verification checklist.

### Controversial Tweet Finder

You are a social media forensic analyst. Help identify controversial tweets using keyword patterns. Return: custom keyword list, topic categories, severity scoring, search workflow, delete vs. rewrite matrix.

### Brand-Safe Tweet Rewriter

You are a brand-safe social copywriter. Rewrite flagged tweets to preserve voice while removing risk. Return: original vs. rewritten versions, change explanations, tone options, future guidelines.

### Pre-Job-Interview Social Scrub

You are a career coach. Prepare social profiles for recruiter review. Return: recruiter-first audit, red-flag checklist, 48-hour cleanup plan, Google simulation, safe posting topics.

### LinkedIn Profile Cleanup

You are a LinkedIn personal branding specialist. Review and optimize the profile. Return: headline options, about improvements, experience bullets, content audit, photo recommendations.

### Instagram Brand Risk Review

You are an Instagram brand strategist. Review for brand inconsistencies and risky content. Return: bio optimization, grid assessment, highlights risk flags, caption rewrites, hashtag cleanup.

### Facebook Post Audit

You are a Facebook privacy consultant. Audit for privacy leaks and outdated posts. Return: privacy checklist, post categories to review, timeline cleanup priorities, tagging guardrails.

### Social Media Reputation Cleanup

You are a cross-platform reputation advisor. Design comprehensive cleanup across all platforms. Return: platform risk scores, unified timeline, delete/archive/rewrite plan, monitoring routine.

### Social Media Crisis Response Planner

You are a crisis communications strategist. Create a response plan for resurfaced posts. Return: severity assessment, 24-hour playbook, statement templates, stakeholder order, recovery steps.

---

## Safety Notes

- **No auto-delete** — you choose every tweet to remove.
- Deletions are permanent on X — back up your archive first (Settings → Download archive).
- Tool access requires an active purchase of this product.
- Not legal advice — consult professionals for serious reputational or legal issues.`,
    0,
  ),
  featured: true,
};
