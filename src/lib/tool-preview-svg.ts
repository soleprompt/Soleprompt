import type { ToolCategorySlug } from "@/lib/tool-images";

type PreviewType =
  | "social-audit"
  | "solar-roi"
  | "email"
  | "resume"
  | "pack"
  | "analytics"
  | "code"
  | "finance"
  | "writing"
  | "productivity"
  | "sales"
  | "education";

const CATEGORY_ACCENTS: Record<ToolCategorySlug, string> = {
  productivity: "#818cf8",
  business: "#38bdf8",
  marketing: "#f97316",
  sales: "#f43f5e",
  solar: "#fbbf24",
  "social-media": "#06b6d4",
  "real-estate": "#14b8a6",
  coding: "#34d399",
  finance: "#facc15",
  writing: "#c084fc",
  education: "#f472b6",
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function detectPreviewType(title: string, category: ToolCategorySlug): PreviewType {
  const t = title.toLowerCase();

  if (/scrub|twitter|\bx\b|social media|linkedin|instagram|facebook|reputation/.test(t)) {
    return "social-audit";
  }
  if (/solar|roi|electric|bill|roof|panel|kw|payback/.test(t)) {
    return "solar-roi";
  }
  if (/email|outreach|cold|newsletter|subject line|sequence/.test(t)) {
    return "email";
  }
  if (/resume|cv|ats|bullet|cover letter|job application/.test(t)) {
    return "resume";
  }
  if (/pack|bundle|suite|collection|toolkit/.test(t)) {
    return "pack";
  }
  if (/analytics|dashboard|campaign|ads|seo|funnel|conversion|metric/.test(t)) {
    return "analytics";
  }
  if (/code|debug|api|developer|programming|script|github/.test(t)) {
    return "code";
  }
  if (/finance|budget|invoice|tax|forecast|pricing|roi/.test(t)) {
    return "finance";
  }
  if (/write|blog|copy|content|article|headline/.test(t)) {
    return "writing";
  }
  if (/sales|proposal|discovery|crm|pipeline|objection|close/.test(t)) {
    return "sales";
  }
  if (/lesson|course|quiz|student|curriculum|teach/.test(t)) {
    return "education";
  }
  if (/plan|focus|habit|goal|priorit|productiv|task/.test(t)) {
    return "productivity";
  }
  if (/listing|property|real estate|mls|realtor|rental|mortgage/.test(t)) {
    return "analytics";
  }

  const categoryMap: Record<string, PreviewType> = {
    productivity: "productivity",
    business: "analytics",
    marketing: "analytics",
    sales: "sales",
    solar: "solar-roi",
    coding: "code",
    finance: "finance",
    writing: "writing",
    education: "education",
    "social-media": "social-audit",
    "real-estate": "analytics",
  };

  return categoryMap[category] ?? "analytics";
}

function windowChrome(title: string, _accent: string): string {
  return `
  <rect x="40" y="50" width="520" height="270" rx="12" fill="#1a1a28" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <rect x="40" y="50" width="520" height="32" rx="12" fill="#111118"/>
  <rect x="40" y="70" width="520" height="12" fill="#1a1a28"/>
  <circle cx="58" cy="66" r="4" fill="#ef4444" opacity="0.7"/>
  <circle cx="72" cy="66" r="4" fill="#f59e0b" opacity="0.7"/>
  <circle cx="86" cy="66" r="4" fill="#22c55e" opacity="0.7"/>
  <text x="300" y="70" fill="#6b7280" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">${escapeXml(truncate(title, 42))}</text>`;
}

function socialAuditContent(accent: string): string {
  return `
    <circle cx="90" cy="115" r="22" fill="#1f2937" stroke="rgba(255,255,255,0.08)"/>
    <text x="90" y="120" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="16" text-anchor="middle" font-weight="700">𝕏</text>
    <text x="125" y="112" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="13" font-weight="500">Before → After</text>
    <text x="125" y="130" fill="#6b7280" font-family="system-ui,sans-serif" font-size="10">Brand cleanup audit</text>
    <rect x="70" y="150" width="220" height="90" rx="8" fill="#1f2937" stroke="#ef4444" stroke-width="1"/>
    <text x="85" y="172" fill="#ef4444" font-family="system-ui,sans-serif" font-size="9" font-weight="600">BEFORE</text>
    <text x="85" y="190" fill="#fca5a5" font-family="system-ui,sans-serif" font-size="9">3 risky posts flagged</text>
    <text x="85" y="205" fill="#6b7280" font-family="system-ui,sans-serif" font-size="8">Reputation: 62/100</text>
    <text x="85" y="225" fill="#6b7280" font-family="system-ui,sans-serif" font-size="8" text-decoration="line-through">"hot take: clients suck"</text>
    <rect x="310" y="150" width="220" height="90" rx="8" fill="#1f2937" stroke="#22c55e" stroke-width="1"/>
    <text x="325" y="172" fill="#22c55e" font-family="system-ui,sans-serif" font-size="9" font-weight="600">AFTER</text>
    <text x="325" y="190" fill="#86efac" font-family="system-ui,sans-serif" font-size="9">847 posts reviewed</text>
    <text x="325" y="205" fill="#6b7280" font-family="system-ui,sans-serif" font-size="8">Reputation: 92/100</text>
    <text x="325" y="225" fill="#86efac" font-family="system-ui,sans-serif" font-size="8">Export-ready report</text>
    <path d="M 290 195 L 305 195" stroke="${accent}" stroke-width="2" marker-end="url(#arrow)"/>
    <rect x="70" y="255" width="120" height="28" rx="6" fill="${accent}" opacity="0.9"/>
    <text x="130" y="273" fill="white" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle" font-weight="600">Run Audit</text>`;
}

function solarRoiContent(accent: string): string {
  return `
    <text x="70" y="110" fill="#6b7280" font-family="system-ui,sans-serif" font-size="10">Monthly Bill</text>
    <text x="70" y="135" fill="#ef4444" font-family="system-ui,sans-serif" font-size="22" font-weight="700">$284</text>
    <text x="200" y="125" fill="${accent}" font-family="system-ui,sans-serif" font-size="20">→</text>
    <text x="240" y="110" fill="#6b7280" font-family="system-ui,sans-serif" font-size="10">Annual Savings</text>
    <text x="240" y="135" fill="#22c55e" font-family="system-ui,sans-serif" font-size="22" font-weight="700">$1,840</text>
    <rect x="70" y="155" width="460" height="8" rx="4" fill="#1f2937"/>
    <rect x="70" y="155" width="310" height="8" rx="4" fill="${accent}" opacity="0.8"/>
    <text x="70" y="180" fill="#6b7280" font-family="system-ui,sans-serif" font-size="9">Payback period</text>
    <text x="200" y="180" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="9" font-weight="600">6.2 years</text>
    <text x="320" y="180" fill="#6b7280" font-family="system-ui,sans-serif" font-size="9">25-yr savings</text>
    <text x="430" y="180" fill="#22c55e" font-family="system-ui,sans-serif" font-size="9" font-weight="600">$46,200</text>
    <rect x="70" y="200" width="130" height="55" rx="8" fill="#1f2937" stroke="rgba(255,255,255,0.06)"/>
    <text x="85" y="220" fill="#6b7280" font-family="system-ui,sans-serif" font-size="8">System Size</text>
    <text x="85" y="240" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="14" font-weight="600">8.4 kW</text>
    <rect x="215" y="200" width="130" height="55" rx="8" fill="#1f2937" stroke="rgba(255,255,255,0.06)"/>
    <text x="230" y="220" fill="#6b7280" font-family="system-ui,sans-serif" font-size="8">Tax Credit</text>
    <text x="230" y="240" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="14" font-weight="600">30%</text>
    <rect x="360" y="200" width="170" height="55" rx="8" fill="#1f2937" stroke="${accent}" stroke-width="1"/>
    <text x="375" y="220" fill="#6b7280" font-family="system-ui,sans-serif" font-size="8">ROI Score</text>
    <text x="375" y="240" fill="${accent}" font-family="system-ui,sans-serif" font-size="14" font-weight="700">Excellent</text>`;
}

function emailContent(accent: string): string {
  return `
    <rect x="70" y="100" width="460" height="200" rx="10" fill="#111118" stroke="rgba(255,255,255,0.06)"/>
    <text x="90" y="125" fill="#6b7280" font-family="system-ui,sans-serif" font-size="9">To: sarah@acmeco.com</text>
    <text x="90" y="148" fill="${accent}" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Subject: Quick idea for Acme Co.</text>
    <line x1="90" y1="158" x2="510" y2="158" stroke="rgba(255,255,255,0.06)"/>
    <text x="90" y="178" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="9">Hi Sarah —</text>
    <text x="90" y="195" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="9">I noticed Acme's recent product launch. We helped</text>
    <text x="90" y="210" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="9">similar teams increase qualified leads 34% in 90 days.</text>
    <text x="90" y="235" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="9">Would a 15-min call next week work?</text>
    <rect x="90" y="255" width="90" height="24" rx="6" fill="${accent}" opacity="0.85"/>
    <text x="135" y="271" fill="white" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle" font-weight="600">Send</text>
    <rect x="400" y="255" width="80" height="24" rx="6" fill="#22c55e" opacity="0.15" stroke="#22c55e"/>
    <text x="440" y="271" fill="#22c55e" font-family="system-ui,sans-serif" font-size="8" text-anchor="middle">94% score</text>`;
}

function resumeContent(accent: string): string {
  return `
    <rect x="70" y="100" width="200" height="195" rx="8" fill="#1f2937" stroke="#ef4444" stroke-width="1"/>
    <text x="85" y="120" fill="#ef4444" font-family="system-ui,sans-serif" font-size="9" font-weight="600">BEFORE · ATS 58%</text>
    <text x="85" y="142" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="10" font-weight="600">John Smith</text>
    <text x="85" y="160" fill="#6b7280" font-family="system-ui,sans-serif" font-size="8">• Managed stuff</text>
    <text x="85" y="175" fill="#6b7280" font-family="system-ui,sans-serif" font-size="8">• Did things well</text>
    <text x="85" y="190" fill="#6b7280" font-family="system-ui,sans-serif" font-size="8">• Worked on projects</text>
    <rect x="85" y="210" width="160" height="6" rx="3" fill="#374151"/>
    <rect x="85" y="210" width="93" height="6" rx="3" fill="#ef4444"/>
    <text x="85" y="235" fill="#ef4444" font-family="system-ui,sans-serif" font-size="8">Missing keywords</text>
    <rect x="290" y="100" width="240" height="195" rx="8" fill="#1f2937" stroke="#22c55e" stroke-width="1"/>
    <text x="305" y="120" fill="#22c55e" font-family="system-ui,sans-serif" font-size="9" font-weight="600">AFTER · ATS 94%</text>
    <text x="305" y="142" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="10" font-weight="600">John Smith</text>
    <text x="305" y="160" fill="#86efac" font-family="system-ui,sans-serif" font-size="8">• Led 12-person team, +34% revenue</text>
    <text x="305" y="175" fill="#86efac" font-family="system-ui,sans-serif" font-size="8">• Reduced costs $2.1M via automation</text>
    <text x="305" y="190" fill="#86efac" font-family="system-ui,sans-serif" font-size="8">• Launched 3 products, 50K users</text>
    <rect x="305" y="210" width="210" height="6" rx="3" fill="#374151"/>
    <rect x="305" y="210" width="197" height="6" rx="3" fill="#22c55e"/>
    <text x="305" y="235" fill="#22c55e" font-family="system-ui,sans-serif" font-size="8">✓ All keywords matched</text>
    <path d="M 270 197 L 285 197" stroke="${accent}" stroke-width="2"/>`;
}

function packContent(accent: string, title: string): string {
  const shortTitle = truncate(title, 18);
  return `
    <rect x="120" y="200" width="360" height="80" rx="10" fill="#1a1a28" stroke="rgba(255,255,255,0.04)" transform="rotate(-4 300 240)"/>
    <rect x="110" y="175" width="360" height="80" rx="10" fill="#1f2937" stroke="rgba(255,255,255,0.06)" transform="rotate(-2 290 215)"/>
    <rect x="100" y="150" width="360" height="80" rx="10" fill="#252535" stroke="rgba(255,255,255,0.08)" transform="rotate(1 280 190)"/>
    <rect x="90" y="125" width="380" height="90" rx="10" fill="#1a1a28" stroke="${accent}" stroke-width="1.5"/>
    <text x="110" y="155" fill="${accent}" font-family="system-ui,sans-serif" font-size="10" font-weight="600">${escapeXml(shortTitle)}</text>
    <text x="110" y="175" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="11">Complete AI toolkit</text>
    <text x="110" y="195" fill="#6b7280" font-family="system-ui,sans-serif" font-size="9">Copy-paste prompts · Ready in seconds</text>
    <rect x="380" y="145" width="70" height="22" rx="6" fill="${accent}" opacity="0.2" stroke="${accent}"/>
    <text x="415" y="160" fill="${accent}" font-family="system-ui,sans-serif" font-size="8" text-anchor="middle" font-weight="600">PACK</text>`;
}

function analyticsContent(accent: string): string {
  const bars = [80, 120, 95, 155, 130, 175, 145];
  const barSvg = bars
    .map((h, i) => {
      const x = 90 + i * 58;
      const y = 250 - h;
      return `<rect x="${x}" y="${y}" width="36" height="${h}" rx="4" fill="${accent}" opacity="${0.35 + (i % 3) * 0.2}"/>`;
    })
    .join("");

  return `
    <text x="70" y="105" fill="#6b7280" font-family="system-ui,sans-serif" font-size="9">Campaign Performance</text>
    <text x="70" y="128" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="20" font-weight="700">+127%</text>
    <text x="150" y="128" fill="#22c55e" font-family="system-ui,sans-serif" font-size="11">↑ conversions</text>
    <rect x="350" y="95" width="180" height="40" rx="8" fill="#1f2937" stroke="rgba(255,255,255,0.06)"/>
    <text x="365" y="112" fill="#6b7280" font-family="system-ui,sans-serif" font-size="8">ROAS</text>
    <text x="365" y="128" fill="${accent}" font-family="system-ui,sans-serif" font-size="14" font-weight="700">4.2x</text>
    ${barSvg}
    <line x1="70" y1="255" x2="510" y2="255" stroke="rgba(255,255,255,0.08)"/>`;
}

function codeContent(accent: string): string {
  return `
    <rect x="70" y="100" width="460" height="195" rx="10" fill="#0d1117" stroke="rgba(255,255,255,0.06)"/>
    <text x="90" y="125" fill="#6b7280" font-family="monospace" font-size="9">// AI-generated solution</text>
    <text x="90" y="145" fill="${accent}" font-family="monospace" font-size="9">async function</text>
    <text x="175" y="145" fill="#e5e7eb" font-family="monospace" font-size="9">optimize() {</text>
    <text x="110" y="165" fill="#22c55e" font-family="monospace" font-size="9">const</text>
    <text x="145" y="165" fill="#e5e7eb" font-family="monospace" font-size="9">result = await analyze();</text>
    <text x="110" y="185" fill="#f59e0b" font-family="monospace" font-size="9">return</text>
    <text x="155" y="185" fill="#e5e7eb" font-family="monospace" font-size="9">formatOutput(result);</text>
    <text x="90" y="205" fill="#e5e7eb" font-family="monospace" font-size="9">}</text>
    <rect x="90" y="230" width="100" height="22" rx="4" fill="#22c55e" opacity="0.15" stroke="#22c55e"/>
    <text x="140" y="245" fill="#22c55e" font-family="monospace" font-size="8" text-anchor="middle">✓ Tests pass</text>
    <rect x="380" y="230" width="120" height="22" rx="4" fill="${accent}" opacity="0.15" stroke="${accent}"/>
    <text x="440" y="245" fill="${accent}" font-family="monospace" font-size="8" text-anchor="middle">Ready to deploy</text>`;
}

function genericListContent(accent: string, label: string): string {
  const items = ["Structured output", "Copy-ready results", "Step-by-step guide", "Instant download"];
  const rows = items
    .map((item, i) => {
      const y = 120 + i * 38;
      return `
    <rect x="70" y="${y}" width="460" height="30" rx="8" fill="#1f2937" stroke="rgba(255,255,255,0.04)"/>
    <circle cx="90" cy="${y + 15}" r="6" fill="${accent}" opacity="0.3"/>
    <text x="90" cy="${y + 15}" fill="${accent}" font-family="system-ui,sans-serif" font-size="8" text-anchor="middle" dominant-baseline="middle">✓</text>
    <text x="108" y="${y + 19}" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="10">${item}</text>`;
    })
    .join("");

  return `
    <text x="70" y="108" fill="#6b7280" font-family="system-ui,sans-serif" font-size="10">${escapeXml(label)}</text>
    ${rows}
    <rect x="70" y="275" width="140" height="28" rx="6" fill="${accent}" opacity="0.85"/>
    <text x="140" y="293" fill="white" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle" font-weight="600">Get Started</text>`;
}

function renderContent(type: PreviewType, accent: string, title: string): string {
  switch (type) {
    case "social-audit":
      return socialAuditContent(accent);
    case "solar-roi":
      return solarRoiContent(accent);
    case "email":
      return emailContent(accent);
    case "resume":
      return resumeContent(accent);
    case "pack":
      return packContent(accent, title);
    case "analytics":
      return analyticsContent(accent);
    case "code":
      return codeContent(accent);
    case "finance":
      return analyticsContent(accent);
    case "sales":
      return emailContent(accent);
    case "writing":
      return genericListContent(accent, "Content Generator");
    case "education":
      return genericListContent(accent, "Learning Assistant");
    case "productivity":
      return genericListContent(accent, "Productivity Tool");
    default:
      return analyticsContent(accent);
  }
}

export function generateToolPreviewSvg(
  title: string,
  categorySlug: ToolCategorySlug,
): string {
  const accent = CATEGORY_ACCENTS[categorySlug] ?? "#0066ff";
  const previewType = detectPreviewType(title, categorySlug);
  const shortTitle = truncate(title, 36);
  const content = renderContent(previewType, accent, title);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 375" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="600" y2="375" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a0a12"/>
      <stop offset="100%" stop-color="#14141f"/>
    </linearGradient>
    <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="${accent}"/>
    </marker>
  </defs>
  <rect width="600" height="375" fill="url(#bg)"/>
  <circle cx="520" cy="60" r="80" fill="${accent}" opacity="0.12"/>
  <circle cx="80" cy="320" r="60" fill="#0066ff" opacity="0.08"/>
  ${windowChrome(shortTitle, accent)}
  ${content}
  <rect x="0" y="340" width="600" height="35" fill="black" opacity="0.3"/>
  <text x="24" y="362" fill="#6b7280" font-family="system-ui,sans-serif" font-size="11" font-weight="500">SolePrompt</text>
</svg>`;
}

export function getGeneratedToolPreviewUrl(
  title: string,
  categorySlug: ToolCategorySlug,
): string {
  const params = new URLSearchParams({
    title,
    category: categorySlug,
  });
  return `/api/tool-preview?${params.toString()}`;
}

/** @deprecated Use getGeneratedToolPreviewUrl — data URLs break next/image on some cards. */
export function getGeneratedToolPreviewDataUrl(
  title: string,
  categorySlug: ToolCategorySlug,
): string {
  const svg = generateToolPreviewSvg(title, categorySlug);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
