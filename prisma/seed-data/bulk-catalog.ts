import {
  starterPrompt,
  type CategorySlug,
  type Difficulty,
  type StarterPromptDefinition,
} from "./helpers";

type ToolDef = {
  title: string;
  tags: string[];
  role: string;
  task: string;
  outputs: string[];
  difficulty?: Difficulty;
  time?: string;
  price?: 0 | 1.99 | 2.99;
};

function batch(category: CategorySlug, tools: ToolDef[]): StarterPromptDefinition[] {
  return tools.map((t, i) => {
    const prompt = starterPrompt(
      t.title,
      category,
      t.tags,
      t.price === 0 ? 1.99 : (t.price ?? (i % 3 === 0 ? 1.99 : 2.99)),
      t.difficulty ?? "intermediate",
      t.time ?? "1 hour",
      t.role,
      t.task,
      t.outputs,
    );
    return t.price === 0 ? { ...prompt, price: 0 } : prompt;
  });
}

const PRODUCTIVITY: ToolDef[] = [
  { title: "Weekly Review Coach", tags: ["Planning", "Goals"], role: "executive productivity coach", task: "run a structured weekly review from the user's wins, misses, and priorities", outputs: ["Wins and lessons", "Priority stack for next week", "Calendar block recommendations", "One habit to double down on"] },
  { title: "Deep Work Session Planner", tags: ["Focus", "Time"], role: "focus strategist", task: "design a deep work block schedule with environment and distraction rules", outputs: ["90-minute session plan", "Pre-session ritual", "Break structure", "Shutdown checklist"] },
  { title: "Inbox Zero Assistant", tags: ["Email", "Triage"], role: "email operations specialist", task: "triage the user's inbox into action labels with reply drafts for urgent items", outputs: ["Folder/label system", "Top 10 actions", "Delegate list", "Archive candidates"] },
  { title: "Meeting Agenda Builder", tags: ["Meetings", "Agenda"], role: "chief of staff", task: "create a tight meeting agenda with decisions, owners, and time boxes", outputs: ["Agenda with timings", "Pre-read list", "Decision log template", "Follow-up email draft"] },
  { title: "Habit Stack Designer", tags: ["Habits", "Routines"], role: "behavior design consultant", task: "build a habit stack anchored to the user's existing routine", outputs: ["Anchor habit map", "3 micro-habits", "Friction reducers", "14-day tracker"] },
  { title: "Energy Management Planner", tags: ["Energy", "Schedule"], role: "performance coach", task: "map the user's energy peaks to task types across the workweek", outputs: ["Energy curve analysis", "Task-type calendar", "Recovery blocks", "Evening wind-down"] },
  { title: "Task Prioritization Matrix", tags: ["Priorities", "Eisenhower"], role: "operations lead", task: "sort the user's task list into impact/urgency quadrants with next actions", outputs: ["Quadrant map", "Top 5 do-first", "Defer/delete list", "Weekly capacity check"] },
  { title: "Morning Routine Optimizer", tags: ["Morning", "Routine"], role: "wellness productivity advisor", task: "optimize the user's morning routine for focus without burnout", outputs: ["20/40/60 min variants", "Hydration and movement", "Intent setting script", "Commute transition"] },
  { title: "End-of-Day Shutdown Ritual", tags: ["Shutdown", "Focus"], role: "productivity systems designer", task: "create an end-of-day shutdown that clears open loops", outputs: ["Shutdown checklist", "Tomorrow's top 3", "Workspace reset", "Boundary phrase for family"] },
  { title: "Personal SOP Writer", tags: ["SOP", "Documentation"], role: "process documentation expert", task: "document a recurring personal workflow as a reusable SOP", outputs: ["Trigger conditions", "Step-by-step SOP", "Tools checklist", "Review cadence"] },
  { title: "Focus Recovery Playbook", tags: ["Burnout", "Recovery"], role: "occupational wellness coach", task: "help the user recover focus after overload or context switching", outputs: ["Symptom check", "24-hour reset plan", "Boundary scripts", "Prevention rules"] },
  { title: "Notion Workspace Architect", tags: ["Notion", "Systems"], role: "Notion systems consultant", task: "design a Notion workspace structure for projects, areas, and resources", outputs: ["Database schema", "Views per role", "Template pages", "Maintenance ritual"] },
];

const BUSINESS: ToolDef[] = [
  { title: "SWOT Analysis Facilitator", tags: ["Strategy", "SWOT"], role: "strategy consultant", task: "facilitate a SWOT analysis with prioritized strategic implications", outputs: ["SWOT grid", "Top 3 strategic bets", "Risk mitigations", "90-day actions"] },
  { title: "OKR Drafting Assistant", tags: ["OKRs", "Goals"], role: "OKR coach", task: "draft quarterly OKRs aligned to company stage and team capacity", outputs: ["3 objectives", "Key results per objective", "Owner map", "Check-in cadence"] },
  { title: "Competitive Landscape Brief", tags: ["Competition", "Research"], role: "market intelligence analyst", task: "summarize competitors, positioning gaps, and differentiation angles", outputs: ["Competitor matrix", "Positioning map", "Win/loss themes", "Messaging wedges"] },
  { title: "Board Update Writer", tags: ["Board", "Reporting"], role: "startup operator", task: "write a concise board update from metrics and narrative inputs", outputs: ["Executive summary", "KPI table", "Wins and risks", "Asks and decisions"] },
  { title: "Hiring Scorecard Builder", tags: ["Hiring", "Recruiting"], role: "talent operations lead", task: "create a role scorecard with competencies and interview plan", outputs: ["Role mission", "Competency rubric", "Interview stages", "Work sample prompt"] },
  { title: "Vendor Comparison Matrix", tags: ["Procurement", "Vendors"], role: "procurement analyst", task: "compare vendors across price, features, risk, and implementation", outputs: ["Weighted scorecard", "Shortlist recommendation", "Negotiation levers", "Implementation timeline"] },
  { title: "Business Model Canvas Coach", tags: ["Canvas", "Startup"], role: "lean startup mentor", task: "complete a business model canvas with assumptions to test", outputs: ["Nine-block canvas", "Riskiest assumptions", "Experiment backlog", "Metrics to watch"] },
  { title: "Partnership Outreach Writer", tags: ["Partnerships", "BD"], role: "business development lead", task: "draft partnership outreach that leads with mutual value", outputs: ["Target partner profile", "Email sequence (3)", "Call agenda", "Pilot proposal outline"] },
  { title: "Quarterly Planning Facilitator", tags: ["Planning", "Quarterly"], role: "facilitation expert", task: "facilitate quarterly planning with themes, bets, and resource allocation", outputs: ["Quarter theme", "Initiative portfolio", "Resource map", "Communication plan"] },
  { title: "Operating Cadence Designer", tags: ["Ops", "Meetings"], role: "COO advisor", task: "design a leadership operating cadence with rituals and artifacts", outputs: ["Weekly/monthly/quarterly rhythm", "Meeting charters", "Dashboard list", "Escalation paths"] },
];

