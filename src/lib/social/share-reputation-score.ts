import { getAppUrl } from "@/lib/app-url";

const X_CHECKER_PATH = "/tools/x-checker";

export function buildReputationShareUrl(): string {
  const base = `${getAppUrl()}${X_CHECKER_PATH}`;
  const params = new URLSearchParams({
    utm_source: "x",
    utm_medium: "social",
    utm_campaign: "reputation_share",
  });
  return `${base}?${params.toString()}`;
}

export function buildReputationShareText(score: number): string {
  return `My X reputation score is ${score}/100 🛡️ — scanned with SolePrompt`;
}

export function buildReputationShareFullText(score: number): string {
  return `${buildReputationShareText(score)} ${buildReputationShareUrl()}`;
}

export function buildTwitterIntentUrl(score: number): string {
  const text = buildReputationShareFullText(score);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
