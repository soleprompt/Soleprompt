import { bundlePrompt, starterPrompt, type CatalogEntry } from "./helpers";

const SOLAR_SALES_AI_PACK = {
  ...bundlePrompt(
    "Solar Sales AI Pack",
    "solar",
    ["Bundle", "Solar", "Sales", "Premium"],
    39.99,
    "intermediate",
    "8+ hours",
    "Premium bundle for solar sales reps: lead qualification scripts, discovery call frameworks, objection handlers, appointment setters, follow-up sequences, and closing talk tracks. Eight copy-paste prompts built for residential solar pipelines.",
    `# Solar Sales AI Pack — 8 Prompts

Copy the full prompt block for your task into your AI chat.

---

## 1. Solar Lead Qualifier Script

You are a solar sales trainer. The user provides lead source, homeowner details, and property basics. Return: BANT-style qualification questions, red flags to deprioritize, green-light signals, recommended next step (book site visit, nurture, or disqualify), and a 60-second opener script.

---

## 2. Discovery Call Framework

You are a solar sales coach. Design a 15-minute discovery call from homeowner context. Return: call agenda with timing, must-ask questions (roof, usage, motivation, timeline), note-taking template, and transition to site visit booking.

---

## 3. Solar Objection Handler (Homeowner FAQs)

You are a solar consultant. Address common objections: cost, roof age, HOA, moving soon, winter production, panel aesthetics, and "waiting for prices to drop." Return: empathetic acknowledge + reframe + proof point for each, plus a one-liner summary card.

---

## 4. Appointment Setter Script

You are an outbound solar SDR. Write a phone/text script to book a site assessment. Return: opener, value hook, 3 qualifying questions, calendar close, voicemail script, and 2 follow-up texts.

---

## 5. Site Visit Prep Checklist

You are a solar operations lead. Prepare the rep for an in-home visit. Return: pre-visit research steps, materials to bring, room-by-room walkthrough script, photo checklist, and safety/compliance reminders.

---

## 6. Post-Site-Visit Follow-Up Sequence

You are a solar sales copywriter. Write a 3-touch follow-up after a site visit: same-day thank-you email, 48-hour recap with next steps, and 7-day urgency nudge. Return subject lines, full email bodies, and SMS alternatives.

---

## 7. Financing Conversation Script

You are a solar financing specialist. Help the rep explain cash vs. loan vs. lease vs. PPA without jargon. Return: side-by-side comparison talking points, monthly payment framing, tax credit explanation (educational only), and questions to uncover buyer preference.

---

## 8. Close & Contract Talking Points

You are a solar closer. Prepare contract-review talking points for a hesitant homeowner. Return: recap of agreed benefits, warranty highlights, timeline expectations, permit/install process, and soft-close questions.

---

*Financing and tax content is educational only — not licensed financial or tax advice.*`,
    0,
  ),
  featured: true,
};

const SOLAR_PROPOSAL_GENERATOR_PACK = {
  ...bundlePrompt(
    "Solar Proposal Generator Pack",
    "solar",
    ["Bundle", "Solar", "Proposal", "Premium"],
    49.99,
    "intermediate",
    "10+ hours",
    "Premium proposal toolkit for solar installers and sales teams: residential and commercial proposal outlines, client-ready ROI summaries, financing comparison scripts, quote emails, follow-up sequences, and contract talking points.",
    `# Solar Proposal Generator Pack — 7 Prompts

Copy the full prompt block for your task into your AI chat.

---

## 1. Residential Solar Proposal Outline

You are a solar proposal writer. The user provides system size, equipment, pricing, homeowner name, and utility details. Return: executive summary, system overview, savings projection narrative, equipment specs table, warranty section, timeline, and next steps — formatted for PDF or email delivery.

---

## 2. Commercial Solar Proposal

You are a commercial solar consultant. Build a B2B proposal from building type, load profile, roof/land constraints, and financing preference. Return: project scope, production estimate narrative, payback summary, incentive overview (educational), implementation phases, and stakeholder FAQ.

---

## 3. Client ROI Summary

You are a solar financial analyst. Turn raw inputs (bill, system cost, production, incentives) into a homeowner-friendly ROI summary. Return: 25-year savings chart narrative, payback period, monthly bill before/after, environmental impact bullets, and assumptions footnote.

---

## 4. Financing Comparison Script

You are a solar financing advisor. Compare cash purchase, solar loan, lease, and PPA for the client's situation. Return: comparison table narrative, monthly payment scenarios, ownership vs. third-party tradeoffs, and recommended option with rationale.

---

## 5. Solar Quote Email Template

You are a solar sales copywriter. Draft a professional quote delivery email. Return: subject line options, personalized body with system highlights, attachment callouts, CTA to schedule review call, and P.S. urgency line.

---

## 6. Post-Site-Visit Follow-Up Email

You are a solar account executive. Write a follow-up email after an on-site assessment. Return: recap of findings, proposed system summary, photo references placeholder, scheduling CTA for proposal review, and FAQ addressing likely concerns.

---

## 7. Contract Review Talking Points

You are a solar project manager. Prepare homeowner-facing contract walkthrough notes. Return: section-by-section plain-English summaries (scope, warranties, timeline, cancellation), common questions with answers, and checklist before signature.

---

*Financial projections and incentive estimates are educational only. Verify with licensed professionals and local utility rules.*`,
    1,
  ),
  featured: true,
};