const MARKETING: ToolDef[] = [
  { title: "Landing Page Copy Generator", tags: ["Landing", "Copy"], role: "conversion copywriter", task: "write landing page copy from offer, audience, and proof inputs", outputs: ["Hero headline options", "Subhead and bullets", "Social proof section", "CTA variants"] },
  { title: "Email Nurture Sequence", tags: ["Email", "Nurture"], role: "lifecycle marketer", task: "build a 5-email nurture sequence for the user's lead magnet", outputs: ["Sequence map", "Subject lines", "Full email drafts", "Segmentation notes"] },
  { title: "Ad Creative Brief Writer", tags: ["Ads", "Creative"], role: "performance marketing strategist", task: "write an ad creative brief for paid social campaigns", outputs: ["Audience hooks", "Angle matrix", "Script/storyboard", "Testing plan"] },
  { title: "SEO Content Brief", tags: ["SEO", "Content"], role: "SEO content strategist", task: "create an SEO content brief for a target keyword cluster", outputs: ["Search intent summary", "Outline with H2s", "Internal link plan", "FAQ schema ideas"] },
  { title: "Brand Voice Guide", tags: ["Brand", "Voice"], role: "brand strategist", task: "define brand voice, tone sliders, and do/don't examples", outputs: ["Voice pillars", "Tone by channel", "Sample rewrites", "Glossary"] },
  { title: "Webinar Promotion Pack", tags: ["Webinar", "Promotion"], role: "demand gen marketer", task: "create a webinar promotion kit across email, social, and partners", outputs: ["Registration page copy", "3 email invites", "Social post pack", "Speaker promo kit"] },
  { title: "Case Study Interview Guide", tags: ["Case Study", "Social Proof"], role: "customer marketing manager", task: "interview customers and structure a compelling case study", outputs: ["Interview questions", "Story arc", "Metrics to capture", "Draft case study outline"] },
  { title: "Referral Program Designer", tags: ["Referral", "Growth"], role: "growth marketer", task: "design a referral program with incentives and launch messaging", outputs: ["Program mechanics", "Reward tiers", "Launch email", "FAQ for advocates"] },
  { title: "Product Launch Checklist", tags: ["Launch", "GTM"], role: "product marketing manager", task: "build a go-to-market checklist for a product launch", outputs: ["Pre-launch tasks", "Launch day runbook", "Channel plan", "Success metrics"] },
  { title: "Community Content Calendar", tags: ["Community", "Calendar"], role: "community lead", task: "plan a 4-week community content calendar with prompts and formats", outputs: ["Weekly themes", "Post prompts", "Engagement tactics", "Moderation guidelines"] },
];

const CODING: ToolDef[] = [
  { title: "API Design Reviewer", tags: ["API", "Design"], role: "senior API architect", task: "review API design for consistency, versioning, and developer experience", outputs: ["Endpoint audit", "Naming fixes", "Error model", "OpenAPI gaps"] },
  { title: "Pull Request Summary Writer", tags: ["PR", "Review"], role: "staff engineer", task: "summarize a pull request for reviewers with risk areas highlighted", outputs: ["Change summary", "Risk assessment", "Test plan", "Reviewer questions"] },
  { title: "Database Migration Planner", tags: ["Database", "Migration"], role: "database reliability engineer", task: "plan a safe database migration with rollback steps", outputs: ["Migration steps", "Backfill strategy", "Rollback plan", "Monitoring checklist"] },
  { title: "Incident Postmortem Writer", tags: ["Incident", "SRE"], role: "site reliability engineer", task: "write a blameless postmortem from incident timeline notes", outputs: ["Timeline", "Root cause", "Action items", "Customer comms draft"] },
  { title: "Regex Pattern Builder", tags: ["Regex", "Utilities"], role: "developer tools specialist", task: "build and explain regex patterns for the user's validation needs", outputs: ["Pattern options", "Test cases", "Edge cases", "Readable explanation"] },
  { title: "CI/CD Pipeline Auditor", tags: ["CI/CD", "DevOps"], role: "DevOps engineer", task: "audit CI/CD pipeline for speed, security, and reliability", outputs: ["Bottleneck map", "Security gaps", "Caching improvements", "Priority fixes"] },
  { title: "GraphQL Schema Advisor", tags: ["GraphQL", "API"], role: "GraphQL specialist", task: "improve GraphQL schema design for performance and clarity", outputs: ["Type improvements", "N+1 risks", "Pagination pattern", "Deprecation plan"] },
  { title: "Tech Debt Prioritizer", tags: ["Tech Debt", "Planning"], role: "engineering manager", task: "prioritize tech debt items by risk, cost, and customer impact", outputs: ["Scored backlog", "Quick wins", "Quarterly themes", "Stakeholder narrative"] },
  { title: "Onboarding README Generator", tags: ["Docs", "Onboarding"], role: "developer experience lead", task: "write a developer onboarding README for a repository", outputs: ["Prerequisites", "Local setup", "Architecture overview", "First PR guide"] },
  { title: "Performance Profiling Guide", tags: ["Performance", "Debugging"], role: "performance engineer", task: "create a profiling plan for the user's performance issue", outputs: ["Hypothesis list", "Tools to use", "Measurement plan", "Fix candidates"] },
  { title: "Security Threat Model", tags: ["Security", "Threat Model"], role: "application security engineer", task: "build a lightweight threat model for a feature or service", outputs: ["Assets and trust boundaries", "STRIDE threats", "Mitigations", "Test cases"] },
  { title: "SDK Quickstart Writer", tags: ["SDK", "Docs"], role: "developer advocate", task: "write SDK quickstart documentation with copy-paste examples", outputs: ["Install steps", "Auth setup", "3 code examples", "Troubleshooting"] },
  { title: "Monorepo Structure Advisor", tags: ["Monorepo", "Architecture"], role: "platform engineer", task: "recommend monorepo structure and tooling for the team's scale", outputs: ["Folder layout", "Build tool choice", "Shared packages", "Migration phases"] },
  { title: "Error Message Improver", tags: ["UX", "Errors"], role: "developer UX specialist", task: "rewrite error messages to be actionable for developers and users", outputs: ["Before/after messages", "Error codes", "Docs links", "Telemetry fields"] },
  { title: "Load Test Scenario Builder", tags: ["Testing", "Load"], role: "QA architect", task: "design load test scenarios for critical user journeys", outputs: ["Scenario list", "Traffic model", "Success criteria", "Tooling setup"] },
  { title: "Feature Flag Rollout Plan", tags: ["Feature Flags", "Release"], role: "release manager", task: "plan a feature flag rollout with guardrails and metrics", outputs: ["Rollout stages", "Kill switch", "Metrics dashboard", "Comms plan"] },
  { title: "Code Comment Policy", tags: ["Standards", "Review"], role: "engineering standards lead", task: "define when and how to write code comments for the team", outputs: ["Comment types", "Examples", "Anti-patterns", "PR checklist"] },
  { title: "Microservice Boundary Advisor", tags: ["Microservices", "Architecture"], role: "distributed systems architect", task: "recommend service boundaries for a growing codebase", outputs: ["Domain map", "Service candidates", "Data ownership", "Integration patterns"] },
  { title: "Observability Dashboard Spec", tags: ["Observability", "SRE"], role: "observability engineer", task: "spec dashboards and alerts for a service's golden signals", outputs: ["Dashboard panels", "Alert thresholds", "Runbook links", "SLO draft"] },
  { title: "Legacy Code Refactor Plan", tags: ["Refactor", "Legacy"], role: "senior software engineer", task: "plan a safe refactor of legacy code with incremental steps", outputs: ["Characterization tests", "Refactor slices", "Risk controls", "Timeline"] },
];

