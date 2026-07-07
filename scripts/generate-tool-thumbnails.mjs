#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "..", "public");

const ELECTRIC = "#0066ff";
const BG_START = "#0a0a12";
const BG_END = "#14141f";
const CARD = "#1a1a28";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "#6b7280";
const TEXT = "#e5e7eb";

function base(accent, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 375" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="600" y2="375" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${BG_START}"/>
      <stop offset="100%" stop-color="${BG_END}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${ELECTRIC}" stop-opacity="0.15"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="600" height="375" fill="url(#bg)"/>
  <circle cx="520" cy="60" r="80" fill="${accent}" opacity="0.12"/>
  <circle cx="80" cy="320" r="60" fill="${ELECTRIC}" opacity="0.08"/>
  ${body}
  <rect x="0" y="340" width="600" height="35" fill="black" opacity="0.3"/>
  <text x="24" y="362" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="11" font-weight="500">SolePrompt</text>
</svg>`;
}

function windowChrome(x, y, w, h, title, content) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${CARD}" stroke="${BORDER}" stroke-width="1"/>
  <rect x="${x}" y="${y}" width="${w}" height="32" rx="12" fill="#111118"/>
  <rect x="${x}" y="${y + 20}" width="${w}" height="12" fill="${CARD}"/>
  <circle cx="${x + 18}" cy="${y + 16}" r="4" fill="#ef4444" opacity="0.7"/>
  <circle cx="${x + 32}" cy="${y + 16}" r="4" fill="#f59e0b" opacity="0.7"/>
  <circle cx="${x + 46}" cy="${y + 16}" r="4" fill="#22c55e" opacity="0.7"/>
  <text x="${x + w / 2}" y="${y + 20}" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">${title}</text>
  ${content}`;
}