export const SOLAR_PROMPTS: CatalogEntry[] = [
  {
    ...starterPrompt(
      "Solar ROI Calculator",
      "solar",
      ["Solar", "ROI", "Calculator", "Tool"],
      2.99,
      "beginner",
      "45 minutes",
      "solar financial analyst specializing in residential ROI modeling",
      "calculate a clear solar ROI from the homeowner's electric bill, system cost, production estimate, and local incentives",
      [
        "25-year savings projection with year-by-year highlights",
        "Simple payback period and break-even month",
        "Monthly bill before vs. after solar (with assumptions stated)",
        "ROI percentage and net present value narrative",
        "Assumptions table (degradation, rate escalation, incentives)",
      ],
      "Use conservative assumptions and flag when inputs are missing. Educational only — not licensed financial advice.",
    ),
    featured: true,
  },
  {
    ...starterPrompt(
      "Electric Bill → Savings Estimator",
      "solar",
      ["Solar", "Savings", "Electric Bill", "Tool"],
      2.99,
      "beginner",
      "30 minutes",
      "solar savings estimator for residential sales teams",
      "turn a homeowner's electric bill and usage patterns into a savings estimate for a proposed solar system",
      [
        "Annual kWh usage breakdown from bill inputs",
        "Estimated offset percentage and production gap",
        "Monthly and annual savings range (low / mid / high)",
        "Seasonal production vs. usage notes",
        "Talking points for presenting savings on a sales call",
      ],
    ),
    featured: true,
  },
  {
    ...starterPrompt(
      "Solar Lead Qualifier Script",
      "solar",
      ["Solar", "Lead Qualification", "Sales", "Script"],
      1.99,
      "beginner",
      "20 minutes",
      "solar sales trainer focused on lead qualification",
      "write a lead qualification script for inbound and outbound solar leads",
      [
        "60-second phone opener and voicemail variant",
        "8–10 qualification questions (roof, bill, ownership, timeline, credit awareness)",
        "Red flags and disqualification criteria",
        "Green-light signals and priority scoring",
        "Recommended next step (book visit, nurture email, or pass)",
      ],
    ),
    featured: true,
  },
  {
    ...starterPrompt(
      "Roof Suitability Checklist Prompt",
      "solar",
      ["Solar", "Roof", "Site Assessment", "Checklist"],
      1.99,
      "beginner",
      "25 minutes",
      "solar site assessment specialist",
      "evaluate roof suitability for solar from photos, age, material, shading, and structural notes",
      [
        "Roof condition score (1–10) with rationale",
        "Shading and orientation assessment",
        "Structural and permitting considerations",
        "Recommended array placement zones",
        "Pre-install remediation flags (re-roof, tree trim, etc.)",
      ],
    ),
  },
  {
    ...starterPrompt(
      "Solar Objection Handler (Homeowner FAQs)",
      "solar",
      ["Solar", "Objections", "Sales", "FAQ"],
      2.99,
      "intermediate",
      "40 minutes",
      "solar sales coach specializing in objection handling",
      "address homeowner objections about cost, roof condition, aesthetics, moving, HOA, and waiting for better technology",
      [
        "Top 8 objections with empathetic acknowledge + reframe + proof point",
        "One-liner cheat sheet for each objection",
        "Role-play prompts for practice",
        "When to escalate to a manager or engineer",
        "Follow-up email snippet after handling objections",
      ],
    ),
    featured: true,
  },
  SOLAR_SALES_AI_PACK,
  SOLAR_PROPOSAL_GENERATOR_PACK,
];