const FINANCE: ToolDef[] = [
  { title: "Monthly Budget Review", tags: ["Budget", "Personal"], role: "personal finance coach", task: "review monthly spending and recommend budget adjustments", outputs: ["Category breakdown", "Overspend flags", "Savings moves", "Next month targets"] },
  { title: "Cash Flow Forecast", tags: ["Cash Flow", "Business"], role: "fractional CFO", task: "build a 13-week cash flow forecast from revenue and expense inputs", outputs: ["Weekly forecast", "Runway estimate", "Scenario table", "Action levers"] },
  { title: "Investment Portfolio Allocator", tags: ["Investing", "Portfolio"], role: "fiduciary-minded investment educator", task: "suggest a diversified allocation based on goals and risk tolerance", outputs: ["Target allocation", "Fund types", "Rebalance rules", "Disclaimer notes"] },
  { title: "Invoice Collection Email Pack", tags: ["AR", "Collections"], role: "accounts receivable specialist", task: "write a polite invoice collection email sequence", outputs: ["Reminder 1-3 emails", "Phone script", "Payment plan offer", "Escalation note"] },
  { title: "Pricing Model Analyzer", tags: ["Pricing", "SaaS"], role: "pricing strategist", task: "analyze pricing model options for a SaaS product", outputs: ["Model comparison", "Packaging tiers", "Value metric", "Experiment ideas"] },
  { title: "Expense Policy Writer", tags: ["Policy", "Expenses"], role: "finance operations manager", task: "draft an employee expense policy with examples", outputs: ["Policy sections", "Approval workflow", "Examples", "FAQ"] },
  { title: "Tax Deduction Organizer", tags: ["Tax", "Deductions"], role: "tax preparation assistant (educational)", task: "organize potential tax deductions for a freelancer or small business", outputs: ["Deduction categories", "Documentation checklist", "Quarterly estimate", "Accountant handoff"] },
  { title: "Fundraising Metrics Dashboard", tags: ["Fundraising", "Metrics"], role: "startup finance advisor", task: "define investor metrics dashboard for the user's stage", outputs: ["Core KPIs", "Chart definitions", "Benchmark notes", "Narrative bullets"] },
  { title: "Break-Even Calculator Narrative", tags: ["Break-Even", "Planning"], role: "financial analyst", task: "calculate break-even and explain levers to reach profitability sooner", outputs: ["Break-even units", "Sensitivity table", "Cost cuts", "Price scenarios"] },
  { title: "Debt Payoff Planner", tags: ["Debt", "Personal"], role: "debt reduction coach", task: "compare avalanche vs snowball payoff plans with timelines", outputs: ["Payoff schedule", "Interest saved", "Monthly budget fit", "Motivation milestones"] },
  { title: "Financial KPI Scorecard", tags: ["KPIs", "Reporting"], role: "FP&A analyst", task: "build a monthly financial KPI scorecard for leadership", outputs: ["KPI definitions", "Target vs actual", "Variance commentary", "Driver tree"] },
  { title: "Vendor Contract Review Checklist", tags: ["Contracts", "Legal"], role: "finance legal liaison", task: "review vendor contract financial terms and flag risks", outputs: ["Payment terms", "Renewal traps", "SLA penalties", "Negotiation asks"] },
  { title: "Cap Table Scenario Modeler", tags: ["Cap Table", "Startup"], role: "startup finance operator", task: "model cap table scenarios for a new funding round", outputs: ["Pre/post ownership", "Dilution summary", "Option pool impact", "Founder questions"] },
  { title: "Subscription Audit Assistant", tags: ["Subscriptions", "Savings"], role: "spend optimization analyst", task: "audit recurring subscriptions and recommend cancellations or downgrades", outputs: ["Subscription inventory", "Savings estimate", "Cancellation scripts", "Replacement options"] },
  { title: "Profit and Loss Narrator", tags: ["P&L", "Reporting"], role: "finance storyteller", task: "turn P&L numbers into a narrative for non-finance stakeholders", outputs: ["Executive summary", "Driver analysis", "Risks", "Next month outlook"] },
  { title: "Emergency Fund Planner", tags: ["Savings", "Emergency"], role: "financial wellness coach", task: "size an emergency fund and create a savings plan to reach it", outputs: ["Target amount", "Monthly contribution", "Account type", "Milestone tracker"] },
  { title: "Unit Economics Explainer", tags: ["Unit Economics", "SaaS"], role: "growth finance analyst", task: "explain unit economics and improvement levers for a SaaS business", outputs: ["CAC/LTV summary", "Payback period", "Improvement levers", "Board slide bullets"] },
  { title: "Grant Budget Template", tags: ["Grants", "Nonprofit"], role: "nonprofit finance manager", task: "build a grant budget template with justification narratives", outputs: ["Line items", "Justifications", "Match funding", "Reporting calendar"] },
  { title: "Retirement Projection Assistant", tags: ["Retirement", "Planning"], role: "retirement planning educator", task: "project retirement savings trajectory with adjustment options", outputs: ["Projection summary", "Contribution changes", "Risk notes", "Checklist"] },
  { title: "Financial Risk Register", tags: ["Risk", "Compliance"], role: "risk management officer", task: "create a financial risk register with mitigations", outputs: ["Risk list", "Likelihood/impact", "Owners", "Mitigation actions"] },
];

