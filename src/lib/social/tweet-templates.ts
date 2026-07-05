export type TweetCategory =
  | "ai-prompt-marketplace"
  | "small-business"
  | "solar-sales"
  | "marketing-prompts"
  | "everyday-ai"
  | "free-prompt-promotion";

export const TWEET_CATEGORIES: { id: TweetCategory; label: string }[] = [
  { id: "ai-prompt-marketplace", label: "AI prompt marketplace" },
  { id: "small-business", label: "Small business" },
  { id: "solar-sales", label: "Solar sales" },
  { id: "marketing-prompts", label: "Marketing prompts" },
  { id: "everyday-ai", label: "Everyday AI" },
  { id: "free-prompt-promotion", label: "Free prompt promotion" },
];

export const TWEET_TEMPLATES: Record<TweetCategory, string[]> = {
  "ai-prompt-marketplace": [
    "Most people use ChatGPT like Google. Smart people use prompts like tools. SolePrompt gives you ready-made prompts you can use instantly: https://getsoleprompt.com",
    "Stop guessing what to ask AI. Browse curated prompts built for real work — business, marketing, solar, and more: https://getsoleprompt.com",
    "Prompts are the new shortcuts. SolePrompt is a marketplace of practical AI prompts you can buy, copy, and use today: https://getsoleprompt.com",
    "Your AI output is only as good as your prompt. Upgrade both with ready-made prompts from SolePrompt: https://getsoleprompt.com",
    "Why reinvent the wheel every time you open ChatGPT? Grab proven prompts on SolePrompt: https://getsoleprompt.com",
  ],
  "small-business": [
    "Need better AI results? Start with better prompts. Browse practical prompts for business, marketing, solar, and daily productivity: https://getsoleprompt.com",
    "Small business owners: AI can save hours — if you know what to ask. SolePrompt has prompts for emails, ads, ops, and more: https://getsoleprompt.com",
    "Running a business is hard enough. Let SolePrompt handle the prompt engineering so you can focus on customers: https://getsoleprompt.com",
    "From invoices to outreach, small teams use SolePrompt to get consistent AI results without a learning curve: https://getsoleprompt.com",
    "One good prompt beats ten mediocre ChatGPT sessions. Find business-ready prompts at https://getsoleprompt.com",
  ],
  "solar-sales": [
    "Solar reps: stop rewriting the same follow-ups. SolePrompt has prompts for proposals, objections, and outreach: https://getsoleprompt.com",
    "Close more solar deals with better messaging. Ready-made sales prompts on SolePrompt: https://getsoleprompt.com",
    "Homeowners have questions. Your AI should have answers. Use solar-specific prompts from SolePrompt: https://getsoleprompt.com",
    "Proposal emails, objection handling, appointment reminders — solar sales prompts that actually work: https://getsoleprompt.com",
    "Solar sales teams: copy, paste, send. Practical AI prompts built for your pipeline: https://getsoleprompt.com",
  ],
  "marketing-prompts": [
    "Marketing teams: better copy starts with better prompts. Ad hooks, emails, landing pages — on SolePrompt: https://getsoleprompt.com",
    "Stuck on your next campaign angle? Browse marketing prompts for ads, social, and email on SolePrompt: https://getsoleprompt.com",
    "Write faster without sounding generic. Marketing prompts that keep your brand voice sharp: https://getsoleprompt.com",
    "Content calendar empty? Fill it with AI-assisted drafts using proven marketing prompts: https://getsoleprompt.com",
    "From headlines to CTAs — marketing prompts that turn ChatGPT into a creative partner: https://getsoleprompt.com",
  ],
  "everyday-ai": [
    "I built SolePrompt to make AI easier for normal people. No prompt engineering degree needed. Just buy, copy, paste, and use: https://getsoleprompt.com",
    "AI shouldn't feel like homework. SolePrompt gives everyday people practical prompts for work and life: https://getsoleprompt.com",
    "Meal plans, emails, summaries, planning — everyday AI tasks get easier with the right prompt: https://getsoleprompt.com",
    "You don't need to be technical to get great AI results. Start with a prompt that already works: https://getsoleprompt.com",
    "Make AI useful on day one. Browse everyday prompts for productivity, writing, and planning: https://getsoleprompt.com",
  ],
  "free-prompt-promotion": [
    "Try SolePrompt free — explore practical AI prompts for business, marketing, solar, and daily life: https://getsoleprompt.com",
    "Free prompts, real results. See what's possible before you buy on SolePrompt: https://getsoleprompt.com",
    "Not sure where to start with AI? Grab a free prompt on SolePrompt and see the difference: https://getsoleprompt.com",
    "Zero risk way to upgrade your AI workflow: browse free prompts on SolePrompt today: https://getsoleprompt.com",
    "Free to explore. Easy to use. SolePrompt — prompts for people who'd rather work than prompt-engineer: https://getsoleprompt.com",
  ],
};

export function pickRandomTemplates(countPerCategory = 1): string[] {
  const tweets: string[] = [];

  for (const { id } of TWEET_CATEGORIES) {
    const templates = [...TWEET_TEMPLATES[id]];
    for (let i = 0; i < countPerCategory && templates.length > 0; i++) {
      const index = Math.floor(Math.random() * templates.length);
      tweets.push(templates.splice(index, 1)[0]!);
    }
  }

  return tweets;
}
