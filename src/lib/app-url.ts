/** Canonical production domain for OAuth callbacks and Stripe redirects. */
export const PRODUCTION_APP_URL = "https://getsoleprompt.com";

export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl && /^[a-z0-9.-]+$/i.test(vercelUrl)) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "")}`;
  }

  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_APP_URL;
  }

  return "http://localhost:3000";
}

/** Reads an env var only when it looks like an absolute https URL. */
export function readEnvCallbackUrl(key: string): string | undefined {
  const raw = process.env[key]?.trim();
  if (!raw || !/^https?:\/\//i.test(raw)) {
    return undefined;
  }

  return raw.replace(/\/$/, "");
}