const WRITING: ToolDef[] = [
  { title: "LinkedIn Thought Leadership Post", tags: ["LinkedIn", "Social"], role: "B2B content writer", task: "write a LinkedIn post from the user's insight and story beats", outputs: ["Hook options", "Post draft", "CTA variants", "Comment starter"] },
  { title: "Press Release Draft", tags: ["PR", "Announcements"], role: "PR writer", task: "draft a press release for a product or company announcement", outputs: ["Headline", "Lead paragraph", "Quote placeholders", "Boilerplate"] },
  { title: "Whitepaper Outline Generator", tags: ["Whitepaper", "B2B"], role: "B2B content strategist", task: "outline a whitepaper that establishes thought leadership", outputs: ["Title options", "Chapter outline", "Research prompts", "CTA placement"] },
  { title: "Podcast Show Notes Writer", tags: ["Podcast", "Notes"], role: "podcast producer", task: "write show notes with timestamps, links, and key quotes", outputs: ["Episode summary", "Timestamp outline", "Pull quotes", "Resource links"] },
  { title: "UX Microcopy Pack", tags: ["UX", "Microcopy"], role: "UX writer", task: "write microcopy for onboarding, errors, and empty states", outputs: ["Onboarding strings", "Error messages", "Empty states", "Tone guide"] },
  { title: "Speech Outline Builder", tags: ["Speech", "Presentations"], role: "speechwriter", task: "structure a keynote or conference talk from the user's theme", outputs: ["Talk arc", "Story beats", "Slide titles", "Opening/closing lines"] },
  { title: "Newsletter Edition Planner", tags: ["Newsletter", "Email"], role: "newsletter editor", task: "plan a newsletter edition with sections and subject lines", outputs: ["Section outline", "Subject line A/B", "Intro draft", "Sponsor slot copy"] },
  { title: "Grant Proposal Narrative", tags: ["Grants", "Nonprofit"], role: "grant writer", task: "draft grant proposal narrative sections from program details", outputs: ["Need statement", "Program description", "Outcomes", "Budget narrative"] },
  { title: "Product Description Writer", tags: ["Ecommerce", "Product"], role: "ecommerce copywriter", task: "write product descriptions optimized for clarity and conversion", outputs: ["Short description", "Long description", "Bullet benefits", "SEO title"] },
  { title: "Tone Rewrite Assistant", tags: ["Editing", "Tone"], role: "developmental editor", task: "rewrite user copy in a target tone while preserving meaning", outputs: ["Formal variant", "Casual variant", "Punchy variant", "Change log"] },
  { title: "Book Chapter Outliner", tags: ["Books", "Creative"], role: "book development editor", task: "outline a nonfiction book chapter with narrative flow", outputs: ["Chapter thesis", "Section outline", "Anecdote prompts", "Takeaways"] },
  { title: "Video Script Hook Writer", tags: ["Video", "Script"], role: "video scriptwriter", task: "write scroll-stopping hooks and scripts for short-form video", outputs: ["3 hook options", "30s script", "B-roll list", "Caption text"] },
  { title: "Technical Blog Post Drafter", tags: ["Blog", "Technical"], role: "technical writer", task: "draft a technical blog post from bullet notes and code context", outputs: ["Title options", "Outline", "Full draft", "Meta description"] },
  { title: "Resume Achievement Bullets", tags: ["Resume", "Career"], role: "career coach", task: "turn job duties into quantified resume achievement bullets", outputs: ["10 bullet options", "STAR stories", "Skills map", "ATS keywords"] },
  { title: "Cover Letter Personalizer", tags: ["Cover Letter", "Jobs"], role: "job search coach", task: "personalize a cover letter for a specific role and company", outputs: ["Opening hook", "Body paragraphs", "Closing", "Follow-up email"] },
  { title: "FAQ Page Writer", tags: ["FAQ", "Support"], role: "customer education writer", task: "write an FAQ page that reduces support tickets", outputs: ["Question clusters", "Answer drafts", "Cross-links", "Escalation paths"] },
  { title: "Brand Story Manifesto", tags: ["Brand", "Story"], role: "brand storyteller", task: "write a brand manifesto from origin story and values inputs", outputs: ["Manifesto draft", "Tagline options", "Proof points", "Usage guidelines"] },
  { title: "Ghostwriting Interview Guide", tags: ["Ghostwriting", "Interviews"], role: "ghostwriter", task: "prepare interview questions to extract a client's voice and stories", outputs: ["Question bank", "Story prompts", "Voice notes template", "Draft structure"] },
  { title: "Localization Brief Writer", tags: ["Localization", "Global"], role: "localization project manager", task: "create a localization brief for translating marketing copy", outputs: ["Glossary", "Tone rules", "Cultural notes", "QA checklist"] },
  { title: "Annual Report Narrative", tags: ["Reporting", "Corporate"], role: "corporate communications writer", task: "draft narrative sections for an annual report", outputs: ["CEO letter", "Highlights", "ESG section", "Looking ahead"] },
];

