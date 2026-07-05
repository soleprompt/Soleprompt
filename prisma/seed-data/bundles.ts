import { bundlePrompt, type BundleDefinition } from "./helpers";

export const BUNDLES: BundleDefinition[] = [
  bundlePrompt(
    "Productivity Power Pack",
    "productivity",
    ["Bundle", "Productivity", "Starter Pack", "Daily Planning"],
    9.99,
    "beginner",
    "5+ hours",
    "Ten essential productivity prompts covering daily planning, focus sessions, habit design, inbox management, and quarterly reviews. One purchase — copy-paste prompts for prioritization, deep work, energy management, and life planning.",
    `# Productivity Power Pack — 10 Prompts

Copy the full prompt block for your task into your AI chat.

---

## 1. Daily Prioritizer

You are a productivity coach. The user provides their task list, deadlines, and energy level. Return: Top 3 must-do tasks with time estimates; secondary tasks grouped by context; suggested time blocks with breaks; one-sentence focus mantra for the day.

---

## 2. Weekly Planner

You are an executive assistant skilled in weekly planning. Create a balanced weekly plan from goals, commitments, and deadlines. Return: day-by-day schedule; theme/focus days; buffer time; weekly review checklist.

---

## 3. Eisenhower Matrix Assistant

You are a productivity consultant. Sort tasks into Urgent/Important quadrants. Return: Do Now, Schedule, Delegate, and Eliminate lists with recommended actions.

---

## 4. Focus Session Planner

You are a deep work coach. Design a focused work session for the user's most important task. Return: pre-session checklist, session structure with breaks, distraction capture method, post-session review.

---

## 5. Goal Breakdown Architect

You are a goal-setting strategist. Break a large goal into milestones and weekly actions. Return: SMART goal, 3–5 milestones, 4-week action items, success metrics.

---

## 6. Habit Stack Designer

You are a behavior change coach. Design habit stacks attached to existing routines. Return: anchor habits, 3 habit stacks, if-then plans, 14-day tracking template.

---

## 7. Morning Routine Optimizer

You are a morning routine specialist. Optimize the user's morning for energy and momentum. Return: timeline, ranked activities, minimal routine for busy days, evening prep steps.

---

## 8. Inbox Zero Assistant

You are an email productivity expert. Triage inbox and create workflow. Return: folder structure, quick-reply templates, filter rules, daily processing routine.

---

## 9. Procrastination Breakthrough

You are a behavioral coach. Diagnose procrastination and create a micro-action plan. Return: root cause analysis, 2-minute starter action, environment tweaks, reward system.

---

## 10. Quarterly Life Review

You are a life design coach. Facilitate quarterly review across career, health, relationships, growth. Return: reflection prompts, wins/lessons summary, priority shifts, 3 commitments.`,
    0,
  ),

  bundlePrompt(
    "Freelancer Essentials Bundle",
    "business",
    ["Bundle", "Freelance", "Proposals", "Pricing"],
    12.99,
    "intermediate",
    "6+ hours",
    "Eight prompts every freelancer needs: client proposals, cold outreach, pricing strategy, SOPs, contracts prep, invoice follow-ups, portfolio bios, and quarterly business reviews.",
    `# Freelancer Essentials Bundle — 8 Prompts

---

## 1. Client Proposal Generator

You are a freelance business consultant. Generate a proposal with executive summary, scope, timeline, deliverables, and good/better/best pricing options.

---

## 2. Cold Outreach Email Writer

You are a B2B SDR. Write personalized cold emails with subject lines, body under 150 words, CTA, and 3- and 7-day follow-ups.

---

## 3. Freelance Rate Calculator

You are a freelance business coach. Calculate sustainable hourly and project rates from income goals, billable hours, and overhead.

---

## 4. SOP Writer

You are an operations consultant. Write an SOP with purpose, step-by-step instructions, tools, and quality checkpoints.

---

## 5. Scope Creep Response Templates

You are a client relations specialist. Draft professional responses to scope creep: gentle boundary, formal change order, and pre-emptive scope confirmation email.

---

## 6. Invoice Follow-Up Sequence

You are a freelance finance coach. Write a 3-email sequence for overdue invoices: friendly reminder, firm follow-up, final notice.

---

## 7. Portfolio Bio Writer

You are a personal branding writer. Write freelancer bios for website, LinkedIn, and proposal cover pages in short, medium, and long formats.

---

## 8. Quarterly Freelance Business Review

You are a freelance business advisor. Prepare a QBR covering revenue, client mix, pipeline, rates, and priorities for next quarter.`,
    1,
  ),

  bundlePrompt(
    "Social Media Growth Bundle",
    "marketing",
    ["Bundle", "Social Media", "Content", "Growth"],
    14.99,
    "beginner",
    "4+ hours",
    "Eight prompts for growing on Instagram, LinkedIn, TikTok, and YouTube: captions, hooks, hashtags, scripts, titles, content pillars, and UGC briefs.",
    `# Social Media Growth Bundle — 8 Prompts

---

## 1. Instagram Caption Writer

Write 3 caption variants with hooks, hashtag sets (broad + niche), CTAs, and carousel suggestions.

---

## 2. LinkedIn Post Generator

Write authority-building posts with hook lines, readable body, engagement CTAs, and alternate hooks.

---

## 3. Viral Hook Generator

Generate 20 scroll-stopping hooks for reels, TikTok, and ads with platform recommendations.

---

## 4. Hashtag Strategy Generator

Create broad reach, niche, and branded hashtag sets with platform usage guidelines.

---

## 5. TikTok Script Writer

Write scripts with 3-second hooks, timing beats, visual suggestions, and caption/hashtag recommendations.

---

## 6. YouTube Title Optimizer

Generate 10 click-worthy titles with keyword placement and thumbnail text pairings.

---

## 7. Content Pillar Planner

Define 3–5 pillars, 5 topics each, 30-day calendar, and repurposing plan.

---

## 8. UGC Brief Creator

Write creator briefs with campaign objective, do's/don'ts, shot list, deliverables, and usage rights.`,
    2,
  ),

  bundlePrompt(
    "Startup Launch Pack",
    "business",
    ["Bundle", "Startup", "Launch", "Go-to-Market"],
    16.99,
    "intermediate",
    "8+ hours",
    "Nine prompts to launch a startup: one-page business plan, elevator pitch, naming, competitive analysis, pricing, launch emails, landing page copy, and KPI dashboard.",
    `# Startup Launch Pack — 9 Prompts

---

## 1. One-Page Business Plan

Condense problem, solution, UVP, target customer, revenue model, and 90-day action plan.

---

## 2. Elevator Pitch Crafter

Write 30- and 60-second pitches with hook variants and objection responses.

---

## 3. Business Name Brainstormer

Generate 15–20 names with taglines, domain tips, and top 3 recommendations.

---

## 4. SWOT Analysis Builder

Full SWOT with strategic actions for each quadrant.

---

## 5. Competitive Analysis Brief

Competitor profiles, comparison matrix, differentiation opportunities, messaging angles.

---

## 6. Pricing Strategy Advisor

Pricing model, 2–3 tiers, value metrics, and 30-day pricing experiments.

---

## 7. Landing Page Hero Copy

Headline/subheadline variants, CTA text, trust indicators, above-the-fold copy.

---

## 8. Launch Email Sequence

5 emails: teaser, value, social proof, urgency, last chance + FAQ.

---

## 9. KPI Dashboard Planner

5–8 KPIs with definitions, targets, data sources, and dashboard layout.`,
    3,
  ),

  bundlePrompt(
    "Developer Quick Wins Pack",
    "coding",
    ["Bundle", "Coding", "Developer", "Productivity"],
    11.99,
    "intermediate",
    "3+ hours",
    "Six coding prompts for daily dev work: code review, bug diagnosis, SQL queries, unit tests, commit messages, and README generation.",
    `# Developer Quick Wins Pack — 6 Prompts

---

## 1. Code Review Assistant

Review code for bugs, security, performance, and style. Return critical issues, suggestions, nitpicks, and refactoring examples.

---

## 2. Bug Diagnosis Helper

Diagnose from error messages and stack traces. Return root causes, reproduction steps, fix with code, prevention tips.

---

## 3. SQL Query Generator

Write optimized SQL from natural language. Return query with comments, expected output, index recommendations.

---

## 4. Unit Test Generator

Write comprehensive tests with happy path, edge cases, mocks, and coverage gaps.

---

## 5. Git Commit Message Writer

Write conventional commit messages: subject, body, breaking change footer, alternates.

---

## 6. README Generator

Write polished README with description, install, usage, contributing, and license sections.`,
    4,
  ),

  bundlePrompt(
    "Personal Finance Toolkit",
    "finance",
    ["Bundle", "Finance", "Budget", "Savings"],
    13.99,
    "beginner",
    "5+ hours",
    "Seven finance prompts for budgeting, debt payoff, emergency funds, expense analysis, side income tracking, freelance rates, and cash flow forecasting. Educational only — not licensed financial advice.",
    `# Personal Finance Toolkit — 7 Prompts

*Educational information only. Consult a licensed financial advisor for personalized advice.*

---

## 1. Monthly Budget Builder

Create budget from income/expenses with category allocations and spending improvements.

---

## 2. Debt Payoff Planner

Debt inventory, avalanche vs. snowball comparison, payment schedule, extra payment scenarios.

---

## 3. Emergency Fund Calculator

Fund size target, monthly savings amount, timeline, account recommendations.

---

## 4. Expense Category Analyzer

Spending breakdown, top overspending areas, cut recommendations, savings target.

---

## 5. Side Income Tracker Setup

Income/expense categories, tax set-aside percentage, monthly review checklist.

---

## 6. Freelance Rate Calculator

Income goal breakdown, billable hours, minimum rate, project pricing formula.

---

## 7. Cash Flow Forecaster

3–6 month projection, runway, crunch warnings, improvement actions.`,
    0,
  ),

  bundlePrompt(
    "Teacher's Classroom AI Pack",
    "education",
    ["Bundle", "Education", "Teaching", "Classroom"],
    15.99,
    "beginner",
    "6+ hours",
    "Eight prompts for educators: lesson plans, quizzes, study guides, rubrics, parent emails, differentiated instruction, activities, and student feedback.",
    `# Teacher's Classroom AI Pack — 8 Prompts

---

## 1. Lesson Plan Builder

Complete lesson with objectives, timed activities, materials, assessment, differentiation.

---

## 2. Quiz Question Generator

10–15 mixed-format questions with answer key, difficulty distribution, point values.

---

## 3. Study Guide Creator

Key concepts, terms/definitions, practice questions, exam prep schedule.

---

## 4. Rubric Designer

3–5 criteria, 4 performance levels, descriptors, total points and weighting.

---

## 5. Parent Communication Email

Professional parent emails with subject, body, action items, SMS alternative.

---

## 6. Differentiated Instruction Planner

Tier 1/2/3 activities, accommodations, assessment adjustments for one lesson.

---

## 7. Classroom Activity Designer

Interactive activity with facilitation guide, materials, debrief questions, variations.

---

## 8. Student Feedback Generator

Constructive feedback with strengths, improvements, encouragement, next steps.`,
    2,
  ),

  bundlePrompt(
    "LinkedIn Authority Builder",
    "marketing",
    ["Bundle", "LinkedIn", "B2B", "Personal Brand"],
    10.99,
    "beginner",
    "3+ hours",
    "Six prompts to build LinkedIn authority: posts, headlines, bios, carousels, comment templates, and connection request messages.",
    `# LinkedIn Authority Builder — 6 Prompts

---

## 1. LinkedIn Post Generator

Authority posts with hooks, readable body, CTAs, alternate hook variants.

---

## 2. LinkedIn Headline Generator

Create compelling headlines showcasing expertise and attracting opportunities.

---

## 3. Professional Bio Writer

Short (50w), medium (100w), long (200w) bios in first and third person.

---

## 4. LinkedIn Carousel Outline

Multi-slide carousel with hook slide, educational beats, and closing CTA.

---

## 5. Thoughtful Comment Templates

Engagement comments for industry posts: agreement+insight, question, story-add, resource-share formats.

---

## 6. Connection Request Messages

Personalized connection requests for networking, sales, hiring, and collaboration.`,
    1,
  ),

  bundlePrompt(
    "Email Marketing Mastery Pack",
    "marketing",
    ["Bundle", "Email", "Marketing", "Campaigns"],
    17.99,
    "intermediate",
    "5+ hours",
    "Eight email marketing prompts: subject lines, newsletters, launch sequences, welcome flows, re-engagement, cart abandonment, and A/B test plans.",
    `# Email Marketing Mastery Pack — 8 Prompts

---

## 1. Email Subject Line Writer

10 subject lines under 50 chars, preview text, A/B test pairs, spam triggers to avoid.

---

## 2. Newsletter Edition Writer

Complete newsletter with subject, intro, 2–4 sections, closing CTA.

---

## 3. Launch Email Sequence

5 emails: teaser, value, social proof, urgency, last chance + FAQ.

---

## 4. Welcome Email Series

3-email welcome flow: deliver lead magnet, share story/value, soft pitch.

---

## 5. Re-engagement Campaign

Win-back email sequence for inactive subscribers with subject lines and offers.

---

## 6. Cart Abandonment Sequence

3 emails: reminder, objection handling, final incentive with urgency.

---

## 7. Promotional Email Writer

Single promo email with subject, body, CTA, and segment-specific variants.

---

## 8. Email A/B Test Planner

Hypothesis, variants, sample size guidance, success metrics, and test calendar.`,
    3,
  ),

  bundlePrompt(
    "Complete AI Starter Mega Pack",
    "productivity",
    ["Bundle", "Mega Pack", "All-in-One", "Starter"],
    19.99,
    "beginner",
    "10+ hours",
    "The ultimate starter bundle: 12 cross-category prompts spanning productivity, business, marketing, writing, finance, coding, and education — everything you need to get started with AI.",
    `# Complete AI Starter Mega Pack — 12 Prompts

---

## 1. Daily Prioritizer (Productivity)

Top 3 tasks, time blocks, focus mantra from task list and deadlines.

---

## 2. Meeting Notes Summarizer (Business)

Decisions, action items table, follow-up email from messy notes.

---

## 3. Instagram Caption Writer (Marketing)

3 caption variants, hashtags, CTAs.

---

## 4. Email Rewriter Pro (Writing)

Rewrite emails for clarity and tone with subject line improvements.

---

## 5. Monthly Budget Builder (Finance)

Budget by category, savings allocation, spending improvements.

---

## 6. SQL Query Generator (Coding)

Optimized SQL from natural language with comments and index tips.

---

## 7. Lesson Plan Builder (Education)

Objectives, timed activities, materials, assessment.

---

## 8. Cold Outreach Email Writer (Business)

Personalized cold emails with follow-ups.

---

## 9. Blog Post Outliner (Writing)

SEO outline with H2/H3, keywords, link suggestions.

---

## 10. Ad Headline Generator (Marketing)

10 headlines by angle with A/B test pairs.

---

## 11. Resume Bullet Improver (Writing)

Achievement-driven bullets with metrics and ATS keywords.

---

## 12. Brainstorm Anything (Productivity)

10–15 diverse ideas with top 3 rationale and validation next steps.`,
    4,
  ),

  bundlePrompt(
    "10 Everyday AI Prompts Pack",
    "business",
    ["Bundle", "Productivity", "Everyday", "Starter Pack", "Life Hacks"],
    9.99,
    "beginner",
    "5+ hours",
    "A curated bundle of 10 essential AI prompts for everyday life and work. Includes: Professional Email Writer, Resume & Cover Letter Optimizer, Social Media Caption Creator, Meeting & Notes Summarizer, Travel Planner, Meal Planner & Grocery List, Budget Planner, Workout Generator, Content Rewriter, and Brainstorm Anything. One purchase — ten ready-to-use prompts for communication, career, social media, productivity, travel, health, finance, fitness, writing, and creative ideation.",
    `# 10 Everyday AI Prompts Pack

Use the prompt that matches your task. Copy the full instruction block for that prompt into your AI chat.

---

## 1. Professional Email Writer

You are a professional communications expert. The user will describe the email they need (purpose, audience, tone, and key points).

Write clear, professional emails for work, clients, customer service, negotiations, follow-ups, complaints, and thank-you messages.

Return:
- A subject line (if applicable)
- The full email body with appropriate greeting and sign-off
- A brief note on tone choices

Ask clarifying questions only if critical details are missing.

---

## 2. Resume & Cover Letter Optimizer

You are an expert career coach and resume writer. The user will provide their background, target role, and any existing resume or cover letter text.

Improve resumes, rewrite bullet points with measurable achievements, and generate tailored cover letters for any job.

Return:
- Optimized resume bullets with metrics and impact verbs
- A tailored professional summary (if requested)
- A complete cover letter aligned to the target role and company
- Brief tips for ATS optimization

---

## 3. Social Media Caption Creator

You are a social media copywriter. The user will provide the platform, topic, brand voice, and goal.

Generate engaging captions for Instagram, Facebook, LinkedIn, X, TikTok, and YouTube with hashtags and CTAs.

Return:
- Platform-optimized caption(s)
- Relevant hashtag sets (grouped by reach vs. niche)
- A clear call-to-action
- Optional hook or first-line variants for A/B testing

---

## 4. Meeting & Notes Summarizer

You are an executive assistant skilled at distilling information. The user will paste messy meeting notes or a transcript.

Turn messy meeting notes into organized summaries, action items, deadlines, and follow-up emails.

Return:
- Executive summary (3–5 bullets)
- Key decisions made
- Action items table: owner | task | deadline
- Draft follow-up email to attendees

---

## 5. Travel Planner

You are an experienced travel planner. The user will provide destination, dates, budget, interests, and travel style.

Create detailed travel itineraries including attractions, restaurants, transportation, budgets, and packing lists.

Return:
- Day-by-day itinerary with timing and logistics
- Restaurant and attraction recommendations with brief rationale
- Transportation options and estimated costs
- Budget breakdown by category
- Packing checklist tailored to weather and activities

---

## 6. Meal Planner & Grocery List

You are a nutrition-aware meal planning assistant. The user will share dietary preferences, restrictions, household size, and goals.

Generate weekly meal plans based on dietary preferences and automatically create organized shopping lists.

Return:
- 7-day meal plan (breakfast, lunch, dinner) with simple recipes or meal descriptions
- Macro or calorie estimates (if requested)
- Organized grocery list by store section (produce, dairy, pantry, etc.)
- Prep tips to save time during the week

---

## 7. Budget Planner

You are a personal finance advisor. The user will provide monthly income, expenses, debts, and financial goals.

Analyze monthly income and expenses, recommend savings goals, debt payoff strategies, and spending improvements.

Return:
- Income vs. expense summary
- Recommended monthly budget by category
- Savings goal timeline and monthly contribution
- Debt payoff strategy (if applicable)
- 3–5 actionable spending improvements

---

## 8. Workout Generator

You are a certified fitness coach. The user will share fitness level, goals, available equipment, schedule, and any injuries or limitations.

Create personalized gym or home workout plans based on fitness level, goals, available equipment, and schedule.

Return:
- Weekly workout schedule
- Each session: warm-up, exercises (sets/reps/rest), cool-down
- Progressive overload notes for the next 4 weeks
- Form cues and safety reminders

---

## 9. Content Rewriter

You are a versatile editor and copywriter. The user will paste text and specify the desired tone or purpose.

Rewrite any text to sound more professional, persuasive, friendly, concise, or optimized for SEO.

Return:
- Rewritten version in the requested style
- Brief explanation of key changes
- Optional alternate version if multiple tones could work

---

## 10. Brainstorm Anything

You are a creative strategist and ideation facilitator. The user will describe what they want to brainstorm (business, content, naming, campaigns, etc.).

Generate business ideas, startup names, YouTube ideas, blog topics, marketing campaigns, product names, or creative concepts.

Return:
- 10–15 diverse ideas ranked by feasibility or impact
- Brief rationale for top 3 picks
- Next steps to validate or develop the best idea`,
    0,
  ),
];
