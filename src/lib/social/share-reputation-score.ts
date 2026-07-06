import { buildChannelUrl, X_CHECKER_PATH } from "@/lib/utm";

export function buildReputationShareUrl(): string {
  return buildChannelUrl(X_CHECKER_PATH, "x_replies");
}

export function buildFreeCheckerShareUrl(): string {
  return buildChannelUrl(X_CHECKER_PATH, "free_checker");
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