const EDUCATION: ToolDef[] = [
  { title: "Lesson Plan Builder", tags: ["Lesson Plan", "Teaching"], role: "curriculum designer", task: "build a standards-aligned lesson plan for the user's topic and grade", outputs: ["Objectives", "Activities with timing", "Materials", "Assessment"] },
  { title: "Rubric Generator", tags: ["Rubric", "Assessment"], role: "assessment specialist", task: "create a grading rubric with clear performance levels", outputs: ["Criteria rows", "Performance descriptors", "Point scale", "Student-friendly version"] },
  { title: "Differentiation Strategy Pack", tags: ["Differentiation", "Inclusive"], role: "special education coordinator", task: "suggest differentiation strategies for diverse learners in one lesson", outputs: ["Scaffolds", "Extensions", "Accommodations", "Grouping ideas"] },
  { title: "Parent Conference Script", tags: ["Parents", "Communication"], role: "experienced classroom teacher", task: "prepare talking points for a parent-teacher conference", outputs: ["Strengths framing", "Concern areas", "Action plan", "Follow-up email"] },
  { title: "Quiz Question Bank", tags: ["Quiz", "Assessment"], role: "instructional designer", task: "generate a quiz bank with varied question types", outputs: ["MC questions", "Short answer", "Answer key", "DOK labels"] },
  { title: "Project-Based Learning Unit", tags: ["PBL", "Projects"], role: "PBL facilitator", task: "design a project-based learning unit with milestones", outputs: ["Driving question", "Milestones", "Rubric", "Exhibition plan"] },
  { title: "Reading Comprehension Pack", tags: ["Reading", "ELA"], role: "literacy coach", task: "create reading comprehension activities for a selected passage theme", outputs: ["Pre-reading", "During-reading questions", "Post-reading writing", "Vocabulary list"] },
  { title: "STEM Lab Activity Designer", tags: ["STEM", "Lab"], role: "STEM curriculum writer", task: "design a hands-on lab activity with safety and inquiry steps", outputs: ["Hypothesis prompt", "Procedure", "Safety notes", "Analysis questions"] },
  { title: "IEP Goal Writer", tags: ["IEP", "Special Ed"], role: "special education case manager", task: "draft measurable IEP goals from student profile data", outputs: ["Annual goals", "Short-term objectives", "Progress monitoring", "Accommodation list"] },
  { title: "Classroom Management Plan", tags: ["Management", "Behavior"], role: "school climate coach", task: "create a classroom management plan with routines and consequences", outputs: ["Routines", "Expectations", "Consequence ladder", "Positive reinforcement"] },
  { title: "Substitute Teacher Packet", tags: ["Sub Plans", "Emergency"], role: "department chair", task: "assemble substitute teacher plans for a full day", outputs: ["Schedule", "Lesson instructions", "Emergency info", "Behavior notes"] },
  { title: "College Essay Coach", tags: ["College", "Essays"], role: "college admissions counselor", task: "coach a student through brainstorming and outlining a college essay", outputs: ["Topic options", "Outline", "Opening lines", "Revision checklist"] },
  { title: "Professional Development Workshop", tags: ["PD", "Training"], role: "instructional coach", task: "design a 60-minute PD workshop for teachers", outputs: ["Agenda", "Slides outline", "Handout", "Reflection prompt"] },
  { title: "Flipped Classroom Module", tags: ["Flipped", "Video"], role: "digital learning designer", task: "plan a flipped classroom module with at-home and in-class activities", outputs: ["Pre-class video script", "In-class activity", "Check for understanding", "Homework"] },
  { title: "Study Guide Generator", tags: ["Study Guide", "Exams"], role: "academic coach", task: "create a study guide for an upcoming exam topic", outputs: ["Key concepts", "Practice problems", "Memory aids", "Review schedule"] },
  { title: "Syllabus Designer", tags: ["Syllabus", "Course"], role: "higher ed instructor", task: "draft a course syllabus with policies and schedule", outputs: ["Course description", "Weekly schedule", "Grading breakdown", "Policies"] },
  { title: "Literature Circle Roles", tags: ["Literature", "Discussion"], role: "middle school ELA teacher", task: "assign literature circle roles and discussion prompts", outputs: ["Role cards", "Discussion questions", "Reflection log", "Assessment"] },
  { title: "Math Word Problem Set", tags: ["Math", "Problems"], role: "math curriculum specialist", task: "generate differentiated math word problems for a skill", outputs: ["Below grade", "On grade", "Above grade", "Solution strategies"] },
  { title: "Science Fair Project Guide", tags: ["Science Fair", "Projects"], role: "science teacher", task: "guide students through science fair project selection and method", outputs: ["Topic ideas", "Hypothesis template", "Materials list", "Display board layout"] },
  { title: "Online Course Module Outline", tags: ["Online", "Course"], role: "e-learning instructional designer", task: "outline an online course module with activities and assessments", outputs: ["Module objectives", "Lesson sequence", "Interactive activities", "Quiz"] },
];