const THUMBNAILS = {
  "tools/solar-roi-calculator.svg": base("#f59e0b", `
  ${windowChrome(40, 50, 520, 270, "Solar ROI Calculator", `
    <text x="70" y="110" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="18" font-weight="600">25-Year Savings</text>
    <text x="70" y="140" fill="#22c55e" font-family="system-ui,sans-serif" font-size="28" font-weight="700">$47,820</text>
    <rect x="70" y="160" width="200" height="8" rx="4" fill="#1f2937"/>
    <rect x="70" y="160" width="140" height="8" rx="4" fill="#22c55e"/>
    <text x="70" y="195" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="11">Payback: 6.2 years</text>
    <text x="70" y="215" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="11">ROI: 142%</text>
    <rect x="300" y="100" width="230" height="150" rx="8" fill="url(#accent)" stroke="${BORDER}"/>
    <polyline points="320,220 360,180 400,190 440,140 480,120 510,100" stroke="${ELECTRIC}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="320" cy="220" r="3" fill="${ELECTRIC}"/><circle cx="510" cy="100" r="3" fill="#22c55e"/>
    <rect x="300" y="265" width="60" height="24" rx="6" fill="${ELECTRIC}" opacity="0.9"/>
    <text x="330" y="281" fill="white" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle" font-weight="600">Calculate</text>
    <g transform="translate(480,155)">
      <rect x="0" y="0" width="36" height="36" rx="6" fill="#f59e0b" opacity="0.2" stroke="#f59e0b" stroke-width="1"/>
      <circle cx="18" cy="18" r="10" fill="#f59e0b" opacity="0.6"/>
      <line x1="18" y1="8" x2="18" y2="18" stroke="white" stroke-width="1.5"/><line x1="18" y1="18" x2="26" y2="22" stroke="white" stroke-width="1.5"/>
    </g>
  `)}`),

  "tools/electric-bill-savings.svg": base("#f59e0b", `
  ${windowChrome(40, 50, 520, 270, "Bill → Savings Estimator", `
    <text x="70" y="105" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="11">Monthly Electric Bill</text>
    <text x="70" y="130" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="22" font-weight="600">$248/mo</text>
    <rect x="70" y="150" width="180" height="70" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="90" y="175" fill="#ef4444" font-family="system-ui,sans-serif" font-size="12">Before</text>
    <rect x="90" y="185" width="60" height="24" rx="4" fill="#ef4444" opacity="0.6"/>
    <rect x="70" y="150" width="180" height="70" rx="8" fill="none"/>
    <rect x="270" y="150" width="180" height="70" rx="8" fill="#1f2937" stroke="#22c55e" stroke-width="1"/>
    <text x="290" y="175" fill="#22c55e" font-family="system-ui,sans-serif" font-size="12">After Solar</text>
    <rect x="290" y="185" width="35" height="24" rx="4" fill="#22c55e" opacity="0.7"/>
    <text x="290" y="240" fill="#22c55e" font-family="system-ui,sans-serif" font-size="16" font-weight="600">Save ~$186/mo</text>
    <rect x="470" y="100" width="60" height="80" rx="6" fill="${ELECTRIC}" opacity="0.15" stroke="${ELECTRIC}" stroke-width="1"/>
    <rect x="478" y="130" width="44" height="6" rx="2" fill="${ELECTRIC}" opacity="0.5"/>
    <rect x="478" y="142" width="36" height="6" rx="2" fill="${ELECTRIC}" opacity="0.35"/>
    <rect x="478" y="154" width="40" height="6" rx="2" fill="${ELECTRIC}" opacity="0.25"/>
  `)}`),

  "tools/solar-lead-qualifier.svg": base("#f59e0b", `
  ${windowChrome(40, 50, 520, 270, "Lead Qualifier Script", `
    <circle cx="90" cy="115" r="20" fill="${ELECTRIC}" opacity="0.2" stroke="${ELECTRIC}" stroke-width="1.5"/>
    <path d="M85 115 L88 118 L95 110" stroke="${ELECTRIC}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <text x="120" y="112" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="13" font-weight="500">Roof age & condition?</text>
    <text x="120" y="130" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="10">Qualification checklist</text>
    <line x1="70" y1="145" x2="530" y2="145" stroke="${BORDER}"/>
    <circle cx="90" cy="170" r="20" fill="#22c55e" opacity="0.15" stroke="#22c55e" stroke-width="1.5"/>
    <path d="M85 170 L88 173 L95 165" stroke="#22c55e" stroke-width="2" fill="none"/>
    <text x="120" y="167" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="13">Monthly bill over $100?</text>
    <text x="120" y="185" fill="#22c55e" font-family="system-ui,sans-serif" font-size="10">Green light ✓</text>
    <circle cx="90" cy="220" r="20" fill="#1f2937" stroke="${BORDER}" stroke-width="1.5"/>
    <text x="90" y="225" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="14" text-anchor="middle">3</text>
    <text x="120" y="217" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="13">Homeowner & timeline?</text>
    <rect x="70" y="250" width="460" height="36" rx="8" fill="${ELECTRIC}" opacity="0.15" stroke="${ELECTRIC}" stroke-width="1"/>
    <text x="300" y="273" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="12" text-anchor="middle" font-weight="600">📞 60-sec opener script</text>
  `)}`),

  "tools/roof-suitability-checklist.svg": base("#f59e0b", `
  <polygon points="300,80 180,160 420,160" fill="#1f2937" stroke="${BORDER}" stroke-width="1.5"/>
  <rect x="220" y="160" width="160" height="100" fill="#1a1a28" stroke="${BORDER}"/>
  <rect x="270" y="200" width="60" height="60" fill="#0a0a12" stroke="${BORDER}"/>
  <rect x="200" y="200" width="200" height="8" fill="#f59e0b" opacity="0.5"/>
  <g transform="translate(440,90)">
    <rect width="100" height="120" rx="8" fill="${CARD}" stroke="${BORDER}"/>
    <text x="50" y="25" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">Checklist</text>
    <circle cx="20" cy="45" r="6" fill="#22c55e" opacity="0.3"/><path d="M17 45 L19 47 L23 42" stroke="#22c55e" stroke-width="1.5" fill="none"/>
    <text x="32" y="48" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="9">Orientation</text>
    <circle cx="20" cy="68" r="6" fill="#22c55e" opacity="0.3"/><path d="M17 68 L19 70 L23 65" stroke="#22c55e" stroke-width="1.5" fill="none"/>
    <text x="32" y="71" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="9">Shading</text>
    <circle cx="20" cy="91" r="6" fill="#f59e0b" opacity="0.3"/><text x="20" y="94" fill="#f59e0b" font-family="system-ui,sans-serif" font-size="8" text-anchor="middle">!</text>
    <text x="32" y="94" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="9">Structure</text>
    <text x="50" y="115" fill="#f59e0b" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="middle">8/10</text>
  </g>
  <text x="300" y="295" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="14" font-weight="600" text-anchor="middle">Roof Suitability Score</text>`),

  "tools/solar-objection-handler.svg": base("#f59e0b", `
  ${windowChrome(40, 50, 520, 270, "Objection Handler", `
    <rect x="70" y="100" width="200" height="50" rx="10" fill="#1f2937" stroke="${BORDER}"/>
    <text x="85" y="122" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="10">Homeowner</text>
    <text x="85" y="140" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="11">"Solar is too expensive..."</text>
    <rect x="290" y="120" width="220" height="80" rx="10" fill="${ELECTRIC}" opacity="0.12" stroke="${ELECTRIC}" stroke-width="1"/>
    <text x="305" y="142" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="10" font-weight="600">Your response</text>
    <text x="305" y="160" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="10">Acknowledge → Reframe → Proof</text>
    <text x="305" y="178" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9">Monthly payment vs. utility bill...</text>
    <rect x="70" y="210" width="130" height="28" rx="6" fill="#1f2937" stroke="${BORDER}"/>
    <text x="135" y="229" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">Cost</text>
    <rect x="210" y="210" width="130" height="28" rx="6" fill="#1f2937" stroke="${BORDER}"/>
    <text x="275" y="229" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">HOA</text>
    <rect x="350" y="210" width="130" height="28" rx="6" fill="#1f2937" stroke="${BORDER}"/>
    <text x="415" y="229" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">Moving</text>
  `)}`),

  "tools/solar-sales-ai-pack.svg": base("#f59e0b", `
  <text x="300" y="85" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="16" font-weight="600" text-anchor="middle">Solar Sales AI Pack</text>
  <text x="300" y="105" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle">8 prompts · Premium bundle</text>
  ${[0,1,2,3].map(i => `<rect x="${60 + (i%2)*240}" y="${120 + Math.floor(i/2)*70}" width="220" height="55" rx="8" fill="${CARD}" stroke="${BORDER}"/>`).join("")}
  ${["Lead Qualifier","Discovery Call","Objections","Appointment"].map((t,i) => `<text x="${170 + (i%2)*240}" y="${152 + Math.floor(i/2)*70}" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle">${t}</text>`).join("")}
  ${[0,1,2,3].map(i => `<rect x="${60 + (i%2)*240}" y="${260 + Math.floor(i/2)*0}" width="220" height="55" rx="8" fill="${CARD}" stroke="${BORDER}" opacity="${i<2?1:0}"/>`).join("")}
  <rect x="60" y="260" width="220" height="55" rx="8" fill="${CARD}" stroke="${BORDER}"/>
  <text x="170" y="292" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle">Site Visit Prep</text>
  <rect x="300" y="260" width="220" height="55" rx="8" fill="${CARD}" stroke="${BORDER}"/>
  <text x="410" y="292" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle">Close & Contract</text>
  <rect x="230" y="325" width="140" height="28" rx="14" fill="${ELECTRIC}" opacity="0.2" stroke="${ELECTRIC}"/>
  <text x="300" y="344" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">8 Prompts Included</text>`),

  "tools/solar-proposal-generator-pack.svg": base("#f59e0b", `
  <rect x="160" y="60" width="280" height="260" rx="8" fill="white" opacity="0.95"/>
  <rect x="160" y="60" width="280" height="40" rx="8" fill="#f59e0b" opacity="0.9"/>
  <rect x="160" y="88" width="280" height="12" fill="#f59e0b" opacity="0.9"/>
  <text x="300" y="86" fill="white" font-family="system-ui,sans-serif" font-size="13" font-weight="600" text-anchor="middle">Solar Proposal</text>
  <rect x="180" y="115" width="240" height="8" rx="2" fill="#e5e7eb"/>
  <rect x="180" y="130" width="200" height="6" rx="2" fill="#e5e7eb"/>
  <rect x="180" y="145" width="220" height="6" rx="2" fill="#e5e7eb"/>
  <rect x="180" y="170" width="110" height="70" rx="6" fill="#f3f4f6"/>
  <text x="235" y="200" fill="#374151" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">ROI Summary</text>
  <text x="235" y="218" fill="#22c55e" font-family="system-ui,sans-serif" font-size="14" font-weight="700" text-anchor="middle">$42k</text>
  <rect x="300" y="170" width="120" height="70" rx="6" fill="#f3f4f6"/>
  <polyline points="310,220 330,200 350,205 370,185 400,175" stroke="${ELECTRIC}" stroke-width="2" fill="none"/>
  <rect x="180" y="255" width="240" height="40" rx="6" fill="${ELECTRIC}" opacity="0.15"/>
  <text x="300" y="280" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">7 Proposal Templates</text>
  <rect x="60" y="120" width="80" height="100" rx="6" fill="${CARD}" stroke="${BORDER}" transform="rotate(-8 100 170)"/>
  <rect x="460" y="120" width="80" height="100" rx="6" fill="${CARD}" stroke="${BORDER}" transform="rotate(8 500 170)"/>`),

  "tools/x-scrubbing-tool.svg": base("#0ea5e9", `
  ${windowChrome(40, 50, 520, 270, "X Account Audit", `
    <circle cx="90" cy="115" r="22" fill="#1f2937" stroke="${BORDER}"/>
    <text x="90" y="120" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="16" text-anchor="middle" font-weight="700">𝕏</text>
    <text x="125" y="112" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="13" font-weight="500">@brand_account</text>
    <text x="125" y="130" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="10">Scanning timeline...</text>
    <rect x="70" y="150" width="460" height="44" rx="8" fill="#1f2937" stroke="#ef4444" stroke-width="1"/>
    <text x="85" y="170" fill="#ef4444" font-family="system-ui,sans-serif" font-size="10">⚠ Risky tweet · 2019</text>
    <text x="85" y="185" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9">"This post may harm your brand..."</text>
    <rect x="420" y="160" width="90" height="24" rx="6" fill="#ef4444" opacity="0.2" stroke="#ef4444"/>
    <text x="465" y="176" fill="#ef4444" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">Delete</text>
    <rect x="70" y="205" width="460" height="44" rx="8" fill="#1f2937" stroke="#22c55e" stroke-width="1"/>
    <text x="85" y="225" fill="#22c55e" font-family="system-ui,sans-serif" font-size="10">✓ Clean · Brand safe</text>
    <text x="85" y="240" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9">847 posts reviewed</text>
    <rect x="70" y="260" width="120" height="28" rx="6" fill="${ELECTRIC}" opacity="0.9"/>
    <text x="130" y="278" fill="white" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle" font-weight="600">Run Audit</text>
  `)}`),

  "tools/cold-outreach-email.svg": base("#22c55e", `
  ${windowChrome(40, 50, 520, 270, "Cold Outreach Email", `
    <text x="70" y="105" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="10">To:</text>
    <text x="95" y="105" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="11">prospect@company.com</text>
    <text x="70" y="125" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="10">Subject:</text>
    <text x="125" y="125" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="11" font-weight="500">Quick idea for {{Company}}</text>
    <line x1="70" y1="135" x2="530" y2="135" stroke="${BORDER}"/>
    <text x="70" y="160" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="11">Hi {{Name}},</text>
    <rect x="70" y="170" width="400" height="6" rx="2" fill="#374151"/>
    <rect x="70" y="182" width="350" height="6" rx="2" fill="#374151"/>
    <rect x="70" y="194" width="380" height="6" rx="2" fill="#374151"/>
    <rect x="70" y="220" width="200" height="6" rx="2" fill="${ELECTRIC}" opacity="0.4"/>
    <text x="70" y="250" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="10">+ Follow-up at day 3 & 7</text>
    <rect x="400" y="240" width="100" height="32" rx="8" fill="#22c55e" opacity="0.2" stroke="#22c55e"/>
    <text x="450" y="261" fill="#22c55e" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">Send</text>
  `)}`),

  "tools/resume-bullet-improver.svg": base("#a855f7", `
  ${windowChrome(40, 50, 520, 270, "Resume Optimizer", `
    <text x="70" y="105" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="10">Before</text>
    <rect x="70" y="112" width="200" height="50" rx="6" fill="#1f2937" stroke="${BORDER}"/>
    <text x="80" y="132" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="9">• Managed team projects</text>
    <text x="80" y="148" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="9">• Did sales tasks</text>
    <text x="300" y="105" fill="#22c55e" font-family="system-ui,sans-serif" font-size="10">After</text>
    <rect x="300" y="112" width="220" height="50" rx="6" fill="#22c55e" opacity="0.1" stroke="#22c55e" stroke-width="1"/>
    <text x="310" y="132" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="9">• Led 12-person team, +34% revenue</text>
    <text x="310" y="148" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="9">• Closed $2.1M in enterprise deals</text>
    <rect x="70" y="180" width="450" height="60" rx="8" fill="${CARD}" stroke="${BORDER}"/>
    <text x="85" y="200" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="10">ATS Keywords</text>
    <rect x="85" y="210" width="70" height="20" rx="10" fill="${ELECTRIC}" opacity="0.2"/><text x="120" y="224" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">leadership</text>
    <rect x="165" y="210" width="55" height="20" rx="10" fill="${ELECTRIC}" opacity="0.2"/><text x="192" y="224" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">KPIs</text>
    <rect x="230" y="210" width="80" height="20" rx="10" fill="${ELECTRIC}" opacity="0.2"/><text x="270" y="224" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">stakeholder</text>
    <rect x="70" y="255" width="180" height="30" rx="6" fill="#a855f7" opacity="0.2" stroke="#a855f7"/>
    <text x="160" y="275" fill="#a855f7" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">Optimize Bullets</text>
  `)}`),

  "tools/welcome-pack.svg": base(ELECTRIC, `
  <text x="300" y="90" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="18" font-weight="600" text-anchor="middle">Welcome Pack</text>
  <text x="300" y="115" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle">Starter prompts for every workflow</text>
  ${[0,1,2,3,4,5].map(i => `<rect x="${80 + (i%3)*150}" y="${130 + Math.floor(i/3)*75}" width="130" height="60" rx="8" fill="${CARD}" stroke="${BORDER}"/>`).join("")}
  <text x="145" y="168" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">Writing</text>
  <text x="295" y="168" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">Business</text>
  <text x="445" y="168" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">Coding</text>
  <text x="145" y="243" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">Marketing</text>
  <text x="295" y="243" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">Sales</text>
  <text x="445" y="243" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">+ more</text>`),

  "tools/social-scrubbing-suite.svg": base("#0ea5e9", `
  ${windowChrome(40, 50, 520, 270, "Social Scrubbing Suite", `
    <rect x="70" y="100" width="100" height="100" rx="12" fill="#1f2937" stroke="${BORDER}"/>
    <text x="120" y="155" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="20" text-anchor="middle">𝕏</text>
    <rect x="190" y="100" width="100" height="100" rx="12" fill="#1f2937" stroke="${BORDER}"/>
    <text x="240" y="155" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="20" text-anchor="middle">in</text>
    <rect x="310" y="100" width="100" height="100" rx="12" fill="#1f2937" stroke="${BORDER}"/>
    <text x="360" y="155" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="20" text-anchor="middle">f</text>
    <rect x="430" y="100" width="100" height="100" rx="12" fill="#1f2937" stroke="${BORDER}"/>
    <text x="480" y="155" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="20" text-anchor="middle">📷</text>
    <rect x="70" y="220" width="460" height="50" rx="8" fill="${ELECTRIC}" opacity="0.1" stroke="${ELECTRIC}"/>
    <text x="300" y="242" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="12" text-anchor="middle" font-weight="600">Clean your brand across all platforms</text>
    <text x="300" y="260" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">Multi-platform audit & delete prompts</text>
  `)}`),

  "tools/productivity-power-pack.svg": base("#6366f1", `
  <text x="300" y="85" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="16" font-weight="600" text-anchor="middle">Productivity Power Pack</text>
  <text x="300" y="105" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle">10 prompts · Planning & focus</text>
  ${["Daily Plan","Weekly Plan","Focus","Habits","Inbox Zero","Goals"].map((t,i)=>`<rect x="${70+(i%3)*155}" y="${120+Math.floor(i/3)*65}" width="140" height="50" rx="8" fill="${CARD}" stroke="${BORDER}"/><text x="${140+(i%3)*155}" y="${150+Math.floor(i/3)*65}" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">${t}</text>`).join("")}
  <rect x="200" y="265" width="200" height="30" rx="14" fill="#6366f1" opacity="0.2" stroke="#6366f1"/>
  <text x="300" y="285" fill="#6366f1" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">10 Tools Included</text>`),

  "tools/freelancer-essentials-bundle.svg": base("#0ea5e9", `
  ${windowChrome(40, 50, 520, 270, "Freelancer Essentials", `
    <rect x="70" y="100" width="200" height="70" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="85" y="125" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="10" font-weight="600">Proposal</text>
    <text x="85" y="145" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9">Scope · Timeline · Pricing</text>
    <rect x="290" y="100" width="240" height="70" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="305" y="125" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="10" font-weight="600">Cold Outreach</text>
    <text x="305" y="145" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9">Subject + 3 follow-ups</text>
    <rect x="70" y="185" width="150" height="50" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="145" y="215" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">Rate Calculator</text>
    <rect x="235" y="185" width="150" height="50" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="310" y="215" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">SOP Writer</text>
    <rect x="400" y="185" width="130" height="50" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="465" y="215" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">Invoices</text>
    <rect x="70" y="250" width="460" height="35" rx="8" fill="${ELECTRIC}" opacity="0.12" stroke="${ELECTRIC}"/>
    <text x="300" y="273" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">8 Freelancer Tools · $12.99</text>
  `)}`),

  "tools/social-media-growth-bundle.svg": base("#f97316", `
  ${windowChrome(40, 50, 520, 270, "Social Growth Bundle", `
    <text x="300" y="115" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="14" font-weight="600" text-anchor="middle">📱 Content Calendar</text>
    ${[0,1,2,3,4,5].map(i=>`<rect x="${80+(i%3)*145}" y="${130+Math.floor(i/3)*55}" width="130" height="40" rx="6" fill="#1f2937" stroke="${BORDER}"/>`).join("")}
    <text x="145" y="155" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">Mon post</text>
    <text x="290" y="155" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">Wed reel</text>
    <text x="435" y="155" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">Fri story</text>
    <rect x="150" y="250" width="300" height="30" rx="8" fill="#f97316" opacity="0.2" stroke="#f97316"/>
    <text x="300" y="270" fill="#f97316" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">Captions · Hashtags · Analytics</text>
  `)}`),

  "tools/startup-launch-pack.svg": base("#0ea5e9", `
  ${windowChrome(40, 50, 520, 270, "Startup Launch Pack", `
    <rect x="70" y="100" width="130" height="80" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="135" y="130" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle" font-weight="600">Pitch Deck</text>
    <text x="135" y="150" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="8" text-anchor="middle">Problem · Solution</text>
    <rect x="220" y="100" width="130" height="80" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="285" y="130" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle" font-weight="600">MVP Scope</text>
    <rect x="370" y="100" width="160" height="80" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="450" y="130" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle" font-weight="600">Go-to-Market</text>
    <rect x="70" y="195" width="460" height="55" rx="8" fill="${ELECTRIC}" opacity="0.1" stroke="${ELECTRIC}"/>
    <text x="300" y="220" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle">Launch checklist · Investor emails · Landing copy</text>
    <text x="300" y="238" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">7 startup tools in one pack</text>
  `)}`),

  "tools/developer-quick-wins-pack.svg": base("#22c55e", `
  ${windowChrome(40, 50, 520, 270, "Developer Quick Wins", `
    <rect x="70" y="100" width="460" height="120" rx="8" fill="#0d1117" stroke="${BORDER}"/>
    <text x="90" y="125" fill="#6b7280" font-family="monospace" font-size="9">// SQL · API docs · Code review</text>
    <text x="90" y="145" fill="#22c55e" font-family="monospace" font-size="9">SELECT</text>
    <text x="140" y="145" fill="${TEXT}" font-family="monospace" font-size="9">* FROM users WHERE active = true;</text>
    <text x="90" y="165" fill="${ELECTRIC}" font-family="monospace" font-size="9">/** @api POST /v1/orders */</text>
    <rect x="90" y="180" width="100" height="22" rx="4" fill="#22c55e" opacity="0.15" stroke="#22c55e"/>
    <text x="140" y="195" fill="#22c55e" font-family="monospace" font-size="8" text-anchor="middle">✓ Tests pass</text>
    <rect x="70" y="235" width="460" height="35" rx="8" fill="#22c55e" opacity="0.12" stroke="#22c55e"/>
    <text x="300" y="258" fill="#22c55e" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">6 Dev Tools · Ship faster</text>
  `)}`),

  "tools/personal-finance-toolkit.svg": base("#eab308", `
  ${windowChrome(40, 50, 520, 270, "Finance Toolkit", `
    <text x="70" y="110" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="10">Monthly Budget</text>
    <text x="70" y="135" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="22" font-weight="700">$4,200</text>
    <rect x="70" y="155" width="200" height="8" rx="4" fill="#1f2937"/>
    <rect x="70" y="155" width="140" height="8" rx="4" fill="#22c55e"/>
    <text x="70" y="180" fill="#22c55e" font-family="system-ui,sans-serif" font-size="10">Savings: 18%</text>
    <rect x="300" y="100" width="230" height="90" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="320" y="125" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9">Categories</text>
    <text x="320" y="145" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="9">Housing · Food · Transport</text>
    <text x="320" y="165" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="9">Investments · Emergency fund</text>
    <rect x="70" y="210" width="460" height="40" rx="8" fill="#eab308" opacity="0.12" stroke="#eab308"/>
    <text x="300" y="235" fill="#eab308" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">Budget · Forecast · Tax prep</text>
  `)}`),

  "tools/teachers-classroom-ai-pack.svg": base("#ec4899", `
  ${windowChrome(40, 50, 520, 270, "Classroom AI Pack", `
    <rect x="70" y="100" width="200" height="90" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="85" y="125" fill="#ec4899" font-family="system-ui,sans-serif" font-size="10" font-weight="600">Lesson Plan</text>
    <text x="85" y="145" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9">Objectives · Activities · Assessment</text>
    <rect x="290" y="100" width="240" height="90" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="305" y="125" fill="#ec4899" font-family="system-ui,sans-serif" font-size="10" font-weight="600">Quiz Generator</text>
    <text x="305" y="145" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9">10 questions · Answer key · Rubric</text>
    <rect x="70" y="205" width="460" height="45" rx="8" fill="#ec4899" opacity="0.12" stroke="#ec4899"/>
    <text x="300" y="233" fill="#ec4899" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">8 teaching tools for K-12 & higher ed</text>
  `)}`),

  "tools/linkedin-authority-builder.svg": base("#0ea5e9", `
  ${windowChrome(40, 50, 520, 270, "LinkedIn Authority", `
    <circle cx="120" cy="130" r="28" fill="#1f2937" stroke="${BORDER}"/>
    <text x="120" y="136" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="18" text-anchor="middle">in</text>
    <text x="165" y="120" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="12" font-weight="600">Headline options</text>
    <text x="165" y="140" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9">3 variants · Keyword optimized</text>
    <rect x="70" y="175" width="460" height="60" rx="8" fill="#1f2937" stroke="${BORDER}"/>
    <text x="85" y="200" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="10">About section · Content pillars · Post templates</text>
    <text x="85" y="218" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9">Build authority in your niche</text>
  `)}`),

  "tools/email-marketing-mastery-pack.svg": base("#f97316", `
  ${windowChrome(40, 50, 520, 270, "Email Marketing Pack", `
    <rect x="70" y="100" width="460" height="130" rx="10" fill="#111118" stroke="${BORDER}"/>
    <text x="90" y="125" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9">Welcome sequence · Day 1</text>
    <text x="90" y="148" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Subject: You're in — here's what's next</text>
    <rect x="90" y="160" width="380" height="5" rx="2" fill="#374151"/>
    <rect x="90" y="172" width="320" height="5" rx="2" fill="#374151"/>
    <rect x="90" y="184" width="350" height="5" rx="2" fill="#374151"/>
    <text x="90" y="215" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="9">+ Nurture · Launch · Re-engagement sequences</text>
    <rect x="150" y="250" width="300" height="30" rx="8" fill="#f97316" opacity="0.2" stroke="#f97316"/>
    <text x="300" y="270" fill="#f97316" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">10 email marketing tools</text>
  `)}`),

  "tools/social-media-scrubbing-pack.svg": base("#0ea5e9", `
  ${windowChrome(40, 50, 520, 270, "Social Scrubbing Pack", `
    <rect x="70" y="100" width="140" height="90" rx="8" fill="#1f2937" stroke="#ef4444"/>
    <text x="140" y="140" fill="#ef4444" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">Before: Risky</text>
    <text x="300" y="145" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="18" text-anchor="middle">→</text>
    <rect x="350" y="100" width="180" height="90" rx="8" fill="#1f2937" stroke="#22c55e"/>
    <text x="440" y="140" fill="#22c55e" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">After: Clean</text>
    <rect x="70" y="210" width="460" height="45" rx="8" fill="${ELECTRIC}" opacity="0.1" stroke="${ELECTRIC}"/>
    <text x="300" y="238" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">Multi-platform audit prompts</text>
  `)}`),

  "tools/complete-ai-starter-mega-pack.svg": base(ELECTRIC, `
  <text x="300" y="80" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="17" font-weight="700" text-anchor="middle">Complete AI Starter Mega Pack</text>
  <text x="300" y="100" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle">12 tools · Every category</text>
  ${["⚡ Productivity","💼 Business","📣 Marketing","✍️ Writing","💰 Finance","💻 Coding"].map((t,i)=>`<rect x="${70+(i%3)*155}" y="${115+Math.floor(i/3)*60}" width="140" height="45" rx="8" fill="${CARD}" stroke="${BORDER}"/><text x="${140+(i%3)*155}" y="${142+Math.floor(i/3)*60}" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="9" text-anchor="middle">${t}</text>`).join("")}
  <rect x="175" y="250" width="250" height="32" rx="16" fill="${ELECTRIC}" opacity="0.25" stroke="${ELECTRIC}"/>
  <text x="300" y="271" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="12" text-anchor="middle" font-weight="600">Best value starter pack</text>`),

  "tools/client-proposal-generator.svg": base("#0ea5e9", `
  ${windowChrome(40, 50, 520, 270, "Proposal Generator", `
    <rect x="160" y="70" width="280" height="240" rx="6" fill="white" opacity="0.95"/>
    <rect x="160" y="70" width="280" height="36" rx="6" fill="${ELECTRIC}" opacity="0.9"/>
    <text x="300" y="94" fill="white" font-family="system-ui,sans-serif" font-size="13" font-weight="600" text-anchor="middle">Client Proposal</text>
    <text x="180" y="130" fill="#374151" font-family="system-ui,sans-serif" font-size="10" font-weight="600">Executive Summary</text>
    <rect x="180" y="140" width="240" height="5" rx="2" fill="#e5e7eb"/>
    <rect x="180" y="152" width="200" height="5" rx="2" fill="#e5e7eb"/>
    <text x="180" y="180" fill="#374151" font-family="system-ui,sans-serif" font-size="10" font-weight="600">Scope & Timeline</text>
    <rect x="180" y="190" width="110" height="50" rx="4" fill="#f3f4f6"/>
    <text x="235" y="218" fill="#22c55e" font-family="system-ui,sans-serif" font-size="12" font-weight="700" text-anchor="middle">$8,500</text>
    <rect x="300" y="190" width="120" height="50" rx="4" fill="#f3f4f6"/>
    <text x="360" y="218" fill="${ELECTRIC}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle">6 weeks</text>
  `)}`),
};

const CATEGORY_THUMBNAILS = {
  productivity: { accent: "#6366f1", icon: "⚡", label: "Productivity", sub: "Workflows & focus" },
  business: { accent: "#0ea5e9", icon: "💼", label: "Business", sub: "Strategy & ops" },
  marketing: { accent: "#f97316", icon: "📣", label: "Marketing", sub: "Growth & campaigns" },
  sales: { accent: "#f43f5e", icon: "🎯", label: "Sales", sub: "Outreach & closing" },
  solar: { accent: "#f59e0b", icon: "☀️", label: "Solar", sub: "ROI & proposals" },
  coding: { accent: "#22c55e", icon: "💻", label: "Coding", sub: "Dev tools" },
  finance: { accent: "#eab308", icon: "💰", label: "Finance", sub: "Money & planning" },
  writing: { accent: "#a855f7", icon: "✍️", label: "Writing", sub: "Copy & content" },
  education: { accent: "#ec4899", icon: "🎓", label: "Education", sub: "Teaching tools" },
  "social-media": { accent: "#06b6d4", icon: "📱", label: "Social Media", sub: "Content & growth" },
  "real-estate": { accent: "#14b8a6", icon: "🏠", label: "Real Estate", sub: "Listings & deals" },
};

for (const [slug, meta] of Object.entries(CATEGORY_THUMBNAILS)) {
  THUMBNAILS[`tools/categories/${slug}.svg`] = base(meta.accent, `
  ${windowChrome(60, 55, 480, 250, meta.label, `
    <text x="300" y="130" font-size="36" text-anchor="middle">${meta.icon}</text>
    <text x="300" y="175" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="20" font-weight="600" text-anchor="middle">${meta.label}</text>
    <text x="300" y="200" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="12" text-anchor="middle">${meta.sub}</text>
    <rect x="200" y="220" width="200" height="36" rx="8" fill="${meta.accent}" opacity="0.2" stroke="${meta.accent}"/>
    <text x="300" y="243" fill="${meta.accent}" font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" font-weight="600">AI Prompt Tool</text>
  `)}`);
}

const CATEGORY_HEADERS = {
  "categories/solar-header.svg": { accent: "#f59e0b", title: "Solar Professionals", sub: "ROI calculators, proposals & sales scripts" },
  "categories/sales-header.svg": { accent: "#f43f5e", title: "Sales Tools", sub: "Outreach, objections & closing" },
  "categories/business-header.svg": { accent: "#0ea5e9", title: "Business", sub: "Strategy, ops & growth" },
  "categories/marketing-header.svg": { accent: "#f97316", title: "Marketing", sub: "Campaigns, content & growth" },
  "categories/productivity-header.svg": { accent: "#6366f1", title: "Productivity", sub: "Planning, focus & habits" },
  "categories/coding-header.svg": { accent: "#22c55e", title: "Developer Tools", sub: "Code review, SQL & APIs" },
  "categories/finance-header.svg": { accent: "#eab308", title: "Finance", sub: "Budgets, forecasts & planning" },
  "categories/writing-header.svg": { accent: "#a855f7", title: "Writing", sub: "Resumes, blogs & copy" },
  "categories/education-header.svg": { accent: "#ec4899", title: "Education", sub: "Lesson plans & assessments" },
  "categories/social-media-header.svg": { accent: "#06b6d4", title: "Social Media", sub: "Scrubbing, captions & growth" },
  "categories/real-estate-header.svg": { accent: "#14b8a6", title: "Real Estate", sub: "Listings, CMAs & buyer tools" },
};

for (const [path, meta] of Object.entries(CATEGORY_HEADERS)) {
  THUMBNAILS[path] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="320" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${BG_START}"/>
      <stop offset="100%" stop-color="${BG_END}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="320" fill="url(#bg)"/>
  <circle cx="1000" cy="80" r="120" fill="${meta.accent}" opacity="0.15"/>
  <circle cx="150" cy="280" r="80" fill="${ELECTRIC}" opacity="0.1"/>
  ${windowChrome(80, 60, 500, 200, meta.title, `
    <text x="330" y="130" fill="${TEXT}" font-family="system-ui,sans-serif" font-size="22" font-weight="700" text-anchor="middle">${meta.title}</text>
    <text x="330" y="160" fill="${MUTED}" font-family="system-ui,sans-serif" font-size="13" text-anchor="middle">${meta.sub}</text>
    <rect x="230" y="180" width="200" height="32" rx="8" fill="${meta.accent}" opacity="0.25" stroke="${meta.accent}"/>
    <text x="330" y="201" fill="${meta.accent}" font-family="system-ui,sans-serif" font-size="12" text-anchor="middle" font-weight="600">Explore tools →</text>
  `)}
  <rect x="650" y="80" width="480" height="180" rx="12" fill="${CARD}" stroke="${BORDER}" opacity="0.8"/>
  <rect x="670" y="110" width="200" height="120" rx="8" fill="${meta.accent}" opacity="0.15"/>
  <rect x="890" y="110" width="220" height="50" rx="6" fill="#1f2937"/>
  <rect x="890" y="170" width="180" height="50" rx="6" fill="#1f2937"/>
</svg>`;
}

async function main() {
  for (const [relPath, svg] of Object.entries(THUMBNAILS)) {
    const fullPath = join(PUBLIC, relPath);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, svg.trim() + "\n");
    console.log("wrote", relPath);
  }
  console.log(`Generated ${Object.keys(THUMBNAILS).length} thumbnails`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