const SOLAR: ToolDef[] = [
  { title: "Solar Site Survey Checklist", tags: ["Survey", "Install"], role: "solar site surveyor", task: "create a residential site survey checklist from property details", outputs: ["Roof assessment", "Shading notes", "Electrical panel", "Photo shot list"] },
  { title: "Permit Application Helper", tags: ["Permits", "Compliance"], role: "solar permitting specialist", task: "assemble permit application requirements for the user's jurisdiction", outputs: ["Document checklist", "Plan set notes", "Timeline", "Inspector FAQ"] },
  { title: "Solar Lease vs Buy Analyzer", tags: ["Financing", "Lease"], role: "solar finance advisor", task: "compare lease, loan, and cash purchase options for a homeowner", outputs: ["20-year cost comparison", "Ownership benefits", "Risk factors", "Recommendation"] },
  { title: "Commercial Solar ROI Model", tags: ["Commercial", "ROI"], role: "commercial solar analyst", task: "model commercial solar ROI with demand charge impacts", outputs: ["Savings summary", "Payback period", "IRR estimate", "Assumptions table"] },
  { title: "Net Metering Explainer Script", tags: ["Sales", "Education"], role: "solar sales trainer", task: "write a customer-friendly net metering explanation script", outputs: ["Simple explanation", "Bill walkthrough", "FAQ responses", "Objection handlers"] },
  { title: "Solar Maintenance Schedule", tags: ["O&M", "Maintenance"], role: "solar O&M manager", task: "create a maintenance schedule for residential or commercial arrays", outputs: ["Annual tasks", "Monitoring checks", "Warranty reminders", "Vendor contacts"] },
  { title: "Battery Backup Sizing Guide", tags: ["Battery", "Storage"], role: "energy storage consultant", task: "size a battery backup system for critical loads", outputs: ["Load list", "kWh requirement", "Product shortlist", "Install notes"] },
  { title: "HOA Solar Approval Letter", tags: ["HOA", "Approvals"], role: "solar customer advocate", task: "draft an HOA approval request letter with aesthetic mitigations", outputs: ["Request letter", "Layout diagram notes", "Reference statutes", "Follow-up template"] },
  { title: "Solar Referral Partner Kit", tags: ["Referrals", "Partners"], role: "solar channel manager", task: "create a referral partner kit for roofers and electricians", outputs: ["One-pager", "Email templates", "Commission structure", "Lead form fields"] },
  { title: "Interconnection Application Guide", tags: ["Utility", "Grid"], role: "utility interconnection specialist", task: "guide through utility interconnection application steps", outputs: ["Utility requirements", "Timeline", "Document list", "Status follow-up script"] },
  { title: "Solar Production Report Narrator", tags: ["Reporting", "Monitoring"], role: "solar account manager", task: "explain monthly production report variances to a homeowner", outputs: ["Performance summary", "Weather impact", "Action items", "Upsell opportunities"] },
  { title: "Racking Layout Optimizer Notes", tags: ["Design", "Layout"], role: "solar design engineer", task: "optimize panel layout notes for roof obstacles and code setbacks", outputs: ["Layout rationale", "Obstruction handling", "Fire setback compliance", "Stringing notes"] },
  { title: "Solar Tax Credit FAQ", tags: ["Tax Credit", "Incentives"], role: "solar incentives educator", task: "answer common tax credit and incentive questions accurately", outputs: ["ITC overview", "Eligibility checklist", "Documentation needed", "Disclaimer"] },
  { title: "Agricultural Solar Feasibility", tags: ["Agrivoltaics", "Farm"], role: "agrivoltaics consultant", task: "assess agrivoltaics feasibility for a farm operation", outputs: ["Land use options", "Revenue streams", "Regulatory notes", "Next steps"] },
  { title: "Solar Warranty Claims Guide", tags: ["Warranty", "Support"], role: "customer success manager", task: "guide a customer through a solar warranty claim process", outputs: ["Claim checklist", "Manufacturer contacts", "Timeline", "Temporary mitigation"] },
  { title: "EV + Solar Bundle Pitch", tags: ["EV", "Bundle"], role: "home electrification sales specialist", task: "pitch a solar plus EV charger bundle with savings narrative", outputs: ["Bundle value prop", "Savings estimate", "Install sequence", "Financing options"] },
  { title: "Shade Analysis Report Writer", tags: ["Shading", "Design"], role: "solar shading analyst", task: "write a shade analysis summary for sales and design teams", outputs: ["Annual sun hours", "Problem trees", "Mitigation options", "Production impact"] },
  { title: "Solar RFP Response Outline", tags: ["RFP", "Commercial"], role: "proposal manager", task: "outline a commercial solar RFP response", outputs: ["Executive summary", "Technical approach", "Schedule", "Pricing narrative"] },
  { title: "Installer QA Inspection List", tags: ["QA", "Install"], role: "solar QA inspector", task: "create a field QA inspection checklist for install crews", outputs: ["Electrical checks", "Roof penetration", "Labeling", "Commissioning steps"] },
  { title: "Solar Customer Onboarding Email Series", tags: ["Onboarding", "Email"], role: "customer onboarding lead", task: "write post-sale onboarding emails from contract to PTO", outputs: ["Welcome email", "Install prep", "Inspection day", "PTO celebration"] },
  { title: "Ground Mount Site Planner", tags: ["Ground Mount", "Design"], role: "ground-mount solar designer", task: "plan a ground-mount solar array layout and civil requirements", outputs: ["Array dimensions", "Setback compliance", "Trenching plan", "Vegetation management"] },
  { title: "Solar Fleet Operations Dashboard Spec", tags: ["Fleet", "O&M"], role: "solar fleet analyst", task: "spec KPIs for a multi-site solar fleet operations dashboard", outputs: ["KPI list", "Alert rules", "Reporting cadence", "Escalation matrix"] },
  { title: "Demand Response Revenue Estimator", tags: ["Demand Response", "Revenue"], role: "energy markets analyst", task: "estimate demand response revenue potential for commercial solar+battery", outputs: ["Program fit", "Revenue range", "Enrollment steps", "Risks"] },
  { title: "Solar Sales Objection Rebuttals", tags: ["Sales", "Objections"], role: "solar sales coach", task: "address top homeowner objections with empathetic rebuttals", outputs: ["10 objections", "Rebuttal scripts", "Proof points", "Close transitions"] },
  { title: "Panel Degradation Explainer", tags: ["Education", "Technical"], role: "solar technical educator", task: "explain panel degradation and warranty terms to customers", outputs: ["Degradation curve", "Warranty comparison", "Monitoring tips", "Replacement triggers"] },
];

const SALES_EXTRA: ToolDef[] = [
  { title: "Account Plan Builder", tags: ["Account", "Enterprise"], role: "enterprise account executive", task: "build a strategic account plan for a target logo", outputs: ["Stakeholder map", "Mutual action plan", "Value hypothesis", "Risk register"] },
  { title: "Sales Battlecard Writer", tags: ["Battlecard", "Competitive"], role: "competitive intelligence analyst", task: "write a sales battlecard against a key competitor", outputs: ["Positioning", "Landmines", "Proof points", "Trap questions"] },
  { title: "Demo Script Architect", tags: ["Demo", "SaaS"], role: "solutions consultant", task: "structure a discovery-led demo script for enterprise buyers", outputs: ["Demo flow", "Discovery tie-ins", "Punchy moments", "Next-step close"] },
  { title: "Renewal Risk Analyzer", tags: ["Renewals", "CS"], role: "customer success manager", task: "assess renewal risk and build a save plan", outputs: ["Risk score", "Health signals", "Save plays", "Executive outreach"] },
  { title: "Outbound LinkedIn Sequence", tags: ["LinkedIn", "Outbound"], role: "social selling specialist", task: "write a LinkedIn outbound sequence for B2B prospects", outputs: ["Connection note", "3 follow-ups", "Voice note script", "Meeting ask"] },
  { title: "Mutual Close Plan", tags: ["Closing", "Enterprise"], role: "enterprise closer", task: "co-create a mutual close plan with legal and procurement milestones", outputs: ["Milestone timeline", "Buyer tasks", "Seller tasks", "Champion enablement"] },
  { title: "Pricing Negotiation Playbook", tags: ["Negotiation", "Pricing"], role: "deal desk advisor", task: "prepare negotiation anchors and concession strategy", outputs: ["Walk-away point", "Give/get trades", "Discount guardrails", "Email templates"] },
  { title: "Sales Territory Planner", tags: ["Territory", "Planning"], role: "sales operations manager", task: "design a fair sales territory plan with account tiers", outputs: ["Tier definitions", "Account assignment", "Quota allocation", "Coverage model"] },
  { title: "Champion Enablement Kit", tags: ["Champion", "Enablement"], role: "enterprise seller", task: "equip an internal champion to sell on your behalf", outputs: ["Internal deck outline", "ROI one-pager", "FAQ for boss", "Email forwardable"] },
  { title: "Pipeline Review Facilitator", tags: ["Pipeline", "Forecast"], role: "sales leader", task: "facilitate a weekly pipeline review with forecast discipline", outputs: ["Deal inspection questions", "Stage exit criteria", "Forecast categories", "Coaching prompts"] },
];

const SOCIAL_EXTRA: ToolDef[] = [
  { title: "Instagram Carousel Planner", tags: ["Instagram", "Carousel"], role: "Instagram growth strategist", task: "plan an educational carousel post with slide-by-slide copy", outputs: ["Hook slide", "5-7 slides", "CTA slide", "Caption"] },
  { title: "TikTok Content Batch Planner", tags: ["TikTok", "Video"], role: "short-form video strategist", task: "plan a batch of TikTok videos from one content pillar", outputs: ["10 video ideas", "Hooks", "Shot lists", "Posting schedule"] },
  { title: "YouTube Title & Thumbnail Pack", tags: ["YouTube", "SEO"], role: "YouTube growth consultant", task: "generate click-worthy titles and thumbnail concepts", outputs: ["10 title options", "Thumbnail text", "A/B test plan", "Description SEO"] },
  { title: "Social Media Crisis Response", tags: ["Crisis", "PR"], role: "social media crisis manager", task: "draft crisis response statements and channel actions", outputs: ["Hold statement", "Channel-specific posts", "Internal FAQ", "Monitoring plan"] },
  { title: "Influencer Brief Writer", tags: ["Influencer", "Campaigns"], role: "influencer marketing manager", task: "write a creative brief for influencer partnerships", outputs: ["Campaign goals", "Talking points", "Do/don't", "Deliverables"] },
  { title: "Social Analytics Report Narrator", tags: ["Analytics", "Reporting"], role: "social media analyst", task: "turn social metrics into an executive-friendly monthly report", outputs: ["Highlights", "Channel breakdown", "Recommendations", "Next experiments"] },
  { title: "Pinterest Pin SEO Pack", tags: ["Pinterest", "SEO"], role: "Pinterest marketer", task: "optimize pin titles, descriptions, and boards for search", outputs: ["Pin copy pack", "Board strategy", "Keyword map", "Schedule"] },
  { title: "Community Guidelines Writer", tags: ["Community", "Moderation"], role: "community manager", task: "write community guidelines and moderation policies", outputs: ["Rules", "Examples", "Enforcement ladder", "Welcome post"] },
  { title: "Social Bio Optimizer", tags: ["Profile", "Bio"], role: "personal brand strategist", task: "optimize social bios across platforms for clarity and conversion", outputs: ["Platform bios", "Link strategy", "Pinned post ideas", "Highlight covers"] },
  { title: "UGC Campaign Designer", tags: ["UGC", "Campaigns"], role: "brand community lead", task: "design a user-generated content campaign with rules and prizes", outputs: ["Campaign mechanics", "Hashtag", "Legal disclaimer", "Promotion plan"] },
  { title: "LinkedIn Company Page Audit", tags: ["LinkedIn", "B2B"], role: "B2B social strategist", task: "audit a LinkedIn company page and recommend improvements", outputs: ["Profile fixes", "Content pillars", "Employee advocacy", "Lead gen CTAs"] },
  { title: "Social Content Repurposing Map", tags: ["Repurposing", "Workflow"], role: "content operations manager", task: "map one long-form asset into a week of social posts", outputs: ["Source asset breakdown", "Platform variants", "Schedule", "Asset checklist"] },
  { title: "Hashtag Strategy Builder", tags: ["Hashtags", "Discovery"], role: "social discovery specialist", task: "build a hashtag strategy for Instagram or TikTok growth", outputs: ["Tiered hashtag sets", "Banned tag check", "Rotation schedule", "Performance tracking"] },
  { title: "Social Selling DM Scripts", tags: ["DM", "Sales"], role: "social selling coach", task: "write non-spammy DM scripts for social selling", outputs: ["Warm opener", "Value DM", "Meeting ask", "Follow-up"] },
  { title: "Brand Meme Guardrails", tags: ["Memes", "Brand"], role: "social creative director", task: "define when and how the brand can use memes safely", outputs: ["On-brand examples", "Off-limits topics", "Approval workflow", "Template ideas"] },
];

const REAL_ESTATE_EXTRA: ToolDef[] = [
  { title: "Open House Marketing Kit", tags: ["Open House", "Marketing"], role: "listing agent marketer", task: "create open house marketing materials and follow-up", outputs: ["Flyer copy", "Social posts", "Sign-in script", "Follow-up emails"] },
  { title: "Buyer Consultation Script", tags: ["Buyers", "Consultation"], role: "buyer's agent coach", task: "script a buyer consultation that sets expectations and wins the client", outputs: ["Agenda", "Qualification questions", "Process overview", "Agreement close"] },
  { title: "CMA Presentation Writer", tags: ["CMA", "Pricing"], role: "pricing strategist realtor", task: "present a comparative market analysis narrative to sellers", outputs: ["Pricing recommendation", "Comp summary", "Adjustment rationale", "Marketing plan teaser"] },
  { title: "Lease Renewal Letter Pack", tags: ["Leasing", "Landlord"], role: "property manager", task: "write lease renewal letters with rent adjustment options", outputs: ["Renewal offer", "Market justification", "Counter response", "Move-out alternative"] },
  { title: "Tenant Screening Checklist", tags: ["Screening", "Rentals"], role: "residential property manager", task: "create a fair tenant screening checklist and decision rubric", outputs: ["Application requirements", "Scoring rubric", "Red flags", "Compliance notes"] },
  { title: "Investment Property Analyzer", tags: ["Investing", "Analysis"], role: "real estate investment analyst", task: "analyze a rental property's cash flow and cap rate", outputs: ["Income/expense table", "Cap rate", "Cash-on-cash", "Sensitivity scenarios"] },
  { title: "Neighborhood Market Report", tags: ["Market Report", "Hyperlocal"], role: "local market expert agent", task: "write a hyperlocal neighborhood market report for sellers", outputs: ["Price trends", "Inventory snapshot", "Buyer profile", "Pricing advice"] },
  { title: "Staging Recommendation List", tags: ["Staging", "Listings"], role: "home stager consultant", task: "recommend staging priorities room by room for faster sale", outputs: ["Priority rooms", "DIY vs pro", "Budget tiers", "Photo day prep"] },
  { title: "1031 Exchange Explainer", tags: ["1031", "Investing"], role: "commercial real estate advisor", task: "explain 1031 exchange basics and timelines to an investor client", outputs: ["Process overview", "Deadlines", "Qualified intermediaries", "Risk disclaimer"] },
  { title: "HOA Document Review Summary", tags: ["HOA", "Due Diligence"], role: "buyer agent advisor", task: "summarize HOA documents for buyer due diligence", outputs: ["Fee summary", "Rental restrictions", "Reserve health", "Red flags"] },
  { title: "Commercial LOI Drafter", tags: ["Commercial", "LOI"], role: "commercial broker", task: "draft a letter of intent for a commercial lease or purchase", outputs: ["Key terms", "Contingencies", "Timeline", "Next steps"] },
  { title: "Real Estate Newsletter Edition", tags: ["Newsletter", "Farming"], role: "geo-farming agent", task: "write a monthly real estate newsletter for a farm area", outputs: ["Market snapshot", "Featured listing", "Home tip", "Local event"] },
  { title: "Showing Feedback Synthesizer", tags: ["Showings", "Feedback"], role: "listing agent", task: "synthesize showing feedback into seller recommendations", outputs: ["Themes", "Price implications", "Staging fixes", "Seller conversation script"] },
  { title: "Short-Term Rental Rules Guide", tags: ["STR", "Regulations"], role: "STR consultant", task: "summarize short-term rental rules for a city and property type", outputs: ["Permit requirements", "Tax obligations", "Neighbor considerations", "Listing compliance"] },
  { title: "Relocation Client Concierge Plan", tags: ["Relocation", "Service"], role: "relocation specialist", task: "build a relocation concierge plan for corporate transferees", outputs: ["Timeline", "Area orientation", "School/resources", "Vendor referrals"] },
  { title: "Foreclosure Investor Due Diligence", tags: ["Foreclosure", "Investing"], role: "distressed property analyst", task: "outline due diligence steps for a foreclosure investment", outputs: ["Title issues", "Liens", "Repair estimate", "Exit strategy"] },
  { title: "Luxury Listing Story Writer", tags: ["Luxury", "Copy"], role: "luxury real estate copywriter", task: "write evocative luxury listing copy without clichés", outputs: ["Headline", "Property story", "Amenity highlights", "Broker remarks"] },
  { title: "Real Estate Video Tour Script", tags: ["Video", "Listings"], role: "real estate videographer", task: "script a walkthrough video tour with emotional beats", outputs: ["Opening hook", "Room-by-room script", "Neighborhood close", "CTA"] },
];

/** Additional catalog entries to reach ~30+ tools per category. */
export const BULK_CATALOG: StarterPromptDefinition[] = [
  ...batch("productivity", PRODUCTIVITY),
  ...batch("business", BUSINESS),
  ...batch("marketing", MARKETING),
  ...batch("coding", CODING),
  ...batch("finance", FINANCE),
  ...batch("writing", WRITING),
  ...batch("education", EDUCATION),
  ...batch("solar", SOLAR),
  ...batch("sales", SALES_EXTRA),
  ...batch("social-media", SOCIAL_EXTRA),
  ...batch("real-estate", REAL_ESTATE_EXTRA),
  // Free lead magnets (one per major category)
  ...batch("productivity", [{ title: "Daily Planning Template Generator", tags: ["Free", "Planning"], role: "productivity coach", task: "generate a printable daily planning template", outputs: ["Morning priorities", "Time blocks", "Evening review"], price: 0 }]),
  ...batch("marketing", [{ title: "Social Caption Starter Pack", tags: ["Free", "Social"], role: "social media manager", task: "generate 10 caption templates for the user's niche", outputs: ["10 captions", "Hashtag sets", "CTA variants"], price: 0 }]),
  ...batch("coding", [{ title: "Git Commit Message Helper", tags: ["Free", "Git"], role: "developer advocate", task: "write conventional commit messages from a change summary", outputs: ["Commit title", "Body", "Breaking change notes"], price: 0 }]),
];
